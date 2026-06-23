"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";

const images = [
  "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1899&auto=format&fit=crop", // Burger
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=1981&auto=format&fit=crop", // Pizza
  "https://images.unsplash.com/photo-1551024601-bec66cea7040?q=80&w=1964&auto=format&fit=crop"  // Dessert
];

export default function HeroCarousel() {
  const t = useTranslations("Home");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="mb-lg md:mb-xl rounded-xl overflow-hidden relative shadow-sm h-[300px] sm:h-[350px] md:h-[450px] lg:h-[500px]">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="absolute inset-0 bg-cover bg-center w-full h-full"
          style={{ backgroundImage: `url('${images[currentIndex]}')` }}
        />
      </AnimatePresence>

      <div className="absolute inset-0 bg-gradient-to-r rtl:bg-gradient-to-l from-on-background/90 via-on-background/50 to-transparent flex items-center p-6 sm:p-lg md:p-xl">
        <div className="max-w-[280px] sm:max-w-md md:max-w-lg lg:max-w-2xl z-10">
          <AnimatePresence mode="wait">
            <motion.h1 
              key={`title-${currentIndex}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-on-primary mb-4 md:mb-md font-bold leading-tight drop-shadow-md"
            >
              {t("heroTitle")}
            </motion.h1>
          </AnimatePresence>
          <motion.button 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="bg-primary text-on-primary font-label-md text-sm sm:text-base font-bold py-2 px-4 sm:py-3 sm:px-8 rounded-full hover:bg-[#7a4100] transition-colors shadow-lg cursor-pointer inline-block"
          >
            {t("orderNow")}
          </motion.button>
        </div>
      </div>
      
      {/* Indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
        {images.map((_, idx) => (
          <button 
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-2 rounded-full transition-all duration-500 cursor-pointer ${idx === currentIndex ? 'w-8 bg-primary shadow-[0_0_8px_rgba(255,140,0,0.8)]' : 'w-2 bg-surface/60 hover:bg-surface'}`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
