import { NextResponse } from 'next/server';
import { adminSupabase } from '@/lib/supabase';

export async function POST(req: Request) {
    try {
        const { orderId, status, trackingNumber } = await req.json();

        if (!orderId) {
            return NextResponse.json({ error: "Missing Order Reference" }, { status: 400 });
        }

        const updateData: any = {
            status: status
        };

        // Add corresponding timestamp for the new status
        if (status === 'processing') updateData.processed_at = new Date().toISOString();
        if (status === 'shipped') updateData.shipped_at = new Date().toISOString();
        if (status === 'delivered') updateData.delivered_at = new Date().toISOString();

        if (trackingNumber !== undefined) {
            updateData.tracking_number = trackingNumber;
        }

        const { data, error } = await adminSupabase
            .from('orders')
            .update(updateData)
            .eq('id', orderId)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, order: data });
    } catch (err: any) {
        console.error("❌ Logistics Update Error:", err.message);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
