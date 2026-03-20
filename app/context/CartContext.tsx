'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

export interface CartItem {
  id: number;
  name: string;
  price: string;
  image: string;
  quantity: number;
  selectedSize?: string;
  stock_levels?: Record<string, number>;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: number, size?: string) => void;
  updateQuantity: (id: number, quantity: number, size?: string) => void;
  clearCart: () => void;
  currency: 'RM' | 'USD';
  toggleCurrency: () => void;
  discount: number; // percentage, e.g. 10 for 10%
  applyDiscount: (code: string) => Promise<boolean>;
  exchangeRate: number;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  totalPrice: number;
}

const CartContext = createContext<CartContextType>({} as CartContextType);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [currency, setCurrency] = useState<'RM' | 'USD'>('RM');
  const [discount, setDiscount] = useState(0);
  const [exchangeRate, setExchangeRate] = useState(0.21); // Default fallback

  // Load from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('zero_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Cart retrieval failed", e);
      }
    }

    // Persist Coupon
    const savedCoupon = localStorage.getItem('zero_applied_coupon');
    if (savedCoupon) {
      applyDiscount(savedCoupon);
    }

    // Fetch Real-time Exchange Rate (Frankfurter API - Free)
    const fetchRate = async () => {
      try {
        const res = await fetch('https://api.frankfurter.app/latest?from=MYR&to=USD');
        const data = await res.json();
        if (data && data.rates && data.rates.USD) {
          setExchangeRate(data.rates.USD);
          console.log(`🌍 Live Exchange Rate Sync: 1 MYR = ${data.rates.USD} USD`);
        }
      } catch (err) {
        console.warn("Exchange rate sync failed, using fallback 0.21", err);
      }
    };
    fetchRate();
  }, []);

  // Save to localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem('zero_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: Omit<CartItem, 'quantity'>) => {
    setCart((prevCart) => {
      // Find item by ID AND Size
      const existingItem = prevCart.find(
        item => item.id === product.id && item.selectedSize === product.selectedSize
      );

      const sizeKey = product.selectedSize || 'OS';
      const availableStock = product.stock_levels?.[sizeKey] ?? 99;

      if (existingItem) {
        if (existingItem.quantity >= availableStock) {
          alert(`STOCK LIMIT REACHED: ONLY ${availableStock} UNITS AVAILABLE`);
          return prevCart;
        }
        return prevCart.map(item =>
          (item.id === product.id && item.selectedSize === product.selectedSize)
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: number, size?: string) => {
    setCart((prevCart) => prevCart.filter(item => !(item.id === id && item.selectedSize === size)));
  };

  const updateQuantity = (id: number, quantity: number, size?: string) => {
    setCart(prevCart => prevCart.map(item => {
      if (item.id === id && item.selectedSize === size) {
        const sizeKey = size || 'OS';
        const availableStock = item.stock_levels?.[sizeKey] ?? 99;

        let newQty = quantity;
        if (newQty > availableStock) {
          alert(`STOCK LIMIT REACHED: ONLY ${availableStock} UNITS AVAILABLE`);
          newQty = availableStock;
        }
        return { ...item, quantity: Math.max(1, newQty) };
      }
      return item;
    }));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('zero_cart');
  };

  const toggleCurrency = () => {
    setCurrency(prev => prev === 'RM' ? 'USD' : 'RM');
  };

  const applyDiscount = async (code: string) => {
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', code.trim().toUpperCase())
        .eq('is_active', true)
        .single();

      if (data && !error) {
        // Check expiry
        if (data.expiry_date && new Date(data.expiry_date) < new Date()) {
          console.warn("Coupon expired");
          return false;
        }

        setDiscount(data.discount_percent);
        localStorage.setItem('zero_applied_coupon', code.toUpperCase()); // Store for record-order
        return true;
      }
      return false;
    } catch (err) {
      console.error("Discount verification failed", err);
      return false;
    }
  };

  const totalPrice = cart.reduce((acc, item) => {
    const p = parseFloat(item.price.replace(/[^0-9.]/g, '')) || 0;
    return acc + p * item.quantity;
  }, 0);

  const discountedTotalPrice = totalPrice * (1 - discount / 100);
  const finalPrice = currency === 'USD' ? discountedTotalPrice * exchangeRate : discountedTotalPrice;

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      isCartOpen,
      setIsCartOpen,
      totalPrice: finalPrice, // Use the final calculated price
      currency,
      toggleCurrency,
      discount,
      applyDiscount,
      exchangeRate
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);