import { Product } from '../types';

export const tr = {
  common: {
    loading: 'Yükleniyor...',
    sale: 'İNDİRİM',
    new: 'YENİ',
    free: 'Ücretsiz',
    errorTitle: 'Bir şeyler yanlış gitti.',
    errorDesc: 'Rahatsızlık için özür dileriz. Beklenmedik bir hata oluştu.',
    reload: 'Uygulamayı Yenile',
    notFound: 'Ürün bulunamadı.',
    backHome: 'Ana Sayfaya Dön',
    backProfile: 'Profile Dön',
    securePayment: 'Güvenli Ödeme',
    cities: 'Londra • İstanbul',
    thankYou: 'Teşekkürler!',
    guarantee: 'Favilla Garantisi',
    stillQuestions: 'Başka sorularınız mı var?',
    error: 'Bir hata oluştu',
    retry: 'Tekrar Dene'
  },
  validation: {
    required: 'Gerekli',
    emailRequired: 'E-posta gerekli',
    emailInvalid: 'Geçersiz e-posta formatı',
    passwordRequired: 'Şifre gerekli',
    nameRequired: 'İsim gerekli',
    phoneRequired: 'Telefon gerekli'
  },
  toasts: {
    addedToCart: 'Sepete eklendi',
    removedFromWishlist: 'Favorilerden kaldırıldı',
    savedToWishlist: 'Favorilere eklendi',
    welcomeBack: 'Tekrar hoşgeldiniz',
    loginFailed: 'Giriş başarısız',
    accountCreated: 'Hesap oluşturuldu',
    registrationFailed: 'Kayıt başarısız',
    loggedOut: 'Çıkış yapıldı',
    orderPlaced: 'Sipariş başarıyla oluşturuldu',
    addressAdded: 'Adres eklendi',
    addressRemoved: 'Adres silindi',
    addressUpdated: 'Adres güncellendi',
    ticketSubmitted: 'Talep iletildi',
    loginRequired: 'Giriş gerekli'
  },
  nav: {
    journal: 'GÜNLÜK',
    collection: 'MUMLAR',
    atelier: 'ATÖLYE',
    login: 'GİRİŞ',
    account: 'HESABIM',
    search: 'Ara',
    wishlist: 'Favoriler',
    cart: 'Sepet',
    menu: 'Menü',
    home: 'Ana Sayfa'
  },
  search: {
    placeholder: 'Koku ara...',
    results: 'Sonuçlar',
    noResults: 'Mum bulunamadı.',
    quickLinks: 'Hızlı Linkler',
    trending: 'Trendler',
    pressEsc: 'Kapatmak için ESC',
    quickLinkItems: {
      table: 'İmza Kavanozlar',
      pendants: 'Heykelsi Mumlar',
      atelier: 'Hediye Setleri'
    },
    trends: {
      orbit: 'Favilla Ember',
      halo: 'Luna Set',
      cream: 'Void Vessel'
    }
  },
  wishlist: {
    title: 'Favorilerim',
    empty: 'İstek listeniz boş.',
    emptyDesc: 'Sevdiğiniz kokuları daha sonra incelemek için kaydedin.',
    explore: 'KOLEKSİYONU KEŞFET',
    items: 'Ürün',
    loginRequired: 'Favorilerinize erişmek için lütfen giriş yapın.'
  },
  hero: {
    slide1: { title: 'Koku, Orkestra', subtitle: 'Yeni balmumu serisi.' },
    slide2: { title: 'Organik Alev', subtitle: 'Sıcaklıktan ilham alındı.' },
    slide3: { title: 'Sonsuz Parıltı', subtitle: 'Fitilden muma.' },
    explore: 'KOKULARI KEŞFET'
  },
  home: {
    storyTitle: 'Favilla',
    storyTitleItalic: 'Özü.',
    storyText: 'Bir mum sadece ışık değildir; bir hatıradır. Küçük partiler halinde elle dökülen mum karışımlarımız, alanınızı bir huzur ve sıcaklık sığınağına dönüştüren karmaşık koku notaları yaymak için tasarlanmıştır.',
    rotational: 'El Dökümü',
    modular: 'Doğal Mum',
    popularProducts: 'İmza Kokular',
    popularCollection: 'En çok tercih edilen karışımlarımız.',
    selectedWorks: 'Özel Setler',
    coreCollection: 'Ana koleksiyonu keşfedin.',
    viewAll: 'Tümünü Gör',
    aesthetic: 'Estetik',
    stylish: 'Kokulu',
    functional: 'Zamansız'
  },
  slider: {
    eclipse: {
      title: 'Ember Serisi',
      role: 'İmza',
      caption: 'Derin akşamlar için tütsülenmiş meşe ve deri notaları.'
    },
    mono: {
      title: 'Saf Form',
      role: 'Minimalist',
      caption: 'Görsel dinginlik için kokusuz heykelsi balmumu.'
    },
    aurora: {
      title: 'Aurora Cam',
      role: 'Zanaatkar',
      caption: 'İçeriden parlayan el üfleme camlar.'
    },
    axis: {
      title: 'Terra Koleksiyonu',
      role: 'Topraksı',
      caption: 'Hindistan cevizi mumu ile buluşan pişmiş toprak kaplar.'
    },
    zenith: {
      title: 'Zenith Fitil',
      role: 'İnovasyon',
      caption: 'Ocak gibi çıtırdayan ahşap fitiller.'
    }
  },
  shop: {
    title: 'Mağaza.',
    subtitle: 'Ortamınıza uyum sağlamak için tasarlanmış koku deneyimleri. Kokunuzu seçin.',
    seoDescription: 'Favilla koleksiyonunu keşfedin. Ortamınıza uyum sağlamak için tasarlanmış el dökümü soya ve balmumu mumlar.',
    type: 'Format',
    finish: 'Renk',
    filterLabel: 'Filtreler',
    resetFilters: 'Filtreleri Temizle',
    sort: 'Sırala',
    loadMore: 'Daha Fazla',
    types: {
      all: 'Tümü',
      jar: 'Kavanoz Mum',
      sculptural: 'Heykelsi',
      set: 'Hediye Setleri'
    },
    colors: {
      all: 'Tümü',
      'natural': 'Doğal',
      'charcoal': 'Kömür',
      'terracotta': 'Terakota'
    },
    noResults: 'Kriterlerinize uygun mum bulunamadı.'
  },
  product: {
    back: 'GERİ',
    configuration: 'Seçim',
    viewingConfig: (type: string) => `Şu anda ${type} formatı görüntüleniyor.`,
    addToCart: 'SEPETE EKLE',
    tableModule: 'Standart Kavanoz',
    pendantModule: 'Büyük Hazne',
    specifications: 'Detaylar',
    careGuide: 'Mum Bakımı',
    dimensions: 'Boyut',
    material: 'Mum Karışımı',
    lightSource: 'Yanma Süresi',
    scentProfile: 'Koku Profili',
    wishlistAdd: 'Favorilere Ekle',
    wishlistRemove: 'Favorilerden Çıkar',
    careText: 'Her yakmadan önce fitili 0.5 cm olacak şekilde kısaltın. Tünelleşmeyi önlemek için mumun kabın kenarlarına kadar erimesine izin verin. Tek seferde 4 saatten fazla yakmayın.',
    qa: {
      tab: 'Soru & Cevap',
      title: 'Soru Sor',
      subtitle: 'Bu koku hakkında bir sorunuz mu var? Bize sorun.',
      placeholder: 'Sorunuzu buraya yazın (örn. yayılım, içerik)...',
      submit: 'SORUYU GÖNDER',
      loginRequired: 'Giriş Yapmalısınız',
      loginMsg: 'Soru sormak için giriş yapmanız gerekmektedir.',
      loginBtn: 'GİRİŞ YAP',
      success: 'Soru İletildi',
      successMsg: 'Sorunuzun cevabını Yardım & Destek bölümünden takip edebilirsiniz.',
      goToProfile: 'YARDIM & DESTEK GİT',
      pendingResponse: 'Destek ekibinden yanıt bekleniyor.'
    }
  },
  reviews: {
    tab: 'Değerlendirmeler',
    reviewCountLabel: 'Değerlendirme',
    recommendation: '%100 müşteri bu kokuyu öneriyor',
    latest: 'Son Değerlendirmeler',
    write: 'Yorum Yap',
    rating: 'Puan',
    comment: 'Yorum',
    placeholder: 'Koku hakkındaki düşüncelerinizi paylaşın...',
    submit: 'Yorumu Gönder',
    cancel: 'İptal',
    you: 'Siz',
    loginToReview: 'Yorum yapmak için giriş yapın',
    purchaseToReview: 'Yalnızca bu ürünü satın alanlar yorum yapabilir.',
    noReviews: 'Henüz yorum yapılmamış.'
  },
  cart: {
    title: 'Seçiminiz',
    empty: 'Sepet Boş',
    discover: 'Kokuları keşfedin.',
    subtotal: 'Ara Toplam',
    checkout: 'ÖDEME YAP',
    secure: 'Stripe ile Güvenli Ödeme',
    pay: 'ÖDE & SİPARİŞ VER',
    remove: 'Kaldır',
    success: 'Sipariş alındı. Evinizin harika kokmasına hazırlanın.',
    loginRequired: 'Ödeme için lütfen giriş yapın',
    viewOrder: 'SİPARİŞİ GÖRÜNTÜLE',
    coupon: {
      label: 'İndirim Kuponu',
      placeholder: 'KODU GİRİNİZ',
      apply: 'UYGULA',
      remove: 'KALDIR',
      invalid: 'Geçersiz kod',
      applied: 'İndirim uygulandı',
      discount: 'İndirim'
    },
    steps: {
      cart: 'Sepet',
      address: 'Teslimat',
      payment: 'Ödeme',
      success: 'Onaylandı'
    },
    address: {
      title: 'Teslimat Adresi',
      select: 'Teslimat adresi seçin',
      addNew: 'YENİ ADRES EKLE',
      deliverHere: 'BURAYA GÖNDER',
      noAddresses: 'Kayıtlı adres bulunamadı.',
      continueToPayment: 'ÖDEMEYE GEÇ',
      labels: {
        title: 'Etiket',
        line1: 'Adres',
        city: 'Şehir',
        zip: 'Posta Kodu',
        country: 'Ülke'
      },
      placeholders: {
        title: 'Ev, İş...',
        line1: 'Meşrutiyet Cad.',
        city: 'İstanbul',
        zip: '34430',
        country: 'Türkiye'
      },
      form: {
        title: 'Yeni Adres',
        save: 'KAYDET VE KULLAN',
        cancel: 'İPTAL'
      }
    },
    payment: {
      cardNumber: 'Kart Numarası',
      expiry: 'Son Kullanma',
      cvc: 'CVC'
    }
  },
  auth: {
    welcome: 'Hoşgeldiniz',
    subtitle: 'Hesabınıza erişmek için bilgilerinizi girin.',
    email: 'E-posta Adresi',
    password: 'Şifre',
    fullName: 'Ad Soyad',
    phone: 'Telefon Numarası',
    signIn: 'GİRİŞ YAP',
    signUp: 'KAYIT OL',
    noAccount: "Hesabınız yok mu?",
    hasAccount: "Zaten üye misiniz?",
    registerTitle: 'Hesap Oluştur',
    registerSubtitle: 'Favilla kolektifine katılın.',
    errorShortPass: 'Şifre en az 6 karakter olmalıdır.',
    forgotPassword: 'Şifremi Unuttum'
  },
  forgotPasswordPage: {
    title: 'Şifre Yenileme',
    subtitle: 'Yenileme talimatlarını almak için e-posta adresinizi girin.',
    emailLabel: 'E-posta Adresi',
    emailPlaceholder: 'ornek@favilla.com',
    submitButton: 'YENİLEME LİNKİ GÖNDER',
    successTitle: 'Gelen Kutunuzu Kontrol Edin',
    successMessage: 'E-posta adresinize şifre yenileme linki gönderdik.',
    backToLogin: 'Girişe Dön',
    invalidEmail: 'Lütfen geçerli bir e-posta adresi girin.'
  },
  profile: {
    title: 'Profilim',
    menu: {
      overview: 'Genel Bakış',
      orders: 'Siparişlerim',
      addresses: 'Adreslerim',
      help: 'Yardım & Destek',
      settings: 'Ayarlar',
      logout: 'Çıkış Yap'
    },
    logoutModal: {
      title: 'Çıkış Yap',
      message: 'Hesabınızdan çıkış yapmak istediğinize emin misiniz?',
      confirm: 'ÇIKIŞ YAP',
      cancel: 'İPTAL'
    },
    overview: {
      welcome: 'Merhaba,',
      statOrders: 'Toplam Sipariş',
      statSpent: 'Toplam Harcama',
      recentActivity: 'Son Hareketler',
      noActivity: 'Son hareket bulunamadı.',
      items: 'Ürün',
      order: 'Sipariş',
      orderNo: 'Sipariş No.'
    },
    orders: {
      title: 'Sipariş Geçmişi',
      empty: 'Henüz sipariş yok.',
      date: 'Tarih',
      total: 'Toplam',
      status: 'Durum',
      items: 'Ürünler',
      moreItems: 'diğer ürün'
    },
    addresses: {
      title: 'Adreslerim',
      addNew: 'YENİ ADRES EKLE',
      delete: 'Sil',
      edit: 'Düzenle',
      formTitle: 'Yeni Adres',
      editTitle: 'Adresi Düzenle',
      save: 'ADRESİ KAYDET',
      update: 'ADRESİ GÜNCELLE',
      cancel: 'İPTAL'
    },
    help: {
      title: 'Yardım Merkezi',
      subtitle: 'Size nasıl yardımcı olabiliriz?',
      subject: 'Konu',
      orderNo: 'Sipariş Numarası (Opsiyonel)',
      message: 'Mesaj Detayları',
      submit: 'TALEBİ GÖNDER',
      successTitle: 'Talep Alındı',
      successMsg: 'Talebiniz ekibimize iletilmiştir. 24 saat içinde dönüş yapılacaktır.',
      subjects: {
        shipping: 'Kargo Sorunu',
        complaint: 'Geri Bildirim',
        product: 'Ürün Sorusu',
        return: 'İade & Kırık Ürün',
        other: 'Diğer'
      },
      requests: 'Taleplerim',
      questions: 'Ürün Sorularım',
      noRequests: 'Geçmiş talep bulunamadı.',
      noQuestions: 'Henüz ürün sorusu sorulmadı.',
      ticketId: 'Talep No',
      questionId: 'S-ID',
      status: 'Durum',
      pending: 'Beklemede',
      answered: 'Cevaplandı'
    },
    settings: {
      title: 'Hesap Ayarları',
      personalInfo: 'Kişisel Bilgiler',
      security: 'Güvenlik ve Şifre',
      currentPassword: 'Mevcut Şifre',
      newPassword: 'Yeni Şifre',
      confirmPassword: 'Yeni Şifre (Tekrar)',
      updateProfile: 'PROFİLİ GÜNCELLE',
      changePassword: 'ŞİFREYİ DEĞİŞTİR',
      passwordSuccess: 'Şifre başarıyla güncellendi.',
      profileSuccess: 'Profil başarıyla güncellendi.',
      passwordMismatch: 'Yeni şifreler eşleşmiyor.'
    }
  },
  orderDetail: {
    title: 'Sipariş Detayı',
    back: 'Siparişlere Dön',
    downloadInvoice: 'Faturayı İndir',
    summary: 'Sipariş Özeti',
    items: 'Ürünler',
    deliveryAddress: 'Teslimat Adresi',
    paymentMethod: 'Ödeme Yöntemi',
    shipping: 'Kargo',
    free: 'Ücretsiz',
    total: 'Toplam',
    qty: 'Adet',
    unitPrice: 'Birim Fiyat',
    steps: {
      received: 'Sipariş Alındı',
      preparing: 'Dökülüyor/Paketleniyor',
      shipped: 'Kargolandı',
      delivered: 'Teslim Edildi'
    },
    review: {
      title: 'Siparişi Değerlendir',
      placeholder: 'Mumlar hakkındaki düşüncelerinizi paylaşın...',
      submit: 'Yorumu Gönder',
      submitted: 'Değerlendirmeniz için teşekkürler!',
      rating: 'Puanınız'
    }
  },
  status: {
    processing: 'Hazırlanıyor',
    shipped: 'Kargoda',
    delivered: 'Teslim Edildi',
    open: 'Açık',
    'in-progress': 'İşlemde',
    resolved: 'Çözüldü',
    pending: 'Beklemede',
    answered: 'Cevaplandı'
  },
  atelier: {
    hero: {
      title: 'Atölye',
      subtitle: 'Balmumunun hatıraya dönüştüğü yer.'
    },
    philosophy: {
      title: 'Felsefe',
      text1: 'Her Favilla mumu bir atmosfer sorusuyla başlar. Bir kokuyu baskın olmadan nasıl tutarız? Atölye, bunu yanıtlamak için bizim laboratuvarımızdır.',
      text2: 'Zanaatkar bölgesinde yer alan atölyemiz, hassas kimyayı analog sıcaklıkla birleştiriyor. Seri üretim yapmıyoruz; balmumu partilerini orkestra ediyoruz.'
    },
    process: {
      design: {
        title: 'Harmanlama',
        desc: 'Koku duyguyu takip eder. Dökümden önce belirli anıları canlandırmak için uçucu yağları karıştırıyoruz.'
      },
      material: {
        title: 'Malzeme',
        desc: 'Soya temizdir, balmumu yavaştır. Mükemmel yanışı yaratmak için onları birleştiriyoruz.'
      },
      assembly: {
        title: 'Döküm',
        desc: 'İlk ışıktan son ana kadar tutarlı koku yayılımı sağlamak için katmanlar halinde elle dökülür.'
      }
    },
    bespoke: {
      title: 'Özel Hizmetler',
      subtitle: 'Düğünler & etkinlikler için.',
      desc: 'Balmumu teknolojimize dayalı mekana özel koku kurulumları oluşturmak için organizatörlerle işbirliği yapıyoruz.',
      cta: 'KOMİSYON TALEBİ'
    }
  },
  footer: {
    desc: 'Zanaatkar mumlar ile koku, mekan ve hafıza arasındaki ilişkiyi yeniden tanımlıyoruz.',
    collection: 'Koleksiyon',
    connect: 'İletişim',
    madeFor: 'Huzur için yapıldı.',
    rights: '© 2026 Favilla Candle.',
    newsletterTitle: 'Atölyeye Katılın',
    newsletterDesc: 'Yeni kokular, sergiler ve sezonluk ürünler hakkında güncellemeler almak için abone olun.',
    emailPlaceholder: 'E-posta Adresi',
    subscribe: 'ABONE OL',
    support: 'Destek',
    legal: 'Yasal',
    social: 'Sosyal',
    address: '12 Orbital Way, London SW1A 1AA',
    links: {
      shipping: 'Kargo ve İade',
      faq: 'S.S.S.',
      contact: 'Bize Ulaşın',
      privacy: 'Gizlilik Politikası',
      terms: 'Kullanım Koşulları'
    }
  },
  faq: {
    title: 'Sıkça Sorulan Sorular',
    subtitle: 'Balmumumuz ve kargo hakkında genel sorular.',
    questions: [
      {
        q: "Hangi tür balmumu kullanıyorsunuz?",
        a: "Temiz, yavaş bir yanış için soya ve hindistan cevizi mumu karışımı kullanıyoruz. Heykelsi parçalarımız yapısal bütünlük için balmumu kullanır."
      },
      {
        q: "Tünelleşmeyi nasıl önleyebilirim?",
        a: "Özellikle ilk yakışta, mumun kabın kenarlarına kadar erimesine izin verecek kadar uzun süre yakın."
      },
      {
        q: "Kokularınız ftalat içermiyor mu?",
        a: "Evet, tüm koku yağlarımız ftalat içermez ve uçucu yağlarla zenginleştirilmiştir."
      },
      {
        q: "Kargo süresi ne kadar sürer?",
        a: "Siparişleriniz genellikle 1–3 iş günü içerisinde kargoya verilir. Kargo süresi bulunduğunuz bölgeye göre değişiklik gösterebilir."
      },
      {
        q: "İade kabul ediyor musunuz?",
        a: "Yakılmamış mumları teslimattan sonraki 14 gün içinde iade alıyoruz."
      },
      {
        q: "Fitili nasıl kısaltmalıyım?",
        a: "Temiz bir alev için her yakıştan önce fitili makasla 0.5 cm olacak şekilde kesin."
      },
      {
        q: "Kavanozu geri dönüştürebilir miyim?",
        a: "Kesinlikle. Balmumu bittiğinde sıcak sabunlu suyla yıkayın ve saksı veya saklama kabı olarak kullanın."
      },
      {
        q: "Hesabım güvende mi?",
        a: "Hesap bilgileriniz modern güvenlik standartlarıyla korunur."
      },
      {
        q: "Siparişimi iptal edebilir miyim?",
        a: "Kargoya verilmemiş siparişler, sipariş detayları sayfasından kolayca iptal edilebilir."
      },
      {
        q: "Toptan satış yapıyor musunuz?",
        a: "Evet, toptan satış talepleri için lütfen İletişim sayfası üzerinden bize ulaşın."
      }
    ]
  },
  contact: {
    title: 'İletişim.',
    subtitle: 'Komisyonlar, toptan satış veya genel destek için bize ulaşın.',
    form: {
      name: 'Ad Soyad',
      email: 'E-posta Adresi',
      subject: 'Konu',
      message: 'Mesajınız',
      send: 'MESAJI GÖNDER',
      sending: 'GÖNDERİLİYOR...',
      success: 'Mesajınız Başarıyla Gönderildi',
      successDesc: 'Favilla ile iletişime geçtiğiniz için teşekkür ederiz. Ekibimiz en kısa sürede size dönüş yapacaktır.',
      subjects: {
        general: 'Genel Bilgi',
        commission: 'Komisyon Talebi',
        order: 'Sipariş Desteği',
        press: 'Basın & Medya'
      }
    },
    info: {
      visit: 'Atölyeyi Ziyaret Et',
      hours: 'Pzt-Cum: 10:00 — 18:00',
      call: 'Bizi Arayın',
      email: 'E-posta'
    }
  },
  shipping: {
    title: 'Kargo ve İade',
    subtitle: 'İç huzurunuz için tasarlanmış politikalar.',
    highlights: {
      global: 'Global Teslimat',
      protection: 'Sigortalı Paketleme',
      returns: '14 Gün İade'
    },
    sections: [
      {
        title: 'Kargo Politikası',
        content: 'Tüm mumlarımız için dünya çapında gönderim sunuyoruz. Her parça, ısıya ve taşımaya dayanacak şekilde tasarlanmış güçlendirilmiş, çevre dostu petek kağıt ambalajlarda paketlenir.'
      },
      {
        title: 'Teslimat Süreleri',
        content: 'İngiltere ve Avrupa siparişleri için lütfen 3-5 iş günü bekleyin. Kuzey Amerika ve Asya için teslimat genellikle 7-10 iş günü sürer.'
      },
      {
        title: 'Erime Uyarısı',
        content: 'Yaz aylarında erimeyi önlemek için buz paketleri ile gönderim yapıyoruz. Paketin güneşte beklemesini önlemek için lütfen teslim alacak birinin olduğundan emin olun.'
      },
      {
        title: 'İade Politikası',
        content: 'Favilla kokunuzu sevmenizi istiyoruz. Herhangi bir yakılmamış ürünü, tam para iadesi için teslim aldığınız tarihten itibaren 14 gün içinde iade edebilirsiniz. Özel üretim parçalar iade edilemez.'
      },
      {
        title: 'Nasıl İade Yapılır',
        content: 'Bir iade başlatmak için Profil > Siparişler bölümüne gidin, ilgili siparişi seçin ve "İade Talebi Oluştur"a tıklayın.'
      },
      {
        title: 'Kırık Ürünler',
        content: 'Camın kırık gelmesi durumunda, lütfen 48 saat içinde fotoğrafla bize ulaşın. Derhal yenisini göndereceğiz.'
      }
    ]
  },
  notFound: {
    title: '404',
    subtitle: 'Alev söndü.',
    desc: 'Aradığınız sayfa eriyip gitti ya da hiç var olmadı. Işığa dönün.',
    button: 'Ana Sayfaya Dön'
  },
  privacyPolicy: {
    title: 'Gizlilik Politikası',
    subtitle: 'Gizliliğinize ve veri güvenliğinize olan bağlılığımız.',
    sections: [
      {
        title: 'Veri Toplama',
        content: 'Web sitesine kayıt olduğunuzda, ürünlerimiz ve hizmetlerimiz hakkında bilgi almak istediğinizi belirttiğinizde, web sitesindeki etkinliklere katıldığınızda veya bizimle iletişime geçtiğinizde bize gönüllü olarak sağladığınız kişisel bilgileri topluyoruz.'
      },
      {
        title: 'Verilerin Kullanımı',
        content: 'Web sitemiz aracılığıyla toplanan kişisel bilgileri aşağıda açıklanan çeşitli iş amaçları için kullanıyoruz. Kişisel bilgilerinizi, meşru iş çıkarlarımıza dayanarak, sizinle bir sözleşme yapmak veya ifa etmek için, rızanızla ve/veya yasal yükümlülüklerimize uymak için işliyoruz.'
      },
      {
        title: 'Bilgi Paylaşımı',
        content: 'Bilgilerinizi yalnızca rızanızla, yasalara uymak, size hizmet sunmak, haklarınızı korumak veya iş yükümlülüklerini yerine getirmek için paylaşıyoruz.'
      },
      {
        title: 'Veri Güvenliği',
        content: 'İşlediğimiz kişisel bilgilerin güvenliğini korumak için uygun teknik ve organizasyonel güvenlik önlemleri uyguladık. Ancak, internetin kendisinin %100 güvenli olduğunu garanti edemeyeceğimizi lütfen unutmayın.'
      },
      {
        title: 'Gizlilik Haklarınız',
        content: 'Avrupa Ekonomik Alanı gibi bazı bölgelerde, kişisel bilgilerinize daha fazla erişim ve kontrol sağlayan haklarınız vardır. Hesabınızı istediğiniz zaman inceleyebilir, değiştirebilir veya sonlandırabilirsiniz.'
      },
      {
        title: 'Çerezler',
        content: 'Bilgilere erişmek veya bilgileri depolamak için çerezleri ve benzer izleme teknolojilerini kullanıyoruz. Bu tür teknolojileri nasıl kullandığımız ve belirli çerezleri nasıl reddedebileceğinizle ilgili özel bilgiler Çerez Bildirimimizde belirtilmiştir.'
      }
    ]
  },
  termsOfService: {
    title: 'Kullanım Koşulları',
    subtitle: 'Hizmetlerimizi kullanımınız için yönergeler.',
    sections: [
      {
        title: 'Şartların Kabulü',
        content: 'Web sitemize erişerek, bu Kullanım Koşullarına bağlı kalmayı ve geçerli tüm yasa ve düzenlemelere uymayı kabul edersiniz. Bu şartları kabul etmiyorsanız, bu siteyi kullanmanız veya siteye erişmeniz yasaktır.'
      },
      {
        title: 'Kullanım Lisansı',
        content: 'Favilla web sitesindeki materyallerin (bilgi veya yazılım) bir kopyasını yalnızca kişisel, ticari olmayan geçici görüntüleme için geçici olarak indirme izni verilir. Bu, bir mülkiyet devri değil, bir lisans verilmesidir.'
      },
      {
        title: 'Fikri Mülkiyet',
        content: 'Metin, grafikler, logolar, görseller ve yazılım gibi bu sitede yer alan tüm içerik, Favilla\'nın veya içerik tedarikçilerinin mülkiyetindedir ve uluslararası telif hakkı yasalarıyla korunmaktadır.'
      },
      {
        title: 'Kullanıcı Hesapları',
        content: 'Bizimle bir hesap oluşturduğunuzda, bize her zaman doğru, eksiksiz ve güncel bilgiler sağlamanız gerekir. Bunu yapmamanız, Hizmetimizdeki hesabınızın derhal feshedilmesine neden olabilecek Şartların ihlali anlamına gelir.'
      },
      {
        title: 'Sorumluluk Sınırlaması',
        content: 'Favilla veya tedarikçileri, Favilla\'nın web sitesindeki materyallerin kullanımından veya kullanılamamasından kaynaklanan herhangi bir zarardan (veri veya kar kaybı veya iş kesintisi nedeniyle oluşan zararlar dahil ancak bunlarla sınırlı olmamak üzere) hiçbir durumda sorumlu tutulamaz.'
      },
      {
        title: 'Geçerli Hukuk',
        content: 'Bu şartlar ve koşullar Birleşik Krallık yasalarına göre yönetilir ve yorumlanır ve bu Eyalet veya konumdaki mahkemelerin münhasır yargı yetkisine geri dönülemez bir şekilde tabi olursunuz.'
      }
    ]
  }
};

