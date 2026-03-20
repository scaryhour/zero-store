import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
    try {
        const { orderId, email, customerName, totalAmount, items } = await req.json();

        if (!email || !orderId) {
            return NextResponse.json({ error: 'Missing Required Payload' }, { status: 400 });
        }

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

        const { data, error } = await resend.emails.send({
            from: 'Zero Store <onboarding@resend.dev>', // You can update to your domain later
            to: [email],
            subject: `Technical Report: Archive Request Confirmation #${orderId}`,
            html: `
                <div style="background-color: #ffffff; color: #000000; padding: 40px; font-family: 'Helvetica', sans-serif; line-height: 1.6;">
                    <div style="border-bottom: 5px solid #000000; padding-bottom: 20px; margin-bottom: 40px;">
                        <h2 style="margin: 0; font-size: 32px; font-style: italic; font-weight: 900; text-transform: uppercase; letter-spacing: -1px;">Zero Archive</h2>
                        <p style="margin: 5px 0 0; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 4px; opacity: 0.4;">Acquisition Protocol / node_confirmed</p>
                    </div>

                    <p style="font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px;">Greetings, ${customerName}</p>
                    <p style="font-size: 12px; opacity: 0.7;">Your request to secure items from the Zero Archive has been successfully processed and verified by our logistics engine.</p>
                    
                    <div style="margin: 40px 0;">
                        <h3 style="font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 4px; border-bottom: 1px solid #000000; padding-bottom: 10px; opacity: 0.3;">Archive Manifest</h3>
                        ${itemsHtml}
                    </div>

                    <div style="margin: 40px 0; background-color: #f9f9f9; padding: 20px;">
                        <p style="margin: 0; font-size: 10px; font-weight: 900; text-transform: uppercase; opacity: 0.4; letter-spacing: 2px;">Total Valuation</p>
                        <p style="margin: 5px 0 0; font-size: 24px; font-weight: 900; font-style: italic;">${totalAmount}</p>
                    </div>

                    <div style="margin-top: 60px; border-top: 1px solid #eeeeee; padding-top: 20px;">
                        <p style="margin: 0; font-size: 8px; font-weight: 900; text-transform: uppercase; letter-spacing: 3px; opacity: 0.3;">
                            Verified by Zero-System Infrastructure • Ref: ${orderId}
                        </p>
                        <p style="margin: 5px 0 0; font-size: 8px; opacity: 0.2; text-transform: uppercase;">
                            This is an automated industrial transmission. Do not attempt direct frequency reply.
                        </p>
                    </div>
                </div>
            `,
        });

        if (error) {
            console.error('Resend Error:', error);
            return NextResponse.json({ error: 'Transmission Interrupted.' }, { status: 500 });
        }

        return NextResponse.json({
            message: 'Transmission Successful.',
            status: 'Email Dispatched',
            data
        });
    } catch (err: any) {
        console.error('Email Transmission Error:', err);
        return NextResponse.json({ error: 'Email Node Failure.' }, { status: 500 });
    }
}
