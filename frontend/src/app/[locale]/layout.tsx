import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Cairo } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import "../globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-primary",
  subsets: ["latin"],
});

const cairo = Cairo({
  variable: "--font-primary",
  subsets: ["arabic", "latin"],
});

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Home" });

  return {
    title: t("title"),
    description: "QuickBite Online Food Ordering",
  };
}

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  // Set direction and primary font based on locale
  const dir = locale === "ar" ? "rtl" : "ltr";
  const fontClass = locale === "ar" ? cairo.variable : plusJakartaSans.variable;

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className={`${fontClass} antialiased bg-background text-on-background min-h-screen flex flex-col font-body-md`} suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            <CartProvider>
              {children}
            </CartProvider>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
