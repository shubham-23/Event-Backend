import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    seatsBooked: { type: Number, required: true, min: 1 },
    totalAmount: { type: Number, default: 0 },
    ticketCode: { type: String, required: true, unique: true },
    status: { type: String, enum: ['confirmed', 'cancelled'], default: 'confirmed' },
    attendeeName: { type: String },
    attendeeEmail: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model('Booking', bookingSchema);