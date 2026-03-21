// app/api/checkout/route.ts
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16' as any, // 强制指定旧一点的 API 版本来兼容
});
export async function POST(req: Request) {
  try {
    const { items, cartItems } = await req.json(); // cartItems contains the raw product IDs and sizes

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // --- Production Shield: Stock Pre-check ---
    if (cartItems && cartItems.length > 0) {
      const { adminSupabase } = await import('@/lib/supabase');
      for (const item of cartItems) {
        const { data: product } = await adminSupabase
          .from('products')
          .select('stock_levels, name')
          .eq('id', item.id)
          .single();

        if (product) {
          const sizeKey = item.selectedSize || 'OS';
          const stock = product.stock_levels?.[sizeKey] ?? 0;
          if (stock < item.quantity) {
            return NextResponse.json({
              error: `INSUFFICIENT RESERVES: ${product.name} (${sizeKey}) only has ${stock} units remaining.`
            }, { status: 400 });
          }
        }
      }
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'fpx', 'grabpay'],
      shipping_address_collection: { allowed_countries: ['MY'] },
      phone_number_collection: { enabled: true },
      line_items: items,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/`,
    });

    return NextResponse.json({ id: session.id, url: session.url });
  } catch (err: any) {
    console.error("❌ Stripe Error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}