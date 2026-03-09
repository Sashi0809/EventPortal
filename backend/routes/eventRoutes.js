const express = require('express');
const router = express.Router();
const {
  createEvent, getEvents, getEvent, updateEvent, deleteEvent,
  registerForEvent, unregisterFromEvent, markInterested,
  getTrendingEvents, getRecommendedEvents, checkIn
} = require('../controllers/eventController');
const { protect, clubAdmin } = require('../middleware/auth');

// Public routes
router.get('/trending', getTrendingEvents);
router.get('/', getEvents);
router.get('/:id', getEvent);

// Protected routes
router.post('/', protect, clubAdmin, createEvent);
router.put('/:id', protect, clubAdmin, updateEvent);
router.delete('/:id', protect, clubAdmin, deleteEvent);

router.post('/:id/register', protect, registerForEvent);
router.delete('/:id/register', protect, unregisterFromEvent);
router.post('/:id/interested', protect, markInterested);
router.post('/:id/checkin', protect, clubAdmin, checkIn);

router.get('/user/recommended', protect, getRecommendedEvents);

module.exports = router;
