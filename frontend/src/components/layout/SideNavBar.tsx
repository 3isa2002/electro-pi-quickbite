"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { useAuth } from "@/context/AuthContext";

export default function SideNavBar({ isOpen = false, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  const t = useTranslations("Admin");
  const pathname = usePathname();
  const { logout } = useAuth();
  // Force Turbopack to rebuild the component and clear stale cache

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-on-background/20 z-40 transition-opacity md:hidden"
          onClick={onClose}
        />
      )}
      <nav className={`bg-surface-container-low dark:bg-inverse-surface shadow-md h-[100dvh] w-64 fixed left-0 rtl:left-auto rtl:right-0 top-0 flex flex-col border-r rtl:border-r-0 rtl:border-l border-outline-variant dark:border-outline z-50 transform transition-transform duration-300 md:translate-x-0 rtl:md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full rtl:translate-x-full"}`}>
      {/* Header */}
      <div className="p-6 border-b border-outline-variant dark:border-outline">
        <div className="flex items-center gap-4">
          <img alt="Admin Avatar" className="w-12 h-12 rounded-full object-cover border-2 border-primary-container" src="https://lh3.googleusercontent.com/aida-public/AB6AXuChu1Aqkv53Gke_Ulcgoo1YEKEGLXn9JGrqAMCmlSCUsE2lYvUF0_MrU23LRXz2i_jOauQzMgkk9VdJwLidspLapE3uKjt05rmk4CP1PGu0R8JEZeAAfMAu88Utkon9bR53mlqTGBL09rycfu1_8yX7tfXsOLmo7SfSyZdKre1XrAKGXIPDgbFPOopMrteIpQFMjxkQpsdn4Wfn5ZbMw3Xo2vqCcW_5HU_Z-9J3XACCkoyx6pjlHdY_iHnr-gALLIeFS7QKYVRA9ls" />
          <div>
            <h2 className="font-title-md text-title-md text-primary dark:text-primary-fixed">{t("title")}</h2>
            <p className="font-label-sm text-label-sm text-on-surface-variant">{t("subtitle")}</p>
          </div>
        </div>
      </div>
      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-2">
          {[
            { href: "/admin/dashboard", icon: "dashboard", label: t("dashboard") },
            { href: "/admin", icon: "receipt_long", label: t("orders") },
            { href: "/admin/menu", icon: "restaurant_menu", label: t("menuManagement") },
            { href: "/admin/customers", icon: "group", label: t("customers") },
          ].map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={
                    isActive
                      ? "bg-primary-container text-on-primary-container rounded-lg font-bold flex items-center px-4 py-3 mx-2"
                      : "text-on-surface-variant dark:text-outline-variant flex items-center px-4 py-3 mx-2 hover:bg-surface-container-high dark:hover:bg-surface-variant transition-all rounded-lg"
                  }
                >
                  <span
                    className="material-symbols-outlined mr-3 rtl:ml-3 rtl:mr-0"
                    style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                  >
                    {item.icon}
                  </span>
                  <span className="font-label-md text-label-md">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="px-4 mt-6">
          <button className="w-full bg-primary text-on-primary hover:bg-[#804500] font-label-md text-label-md py-3 rounded-lg flex justify-center items-center gap-2 transition-colors shadow-sm">
            <span className="material-symbols-outlined">add</span>
            {t("addNewProduct")}
          </button>
        </div>
      </div>
      {/* Footer Links */}
      <div className="p-4 border-t border-outline-variant dark:border-outline">
        <ul className="space-y-2">
          <li>
            <Link href="#" className="text-on-surface-variant dark:text-outline-variant flex items-center px-4 py-3 mx-2 hover:bg-surface-container-high dark:hover:bg-surface-variant transition-all rounded-lg">
              <span className="material-symbols-outlined mr-3 rtl:ml-3 rtl:mr-0">settings</span>
              <span className="font-label-md text-label-md">{t("settings")}</span>
            </Link>
          </li>
          <li>
            <button 
              onClick={logout} 
              className="w-full text-left rtl:text-right text-on-surface-variant dark:text-outline-variant flex items-center px-4 py-3 mx-2 hover:bg-surface-container-high dark:hover:bg-surface-variant transition-all rounded-lg text-error cursor-pointer border-0 outline-none bg-transparent"
            >
              <span className="material-symbols-outlined mr-3 rtl:ml-3 rtl:mr-0 text-error">logout</span>
              <span className="font-label-md text-label-md">{t("logout")}</span>
            </button>
          </li>
        </ul>
      </div>
    </nav>
    </>
  );
}
