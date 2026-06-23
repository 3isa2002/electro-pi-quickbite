"use client";

import TopNavBar from "@/components/layout/TopNavBar";
import SideNavBar from "@/components/layout/SideNavBar";
import AdminProtectedRoute from "@/components/auth/AdminProtectedRoute";
import { useState } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <AdminProtectedRoute>
      <div className="flex bg-surface-bright min-h-screen">
      <SideNavBar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className="flex-1 md:ml-64 rtl:md:ml-0 rtl:md:mr-64 flex flex-col min-w-0">
        <TopNavBar variant="admin" onMenuClick={() => setIsSidebarOpen(true)} />
        
        <main className="p-margin-mobile md:p-margin-desktop pb-[100px] md:pb-margin-desktop flex-1">
          {children}
        </main>
      </div>
      </div>
    </AdminProtectedRoute>
  );
}
