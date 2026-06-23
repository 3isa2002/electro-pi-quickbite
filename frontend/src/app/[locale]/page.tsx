"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import TopNavBar from "@/components/layout/TopNavBar";
import BottomNavBar from "@/components/layout/BottomNavBar";
import CartDrawer from "@/components/cart/CartDrawer";
import ProductCard, { BackendProduct } from "@/components/product/ProductCard";
import { useCart } from "@/context/CartContext";
import HeroCarousel from "@/components/home/HeroCarousel";

const GridSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg w-full">
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <div key={i} className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col border border-outline-variant/10 animate-pulse h-[350px]">
        <div className="bg-surface-container-high w-full h-[200px]" />
        <div className="p-md flex-grow flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-sm gap-2">
              <div className="h-6 bg-surface-container-high rounded w-2/3" />
              <div className="h-6 bg-surface-container-high rounded w-1/4" />
            </div>
            <div className="h-4 bg-surface-container-high rounded w-full mb-2" />
            <div className="h-4 bg-surface-container-high rounded w-5/6" />
          </div>
          <div className="h-10 bg-surface-container-high rounded w-full mt-auto" />
        </div>
      </div>
    ))}
  </div>
);

const ListSkeleton = () => (
  <div className="flex flex-col gap-lg w-full">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-row items-center border border-outline-variant/10 animate-pulse h-[140px] md:h-[160px] w-full">
        <div className="bg-surface-container-high h-full w-[120px] md:w-[180px] flex-shrink-0" />
        <div className="p-sm md:p-md flex-grow flex flex-col justify-between h-full">
          <div>
            <div className="flex justify-between items-start mb-xs gap-2">
              <div className="h-6 bg-surface-container-high rounded w-1/2" />
              <div className="h-6 bg-surface-container-high rounded w-1/5" />
            </div>
            <div className="h-4 bg-surface-container-high rounded w-full mb-1" />
            <div className="h-4 bg-surface-container-high rounded w-3/4" />
          </div>
          <div className="h-8 bg-surface-container-high rounded w-[140px] mt-auto" />
        </div>
      </div>
    ))}
  </div>
);

