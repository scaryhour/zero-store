import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        // Since we don't have a dedicated newsletter table yet, 
        // we can either create one or store them in a JSON field somewhere.
        // For now, let's assume we have a 'subscribers' table.
        // Ensure you run the SQL to create this table.

        /* 
        CREATE TABLE subscribers (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
        );
        */

        const { error } = await supabase
            .from('subscribers')
            .insert([{ email }]);

        if (error && error.code === '23505') {
            return NextResponse.json({ message: 'Already synchronized.' });
        }

        if (error) throw error;

        // Automatically dispatch a welcome email
        try {
            await resend.emails.send({
                from: 'Zero Store <onboarding@resend.dev>', // Update to your verified domain later
                to: [email],
                subject: 'Zero Archive / Terminal Connected',
                html: `
                <div style="background-color: #000000; color: #ffffff; padding: 40px; font-family: 'Helvetica', sans-serif; line-height: 1.6;">
                    <div style="border-bottom: 5px solid #ffffff; padding-bottom: 20px; margin-bottom: 40px;">
                        <h2 style="margin: 0; font-size: 32px; font-style: italic; font-weight: 900; text-transform: uppercase; letter-spacing: -1px;">Zero Store</h2>
                        <p style="margin: 5px 0 0; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 4px; opacity: 0.4;">Archive Protocol / node_connected</p>
                    </div>

                    <p style="font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px;">Identity Synced.</p>
                    <p style="font-size: 12px; opacity: 0.7;">Your frequency has been added to the master node. You will now receive encrypted transmissions regarding upcoming archive releases, technical specifications, and limited drops.</p>
                    
                    <div style="margin-top: 60px; border-top: 1px solid #333333; padding-top: 20px;">
                        <p style="margin: 0; font-size: 8px; font-weight: 900; text-transform: uppercase; letter-spacing: 3px; opacity: 0.3;">
                            System Uptime: Verified • Terminal ID: ${email.split('@')[0]}
                        </p>
                    </div>
                </div>
                `
            });
        } catch (emailErr) {
            console.error('Failed to dispatch welcome email:', emailErr);
            // We don't fail the whole request if just the email fails
        }

        return NextResponse.json({ message: 'Node Synchronized Successfully.' });
    } catch (err: any) {
        console.error('Newsletter Error:', err);
        return NextResponse.json({ error: 'Technical Interference Detected.' }, { status: 500 });
    }
}
