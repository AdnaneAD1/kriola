'use server';

import Stripe from 'stripe';

const stripeSecret = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecret ? new Stripe(stripeSecret) : null;

export async function POST(request) {
  try {
    if (!stripe) {
      return new Response(JSON.stringify({ error: 'Stripe non configuré côté serveur' }), { status: 500 });
    }

    const body = await request.json().catch(() => ({}));
    const { amount, currency = 'EUR' } = body || {};

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return new Response(JSON.stringify({ error: 'Montant invalide' }), { status: 400 });
    }

    const pi = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // euros -> centimes
      currency: currency.toLowerCase(),
      automatic_payment_methods: { enabled: true },
    });

    return new Response(JSON.stringify({ clientSecret: pi.client_secret }), { status: 200 });
  } catch (err) {
    console.error('Stripe PI error:', err);
    return new Response(JSON.stringify({ error: err.message || 'Erreur serveur' }), { status: 500 });
  }
}
