import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { SystemHealth } from '../../types';
import {
    Activity,
    Database,
    Server,
    Clock,
    ShieldCheck,
    Cpu,
    RefreshCw,
    GitCommit
} from 'lucide-react';
import { motion } from 'framer-motion';

const HealthCard = ({
    title,
    status,
    icon: Icon,
    details
}: {
    title: string;
    status: 'ok' | 'degraded' | 'error' | 'unknown' | 'running';
    icon: any;
    details?: string;
}) => {
    const statusColors = {
        ok: 'bg-green-100 text-green-700 border-green-200',
        running: 'bg-green-100 text-green-700 border-green-200',
        degraded: 'bg-amber-100 text-amber-700 border-amber-200',
        error: 'bg-red-100 text-red-700 border-red-200',
        unknown: 'bg-stone-100 text-stone-700 border-stone-200'
    };

    const statusText = {
        ok: 'Normal',
        running: 'Çalışıyor',
        degraded: 'Performans Düşüşü',
        error: 'Hata',
        unknown: 'Bilinmiyor'
    };

    return (
        <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-stone-50 rounded-xl text-softBlack">
                    <Icon size={24} strokeWidth={1.5} />
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusColors[status] || statusColors.unknown}`}>
                    {statusText[status] || 'Bilinmiyor'}
                </span>
            </div>
            <div>
                <h3 className="text-lg font-serif font-medium mb-1">{title}</h3>
                {details && <p className="text-sm text-stone-500">{details}</p>}
            </div>
        </div>
    );
};

const MetricRow = ({ label, value, icon: Icon }: { label: string; value: string; icon: any }) => (
    <div className="flex items-center justify-between p-4 hover:bg-stone-50 transition-colors rounded-lg">
        <div className="flex items-center gap-3">
            <div className="text-stone-400">
                <Icon size={18} />
            </div>
            <span className="text-stone-600 text-sm font-medium">{label}</span>
        </div>
        <span className="font-mono text-softBlack text-sm">{value}</span>
    </div>
);

export default function SystemHealthPage() {
    const [apiStatus, setApiStatus] = useState<'running' | 'error' | 'unknown'>('unknown');
    const [healthData, setHealthData] = useState<SystemHealth | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
    const [isLoading, setIsLoading] = useState(false);

    const fetchHealth = async () => {
        setIsLoading(true);
        try {
            // Check simple API root first
            try {
                await api.health.getApiStatus();
                setApiStatus('running');
            } catch (e) {
                setApiStatus('error');
            }

            // Check detailed system health
            const data = await api.health.getSystemHealth();
            setHealthData(data);
        } catch (error) {
            console.error('Failed to fetch health data:', error);
        } finally {
            setIsLoading(false);
            setLastUpdated(new Date());
        }
    };

    useEffect(() => {
        fetchHealth();
        // Auto refresh every 30 seconds
        const interval = setInterval(fetchHealth, 30000);
        return () => clearInterval(interval);
    }, []);

    const formatUptime = (seconds: number) => {
        const days = Math.floor(seconds / (3600 * 24));
        const hours = Math.floor((seconds % (3600 * 24)) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${days}g ${hours}s ${minutes}d`;
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-stone-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-serif font-medium mb-1">Sistem Durumu</h1>
                    <p className="text-stone-500 text-sm">Sunucu ve veritabanı sağlık kontrolleri</p>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-xs text-stone-400">Son Güncelleme: {lastUpdated.toLocaleTimeString()}</span>
                    <button
                        onClick={fetchHealth}
                        className={`p-2 bg-stone-100 hover:bg-stone-200 rounded-full text-stone-600 transition-colors ${isLoading ? 'animate-spin' : ''}`}
                    >
                        <RefreshCw size={20} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <HealthCard
                    title="API Ağ Geçidi"
                    status={apiStatus}
                    icon={Server}
                    details="HTTP İstekleri yanıt veriyor"
                />
                <HealthCard
                    title="Veritabanı"
                    status={healthData?.checks.database === 'ok' ? 'ok' : 'error'}
                    icon={Database}
                    details="PostgreSQL bağlantısı aktif"
                />
                <HealthCard
                    title="Genel Sağlık"
                    status={healthData?.status || 'unknown'}
                    icon={Activity}
                    details="Tüm sistem bileşenleri"
                />
            </div>

            {healthData && (
                <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-stone-100">
                        <h3 className="font-serif text-lg font-medium">Teknik Detaylar</h3>
                    </div>
                    <div className="divide-y divide-stone-100 p-2">
                        <MetricRow
                            label="Çalışma Süresi (Uptime)"
                            value={formatUptime(healthData.uptime)}
                            icon={Clock}
                        />
                        <MetricRow
                            label="Ortam (Environment)"
                            value={healthData.environment}
                            icon={ShieldCheck}
                        />
                        <MetricRow
                            label="Versiyon"
                            value={healthData.version}
                            icon={GitCommit}
                        />
                        <MetricRow
                            label="Veritabanı Havuzu"
                            value={healthData.checks.pool === 'ok' ? 'Sağlıklı' : 'Sorunlu'}
                            icon={Cpu}
                        />
                        {healthData.poolMetrics && (
                            <MetricRow
                                label="Aktif / Boş Bağlantılar"
                                value={`${healthData.poolMetrics.activeCount} / ${healthData.poolMetrics.idleCount}`}
                                icon={Database}
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
