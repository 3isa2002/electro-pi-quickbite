"use client";

import { useTranslations, useLocale } from "next-intl";
import TopNavBar from "@/components/layout/TopNavBar";
import BottomNavBar from "@/components/layout/BottomNavBar";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useEffect, useState } from "react";
import { getToken } from "@/utils/auth";

type OrderItem = {
  id: number;
  product_id: number;
  quantity: number;
  product: {
    id: number;
    name_en: string;
    name_ar: string;
    price: number;
    image_url: string;
  };
};

type Order = {
  id: number;
  user_id: number;
  total_amount: number;
  status: string;
  payment_method: string;
  created_at: string;
  items: OrderItem[];
};

export default function ProfilePage() {
  const t = useTranslations("Navigation");
  const tTrack = useTranslations("TrackOrder");
  const locale = useLocale();
  const { user, logout } = useAuth();
  const { addToCart, toggleCart } = useCart();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (showHistory && orders.length === 0) {
      fetchOrders();
    }
  }, [showHistory]);

  const fetchOrders = async () => {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/orders/my-orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data: Order[] = await res.json();
        // Filter only delivered/completed orders for history
        const deliveredOrders = data.filter(order => order.status === 'Delivered');
        setOrders(deliveredOrders);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleReorder = (order: Order) => {
    order.items.forEach(item => {
      addToCart({
        id: item.product.id.toString(),
        name: locale === 'ar' ? item.product.name_ar : item.product.name_en,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.image_url
      });
    });
    toggleCart();
  };

  return (
    <>
      <TopNavBar />
      <main className="flex-grow w-full max-w-[800px] mx-auto px-margin-mobile md:px-margin-desktop py-lg pb-[100px] md:pb-lg">
        <h1 className="font-headline-xl text-headline-xl text-on-background mb-lg">{t("profile")}</h1>
        
        {/* User Info Card */}
        {user && (
          <section className="bg-surface-container-lowest rounded-xl shadow-sm p-lg border border-outline-variant mb-lg flex items-center gap-md">
            <div className="w-20 h-20 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-headline-lg text-headline-lg shrink-0 uppercase">
              {user.name.substring(0, 2)}
            </div>
            <div>
              <h2 className="font-title-md text-title-md text-on-surface mb-1">{user.name}</h2>
              <p className="font-body-md text-body-md text-on-surface-variant mb-1">{user.email}</p>
              <p className="font-label-sm text-label-sm text-primary font-bold uppercase">{user.role}</p>
            </div>
          </section>
        )}

        {/* Settings Links */}
        <section className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant overflow-hidden">
          <ul className="divide-y divide-outline-variant">
            <li>
              <div className="flex flex-col">
                <button 
                  onClick={() => setShowHistory(!showHistory)}
                  className="w-full px-lg py-4 flex items-center justify-between hover:bg-surface-container-low transition-colors"
                >
                  <div className="flex items-center gap-3 text-on-surface">
                    <span className="material-symbols-outlined">receipt_long</span>
                    <span className="font-label-md text-label-md">Order History</span>
                  </div>
                  <span className={`material-symbols-outlined text-on-surface-variant transition-transform ${showHistory ? 'rotate-90 rtl:rotate-90' : 'rtl:rotate-180'}`}>chevron_right</span>
                </button>
                
                {/* Order History Dropdown */}
                {showHistory && (
                  <div className="px-lg pb-4 bg-surface-container-low/50">
                    {loading ? (
                      <p className="text-center text-on-surface-variant py-4">Loading...</p>
                    ) : orders.length === 0 ? (
                      <p className="text-center text-on-surface-variant py-4">No past orders found.</p>
                    ) : (
                      <div className="space-y-4 mt-2">
                        {orders.map(order => (
                          <div key={order.id} className="bg-surface-container-lowest p-4 rounded-lg border border-outline-variant/50 shadow-sm">
                            <div className="flex justify-between items-start mb-3 border-b border-outline-variant/30 pb-2">
                              <div>
                                <p className="font-label-md text-label-md font-bold text-on-surface">{tTrack("orderId")}: #{order.id}</p>
                                <p className="font-body-sm text-body-sm text-on-surface-variant">{new Date(order.created_at).toLocaleDateString()}</p>
                              </div>
                              <div className="text-right rtl:text-left">
                                <p className="font-title-md text-title-md font-bold text-primary">{tTrack("currency")} {order.total_amount.toFixed(2)}</p>
                              </div>
                            </div>
                            <div className="mb-4">
                              {order.items.map(item => (
                                <p key={item.id} className="font-body-sm text-body-sm text-on-surface-variant">
                                  {item.quantity}x {locale === 'ar' ? item.product.name_ar : item.product.name_en}
                                </p>
                              ))}
                            </div>
                            <button 
                              onClick={() => handleReorder(order)}
                              className="w-full bg-primary-container text-on-primary-container hover:bg-primary hover:text-on-primary font-label-md text-label-md py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                              <span className="material-symbols-outlined text-sm">refresh</span>
                              Re-order
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </li>
            <li>
              <button className="w-full px-lg py-4 flex items-center justify-between hover:bg-surface-container-low transition-colors">
                <div className="flex items-center gap-3 text-on-surface">
                  <span className="material-symbols-outlined">location_on</span>
                  <span className="font-label-md text-label-md">Saved Addresses</span>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant rtl:rotate-180">chevron_right</span>
              </button>
            </li>
            <li>
              <button onClick={() => logout()} className="w-full px-lg py-4 flex items-center justify-between hover:bg-error-container/10 transition-colors text-error">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined">logout</span>
                  <span className="font-label-md text-label-md">Log Out</span>
                </div>
              </button>
            </li>
          </ul>
        </section>
      </main>
      <BottomNavBar />
    </>
  );
}
