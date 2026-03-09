const Bookmark = require('../models/Bookmark');
const User = require('../models/User');

// @desc    Toggle bookmark
// @route   POST /api/bookmarks/:eventId
const toggleBookmark = async (req, res) => {
  try {
    const existing = await Bookmark.findOne({
      user: req.user._id,
      event: req.params.eventId
    });
    if (existing) {
      await Bookmark.findByIdAndDelete(existing._id);
      await User.findByIdAndUpdate(req.user._id, {
        $pull: { bookmarkedEvents: req.params.eventId }
      });
      return res.json({ message: 'Bookmark removed', bookmarked: false });
    }
    await Bookmark.create({
      user: req.user._id,
      event: req.params.eventId
    });
    await User.findByIdAndUpdate(req.user._id, {
      $push: { bookmarkedEvents: req.params.eventId }
    });
    res.json({ message: 'Event bookmarked', bookmarked: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user bookmarks
// @route   GET /api/bookmarks
const getBookmarks = async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({ user: req.user._id })
      .populate({
        path: 'event',
        populate: { path: 'club', select: 'name logo' }
      })
      .sort({ createdAt: -1 });
    res.json(bookmarks.map(b => b.event).filter(Boolean));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { toggleBookmark, getBookmarks };
