
import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Filter,
  MoreHorizontal,
  Mail,
  Phone,
  MapPin,
  ShoppingBag,
  Calendar,
  User,
  Star,
  Download,
  X,
  Plus,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../services/api';
import { Customer } from '../../types';

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch Customers
  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      // In a real app with backend filtering, we would pass params here
      // For now, fetching all and filtering client side if backend doesn't support complex filters fully or if list is small
      // The API doc says basic search is supported.
      const response = await api.customers.getAll({
        search: searchTerm || undefined
      });
      if (response.success) {
        setCustomers(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchCustomerDetails = async (id: string) => {
    try {
      const response = await api.customers.getById(id);
      if (response.success) {
        setSelectedCustomer(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch customer details:', error);
    }
  };

  const handleCustomerClick = (customer: Customer) => {
    fetchCustomerDetails(customer.id);
  };

  // Client-side filtering for status since API might not support it directly based on doc
  const filteredCustomers = useMemo(() => {
    return customers.filter(customer => {
      // Search is already handled by API, but if we wanted client side search we'd do it here.
      // API search might be fuzzy, client side matches exact string if status change.
      // But since we refetch on search term change, we just need to filter by status here locally if needed.
      // Actually status is filterable in API? Doc says search, page, limit, vipOnly.
      // It doesn't explicitly say status. So we filter status client-side.

      const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' ? customer.isActive : !customer.isActive);
      return matchesStatus;
    });
  }, [customers, statusFilter]);

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">

      {/* --- Header Area --- */}
      <div className="mb-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h2 className="font-serif text-2xl font-medium text-softBlack">Müşteriler</h2>
            <p className="text-stone-500 text-sm mt-1">Müşteri veri tabanını yönetin ve analiz edin.</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 text-stone-600 rounded-lg hover:bg-stone-50 transition-colors text-sm font-medium">
              <Download size={16} />
              <span>Dışa Aktar</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-softBlack text-white rounded-lg hover:bg-stone-800 transition-colors shadow-md text-sm font-medium">
              <Plus size={16} />
              <span>Müşteri Ekle</span>
            </button>
          </div>
        </div>

        {/* İstatistik Kartları */}
        {/* Note: In a real app these stats might come from a stats endpoint or derived from list if paginated list is full */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl border border-stone-100 flex items-center justify-between">
            <div>
              <p className="text-stone-500 text-xs font-medium uppercase tracking-wider">Toplam Müşteri</p>
              <h3 className="text-2xl font-serif text-softBlack mt-1">{customers.length}</h3>
            </div>
            <div className="p-3 bg-stone-50 rounded-full text-stone-400">
              <User size={20} />
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-stone-100 flex items-center justify-between">
            <div>
              <p className="text-stone-500 text-xs font-medium uppercase tracking-wider">VIP Üyeler</p>
              <h3 className="text-2xl font-serif text-softBlack mt-1">
                {customers.filter(c => c.isVip).length}
              </h3>
            </div>
            <div className="p-3 bg-amber-50 rounded-full text-amber-500">
              <Star size={20} fill="currentColor" />
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-stone-100 flex items-center justify-between">
            <div>
              <p className="text-stone-500 text-xs font-medium uppercase tracking-wider">Aktif Üyeler</p>
              <h3 className="text-2xl font-serif text-softBlack mt-1">
                {customers.filter(c => c.isActive).length}
              </h3>
            </div>
            <div className="p-3 bg-green-50 rounded-full text-green-600">
              <User size={20} />
            </div>
          </div>
        </div>

        {/* Arama ve Filtre */}
        <div className="bg-white p-2 rounded-xl border border-stone-100 flex flex-col md:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <input
              type="text"
              placeholder="İsim, e-posta veya telefon ile ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-transparent border-none focus:outline-none text-sm text-softBlack"
            />
          </div>
          <div className="h-8 w-px bg-stone-200 hidden md:block self-center mx-2" />
          <div className="flex gap-2 overflow-x-auto p-1 md:p-0">
            {['all', 'active', 'inactive'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status as any)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize whitespace-nowrap transition-colors ${statusFilter === status
                    ? 'bg-softBlack text-white'
                    : 'bg-stone-50 text-stone-500 hover:bg-stone-100'
                  }`}
              >
                {status === 'all' ? 'Tümü' : status === 'active' ? 'Aktif' : 'Pasif'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* --- Main Content Split --- */}
      <div className="flex-1 flex gap-6 overflow-hidden relative">

        {/* Müşteri Listesi */}
        <div className={`flex-1 flex flex-col transition-all duration-500 ease-in-out bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden ${selectedCustomer ? 'hidden lg:flex lg:w-3/5 lg:flex-none' : 'w-full'}`}>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead className="bg-stone-50/50 text-xs uppercase tracking-wider text-stone-500 border-b border-stone-100 sticky top-0 z-10 backdrop-blur-sm">
                <tr>
                  <th className="px-6 py-4 font-medium">Müşteri</th>
                  <th className="px-6 py-4 font-medium hidden md:table-cell">İletişim</th>
                  <th className="px-6 py-4 font-medium hidden sm:table-cell">Şehir</th>
                  <th className="px-6 py-4 font-medium text-right">Harcama</th>
                  <th className="px-6 py-4 font-medium text-center">Durum</th>
                  <th className="px-6 py-4 font-medium text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {isLoading && customers.length === 0 ? (
                  <tr><td colSpan={6} className="p-10 text-center"><div className="inline-block animate-spin h-6 w-6 border-2 border-softBlack border-t-transparent rounded-full" /></td></tr>
                ) : (
                  <AnimatePresence>
                    {filteredCustomers.length > 0 ? (
                      filteredCustomers.map((customer) => (
                        <motion.tr
                          key={customer.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          onClick={() => handleCustomerClick(customer)}
                          className={`group hover:bg-stone-50/80 cursor-pointer transition-colors ${selectedCustomer?.id === customer.id ? 'bg-stone-50' : ''}`}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-cream border border-stone-200 flex items-center justify-center text-softBlack font-serif font-medium uppercase">
                                {customer.name.substring(0, 2)}
                              </div>
                              <div>
                                <div className="font-medium text-softBlack flex items-center gap-2">
                                  {customer.name}
                                  {customer.isVip && (
                                    <div className="p-0.5 bg-amber-500 rounded-full border border-white text-white" title="VIP">
                                      <Star size={8} fill="currentColor" />
                                    </div>
                                  )}
                                </div>
                                <div className="text-xs text-stone-400 font-mono mt-0.5">#{customer.id.substring(0, 8)}...</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 hidden md:table-cell">
                            <div className="flex flex-col gap-1">
                              <span className="text-sm text-stone-600 flex items-center gap-2">
                                <Mail size={12} className="text-stone-400" /> {customer.email}
                              </span>
                              <span className="text-xs text-stone-400 flex items-center gap-2">
                                <Phone size={12} /> {customer.phone}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-stone-600 hidden sm:table-cell">
                            {customer.addresses?.[0]?.city || '-'}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="font-medium text-softBlack">{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(customer.totalSpent)}</div>
                            <div className="text-xs text-stone-400">{customer.orderCount} sipariş</div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${customer.isActive
                                ? 'bg-green-50 text-green-700 border-green-100'
                                : 'bg-stone-100 text-stone-600 border-stone-200'
                              }`}>
                              {customer.isActive ? 'Aktif' : 'Pasif'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button className="p-2 text-stone-400 hover:text-softBlack rounded-lg hover:bg-white transition-colors">
                              <ArrowRight size={16} />
                            </button>
                          </td>
                        </motion.tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-stone-500">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <Filter className="w-8 h-8 text-stone-300" />
                            <p>Müşteri bulunamadı.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
                )}
              </tbody>
            </table>
          </div>
          <div className="p-3 border-t border-stone-100 bg-stone-50/50 text-xs text-center text-stone-500">
            Toplam {filteredCustomers.length} müşteri listeleniyor
          </div>
        </div>

        {/* Detay Paneli (Slide Over) */}
        <AnimatePresence>
          {selectedCustomer && (
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute inset-0 lg:static lg:flex-1 bg-offWhite lg:bg-transparent z-20 h-full overflow-hidden"
            >
              <div className="h-full bg-white rounded-2xl border border-stone-100 shadow-xl overflow-y-auto flex flex-col relative">

                {/* Close Button Mobile */}
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="absolute top-4 right-4 z-10 p-2 bg-white/50 backdrop-blur-sm rounded-full text-stone-500 hover:text-softBlack lg:hidden"
                >
                  <X size={20} />
                </button>

                {/* Profile Header */}
                <div className="relative">
                  <div className="h-32 bg-stone-800 w-full"></div>
                  <div className="px-6 pb-6 -mt-12 flex flex-col items-center text-center">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full border-4 border-white bg-cream flex items-center justify-center text-3xl font-serif font-medium text-softBlack shadow-sm uppercase">
                        {selectedCustomer.name.substring(0, 2)}
                      </div>
                      {selectedCustomer.isVip && (
                        <div className="absolute bottom-0 right-0 p-1.5 bg-amber-500 rounded-full border-2 border-white text-white shadow-sm" title="VIP Müşteri">
                          <Star size={14} fill="currentColor" />
                        </div>
                      )}
                    </div>

                    <h3 className="mt-3 font-serif text-xl font-medium text-softBlack">{selectedCustomer.name}</h3>
                    <p className="text-stone-500 text-sm flex items-center gap-1">
                      <MapPin size={12} /> {selectedCustomer.addresses?.[0]?.city || 'Şehir Yok'}, {selectedCustomer.addresses?.[0]?.country || 'Ülke Yok'}
                    </p>

                    <div className="flex gap-3 mt-4 w-full justify-center">
                      <button className="flex-1 max-w-[120px] py-2 bg-softBlack text-white rounded-lg text-xs font-medium hover:bg-stone-800 transition-colors">
                        Düzenle
                      </button>
                      <button className="flex-1 max-w-[120px] py-2 border border-stone-200 text-softBlack rounded-lg text-xs font-medium hover:bg-stone-50 transition-colors">
                        Mesaj At
                      </button>
                    </div>
                  </div>
                </div>

                {/* İstatistikler */}
                <div className="grid grid-cols-2 gap-px bg-stone-100 border-y border-stone-100">
                  <div className="bg-white p-4 text-center">
                    <span className="block text-xs text-stone-500 uppercase tracking-wider mb-1">Toplam Harcama</span>
                    <span className="font-serif text-lg font-medium text-softBlack">
                      {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(selectedCustomer.totalSpent)}
                    </span>
                  </div>
                  <div className="bg-white p-4 text-center">
                    <span className="block text-xs text-stone-500 uppercase tracking-wider mb-1">Sipariş Sayısı</span>
                    <span className="font-serif text-lg font-medium text-softBlack">{selectedCustomer.orderCount}</span>
                  </div>
                </div>

                {/* İletişim Bilgileri */}
                <div className="p-6 space-y-6">
                  <div>
                    <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">İletişim Bilgileri</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-stone-50 border border-stone-100">
                        <div className="p-2 bg-white rounded-full text-stone-400">
                          <Mail size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-stone-500">E-posta Adresi</p>
                          <p className="text-sm font-medium text-softBlack truncate">{selectedCustomer.email}</p>
                        </div>
                        <button className="text-stone-400 hover:text-softBlack"><ExternalLink size={14} /></button>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-stone-50 border border-stone-100">
                        <div className="p-2 bg-white rounded-full text-stone-400">
                          <Phone size={16} />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-stone-500">Telefon Numarası</p>
                          <p className="text-sm font-medium text-softBlack">{selectedCustomer.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-stone-50 border border-stone-100">
                        <div className="p-2 bg-white rounded-full text-stone-400">
                          <Calendar size={16} />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-stone-500">Katılım Tarihi</p>
                          <p className="text-sm font-medium text-softBlack">{new Date(selectedCustomer.createdAt).toLocaleDateString('tr-TR')}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Notlar */}
                  {selectedCustomer.notes && (
                    <div>
                      <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">Notlar</h4>
                      <div className="p-4 bg-amber-50 text-amber-900 text-sm rounded-xl border border-amber-100 italic">
                        "{selectedCustomer.notes}"
                      </div>
                    </div>
                  )}

                  {/* Son Siparişler Display */}
                  {selectedCustomer.recentOrders && selectedCustomer.recentOrders.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">Son Siparişler</h4>
                      <div className="space-y-3">
                        {selectedCustomer.recentOrders.map(order => (
                          <div key={order.id} className="flex items-center justify-between p-3 border border-stone-100 rounded-lg hover:bg-stone-50 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-stone-100 rounded-lg text-stone-500">
                                <ShoppingBag size={16} />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-softBlack">#{order.orderNumber}</p>
                                <p className="text-xs text-stone-500">{order.createdAt && new Date(order.createdAt).toLocaleDateString('tr-TR')}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-softBlack">{order.total} ₺</p>
                              <span className={`text-[10px] uppercase font-bold ${order.status === 'delivered' ? 'text-green-600' :
                                  order.status === 'cancelled' ? 'text-red-600' : 'text-amber-600'
                                }`}>
                                {order.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
