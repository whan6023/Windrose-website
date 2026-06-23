// netlify/functions/create-payment-intent.js
// Requires env var: STRIPE_SECRET_KEY=sk_live_...
// Set this in: Netlify Dashboard → Site → Environment Variables

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};

exports.handler = async (event) => {
  // Preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const body = JSON.parse(event.body || '{}');

    // amount is in the smallest currency unit (cents / euro-cents)
    // 100000 = €1,000.00  |  change here or pass from the frontend
    const amount   = body.amount   || 100000;
    const currency = body.currency || 'eur';

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      automatic_payment_methods: { enabled: true },
      metadata: {
        product: 'Windrose Electric Truck Reservation',
        source:  'windrose.ai',
      },
    });

    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({ clientSecret: paymentIntent.client_secret }),
    };

  } catch (err) {
    console.error('[create-payment-intent]', err.message);
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
