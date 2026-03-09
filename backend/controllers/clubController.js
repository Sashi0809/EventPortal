const Club = require('../models/Club');
const User = require('../models/User');

// @desc    Create club
// @route   POST /api/clubs
const createClub = async (req, res) => {
  try {
    const { name, description, logo, category, contactEmail, contactPhone, socialLinks } = req.body;
    const clubExists = await Club.findOne({ name });
    if (clubExists) {
      return res.status(400).json({ message: 'Club already exists' });
    }
    const club = await Club.create({
      name,
      description,
      logo: logo || '',
      category,
      admin: req.user._id,
      contactEmail: contactEmail || '',
      contactPhone: contactPhone || '',
      socialLinks: socialLinks || {},
      members: [req.user._id]
    });

    await User.findByIdAndUpdate(req.user._id, {
      role: 'clubAdmin',
      managedClub: club._id,
      $push: { clubsJoined: club._id }
    });

    res.status(201).json(club);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all clubs
// @route   GET /api/clubs
const getClubs = async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = { isActive: true };
    if (category) query.category = category;
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    const clubs = await Club.find(query)
      .populate('admin', 'name email')
      .sort({ eventsHosted: -1 });
    res.json(clubs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single club
// @route   GET /api/clubs/:id
const getClub = async (req, res) => {
  try {
    const club = await Club.findById(req.params.id)
      .populate('admin', 'name email')
      .populate('events')
      .populate('members', 'name email department');
    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }
    res.json(club);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update club
// @route   PUT /api/clubs/:id
const updateClub = async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }
    if (club.admin.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const updatedClub = await Club.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedClub);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Join club
// @route   POST /api/clubs/:id/join
const joinClub = async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }
    if (club.members.includes(req.user._id)) {
      return res.status(400).json({ message: 'Already a member' });
    }
    club.members.push(req.user._id);
    await club.save();
    await User.findByIdAndUpdate(req.user._id, {
      $push: { clubsJoined: club._id }
    });
    res.json({ message: 'Joined club successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Leave club
// @route   DELETE /api/clubs/:id/join
const leaveClub = async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }
    club.members = club.members.filter(id => id.toString() !== req.user._id.toString());
    await club.save();
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { clubsJoined: club._id }
    });
    res.json({ message: 'Left club successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get club leaderboard (most active)
// @route   GET /api/clubs/leaderboard
const getLeaderboard = async (req, res) => {
  try {
    const clubs = await Club.find({ isActive: true })
      .select('name logo category eventsHosted members')
      .sort({ eventsHosted: -1 })
      .limit(10);
    const leaderboard = clubs.map((club, index) => ({
      rank: index + 1,
      _id: club._id,
      name: club.name,
      logo: club.logo,
      category: club.category,
      eventsHosted: club.eventsHosted,
      memberCount: club.members.length
    }));
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createClub, getClubs, getClub, updateClub, joinClub, leaveClub, getLeaderboard };
