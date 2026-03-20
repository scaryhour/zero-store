import { NextResponse } from 'next/server';
import { adminSupabase } from '@/lib/supabase';

export async function POST(req: Request) {
    try {
        const { name } = await req.json();

        if (!name) {
            return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
        }

        const { data, error } = await adminSupabase
            .from('categories')
            .insert([{ name }])
            .select()
            .single();

        if (error) {
            console.error("Supabase Admin Category Error:", error);
            // Handle unique violation
            if (error.code === '23505') {
                return NextResponse.json({ message: 'Category already exists' });
            }
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, data });
    } catch (err: any) {
        console.error('Admin Category Error:', err);
        return NextResponse.json({ error: 'Server Interference Detected.' }, { status: 500 });
    }
}
