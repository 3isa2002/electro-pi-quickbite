"use client";

import { useTranslations } from "next-intl";
import TopNavBar from "@/components/layout/TopNavBar";
import BottomNavBar from "@/components/layout/BottomNavBar";

export default function ProfilePage() {
  const t = useTranslations("Navigation");

  return (
    <>
      <TopNavBar />
      <main className="flex-grow w-full max-w-[800px] mx-auto px-margin-mobile md:px-margin-desktop py-lg pb-[100px] md:pb-lg">
        <h1 className="font-headline-xl text-headline-xl text-on-background mb-lg">{t("profile")}</h1>
        
        {/* User Info Card */}
        <section className="bg-surface-container-lowest rounded-xl shadow-sm p-lg border border-outline-variant mb-lg flex items-center gap-md">
          <div className="w-20 h-20 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-headline-lg text-headline-lg shrink-0">
            JD
          </div>
          <div>
            <h2 className="font-title-md text-title-md text-on-surface mb-1">John Doe</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mb-1">+1 (555) 000-0000</p>
            <p className="font-label-sm text-label-sm text-primary font-bold">Gold Member</p>
          </div>
        </section>

        {/* Settings Links */}
        <section className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant overflow-hidden">
          <ul className="divide-y divide-outline-variant">
            <li>
              <button className="w-full px-lg py-4 flex items-center justify-between hover:bg-surface-container-low transition-colors">
                <div className="flex items-center gap-3 text-on-surface">
                  <span className="material-symbols-outlined">receipt_long</span>
                  <span className="font-label-md text-label-md">Order History</span>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant rtl:rotate-180">chevron_right</span>
              </button>
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
              <button className="w-full px-lg py-4 flex items-center justify-between hover:bg-surface-container-low transition-colors">
                <div className="flex items-center gap-3 text-on-surface">
                  <span className="material-symbols-outlined">payment</span>
                  <span className="font-label-md text-label-md">Payment Methods</span>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant rtl:rotate-180">chevron_right</span>
              </button>
            </li>
            <li>
              <button className="w-full px-lg py-4 flex items-center justify-between hover:bg-surface-container-low transition-colors text-error">
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
