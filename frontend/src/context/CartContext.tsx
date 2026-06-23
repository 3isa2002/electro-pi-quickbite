"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  options?: string;
};

type CartContextType = {
  items: CartItem[];
  isCartOpen: boolean;
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  toggleCart: () => void;
  clearCart: () => void;
  subtotal: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([
    {
      id: "1",
      name: "Classic Beef Burger",
      price: 150,
      quantity: 1,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAvs6MCQQ1wQs_N8kpaCxK8FeIqjm5oe6ELHgcQhs2ZQrmoKVXsB3553sJZFQ_x3zcgNzJBGIGm1LDyV3H9erZ56f9CiQ8y_gLPmmSKYtJz2dix132X3mqBLMCr0llnjbw9_hGSbvQzjhERDdTDHONZ3b3X7gUYbpWQ_pm2HdT-LxcbpnqvCrC4QquohOrRXXX6kXhJzaD9W1iVS81MTa4amr0PG_puxnVMGLr2vUZZUGABYIqbxxVgFd_VSI5suE0746QUJtAQZpE",
    },
    {
      id: "2",
      name: "Crispy Chicken Meal",
      price: 180,
      quantity: 1,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCqM1rYTtrcuqAvu7NZsMJroPbm83nM62-sRxV-F3L5o1BgQo16hB0hwzUloEX1WvqTx4-L4MXcEyuNum5H-DMgOlGS5rHlY36YiCbp__AlNGuA0JzGHzccAO1GyObCCRov3Ktc6iL10w_sWuWLZKCxuCBoW0ldtdlKLZqpG3ysEbv5UVWe760A62GzDsMpU1sOuzbpgCnskuEFQ3iIhUOMnOcCwYYALbxj_bEFLCBNRsNkH-qiKKTAcW7OAmyhAUJ5B3WRLVVYAVU",
    }
  ]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addToCart = (item: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
        );
      }
      return [...prev, item];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(id);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => setItems([]);

  const toggleCart = () => setIsCartOpen(!isCartOpen);

  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        isCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        toggleCart,
        clearCart,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
