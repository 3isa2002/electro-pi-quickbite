"use client";

import { useTranslations, useLocale } from "next-intl";
import TopNavBar from "@/components/layout/TopNavBar";
import BottomNavBar from "@/components/layout/BottomNavBar";
import { useEffect, useState } from "react";
import { getToken } from "@/utils/auth";
import { useRouter, Link } from "@/i18n/routing";

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
  shipping_address: string;
  shipping_phone: string;
  created_at: string;
  items: OrderItem[];
};

export default function TrackOrder() {
  const t = useTranslations("TrackOrder");
  const locale = useLocale();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    const token = getToken();
    if (!token) {
      router.push("/login?redirect=/track-order");
      return;
    }
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/orders/my-orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data: Order[] = await res.json();
        // Find the most recent active order (not completed)
        const activeOrder = data.find(o => o.status !== "Delivered");
        setOrder(activeOrder || null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000); // poll every 5 seconds
    return () => clearInterval(interval);
  }, [router]);

  if (loading) {
    return (
      <>
        <TopNavBar />
        <main className="flex-grow w-full max-w-[1200px] mx-auto px-margin-mobile md:px-margin-desktop py-lg flex justify-center items-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </main>
        <BottomNavBar />
      </>
    );
  }

  if (!order) {
    return (
      <>
        <TopNavBar />
        <main className="flex-grow w-full max-w-[1200px] mx-auto px-margin-mobile md:px-margin-desktop py-lg pb-[100px] md:pb-lg flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="w-24 h-24 bg-surface-variant rounded-full flex items-center justify-center mb-6 text-on-surface-variant">
            <span className="material-symbols-outlined text-5xl">receipt_long</span>
          </div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface mb-4">{t("noOrders")}</h2>
          <Link href="/" className="bg-primary text-on-primary px-8 py-3 rounded-full font-label-md text-label-md font-bold hover:bg-primary-fixed-dim transition-colors">
            {t("startOrdering")}
          </Link>
        </main>
        <BottomNavBar />
      </>
    );
  }

  // Determine current step index based on status
  const statuses = ["Pending", "Preparing", "Out for Delivery", "Delivered"];
  const currentStatusIndex = statuses.indexOf(order.status);

  return (
    <>
      <TopNavBar />
      <main className="flex-grow w-full max-w-[1200px] mx-auto px-margin-mobile md:px-margin-desktop py-lg pb-[100px] md:pb-lg">
        <header className="mb-lg">
          <h1 className="font-headline-xl text-headline-xl text-on-background mb-xs">{t("title")}</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">{t("orderId", { id: `QB${order.id.toString().padStart(5, '0')}` })}</p>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          {/* Left Column: Details & Timeline */}
          <div className="lg:col-span-5 flex flex-col gap-lg">
            
            {/* Timeline Card */}
            <section className="bg-surface-container-lowest rounded-xl shadow-sm p-lg border border-outline-variant">
              <h2 className="font-title-md text-title-md text-on-surface mb-md">{t("status")}</h2>
              <div className="relative">
                {/* Connecting Line */}
                <div className="absolute left-[15px] rtl:left-auto rtl:right-[15px] top-[24px] bottom-[24px] w-[2px] bg-outline-variant z-0" />
                
                {/* Steps */}
                <div className="flex flex-col gap-xl relative z-10">
                  
                  {/* Step 1: Pending */}
                  <div className={`flex items-start gap-md ${currentStatusIndex < 0 ? 'opacity-50' : ''}`}>
                    <div className={`w-8 h-8 rounded-full ${currentStatusIndex >= 0 ? 'bg-primary text-on-primary' : 'bg-surface-variant text-on-surface-variant border border-outline-variant'} flex items-center justify-center shrink-0 shadow-sm z-10`}>
                      <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                    </div>
                    <div>
                      <h3 className={`font-label-md text-label-md ${currentStatusIndex === 0 ? 'text-primary font-bold' : 'text-on-surface'}`}>{t("orderReceived")}</h3>
                    </div>
                  </div>
                  
                  {/* Step 2: Preparing */}
                  <div className={`flex items-start gap-md ${currentStatusIndex < 1 ? 'opacity-50' : ''}`}>
                    <div className="relative w-8 h-8 shrink-0 flex items-center justify-center z-10">
                      {currentStatusIndex === 1 && <div className="absolute inset-0 rounded-full bg-primary-container pulse-ring" />}
                      <div className={`w-8 h-8 rounded-full ${currentStatusIndex >= 1 ? 'bg-primary-container text-on-primary-container' : 'bg-surface-variant text-on-surface-variant border border-outline-variant'} flex items-center justify-center relative z-10 shadow-sm`}>
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>skillet</span>
                      </div>
                    </div>
                    <div>
                      <h3 className={`font-label-md text-label-md ${currentStatusIndex === 1 ? 'text-primary font-bold' : 'text-on-surface'}`}>{t("preparing")}</h3>
                      {currentStatusIndex === 1 && <p className="font-label-sm text-label-sm text-primary">{t("estCompletion", { mins: 5 })}</p>}
                    </div>
                  </div>

                  {/* Step 3: Delivering / Ready */}
                  <div className={`flex items-start gap-md ${currentStatusIndex < 2 ? 'opacity-50' : ''}`}>
                    <div className={`relative w-8 h-8 shrink-0 flex items-center justify-center z-10`}>
                      {currentStatusIndex === 2 && <div className="absolute inset-0 rounded-full bg-primary-container pulse-ring" />}
                      <div className={`w-8 h-8 rounded-full ${currentStatusIndex >= 2 ? 'bg-primary-container text-on-primary-container' : 'bg-surface-variant text-on-surface-variant border border-outline-variant'} flex items-center justify-center shrink-0 relative z-10`}>
                        <span className="material-symbols-outlined">{order.status === "ready" ? "storefront" : "two_wheeler"}</span>
                      </div>
                    </div>
                    <div>
                      <h3 className={`font-label-md text-label-md ${currentStatusIndex === 2 ? 'text-primary font-bold' : 'text-on-surface'}`}>{order.status === "ready" ? t("ready") : t("onTheWay")}</h3>
                    </div>
                  </div>

                  {/* Step 4: Delivered / Completed */}
                  <div className={`flex items-start gap-md ${currentStatusIndex < 3 ? 'opacity-50' : ''}`}>
                    <div className={`w-8 h-8 rounded-full ${currentStatusIndex >= 3 ? 'bg-primary text-on-primary' : 'bg-surface-variant text-on-surface-variant border border-outline-variant'} flex items-center justify-center shrink-0 z-10`}>
                      <span className="material-symbols-outlined">home</span>
                    </div>
                    <div>
                      <h3 className={`font-label-md text-label-md ${currentStatusIndex === 3 ? 'text-primary font-bold' : 'text-on-surface'}`}>{t("delivered")}</h3>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Order Details Card */}
            <section className="bg-surface-container-lowest rounded-xl shadow-sm p-lg border border-outline-variant">
              <h2 className="font-title-md text-title-md text-on-surface mb-md">{t("orderItems")}</h2>
              <ul className="flex flex-col gap-sm mb-md">
                {order.items.map((item, idx) => (
                  <li key={idx} className="flex justify-between items-center">
                    <span className="font-body-md text-body-md text-on-surface"><span className="font-bold text-primary mr-2 rtl:ml-2 rtl:mr-0">{item.quantity}x</span>{locale === 'ar' ? item.product.name_ar : item.product.name_en}</span>
                    <span className="font-label-md text-label-md text-on-surface-variant">{t("currency")} {item.product.price.toFixed(2)}</span>
                  </li>
                ))}
              </ul>
              <div className="border-t border-outline-variant pt-sm flex justify-between items-center font-bold">
                <span className="font-body-md text-body-md text-on-surface">{t("total")}</span>
                <span className="font-title-md text-title-md text-on-surface">{t("currency")} {order.total_amount.toFixed(2)}</span>
              </div>
            </section>
          </div>

          {/* Right Column: Map & Driver */}
          <div className="lg:col-span-7 flex flex-col gap-lg">
            <div className="relative w-full h-[300px] md:h-[400px] rounded-xl overflow-hidden shadow-sm border border-outline-variant">
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAg8za0BbrQnaXqr-oUF_Jfelhe9icSWE6nmTNyx6IHq3xkcfwhfMgEWQCSO2MXgbYF0RvW3HaklqR1qeT9d_YOOsE3gi3cK1h_fcX2cvUjvsdApskwbIq_fTZxTU6SKzqN7FrGF7EHgNeUTatyQlQ8N53LA-V8O9vqMWtPKmNzP18U9UCkB5VQXUfzdXNSddMrUub7KMy1G5n54RIc3_IzUajm17BFt_iesGRn4tVnvxfu-Oeqo4XULMaOLHDPJOBwtSuxDfaB8fA" className="w-full h-full object-cover" alt="Map" />
              <div className="absolute top-4 right-4 rtl:left-4 rtl:right-auto bg-surface-container-lowest rounded-lg p-sm shadow-md flex items-center gap-xs">
                <span className="material-symbols-outlined text-primary">schedule</span>
                <span className="font-label-md text-label-md text-on-surface">{t("eta", { time: "1:05 PM" })}</span>
              </div>
            </div>

            <section className="bg-surface-container-lowest rounded-xl shadow-sm p-lg border border-outline-variant flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-md">
                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBzH6kDWv92Zj2Zv1p9DjDmyjC47JflLdhFXOCNaLuAJYQMS7_8zH-W4iJRix0vObQOXMo5SnjQLYtfDaV-_Y6UKjN7XAZCQyVBk59la3j4OhbS4As_IkUDSX_XgHg-85Ln2ivO8t0cH4aQ_xecavsJ8YLGGaFN2Jjm8vqeQvKT2v4TZZ_fDCVtHmk0XsFKxTSyMSnlCkmcI9FMvPlBLXK0pw9Ilo7Pja5du8_0hMxRMXdXj6ZGQIUdUgHk-mzQMsJ233nqLw7ODVc" className="w-16 h-16 rounded-full object-cover shadow-sm border-2 border-surface-variant" alt="Driver" />
                <div>
                  <h3 className="font-title-md text-title-md text-on-surface">Ahmed K.</h3>
                  <div className="flex items-center gap-xs text-primary">
                    <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="font-label-md text-label-md">{t("rating", { rating: "4.9" })}</span>
                  </div>
                </div>
              </div>
              <button className="bg-surface-container-lowest border-2 border-secondary text-secondary font-label-md text-label-md px-6 py-3 rounded-lg hover:bg-surface-container-low transition-colors flex items-center gap-2">
                <span className="material-symbols-outlined">call</span>
                {t("callDriver")}
              </button>
            </section>
          </div>
        </div>
      </main>
      <BottomNavBar />
    </>
  );
}
