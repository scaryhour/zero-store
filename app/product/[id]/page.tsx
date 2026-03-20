import React from 'react';
import { adminSupabase } from '@/lib/supabase';
import ProductClient from './ProductClient';
import { Metadata } from 'next';

interface Props {
  params: Promise<{ id: string }>;
}

// 1. Dynamic SEO Metadata Generation
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const { data: product } = await adminSupabase
    .from('products')
    .select('name, description, image')
    .eq('id', id)
    .single();

  if (!product) {
    return { title: 'Product Not Found | ZERO STORE' };
  }

  return {
    title: `${product.name} | Archive NO. ${id.padStart(4, '0')} | ZERO STORE`,
    description: product.description || 'Professional grade technical archive piece by ZERO STORE.',
    openGraph: {
      title: product.name,
      description: product.description,
      images: [product.image],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;

  // 2. Server-side Data Fetching
  const { data: product } = await adminSupabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  const { data: reviews } = await adminSupabase
    .from('reviews')
    .select('*')
    .eq('product_id', id)
    .order('created_at', { ascending: false });

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-12">
        <h1 className="text-4xl font-black uppercase tracking-tighter mb-4 text-black">ARCHIVE NODE LOST</h1>
        <a href="/" className="text-[11px] font-black border-2 border-black px-8 py-3 uppercase tracking-widest hover:bg-black hover:text-white transition-all">Return to System</a>
      </div>
    );
  }

  return <ProductClient initialProduct={product} initialReviews={reviews || []} />;
}