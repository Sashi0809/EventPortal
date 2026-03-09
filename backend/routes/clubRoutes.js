const express = require('express');
const router = express.Router();
const { createClub, getClubs, getClub, updateClub, joinClub, leaveClub, getLeaderboard } = require('../controllers/clubController');
const { protect, clubAdmin } = require('../middleware/auth');

router.get('/leaderboard', getLeaderboard);
router.get('/', getClubs);
router.get('/:id', getClub);

router.post('/', protect, createClub);
router.put('/:id', protect, clubAdmin, updateClub);
router.post('/:id/join', protect, joinClub);
router.delete('/:id/join', protect, leaveClub);

module.exports = router;
