import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { AuditLog, AuditLogFilters } from '../../types';
import { Search, RotateCcw, Eye, X, ChevronLeft, ChevronRight, FileJson } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock Component for now, assuming standard styles
const FilterSelect = ({
    label,
    value,
    onChange,
    options
}: {
    label: string;
    value: string;
    onChange: (val: string) => void;
    options: { value: string; label: string }[]
}) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-stone-500 uppercase tracking-wider">{label}</label>
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-softBlack transition-shadow"
        >
            <option value="">Tümü</option>
            {options.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
        </select>
    </div>
);

const FilterInput = ({
    label,
    value,
    onChange,
    placeholder
}: {
    label: string;
    value: string;
    onChange: (val: string) => void;
    placeholder?: string
}) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-stone-500 uppercase tracking-wider">{label}</label>
        <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-softBlack transition-shadow"
        />
    </div>
);

export default function AuditLogs() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filters, setFilters] = useState<AuditLogFilters>({
        page: 1,
        limit: 20
    });
    const [pagination, setPagination] = useState({
        total: 0,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
    });
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchLogs = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.audit.getAll(filters);
            if (response.success) {
                setLogs(response.data);
                if (response.pagination) {
                    setPagination(prev => ({
                        ...prev, // Keep existing type safety
                        total: response.pagination!.total,
                        totalPages: response.pagination!.totalPages,
                        hasNext: response.pagination!.hasNext,
                        hasPrev: response.pagination!.hasPrev
                    }));
                }
            }
        } catch (err: any) {
            console.error('Failed to fetch audit logs:', err);
            // 403 Access Denied handling if not caught by interceptor
            if (err.response && err.response.status === 403) {
                setError('Bu sayfayı görüntüleme yetkiniz yok (403 Forbidden). Lütfen yönetici olduğunuzdan emin olun.');
            } else {
                setError('Veriler yüklenirken bir hata oluştu. Oturumunuzun süresi dolmuş olabilir.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [filters.page, filters.limit]); // Trigger on page change

    const handleSearch = () => {
        setFilters(prev => ({ ...prev, page: 1 })); // Reset to page 1 on search
        fetchLogs();
    };

    const clearFilters = () => {
        setFilters({ page: 1, limit: 20 });
        // fetchLogs will trigger via useEffect if page changed, usually better to call explicitly if page didn't change
        setTimeout(fetchLogs, 0);
    };

    // Render Status Badge
    const renderStatus = (status: string) => {
        const map: Record<string, string> = {
            success: 'bg-green-100 text-green-800',
            failed: 'bg-amber-100 text-amber-800',
            error: 'bg-red-100 text-red-800'
        };
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${map[status] || 'bg-gray-100 text-gray-800'}`}>
                {status}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <X className="h-5 w-5 text-red-400" aria-hidden="true" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-700 font-medium">
                                {error}
                            </p>
                        </div>
                    </div>
                </div>
            )}
            {/* Detail Modal */}
            <AnimatePresence>
                {selectedLog && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedLog(null)}
                            className="absolute inset-0 bg-softBlack/30 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[85vh] overflow-hidden relative z-10 flex flex-col"
                        >
                            <div className="flex justify-between items-center p-5 border-b border-stone-100">
                                <h3 className="font-serif text-xl font-medium flex items-center gap-2">
                                    <FileJson size={20} className="text-stone-400" />
                                    Log Detayı
                                </h3>
                                <button onClick={() => setSelectedLog(null)} className="text-stone-400 hover:text-softBlack">
                                    <X size={24} />
                                </button>
                            </div>
                            <div className="p-6 overflow-y-auto space-y-6">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="block text-stone-500 text-xs uppercase tracking-wider mb-1">Tarih</span>
                                        <span className="font-medium text-softBlack">{new Date(selectedLog.created_at).toLocaleString('tr-TR')}</span>
                                    </div>
                                    <div>
                                        <span className="block text-stone-500 text-xs uppercase tracking-wider mb-1">Status</span>
                                        {renderStatus(selectedLog.status)}
                                    </div>
                                    <div>
                                        <span className="block text-stone-500 text-xs uppercase tracking-wider mb-1">Action</span>
                                        <span className="font-mono text-softBlack bg-stone-50 px-2 py-1 rounded border border-stone-100">{selectedLog.action}</span>
                                    </div>
                                    <div>
                                        <span className="block text-stone-500 text-xs uppercase tracking-wider mb-1">Resource</span>
                                        <span className="font-mono text-softBlack">{selectedLog.resource_type} / {selectedLog.resource_id || '-'}</span>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="block text-stone-500 text-xs uppercase tracking-wider mb-1">User Agent & IP</span>
                                        <span className="font-mono text-stone-600 break-all">{selectedLog.ip_address} - {selectedLog.user_agent}</span>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="block text-stone-500 text-xs uppercase tracking-wider mb-1">Description</span>
                                        <span className="text-stone-700">{selectedLog.description || '-'}</span>
                                    </div>
                                </div>

                                {selectedLog.old_values && (
                                    <div>
                                        <span className="block text-red-500 text-xs uppercase tracking-wider mb-2 font-medium">Eski Değerler</span>
                                        <pre className="bg-red-50 p-4 rounded-lg text-xs font-mono text-softBlack overflow-x-auto border border-red-100">
                                            {JSON.stringify(selectedLog.old_values, null, 2)}
                                        </pre>
                                    </div>
                                )}

                                {selectedLog.new_values && (
                                    <div>
                                        <span className="block text-green-600 text-xs uppercase tracking-wider mb-2 font-medium">Yeni Değerler</span>
                                        <pre className="bg-green-50 p-4 rounded-lg text-xs font-mono text-softBlack overflow-x-auto border border-green-100">
                                            {JSON.stringify(selectedLog.new_values, null, 2)}
                                        </pre>
                                    </div>
                                )}

                                {selectedLog.error_message && (
                                    <div>
                                        <span className="block text-red-600 text-xs uppercase tracking-wider mb-2 font-medium">Hata Mesajı</span>
                                        <div className="bg-red-50 p-4 rounded-lg text-sm text-red-700 border border-red-100">
                                            {selectedLog.error_message}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Filters */}
            <div className="bg-white p-5 rounded-2xl border border-stone-100 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <FilterSelect
                        label="Durum"
                        value={filters.status || ''}
                        onChange={(v) => setFilters(prev => ({ ...prev, status: v as any }))}
                        options={[
                            { value: 'success', label: 'Success' },
                            { value: 'failed', label: 'Failed' },
                            { value: 'error', label: 'Error' }
                        ]}
                    />
                    <FilterSelect
                        label="Resource Type"
                        value={filters.resource_type || ''}
                        onChange={(v) => setFilters(prev => ({ ...prev, resource_type: v }))}
                        options={[
                            { value: 'product', label: 'Product' },
                            { value: 'order', label: 'Order' },
                            { value: 'user', label: 'User' },
                            { value: 'auth', label: 'Auth' }
                        ]}
                    />
                    <FilterInput
                        label="Admin ID"
                        value={filters.admin_id || ''}
                        onChange={(v) => setFilters(prev => ({ ...prev, admin_id: v }))}
                        placeholder="UUID..."
                    />
                    <FilterInput
                        label="Resource ID"
                        value={filters.resource_id || ''}
                        onChange={(v) => setFilters(prev => ({ ...prev, resource_id: v }))}
                        placeholder="UUID..."
                    />
                </div>
                <div className="mt-4 pt-4 border-t border-stone-100 flex justify-end gap-3">
                    <button
                        onClick={clearFilters}
                        className="px-4 py-2 text-stone-500 hover:bg-stone-50 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                    >
                        <RotateCcw size={16} /> Filters Clear
                    </button>
                    <button
                        onClick={handleSearch}
                        className="px-6 py-2 bg-softBlack text-white rounded-lg text-sm font-medium hover:bg-black transition-colors flex items-center gap-2"
                    >
                        <Search size={16} /> Search
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-cream/50 text-stone-500 text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 font-medium">Tarih</th>
                                <th className="px-6 py-4 font-medium">Action</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium">Resource</th>
                                <th className="px-6 py-4 font-medium">IP Address</th>
                                <th className="px-6 py-4 font-medium text-right">Detay</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-4 bg-stone-100 rounded w-32"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-stone-100 rounded w-24"></div></td>
                                        <td className="px-6 py-4"><div className="h-6 bg-stone-100 rounded-full w-20"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-stone-100 rounded w-24"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-stone-100 rounded w-24"></div></td>
                                        <td className="px-6 py-4 text-right"><div className="h-8 w-8 bg-stone-100 rounded ml-auto"></div></td>
                                    </tr>
                                ))
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-stone-400">
                                        Kayıt bulunamadı.
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-stone-50/50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-stone-500">
                                            {new Date(log.created_at).toLocaleString('tr-TR')}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-softBlack">
                                            {log.action}
                                        </td>
                                        <td className="px-6 py-4">
                                            {renderStatus(log.status)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-stone-600">
                                            <span className="bg-stone-100 px-2 py-0.5 rounded text-xs font-mono mr-2">{log.resource_type}</span>
                                            <span className="font-mono text-xs">{log.resource_id?.slice(0, 8)}...</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-mono text-stone-400">
                                            {log.ip_address}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => setSelectedLog(log)}
                                                className="p-2 text-stone-400 hover:text-softBlack hover:bg-stone-100 rounded-lg transition-colors"
                                            >
                                                <Eye size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-stone-100 flex items-center justify-between">
                    <span className="text-sm text-stone-500">
                        Toplam {pagination.total} kayıttan {(filters.page! - 1) * filters.limit! + 1}-{Math.min(filters.page! * filters.limit!, pagination.total)} arası gösteriliyor
                    </span>
                    <div className="flex gap-2">
                        <button
                            disabled={!pagination.hasPrev}
                            onClick={() => setFilters(prev => ({ ...prev, page: (prev.page || 1) - 1 }))}
                            className="p-2 border border-stone-200 rounded-lg hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button
                            disabled={!pagination.hasNext}
                            onClick={() => setFilters(prev => ({ ...prev, page: (prev.page || 1) + 1 }))}
                            className="p-2 border border-stone-200 rounded-lg hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
