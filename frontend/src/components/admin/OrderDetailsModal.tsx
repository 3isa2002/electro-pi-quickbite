import { useTranslations } from "next-intl";

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
    image_url?: string;
  };
};

type Order = {
  id: number;
  user_id: number;
  total_amount: number;
  status: string;
  payment_method: string;
  shipping_address?: string;
  shipping_phone?: string;
  driver_name?: string;
  driver_phone?: string;
  items: OrderItem[];
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  user: User | undefined;
  onStatusChange: (orderId: number, status: string) => void;
  MOCK_DRIVERS?: {name: string, phone: string}[];
  onAssignDriver?: (orderId: number, driverIndex: string) => void;
};

export default function OrderDetailsModal({ isOpen, onClose, order, user, onStatusChange, MOCK_DRIVERS, onAssignDriver }: Props) {
  const t = useTranslations("Admin");

  if (!isOpen || !order) return null;

  const orderIdStr = `#ORD-${order.id.toString().padStart(4, '0')}`;
  const userName = user ? user.name : `User #${order.user_id}`;
  const userPhone = user?.phone || order.shipping_phone || "No phone provided";
  const userAddress = order.shipping_address || "No address provided";

  // Calculate subtotal
  const subtotal = order.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const deliveryFee = 3.50; // assuming fixed delivery fee for now
  const tax = subtotal * 0.14; // assuming 14% tax

  return (
    <>
      {/* OVERLAY BACKDROP */}
      <div 
        className="fixed inset-0 bg-on-background/40 backdrop-blur-[2px] z-[100] transition-opacity"
        onClick={onClose}
      />
      
      {/* CENTERED MODAL */}
      <section className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-auto max-h-[95dvh] w-[95%] max-w-2xl bg-surface shadow-[rgba(0,0,0,0.2)_0px_20px_40px_0px] rounded-2xl z-[101] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <header className="flex items-center justify-between px-6 py-5 border-b border-outline-variant/30 bg-surface">
          <div>
            <h2 className="font-title-md text-title-md text-on-surface font-bold flex items-center gap-2">
              Order {orderIdStr}
              {order.status === 'Pending' && (
                <span className="bg-primary-container text-on-primary-container text-[10px] font-bold px-2 py-1 rounded-full ml-2 rtl:mr-2 rtl:ml-0 uppercase tracking-wider">New</span>
              )}
            </h2>
          </div>
          <button 
            onClick={onClose}
            aria-label="Close" 
            className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-full transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          
          {/* Status & Meta */}
          <div className="flex flex-wrap gap-4 items-start justify-between bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/50 shadow-sm">
            <div className="flex-1 min-w-[200px]">
              <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">{t("status")}</label>
              <div className="relative mb-2">
                <select 
                  value={order.status}
                  onChange={(e) => onStatusChange(order.id, e.target.value)}
                  className="w-full appearance-none bg-surface border border-outline-variant text-on-surface font-label-md text-label-md rounded-lg pl-4 pr-10 rtl:pr-4 rtl:pl-10 py-2.5 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-shadow shadow-sm cursor-pointer"
                >
                  <option value="Pending">{t("statusPending")}</option>
                  <option value="Preparing">{t("statusPreparing")}</option>
                  <option value="Out for Delivery">{t("statusDelivering")}</option>
                  <option value="Delivered">{t("statusCompleted")}</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 rtl:left-3 rtl:right-auto top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">expand_more</span>
              </div>
              
              {order.status === 'Out for Delivery' && !order.driver_name && MOCK_DRIVERS && onAssignDriver && (
                <select 
                  className="w-full bg-surface border-2 border-primary text-primary font-label-md rounded-lg px-3 py-2 outline-none cursor-pointer mt-2"
                  onChange={(e) => onAssignDriver(order.id, e.target.value)}
                  defaultValue=""
                >
                  <option value="" disabled>-- اختر السائق لتعيينه --</option>
                  {MOCK_DRIVERS.map((driver, idx) => (
                    <option key={idx} value={idx}>{driver.name} ({driver.phone})</option>
                  ))}
                </select>
              )}
              
              {order.driver_name && (
                <div className="flex items-center gap-2 mt-2 bg-primary/10 text-primary font-label-sm rounded-lg px-3 py-2">
                  <span className="material-symbols-outlined text-[16px]">two_wheeler</span>
                  <span>السائق: {order.driver_name}</span>
                </div>
              )}
            </div>
            
            <div className="flex flex-col items-end rtl:items-start">
              <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Payment Method</label>
              <div className="flex items-center gap-2 text-on-surface font-label-md text-label-md capitalize">
                <span className="material-symbols-outlined text-primary">
                  {order.payment_method.toLowerCase() === 'cod' ? 'payments' : 'credit_card'}
                </span>
                {order.payment_method === 'COD' ? 'Cash on Delivery' : 'Online Paid'}
              </div>
            </div>
          </div>

          {/* Customer Details */}
          <section>
            <h3 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-3">Customer Information</h3>
            <div className="bg-surface-container-low rounded-xl p-5 border border-outline-variant/30 flex items-start gap-4 shadow-sm">
              <div className="bg-primary-container text-on-primary-container p-3 rounded-full flex-shrink-0">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
              </div>
              <div className="flex-1">
                <h4 className="font-title-md text-title-md text-on-surface mb-1">{userName}</h4>
                <div className="flex items-center gap-2 text-on-surface-variant font-body-md text-body-md mb-2">
                  <span className="material-symbols-outlined text-[18px]">call</span>
                  <a href={`tel:${userPhone}`} className="hover:text-primary transition-colors">{userPhone}</a>
                </div>
                <div className="flex items-start gap-2 text-on-surface-variant font-body-md text-body-md">
                  <span className="material-symbols-outlined text-[18px] mt-0.5">location_on</span>
                  <span>{userAddress}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Itemized List */}
          <section>
            <h3 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-3">Order Items</h3>
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/50 overflow-hidden shadow-sm">
              <ul className="divide-y divide-outline-variant/30">
                {order.items.map((item, idx) => (
                  <li key={idx} className="p-4 flex items-center gap-4 hover:bg-surface-container-lowest transition-colors">
                    {item.product.image_url ? (
                      <img src={item.product.image_url} alt={item.product.name_en} className="w-16 h-16 rounded-lg object-cover shadow-sm" />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-surface-variant flex items-center justify-center shadow-sm">
                        <span className="material-symbols-outlined text-on-surface-variant">fastfood</span>
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="font-label-md text-label-md text-on-surface">{item.product.name_en}</h4>
                      <p className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">{item.product.name_ar}</p>
                    </div>
                    <div className="text-right rtl:text-left">
                      <div className="font-label-md text-label-md text-on-surface">{item.quantity}x</div>
                      <div className="font-label-sm text-label-sm text-on-surface-variant">EGP {item.product.price.toFixed(2)}</div>
                    </div>
                    <div className="w-20 text-right rtl:text-left font-title-md text-title-md text-on-surface">
                      EGP {(item.product.price * item.quantity).toFixed(2)}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Financial Breakdown */}
          <section className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/30 shadow-sm">
            <div className="space-y-3 font-body-md text-body-md text-on-surface-variant">
              <div className="flex justify-between items-center">
                <span>Subtotal</span>
                <span className="text-on-surface font-label-md text-label-md">EGP {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Delivery Fee</span>
                <span className="text-on-surface font-label-md text-label-md">EGP {deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Taxes</span>
                <span className="text-on-surface font-label-md text-label-md">EGP {tax.toFixed(2)}</span>
              </div>
            </div>
            <div className="border-t border-outline-variant/50 mt-4 pt-4 flex justify-between items-center">
              <span className="font-title-md text-title-md text-on-surface font-bold">Total Amount</span>
              <span className="font-headline-lg-mobile text-headline-lg-mobile text-primary font-bold">
                EGP {order.total_amount.toFixed(2)}
              </span>
            </div>
          </section>
        </div>

        {/* Modal Footer / Actions */}
        <footer className="p-6 border-t border-outline-variant/30 bg-surface flex items-center justify-between gap-4">
          <button 
            onClick={onClose}
            className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface px-4 py-2 rounded-lg transition-colors"
          >
            Close
          </button>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 font-label-md text-label-md text-secondary border border-outline-variant px-5 py-2.5 rounded-lg hover:bg-surface-container-high transition-colors shadow-sm bg-surface">
              <span className="material-symbols-outlined text-[18px]">print</span>
              Print Invoice
            </button>
            <a 
              href={`tel:${userPhone}`}
              className="flex items-center gap-2 font-label-md text-label-md text-on-primary bg-primary px-6 py-2.5 rounded-lg hover:bg-surface-tint shadow-sm transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">call</span>
              Contact Customer
            </a>
          </div>
        </footer>
      </section>
    </>
  );
}
