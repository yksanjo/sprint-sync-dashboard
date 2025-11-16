import { Router, Response } from 'express';
import Stripe from 'stripe';
import prisma from '../db/index.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

// Get pricing plans
router.get('/plans', (_req, res: Response) => {
  res.json({
    plans: [
      {
        id: 'FREE',
        name: 'Free',
        price: 0,
        features: [
          '1 configuration',
          'Daily sync',
          'Basic metrics',
          'Slack integration',
        ],
      },
      {
        id: 'PRO',
        name: 'Pro',
        price: 9,
        features: [
          '5 configurations',
          'Daily sync',
          'Advanced metrics',
          'Priority support',
          'Custom alerts',
        ],
      },
      {
        id: 'TEAM',
        name: 'Team',
        price: 29,
        features: [
          'Unlimited configurations',
          'Daily sync',
          'Advanced metrics',
          'Priority support',
          'Custom alerts',
          'Team management',
        ],
      },
    ],
  });
});

// Create checkout session
router.post('/checkout', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { planId } = req.body;

    if (!planId || !['PRO', 'TEAM'].includes(planId)) {
      res.status(400).json({ error: 'Invalid plan' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const prices: Record<string, string> = {
      PRO: process.env.STRIPE_PRICE_ID_PRO || '',
      TEAM: process.env.STRIPE_PRICE_ID_TEAM || '',
    };

    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      payment_method_types: ['card'],
      line_items: [
        {
          price: prices[planId],
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard?success=true`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/pricing?canceled=true`,
      metadata: {
        userId: user.id,
        planId,
      },
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Webhook handler (for Stripe events)
router.post('/webhook', async (req, res: Response) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

  if (!sig || !webhookSecret) {
    res.status(400).send('Missing signature or webhook secret');
    return;
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const planId = session.metadata?.planId;

        if (userId && planId) {
          await prisma.user.update({
            where: { id: userId },
            data: {
              plan: planId as any,
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: session.subscription as string,
            },
          });
        }
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const user = await prisma.user.findUnique({
          where: { stripeCustomerId: customerId },
        });

        if (user) {
          if (event.type === 'customer.subscription.deleted') {
            await prisma.user.update({
              where: { id: user.id },
              data: {
                plan: 'FREE',
                stripeSubscriptionId: null,
              },
            });
          }
        }
        break;
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

export default router;

