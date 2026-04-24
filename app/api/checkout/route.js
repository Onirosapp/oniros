import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const { priceId } = await request.json();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Oniros — Tutte le lenti',
              description: 'Il tuo sogno letto con tutte e 5 le lenti interpretative',
            },
            unit_amount: 299,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_URL}/grazie`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/`,
    });

    return Response.json({ url: session.url });

  } catch (error) {
    console.error('Stripe error:', error);
    return Response.json({ error: 'Errore nel pagamento. Riprova.' }, { status: 500 });
  }
}