const express = require('express');
const authRouter = require('./auth');
const stripeRouter = require('./stripe');

const router = express.Router();

router.use('/auth', authRouter);
router.use('/stripe', stripeRouter);

module.exports = router;
