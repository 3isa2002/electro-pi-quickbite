"use client";

import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { useParams } from "next/navigation";
import { Link } from "@/i18n/routing";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useState, useRef, useEffect } from "react";
import CartDrawer from "@/components/cart/CartDrawer";

export default function TopNavBar({ variant = "default", onMenuClick }: { variant?: "default" | "checkout" | "track-order" | "admin", onMenuClick?: () => void }) {
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const t = useTranslations("Navigation");
  const params = useParams();
  const locale = params.locale as string;
  const router = useRouter();
  const pathname = usePathname();
  const { toggleCart, items } = useCart();
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const toggleLanguage = () => {
    const nextLocale = locale === "en" ? "ar" : "en";
    router.replace(pathname, { locale: nextLocale });
  };

  if (variant === "checkout") {
    return (
      <header className="bg-surface dark:bg-on-background shadow-sm docked full-width top-0 sticky flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop py-4 z-50">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 rounded-full hover:bg-surface-container-low transition-colors text-on-surface-variant flex items-center justify-center scale-95 active:scale-90 duration-150">
            <span className="material-symbols-outlined rtl:rotate-180" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>arrow_back</span>
          </Link>
          <div className="font-headline-lg text-headline-lg font-bold text-primary dark:text-primary-fixed">{t("brand")}</div>
        </div>
        <div className="font-title-md text-title-md text-on-surface">Secure Checkout</div>
      </header>
    );
  }

  if (variant === "admin") {
     return (
       <header className="md:hidden bg-surface dark:bg-on-background shadow-sm w-full top-0 sticky flex justify-between items-center px-margin-mobile py-4 z-50">
         <div className="flex items-center gap-3">
           <button onClick={onMenuClick} className="text-on-surface">
             <span className="material-symbols-outlined">menu</span>
           </button>
           <span className="font-headline-lg-mobile text-headline-lg-mobile font-bold text-primary dark:text-primary-fixed">{t("brand")}</span>
         </div>
         <div className="flex items-center gap-4">
           <button className="text-on-surface hover:bg-surface-container-low p-2 rounded-full transition-colors">
             <span className="material-symbols-outlined">search</span>
           </button>
           <img alt="Admin Avatar" className="w-8 h-8 rounded-full object-cover border border-outline-variant" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDaD31MlpfI7yMicbJNmJ17_sfa06wLxwjoEIZa_gZazYA8FuOdJiBfBU3h916q2Q_whOPsY3MaPLuo-xtNwl6-gKGQWDSbjgbmjKYs4K9oi63Aby4cwLXwXe5oNlGVqy0psgIOKkGvS4IClfaou59atyudsDXI8U5GIRIDpusWwZCZlrC-WYAJgS4COZ8U6nzbNF55uqqCF2xdYuEDa-Ktjcg16BlM1c3LOzhh9hLRqokxp3GM545JB9oDLPV6KJnFxf0XBrgRAfk" />
         </div>
       </header>
     )
  }

  return (
    <>
      <header className="shadow-sm bg-surface dark:bg-on-background docked full-width top-0 sticky flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop py-4 z-50">
        <div className="flex items-center gap-xl">
          <Link href="/" className="font-headline-lg text-headline-lg font-bold text-primary dark:text-primary-fixed">
            {t("brand")}
          </Link>
          <nav className="hidden md:flex gap-lg">
            <Link href="/" className={`${pathname === '/' ? 'text-secondary dark:text-secondary-fixed-dim font-bold border-b-2 border-secondary pb-1' : 'text-on-surface-variant dark:text-outline-variant hover:text-primary transition-colors hover:bg-surface-container-low dark:hover:bg-surface-container-highest px-2 py-1 rounded'}`}>
              {t("menu")}
            </Link>
            <Link href="/track-order" className={`${pathname === '/track-order' ? 'text-secondary dark:text-secondary-fixed-dim font-bold border-b-2 border-secondary pb-1' : 'text-on-surface-variant dark:text-outline-variant hover:text-primary transition-colors hover:bg-surface-container-low dark:hover:bg-surface-container-highest px-2 py-1 rounded'}`}>
              {t("trackOrder")}
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-md">
          <button onClick={toggleLanguage} className="font-label-md text-label-md text-on-surface-variant hover:text-primary px-2 transition-colors">
            {locale === "en" ? "AR" : "EN"}
          </button>
          <div onClick={toggleCart} className="relative scale-95 active:scale-90 transition-transform duration-150 cursor-pointer">
            <span className="material-symbols-outlined text-[24px] text-on-surface">shopping_cart</span>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 rtl:right-auto rtl:-left-1 bg-secondary text-on-secondary text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </div>
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="scale-95 active:scale-90 transition-transform duration-150 text-on-surface flex items-center"
            >
              <span className="material-symbols-outlined text-[24px]">account_circle</span>
            </button>
            
            {isDropdownOpen && (
              <div className="absolute right-0 rtl:right-auto rtl:left-0 top-full mt-2 w-48 bg-surface-container-lowest shadow-lg rounded-xl py-2 border border-outline-variant/30 z-50">
                {user ? (
                  <>
                    <div className="px-4 py-2 border-b border-outline-variant/30">
                      <p className="font-label-md text-label-md font-bold text-on-surface truncate">{user.name}</p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant truncate">{user.email}</p>
                    </div>
                    {user.role === 'admin' && (
                      <Link href="/admin" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 text-on-surface hover:bg-surface-container-low transition-colors font-label-md text-label-md">
                        <span className="material-symbols-outlined text-sm">admin_panel_settings</span>
                        {t("adminDashboard")}
                      </Link>
                    )}
                    <Link href="/profile" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 text-on-surface hover:bg-surface-container-low transition-colors font-label-md text-label-md">
                      <span className="material-symbols-outlined text-sm">person</span>
                      {t("profile")}
                    </Link>
                    <button onClick={() => { logout(); setIsDropdownOpen(false); }} className="w-full flex items-center gap-2 px-4 py-2 text-error hover:bg-error-container/10 transition-colors font-label-md text-label-md text-left rtl:text-right">
                      <span className="material-symbols-outlined text-sm">logout</span>
                      {t("logout")}
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 text-on-surface hover:bg-surface-container-low transition-colors font-label-md text-label-md">
                      <span className="material-symbols-outlined text-sm">login</span>
                      {t("signIn")}
                    </Link>
                    <Link href="/register" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 text-on-surface hover:bg-surface-container-low transition-colors font-label-md text-label-md">
                      <span className="material-symbols-outlined text-sm">person_add</span>
                      {t("createAccount")}
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </header>
      <CartDrawer />
    </>
  );
}
