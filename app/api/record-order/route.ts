import { NextResponse } from 'next/server';
import { adminSupabase } from '@/lib/supabase-admin-admin-admin-admin-admin-admin-admin-admin';
import Stripe from 'stripe';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2023-10-16' as any,
});

export async function POST(req: Request) {
    try {
        const { sessionId, items, total, couponCode } = await req.json();

        if (!sessionId) {
            return NextResponse.json({ error: "No session ID" }, { status: 400 });
        }

        // 1. Fetch full session details from Stripe to get shipping address etc.
        const session = await stripe.checkout.sessions.retrieve(sessionId, {
            expand: ['line_items', 'customer_details'],
        }) as any;

        // 2. Generate a human-readable Track ID (e.g. ZERO-XXXXXX)
        const trackId = `ZERO-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

        // 3. Prepare order data
        const orderData = {
            track_id: trackId,
            customer_email: session.customer_details?.email,
            customer_name: session.customer_details?.name,
            amount_total: session.amount_total ? session.amount_total / 100 : parseFloat(total),
            currency: session.currency?.toUpperCase() || 'RM',
            status: 'paid',
            items: items, // This will be the list or JSON of items
            shipping_address: session.shipping_details?.address || {},
            stripe_session_id: sessionId,
            created_at: new Date().toISOString()
        };

        // 3. Insert into Supabase using Admin Client (Bypasses RLS)
        const { data, error } = await adminSupabase
            .from('orders')
            .insert([orderData])
            .select()
            .single();

        if (error) {
            console.error("Supabase Error recording order:", error);
            // If it's a unique violation (already recorded), just return success
            if (error.code === '23505') {
                return NextResponse.json({ message: "Order already recorded", exists: true });
            }
            throw error;
        }

        // 4. Trigger Email Confirmation Protocol
        try {
            const itemsHtml = items.map((item: any) => `
                <div style="padding: 15px 0; border-bottom: 1px solid #eeeeee;">
                    <p style="margin: 0; font-family: 'Helvetica', sans-serif; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px;">
                        ${item.name} ${item.selectedSize ? `[SIZE: ${item.selectedSize}]` : ''}
                    </p>
                    <p style="margin: 5px 0 0; font-family: 'Helvetica', sans-serif; font-size: 10px; opacity: 0.6;">
                        QTY: ${item.quantity} | ${item.price}
                    </p>
                </div>
            `).join('');

            const emailRes = await resend.emails.send({
                from: 'Zero Store <onboarding@resend.dev>',
                to: [orderData.customer_email],
                subject: `Technical Report: Archive Request Confirmation #${trackId}`,
                html: `
                <div style="background-color: #ffffff; color: #000000; padding: 40px; font-family: 'Helvetica', sans-serif; line-height: 1.6;">
                    <div style="border-bottom: 5px solid #000000; padding-bottom: 20px; margin-bottom: 40px;">
                        <h2 style="margin: 0; font-size: 32px; font-style: italic; font-weight: 900; text-transform: uppercase; letter-spacing: -1px;">Zero Archive</h2>
                        <p style="margin: 5px 0 0; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 4px; opacity: 0.4;">Acquisition Protocol / node_confirmed</p>
                    </div>

                    <p style="font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px;">Greetings, ${orderData.customer_name}</p>
                    <p style="font-size: 12px; opacity: 0.7;">Your request to secure items from the Zero Archive has been successfully processed and verified by our logistics engine.</p>
                    
                    <div style="margin: 40px 0;">
                        <h3 style="font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 4px; border-bottom: 1px solid #000000; padding-bottom: 10px; opacity: 0.3;">Archive Manifest</h3>
                        ${itemsHtml}
                    </div>

                    <div style="margin: 40px 0; background-color: #f9f9f9; padding: 20px; border-left: 4px solid #000000;">
                        <p style="margin: 0; font-size: 10px; font-weight: 900; text-transform: uppercase; opacity: 0.4; letter-spacing: 2px;">Total Valuation</p>
                        <p style="margin: 5px 0 0; font-size: 24px; font-weight: 900; font-style: italic;">${orderData.amount_total} ${orderData.currency}</p>
                    </div>

                    <div style="margin: 40px 0;">
                        <h3 style="font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 4px; border-bottom: 1px solid #000000; padding-bottom: 10px; opacity: 0.3;">Synchronization Portal</h3>
                        <p style="font-size: 12px; margin-top: 15px;">To monitor your package in real-time, visit our **Trace Order** node and enter your unique Access Key:</p>
                        <div style="background-color: #000000; color: #ffffff; padding: 15px; text-align: center; margin-top: 10px;">
                            <p style="margin: 0; font-size: 18px; font-weight: 900; letter-spacing: 4px;">${trackId}</p>
                            <p style="margin: 5px 0 0; font-size: 8px; opacity: 0.5;">[ ACCESS_KEY_VERIFIED ]</p>
                        </div>
                        <p style="font-size: 10px; margin-top: 15px; font-weight: 900; text-transform: uppercase; tracking-widest: 1px;">
                            URL: <a href="https://zero-store-three.vercel.app/track" style="color: #000000; text-decoration: underline;">zero-archive.com/track</a>
                        </p>
                    </div>

                    <div style="margin: 40px 0; border: 1px dashed #000000; padding: 20px;">
                        <h3 style="font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 4px; margin-bottom: 10px; opacity: 0.3;">Technical Support Node</h3>
                        <p style="font-size: 11px; margin: 0;">For immediate frequency assistance or archive queries, contact our Telegram support relay:</p>
                        <p style="font-size: 12px; margin-top: 5px; font-weight: 900;">
                            <a href="https://t.me/yekzuxian" style="color: #000000; text-decoration: none;">@ZeroArchive_Support_Node</a>
                        </p>
                    </div>

                    <div style="margin-top: 60px; border-top: 1px solid #eeeeee; padding-top: 20px;">
                        <p style="margin: 0; font-size: 8px; font-weight: 900; text-transform: uppercase; letter-spacing: 3px; opacity: 0.3;">
                            Verified by Zero-System Infrastructure • Ref: ${trackId}
                        </p>
                        <p style="margin: 5px 0 0; font-size: 8px; opacity: 0.2; text-transform: uppercase;">
                            This is an automated industrial transmission. Do not attempt direct frequency reply.
                        </p>
                    </div>
                </div>
                `
            });
            console.log("📧 Email Induction Status:", emailRes);
        } catch (emailErr) {
            console.error("⚠️ Email Induction Failed:", emailErr);
            // We don't throw here to avoid failing the whole order recording
        }

        // 5. Increment Coupon Usage Count
        if (couponCode) {
            try {
                const { adminSupabase } = await import('@/lib/supabase-admin-admin-admin-admin-admin-admin-admin-admin');
                const { data: couponData } = await adminSupabase
                    .from('coupons')
                    .select('used_count')
                    .eq('code', couponCode.toUpperCase())
                    .single();

                if (couponData) {
                    await adminSupabase
                        .from('coupons')
                        .update({ used_count: (couponData.used_count || 0) + 1 })
                        .eq('code', couponCode.toUpperCase());
                }
            } catch (couponErr) {
                console.error("⚠️ Coupon Usage Increment Failed:", couponErr);
            }
        }

        // 4. Update stock levels for each item (Production-Grade Sync)
        try {
            const { adminSupabase } = await import('@/lib/supabase-admin-admin-admin-admin-admin-admin-admin-admin');
            for (const item of items) {
                const { data: product } = await adminSupabase
                    .from('products')
                    .select('stock_levels')
                    .eq('id', item.id)
                    .single();

                if (product && product.stock_levels) {
                    const sizeKey = item.selectedSize || 'OS';
                    const currentStock = product.stock_levels[sizeKey] || 0;
                    const newStock = Math.max(0, currentStock - item.quantity);

                    const updatedStockLevels = {
                        ...product.stock_levels,
                        [sizeKey]: newStock
                    };

                    await adminSupabase
                        .from('products')
                        .update({ stock_levels: updatedStockLevels })
                        .eq('id', item.id);
                }
            }
        } catch (stockErr) {
            console.error("⚠️ Stock Update Failed:", stockErr);
        }

        return NextResponse.json({ success: true, orderId: data.id, trackId: data.track_id });
    } catch (err: any) {
        console.error("❌ Record Order Error:", err.message);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
