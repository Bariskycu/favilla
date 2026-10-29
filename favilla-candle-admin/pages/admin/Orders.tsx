
import React, { useState, useMemo, useEffect } from 'react';
import {
  Package,
  Truck,
  MapPin,
  Calendar,
  Mail,
  Printer,
  X,
  CreditCard,
  Search,
  Filter,
  CheckCircle,
  Clock,
  XCircle,
  ArrowRight,
  Edit2,
  Save,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../services/api';
import { Order, OrderStatus } from '../../types';

// --- Yardımcı Fonksiyonlar ve Sabitler ---

const getStatusConfig = (status: OrderStatus) => {
  switch (status) {
    case 'processing':
      return {
        color: 'bg-amber-100 text-amber-800 border-amber-200',
        icon: Clock,
        label: 'Hazırlanıyor',
        description: 'Sipariş alındı, paketleme sürecinde.'
      };
    case 'shipped':
      return {
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: Truck,
        label: 'Kargolandı',
        description: 'Paket kargo firmasına teslim edildi.'
      };
    case 'delivered':
      return {
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: CheckCircle,
        label: 'Teslim Edildi',
        description: 'Müşteri paketi teslim aldı.'
      };
    case 'cancelled':
      return {
        color: 'bg-red-50 text-red-800 border-red-100',
        icon: XCircle,
        label: 'İptal Edildi',
        description: 'Sipariş iptal edildi.'
      };
    case 'returned':
      return {
        color: 'bg-purple-50 text-purple-800 border-purple-100',
        icon: XCircle,
        label: 'İade',
        description: 'Ürün iade edildi.'
      };
    default:
      return {
        color: 'bg-stone-100 text-stone-600',
        icon: Package,
        label: status,
        description: 'Durum bilinmiyor.'
      };
  }
};

const TABS = [
  { id: 'all', label: 'Tümü' },
  { id: 'processing', label: 'Hazırlanıyor' },
  { id: 'shipped', label: 'Kargolandı' },
  { id: 'delivered', label: 'Tamamlanan' },
  { id: 'cancelled', label: 'İptal' },
];

export default function Orders() {
  // --- STATE ---
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch Orders
  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      // API doc limitation: only page/limit supported. Fetching larger set for client-side filtering.
      const response = await api.orders.getAll({ limit: 100 });
      if (response.success) {
        setOrders(response.data);
      }
    } catch (err: any) {
      setError(err.message || 'Siparişler yüklenirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Client-side Filtering
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
      const matchesSearch = !searchTerm ||
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.customerName && order.customerName.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesStatus && matchesSearch;
    });
  }, [orders, filterStatus, searchTerm]);


  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">

      {/* --- Header Area --- */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h2 className="font-serif text-2xl font-medium text-softBlack">Sipariş Yönetimi</h2>
            <p className="text-stone-500 text-sm mt-1">Gelen siparişleri takip edin ve yönetin.</p>
          </div>

          <div className="relative w-full md:w-80 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-softBlack transition-colors" size={18} />
            <input
              type="text"
              placeholder="Sipariş No veya Müşteri Ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-softBlack shadow-sm transition-all"
            />
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setFilterStatus(tab.id);
                setSelectedOrder(null);
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${filterStatus === tab.id
                ? 'bg-softBlack text-white border-softBlack shadow-md'
                : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* --- Main Content --- */}
      <div className="flex-1 flex gap-6 overflow-hidden relative">

        {/* Sipariş Listesi */}
        <div className={`flex-1 flex flex-col transition-all duration-500 ease-in-out ${selectedOrder ? 'hidden lg:flex lg:w-1/2 lg:flex-none' : 'w-full'}`}>
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm flex-1 overflow-hidden flex flex-col">

            <div className="hidden sm:grid grid-cols-12 gap-4 p-4 border-b border-stone-100 bg-stone-50/50 text-xs font-medium text-stone-500 uppercase tracking-wider">
              <div className="col-span-3">Sipariş No</div>
              <div className="col-span-3">Müşteri</div>
              <div className="col-span-3">Durum</div>
              <div className="col-span-3 text-right">Tutar / Tarih</div>
            </div>

            <div className="overflow-y-auto flex-1 p-2 space-y-2">
              {isLoading && orders.length === 0 ? (
                <div className="flex justify-center p-10"><div className="animate-spin h-6 w-6 border-2 border-softBlack border-t-transparent rounded-full" /></div>
              ) : (
                <AnimatePresence mode='popLayout'>
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => {
                      const statusConfig = getStatusConfig(order.status);
                      return (
                        <motion.div
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          key={order.id}
                          onClick={() => setSelectedOrder(order)}
                          className={`group p-4 rounded-xl cursor-pointer border transition-all duration-200 hover:shadow-md ${selectedOrder?.id === order.id
                            ? 'bg-cream border-stone-300 ring-1 ring-stone-200'
                            : 'bg-white border-stone-100 hover:border-stone-200'
                            }`}
                        >
                          <div className="flex flex-col sm:grid sm:grid-cols-12 gap-2 sm:gap-4 sm:items-center">
                            <div className="col-span-3 flex items-center gap-3">
                              <div className={`p-2 rounded-full bg-white border border-stone-100 shadow-sm text-stone-400 group-hover:text-softBlack transition-colors`}>
                                <Package size={18} />
                              </div>
                              <div>
                                <span className="block font-medium text-softBlack">{order.orderNumber}</span>
                                <span className="text-xs text-stone-400 sm:hidden">{new Date(order.createdAt).toLocaleDateString('tr-TR')}</span>
                              </div>
                            </div>

                            <div className="col-span-3">
                              <p className="text-sm font-medium text-stone-700">{order.customerName || 'Misafir'}</p>
                              <p className="text-xs text-stone-400">{order.items?.length || 0} ürün</p>
                            </div>

                            <div className="col-span-3">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusConfig.color}`}>
                                {statusConfig.label}
                              </span>
                            </div>

                            <div className="col-span-3 text-right flex flex-col justify-center">
                              <span className="font-serif font-medium text-softBlack">
                                {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(order.total)}
                              </span>
                              <span className="text-xs text-stone-400 hidden sm:block">
                                {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-stone-400">
                      <div className="w-12 h-12 bg-stone-50 rounded-full flex items-center justify-center mb-3">
                        <Filter size={20} />
                      </div>
                      <p>Sipariş bulunamadı.</p>
                    </div>
                  )}
                </AnimatePresence>
              )}
            </div>

            <div className="p-3 border-t border-stone-100 bg-stone-50/50 text-xs text-center text-stone-500">
              Toplam {filteredOrders.length} sipariş gösteriliyor
            </div>
          </div>
        </div>

        {/* Sipariş Detay Paneli */}
        <AnimatePresence>
          {selectedOrder && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute inset-0 z-20 lg:static lg:flex-1 lg:min-w-[450px] bg-white rounded-2xl border border-stone-100 shadow-xl overflow-hidden flex flex-col h-full"
            >
              {/* Detay Header */}
              <div className="p-5 border-b border-stone-100 flex justify-between items-center bg-white sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="lg:hidden p-2 -ml-2 text-stone-400 hover:text-softBlack"
                  >
                    <ArrowRight size={20} className="rotate-180" />
                  </button>
                  <div>
                    <h3 className="font-serif text-xl font-medium text-softBlack">Sipariş Detayı</h3>
                    <div className="flex items-center gap-2 text-xs text-stone-500 mt-0.5">
                      <Calendar size={12} /> {new Date(selectedOrder.createdAt).toLocaleString('tr-TR')}
                      <span>•</span>
                      <span>{selectedOrder.orderNumber}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 text-stone-400 hover:text-softBlack hover:bg-stone-50 rounded-lg transition-colors border border-transparent hover:border-stone-200" title="Yazdır">
                    <Printer size={18} />
                  </button>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="hidden lg:block p-2 text-stone-400 hover:text-softBlack hover:bg-stone-50 rounded-lg transition-colors border border-transparent hover:border-stone-200"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Detay Scroll Alanı */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6">

                {/* Durum Barı */}
                <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-softBlack">Sipariş Durumu</span>
                    {(() => {
                      const cfg = getStatusConfig(selectedOrder.status);
                      const Icon = cfg.icon;
                      return (
                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.color}`}>
                          <Icon size={12} /> {cfg.label}
                        </div>
                      );
                    })()}
                  </div>
                  {/* Progress Bar */}
                  <div className="relative h-2 bg-stone-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: selectedOrder.status === 'delivered' ? '100%' :
                          selectedOrder.status === 'shipped' ? '66%' :
                            selectedOrder.status === 'processing' ? '33%' : '0%'
                      }}
                      className={`absolute top-0 left-0 h-full ${selectedOrder.status === 'cancelled' || selectedOrder.status === 'returned' ? 'bg-red-500' : 'bg-softBlack'}`}
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-[10px] text-stone-400 font-medium uppercase tracking-wider">
                    <span>Alındı</span>
                    <span>Hazırlanıyor</span>
                    <span>Kargoda</span>
                    <span>Teslim</span>
                  </div>
                </div>

                {/* Ürünler Listesi */}
                <div>
                  <h4 className="text-sm font-medium text-stone-900 mb-3 flex items-center gap-2">
                    <Package size={16} className="text-stone-400" /> Ürünler ({selectedOrder.items?.length || 0})
                  </h4>
                  <div className="space-y-3">
                    {selectedOrder.items?.map((item, idx) => (
                      <div key={item.id || idx} className="flex gap-4 p-3 rounded-xl border border-stone-100 hover:border-stone-200 bg-stone-50/30 transition-colors">
                        <div className="h-16 w-16 bg-white rounded-lg border border-stone-100 overflow-hidden flex-shrink-0">
                          <img
                            src={item.productImage || 'https://via.placeholder.com/150'}
                            alt={item.productName}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1 flex flex-col justify-center">
                          <p className="font-serif font-medium text-softBlack">{item.productName}</p>
                          <div className="flex justify-between items-center mt-1">
                            <p className="text-sm text-stone-500">
                              {item.quantity} adet x {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(item.price)}
                            </p>
                            <p className="font-medium text-softBlack">
                              {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(item.price * item.quantity)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Toplam */}
                  <div className="mt-4 pt-4 border-t border-dashed border-stone-200 space-y-2">
                    <div className="flex justify-between text-sm text-stone-500">
                      <span>Ara Toplam</span>
                      <span>{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(selectedOrder.subtotal || selectedOrder.total)}</span>
                    </div>
                    {selectedOrder.discountAmount ? (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>İndirim</span>
                        <span>-{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(selectedOrder.discountAmount)}</span>
                      </div>
                    ) : null}
                    <div className="flex justify-between items-center pt-2 text-softBlack">
                      <span className="font-medium">Genel Toplam</span>
                      <span className="font-serif text-xl font-bold">
                        {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(selectedOrder.total)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Müşteri & Teslimat Bilgileri */}
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                    <h4 className="text-sm font-medium text-softBlack flex items-center gap-2">
                      <CreditCard size={16} className="text-stone-400" /> Müşteri & Teslimat
                    </h4>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-stone-100 space-y-4">
                    {/* Adres Bölümü */}
                    <div>
                      <h5 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <MapPin size={12} /> Teslimat Adresi
                      </h5>
                      <div className="text-sm font-medium text-softBlack">
                        <div className="font-semibold mb-1">{selectedOrder.customerName || selectedOrder.customer?.name}</div>
                        {selectedOrder.shippingAddress ? (
                          <div className="text-stone-600 leading-relaxed">
                            {selectedOrder.shippingAddress.line1}<br />
                            {selectedOrder.shippingAddress.zip} {selectedOrder.shippingAddress.city} / {selectedOrder.shippingAddress.country}
                          </div>
                        ) : (
                          <div className="text-stone-500 italic">Adres bilgisi yok</div>
                        )}
                      </div>
                    </div>

                    {/* İletişim Bölümü */}
                    <div>
                      <h5 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <Mail size={12} /> İletişim
                      </h5>
                      <div className="text-sm text-stone-600">
                        {selectedOrder.customerEmail || selectedOrder.customer?.email}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Read Only Footer */}
              <div className="p-4 border-t border-stone-100 bg-stone-50 flex gap-3 text-xs text-stone-500 justify-center">
                <span>Bu sipariş salt okunurdur. Düzenleme için yetkili API bulunamadı.</span>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}


