import express from 'express';
import Event from '../models/Event.js';
import Booking from '../models/Booking.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Helper to generate a unique ticket code
const generateTicketCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'EP-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// POST /api/bookings (or /api/register) - Protected booking route
router.post('/', protect, async (req, res) => {
  try {
    const { eventId, seatsRequested, name, email } = req.body;
    const seatsToBook = Number(seatsRequested);

    if (!eventId || isNaN(seatsToBook) || seatsToBook < 1) {
      return res.status(400).json({ success: false, error: 'Invalid booking data.' });
    }

    // Atomic seat decrement prevents race conditions
    const updatedEvent = await Event.findOneAndUpdate(
      { _id: eventId, availableSeats: { $gte: seatsToBook } },
      { $inc: { availableSeats: -seatsToBook } },
      { new: true }
    );

    if (!updatedEvent) {
      return res.status(400).json({ success: false, error: 'Seats unavailable or event missing.' });
    }

    try {
      const ticketCode = generateTicketCode();
      const totalAmount = (updatedEvent.price || 0) * seatsToBook;

      const booking = await Booking.create({
        eventId,
        userId: req.user._id,
        seatsBooked: seatsToBook,
        totalAmount,
        ticketCode,
        attendeeName: name || req.user.name,
        attendeeEmail: email || req.user.email,
        status: 'confirmed',
      });

      const populatedBooking = await booking.populate('eventId');

      return res.status(201).json({
        success: true,
        data: populatedBooking,
        updatedSeats: updatedEvent.availableSeats,
        message: 'Ticket confirmed successfully!',
      });
    } catch (bookingErr) {
      // Revert seats if booking record creation fails
      await Event.findByIdAndUpdate(eventId, { $inc: { availableSeats: seatsToBook } });
      throw bookingErr;
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/bookings/my-tickets (or /api/register/my-tickets) - Fetch logged-in user's tickets
router.get('/my-tickets', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .populate('eventId')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/bookings/:id - Cancel a booking and restore seats
router.delete('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, userId: req.user._id });

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found.' });
    }

    // Restore the seats back to the event
    await Event.findByIdAndUpdate(booking.eventId, { $inc: { availableSeats: booking.seatsBooked } });
    await Booking.findByIdAndDelete(booking._id);

    res.status(200).json({ success: true, message: 'Booking cancelled successfully. Seats restored.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PATCH /api/bookings/:id - Edit seat count of an existing booking
router.patch('/:id', protect, async (req, res) => {
  try {
    const { seats } = req.body;
    const newSeats = Number(seats);

    if (isNaN(newSeats) || newSeats < 1) {
      return res.status(400).json({ success: false, error: 'Invalid seat count.' });
    }

    const booking = await Booking.findOne({ _id: req.params.id, userId: req.user._id }).populate('eventId');

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found.' });
    }

    const diff = newSeats - booking.seatsBooked; // positive = need more seats

    if (diff > 0 && booking.eventId.availableSeats < diff) {
      return res.status(400).json({
        success: false,
        error: `Only ${booking.eventId.availableSeats} extra seats available.`,
      });
    }

    // Adjust event seats atomically
    await Event.findByIdAndUpdate(booking.eventId._id, { $inc: { availableSeats: -diff } });
    booking.seatsBooked = newSeats;
    booking.totalAmount = (booking.eventId.price || 0) * newSeats;
    await booking.save();

    res.status(200).json({ success: true, data: booking, message: 'Booking updated successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;