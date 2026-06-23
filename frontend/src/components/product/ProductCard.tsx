"use client";

import { useTranslations } from "next-intl";
import { useCart } from "@/context/CartContext";
import { useParams } from "next/navigation";

export type BackendProduct = {
  id: number;
  name_en: string;
  name_ar: string;
  description_en: string;
  description_ar: string;
  price: number;
  image_url: string;
  category: string;
};

export default function ProductCard({ 
  product, 
  view = "grid" 
}: { 
  product: BackendProduct; 
  view?: "grid" | "list"; 
}) {
  const t = useTranslations("Home");
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const { addToCart, items, updateQuantity } = useCart();
  
  const productIdStr = product.id.toString();
  const cartItem = items.find((i) => i.id === productIdStr);

  const name = locale === "ar" ? product.name_ar : product.name_en;
  const description = locale === "ar" ? product.description_ar : product.description_en;

  const handleAddToCart = () => {
    addToCart({
      id: productIdStr,
      name,
      price: product.price,
      quantity: 1,
      image: product.image_url
    });
  };

  if (view === "list") {
    return (
      <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-row transition-all duration-300 hover:shadow-md h-[140px] md:h-[160px] w-full items-center border border-outline-variant/10">
        <div 
          className="bg-cover bg-center h-full w-[120px] md:w-[180px] flex-shrink-0" 
          style={{ backgroundImage: `url('${product.image_url}')` }} 
        />
        <div className="p-sm md:p-md flex-grow flex flex-col justify-between h-full min-w-0">
          <div>
            <div className="flex justify-between items-start mb-xs gap-2">
              <h3 className="font-title-md text-title-md text-on-background line-clamp-1 font-bold">{name}</h3>
              <span className="font-label-md text-label-md text-primary font-bold flex-shrink-0 whitespace-nowrap">
                {t("currency")} {product.price}
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2 text-xs md:text-sm">
              {description}
            </p>
          </div>
          <div className="w-full mt-auto">
            {cartItem ? (
              <div className="flex items-center justify-between w-full max-w-[140px] bg-surface-container-high py-1 px-2 rounded-lg border border-outline-variant">
                <button 
                  onClick={() => updateQuantity(cartItem.id, cartItem.quantity - 1)}
                  className="w-7 h-7 rounded-full bg-surface-container-lowest flex items-center justify-center text-primary hover:bg-surface-variant transition-colors shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">remove</span>
                </button>
                <span className="font-title-md text-title-md w-6 text-center text-primary text-sm">{cartItem.quantity}</span>
                <button 
                  onClick={() => updateQuantity(cartItem.id, cartItem.quantity + 1)}
                  className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-on-primary hover:bg-[#7a4100] transition-colors shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                </button>
              </div>
            ) : (
              <button 
                onClick={handleAddToCart}
                className="w-full max-w-[140px] bg-surface-container-high text-primary font-label-md text-label-md font-bold py-1.5 px-3 rounded-lg flex items-center justify-center gap-xs hover:bg-primary hover:text-on-primary transition-colors border border-outline-variant text-xs md:text-sm"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                {t("addToCart")}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-md border border-outline-variant/10">
      <div className="bg-cover bg-center w-full h-[140px] sm:h-[180px] md:h-[200px]" style={{ backgroundImage: `url('${product.image_url}')` }} />
      <div className="p-3 md:p-md flex-grow flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-sm gap-1 sm:gap-2 flex-col sm:flex-row">
            <h3 className="text-sm sm:text-base md:font-title-md md:text-title-md text-on-background line-clamp-1 font-bold">{name}</h3>
            <span className="text-xs sm:text-sm md:font-label-md md:text-label-md text-primary font-bold flex-shrink-0 whitespace-nowrap">{t("currency")} {product.price}</span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant mb-md text-xs sm:text-sm line-clamp-2">
            {description}
          </p>
        </div>
        <div className="w-full mt-auto">
          {cartItem ? (
            <div className="flex items-center justify-between w-full bg-surface-container-high py-1 px-2 rounded-lg border border-outline-variant">
              <button 
                onClick={() => updateQuantity(cartItem.id, cartItem.quantity - 1)}
                className="w-8 h-8 rounded-full bg-surface-container-lowest flex items-center justify-center text-primary hover:bg-surface-variant transition-colors shadow-sm"
              >
                <span className="material-symbols-outlined text-[20px]">remove</span>
              </button>
              <span className="font-title-md text-title-md w-8 text-center text-primary">{cartItem.quantity}</span>
              <button 
                onClick={() => updateQuantity(cartItem.id, cartItem.quantity + 1)}
                className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary hover:bg-[#7a4100] transition-colors shadow-sm"
              >
                <span className="material-symbols-outlined text-[20px]">add</span>
              </button>
            </div>
          ) : (
            <button 
              onClick={handleAddToCart}
              className="w-full bg-surface-container-high text-primary font-label-md text-label-md font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-xs hover:bg-primary hover:text-on-primary transition-colors border border-outline-variant"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              {t("addToCart")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
