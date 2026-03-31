const express = require('express');
const authRouter = require('./auth');
const stripeRouter = require('./stripe');
const uploadRouter = require('./upload');

const router = express.Router();

router.use('/auth', authRouter);
router.use('/stripe', stripeRouter);
router.use('/upload', uploadRouter);

module.exports = router;
