"use client";

import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { useCart } from "@/context/CartContext";
import { getToken } from "@/utils/auth";

export default function CartDrawer() {
  const t = useTranslations("Cart");
  const { isCartOpen, toggleCart, items, updateQuantity, subtotal } = useCart();
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const router = useRouter();

  const handleCheckoutClick = () => {
    toggleCart();
    const token = getToken();
    if (token) {
      router.push("/checkout");
    } else {
      router.push("/login?redirect=/checkout");
    }
  };

  return (
    <>
      {isCartOpen && (
        <div 
          className="fixed inset-0 bg-on-background/20 z-[60] md:z-30 transition-opacity md:hidden"
          onClick={toggleCart}
        />
      )}
      <aside className={`fixed right-0 rtl:right-auto rtl:left-0 top-0 h-screen w-[320px] max-w-[100vw] bg-surface-container-lowest shadow-2xl z-[70] md:z-40 border-l rtl:border-l-0 rtl:border-r border-outline-variant flex flex-col pt-0 md:pt-[72px] transform transition-transform duration-300 ${isCartOpen ? "translate-x-0" : "translate-x-full rtl:-translate-x-full"}`}>
        <div className="p-md border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
          <h2 className="font-title-md text-title-md text-on-background flex items-center gap-xs">
            <span className="material-symbols-outlined">shopping_bag</span>
            {t("title")}
          </h2>
          <div className="flex items-center gap-xs">
            <span className="bg-primary text-on-primary font-label-sm text-label-sm px-2 py-1 rounded-full">
              {t("items", { count: cartCount })}
            </span>
            <button 
              onClick={toggleCart} 
              className="w-8 h-8 rounded-full hover:bg-surface-variant flex items-center justify-center text-on-surface-variant transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>
        <div className="flex-grow overflow-y-auto p-md flex flex-col gap-md">
          {items.map((item) => (
            <div key={item.id} className="flex gap-sm items-center border-b border-outline-variant pb-sm">
              <div 
                className="w-16 h-16 rounded-lg bg-cover bg-center flex-shrink-0" 
                style={{ backgroundImage: `url('${item.image}')` }} 
              />
              <div className="flex-grow">
                <h4 className="font-label-md text-label-md text-on-background">{item.name}</h4>
                <div className="text-on-surface-variant font-label-sm text-label-sm mb-1">EGP {item.price}</div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-6 h-6 rounded-full bg-surface-container-high flex items-center justify-center text-primary hover:bg-surface-variant transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">remove</span>
                  </button>
                  <span className="font-label-md text-label-md w-4 text-center">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-6 h-6 rounded-full bg-surface-container-high flex items-center justify-center text-primary hover:bg-surface-variant transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                  </button>
                </div>
              </div>
              <div className="font-label-md text-label-md text-on-background font-bold">EGP {item.price * item.quantity}</div>
            </div>
          ))}
        </div>
        <div className="p-md bg-surface-container-low border-t border-outline-variant">
          <div className="flex justify-between items-center mb-sm">
            <span className="font-body-md text-body-md text-on-surface-variant">{t("subtotal")}</span>
            <span className="font-title-md text-title-md text-on-background font-bold">EGP {subtotal}</span>
          </div>
          <button onClick={handleCheckoutClick} className="w-full bg-primary text-on-primary font-label-md text-label-md font-bold py-3 rounded-lg hover:bg-[#7a4100] transition-colors shadow-sm flex justify-center items-center gap-xs">
            {t("goToCheckout")}
            <span className="material-symbols-outlined text-[20px] rtl:rotate-180">arrow_forward</span>
          </button>
        </div>
      </aside>
    </>
  );
}
