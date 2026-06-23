"use client";

import { useTranslations } from "next-intl";
import TopNavBar from "@/components/layout/TopNavBar";
import { useState, useEffect } from "react";
import { useRouter } from "@/i18n/routing";
import { getToken } from "@/utils/auth";
import { useCart } from "@/context/CartContext";

export default function Checkout() {
  const t = useTranslations("Checkout");
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  
  const [user, setUser] = useState<any>(null);
  const [useDifferentAddress, setUseDifferentAddress] = useState(false);
  const [customAddress, setCustomAddress] = useState("");
  const [customPhone, setCustomPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Online");

  useEffect(() => {
    const fetchUser = async () => {
      const token = getToken();
      if (!token) {
        router.push("/login?redirect=/checkout");
        return;
      }
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else {
          router.push("/login?redirect=/checkout");
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchUser();
  }, [router]);

  const handlePlaceOrder = async () => {
    const token = getToken();
    const finalAddress = useDifferentAddress ? customAddress : user?.address;
    const finalPhone = useDifferentAddress ? customPhone : user?.phone;
    
    if (!finalAddress || !finalPhone) {
      alert(t("provideShippingDetails"));
      return;
    }

    const payload = {
      payment_method: paymentMethod,
      shipping_address: finalAddress,
      shipping_phone: finalPhone,
      items: items.map(i => ({ product_id: parseInt(i.id), quantity: i.quantity }))
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/orders/`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        clearCart();
        router.push("/track-order");
      } else {
        const err = await res.json();
        alert("Failed to place order: " + (err.detail || "Error"));
      }
    } catch (e) {
      alert("An error occurred");
    }
  };

  if (!user) return <div className="p-xl text-center">Loading...</div>;

  return (
    <>
      <TopNavBar variant="checkout" />
      <main className="flex-grow w-full max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-lg pb-[100px] md:pb-lg">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg lg:gap-xl">
          {/* Left Column: Forms */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-lg">
            
            {/* Address Section */}
            <section className="bg-surface-container-lowest shadow-sm rounded-xl p-lg md:p-xl border border-surface-container-high">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
                </div>
                <h2 className="font-title-md text-title-md text-on-surface">{t("deliveryDetails")}</h2>
              </div>
              
              <div className="flex flex-col gap-4">
                <div className="bg-surface-container-low p-md rounded-xl border border-outline-variant">
                  <p className="font-title-md text-title-md text-on-surface mb-1">{user.name}</p>
                  <p className="font-body-md text-body-md text-on-surface-variant flex items-center gap-2 mb-1">
                    <span className="material-symbols-outlined text-[18px]">call</span>
                    {user.phone || "No phone saved"}
                  </p>
                  <p className="font-body-md text-body-md text-on-surface-variant flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">home</span>
                    {user.address || "No address saved"}
                  </p>
                </div>

                <label className="flex items-center gap-3 cursor-pointer mt-2">
                  <input 
                    type="checkbox" 
                    checked={useDifferentAddress}
                    onChange={(e) => setUseDifferentAddress(e.target.checked)}
                    className="w-5 h-5 text-primary border-outline-variant focus:ring-primary accent-primary rounded" 
                  />
                  <span className="font-body-md text-body-md text-on-surface">{t("differentAddress")}</span>
                </label>

                {useDifferentAddress && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 p-md bg-surface-container-low rounded-xl border border-outline-variant">
                    <div className="flex flex-col gap-1 md:col-span-2">
                      <label className="font-label-md text-label-md text-on-surface-variant">{t("newAddress")}</label>
                      <input 
                        type="text" 
                        value={customAddress}
                        onChange={(e) => setCustomAddress(e.target.value)}
                        placeholder={t("newAddressPlaceholder")}
                        className="w-full px-4 py-3 rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors bg-surface-container-lowest text-on-surface font-body-md text-body-md" 
                      />
                    </div>
                    <div className="flex flex-col gap-1 md:col-span-2">
                      <label className="font-label-md text-label-md text-on-surface-variant">{t("newPhone")}</label>
                      <input 
                        type="tel" 
                        value={customPhone}
                        onChange={(e) => setCustomPhone(e.target.value)}
                        placeholder={t("newPhonePlaceholder")}
                        className="w-full px-4 py-3 rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors bg-surface-container-lowest text-on-surface font-body-md text-body-md" 
                      />
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Payment Section */}
            <section className="bg-surface-container-lowest shadow-sm rounded-xl p-lg md:p-xl border border-surface-container-high">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>payment</span>
                </div>
                <h2 className="font-title-md text-title-md text-on-surface">{t("paymentMethod")}</h2>
              </div>
              <div className="flex flex-col gap-4">
                
                {/* Card Option */}
                <label className={`flex items-center p-4 border-2 ${paymentMethod === 'Online' ? 'border-primary bg-primary-fixed/10' : 'border-outline-variant hover:border-primary/50'} rounded-xl cursor-pointer transition-colors relative overflow-hidden`}>
                  <input type="radio" name="payment" checked={paymentMethod === 'Online'} onChange={() => setPaymentMethod('Online')} className="w-5 h-5 text-primary border-outline-variant focus:ring-primary accent-primary mr-4 rtl:ml-4 rtl:mr-0" />
                  <div className="flex-grow flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary">credit_card</span>
                      <span className="font-body-md text-body-md font-semibold text-on-surface">{t("creditCard")}</span>
                    </div>
                    <div className="flex gap-2">
                      <div className="w-8 h-5 bg-surface-container-highest rounded flex items-center justify-center text-[8px] font-bold">VISA</div>
                      <div className="w-8 h-5 bg-surface-container-highest rounded flex items-center justify-center text-[8px] font-bold">MC</div>
                    </div>
                  </div>
                </label>

                {/* Card Mockup */}
                {paymentMethod === 'Online' && (
                <div className="ml-9 rtl:mr-9 rtl:ml-0 pl-2 rtl:pr-2 rtl:pl-0 border-l-2 rtl:border-r-2 rtl:border-l-0 border-surface-container-high py-2 flex flex-col gap-3">
                  <input type="text" placeholder={t("cardNumber")} className="w-full px-4 py-3 rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors bg-surface-container-lowest text-on-surface font-body-md text-body-md" />
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" placeholder={t("cardExpiry")} className="w-full px-4 py-3 rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors bg-surface-container-lowest text-on-surface font-body-md text-body-md" />
                    <input type="text" placeholder={t("cardCvc")} className="w-full px-4 py-3 rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors bg-surface-container-lowest text-on-surface font-body-md text-body-md" />
                  </div>
                </div>
                )}

                {/* Cash Option */}
                <label className={`flex items-center p-4 border ${paymentMethod === 'COD' ? 'border-primary bg-primary-fixed/10' : 'border-outline-variant hover:border-primary/50'} rounded-xl cursor-pointer transition-colors`}>
                  <input type="radio" name="payment" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} className="w-5 h-5 text-primary border-outline-variant focus:ring-primary accent-primary mr-4 rtl:ml-4 rtl:mr-0" />
                  <div className="flex-grow flex items-center gap-3">
                    <span className="material-symbols-outlined text-on-surface-variant">payments</span>
                    <span className="font-body-md text-body-md text-on-surface">{t("cashOnDelivery")}</span>
                  </div>
                </label>
              </div>
            </section>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="bg-surface-container-lowest shadow-sm rounded-xl p-lg md:p-xl border border-surface-container-high sticky top-24 flex flex-col h-[calc(100vh-8rem)] max-h-[800px]">
              <h2 className="font-title-md text-title-md text-on-surface mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined">receipt_long</span>
                {t("orderSummary")}
              </h2>
              
              <div className="flex-grow overflow-y-auto pr-2 rtl:pl-2 rtl:pr-0 flex flex-col gap-4 mb-6 custom-scrollbar">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 items-start">
                    <img src={item.image} className="w-16 h-16 object-cover rounded-lg shadow-sm shrink-0" alt={item.name} />
                    <div className="flex-grow">
                      <div className="flex justify-between items-start">
                        <h3 className="font-body-md text-body-md font-semibold text-on-surface line-clamp-2">{item.name}</h3>
                        <span className="font-body-md text-body-md font-bold text-on-surface shrink-0 ml-2 rtl:mr-2 rtl:ml-0">EGP {item.price * item.quantity}</span>
                      </div>
                      <div className="mt-2 text-primary font-label-md text-label-md">{t("qty")}: {item.quantity}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-outline-variant pt-4 flex flex-col gap-2 mb-6">
                <div className="flex justify-between items-center font-body-md text-body-md text-on-surface-variant">
                  <span>{t("subtotal")}</span>
                  <span>EGP {subtotal}</span>
                </div>
                <div className="flex justify-between items-center font-body-md text-body-md text-on-surface-variant">
                  <span>{t("deliveryFee")}</span>
                  <span>EGP 3.50</span>
                </div>
                <div className="flex justify-between items-center font-body-md text-body-md text-on-surface-variant">
                  <span>{t("taxes")}</span>
                  <span>EGP {(subtotal * 0.14).toFixed(2)}</span>
                </div>
              </div>

              <div className="border-t border-outline-variant pt-4 mb-6">
                <div className="flex justify-between items-end">
                  <span className="font-title-md text-title-md text-on-surface">{t("total")}</span>
                  <span className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg font-bold text-primary">EGP {(subtotal + 3.50 + subtotal * 0.14).toFixed(2)}</span>
                </div>
              </div>

              <button onClick={handlePlaceOrder} className="w-full bg-primary hover:bg-primary/90 text-on-primary font-title-md text-title-md py-4 rounded-xl shadow-sm transition-all duration-150 flex items-center justify-center gap-2 scale-95 active:scale-90">
                <span>{t("placeOrder")}</span>
                <span className="material-symbols-outlined rtl:rotate-180">arrow_forward</span>
              </button>
              <p className="text-center font-label-sm text-label-sm text-on-surface-variant mt-4">
                {t("terms")}
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
