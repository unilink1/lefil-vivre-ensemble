import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder')

// Split: 90% entreprise Le Fil (main account), 10% plateforme (connected account)
// With Stripe Connect: payment goes to main account, we transfer 10% to connected
const PLATFORM_CONNECTED_ACCOUNT = 'acct_1TGWuvKAsIVv6pmr'

const PRICE_IDS: Record<string, string> = {
  essentiel: 'price_1TGaBRGfbMwBwKZ6OhSSDIpb',
  serenite: 'price_1TGaBRGfbMwBwKZ6Iutro70W',
  accompagnement: 'price_1TGaBSGfbMwBwKZ6j41OnELk',
}

const AMOUNTS: Record<string, number> = {
  essentiel: 7700, // 77 EUR in cents
  serenite: 9900,  // 99 EUR
  accompagnement: 16500, // 165 EUR
}

export async function POST(request: NextRequest) {
  try {
    const { plan, email, userId } = await request.json()

    const priceId = PRICE_IDS[plan]
    if (!priceId) {
      return NextResponse.json({ error: 'Plan invalide' }, { status: 400 })
    }

    const origin = request.headers.get('origin') || 'https://lefil-vivre-ensemblev2.vercel.app'

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: email,
      metadata: { userId, plan, split: '90/10' },
      success_url: `${origin}/dashboard/parametres/abonnement?success=true&plan=${plan}`,
      cancel_url: `${origin}/dashboard/parametres/abonnement?cancelled=true`,
      subscription_data: {
        trial_period_days: 30,
        metadata: { userId, plan },
      },
    })

    // Note: The 10% transfer to the platform account will be handled
    // via a Stripe webhook on invoice.paid events, to keep it clean
    // and avoid issues with the checkout session flow.
    // For now, the full amount goes to the main Le Fil account.
    // The admin CRM will show both splits for accounting.

    return NextResponse.json({
      url: session.url,
      split: {
        entreprise: Math.round(AMOUNTS[plan] * 0.9),
        plateforme: Math.round(AMOUNTS[plan] * 0.1),
      },
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Erreur inconnue'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
