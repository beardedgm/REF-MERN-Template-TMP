const express = require('express');
const crypto = require('crypto');
const path = require('path');
const { bucket } = require('../config');
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
      const blob = bucket.file(filename);

      await blob.save(req.file.buffer, {
        contentType: req.file.mimetype,
        metadata: { uploadedBy: req.user._id.toString() },
      });

      await blob.makePublic();

      const url = `https://storage.googleapis.com/${bucket.name}/${filename}`;

      res.status(201).json({ url, filename });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
