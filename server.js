import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './config/db.js';
import eventRoutes from './routes/eventRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';

dotenv.config();

const app = express();

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Event Backend API is running",
  });
});

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/events', eventRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use(['/api/bookings', '/api/register'], bookingRoutes);

// Root Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'EventPulse API',
    database: 'connected',
    timestamp: new Date().toISOString(),
  });
});

app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found.' });
});

app.use((error, req, res, next) => {
  console.error('Unhandled server error:', error);
  res.status(500).json({ success: false, error: 'Internal server error.' });
});

const startServer = async () => {
  try {
    await connectDB();

    const port = Number(process.env.PORT) || 5001;
    app.listen(port, () => {
      console.log(`Backend running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Backend startup failed:', error.message);
    process.exitCode = 1;
  }
};

startServer();