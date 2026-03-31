const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

// GET /api/files/:filename
// Streams a file from MongoDB GridFS. Supports nested paths like avatars/userId-timestamp.jpg
router.get('/{*filename}', async (req, res, next) => {
  try {
    const filename = decodeURIComponent(req.params.filename);
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'uploads',
    });

    const files = await bucket.find({ filename }).toArray();
    if (!files.length) {
      return res.status(404).json({ error: 'File not found' });
    }

    const file = files[0];
    res.set('Content-Type', file.contentType || 'application/octet-stream');
    res.set('Cache-Control', 'public, max-age=31536000, immutable');

    const downloadStream = bucket.openDownloadStream(file._id);
    downloadStream.pipe(res);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