export const PRODUCTS_TR: Product[] = [
  // ... (No changes to product array structure)
  {
    id: '1',
    slug: 'favilla-ember',
    name: 'Favilla Ember',
    tagline: 'Tütsülenmiş Meşe & Deri',
    price: 45,
    type: 'jar',
    color: 'natural',
    material: 'soy-wax',
    image: 'https://images.unsplash.com/photo-1608546193963-39ac496a7eb1?q=80&w=800&auto=format&fit=crop',
    hoverImage: 'https://images.unsplash.com/photo-1572297863920-992a72b64730?q=80&w=800&auto=format&fit=crop',
    description: 'Akşam düşünceleri için tasarlanmış derin, yankılanan bir koku profili. Ember; yaşlanmış meşe, yıpranmış deri ve bir miktar tütün yaprağını birleştirir.',
    rating: 4.8,
    reviewCount: 124,
    burnTime: '45-50 Saat',
    scentProfile: 'Odunsu, İsli',
    stock: 50
  },
  {
    id: '2',
    slug: 'obsidian-monolith',
    name: 'Obsidian Monolith',
    tagline: 'Kokusuz Heykelsi',
    price: 60,
    type: 'sculptural',
    color: 'charcoal',
    material: 'beeswax',
    image: 'https://images.unsplash.com/photo-1610313813959-197931327184?q=80&w=800&auto=format&fit=crop',
    hoverImage: 'https://images.unsplash.com/photo-1617260026615-5807469741a4?q=80&w=800&auto=format&fit=crop',
    description: 'Siyah balmumundan elle oyulmuş Monolith bir başyapıttır. Duvarlar sabit kalırken içe doğru yanarak bir fener etkisi yaratır.',
    rating: 4.9,
    reviewCount: 89,
    burnTime: '60 Saat',
    scentProfile: 'Kokusuz (Doğal Bal)',
    stock: 20
  },
  {
    id: '3',
    slug: 'solstice-jar',
    name: 'Solstice',
    tagline: 'Bergamot & Beyaz Çay',
    price: 50,
    discountPrice: 35,
    type: 'jar',
    color: 'natural',
    material: 'coconut-blend',
    image: 'https://images.unsplash.com/photo-1602826347632-4d46537604f4?q=80&w=800&auto=format&fit=crop',
    hoverImage: 'https://images.unsplash.com/photo-1596436889106-be35e843f974?q=80&w=800&auto=format&fit=crop',
    description: 'Hafif, havadar ve geçici. Solstice, parlak bergamot, sakinleştirici beyaz çay ve taze keten notalarıyla sabah ışığını yakalar.',
    rating: 4.7,
    reviewCount: 210,
    burnTime: '40 Saat',
    scentProfile: 'Taze, Narenciye',
    stock: 100
  },
  {
    id: '4',
    slug: 'terra-form',
    name: 'Terra Form',
    tagline: 'Ham Toprak',
    price: 55,
    type: 'sculptural',
    color: 'terracotta',
    material: 'beeswax',
    image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?q=80&w=800&auto=format&fit=crop',
    hoverImage: 'https://images.unsplash.com/photo-1592657388147-380d5d1c97bd?q=80&w=800&auto=format&fit=crop',
    description: 'Antik çömlekçilikten ilham alan Terra Form sizi toprağa bağlar. Doğal balmumu aroması ile zengin, topraksı tonlar.',
    rating: 4.6,
    reviewCount: 56,
    burnTime: '35 Saat',
    scentProfile: 'Topraksı, Mineral',
    stock: 15
  },
  {
    id: '5',
    slug: 'luna-set',
    name: 'The Luna Set',
    tagline: 'Evreler Üçlüsü',
    price: 120,
    type: 'set',
    color: 'natural',
    material: 'soy-wax',
    image: 'https://images.unsplash.com/photo-1595180633649-7c87c2c9d2bf?q=80&w=800&auto=format&fit=crop',
    hoverImage: 'https://images.unsplash.com/photo-1608546194258-29369cf531dc?q=80&w=800&auto=format&fit=crop',
    description: 'Işığın üç evresi. Bu set, imza nötr paletimizde Hilal (küçük), Yarım (orta) ve Dolunay (büyük) kavanozları içerir.',
    rating: 5.0,
    reviewCount: 42,
    burnTime: 'Toplam 120+ Saat',
    scentProfile: 'Vanilya, Sandal Ağacı',
    stock: 30
  },
  {
    id: '6',
    slug: 'void-vessel',
    name: 'Void Vessel',
    tagline: 'Siyah Amber & Misk',
    price: 48,
    type: 'jar',
    color: 'charcoal',
    material: 'coconut-blend',
    image: 'https://images.unsplash.com/photo-1617377507198-25f02c658a2f?q=80&w=800&auto=format&fit=crop',
    hoverImage: 'https://images.unsplash.com/photo-1570823343906-888e53a3a41a?q=80&w=800&auto=format&fit=crop',
    description: 'Karanlık üzerine bir çalışma. Void Vessel, baştan çıkarıcı amber ve misk kokusuyla siyah boyalı hindistan cevizi mumu karışımı kullanır.',
    rating: 4.8,
    reviewCount: 156,
    burnTime: '45 Saat',
    scentProfile: 'Misk, Baharatlı',
    stock: 50
  }
];