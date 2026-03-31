const express = require('express');
const crypto = require('crypto');
const path = require('path');
const { storage } = require('../config');
const { requireAuth, upload } = require('../middleware');

const router = express.Router();

// POST /api/upload
router.post(
  '/',
  requireAuth,
  upload({
    maxSize: 5 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
  }),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file provided' });
      }

      const ext = path.extname(req.file.originalname).toLowerCase();
      const filename = `uploads/${crypto.randomUUID()}${ext}`;

      const result = await storage.upload(filename, req.file.buffer, req.file.mimetype, {
        uploadedBy: req.user._id.toString(),
      });

      res.status(201).json({ url: result.url, filename: result.filename });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
