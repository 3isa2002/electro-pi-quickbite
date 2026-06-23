"use client";

import { useState } from "react";
import { Link, useRouter } from "@/i18n/routing";
import TopNavBar from "@/components/layout/TopNavBar";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: ""
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.detail || "Registration failed");
      }
      
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get("redirect") || "/checkout";
      router.push(`/login?redirect=${redirect}`);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({...prev, [e.target.name]: e.target.value}));
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface dark:bg-background">
      <TopNavBar />
      <main className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-[500px] bg-surface-container-lowest dark:bg-surface-container shadow-2xl rounded-3xl p-8 md:p-10 border border-outline-variant/50 dark:border-outline/50 relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute top-0 left-0 -ml-16 -mt-16 w-32 h-32 rounded-full bg-secondary/10 blur-2xl"></div>
          <div className="absolute bottom-0 right-0 -mr-16 -mb-16 w-32 h-32 rounded-full bg-primary/10 blur-2xl"></div>
          
          <div className="relative z-10">
            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 bg-secondary/10 text-secondary rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                <span className="material-symbols-outlined text-3xl">person_add</span>
              </div>
              <h1 className="font-headline-md text-headline-md font-bold text-on-surface mb-2">Create Account</h1>
              <p className="text-on-surface-variant font-body-md text-body-md">Join QuickBite and start ordering.</p>
            </div>
            
            {error && <div className="mb-6 p-4 rounded-xl bg-error-container text-on-error-container text-sm text-center font-medium">{error}</div>}
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-label-md text-label-md font-medium text-on-surface mb-1.5">Full Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all bg-surface dark:bg-surface-container-high text-on-surface" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block font-label-md text-label-md font-medium text-on-surface mb-1.5">Phone Number</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all bg-surface dark:bg-surface-container-high text-on-surface" placeholder="+1 (555) 000-0000" />
                </div>
              </div>
              
              <div>
                <label className="block font-label-md text-label-md font-medium text-on-surface mb-1.5">Email Address</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant material-symbols-outlined rtl:right-4 rtl:left-auto text-xl">mail</span>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full pl-12 pr-4 rtl:pr-12 rtl:pl-4 py-3 rounded-xl border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all bg-surface dark:bg-surface-container-high text-on-surface" placeholder="name@example.com" />
                </div>
              </div>
              
              <div>
                <label className="block font-label-md text-label-md font-medium text-on-surface mb-1.5">Password</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant material-symbols-outlined rtl:right-4 rtl:left-auto text-xl">lock</span>
                  <input type="password" name="password" value={formData.password} onChange={handleChange} required className="w-full pl-12 pr-4 rtl:pr-12 rtl:pl-4 py-3 rounded-xl border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all bg-surface dark:bg-surface-container-high text-on-surface" placeholder="••••••••" />
                </div>
              </div>
              
              <div>
                <label className="block font-label-md text-label-md font-medium text-on-surface mb-1.5">Default Address</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant material-symbols-outlined rtl:right-4 rtl:left-auto text-xl">location_on</span>
                  <input type="text" name="address" value={formData.address} onChange={handleChange} required className="w-full pl-12 pr-4 rtl:pr-12 rtl:pl-4 py-3 rounded-xl border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all bg-surface dark:bg-surface-container-high text-on-surface" placeholder="123 Main St, City" />
                </div>
              </div>
              
              <button type="submit" className="w-full bg-secondary text-on-secondary font-label-lg text-label-lg font-bold py-4 rounded-xl hover:bg-secondary/90 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 mt-4 flex items-center justify-center gap-2">
                <span>Create Account</span>
                <span className="material-symbols-outlined rtl:rotate-180 text-xl">arrow_forward</span>
              </button>
            </form>
            
            <div className="mt-8 pt-6 border-t border-outline-variant/30 text-center">
              <p className="text-on-surface-variant font-body-md text-body-md">
                Already have an account? <Link href="/login" className="text-secondary font-bold hover:underline underline-offset-4 transition-all ml-1 rtl:mr-1">Log in</Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
