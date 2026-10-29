
import { Order, Product, Customer } from './types';

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'PRD-001',
    name: 'Vanilya & Meşe Odunu',
    slug: 'vanilya-mese-odunu',
    type: 'jar',
    color: 'natural',
    price: 450,
    stock: 24,
    images: ['https://images.unsplash.com/photo-1602825266940-7060459519f9?q=80&w=200&auto=format&fit=crop'],
    status: 'active',
    isActive: true
  },
  {
    id: 'PRD-002',
    name: 'Lavanta Bahçesi',
    slug: 'lavanta-bahcesi',
    type: 'sculptural',
    color: 'terracotta',
    price: 520,
    stock: 12,
    images: ['https://images.unsplash.com/photo-1603006905003-be475563bc59?q=80&w=200&auto=format&fit=crop'],
    status: 'active',
    isActive: true
  },
  {
    id: 'PRD-003',
    name: 'Gece Yasemini',
    slug: 'gece-yasemini',
    type: 'jar',
    color: 'charcoal',
    price: 480,
    stock: 0,
    images: ['https://images.unsplash.com/photo-1572421397858-a832e57c6b99?q=80&w=200&auto=format&fit=crop'],
    status: 'active',
    isActive: true
  },
  {
    id: 'PRD-004',
    name: 'Bambu & Bergamot',
    slug: 'bambu-bergamot',
    type: 'set',
    color: 'natural',
    price: 850,
    stock: 5,
    images: ['https://images.unsplash.com/photo-1608649982755-9f5c49023021?q=80&w=200&auto=format&fit=crop'],
    status: 'draft',
    isActive: false
  },
  {
    id: 'PRD-005',
    name: 'Tarçın & Portakal',
    slug: 'tarcin-portakal',
    type: 'jar',
    color: 'terracotta',
    price: 600,
    stock: 50,
    images: ['https://images.unsplash.com/photo-1570823336710-5db52cb90e0b?q=80&w=200&auto=format&fit=crop'],
    status: 'active',
    isActive: true
  },
  {
    id: 'PRD-006',
    name: 'Antik Sütun',
    slug: 'antik-sutun',
    type: 'sculptural',
    color: 'natural',
    price: 340,
    stock: 8,
    images: ['https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?q=80&w=200&auto=format&fit=crop'],
    status: 'archived',
    isActive: false
  },
  {
    id: 'PRD-007',
    name: 'Noir Koleksiyonu',
    slug: 'noir-koleksiyonu',
    type: 'set',
    color: 'charcoal',
    price: 1200,
    stock: 15,
    images: ['https://images.unsplash.com/photo-1602607172088-348600863df7?q=80&w=200&auto=format&fit=crop'],
    status: 'active',
    isActive: true
  }
];

