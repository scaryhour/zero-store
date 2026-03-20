'use client';
import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase } from '@/lib/supabase';

// --- 配置区 ---
const CLOUD_NAME = 'dehf9fvpz';
const UPLOAD_PRESET = 'zero_preset';

export interface ProductData {
    id?: number;
    name: string;
    price: string;
    image?: string;
    description?: string;
    has_sizes?: boolean;
    sizes?: string[];
    category?: string;
    images?: string[];
    stock_levels?: Record<string, number>;
    video_url?: string;
}

export default function UploadProduct({
    onProductAdded,
    editingProduct,
    onCancelEdit,
    isModal = false
}: {
    onProductAdded: () => void,
    editingProduct?: ProductData | null,
    onCancelEdit?: () => void,
    isModal?: boolean
}) {
    // Make sure we open the form if we are in edit mode
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form State
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Archive');
    const [hasSizes, setHasSizes] = useState(false);
    const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
    const [stockLevels, setStockLevels] = useState<Record<string, string>>({});
    const [file, setFile] = useState<File | null>(null);
    const [additionalImages, setAdditionalImages] = useState<string>(''); // For multi-image input
    const [videoUrl, setVideoUrl] = useState<string>('');
    const [customSizeInput, setCustomSizeInput] = useState('');
    const [categories, setCategories] = useState<string[]>([]);
    const [newCategoryInput, setNewCategoryInput] = useState('');
    const [isAddingCategory, setIsAddingCategory] = useState(false);

    // Fetch categories on mount
    const fetchCategories = async () => {
        const { data } = await supabase.from('categories').select('name').order('name');
        if (data) setCategories(data.map(c => c.name));
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    // Populate form if we receive a product to edit
    useEffect(() => {
        if (editingProduct) {
            setName(editingProduct.name);
            setPrice(editingProduct.price.replace('RM ', ''));
            setDescription(editingProduct.description || '');
            setCategory(editingProduct.category || 'Archive');
            setHasSizes(editingProduct.has_sizes || false);
            setSelectedSizes(editingProduct.sizes || []);

            // Convert numbers back to strings for input
            const stocks: Record<string, string> = {};
            if (editingProduct.stock_levels) {
                Object.entries(editingProduct.stock_levels).forEach(([size, stock]) => {
                    stocks[size] = stock.toString();
                });
            }
            setStockLevels(stocks);

            setPreview(editingProduct.image || null);
            setAdditionalImages(editingProduct.images?.filter(img => img !== editingProduct.image).join(', ') || '');
            setVideoUrl(editingProduct.video_url || '');
            setIsOpen(true);
        }
    }, [editingProduct]);

    const resetForm = () => {
        setName('');
        setPrice('');
        setDescription('');
        setCategory('Archive');
        setHasSizes(false);
        setSelectedSizes([]);
        setStockLevels({});
        setCustomSizeInput('');
        setFile(null);
        setAdditionalImages('');
        setVideoUrl('');
        setPreview(null);
        setIsOpen(false);
        setIsAddingCategory(false);
        setNewCategoryInput('');
        if (onCancelEdit) onCancelEdit();
    };

    // Use Escape key to close
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') resetForm();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    const handleAddCategory = async () => {
        const trimmed = newCategoryInput.trim();
        if (!trimmed) return;

        const response = await fetch('/api/admin/save-category', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: trimmed }),
        });
        const result = await response.json();

        if (result.error) {
            alert("Error adding category: " + result.error);
            return;
        }

        setCategories(prev => [...new Set([...prev, trimmed])].sort());
        setCategory(trimmed);
        setNewCategoryInput('');
        setIsAddingCategory(false);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            const objectUrl = URL.createObjectURL(selectedFile);
            setPreview(objectUrl);
            setIsOpen(true);
        }
    };

    const toggleSize = (size: string) => {
        if (selectedSizes.includes(size)) {
            setSelectedSizes(selectedSizes.filter(s => s !== size));
        } else {
            setSelectedSizes([...selectedSizes, size]);
        }
    };

    const handleAddCustomSize = () => {
        const trimmed = customSizeInput.trim().toUpperCase();
        if (trimmed && !selectedSizes.includes(trimmed)) {
            setSelectedSizes([...selectedSizes, trimmed]);
        }
        setCustomSizeInput('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // If creating new, require file. If editing, file is optional (keep existing)
        if ((!file && !editingProduct) || !name || !price) return;

        setLoading(true);
        let imageUrl = editingProduct?.image || '';

        try {
            // 1. Upload to Cloudinary if a new file was selected
            if (file) {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('upload_preset', UPLOAD_PRESET);

                const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
                    method: 'POST',
                    body: formData,
                });
                const cloudData = await cloudRes.json();

                if (!cloudData.secure_url) {
                    console.error("Cloudinary Detailed Error:", cloudData);
                    throw new Error(`Cloudinary upload failed: ${cloudData.error?.message || 'Unknown error'}`);
                }
                imageUrl = cloudData.secure_url;
            }

            // Process additional images
            const otherImages = additionalImages.split(',').map(s => s.trim()).filter(s => s !== '');
            const allImages = [imageUrl, ...otherImages].filter(Boolean);

            // Convert stock levels to numbers
            const finalStockLevels: Record<string, number> = {};
            selectedSizes.forEach(size => {
                finalStockLevels[size] = parseInt(stockLevels[size] || '0');
            });

            const payload = {
                name: name,
                price: price.startsWith('RM ') ? price : `RM ${price}`,
                image: imageUrl,
                description: description,
                category: category,
                has_sizes: hasSizes,
                sizes: hasSizes ? selectedSizes : [],
                images: allImages,
                stock_levels: hasSizes ? finalStockLevels : { 'OS': parseInt(stockLevels['OS'] || '99') },
                video_url: videoUrl
            };

            // 2. Save to Supabase (via Admin API to bypass RLS)
            const response = await fetch('/api/admin/save-product', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ product: payload, id: editingProduct?.id }),
            });
            const result = await response.json();

            if (result.error) {
                throw new Error(result.error);
            }

            console.log('✅ Subapase product saved!');
            onProductAdded();
            resetForm();

        } catch (err: any) {
            console.error(err);
            alert('Failed to save product: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    // If the form is closed, just show the "+ Add Design" trigger
    if (!isOpen) {
        return (
            <div
                onClick={() => fileInputRef.current?.click()}
                className="relative aspect-[3/4] border-2 border-dashed border-black/10 flex flex-col items-center justify-center bg-[#f9f9f9] group hover:bg-white hover:border-black/30 transition-all cursor-pointer overflow-hidden"
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                />
                <div className="text-center group-hover:scale-110 transition-transform duration-500">
                    <span className="text-3xl font-light">+</span>
                    <p className="text-[10px] font-black uppercase tracking-widest mt-2">New Release</p>
                </div>
            </div>
        );
    }

    // If file is selected or editing, show the form filling UI
    const FormContent = (
        <div className={`relative ${isModal ? 'w-full max-w-xl max-h-[90vh]' : 'aspect-[3/4]'} bg-white border border-black shadow-2xl p-6 flex flex-col justify-between overflow-y-auto overflow-x-hidden animate-in fade-in zoom-in duration-300`}>
            <div className="flex justify-between items-center mb-6 shrink-0">
                <h3 className="font-bold uppercase tracking-tight text-lg leading-none">
                    {editingProduct ? 'Update\nProduct' : 'Initialize\nProduct'}
                </h3>
                <div className="flex items-center gap-4">
                    <button type="button" disabled={loading} onClick={resetForm} className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 hover:text-black transition-colors underline underline-offset-4">Abort_Transaction</button>
                    <button type="button" onClick={resetForm} className="p-2 hover:bg-zinc-100 transition-colors">
                        <X size={20} strokeWidth={2.5} />
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div
                    className="h-32 bg-[#f5f5f5] relative overflow-hidden flex items-center justify-center group shrink-0 cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/*"
                    />
                    {preview ? (
                        <>
                            <img src={preview} className="w-full h-full object-cover grayscale brightness-90 group-hover:grayscale-0 transition-all duration-700" alt="Preview" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-[10px] font-black uppercase text-white tracking-widest">Change Image</span>
                            </div>
                        </>
                    ) : (
                        <span className="text-xs font-bold uppercase tracking-widest text-zinc-300">Select Image</span>
                    )}
                </div>

                <div className="space-y-3 shrink-0">
                    <input
                        type="text"
                        placeholder="PIECE NAME (e.g. DARREN)"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={loading}
                        required
                        className="w-full bg-zinc-100 px-4 py-3 text-xs font-black uppercase tracking-widest focus:outline-none focus:ring-1 focus:ring-black transition-all placeholder:text-zinc-400"
                    />
                    <input
                        type="number"
                        step="0.01"
                        placeholder="PRICE (e.g. 129.90)"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        disabled={loading}
                        required
                        className="w-full bg-zinc-100 px-4 py-3 text-xs font-black uppercase tracking-widest focus:outline-none focus:ring-1 focus:ring-black transition-all placeholder:text-zinc-400"
                    />
                    <textarea
                        rows={2}
                        placeholder="Design Concept / Story..."
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        disabled={loading}
                        className="w-full bg-zinc-100 px-4 py-3 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-black transition-all placeholder:text-zinc-400 resize-none"
                    />

                    {/* Category Selection */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-black/60">Category</span>
                            <button
                                type="button"
                                onClick={() => setIsAddingCategory(!isAddingCategory)}
                                className="text-[9px] font-bold uppercase text-blue-600 hover:underline"
                            >
                                {isAddingCategory ? 'Select Existing' : '+ New Category'}
                            </button>
                        </div>

                        {isAddingCategory ? (
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Enter category name..."
                                    value={newCategoryInput}
                                    onChange={(e) => setNewCategoryInput(e.target.value)}
                                    className="flex-1 bg-white border border-black/10 px-3 py-2 text-[10px] uppercase font-black tracking-widest focus:outline-none focus:border-black"
                                />
                                <button
                                    type="button"
                                    onClick={handleAddCategory}
                                    className="bg-black text-white px-4 text-[9px] font-black uppercase"
                                >
                                    Add
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto no-scrollbar p-1">
                                {['Archive', ...categories.filter(c => c !== 'Archive')].map(cat => (
                                    <button
                                        key={cat}
                                        type="button"
                                        onClick={() => setCategory(cat)}
                                        className={`px-3 py-2 text-[9px] font-black uppercase transition-all border ${category === cat ? 'bg-black text-white border-black shadow-lg' : 'bg-transparent text-zinc-400 border-zinc-200 hover:border-black hover:text-black'}`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Additional Images URL */}
                    <input
                        type="text"
                        placeholder="ADDITIONAL IMAGE URLS (COMMA SEPARATED)"
                        value={additionalImages}
                        onChange={(e) => setAdditionalImages(e.target.value)}
                        disabled={loading}
                        className="w-full bg-zinc-100 px-4 py-3 text-xs font-bold uppercase tracking-widest focus:outline-none focus:ring-1 focus:ring-black transition-all placeholder:text-zinc-400"
                    />

                    {/* Video URL */}
                    <input
                        type="text"
                        placeholder="PRODUCT VIDEO URL (E.G. CLOUDINARY/MP4)"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        disabled={loading}
                        className="w-full bg-zinc-100 px-4 py-3 text-xs font-black uppercase tracking-widest focus:outline-none focus:ring-1 focus:ring-black transition-all placeholder:text-zinc-400"
                    />

                    {/* Size Toggle */}
                    <div className="bg-zinc-100 p-4 shrink-0">
                        <label className="flex items-center justify-between cursor-pointer group mb-4">
                            <span className="text-[10px] font-black uppercase tracking-widest text-black/60 group-hover:text-black transition-colors">Require Sizes?</span>
                            <input
                                type="checkbox"
                                checked={hasSizes}
                                onChange={(e) => {
                                    setHasSizes(e.target.checked);
                                    if (!e.target.checked) setSelectedSizes([]);
                                }}
                                className="hidden"
                            />
                            <div className={`w-8 h-4 rounded-full transition-colors flex items-center px-1 ${hasSizes ? 'bg-black' : 'bg-zinc-300'}`}>
                                <div className={`w-2 h-2 rounded-full bg-white transition-transform ${hasSizes ? 'translate-x-[16px]' : 'translate-x-0'}`}></div>
                            </div>
                        </label>

                        {/* Category Presets & Custom Input */}
                        {hasSizes && (
                            <div className="space-y-4">
                                {/* Preset Clothes */}
                                <div>
                                    <span className="text-[9px] font-black uppercase text-zinc-400 tracking-widest mb-2 block">Quick Add: Apparel</span>
                                    <div className="flex gap-2">
                                        {['S', 'M', 'L', 'XL'].map(sz => (
                                            <button
                                                key={sz}
                                                type="button"
                                                onClick={() => toggleSize(sz)}
                                                className={`flex-1 py-1.5 text-[9px] font-black uppercase transition-all border ${selectedSizes.includes(sz) ? 'bg-black text-white border-black' : 'bg-transparent text-zinc-400 border-zinc-300 hover:border-black hover:text-black'}`}
                                            >
                                                {sz}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Preset Shoes */}
                                <div>
                                    <span className="text-[9px] font-black uppercase text-zinc-400 tracking-widest mb-2 block">Quick Add: Footwear (US)</span>
                                    <div className="flex flex-wrap gap-2">
                                        {['US 7', 'US 8', 'US 9', 'US 10', 'US 11', 'US 12'].map(sz => (
                                            <button
                                                key={sz}
                                                type="button"
                                                onClick={() => toggleSize(sz)}
                                                className={`px-3 py-1.5 text-[9px] font-black uppercase transition-all border ${selectedSizes.includes(sz) ? 'bg-black text-white border-black' : 'bg-transparent text-zinc-400 border-zinc-300 hover:border-black hover:text-black'}`}
                                            >
                                                {sz}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Custom Input */}
                                <div>
                                    <span className="text-[9px] font-black uppercase text-zinc-400 tracking-widest mb-2 block">Or Add Custom Size</span>
                                    <div className="flex gap-2 mb-3">
                                        <input
                                            type="text"
                                            placeholder="eg. ONE SIZE"
                                            value={customSizeInput}
                                            onChange={(e) => setCustomSizeInput(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    handleAddCustomSize();
                                                }
                                            }}
                                            className="flex-1 bg-white border border-black/10 px-3 py-2 text-[10px] uppercase font-black tracking-widest focus:outline-none focus:border-black transition-colors"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddCustomSize}
                                            className="bg-black text-white px-4 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-colors"
                                        >
                                            Add
                                        </button>
                                    </div>
                                </div>

                                {/* Added Sizes Tags & Stock Level Inputs */}
                                {selectedSizes.length > 0 && (
                                    <div className="space-y-3 pt-2 border-t border-black/10">
                                        <span className="text-[9px] font-black uppercase text-zinc-400 tracking-widest">Stock Allocation</span>
                                        <div className="grid grid-cols-1 gap-2">
                                            {selectedSizes.map((sz, i) => (
                                                <div key={i} className="flex items-center gap-2">
                                                    <div className="flex-1 flex items-center bg-white border border-black px-2 py-1 text-[9px] font-black tracking-widest">
                                                        <span>{sz}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleSize(sz)}
                                                            className="ml-auto w-4 h-4 rounded bg-red-500 text-white flex items-center justify-center opacity-80 hover:opacity-100 pb-[1px]"
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                    <input
                                                        type="number"
                                                        placeholder="Qty"
                                                        value={stockLevels[sz] || ''}
                                                        onChange={(e) => setStockLevels({ ...stockLevels, [sz]: e.target.value })}
                                                        className="w-16 bg-white border border-black/10 px-2 py-1 text-[9px] font-black focus:outline-none focus:border-black transition-colors"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Inventory for No-Size products */}
                        {!hasSizes && (
                            <div className="mt-4 pt-4 border-t border-black/10 flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-widest text-black/60">Standard Inventory</span>
                                <input
                                    type="number"
                                    placeholder="Qty"
                                    value={stockLevels['OS'] || ''}
                                    onChange={(e) => setStockLevels({ 'OS': e.target.value })}
                                    className="w-16 bg-white border border-black/10 px-2 py-3 text-[10px] font-black focus:outline-none focus:border-black transition-colors"
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div className="pb-4 mt-auto shrink-0">
                    <button
                        type="submit"
                        disabled={loading || !name || !price || (hasSizes && selectedSizes.length === 0)}
                        className={`w-full py-4 text-[10px] font-bold uppercase tracking-[0.4em] transition-all duration-500 mt-2 ${loading || !name || !price || (hasSizes && selectedSizes.length === 0) ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed' : 'bg-black text-white hover:bg-emerald-600'}`}
                    >
                        {loading ? 'Transmitting...' : (editingProduct ? 'Update Piece' : 'Upload & Deploy')}
                    </button>
                </div>
            </form>
        </div>
    );

    if (isModal) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={resetForm} />
                {FormContent}
            </div>
        );
    }

    return FormContent;
}
