import express from 'express';
import Event from '../models/Event.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/events - List events with search, category, price, status, pagination & sorting
router.get('/', async (req, res) => {
  try {
    const { search, status, category, priceFilter, sortBy, page = 1, limit = 12 } = req.query;

    const query = {};

    // Search query
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    // Category filter
    if (category && category !== 'All') {
      query.category = category;
    }

    // Availability status filter
    if (status === 'available') {
      query.availableSeats = { $gt: 0 };
    } else if (status === 'soldout') {
      query.availableSeats = { $eq: 0 };
    }

    // Price filter (free or paid)
    if (priceFilter === 'free') {
      query.price = 0;
    } else if (priceFilter === 'paid') {
      query.price = { $gt: 0 };
    }

    // Sort order
    let sortOptions = { createdAt: -1 };
    if (sortBy === 'seats') {
      sortOptions = { availableSeats: -1 };
    } else if (sortBy === 'priceAsc') {
      sortOptions = { price: 1 };
    } else if (sortBy === 'priceDesc') {
      sortOptions = { price: -1 };
    } else if (sortBy === 'title') {
      sortOptions = { title: 1 };
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [events, totalEvents] = await Promise.all([
      Event.find(query).sort(sortOptions).skip(skip).limit(limitNum),
      Event.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: events,
      pagination: {
        totalEvents,
        currentPage: pageNum,
        totalPages: Math.ceil(totalEvents / limitNum),
        hasMore: skip + events.length < totalEvents,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/events/featured - Get featured events
router.get('/featured', async (req, res) => {
  try {
    const featured = await Event.find({ featured: true }).limit(5);
    res.status(200).json({ success: true, data: featured });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/events/categories - List available categories & counts
router.get('/categories', async (req, res) => {
  try {
    const categories = await Event.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/events/:id - Single event details
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, error: 'Event not found.' });
    }
    res.status(200).json({ success: true, data: event });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/events - Create new event (Protected)
router.post('/', protect, async (req, res) => {
  try {
    const { title, date, time, location, description, category, price, image, totalSeats, organizer, tags, featured } = req.body;

    if (!title || !date || !location || !description || !totalSeats) {
      return res.status(400).json({ success: false, error: 'Missing required fields.' });
    }

    const seats = Number(totalSeats);
    const event = await Event.create({
      title,
      date,
      time: time || '09:00 AM PST',
      location,
      description,
      category: category || 'Technology',
      price: price ? Number(price) : 0,
      image: image || undefined,
      totalSeats: seats,
      availableSeats: seats,
      organizer: organizer || req.user.name || 'EventPulse Host',
      tags: tags || [],
      featured: Boolean(featured),
    });

    res.status(201).json({ success: true, data: event, message: 'Event created successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/events/:id - Update event (Protected)
router.put('/:id', protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, error: 'Event not found.' });
    }

    Object.assign(event, req.body);
    await event.save();

    res.status(200).json({ success: true, data: event, message: 'Event updated successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/events/:id - Delete event (Protected)
router.delete('/:id', protect, async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, error: 'Event not found.' });
    }
    res.status(200).json({ success: true, message: 'Event deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;