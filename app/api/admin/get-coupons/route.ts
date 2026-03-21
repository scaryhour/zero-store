import { NextResponse } from 'next/server';
import { adminSupabase } from '@/lib/supabase-admin-admin';

export async function GET() {
    try {
        const { data, error } = await adminSupabase
            .from('coupons')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Supabase Admin Fetch Coupons Error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, data });
    } catch (err: any) {
        console.error('Admin Fetch Coupons Error:', err);
        return NextResponse.json({ error: 'Server Interference Detected.' }, { status: 500 });
    }
}
