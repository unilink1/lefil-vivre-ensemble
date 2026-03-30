import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const PRICE_IDS: Record<string, string> = {
  essentiel: 'price_1TGWjyGfbMwBwKZ6wCBdHuyR',
  serenite: 'price_1TGWjzGfbMwBwKZ6CKAh6CC7',
  accompagnement: 'price_1TGWjzGfbMwBwKZ6usRP2ioO',
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
      metadata: { userId, plan },
      success_url: `${origin}/dashboard/parametres/abonnement?success=true&plan=${plan}`,
      cancel_url: `${origin}/dashboard/parametres/abonnement?cancelled=true`,
      subscription_data: {
        trial_period_days: 30,
        metadata: { userId, plan },
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Erreur inconnue'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