export default function Home() {
  const t = useTranslations("Home");
  const locale = useLocale();
  const { isCartOpen } = useCart();
  
  const [products, setProducts] = useState<BackendProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  const [layoutView, setLayoutView] = useState<"grid" | "list">("grid");

  // Debouncing Search Query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  // Fetching Products from live backend
  useEffect(() => {
    let active = true;
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        params.append("is_active", "true");
        if (selectedCategory && selectedCategory !== "All") {
          params.append("category", selectedCategory);
        }
        if (debouncedSearchQuery) {
          params.append("search", debouncedSearchQuery);
        }

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/products?${params.toString()}`);
        if (!res.ok) {
          throw new Error("Failed to fetch products");
        }
        const data = await res.json();
        if (active) {
          setProducts(data);
        }
      } catch (err: any) {
        if (active) {
          setError(err.message || "Failed to communicate with API server");
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    fetchProducts();

    return () => {
      active = false;
    };
  }, [selectedCategory, debouncedSearchQuery]);

  const mainLayoutClasses = isCartOpen 
    ? "md:mr-[320px] md:rtl:mr-auto md:rtl:ml-[320px]" 
    : "md:mx-auto";

  return (
    <>
      <TopNavBar />
      <main className={`max-w-[1200px] w-full mx-auto px-margin-mobile md:px-margin-desktop py-lg pb-[100px] md:pb-lg transition-all duration-300 ${mainLayoutClasses}`}>
        {/* Hero Section */}
        <HeroCarousel />

        {/* Search Bar */}
        <section className="mb-lg">
          <div className="relative w-full md:w-3/4 lg:w-2/3 group">
            <span className="material-symbols-outlined absolute start-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors text-[22px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="w-full ps-12 pe-12 py-3 rounded-full bg-surface-container-low border border-outline-variant/50 focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary/20 outline-none text-on-surface placeholder-on-surface-variant/70 text-body-md transition-all shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute end-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface p-1 rounded-full hover:bg-surface-container-high transition-colors flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
          </div>
        </section>

        {/* Categories */}
        <section className="mb-xl">
          <h2 className="font-title-md text-title-md text-on-background mb-md">{t("categories")}</h2>
          <div className="flex overflow-x-auto gap-sm scrollbar-hide pb-sm">
            {[
              { name: "All",      nameAr: "الكل",       icon: "restaurant" },
              { name: "Burgers",  nameAr: "برجر",        icon: "lunch_dining" },
              { name: "Pizza",    nameAr: "بيتزا",       icon: "local_pizza" },
              { name: "Koshary",  nameAr: "كشري",        icon: "rice_bowl" },
              { name: "Drinks",   nameAr: "مشروبات",     icon: "local_drink" },
              { name: "Desserts", nameAr: "حلويات",      icon: "icecream" }
            ].map((cat) => (
              <button 
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`flex items-center gap-xs px-4 py-2 rounded-full shadow-sm flex-shrink-0 transition-colors cursor-pointer ${selectedCategory === cat.name ? "bg-primary text-on-primary" : "bg-surface-container-high text-on-surface hover:bg-surface-variant"}`}
              >
                <span className="material-symbols-outlined text-[20px]">{cat.icon}</span>
                <span className="font-label-md text-label-md">{cat.name === "All" ? t("categories") : (locale === "ar" ? cat.nameAr : cat.name)}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Product Grid / List */}
        <section>
          <div className="flex justify-between items-center mb-md gap-4">
            <h2 className="font-title-md text-title-md text-on-background">{t("popularMenuItems")}</h2>
            
            {/* Grid/List layout toggle */}
            <div className="flex items-center gap-xs bg-surface-container-high p-1 rounded-full border border-outline-variant/30 shadow-sm">
              <button
                onClick={() => setLayoutView("grid")}
                className={`p-1.5 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer ${
                  layoutView === "grid" 
                    ? "bg-primary text-on-primary shadow-sm" 
                    : "text-on-surface-variant hover:bg-surface-variant/50 hover:text-on-surface"
                }`}
                aria-label="Grid view"
              >
                <span className="material-symbols-outlined text-[20px]">grid_view</span>
              </button>
              <button
                onClick={() => setLayoutView("list")}
                className={`p-1.5 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer ${
                  layoutView === "list" 
                    ? "bg-primary text-on-primary shadow-sm" 
                    : "text-on-surface-variant hover:bg-surface-variant/50 hover:text-on-surface"
                }`}
                aria-label="List view"
              >
                <span className="material-symbols-outlined text-[20px]">view_list</span>
              </button>
            </div>
          </div>

          {isLoading ? (
            layoutView === "grid" ? <GridSkeleton /> : <ListSkeleton />
          ) : error ? (
            <div className="text-center py-xl text-error bg-error-container/10 rounded-xl p-md border border-error/20 max-w-md mx-auto">
              <span className="material-symbols-outlined text-[48px] mb-sm">error</span>
              <p className="font-title-md text-title-md">{error}</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-xl text-on-surface-variant bg-surface-container-low rounded-xl p-md border border-outline-variant/20 max-w-md mx-auto">
              <span className="material-symbols-outlined text-[48px] mb-sm">search_off</span>
              <p className="font-title-md text-title-md">{t("noProductsFound")}</p>
            </div>
          ) : (
            <div className={
              layoutView === "grid" 
                ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-lg" 
                : "flex flex-col gap-lg"
            }>
              {products.map((product) => (
                <ProductCard key={product.id} product={product} view={layoutView} />
              ))}
            </div>
          )}
        </section>
      </main>
      
      <CartDrawer />
      <BottomNavBar />
    </>
  );
}
