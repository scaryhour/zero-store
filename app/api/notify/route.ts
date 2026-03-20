import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    const { sessionId, items, total } = await req.json();
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      return NextResponse.json({ error: "Env Config Missing" }, { status: 500 });
    }

    let customerName = "Guest";
    let realAddress = "No address recorded";
    let customerPhone = "N/A";

    // 🕵️‍♂️ 只有当 sessionId 格式正确时才去 Stripe 提货
    if (sessionId && typeof sessionId === 'string' && sessionId.startsWith('cs_')) {
      try {
        const session = await stripe.checkout.sessions.retrieve(sessionId, {
          expand: ['customer', 'payment_intent'],
        });
        const sessionData = session as any;
        console.log("🔍 [STRIPE SESSION DATA]:", JSON.stringify(sessionData, null, 2));

        customerName = sessionData.customer_details?.name || "Customer";
        customerPhone = sessionData.customer_details?.phone || "N/A";

        // Stripe API sometimes places the address in `customer_details.address` instead of shipping_details 
        const shipping = sessionData.shipping_details?.address
          || sessionData.customer_details?.address
          || sessionData.shipping?.address;

        if (shipping) {
          const l1 = shipping.line1 || "";
          const l2 = shipping.line2 ? `, ${shipping.line2}` : "";
          const city = shipping.city || "";
          const zip = shipping.postal_code || "";
          const state = shipping.state || "";
          realAddress = `${l1}${l2}, ${zip} ${city}, ${state}`;
        } else {
          realAddress = "Address collected but hidden by Stripe API";
        }
      } catch (stripeErr: any) {
        console.error("⚠️ Stripe Retrieve Error:", stripeErr.message);
        realAddress = "Address sync error";
      }
    }

    const timestamp = new Date().toLocaleString('en-MY', {
      timeZone: 'Asia/Kuala_Lumpur',
      hour12: true
    });

    const message = `
📦 *ZERO ARCHIVE - NEW ORDER*
---------------------------------------
👤 *CUSTOMER:* ${customerName}
📞 *PHONE:* ${customerPhone}
📍 *SHIPPING:* ${realAddress}

🛒 *MANIFEST:*
${items}

💰 *TOTAL:* RM ${total}
⏰ *TIME:* ${timestamp}
---------------------------------------
✅ *STATUS:* PAID & SECURED
🌐 _v1.4.4_production_ready_
    `;

    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown',
      }),
    });

    console.log("✅ Telegram 通知流程结束");
    return NextResponse.json({ success: res.ok });

  } catch (err: any) {
    console.error("💥 Notify 路由发生灾难性故障:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