export const MOCK_ORDERS: Order[] = [
  {
    id: 'ORD-7829',
    orderNumber: 'ORD-7829',
    customerName: 'Ayşe Yılmaz',
    customerEmail: 'ayse@example.com',
    itemCount: 3,
    total: 1420,
    subtotal: 1420,
    status: 'processing',
    shippingAddress: {
      title: 'Ev',
      line1: 'Bağdat Cad. No:12',
      city: 'İstanbul',
      zip: '34000',
      country: 'Turkey'
    },
    items: [
      { id: '1', productId: 'P-001', productName: 'Vanilya & Meşe Odunu', productImage: '', quantity: 2, price: 450, subtotal: 900 },
      { id: '2', productId: 'P-002', productName: 'Lavanta Bahçesi', productImage: '', quantity: 1, price: 520, subtotal: 520 }
    ],
    createdAt: '2023-10-24',
    updatedAt: '2023-10-24'
  },
  {
    id: 'ORD-7830',
    orderNumber: 'ORD-7830',
    customerName: 'Mehmet Demir',
    customerEmail: 'mehmet@example.com',
    itemCount: 1,
    total: 450,
    subtotal: 450,
    status: 'shipped',
    shippingAddress: {
      title: 'Ev',
      line1: 'Çankaya Mah. 102. Sok',
      city: 'Ankara',
      zip: '06000',
      country: 'Turkey'
    },
    items: [
      { id: '3', productId: 'P-001', productName: 'Vanilya & Meşe Odunu', productImage: '', quantity: 1, price: 450, subtotal: 450 }
    ],
    createdAt: '2023-10-23',
    updatedAt: '2023-10-23'
  },
  {
    id: 'ORD-7831',
    orderNumber: 'ORD-7831',
    customerName: 'Selin Kaya',
    customerEmail: 'selin@example.com',
    itemCount: 3,
    total: 2550,
    subtotal: 2550,
    status: 'delivered',
    shippingAddress: {
      title: 'Ev',
      line1: 'Nişantaşı',
      city: 'İstanbul',
      zip: '34000',
      country: 'Turkey'
    },
    items: [
      { id: '4', productId: 'P-004', productName: 'Bambu & Bergamot', productImage: '', quantity: 3, price: 850, subtotal: 2550 }
    ],
    createdAt: '2023-10-22',
    updatedAt: '2023-10-22'
  },
  {
    id: 'ORD-7832',
    orderNumber: 'ORD-7832',
    customerName: 'Can Yıldız',
    customerEmail: 'can@example.com',
    itemCount: 1,
    total: 520,
    subtotal: 520,
    status: 'cancelled',
    shippingAddress: {
      title: 'Ev',
      line1: 'Karşıyaka',
      city: 'İzmir',
      zip: '35000',
      country: 'Turkey'
    },
    items: [
      { id: '5', productId: 'P-002', productName: 'Lavanta Bahçesi', productImage: '', quantity: 1, price: 520, subtotal: 520 }
    ],
    createdAt: '2023-10-21',
    updatedAt: '2023-10-21'
  }
];

export const SALES_DATA = [
  { name: 'Pzt', satis: 4000 },
  { name: 'Sal', satis: 3000 },
  { name: 'Çar', satis: 2000 },
  { name: 'Per', satis: 2780 },
  { name: 'Cum', satis: 1890 },
  { name: 'Cmt', satis: 2390 },
  { name: 'Paz', satis: 3490 },
];

export const MOCK_CUSTOMERS: Customer[] = [
  {
    id: 'CUST-001',
    name: 'Ayşe Yılmaz',
    email: 'ayse@example.com',
    phone: '+90 555 123 45 67',
    isActive: true,
    totalSpent: 4250,
    orderCount: 5,
    isVip: false,
    role: 'customer',
    createdAt: '2023-01-15',
    notes: 'Kavanoz mumları tercih ediyor. Doğum günü 15 Mayıs.'
  },
  {
    id: 'CUST-002',
    name: 'Mehmet Demir',
    email: 'mehmet@example.com',
    phone: '+90 532 987 65 43',
    isActive: true,
    totalSpent: 850,
    orderCount: 2,
    isVip: false,
    role: 'customer',
    createdAt: '2023-06-20'
  },
  {
    id: 'CUST-003',
    name: 'Selin Kaya',
    email: 'selin@example.com',
    phone: '+90 544 333 22 11',
    isActive: true,
    totalSpent: 12450,
    orderCount: 14,
    isVip: true,
    role: 'customer',
    createdAt: '2022-11-05',
    notes: 'VIP Müşteri. Hediye setlerini kurumsal alıyor.'
  },
  {
    id: 'CUST-004',
    name: 'Can Yıldız',
    email: 'can@example.com',
    phone: '+90 535 555 66 77',
    isActive: false,
    totalSpent: 520,
    orderCount: 1,
    isVip: false,
    role: 'customer',
    createdAt: '2023-08-10'
  },
  {
    id: 'CUST-005',
    name: 'Zeynep Çelik',
    email: 'zeynep@example.com',
    phone: '+90 536 777 88 99',
    isActive: true,
    totalSpent: 2100,
    orderCount: 4,
    isVip: false,
    role: 'customer',
    createdAt: '2023-03-12'
  },
  {
    id: 'CUST-006',
    name: 'Burak Yılmaz',
    email: 'burak@example.com',
    phone: '+90 533 111 22 33',
    isActive: true,
    totalSpent: 350,
    orderCount: 1,
    isVip: false,
    role: 'customer',
    createdAt: '2023-09-28'
  }
];