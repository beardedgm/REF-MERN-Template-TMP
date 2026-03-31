const express = require('express');
const authRouter = require('./auth');
const stripeRouter = require('./stripe');
const uploadRouter = require('./upload');
const filesRouter = require('./files');

const router = express.Router();

router.use('/auth', authRouter);
router.use('/stripe', stripeRouter);
router.use('/upload', uploadRouter);
router.use('/files', filesRouter);

module.exports = router;
