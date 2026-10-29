import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { SupportTicket } from '../../types';
import { MessageSquare, Search, Filter, RefreshCcw } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Support() {
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTickets = async () => {
        setIsLoading(true);
        try {
            const response = await api.support.getAll();
            if (response.success) {
                setTickets(response.data);
            }
        } catch (err: any) {
            setError(err.message || 'Destek talepleri yüklenirken hata oluştu.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open': return 'bg-green-100 text-green-800 border-green-200';
            case 'closed': return 'bg-stone-100 text-stone-600 border-stone-200';
            case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200';
            default: return 'bg-stone-100 text-stone-600';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
                <div>
                    <h2 className="font-serif text-2xl font-medium text-softBlack">Destek Talepleri</h2>
                    <p className="text-stone-500 text-sm mt-1">Müşteri geri bildirimleri ve yardım istekleri.</p>
                </div>
                <button
                    onClick={fetchTickets}
                    className="mt-4 md:mt-0 px-4 py-2 bg-stone-50 text-stone-600 rounded-lg hover:bg-stone-100 transition-colors flex items-center gap-2"
                >
                    <RefreshCcw size={16} /> Yenile
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-cream/50 text-stone-500 text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 font-medium">Tarih</th>
                                <th className="px-6 py-4 font-medium">Konu</th>
                                <th className="px-6 py-4 font-medium">Kullanıcı</th>
                                <th className="px-6 py-4 font-medium">Durum</th>
                                <th className="px-6 py-4 font-medium text-right">İşlem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                            {isLoading ? (
                                <tr><td colSpan={5} className="px-6 py-12 text-center text-stone-400">Yükleniyor...</td></tr>
                            ) : tickets.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-12 text-center text-stone-400">Destek talebi bulunamadı.</td></tr>
                            ) : (
                                tickets.map((ticket) => (
                                    <tr key={ticket.id} className="hover:bg-stone-50/50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-stone-500">
                                            {new Date(ticket.createdAt).toLocaleDateString('tr-TR')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="block font-medium text-softBlack">{ticket.subject}</span>
                                            <span className="text-xs text-stone-400 truncate max-w-xs block">{ticket.message}</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-stone-600">
                                            {ticket.user?.name || ticket.userId}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(ticket.status)}`}>
                                                {ticket.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-stone-400 hover:text-softBlack p-2 rounded-lg hover:bg-stone-100">
                                                <MessageSquare size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
