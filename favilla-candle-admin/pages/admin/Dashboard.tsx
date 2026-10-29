
import React, { useEffect, useState } from 'react';
import {
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { motion } from 'framer-motion';
import { api } from '../../services/api';
import { DashboardStats, Order, SalesChartData } from '../../types';

interface StatCardProps {
  title: string;
  value: string;
  icon: any;
  trend?: string;
  trendUp?: boolean;
}

const StatCard = ({ title, value, icon: Icon, trend, trendUp }: StatCardProps) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm flex flex-col justify-between h-32"
  >
    <div className="flex justify-between items-start">
      <div>
        <p className="text-stone-500 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-2xl font-serif font-semibold text-softBlack">{value}</h3>
      </div>
      <div className="p-2 bg-cream rounded-full text-softBlack">
        <Icon size={20} strokeWidth={1.5} />
      </div>
    </div>
    <div className="flex items-center gap-1 text-xs">
      <span className={trendUp ? 'text-green-600 font-medium' : 'text-red-500 font-medium'}>
        {trend}
      </span>
      {trend && <span className="text-stone-400">geçen döneme göre</span>}
    </div>
  </motion.div>
);

const STATUS_MAP: Record<string, { label: string; classes: string }> = {
  processing: { label: 'Hazırlanıyor', classes: 'bg-amber-100 text-amber-800' },
  shipped: { label: 'Kargolandı', classes: 'bg-blue-100 text-blue-800' },
  delivered: { label: 'Teslim Edildi', classes: 'bg-green-100 text-green-800' },
  cancelled: { label: 'İptal', classes: 'bg-red-100 text-red-800' },
  returned: { label: 'İade', classes: 'bg-purple-100 text-purple-800' },
};

const RecentOrdersTable = ({ orders }: { orders: Order[] }) => (
  <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
    <div className="p-6 border-b border-stone-100 flex justify-between items-center">
      <h3 className="font-serif text-lg font-medium">Son Siparişler</h3>
      <a href="#/admin/orders" className="text-sm text-stone-500 hover:text-softBlack flex items-center gap-1">
        Tümünü Gör <ArrowRight size={14} />
      </a>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-cream/50 text-stone-500 text-xs uppercase tracking-wider">
          <tr>
            <th className="px-6 py-4 font-medium">Sipariş No</th>
            <th className="px-6 py-4 font-medium">Müşteri</th>
            <th className="px-6 py-4 font-medium">Tarih</th>
            <th className="px-6 py-4 font-medium">Durum</th>
            <th className="px-6 py-4 font-medium text-right">Tutar</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {orders.map((order) => {
            const statusInfo = STATUS_MAP[order.status] || { label: order.status, classes: 'bg-gray-100 text-gray-800' };
            return (
              <tr key={order.id} className="hover:bg-stone-50/50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-softBlack">{order.orderNumber}</td>
                <td className="px-6 py-4 text-sm text-stone-600">{order.customerName || 'Misafir'}</td>
                <td className="px-6 py-4 text-sm text-stone-500">{new Date(order.createdAt).toLocaleDateString('tr-TR')}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statusInfo.classes}`}>
                    {statusInfo.label}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-medium text-right">
                  {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(order.total)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </div>
);

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [salesData, setSalesData] = useState<SalesChartData['data']>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, salesRes, ordersRes] = await Promise.all([
          api.dashboard.getStats(),
          api.dashboard.getSalesChart(period),
          api.dashboard.getRecentOrders()
        ]);

        if (statsRes.success) setStats(statsRes.data);
        if (salesRes.success) setSalesData(salesRes.data.data);
        if (ordersRes.success) setRecentOrders(ordersRes.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [period]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-softBlack"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Toplam Satış"
            value={new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(stats.totalSales.value)}
            icon={DollarSign}
            trend={(stats.totalSales.change > 0 ? '+' : '') + stats.totalSales.change + '%'}
            trendUp={stats.totalSales.trend === 'up'}
          />
          <StatCard
            title="Aktif Siparişler"
            value={stats.activeOrders.value.toString()}
            icon={ShoppingBag}
            trend={(stats.activeOrders.change > 0 ? '+' : '') + stats.activeOrders.change + '%'}
            trendUp={stats.activeOrders.trend === 'up'} // Usually down is good for backlog, but let's assume up is activity
          />
          <StatCard
            title="Toplam Müşteri"
            value={stats.totalCustomers.value.toString()}
            icon={Users}
            trend={(stats.totalCustomers.change > 0 ? '+' : '') + stats.totalCustomers.change + '%'}
            trendUp={stats.totalCustomers.trend === 'up'}
          />
          <StatCard
            title="Stok Durumu"
            value={`${stats.stockStatus.value} Ürün`}
            icon={Package}
            trend={`${stats.stockStatus.lowStockCount} Az Stok`}
            trendUp={false}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-stone-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-serif text-lg font-medium">Satış Özeti</h3>
            <div className="flex gap-2 text-xs">
              {(['week', 'month', 'year'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1 rounded-full capitalize ${period === p ? 'bg-softBlack text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                >
                  {p === 'week' ? 'Haftalık' : p === 'month' ? 'Aylık' : 'Yıllık'}
                </button>
              ))}
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1C1917" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#1C1917" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#78716c', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#78716c', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e7e5e4', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}
                  itemStyle={{ color: '#1c1917', fontSize: '14px', fontWeight: 500 }}
                  formatter={(value: any) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value)}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#1C1917"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorSales)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sales Target */}
        {stats && (
          <div className="bg-gradient-to-br from-softBlack to-stone-800 rounded-2xl p-6 text-white flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-6">
                <TrendingUp className="text-cream" />
              </div>
              <h3 className="font-serif text-2xl mb-2">Hedeflere Ulaşım</h3>
              <p className="text-stone-300 text-sm leading-relaxed">
                Bu dönemki satış hedefinin %{stats.salesTarget.percentage.toFixed(1)}'ine ulaştınız.
              </p>
            </div>
            <div className="space-y-4">
              <div className="w-full bg-white/10 rounded-full h-2">
                <div
                  className="bg-cream h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min(stats.salesTarget.percentage, 100)}%` }}
                ></div>
              </div>
              <p className="text-right text-xs text-stone-400">
                Hedef: {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(stats.salesTarget.target)}
              </p>
            </div>
          </div>
        )}
      </div>

      <RecentOrdersTable orders={recentOrders} />
    </div>
  );
}