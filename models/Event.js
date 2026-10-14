import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    date: { type: String, required: true },
    time: { type: String, default: '09:00 AM PST' },
    location: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true, default: 'Technology' },
    price: { type: Number, required: true, default: 0 },
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80',
    },
    totalSeats: { type: Number, required: true, min: 1 },
    availableSeats: { type: Number, required: true, min: 0 },
    organizer: { type: String, default: 'EventPulse Global' },
    featured: { type: Boolean, default: false },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.model('Event', eventSchema);