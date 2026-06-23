"use client";

import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/routing";
import { Link } from "@/i18n/routing";
import { useCart } from "@/context/CartContext";

export default function BottomNavBar({ isAdmin = false }: { isAdmin?: boolean }) {
  const t = useTranslations(isAdmin ? "Admin" : "Navigation");
  const pathname = usePathname();
  const { items, toggleCart } = useCart();
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  if (isAdmin) {
    return (
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pt-2 pb-[max(env(safe-area-inset-bottom),1rem)] shadow-lg bg-surface dark:bg-on-background border-t border-outline-variant docked full-width">
        <Link href="/admin" className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors scale-110 duration-300 ${pathname === '/admin' ? 'text-secondary dark:text-secondary-fixed-dim bg-secondary-fixed dark:bg-secondary-container rounded-full px-6 py-1' : 'text-on-surface-variant dark:text-outline-variant active:bg-surface-container-high'}`}>
          <span className="material-symbols-outlined">dashboard</span>
          <span className="font-label-sm text-label-sm-mobile mt-1">{t("dashboard")}</span>
        </Link>
        <Link href="#" className="flex flex-col items-center justify-center text-on-surface-variant dark:text-outline-variant active:bg-surface-container-high p-2 rounded-lg transition-colors scale-110 duration-300">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>receipt_long</span>
          <span className="font-label-sm text-label-sm-mobile mt-1 font-bold">{t("orders")}</span>
        </Link>
        <Link href="#" className="flex flex-col items-center justify-center text-on-surface-variant dark:text-outline-variant active:bg-surface-container-high p-2 rounded-lg transition-colors scale-110 duration-300">
          <span className="material-symbols-outlined">restaurant_menu</span>
          <span className="font-label-sm text-label-sm-mobile mt-1">{t("menuManagement")}</span>
        </Link>
        <Link href="#" className="flex flex-col items-center justify-center text-on-surface-variant dark:text-outline-variant active:bg-surface-container-high p-2 rounded-lg transition-colors scale-110 duration-300">
          <span className="material-symbols-outlined">group</span>
          <span className="font-label-sm text-label-sm-mobile mt-1">{t("customers")}</span>
        </Link>
      </nav>
    );
  }

  return (
    <nav className="md:hidden shadow-lg bg-surface dark:bg-on-background border-t border-outline-variant docked full-width bottom-0 fixed w-full z-50 flex justify-around items-center px-4 pt-2 pb-[max(env(safe-area-inset-bottom),1rem)]">
      <Link href="/" className={`flex flex-col items-center justify-center scale-110 duration-300 px-6 py-1 ${pathname === '/' ? 'text-secondary dark:text-secondary-fixed-dim bg-secondary-fixed dark:bg-secondary-container rounded-full active:bg-surface-container-high' : 'text-on-surface-variant dark:text-outline-variant active:bg-surface-container-high'}`}>
        <span className="material-symbols-outlined">home</span>
        <span className="font-label-sm text-label-sm-mobile">{t("menu")}</span>
      </Link>
      <Link href="/track-order" className={`flex flex-col items-center justify-center scale-110 duration-300 px-6 py-1 ${pathname === '/track-order' ? 'text-secondary dark:text-secondary-fixed-dim bg-secondary-fixed dark:bg-secondary-container rounded-full' : 'text-on-surface-variant dark:text-outline-variant active:bg-surface-container-high'}`}>
        <span className="material-symbols-outlined">local_shipping</span>
        <span className="font-label-sm text-label-sm-mobile">{t("orders")}</span>
      </Link>
      <button onClick={toggleCart} className="flex flex-col items-center justify-center text-on-surface-variant dark:text-outline-variant active:bg-surface-container-high scale-110 duration-300 px-6 py-1 relative">
        <span className="material-symbols-outlined">shopping_bag</span>
        <span className="font-label-sm text-label-sm-mobile">{t("cart")}</span>
        {cartCount > 0 && (
          <span className="absolute top-0 right-4 rtl:right-auto rtl:left-4 bg-secondary text-on-secondary text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{cartCount}</span>
        )}
      </button>
      <Link href="/profile" className={`flex flex-col items-center justify-center scale-110 duration-300 px-6 py-1 ${pathname === '/profile' ? 'text-secondary dark:text-secondary-fixed-dim bg-secondary-fixed dark:bg-secondary-container rounded-full' : 'text-on-surface-variant dark:text-outline-variant active:bg-surface-container-high'}`}>
        <span className="material-symbols-outlined">person</span>
        <span className="font-label-sm text-label-sm-mobile">{t("profile")}</span>
      </Link>
    </nav>
  );
}
