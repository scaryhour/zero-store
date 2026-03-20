'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

interface WishlistItem {
    id: number;
    name: string;
    price: string;
    image: string;
}

interface WishlistContextType {
    wishlist: WishlistItem[];
    toggleWishlist: (product: WishlistItem) => void;
    isInWishlist: (id: number) => boolean;
    isWishlistOpen: boolean;
    setIsWishlistOpen: (open: boolean) => void;
    clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType>({} as WishlistContextType);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
    const [isWishlistOpen, setIsWishlistOpen] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('zero_wishlist');
        if (saved) {
            try {
                setWishlist(JSON.parse(saved));
            } catch (e) {
                console.error("Wishlist retrieval failed", e);
            }
        }
    }, []);

    // Save to localStorage whenever wishlist changes
    useEffect(() => {
        localStorage.setItem('zero_wishlist', JSON.stringify(wishlist));
    }, [wishlist]);

    const toggleWishlist = (product: WishlistItem) => {
        setWishlist(prev => {
            const exists = prev.find(item => item.id === product.id);
            if (exists) {
                return prev.filter(item => item.id !== product.id);
            }
            return [...prev, product];
        });
    };

    const isInWishlist = (id: number) => wishlist.some(item => item.id === id);

    const clearWishlist = () => {
        setWishlist([]);
        localStorage.removeItem('zero_wishlist');
    };

    return (
        <WishlistContext.Provider value={{
            wishlist,
            toggleWishlist,
            isInWishlist,
            isWishlistOpen,
            setIsWishlistOpen,
            clearWishlist
        }}>
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => useContext(WishlistContext);
