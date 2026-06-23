"use client";

import { useTranslations, useLocale } from "next-intl";
import { useEffect, useState } from "react";
import { getToken } from "@/utils/auth";
import { useRouter, usePathname } from "@/i18n/routing";
import { motion, AnimatePresence } from "framer-motion";
import OrderDetailsModal from "@/components/admin/OrderDetailsModal";

type User = {
  id: number;
  name: string;
  email: string;
  phone: string;
};

type OrderItem = {
  id: number;
  product_id: number;
  quantity: number;
  product: {
    id: number;
    name_en: string;
    name_ar: string;
    price: number;
  };
};

type Order = {
  id: number;
  user_id: number;
  total_amount: number;
  status: string;
  payment_method: string;
  items: OrderItem[];
};

export default function AdminDashboard() {
  const t = useTranslations("Admin");
  const router = useRouter();
  const locale = useLocale();
  const pathname = usePathname();

  const toggleLanguage = () => {
    const nextLocale = locale === "en" ? "ar" : "en";
    router.replace(pathname, { locale: nextLocale });
  };
  

  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<Record<number, User>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [driverModal, setDriverModal] = useState<{isOpen: boolean, orderId: number | null}>({isOpen: false, orderId: null});

  const MOCK_DRIVERS = [
    { name: "احمد محمود", phone: "01012345678" },
    { name: "محمد طارق", phone: "01198765432" },
    { name: "سيد علي", phone: "01234567890" },
    { name: "محمود حسن", phone: "01555555555" }
  ];
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  const fetchData = async () => {
    const token = getToken();
    if (!token) {
      router.push("/login?redirect=/admin");
      return;
    }

    try {
      // Fetch users
      const usersRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (usersRes.ok) {
        const usersData: User[] = await usersRes.json();
        const usersMap: Record<number, User> = {};
        usersData.forEach(u => usersMap[u.id] = u);
        setUsers(usersMap);
      }

      // Fetch orders
      const ordersRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/admin/orders/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (ordersRes.ok) {
        const ordersData: Order[] = await ordersRes.json();
        // Sort newest first
        setOrders(ordersData.sort((a, b) => b.id - a.id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, [router]);

  const updateOrderStatus = async (orderId: number, newStatus: string, driver_name?: string, driver_phone?: string) => {
    const token = getToken();
    try {
      const payload: any = { status: newStatus };
      if (driver_name && driver_phone) {
        payload.driver_name = driver_name;
        payload.driver_phone = driver_phone;
      }
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/admin/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const updatedOrder = await res.json();
        setOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));
      } else {
        alert(t("failedUpdateStatus"));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    if (newStatus === "Out for Delivery") {
      setDriverModal({ isOpen: true, orderId });
      return;
    }
    await updateOrderStatus(orderId, newStatus);
  };

  const assignDriver = async (driver: {name: string, phone: string}) => {
    if (driverModal.orderId) {
      await updateOrderStatus(driverModal.orderId, "Out for Delivery", driver.name, driver.phone);
    }
    setDriverModal({ isOpen: false, orderId: null });
  };

  // Stats calculation
  const totalOrders = orders.length;
  const activeOrders = orders.filter(o => o.status !== "Delivered").length;
  const revenue = orders.reduce((sum, o) => sum + o.total_amount, 0);

  // Filtering
  const filteredOrders = orders.filter(o => {
    const term = searchQuery.toLowerCase();
    const orderIdStr = `ORD-${o.id.toString().padStart(4, '0')}`.toLowerCase();
    const userName = users[o.user_id]?.name.toLowerCase() || "";
    return orderIdStr.includes(term) || userName.includes(term);
  });

  return (
    <>
      {/* Page Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-headline-xl text-headline-xl text-on-background mb-1">{t("ordersManagement")}</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">{t("monitorCurrent")}</p>
        </div>
        <div className="flex gap-3">
          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            className="bg-surface-container-lowest border border-outline text-on-surface hover:bg-surface-container-low font-label-md text-label-md px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
            title={locale === "ar" ? "Switch to English" : "التبديل للعربية"}
          >
            <span className="material-symbols-outlined text-sm">translate</span>
            {locale === "ar" ? "EN" : "ع"}
          </button>
          <button className="bg-surface-container-lowest border border-outline text-on-surface hover:bg-surface-container-low font-label-md text-label-md px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm">
            <span className="material-symbols-outlined text-sm">filter_list</span>
            {t("filter")}
          </button>
          <button className="bg-surface-container-lowest border border-outline text-on-surface hover:bg-surface-container-low font-label-md text-label-md px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm">
            <span className="material-symbols-outlined text-sm">download</span>
            {t("export")}
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-8">
        <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/30 flex items-center gap-4 hover:-translate-y-1 transition-transform duration-200">
          <div className="w-12 h-12 rounded-full bg-primary-container/20 flex items-center justify-center text-primary-container">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>list_alt</span>
          </div>
          <div>
            <p className="font-label-md text-label-md text-on-surface-variant mb-1">{t("totalOrders")}</p>
            <p className="font-headline-lg text-headline-lg text-on-background">{totalOrders}</p>
          </div>
        </div>
        
        <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/30 flex items-center gap-4 hover:-translate-y-1 transition-transform duration-200">
          <div className="w-12 h-12 rounded-full bg-secondary-container/20 flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>local_dining</span>
          </div>
          <div>
            <p className="font-label-md text-label-md text-on-surface-variant mb-1">{t("activeOrders")}</p>
            <p className="font-headline-lg text-headline-lg text-on-background">{activeOrders}</p>
          </div>
        </div>
        
        <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/30 flex items-center gap-4 hover:-translate-y-1 transition-transform duration-200">
          <div className="w-12 h-12 rounded-full bg-tertiary-container/20 flex items-center justify-center text-tertiary-container">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
          </div>
          <div>
            <p className="font-label-md text-label-md text-on-surface-variant mb-1">{t("revenue")}</p>
            <p className="font-headline-lg text-headline-lg text-on-background">{t("currency")} {revenue.toFixed(0)}</p>
          </div>
        </div>
      </div>

      {/* Orders Table Section */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 overflow-hidden">
        <div className="p-6 border-b border-outline-variant/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface">
          <h3 className="font-title-md text-title-md text-on-background">{t("recentOrders")}</h3>
          <div className="relative w-full sm:w-auto">
            <span className="material-symbols-outlined absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
            <input 
              type="text" 
              placeholder={t("searchOrders")} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 rtl:pl-4 rtl:pr-10 py-2 border border-outline-variant rounded-lg bg-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none font-body-md text-sm text-on-surface transition-all w-full sm:w-64" 
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left rtl:text-right border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant/50 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                <th className="p-4 font-semibold">{t("orderId")}</th>
                <th className="p-4 font-semibold">{t("customerName")}</th>
                <th className="p-4 font-semibold">{t("totalPrice")}</th>
                <th className="p-4 font-semibold">{t("status")}</th>
                <th className="p-4 font-semibold text-right rtl:text-left">{t("action")}</th>
              </tr>
            </thead>
            <tbody className="font-body-md text-body-md text-on-surface">
              <AnimatePresence mode="popLayout">
              {filteredOrders.length === 0 ? (
                <motion.tr
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <td colSpan={5} className="p-8 text-center text-on-surface-variant border-t border-outline-variant/30">No orders found.</td>
                </motion.tr>
              ) : [...filteredOrders].sort((a, b) => {
                  if (a.status === 'Delivered' && b.status !== 'Delivered') return 1;
                  if (a.status !== 'Delivered' && b.status === 'Delivered') return -1;
                  return b.id - a.id;
              }).map(order => {
                const user = users[order.user_id];
                const initials = user ? user.name.substring(0, 2).toUpperCase() : "??";
                const userName = user ? user.name : `User #${order.user_id}`;
                const orderIdStr = `#ORD-${order.id.toString().padStart(4, '0')}`;
                
                const isCompleted = order.status === 'Delivered';
                
                return (
                  <motion.tr 
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, type: "spring", bounce: 0.2 }}
                    key={order.id} 
                    className={`transition-all duration-300 relative ${
                      isCompleted 
                        ? 'bg-green-500/5 dark:bg-green-500/10 shadow-[inset_0_4px_15px_rgba(34,197,94,0.1),inset_0_-4px_15px_rgba(34,197,94,0.1)] z-10' 
                        : 'border-b border-outline-variant/30 hover:bg-surface-container-low/50'
                    }`}
                  >
                    <td className="p-4 font-medium text-primary">{orderIdStr}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-xs">{initials}</div>
                        {userName}
                      </div>
                    </td>
                    <td className="p-4">{t("currency")} {order.total_amount.toFixed(2)}</td>
                    <td className="p-4">
                      <select 
                        value={order.status} 
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`bg-surface-container-lowest border border-outline-variant font-label-sm text-label-sm rounded-full px-3 py-1 focus:border-primary focus:ring-1 focus:ring-primary outline-none appearance-none pr-8 rtl:pr-3 rtl:pl-8 cursor-pointer relative ${order.status === 'Delivered' ? 'text-primary' : 'text-on-surface'}`} 
                        style={{ backgroundImage: "url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23897362%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')", backgroundRepeat: "no-repeat", backgroundPosition: "right 0.7rem top 50%", backgroundSize: "0.65rem auto" }}
                      >
                        <option value="Pending">{t("statusPending")}</option>
                        <option value="Preparing">{t("statusPreparing")}</option>
                        <option value="Out for Delivery">{t("statusDelivering")}</option>
                        <option value="Delivered">{t("statusCompleted")}</option>
                      </select>
                    </td>
                    <td className="p-4 text-right rtl:text-left">
                      <button 
                        onClick={() => setSelectedOrderId(order.id)}
                        className="text-secondary hover:text-secondary-container font-label-md text-label-md underline underline-offset-2 transition-colors"
                      >
                        {t("viewDetails")}
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-outline-variant/50 bg-surface flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-label-sm text-label-sm text-on-surface-variant">{t("showingEntries", { start: 1, end: filteredOrders.length, total: filteredOrders.length })}</span>
          <div className="flex gap-2">
            <button disabled className="w-8 h-8 rounded-lg border border-outline-variant flex items-center justify-center text-on-surface hover:bg-surface-container-low disabled:opacity-50">
              <span className="material-symbols-outlined text-sm rtl:rotate-180">chevron_left</span>
            </button>
            <button className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center font-label-md text-label-md">1</button>
            <button disabled className="w-8 h-8 rounded-lg border border-outline-variant flex items-center justify-center text-on-surface hover:bg-surface-container-low disabled:opacity-50">
              <span className="material-symbols-outlined text-sm rtl:rotate-180">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Order Details Modal */}
      <OrderDetailsModal 
        isOpen={selectedOrderId !== null}
        onClose={() => setSelectedOrderId(null)}
        order={orders.find(o => o.id === selectedOrderId) || null}
        user={selectedOrderId ? users[orders.find(o => o.id === selectedOrderId)?.user_id || 0] : undefined}
        onStatusChange={handleStatusChange}
      />

      {/* Driver Selection Modal - Wide & Centered */}
      {driverModal.isOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setDriverModal({ isOpen: false, orderId: null })}
        >
          <div 
            className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-outline-variant overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 bg-gray-50">
              <div>
                <h2 className="font-headline-sm text-headline-sm text-gray-900">اختر سائق التوصيل</h2>
                <p className="font-body-sm text-body-sm text-gray-600 mt-1">
                  طلب رقم <span className="text-primary font-bold">#{driverModal.orderId}</span>
                </p>
              </div>
              <button
                onClick={() => setDriverModal({ isOpen: false, orderId: null })}
                className="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Drivers Grid */}
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white">
              {MOCK_DRIVERS.map((driver, idx) => (
                <button
                  key={idx}
                  onClick={() => assignDriver(driver)}
                  className="flex items-center gap-4 p-5 rounded-xl border-2 border-gray-200 hover:border-primary/50 hover:bg-primary/5 active:scale-[0.97] transition-all duration-150 text-start w-full group"
                >
                  {/* Avatar */}
                  <div className="w-14 h-14 rounded-2xl bg-orange-100 text-orange-700 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                    <span className="material-symbols-outlined text-[26px]">two_wheeler</span>
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-title-md text-title-md text-gray-900">{driver.name}</p>
                    <p className="font-body-sm text-body-sm text-gray-600 mt-0.5" dir="ltr">{driver.phone}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Footer */}
            <div className="px-5 pb-5 pt-2 bg-white">
              <button
                onClick={() => setDriverModal({ isOpen: false, orderId: null })}
                className="w-full py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 active:scale-[0.98] transition-all font-label-md text-label-md"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
