import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, avatar } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'Email already registered.' });
    }

    const user = await User.create({ name, email, password, avatar: avatar || undefined });
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      data: { _id: user._id, name: user.name, email: user.email, avatar: user.avatar, bio: user.bio, token },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      const token = generateToken(user._id);
      res.status(200).json({
        success: true,
        data: { _id: user._id, name: user.name, email: user.email, avatar: user.avatar, bio: user.bio, token },
      });
    } else {
      res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/auth/me (Protected Profile Route)
router.get('/me', protect, async (req, res) => {
  res.status(200).json({ success: true, data: req.user });
});

router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    if (req.body.name) user.name = req.body.name;
    if (req.body.bio !== undefined) user.bio = req.body.bio;
    if (req.body.avatar) user.avatar = req.body.avatar;

    if (req.body.newPassword) {
      if (req.body.newPassword.length < 6) {
        return res.status(400).json({ success: false, error: 'Password must be at least 6 characters.' });
      }
      user.password = req.body.newPassword;
    }

    await user.save();
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      data: { _id: user._id, name: user.name, email: user.email, avatar: user.avatar, bio: user.bio, token },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;