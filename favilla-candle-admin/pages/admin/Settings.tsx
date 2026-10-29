
import React, { useState, useEffect } from 'react';
import {
  Store,
  User,
  Bell,
  CreditCard,
  Lock,
  Save,
  Upload,
  Globe,
  Truck,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../services/api';
import { GeneralSettings, NotificationSettings, ShippingSettings } from '../../types';

// --- Components ---

// Özel Toggle Switch Bileşeni
const Toggle = ({ label, description, checked, onChange }: { label: string, description?: string, checked: boolean, onChange: () => void }) => (
  <div className="flex items-center justify-between py-4 border-b border-stone-100 last:border-0">
    <div className="pr-4">
      <h4 className="text-sm font-medium text-softBlack">{label}</h4>
      {description && <p className="text-xs text-stone-500 mt-1">{description}</p>}
    </div>
    <button
      onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-400 ${checked ? 'bg-softBlack' : 'bg-stone-200'
        }`}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={`block w-5 h-5 bg-white rounded-full shadow transform pointer-events-none mt-0.5 ml-0.5 ${checked ? 'translate-x-5' : 'translate-x-0'
          }`}
      />
    </button>
  </div>
);

// Form Input Grubu
const InputGroup = ({ label, type = "text", value, onChange, placeholder, helper, name }: any) => (
  <div className="space-y-1.5">
    <label className="block text-sm font-medium text-stone-700">{label}</label>
    <input
      type={type}
      name={name}
      value={value || ''}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-softBlack focus:bg-white transition-all text-softBlack placeholder:text-stone-400"
    />
    {helper && <p className="text-xs text-stone-400">{helper}</p>}
  </div>
);

// --- Sections ---

const GeneralSettingsSection = () => {
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<GeneralSettings | null>(null);

  useEffect(() => {
    api.settings.getGeneral().then(res => {
      setFormData(res.data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => prev ? ({ ...prev, [name]: value }) : null);
  };

  if (loading) return <div>Yükleniyor...</div>;
  if (!formData) return <div>Veri yüklenemedi.</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-2xl"
    >
      <div className="bg-white p-6 rounded-2xl border border-stone-100 space-y-6">
        <h3 className="font-serif text-lg font-medium text-softBlack border-b border-stone-100 pb-4">Mağaza Bilgileri</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputGroup label="Mağaza Adı" name="siteName" value={formData.siteName} onChange={handleChange} />
          <InputGroup label="Destek E-postası" name="contactEmail" value={formData.contactEmail} onChange={handleChange} />
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Mağaza Açıklaması</label>
            <textarea
              name="siteDescription"
              rows={3}
              value={formData.siteDescription}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-softBlack focus:bg-white transition-all text-softBlack"
            ></textarea>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-stone-100">
        <h3 className="font-serif text-lg font-medium text-softBlack border-b border-stone-100 pb-4 mb-4">Site Yapılandırması</h3>
        <Toggle
          label="Bakım Modu"
          description="Siteyi ziyaretçilere kapatır ve sadece bakım sayfasını gösterir."
          checked={false}
          onChange={() => { }}
        />
        <Toggle
          label="Çoklu Dil Desteği (EN/TR)"
          description="Sitenin İngilizce versiyonunu aktif hale getirir."
          checked={true}
          onChange={() => { }}
        />
      </div>
    </motion.div>
  );
};

const ProfileSettingsSection = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null); // Using any temporarily for user profile form state flexibilitiy

  useEffect(() => {
    api.settings.getProfile().then(res => {
      setUser(res.data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser((prev: any) => prev ? ({ ...prev, [name]: value }) : null);
  };

  if (loading) return <div>Yükleniyor...</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-2xl"
    >
      <div className="bg-white p-6 rounded-2xl border border-stone-100 flex flex-col md:flex-row items-center gap-6">
        <div className="relative group cursor-pointer">
          <div className="w-24 h-24 rounded-full bg-cream border-4 border-stone-50 flex items-center justify-center text-3xl font-serif font-medium text-softBlack">
            {user?.name?.substring(0, 2).toUpperCase()}
          </div>
          <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Upload className="text-white" size={20} />
          </div>
        </div>
        <div className="flex-1 text-center md:text-left">
          <h3 className="font-serif text-xl font-medium text-softBlack">{user?.name}</h3>
          <p className="text-stone-500 text-sm mb-3">Yönetici</p>
          <button className="text-xs px-3 py-1.5 border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors">
            Fotoğrafı Değiştir
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-stone-100 space-y-6">
        <h3 className="font-serif text-lg font-medium text-softBlack border-b border-stone-100 pb-4">Kişisel Bilgiler</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputGroup label="Ad Soyad" name="name" value={user?.name} onChange={handleChange} />
          <InputGroup label="Telefon" name="phone" value={user?.phone} onChange={handleChange} />
          <div className="md:col-span-2">
            <InputGroup label="E-posta Adresi" name="email" value={user?.email} type="email" onChange={handleChange} />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-stone-100 space-y-6">
        <h3 className="font-serif text-lg font-medium text-softBlack border-b border-stone-100 pb-4 flex items-center gap-2">
          <Lock size={18} className="text-stone-400" /> Şifre Güncelleme
        </h3>
        <InputGroup label="Mevcut Şifre" type="password" placeholder="••••••••" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputGroup label="Yeni Şifre" type="password" placeholder="••••••••" />
          <InputGroup label="Yeni Şifre (Tekrar)" type="password" placeholder="••••••••" />
        </div>
      </div>
    </motion.div>
  );
};

const NotificationSettingsSection = () => {
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.settings.getNotifications().then(res => {
      setSettings(res.data);
      setLoading(false);
    }).catch(console.error);
  }, []);

  const toggle = (key: keyof NotificationSettings['emailNotifications']) => {
    if (!settings) return;
    setSettings({
      ...settings,
      emailNotifications: {
        ...settings.emailNotifications,
        [key]: !settings.emailNotifications[key]
      }
    });
  };

  if (loading) return <div>Yükleniyor...</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-2xl border border-stone-100 max-w-2xl"
    >
      <h3 className="font-serif text-lg font-medium text-softBlack mb-2">Bildirim Tercihleri</h3>
      <p className="text-sm text-stone-500 mb-6 pb-4 border-b border-stone-100">Hangi durumlarda e-posta veya panel bildirimi almak istediğinizi seçin.</p>

      <div className="space-y-2">
        <Toggle
          label="Yeni Sipariş Bildirimi"
          description="Yeni bir sipariş geldiğinde bildirim gönder."
          checked={settings?.emailNotifications.newOrder || false}
          onChange={() => toggle('newOrder')}
        />
        <Toggle
          label="Düşük Stok Uyarısı"
          description="Bir ürünün stoğu azaldığında uyar."
          checked={settings?.emailNotifications.lowStock || false}
          onChange={() => toggle('lowStock')}
        />
        <Toggle
          label="Müşteri Destek"
          description="Müşteri destek talepleri için bildirim al."
          checked={settings?.emailNotifications.customerSupport || false}
          onChange={() => toggle('customerSupport')}
        />
      </div>
    </motion.div>
  );
};

const ShippingSettingsSection = () => {
  const [settings, setSettings] = useState<ShippingSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.settings.getShipping().then(res => {
      setSettings(res.data);
      setLoading(false);
    }).catch(console.error);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => prev ? ({ ...prev, [name]: Number(value) }) : null);
  };

  if (loading) return <div>Yükleniyor...</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-2xl"
    >
      <div className="bg-white p-6 rounded-2xl border border-stone-100">
        <h3 className="font-serif text-lg font-medium text-softBlack border-b border-stone-100 pb-4 mb-4 flex items-center gap-2">
          <Truck size={18} className="text-stone-400" /> Kargo Ayarları
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <InputGroup label="Varsayılan Kargo Ücreti (₺)" name="defaultShippingCost" type="number" value={settings?.defaultShippingCost} onChange={handleChange} />
          <InputGroup label="Ücretsiz Kargo Limiti (₺)" name="freeShippingThreshold" type="number" value={settings?.freeShippingThreshold} onChange={handleChange} helper="Bu tutarın üzerindeki siparişlerde kargo ücretsiz olur." />
        </div>
        <Toggle
          label="Kargo Sağlayıcıları Yönetimi"
          description="Kargo firmalarını aktif/pasif yapın (Yakında)"
          checked={true}
          onChange={() => { }}
        />
      </div>
    </motion.div>
  );
};

// --- Main Page ---

const TABS = [
  { id: 'general', label: 'Genel', icon: Store },
  { id: 'profile', label: 'Profil', icon: User },
  { id: 'notifications', label: 'Bildirimler', icon: Bell },
  { id: 'shipping', label: 'Kargo & Ödeme', icon: CreditCard },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);

  // In a real implementation each section would lift state up or use a context/store
  // For this demo, we will just simulate a global save.
  const handleSave = () => {
    setIsSaving(true);
    // Since state is distributed in components for this refactor, we just simulate delay
    // Ideally we would trigger save inside each component or have a global form state.
    setTimeout(() => setIsSaving(false), 1500);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">

      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="font-serif text-2xl font-medium text-softBlack">Ayarlar</h2>
          <p className="text-stone-500 text-sm mt-1">Panel tercihlerinizi ve mağaza ayarlarını yapılandırın.</p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-2.5 bg-softBlack text-white rounded-lg hover:bg-stone-800 transition-all shadow-md disabled:opacity-70"
        >
          {isSaving ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
            />
          ) : (
            <Save size={18} />
          )}
          <span>{isSaving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}</span>
        </button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-8 overflow-hidden">

        {/* Sidebar Navigation */}
        <nav className="w-full lg:w-64 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 no-scrollbar flex-shrink-0">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all whitespace-nowrap text-sm font-medium ${isActive
                    ? 'bg-white text-softBlack shadow-sm border border-stone-100 ring-1 ring-stone-200'
                    : 'text-stone-500 hover:text-softBlack hover:bg-stone-50'
                  }`}
              >
                <Icon size={18} strokeWidth={isActive ? 2 : 1.5} className={isActive ? 'text-softBlack' : 'text-stone-400'} />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto pr-2 pb-20">
          <AnimatePresence mode="wait">
            {activeTab === 'general' && <GeneralSettingsSection key="general" />}
            {activeTab === 'profile' && <ProfileSettingsSection key="profile" />}
            {activeTab === 'notifications' && <NotificationSettingsSection key="notifications" />}
            {activeTab === 'shipping' && <ShippingSettingsSection key="shipping" />}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
