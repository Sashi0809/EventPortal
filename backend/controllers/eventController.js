const Event = require('../models/Event');
const Club = require('../models/Club');
const User = require('../models/User');
const Registration = require('../models/Registration');
const QRCode = require('qrcode');

// @desc    Create event
// @route   POST /api/events
const createEvent = async (req, res) => {
  try {
    const { title, description, date, endDate, time, location, coordinates, club, tags, category, posterImage, registrationLink, maxParticipants } = req.body;

    const event = await Event.create({
      title,
      description,
      date,
      endDate,
      time,
      location,
      coordinates: coordinates || { lat: 28.6139, lng: 77.2090 },
      club,
      tags: tags || [],
      category,
      posterImage: posterImage || '',
      registrationLink: registrationLink || '',
      maxParticipants: maxParticipants || 100,
      createdBy: req.user._id
    });

    // Generate QR code for the event
    const qrData = JSON.stringify({ eventId: event._id, title: event.title });
    const qrCode = await QRCode.toDataURL(qrData);
    event.qrCode = qrCode;
    await event.save();

    // Add event to club
    await Club.findByIdAndUpdate(club, {
      $push: { events: event._id },
      $inc: { eventsHosted: 1 }
    });

    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all events with filters
// @route   GET /api/events
const getEvents = async (req, res) => {
  try {
    const { search, category, club, tag, sort, upcoming } = req.query;
    let query = { isActive: true };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    if (category) query.category = category;
    if (club) query.club = club;
    if (tag) query.tags = { $in: [tag] };
    if (upcoming === 'true') query.date = { $gte: new Date() };

    let sortOption = { date: 1 };
    if (sort === 'popularity') sortOption = { attendees: -1 };
    if (sort === 'newest') sortOption = { createdAt: -1 };
    if (sort === 'nearest') sortOption = { date: 1 };

    const events = await Event.find(query)
      .populate('club', 'name logo category')
      .populate('createdBy', 'name')
      .sort(sortOption);

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single event
// @route   GET /api/events/:id
const getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('club', 'name logo category description contactEmail')
      .populate('createdBy', 'name email')
      .populate('registeredUsers', 'name email department');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    if (event.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this event' });
    }
    const updatedEvent = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('club', 'name logo');
    res.json(updatedEvent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    if (event.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this event' });
    }
    await Club.findByIdAndUpdate(event.club, {
      $pull: { events: event._id },
      $inc: { eventsHosted: -1 }
    });
    await Registration.deleteMany({ event: event._id });
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Register for event
// @route   POST /api/events/:id/register
const registerForEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    if (event.registeredUsers.length >= event.maxParticipants) {
      return res.status(400).json({ message: 'Event is full' });
    }
    if (event.registeredUsers.includes(req.user._id)) {
      return res.status(400).json({ message: 'Already registered' });
    }

    // Create registration with QR
    const qrData = JSON.stringify({ eventId: event._id, userId: req.user._id, name: req.user.name });
    const qrCode = await QRCode.toDataURL(qrData);

    await Registration.create({
      user: req.user._id,
      event: event._id,
      qrCode
    });

    event.registeredUsers.push(req.user._id);
    event.attendees = event.registeredUsers.length;
    await event.save();

    res.json({ message: 'Registered successfully', qrCode });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Already registered' });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Unregister from event
// @route   DELETE /api/events/:id/register
const unregisterFromEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    event.registeredUsers = event.registeredUsers.filter(
      id => id.toString() !== req.user._id.toString()
    );
    event.attendees = event.registeredUsers.length;
    await event.save();
    await Registration.findOneAndDelete({ user: req.user._id, event: event._id });
    res.json({ message: 'Unregistered successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark interested in event
// @route   POST /api/events/:id/interested
const markInterested = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    const index = event.interestedUsers.indexOf(req.user._id);
    if (index > -1) {
      event.interestedUsers.splice(index, 1);
      await User.findByIdAndUpdate(req.user._id, { $pull: { interestedEvents: event._id } });
      await event.save();
      return res.json({ message: 'Removed interest', interested: false });
    }
    event.interestedUsers.push(req.user._id);
    await User.findByIdAndUpdate(req.user._id, { $push: { interestedEvents: event._id } });
    await event.save();
    res.json({ message: 'Marked as interested', interested: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get trending events
// @route   GET /api/events/trending
const getTrendingEvents = async (req, res) => {
  try {
    const events = await Event.find({ isActive: true, date: { $gte: new Date() } })
      .populate('club', 'name logo')
      .sort({ attendees: -1 })
      .limit(6);
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get recommended events for user
// @route   GET /api/events/recommended
const getRecommendedEvents = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const interests = [...(user.interests || []), ...(user.skills || [])];

    let events;
    if (interests.length > 0) {
      events = await Event.find({
        isActive: true,
        date: { $gte: new Date() },
        $or: [
          { tags: { $in: interests.map(i => new RegExp(i, 'i')) } },
          { category: { $in: interests.map(i => i.toLowerCase()) } }
        ],
        registeredUsers: { $nin: [req.user._id] }
      })
      .populate('club', 'name logo')
      .sort({ date: 1 })
      .limit(10);
    }

    if (!events || events.length === 0) {
      events = await Event.find({
        isActive: true,
        date: { $gte: new Date() },
        registeredUsers: { $nin: [req.user._id] }
      })
      .populate('club', 'name logo')
      .sort({ attendees: -1 })
      .limit(10);
    }

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Check in via QR
// @route   POST /api/events/:id/checkin
const checkIn = async (req, res) => {
  try {
    const { userId } = req.body;
    const registration = await Registration.findOne({
      event: req.params.id,
      user: userId
    });
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }
    if (registration.checkedIn) {
      return res.status(400).json({ message: 'Already checked in' });
    }
    registration.checkedIn = true;
    registration.checkedInAt = new Date();
    registration.status = 'attended';
    await registration.save();

    await User.findByIdAndUpdate(userId, {
      $addToSet: { eventsAttended: req.params.id }
    });

    res.json({ message: 'Checked in successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createEvent, getEvents, getEvent, updateEvent, deleteEvent,
  registerForEvent, unregisterFromEvent, markInterested,
  getTrendingEvents, getRecommendedEvents, checkIn
};
