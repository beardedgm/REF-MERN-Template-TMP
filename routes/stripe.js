const express = require('express');
// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
// const { requireAuth } = require('../middleware');

const router = express.Router();

// POST /api/stripe/webhook
// Note: This route receives raw body (configured in server.js)
router.post('/webhook', async (req, res, next) => {
  try {
    // const sig = req.headers['stripe-signature'];
    // const event = stripe.webhooks.constructEvent(
    //   req.body,
    //   sig,
    //   process.env.STRIPE_WEBHOOK_SECRET
    // );

    // switch (event.type) {
    //   case 'checkout.session.completed':
    //     break;
    //   case 'customer.subscription.updated':
    //     break;
    //   case 'customer.subscription.deleted':
    //     break;
    // }

    res.json({ received: true });
  } catch (err) {
    next(err);
  }
});

// POST /api/stripe/create-checkout-session
// router.post('/create-checkout-session', requireAuth, async (req, res, next) => {
//   try {
//     const session = await stripe.checkout.sessions.create({
//       customer: req.user.stripeCustomerId,
//       mode: 'subscription',
//       line_items: [{ price: req.body.priceId, quantity: 1 }],
//       success_url: `${process.env.CLIENT_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
//       cancel_url: `${process.env.CLIENT_URL}/pricing`,
//     });
//     res.json({ url: session.url });
//   } catch (err) {
//     next(err);
//   }
// });

// POST /api/stripe/create-portal-session
// router.post('/create-portal-session', requireAuth, async (req, res, next) => {
//   try {
//     const session = await stripe.billingPortal.sessions.create({
//       customer: req.user.stripeCustomerId,
//       return_url: `${process.env.CLIENT_URL}/dashboard`,
//     });
//     res.json({ url: session.url });
//   } catch (err) {
//     next(err);
//   }
// });

module.exports = router;
