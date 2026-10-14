import express from 'express';
import Bookmark from '../models/Bookmark.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/user/bookmarks - Fetch user's bookmarked events
router.get('/bookmarks', protect, async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({ userId: req.user._id })
      .populate('eventId')
      .sort({ createdAt: -1 });

    const events = bookmarks.map((b) => b.eventId).filter(Boolean);
    res.status(200).json({ success: true, data: events });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/user/bookmarks/toggle - Bookmark / Unbookmark an event
router.post('/bookmarks/toggle', protect, async (req, res) => {
  try {
    const { eventId } = req.body;

    if (!eventId) {
      return res.status(400).json({ success: false, error: 'Event ID required.' });
    }

    const existing = await Bookmark.findOne({ userId: req.user._id, eventId });

    if (existing) {
      await Bookmark.findByIdAndDelete(existing._id);
      return res.status(200).json({ success: true, isBookmarked: false, message: 'Event removed from saved list.' });
    } else {
      await Bookmark.create({ userId: req.user._id, eventId });
      return res.status(200).json({ success: true, isBookmarked: true, message: 'Event saved to your list!' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
