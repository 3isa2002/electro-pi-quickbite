"use client";

import { useTranslations } from "next-intl";
import TopNavBar from "@/components/layout/TopNavBar";
import BottomNavBar from "@/components/layout/BottomNavBar";
import { useState } from "react";

export default function SearchPage() {
  const t = useTranslations("Navigation");
  const [query, setQuery] = useState("");

  return (
    <>
      <TopNavBar />
      <main className="flex-grow w-full max-w-[1200px] mx-auto px-margin-mobile md:px-margin-desktop py-lg pb-[100px] md:pb-lg">
        <h1 className="font-headline-xl text-headline-xl text-on-background mb-md">{t("search")}</h1>
        
        <div className="relative mb-lg">
          <span className="material-symbols-outlined absolute left-4 rtl:left-auto rtl:right-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for dishes, restaurants, etc." 
            className="w-full pl-12 pr-4 rtl:pr-12 rtl:pl-4 py-4 rounded-xl border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors bg-surface-container-lowest text-on-surface font-body-lg text-body-lg shadow-sm"
          />
        </div>

        {!query ? (
          <div>
            <h2 className="font-title-md text-title-md text-on-surface-variant mb-4">Recent Searches</h2>
            <div className="flex flex-wrap gap-2">
              {["Beef Burger", "Pepperoni Pizza", "Koshary", "Orange Juice"].map((term) => (
                <button key={term} onClick={() => setQuery(term)} className="px-4 py-2 rounded-full border border-outline-variant text-on-surface hover:bg-surface-container-low transition-colors font-label-md text-label-md">
                  {term}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-xl text-on-surface-variant font-body-lg text-body-lg">
            No results found for "{query}".
          </div>
        )}
      </main>
      <BottomNavBar />
    </>
  );
}
