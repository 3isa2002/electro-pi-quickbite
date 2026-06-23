"use client";

import { useTranslations, useLocale } from "next-intl";
import { useEffect, useState } from "react";
import { getToken } from "@/utils/auth";
import { useRouter } from "@/i18n/routing";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

type User = {
  id: number;
  name: string;
  email: string;
  phone: string;
  created_at?: string;
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
    image_url: string;
  };
};

type Order = {
  id: number;
  user_id: number;
  total_amount: number;
  subtotal?: number;
  tax_amount?: number;
  delivery_fee?: number;
  status: string;
  created_at?: string;
  items: OrderItem[];
};

const COLORS = ['#897362', '#e67e22', '#2ecc71', '#e74c3c', '#95a5a6'];

export default function AdminDashboardPage() {
  const t = useTranslations("Admin");
  const locale = useLocale();
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<Record<number, User>>({});
  const [loading, setLoading] = useState(true);
  const [selectedDateStr, setSelectedDateStr] = useState<string>(new Date().toDateString());

  useEffect(() => {
    const fetchData = async () => {
      const token = getToken();
      if (!token) {
        router.push("/login?redirect=/admin/dashboard");
        return;
      }

      try {
        const [usersRes, ordersRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/users`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/admin/orders/`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        if (usersRes.ok && ordersRes.ok) {
          const usersData: User[] = await usersRes.json();
          const usersMap: Record<number, User> = {};
          usersData.forEach(u => usersMap[u.id] = u);
          setUsers(usersMap);

          const ordersData: Order[] = await ordersRes.json();
          setOrders(ordersData.sort((a, b) => b.id - a.id));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [router]);

  // Date Range Generation (Last 5 Days)
  const last5Days = Array.from({length: 5}).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0,0,0,0);
    return d;
  }).reverse();

  // Calculations
  const dateOrders = orders.filter(o => o.created_at && new Date(o.created_at).toDateString() === selectedDateStr);
  const activeDateOrders = dateOrders.filter(o => o.status !== "Cancelled");
  
  const grossRevenue = activeDateOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
  // Support old orders by treating total_amount as subtotal if subtotal isn't set
  const netProfit = activeDateOrders.reduce((sum, o) => sum + (o.subtotal || o.total_amount || 0), 0);
  const totalTaxes = activeDateOrders.reduce((sum, o) => sum + (o.tax_amount || 0), 0);
  const totalDeliveryFees = activeDateOrders.reduce((sum, o) => sum + (o.delivery_fee || 0), 0);
  
  const avgOrderValue = activeDateOrders.length > 0 ? (grossRevenue / activeDateOrders.length) : 0;
  
  // Status Distribution
  const statusCounts = dateOrders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.keys(statusCounts).map(status => ({
    name: status,
    value: statusCounts[status]
  }));

  // Best Sellers
  const productSales: Record<number, { name: string, count: number, revenue: number, image: string }> = {};
  activeDateOrders.forEach(order => {
    order.items.forEach(item => {
      if (!productSales[item.product_id]) {
        productSales[item.product_id] = { 
          name: item.product.name_en, // You could switch by locale here
          count: 0, 
          revenue: 0,
          image: item.product.image_url 
        };
      }
      productSales[item.product_id].count += item.quantity;
      productSales[item.product_id].revenue += (item.quantity * item.product.price);
    });
  });

  const bestSellers = Object.values(productSales)
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);

  // Mock Revenue Data for Line Chart (Blending with real selected date revenue)
  const lineData = [
    { name: 'Mon', revenue: 4000 },
    { name: 'Tue', revenue: 3000 },
    { name: 'Wed', revenue: 5500 },
    { name: 'Thu', revenue: 4500 },
    { name: 'Fri', revenue: 6000 },
    { name: 'Sat', revenue: 7000 },
    { name: 'Selected', revenue: grossRevenue > 0 ? grossRevenue : 3500 },
  ];

  if (loading) {
    return (
      <div className="animate-pulse">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="h-10 bg-surface-container-highest rounded-lg w-1/4 mb-2"></div>
          <div className="h-5 bg-surface-container-highest rounded-lg w-1/3"></div>
        </div>

        {/* Calendar Strip Skeleton */}
        <div className="flex gap-4 overflow-x-auto pb-4 mb-6 custom-scrollbar" dir="ltr">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="flex-shrink-0 w-[100px] h-[100px] bg-surface-container-highest rounded-2xl"></div>
          ))}
        </div>

        {/* KPI Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter mb-8">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 flex gap-4 items-start h-[100px]">
              <div className="w-12 h-12 bg-surface-container-highest rounded-xl shrink-0"></div>
              <div className="flex-1 space-y-3 py-1">
                <div className="h-4 bg-surface-container-highest rounded-md w-3/4"></div>
                <div className="h-6 bg-surface-container-highest rounded-md w-1/2"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter mb-8">
          <div className="lg:col-span-2 bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30">
            <div className="h-6 bg-surface-container-highest rounded-md w-1/4 mb-6"></div>
            <div className="h-[300px] bg-surface-container-highest rounded-xl"></div>
          </div>
          <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30">
            <div className="h-6 bg-surface-container-highest rounded-md w-1/2 mb-6"></div>
            <div className="h-[300px] bg-surface-container-highest rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-headline-xl text-headline-xl text-on-background mb-1">{t("dashboardOverview")}</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">{t("dashboardSubtitle")}</p>
      </div>

      {/* Calendar Strip */}
      <div className="flex gap-4 overflow-x-auto pb-4 mb-6 custom-scrollbar" dir="ltr">
        {last5Days.map(date => {
          const dateStr = date.toDateString();
          const isActive = dateStr === selectedDateStr;
          const hasOrders = orders.some(o => o.created_at && new Date(o.created_at).toDateString() === dateStr);
          
          return (
            <button 
              key={dateStr}
              onClick={() => setSelectedDateStr(dateStr)}
              className={`flex-shrink-0 flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all min-w-[100px] ${isActive ? 'bg-primary border-primary text-on-primary shadow-md' : 'bg-surface-container-lowest border-outline-variant hover:border-primary text-on-surface'}`}
            >
              <span className={`font-label-sm text-[11px] uppercase mb-1 ${isActive ? 'text-primary-container' : 'text-on-surface-variant'}`}>
                {date.toLocaleDateString(locale, { weekday: 'short' })}
              </span>
              <span className="font-headline-md text-headline-md font-bold mb-2">
                {date.getDate()}
              </span>
              <div className={`w-2 h-2 rounded-full ${hasOrders ? (isActive ? 'bg-white' : 'bg-success') : 'bg-transparent'}`}></div>
            </button>
          )
        })}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter mb-8">
        {/* Gross Revenue */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/30 flex justify-between items-center"
        >
          <div>
            <p className="font-label-md text-label-md text-on-surface-variant mb-2">{t("grossRevenue")}</p>
            <h3 className="font-headline-md text-headline-md text-on-background">{t("currency")} {grossRevenue.toFixed(0)}</h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-primary-container/30 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
          </div>
        </motion.div>

        {/* Net Profit */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/30 flex justify-between items-center border-b-4 border-b-success"
        >
          <div>
            <p className="font-label-md text-label-md text-on-surface-variant mb-2">{t("netProfit")}</p>
            <h3 className="font-headline-md text-headline-md text-on-background text-success">{t("currency")} {netProfit.toFixed(0)}</h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center text-success">
            <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance_wallet</span>
          </div>
        </motion.div>

        {/* Taxes */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/30 flex justify-between items-center"
        >
          <div>
            <p className="font-label-md text-label-md text-on-surface-variant mb-2">{t("totalTaxes")}</p>
            <h3 className="font-headline-md text-headline-md text-on-background">{t("currency")} {totalTaxes.toFixed(0)}</h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-error-container/30 flex items-center justify-center text-error">
            <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance</span>
          </div>
        </motion.div>

        {/* Delivery Fees */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/30 flex justify-between items-center"
        >
          <div>
            <p className="font-label-md text-label-md text-on-surface-variant mb-2">{t("totalDeliveryFees")}</p>
            <h3 className="font-headline-md text-headline-md text-on-background">{t("currency")} {totalDeliveryFees.toFixed(0)}</h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-secondary-container/30 flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>local_shipping</span>
          </div>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter mb-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
          className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/30 lg:col-span-2"
        >
          <h3 className="font-title-md text-title-md text-on-background mb-6">{t("revenueChart")}</h3>
          <div className="h-72 w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#757575', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#757575', fontSize: 12 }} dx={-10} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{ stroke: '#f5f5f5', strokeWidth: 2 }}
                />
                <Line type="monotone" dataKey="revenue" stroke="#897362" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}
          className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/30"
        >
          <h3 className="font-title-md text-title-md text-on-background mb-6">{t("orderStatusChart")}</h3>
          <div className="h-64 w-full flex justify-center items-center" dir="ltr">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-on-surface-variant font-body-sm">No data available</p>
            )}
          </div>
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {pieData.map((entry, index) => (
              <div key={index} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                <span className="font-label-sm text-[12px] text-on-surface-variant">{entry.name} ({entry.value})</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
        {/* Best Sellers */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/30"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-title-md text-title-md text-on-background">{t("bestSellers")}</h3>
            <button className="text-primary font-label-sm text-label-sm hover:underline">{t("viewDetails")}</button>
          </div>
          
          <div className="space-y-4">
            {bestSellers.length > 0 ? bestSellers.map((item, idx) => (
              <div key={idx} className="flex items-center gap-4 p-3 hover:bg-surface-container-lowest rounded-xl transition-colors border border-transparent hover:border-outline-variant/30">
                <img src={item.image} alt={item.name} className="w-14 h-14 rounded-lg object-cover" />
                <div className="flex-1">
                  <h4 className="font-title-sm text-title-sm text-on-background">{item.name}</h4>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">{item.count} orders</p>
                </div>
                <div className="text-right rtl:text-left">
                  <p className="font-label-md text-label-md text-primary">{t("currency")} {item.revenue.toFixed(0)}</p>
                </div>
              </div>
            )) : (
              <p className="text-center text-on-surface-variant py-4">No sales data yet.</p>
            )}
          </div>
        </motion.div>

        {/* Live Activity Feed */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/30"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-title-md text-title-md text-on-background flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-error animate-pulse"></span>
              {t("liveActivity")}
            </h3>
          </div>
          
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 rtl:before:ml-0 rtl:before:mr-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-outline-variant before:to-transparent pl-8 rtl:pl-0 rtl:pr-8">
            {dateOrders.slice(0, 4).map((order, idx) => {
              const user = users[order.user_id];
              const userName = user ? user.name : `User #${order.user_id}`;
              const timeText = idx === 0 ? t("justNow") : `${idx * 15} mins ago`;

              return (
                <div key={order.id} className="relative flex items-center justify-between">
                  <div className="absolute left-[-32px] rtl:left-auto rtl:right-[-32px] w-6 h-6 rounded-full bg-primary-container border-4 border-surface-container-lowest flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-primary"></span>
                  </div>
                  <div>
                    <p className="font-body-sm text-body-sm text-on-background">
                      <span className="font-bold">{userName}</span> {t("orderPlaced")} <span className="text-primary font-bold">#ORD-{order.id.toString().padStart(4, '0')}</span>
                    </p>
                    <p className="font-label-sm text-[11px] text-on-surface-variant mt-1">{timeText}</p>
                  </div>
                  <div className="font-label-md text-label-md bg-surface-container-high px-2 py-1 rounded">
                    {t("currency")} {order.total_amount.toFixed(0)}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </>
  );
}
