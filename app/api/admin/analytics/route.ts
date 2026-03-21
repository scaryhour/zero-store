import { NextResponse } from 'next/server';
import { adminSupabase } from '@/lib/supabase';

export async function GET() {
    try {
        // 1. Fetch all orders
        const { data: orders, error: orderError } = await adminSupabase
            .from('orders')
            .select('*');

        if (orderError) throw orderError;

        // 2. Calculate Total Revenue (GMV)
        const totalRevenue = orders.reduce((acc, order) => {
            const price = typeof order.amount_total === 'string'
                ? parseFloat(order.amount_total.replace(/[^0-9.]/g, ''))
                : order.amount_total;
            return acc + (price || 0);
        }, 0);

        // 3. Calculate Product Analytics
        const productMap: Record<string, { name: string; count: number; revenue: number }> = {};

        orders.forEach(order => {
            if (Array.isArray(order.items)) {
                order.items.forEach((item: any) => {
                    const price = typeof item.price === 'string'
                        ? parseFloat(item.price.replace(/[^0-9.]/g, ''))
                        : item.price;

                    if (!productMap[item.id]) {
                        productMap[item.id] = { name: item.name, count: 0, revenue: 0 };
                    }
                    productMap[item.id].count += (item.quantity || 1);
                    productMap[item.id].revenue += (price || 0) * (item.quantity || 1);
                });
            }
        });

        // 4. Sort Top Products
        const topProducts = Object.values(productMap)
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        return NextResponse.json({
            success: true,
            stats: {
                totalRevenue: totalRevenue.toFixed(2),
                orderCount: orders.length,
                topProducts
            }
        });
    } catch (err: any) {
        console.error('Analytics API Error:', err);
        return NextResponse.json({ error: 'Data synchronization failure.' }, { status: 500 });
    }
}
