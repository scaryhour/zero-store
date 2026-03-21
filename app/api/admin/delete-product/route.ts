import { NextResponse } from 'next/server';
import { adminSupabase } from '@/lib/supabase';

export async function POST(req: Request) {
    try {
        const { id } = await req.json();

        if (!id) {
            return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
        }

        const { error } = await adminSupabase
            .from('products')
            .delete()
            .eq('id', id);

        if (error) {
            console.error("Supabase Admin Delete Error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error('Admin Delete Error:', err);
        return NextResponse.json({ error: 'Server Interference Detected.' }, { status: 500 });
    }
}
