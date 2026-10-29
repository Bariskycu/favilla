
import React, { useState, useMemo, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  Edit3,
  Trash2,
  Archive,
  Eye,
  X,
  Save,
  Image as ImageIcon,
  AlertTriangle,
  RotateCcw,
  Upload,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../services/api';
import { Product, ProductType, ProductStatus, ProductMaterial } from '../../types';

// Renk Haritası
const COLOR_MAP: Record<string, string> = {
  natural: '#F5F5F4',    // Stone-100
  charcoal: '#44403C',   // Stone-700
  terracotta: '#B45309', // Amber-700
};

// Tip Haritası
const TYPE_LABELS: Record<string, string> = {
  jar: 'Kavanoz Mum',
  sculptural: 'Heykel Mum',
  set: 'Hediye Seti',
};

// Durum Badge Bileşeni
const StatusBadge = ({ status }: { status: ProductStatus }) => {
  const styles = {
    active: 'bg-green-50 text-green-700 border-green-100',
    draft: 'bg-stone-100 text-stone-600 border-stone-200',
    archived: 'bg-amber-50 text-amber-700 border-amber-100',
  };

  const labels = {
    active: 'Yayında',
    draft: 'Taslak',
    archived: 'Arşiv',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-2 ${status === 'active' ? 'bg-green-500' :
        status === 'draft' ? 'bg-stone-400' : 'bg-amber-500'
        }`}></span>
      {labels[status]}
    </span>
  );
};

// Initial Empty Product State
const INITIAL_FORM_STATE: Partial<Product> = {
  name: '',
  slug: '',
  price: 0,
  stock: 0,
  type: 'jar',
  color: 'natural',
  material: 'soy-wax',
  images: ['https://images.unsplash.com/photo-1602825266940-7060459519f9?q=80&w=200&auto=format&fit=crop'],
  status: 'draft',
  isActive: false
};

export default function Products() {
  // --- STATE ---
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | ProductType>('all');
  const [filterMaterial, setFilterMaterial] = useState<'all' | ProductMaterial>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | ProductStatus>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<Product>>(INITIAL_FORM_STATE);

  // Fetch Products
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await api.products.getAll({
        page,
        limit: 10,
        type: filterType !== 'all' ? filterType : undefined,
        material: filterMaterial !== 'all' ? filterMaterial : undefined,
        status: filterStatus !== 'all' ? filterStatus : undefined,
        search: searchTerm || undefined
      });
      if (response.success) {
        setProducts(response.data);
        if (response.pagination) {
          setTotalPages(response.pagination.totalPages);
        }
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      fetchProducts();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, filterType, filterMaterial, filterStatus, page]);


  // --- HANDLERS ---

  // Modal Açma (Yeni Ekleme)
  const openAddModal = () => {
    setSelectedProduct(null);
    setFormData(INITIAL_FORM_STATE);
    setIsModalOpen(true);
  };

  // Modal Açma (Düzenleme)
  const openEditModal = (product: Product) => {
    setSelectedProduct(product);
    setFormData({ ...product });
    setIsModalOpen(true);
  };

  // Silme Onayı Açma
  const openDeleteModal = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteModalOpen(true);
  };

  // Form Input Değişikliği
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData(prev => {
      // Değeri işle
      let processedValue: string | number = value;
      if (name === 'price' || name === 'stock') {
        processedValue = Number(value);
      }

      const updated = { ...prev, [name]: processedValue };

      // Slug Otomasyonu (Sadece isim değişirse ve yeni kayıt ise veya slug boşsa)
      if (name === 'name' && (!selectedProduct || !prev.slug)) {
        updated.slug = value
          .toLowerCase()
          .replace(/ğ/g, 'g')
          .replace(/ü/g, 'u')
          .replace(/ş/g, 's')
          .replace(/ı/g, 'i')
          .replace(/ö/g, 'o')
          .replace(/ç/g, 'c')
          .replace(/[^a-z0-9]/g, '-')
          .replace(/-+/g, '-');
      }

      return updated;
    });
  };

  // Resim Yükleme İşlemi
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const response = await api.media.upload(file);
      if (response.success && response.data.url) {
        setFormData(prev => ({ ...prev, images: [response.data.url] }));
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Resim yüklenirken bir hata oluştu.');
    } finally {
      setIsUploading(false);
      // Reset input value to allow selecting same file again
      e.target.value = '';
    }
  };

  // Kaydetme İşlemi (Ekleme veya Güncelleme)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const isActive = formData.status === 'active';
      const payload = { ...formData, isActive };

      if (selectedProduct) {
        // Güncelleme
        const response = await api.products.update(selectedProduct.id, payload);
        if (response.success) {
          setProducts(prev => prev.map(p => p.id === selectedProduct.id ? response.data : p));
          setIsModalOpen(false);
        }
      } else {
        // Yeni Ekleme
        const response = await api.products.create(payload);
        if (response.success) {
          setProducts(prev => [response.data, ...prev]);
          setIsModalOpen(false);
        }
      }
    } catch (error) {
      console.error('Failed to save product:', error);
      alert('Kaydetme işlemi başarısız oldu.');
    } finally {
      setIsSaving(false);
    }
  };

  // Silme İşlemi
  const handleDelete = async () => {
    if (selectedProduct) {
      try {
        const response = await api.products.delete(selectedProduct.id);
        if (response.success) {
          setProducts(prev => prev.filter(p => p.id !== selectedProduct.id));
          setIsDeleteModalOpen(false);
          setSelectedProduct(null);
        }
      } catch (error) {
        console.error('Failed to delete product:', error);
        alert('Silme işlemi başarısız oldu.');
      }
    }
  };

  // Arşivleme / Geri Yükleme İşlemi
  const handleToggleArchive = async (product: Product) => {
    const newStatus = product.status === 'archived' ? 'active' : 'archived';
    const isActive = newStatus === 'active';
    try {
      // Status update logic could be specific endpoint or general update
      // Updating status directly via update endpoint here
      const response = await api.products.update(product.id, { ...product, status: newStatus, isActive });
      if (response.success) {
        setProducts(prev => prev.map(p => p.id === product.id ? response.data : p));
      }
    } catch (error) {
      console.error('Failed to update product status:', error);
    }
  };

  return (
    <div className="space-y-6 pb-20 relative">
      {/* Üst Bar: Başlık ve Aksiyonlar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="font-serif text-2xl font-medium text-softBlack">Ürün Yönetimi</h2>
          <p className="text-stone-500 text-sm mt-1">Envanterinizi yönetin ve ürün detaylarını düzenleyin.</p>
        </div>
        <div className="flex gap-3 w-full lg:w-auto">
          <button
            onClick={openAddModal}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-softBlack text-white rounded-lg text-sm font-medium hover:bg-stone-800 transition-all shadow-lg shadow-stone-200 hover:shadow-xl hover:-translate-y-0.5"
          >
            <Plus size={18} />
            <span>Yeni Ürün</span>
          </button>
        </div>
      </div>

      {/* Filtreleme ve Arama Alanı */}
      <div className="bg-white p-4 rounded-xl border border-stone-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between sticky top-0 z-10">

        {/* Arama Input */}
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-softBlack transition-colors" size={18} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            placeholder="Ürün adı veya kodu ile ara..."
            className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-softBlack focus:bg-white transition-all placeholder:text-stone-400"
          />
        </div>

        {/* Filtre Butonları */}
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-scrollbar">
          {['all', 'jar', 'sculptural', 'set'].map((type) => (
            <button
              key={type}
              onClick={() => { setFilterType(type as any); setPage(1); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filterType === type
                ? 'bg-softBlack text-white'
                : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
                }`}
            >
              {type === 'all' ? 'Tüm Tipler' : TYPE_LABELS[type]}
            </button>
          ))}
          <div className="w-px h-8 bg-stone-200 mx-1" />
          {['all', 'soy-wax', 'beeswax', 'coconut-blend'].map((mat) => (
            <button
              key={mat}
              onClick={() => { setFilterMaterial(mat as any); setPage(1); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filterMaterial === mat
                ? 'bg-softBlack text-white'
                : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
                }`}
            >
              {mat === 'all' ? 'Tüm Materyaller' : mat}
            </button>
          ))}
        </div>
      </div>

      {/* Ürün Tablosu */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-cream/50 border-b border-stone-100">
              <tr>
                <th className="px-6 py-4 font-medium text-xs text-stone-500 uppercase tracking-wider w-[300px]">Ürün</th>
                <th className="px-6 py-4 font-medium text-xs text-stone-500 uppercase tracking-wider">Kategori</th>
                <th className="px-6 py-4 font-medium text-xs text-stone-500 uppercase tracking-wider text-center">Renk</th>
                <th className="px-6 py-4 font-medium text-xs text-stone-500 uppercase tracking-wider text-right">Fiyat</th>
                <th className="px-6 py-4 font-medium text-xs text-stone-500 uppercase tracking-wider">Stok</th>
                <th className="px-6 py-4 font-medium text-xs text-stone-500 uppercase tracking-wider">Durum</th>
                <th className="px-6 py-4 font-medium text-xs text-stone-500 uppercase tracking-wider text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {isLoading && products.length === 0 ? (
                <tr><td colSpan={7} className="p-10 text-center"><div className="inline-block animate-spin h-6 w-6 border-2 border-softBlack border-t-transparent rounded-full" /></td></tr>
              ) : (
                <AnimatePresence>
                  {products.length > 0 ? (
                    products.map((product) => (
                      <motion.tr
                        key={product.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className={`group hover:bg-stone-50/80 transition-colors ${product.status === 'archived' ? 'opacity-60 bg-stone-50' : ''}`}
                      >
                        {/* Ürün */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="h-16 w-16 rounded-lg bg-stone-100 overflow-hidden flex-shrink-0 border border-stone-200 relative group-hover:shadow-md transition-shadow">
                              <img
                                src={product.images?.[0]}
                                alt={product.name}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=No+Img';
                                }}
                              />
                              <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Eye className="text-white drop-shadow-md" size={16} />
                              </div>
                            </div>
                            <div>
                              <div className="font-serif font-medium text-softBlack text-base">{product.name}</div>
                              <div className="text-xs text-stone-400 font-mono mt-0.5">#{product.id.substring(0, 6)}...</div>
                            </div>
                          </div>
                        </td>

                        {/* Kategori */}
                        <td className="px-6 py-4">
                          <span className="text-sm text-stone-600 font-medium">
                            {TYPE_LABELS[product.type]}
                          </span>
                          <div className="text-xs text-stone-400">{product.slug}</div>
                        </td>

                        {/* Renk */}
                        <td className="px-6 py-4 text-center">
                          <div
                            className="w-6 h-6 rounded-full border border-stone-200 mx-auto shadow-sm tooltip"
                            title={product.color}
                            style={{ backgroundColor: COLOR_MAP[product.color] }}
                          />
                        </td>

                        {/* Fiyat */}
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm font-medium text-softBlack">{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(product.price)}</span>
                        </td>

                        {/* Stok */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${product.stock === 0 ? 'bg-red-500' :
                              product.stock < 10 ? 'bg-amber-500' : 'bg-green-500'
                              }`} />
                            <span className={`text-sm font-medium ${product.stock === 0 ? 'text-red-500' :
                              product.stock < 10 ? 'text-amber-600' : 'text-stone-600'
                              }`}>
                              {product.stock === 0 ? 'Tükendi' : `${product.stock} adet`}
                            </span>
                          </div>
                        </td>

                        {/* Durum */}
                        <td className="px-6 py-4">
                          <StatusBadge status={product.status} />
                        </td>

                        {/* İşlemler */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEditModal(product)}
                              className="p-2 text-stone-400 hover:text-softBlack hover:bg-white rounded-lg transition-colors border border-transparent hover:border-stone-200"
                              title="Düzenle"
                            >
                              <Edit3 size={16} />
                            </button>
                            <button
                              onClick={() => handleToggleArchive(product)}
                              className={`p-2 rounded-lg transition-colors border border-transparent ${product.status === 'archived'
                                ? 'text-amber-600 bg-amber-50 hover:bg-amber-100 hover:border-amber-200'
                                : 'text-stone-400 hover:text-amber-600 hover:bg-amber-50 hover:border-amber-100'
                                }`}
                              title={product.status === 'archived' ? 'Arşivden Çıkar' : 'Arşivle'}
                            >
                              {product.status === 'archived' ? <RotateCcw size={16} /> : <Archive size={16} />}
                            </button>
                            <button
                              onClick={() => openDeleteModal(product)}
                              className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                              title="Sil"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-stone-500">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Filter className="w-8 h-8 text-stone-300" />
                          <p className="font-medium">Sonuç bulunamadı</p>
                          <p className="text-sm">Arama kriterlerinizi veya filtrelerinizi değiştirmeyi deneyin.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-stone-100 bg-stone-50/50 p-4 flex items-center justify-between text-xs text-stone-500">
          <span>Toplam {products.length} ürün gösteriliyor (Sayfa {page} / {totalPages})</span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 border border-stone-200 bg-white rounded hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Önceki
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 border border-stone-200 bg-white rounded hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sonraki
            </button>
          </div>
        </div>
      </div>

      {/* --- ADD / EDIT MODAL --- */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-softBlack/30 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-offWhite w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-stone-200 bg-white flex justify-between items-center">
                <h3 className="font-serif text-xl font-medium text-softBlack">
                  {selectedProduct ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-softBlack transition-colors">
                  <X size={24} />
                </button>
              </div>

              {/* Form Body */}
              <div className="p-6 overflow-y-auto custom-scrollbar">
                <form id="productForm" onSubmit={handleSave} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* İsim */}
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-stone-700 mb-1.5">Ürün Adı</label>
                      <input
                        required
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent transition-all"
                        placeholder="Örn: Vanilya Rüyası"
                      />
                    </div>

                    {/* Slug */}
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-stone-700 mb-1.5">URL Slug (Otomatik)</label>
                      <div className="flex items-center gap-2 px-4 py-2 bg-stone-100 border border-stone-200 rounded-lg text-stone-500">
                        <span className="text-xs font-mono">favilla.com/urun/</span>
                        <input
                          type="text"
                          name="slug"
                          value={formData.slug}
                          onChange={handleInputChange}
                          className="bg-transparent border-none focus:outline-none text-softBlack w-full font-medium"
                        />
                      </div>
                    </div>

                    {/* Fiyat */}
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1.5">Fiyat (₺)</label>
                      <input
                        required
                        type="number"
                        name="price"
                        min="0"
                        value={formData.price}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-400"
                      />
                    </div>

                    {/* Stok */}
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1.5">Stok Adedi</label>
                      <input
                        required
                        type="number"
                        name="stock"
                        min="0"
                        value={formData.stock}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-400"
                      />
                    </div>

                    {/* Tip (Kategori) */}
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1.5">Kategori</label>
                      <select
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-400 appearance-none"
                      >
                        <option value="jar">Kavanoz Mum</option>
                        <option value="sculptural">Heykel Mum</option>
                        <option value="set">Hediye Seti</option>
                      </select>
                    </div>

                    {/* Renk */}
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1.5">Renk</label>
                      <select
                        name="color"
                        value={formData.color}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-400 appearance-none"
                      >
                        <option value="natural">Natural (Krem)</option>
                        <option value="charcoal">Charcoal (Koyu Gri)</option>
                        <option value="terracotta">Terracotta (Kiremit)</option>
                      </select>
                    </div>

                    {/* Durum */}
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-stone-700 mb-1.5">Yayın Durumu</label>
                      <div className="flex gap-4">
                        {(['active', 'draft', 'archived'] as const).map((status) => (
                          <label key={status} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="status"
                              value={status}
                              checked={formData.status === status}
                              onChange={handleInputChange}
                              className="w-4 h-4 text-softBlack focus:ring-softBlack border-stone-300"
                            />
                            <span className="text-sm text-stone-600 capitalize">
                              {status === 'active' ? 'Yayında' : status === 'draft' ? 'Taslak' : 'Arşivde'}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Resim Yükleme */}
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-stone-700 mb-1.5">Ürün Görseli</label>
                      <div className="flex gap-4 items-start">
                        <div className="h-24 w-24 rounded-lg bg-stone-100 border border-stone-200 flex-shrink-0 overflow-hidden flex items-center justify-center relative group">
                          {formData.images?.[0] ? (
                            <>
                              <img src={formData.images[0]} alt="Preview" className="h-full w-full object-cover" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button type="button" onClick={() => setFormData(p => ({ ...p, images: [] }))} className="text-white hover:text-red-400">
                                  <Trash2 size={20} />
                                </button>
                              </div>
                            </>
                          ) : (
                            <ImageIcon className="text-stone-300" />
                          )}
                          {isUploading && (
                            <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                              <Loader2 className="animate-spin text-softBlack" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 space-y-3">
                          <div>
                            <label className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 rounded-lg text-sm font-medium text-stone-600 hover:bg-stone-50 hover:text-softBlack cursor-pointer transition-colors shadow-sm">
                              <Upload size={16} />
                              <span>Bilgisayardan Seç</span>
                              <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageUpload}
                                disabled={isUploading}
                              />
                            </label>
                            <p className="text-xs text-stone-400 mt-2">JPG, PNG veya WEBP. Max 5MB.</p>
                          </div>

                          <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                              <span className="w-full border-t border-stone-100" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                              <span className="bg-offWhite px-2 text-stone-400">veya URL ile</span>
                            </div>
                          </div>

                          <input
                            type="text"
                            name="image"
                            value={formData.images?.[0] || ''}
                            onChange={(e) => setFormData(p => ({ ...p, images: [e.target.value] }))}
                            placeholder="https://..."
                            className="w-full px-4 py-2 bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-400 text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Malzeme (Yeni Eklenen) */}
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1.5">Malzeme</label>
                      <select
                        name="material"
                        value={formData.material}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-400 appearance-none"
                      >
                        <option value="soy-wax">Soy Wax (Soya Mumu)</option>
                        <option value="beeswax">Beeswax (Bal Mumu)</option>
                        <option value="coconut-blend">Coconut Blend (Hindistan Cevizi)</option>
                      </select>
                    </div>
                  </div>
                </form>
              </div>

              {/* Footer Buttons */}
              <div className="px-6 py-4 border-t border-stone-200 bg-stone-50 flex justify-end gap-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-medium text-stone-600 hover:text-softBlack hover:bg-stone-200 rounded-lg transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  form="productForm"
                  disabled={isSaving}
                  className="px-5 py-2.5 text-sm font-medium bg-softBlack text-white rounded-lg hover:bg-stone-800 transition-all shadow-md flex items-center gap-2 disabled:opacity-70"
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
                  {selectedProduct ? 'Değişiklikleri Kaydet' : 'Ürünü Oluştur'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- DELETE CONFIRMATION MODAL --- */}
      <AnimatePresence>
        {isDeleteModalOpen && selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeleteModalOpen(false)}
              className="absolute inset-0 bg-softBlack/30 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="relative bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 text-center"
            >
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                <AlertTriangle size={24} />
              </div>
              <h3 className="font-serif text-lg font-bold text-softBlack mb-2">Ürünü Sil?</h3>
              <p className="text-stone-500 text-sm mb-6">
                <span className="font-medium text-softBlack">"{selectedProduct.name}"</span> adlı ürünü silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-stone-200 rounded-lg text-sm font-medium text-stone-600 hover:bg-stone-50"
                >
                  Vazgeç
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 shadow-md"
                >
                  Evet, Sil
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
