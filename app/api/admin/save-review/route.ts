import { NextResponse } from 'next/server';
import { adminSupabase } from '@/lib/supabase-admin-admin';

export async function POST(req: Request) {
    try {
        const { product_id, customer_name, rating, comment } = await req.json();

        if (!product_id || !rating) {
            return NextResponse.json({ error: 'Product ID and Rating are required' }, { status: 400 });
        }

        const { data, error } = await adminSupabase
            .from('reviews')
            .insert([{
                product_id,
                customer_name: customer_name || 'Anonymous Collector',
                rating,
                comment
            }])
            .select()
            .single();

        if (error) {
            console.error("Supabase Admin Save Review Error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, data });
    } catch (err: any) {
        console.error('Admin Save Review Error:', err);
        return NextResponse.json({ error: 'Server Interference Detected.' }, { status: 500 });
    }
}
