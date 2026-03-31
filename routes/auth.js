const express = require('express');
const path = require('path');
const { User } = require('../models');
const { bucket } = require('../config');
const { hashPassword, verifyPassword, AppError } = require('../utils');
const { requireAuth, validate, rateLimit, upload } = require('../middleware');
const { registerSchema, loginSchema } = require('../shared/schemas/auth');

const router = express.Router();

// POST /api/auth/register
router.post(
  '/register',
  rateLimit({ windowMs: 15 * 60 * 1000, max: 5 }),
  validate(registerSchema),
  async (req, res, next) => {
    try {
      const { email, password } = req.body;

      const existing = await User.findOne({ email });
      if (existing) {
        throw new AppError('Email already in use', 409);
      }

      const hashedPassword = await hashPassword(password);
      const user = await User.create({ email, password: hashedPassword });

      req.session.userId = user._id;

      res.status(201).json({
        user: {
          id: user._id,
          email: user.email,
          plan: user.plan,
          profilePicture: user.profilePicture,
          createdAt: user.createdAt,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/auth/login
router.post(
  '/login',
  rateLimit({ windowMs: 15 * 60 * 1000, max: 10 }),
  validate(loginSchema),
  async (req, res, next) => {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email }).select('+password');
      if (!user || !(await verifyPassword(password, user.password))) {
        throw new AppError('Invalid email or password', 401);
      }

      // Regenerate session to prevent session fixation
      req.session.regenerate((err) => {
        if (err) return next(err);

        req.session.userId = user._id;

        res.json({
          user: {
            id: user._id,
            email: user.email,
            plan: user.plan,
            profilePicture: user.profilePicture,
            createdAt: user.createdAt,
          },
        });
      });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/auth/logout
router.post('/logout', (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(err);
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out' });
  });
});

// GET /api/auth/me
router.get('/me', requireAuth, (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      email: req.user.email,
      plan: req.user.plan,
      profilePicture: req.user.profilePicture,
      createdAt: req.user.createdAt,
    },
  });
});

// PUT /api/auth/profile-picture
router.put(
  '/profile-picture',
  requireAuth,
  upload({
    maxSize: 2 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  }),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file provided' });
      }

      const ext = path.extname(req.file.originalname).toLowerCase();
      const filename = `avatars/${req.user._id}-${Date.now()}${ext}`;
      const blob = bucket.file(filename);

      await blob.save(req.file.buffer, {
        contentType: req.file.mimetype,
      });

      await blob.makePublic();

      const url = `https://storage.googleapis.com/${bucket.name}/${filename}`;

      // TODO: delete old avatar from GCS if it exists
      req.user.profilePicture = url;
      await req.user.save();

      res.json({
        user: {
          id: req.user._id,
          email: req.user.email,
          plan: req.user.plan,
          profilePicture: req.user.profilePicture,
          createdAt: req.user.createdAt,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
