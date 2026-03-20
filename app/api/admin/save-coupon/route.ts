import { NextResponse } from 'next/server';
import { adminSupabase } from '@/lib/supabase';

export async function POST(req: Request) {
    try {
        const { coupon, id } = await req.json();

        if (!coupon) {
            return NextResponse.json({ error: 'Coupon data is required' }, { status: 400 });
        }

        let res;
        if (id) {
            // Update existing
            res = await adminSupabase
                .from('coupons')
                .update(coupon)
                .eq('id', id)
                .select()
                .single();
        } else {
            // Create new
            res = await adminSupabase
                .from('coupons')
                .insert([coupon])
                .select()
                .single();
        }

        if (res.error) {
            console.error("Supabase Admin Coupon Error:", res.error);
            return NextResponse.json({ error: res.error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, data: res.data });
    } catch (err: any) {
        console.error('Admin Coupon API Error:', err);
        return NextResponse.json({ error: 'Server Interference Detected.' }, { status: 500 });
    }
}
