import { NextResponse } from 'next/server';
import { adminSupabase } from '@/lib/supabase';

export async function POST(req: Request) {
    try {
        const { product, id } = await req.json();

        if (!product) {
            return NextResponse.json({ error: 'Product data is required' }, { status: 400 });
        }

        let res;
        if (id) {
            // Update existing
            res = await adminSupabase
                .from('products')
                .update(product)
                .eq('id', id)
                .select()
                .single();
        } else {
            // Create new
            res = await adminSupabase
                .from('products')
                .insert([product])
                .select()
                .single();
        }

        if (res.error) {
            console.error("Supabase Admin Error:", res.error);
            return NextResponse.json({ error: res.error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, data: res.data });
    } catch (err: any) {
        console.error('Admin API Error:', err);
        return NextResponse.json({ error: 'Server Interference Detected.' }, { status: 500 });
    }
}
