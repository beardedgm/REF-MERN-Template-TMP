const { RateLimit } = require('../models');

function rateLimit({ windowMs = 15 * 60 * 1000, max = 100, keyGenerator } = {}) {
  const getKey = keyGenerator || ((req) => req.ip);

  return async (req, res, next) => {
    const key = getKey(req);

    try {
      const record = await RateLimit.findOneAndUpdate(
        { key },
        {
          $inc: { points: 1 },
          $setOnInsert: { expiresAt: new Date(Date.now() + windowMs) },
        },
        { upsert: true, new: true }
      );

      if (record.points > max) {
        const retryAfter = Math.ceil((record.expiresAt - Date.now()) / 1000);
        res.set('Retry-After', String(retryAfter));
        return res.status(429).json({ error: 'Too many requests, please try again later' });
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}

module.exports = { rateLimit };
