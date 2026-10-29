import { Product } from '../types';

export const en = {
  common: {
    loading: 'Loading...',
    sale: 'SALE',
    new: 'NEW',
    free: 'Free',
    errorTitle: 'Something went wrong.',
    errorDesc: 'We apologize for the inconvenience. An unexpected error occurred.',
    reload: 'Reload Application',
    notFound: 'Product not found.',
    backHome: 'Return Home',
    backProfile: 'Back to Profile',
    securePayment: 'Secure Payment',
    cities: 'London • Istanbul',
    thankYou: 'Thank you!',
    guarantee: 'Favilla Guarantee',
    stillQuestions: 'Still have questions?',
    error: 'An error occurred',
    retry: 'Retry'
  },
  validation: {
    required: 'Required',
    emailRequired: 'Email is required',
    emailInvalid: 'Invalid email format',
    passwordRequired: 'Password is required',
    nameRequired: 'Name is required',
    phoneRequired: 'Phone is required'
  },
  toasts: {
    addedToCart: 'Added to cart',
    removedFromWishlist: 'Removed from wishlist',
    savedToWishlist: 'Saved to wishlist',
    welcomeBack: 'Welcome back',
    loginFailed: 'Login failed',
    accountCreated: 'Account created',
    registrationFailed: 'Registration failed',
    loggedOut: 'Logged out',
    orderPlaced: 'Order placed successfully',
    addressAdded: 'Address added',
    addressRemoved: 'Address removed',
    addressUpdated: 'Address updated',
    ticketSubmitted: 'Ticket submitted',
    loginRequired: 'Login required'
  },
  nav: {
    journal: 'JOURNAL',
    collection: 'CANDLES',
    atelier: 'ATELIER',
    login: 'LOGIN',
    account: 'ACCOUNT',
    search: 'Search',
    wishlist: 'Wishlist',
    cart: 'Cart',
    menu: 'Menu',
    home: 'Home'
  },
  search: {
    placeholder: 'Search for scents...',
    results: 'Results',
    noResults: 'No candles found.',
    quickLinks: 'Quick Links',
    trending: 'Trending Now',
    pressEsc: 'Press ESC to close',
    quickLinkItems: {
      table: 'Signature Jars',
      pendants: 'Sculptural Wax',
      atelier: 'Curated Sets'
    },
    trends: {
      orbit: 'Favilla Ember',
      halo: 'The Luna Set',
      cream: 'Void Vessel'
    }
  },
  wishlist: {
    title: 'Your Wishlist',
    empty: 'Your wishlist is empty.',
    emptyDesc: 'Save scents you love for later.',
    explore: 'EXPLORE CANDLES',
    items: 'Items',
    loginRequired: 'Please login to access your wishlist.'
  },
  hero: {
    slide1: { title: 'Scent, Orchestrated', subtitle: 'The new wax series.' },
    slide2: { title: 'Organic Flame', subtitle: 'Inspired by warmth.' },
    slide3: { title: 'Eternal Glow', subtitle: 'From wick to wax.' },
    explore: 'EXPLORE SCENTS'
  },
  home: {
    storyTitle: 'Favilla',
    storyTitleItalic: 'Essence.',
    storyText: 'A candle is not just light; it is memory. Hand-poured in small batches, our wax blends are designed to release complex olfactory notes, transforming your space into a sanctuary of calm and warmth.',
    rotational: 'Hand-Poured',
    modular: 'Natural Wax',
    popularProducts: 'Signature Scents',
    popularCollection: 'Our most sought-after blends.',
    selectedWorks: 'Curated Sets',
    coreCollection: 'Explore the core collection.',
    viewAll: 'View All',
    aesthetic: 'Aesthetic',
    stylish: 'Scented',
    functional: 'Timeless'
  },
  slider: {
    eclipse: {
      title: 'Ember Series',
      role: 'Signature',
      caption: 'Smoked oak and leather notes for deep evenings.'
    },
    mono: {
      title: 'Pure Form',
      role: 'Minimalist',
      caption: 'Unscented sculptural beeswax for visual calm.'
    },
    aurora: {
      title: 'Aurora Glass',
      role: 'Artisan',
      caption: 'Hand-blown vessels that glow from within.'
    },
    axis: {
      title: 'Terra Collection',
      role: 'Earthy',
      caption: 'Baked clay vessels meeting coconut wax.'
    },
    zenith: {
      title: 'Zenith Wick',
      role: 'Innovation',
      caption: 'Wooden wicks that crackle like a hearth.'
    }
  },
  shop: {
    title: 'Shop.',
    subtitle: 'Olfactory experiences designed to adapt to your environment. Choose your scent.',
    seoDescription: 'Explore the Favilla collection. Hand-poured soy and beeswax candles designed to adapt to your environment.',
    type: 'Format',
    finish: 'Color',
    filterLabel: 'Filters',
    resetFilters: 'Reset Filters',
    sort: 'Sort By',
    loadMore: 'Load More',
    types: {
      all: 'All',
      jar: 'Jar Candle',
      sculptural: 'Sculptural',
      set: 'Gift Sets'
    },
    colors: {
      all: 'All',
      'natural': 'Natural',
      'charcoal': 'Charcoal',
      'terracotta': 'Terracotta'
    },
    noResults: 'No candles found matching your criteria.'
  },
  product: {
    back: 'BACK',
    configuration: 'Selection',
    viewingConfig: (type: string) => `Currently viewing ${type} format.`,
    addToCart: 'ADD TO CART',
    tableModule: 'Standard Jar',
    pendantModule: 'Large Vessel',
    specifications: 'Details',
    careGuide: 'Candle Care',
    dimensions: 'Size',
    material: 'Wax Blend',
    lightSource: 'Burn Time',
    scentProfile: 'Scent Profile',
    wishlistAdd: 'Add to Wishlist',
    wishlistRemove: 'Remove from Wishlist',
    careText: 'Trim wick to 1/4 inch before each lighting. Allow wax to melt to the edges of the vessel to prevent tunneling. Do not burn for more than 4 hours at a time.',
    qa: {
      tab: 'Q & A',
      title: 'Ask a Question',
      subtitle: 'Have a question about this scent? Ask us.',
      placeholder: 'Type your question here (e.g., throw, ingredients)...',
      submit: 'SUBMIT QUESTION',
      loginRequired: 'Login Required',
      loginMsg: 'You must be logged in to ask a question.',
      loginBtn: 'LOG IN TO ASK',
      success: 'Question Submitted',
      successMsg: 'You can view the response in the Help & Support section.',
      goToProfile: 'GO TO HELP & SUPPORT',
      pendingResponse: 'Pending response from support team.'
    }
  },
  reviews: {
    tab: 'Reviews',
    reviewCountLabel: 'Reviews',
    recommendation: '100% of customers recommend this scent',
    latest: 'Latest Reviews',
    write: 'Write a Review',
    rating: 'Rating',
    comment: 'Review',
    placeholder: 'Share your thoughts on the scent...',
    submit: 'Submit Review',
    cancel: 'Cancel',
    you: 'You',
    loginToReview: 'Login to review',
    purchaseToReview: 'Only verified purchasers can review this item.',
    noReviews: 'No reviews yet.'
  },
  cart: {
    title: 'Your Selection',
    empty: 'Cart is Empty',
    discover: 'Discover the scents.',
    subtotal: 'Subtotal',
    checkout: 'CHECKOUT',
    secure: 'Secure Checkout via Stripe',
    pay: 'PAY & ORDER',
    remove: 'Remove',
    success: 'Order received. Prepare for your home to smell amazing.',
    loginRequired: 'Please login to checkout',
    viewOrder: 'VIEW ORDER',
    coupon: {
      label: 'Discount Code',
      placeholder: 'ENTER CODE',
      apply: 'APPLY',
      remove: 'REMOVE',
      invalid: 'Invalid code',
      applied: 'Discount applied',
      discount: 'Discount'
    },
    steps: {
      cart: 'Cart',
      address: 'Shipping',
      payment: 'Payment',
      success: 'Confirmed'
    },
    address: {
      title: 'Shipping Address',
      select: 'Select delivery address',
      addNew: 'ADD NEW ADDRESS',
      deliverHere: 'DELIVER HERE',
      noAddresses: 'No addresses saved.',
      continueToPayment: 'CONTINUE TO PAYMENT',
      labels: {
        title: 'Label',
        line1: 'Address',
        city: 'City',
        zip: 'Zip',
        country: 'Country'
      },
      placeholders: {
        title: 'Home, Office...',
        line1: '123 Orbital Way',
        city: 'London',
        zip: 'SW1A 1AA',
        country: 'United Kingdom'
      },
      form: {
        title: 'New Address',
        save: 'SAVE & USE',
        cancel: 'CANCEL'
      }
    },
    payment: {
      cardNumber: 'Card Number',
      expiry: 'Expiry',
      cvc: 'CVC'
    }
  },
  auth: {
    welcome: 'Welcome Back',
    subtitle: 'Enter your details to access your account.',
    email: 'Email Address',
    password: 'Password',
    fullName: 'Full Name',
    phone: 'Phone Number',
    signIn: 'SIGN IN',
    signUp: 'REGISTER',
    noAccount: "Don't have an account?",
    hasAccount: "Already have an account?",
    registerTitle: 'Create Account',
    registerSubtitle: 'Join the Favilla collective.',
    errorShortPass: 'Password must be at least 6 characters.',
    forgotPassword: 'Forgot Password?'
  },
  forgotPasswordPage: {
    title: 'Reset Password',
    subtitle: 'Enter your email to receive reset instructions.',
    emailLabel: 'Email Address',
    emailPlaceholder: 'example@favilla.com',
    submitButton: 'SEND RESET LINK',
    successTitle: 'Check Your Inbox',
    successMessage: 'We have sent a password reset link to your email address.',
    backToLogin: 'Back to Login',
    invalidEmail: 'Please enter a valid email address.'
  },
  profile: {
    title: 'My Profile',
    menu: {
      overview: 'Overview',
      orders: 'Orders',
      addresses: 'Addresses',
      help: 'Help & Support',
      settings: 'Settings',
      logout: 'Log Out'
    },
    logoutModal: {
      title: 'Log Out',
      message: 'Are you sure you want to log out?',
      confirm: 'LOG OUT',
      cancel: 'CANCEL'
    },
    overview: {
      welcome: 'Hello,',
      statOrders: 'Total Orders',
      statSpent: 'Total Spent',
      recentActivity: 'Recent Activity',
      noActivity: 'No recent activity found.',
      items: 'Items',
      order: 'Order',
      orderNo: 'Order No.'
    },
    orders: {
      title: 'Order History',
      empty: 'No orders yet.',
      date: 'Date',
      total: 'Total',
      status: 'Status',
      items: 'Items',
      moreItems: 'more items'
    },
    addresses: {
      title: 'My Addresses',
      addNew: 'ADD NEW ADDRESS',
      delete: 'Delete',
      edit: 'Edit',
      formTitle: 'New Address',
      editTitle: 'Edit Address',
      save: 'SAVE ADDRESS',
      update: 'UPDATE ADDRESS',
      cancel: 'CANCEL'
    },
    help: {
      title: 'Help Desk',
      subtitle: 'How can we assist you today?',
      subject: 'Subject',
      orderNo: 'Order Number (Optional)',
      message: 'Message details',
      submit: 'SUBMIT REQUEST',
      successTitle: 'Request Received',
      successMsg: 'Our team will review your request and get back to you within 24 hours.',
      subjects: {
        shipping: 'Shipping Issue',
        complaint: 'Feedback',
        product: 'Product Inquiry',
        return: 'Returns & Broken Items',
        other: 'Other'
      },
      requests: 'My Requests',
      questions: 'My Product Questions',
      noRequests: 'No previous requests found.',
      noQuestions: 'No product questions asked yet.',
      ticketId: 'Ticket ID',
      questionId: 'Q-ID',
      status: 'Status',
      pending: 'Pending',
      answered: 'Answered'
    },
    settings: {
      title: 'Account Settings',
      personalInfo: 'Personal Information',
      security: 'Security & Password',
      currentPassword: 'Current Password',
      newPassword: 'New Password',
      confirmPassword: 'Confirm New Password',
      updateProfile: 'UPDATE PROFILE',
      changePassword: 'CHANGE PASSWORD',
      passwordSuccess: 'Password updated successfully.',
      profileSuccess: 'Profile updated successfully.',
      passwordMismatch: 'New passwords do not match.'
    }
  },
  orderDetail: {
    title: 'Order Details',
    back: 'Back to Orders',
    downloadInvoice: 'Download Invoice',
    summary: 'Order Summary',
    items: 'Items',
    deliveryAddress: 'Delivery Address',
    paymentMethod: 'Payment Method',
    shipping: 'Shipping',
    free: 'Free',
    total: 'Total',
    qty: 'Quantity',
    unitPrice: 'Unit Price',
    steps: {
      received: 'Order Received',
      preparing: 'Pouring/Packing',
      shipped: 'Shipped',
      delivered: 'Delivered'
    },
    review: {
      title: 'Review Order',
      placeholder: 'Share your thoughts about the candles...',
      submit: 'Submit Review',
      submitted: 'Thank you for your review!',
      rating: 'Your Rating'
    }
  },
  status: {
    processing: 'Processing',
    shipped: 'Shipped',
    delivered: 'Delivered',
    open: 'Open',
    'in-progress': 'In Progress',
    resolved: 'Resolved',
    pending: 'Pending',
    answered: 'Answered'
  },
  atelier: {
    hero: {
      title: 'The Atelier',
      subtitle: 'Where wax becomes memory.'
    },
    philosophy: {
      title: 'Philosophy',
      text1: 'Every Favilla candle begins as a question of atmosphere. How do we hold a scent without overpowering? The Atelier is our laboratory for answering this.',
      text2: 'Located in the artisan district, our workshop combines precise chemistry with analogue warmth. We do not mass produce; we orchestrate batches of wax.'
    },
    process: {
      design: {
        title: 'Blending',
        desc: 'Scent follows emotion. We mix essential oils to evoke specific memories before pouring.'
      },
      material: {
        title: 'Material',
        desc: 'Soy is clean, beeswax is slow. We fuse them to create the perfect burn.'
      },
      assembly: {
        title: 'Pouring',
        desc: 'Hand-poured in layers to ensure consistent scent throw from first light to last.'
      }
    },
    bespoke: {
      title: 'Bespoke Services',
      subtitle: 'For weddings & events.',
      desc: 'We collaborate with planners to create site-specific scent installations based on our wax technology.',
      cta: 'INQUIRE COMMISSION'
    }
  },
  footer: {
    desc: 'Redefining the relationship between scent, space, and memory through artisanal candles.',
    collection: 'Collection',
    connect: 'Connect',
    madeFor: 'Made for Calm.',
    rights: '© 2026 Favilla Candle.',
    newsletterTitle: 'Join the Atelier',
    newsletterDesc: 'Subscribe to receive updates on new scents, exhibitions, and seasonal drops.',
    emailPlaceholder: 'Email Address',
    subscribe: 'SUBSCRIBE',
    support: 'Support',
    legal: 'Legal',
    social: 'Social',
    address: '12 Orbital Way, London SW1A 1AA',
    links: {
      shipping: 'Shipping & Returns',
      faq: 'FAQ',
      contact: 'Contact Us',
      privacy: 'Privacy Policy',
      terms: 'Terms of Service'
    }
  },
  faq: {
    title: 'Frequently Asked Questions',
    subtitle: 'Common questions about our wax and shipping.',
    questions: [
      {
        q: "What kind of wax do you use?",
        a: "We use a proprietary blend of soy and coconut wax for a clean, slow burn. Our sculptural pieces use beeswax for structural integrity."
      },
      {
        q: "How can I prevent tunneling?",
        a: "Always burn your candle long enough for the wax to melt to the edge of the vessel, especially on the first burn."
      },
      {
        q: "Are your fragrances phthalate-free?",
        a: "Yes, all our fragrance oils are phthalate-free and infused with essential oils."
      },
      {
        q: "How long does shipping take?",
        a: "Orders are usually shipped within 1–3 business days. Delivery time may vary depending on your location."
      },
      {
        q: "Do you offer returns?",
        a: "We accept returns on unlit candles within 14 days of delivery."
      },
      {
        q: "How do I trim the wick?",
        a: "Use a wick trimmer or scissors to cut the wick to 1/4 inch before every burn to ensure a clean flame."
      },
      {
        q: "Can I recycle the jar?",
        a: "Absolutely. Once the wax is gone, wash with warm soapy water and reuse the vessel as a planter or storage."
      },
      {
        q: "Is my account secure?",
        a: "Your account information is protected by modern security standards."
      },
      {
        q: "Can I cancel my order?",
        a: "Orders that have not yet been shipped can be easily cancelled from the order details page."
      },
      {
        q: "Do you do wholesale?",
        a: "Yes, please contact us via the Bespoke/Contact page for wholesale inquiries."
      }
    ]
  },
  contact: {
    title: 'Contact.',
    subtitle: 'For inquiries regarding commissions, wholesale, or general assistance.',
    form: {
      name: 'Full Name',
      email: 'Email Address',
      subject: 'Subject',
      message: 'Message',
      send: 'SEND MESSAGE',
      sending: 'SENDING...',
      success: 'Message Sent Successfully',
      successDesc: 'Thank you for contacting Favilla. Our team will return to you shortly.',
      subjects: {
        general: 'General Inquiry',
        commission: 'Commission Request',
        order: 'Order Support',
        press: 'Press & Media'
      }
    },
    info: {
      visit: 'Visit the Atelier',
      hours: 'Mon-Fri: 10am — 6pm',
      call: 'Call Us',
      email: 'Email'
    }
  },
  shipping: {
    title: 'Shipping & Returns',
    subtitle: 'Policies designed for your peace of mind.',
    highlights: {
      global: 'Global Delivery',
      protection: 'Insured Packing',
      returns: '14-Day Returns'
    },
    sections: [
      {
        title: 'Shipping Policy',
        content: 'We offer worldwide shipping on all our candles. Each piece is packed in reinforced, eco-friendly honeycomb paper designed to withstand heat and transit. Orders are typically processed within 24-48 hours.'
      },
      {
        title: 'Delivery Timelines',
        content: 'For UK and Europe orders, please allow 3-5 business days. For North America and Asia, delivery typically takes 7-10 business days.'
      },
      {
        title: 'Melt Warning',
        content: 'During summer months, we ship with ice packs to prevent melting. Please ensure someone is available to receive the package to avoid it sitting in the sun.'
      },
      {
        title: 'Return Policy',
        content: 'We want you to love your Favilla scent. You may return any unlit item within 14 days of receipt for a full refund. Custom-commissioned pieces are non-refundable.'
      },
      {
        title: 'How to Return',
        content: 'To initiate a return, navigate to your Profile > Orders, select the relevant order, and click "Create Return Request".'
      },
      {
        title: 'Broken Items',
        content: 'In the unlikely event that your glass arrives broken, please contact us within 48 hours with a photo. We will ship a replacement immediately.'
      }
    ]
  },
  notFound: {
    title: '404',
    subtitle: 'The flame has extinguished.',
    desc: 'The page you are looking for has melted away or never existed. Return to the light.',
    button: 'Return Home'
  },
  privacyPolicy: {
    title: 'Privacy Policy',
    subtitle: 'Commitment to your privacy and data security.',
    sections: [
      {
        title: 'Data Collection',
        content: 'We collect personal information that you voluntarily provide to us when you register on the website, express an interest in obtaining information about us or our products and services, when you participate in activities on the website or otherwise when you contact us.'
      },
      {
        title: 'Use of Data',
        content: 'We use personal information collected via our website for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.'
      },
      {
        title: 'Information Sharing',
        content: 'We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations.'
      },
      {
        title: 'Data Security',
        content: 'We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, please also remember that we cannot guarantee that the internet itself is 100% secure.'
      },
      {
        title: 'Your Privacy Rights',
        content: 'In some regions, such as the European Economic Area, you have rights that allow you greater access to and control over your personal information. You may review, change, or terminate your account at any time.'
      },
      {
        title: 'Cookies',
        content: 'We use cookies and similar tracking technologies to access or store information. Specific information about how we use such technologies and how you can refuse certain cookies is set out in our Cookie Notice.'
      }
    ]
  },
  termsOfService: {
    title: 'Terms of Service',
    subtitle: 'Guidelines for using our services.',
    sections: [
      {
        title: 'Agreement to Terms',
        content: 'By accessing our website, you agree to be bound by these Terms of Service and to comply with all applicable laws and regulations. If you do not agree with these terms, you are prohibited from using or accessing this site.'
      },
      {
        title: 'Use License',
        content: 'Permission is granted to temporarily download one copy of the materials (information or software) on Favilla\'s website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.'
      },
      {
        title: 'Intellectual Property',
        content: 'All content included on this site, such as text, graphics, logos, images, and software, is the property of Favilla or its content suppliers and protected by international copyright laws.'
      },
      {
        title: 'User Accounts',
        content: 'When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.'
      },
      {
        title: 'Limitation of Liability',
        content: 'In no event shall Favilla or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Favilla\'s website.'
      },
      {
        title: 'Governing Law',
        content: 'These terms and conditions are governed by and construed in accordance with the laws of the United Kingdom and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.'
      }
    ]
  }
};

export const PRODUCTS_EN: Product[] = [
  // ... (No changes to product array structure)
  {
    id: '1',
    slug: 'favilla-ember',
    name: 'Favilla Ember',
    tagline: 'Smoked Oak & Leather',
    price: 45,
    type: 'jar',
    color: 'natural',
    material: 'soy-wax',
    image: 'https://images.unsplash.com/photo-1608546193963-39ac496a7eb1?q=80&w=800&auto=format&fit=crop',
    hoverImage: 'https://images.unsplash.com/photo-1572297863920-992a72b64730?q=80&w=800&auto=format&fit=crop',
    description: 'A deep, resonant scent profile designed for evening contemplation. The Ember combines aged oak, worn leather, and a hint of tobacco leaf.',
    rating: 4.8,
    reviewCount: 124,
    burnTime: '45-50 Hours',
    scentProfile: 'Woody, Smoky',
    stock: 50
  },
  {
    id: '2',
    slug: 'obsidian-monolith',
    name: 'Obsidian Monolith',
    tagline: 'Unscented Sculptural',
    price: 60,
    type: 'sculptural',
    color: 'charcoal',
    material: 'beeswax',
    image: 'https://images.unsplash.com/photo-1610313813959-197931327184?q=80&w=800&auto=format&fit=crop',
    hoverImage: 'https://images.unsplash.com/photo-1617260026615-5807469741a4?q=80&w=800&auto=format&fit=crop',
    description: 'Hand-carved from black beeswax, the Monolith is a statement piece. It burns inward, creating a lantern effect as the walls hold firm.',
    rating: 4.9,
    reviewCount: 89,
    burnTime: '60 Hours',
    scentProfile: 'Unscented (Natural Honey)',
    stock: 20
  },
  {
    id: '3',
    slug: 'solstice-jar',
    name: 'Solstice',
    tagline: 'Bergamot & White Tea',
    price: 50,
    discountPrice: 35,
    type: 'jar',
    color: 'natural',
    material: 'coconut-blend',
    image: 'https://images.unsplash.com/photo-1602826347632-4d46537604f4?q=80&w=800&auto=format&fit=crop',
    hoverImage: 'https://images.unsplash.com/photo-1596436889106-be35e843f974?q=80&w=800&auto=format&fit=crop',
    description: 'Light, airy, and ephemeral. Solstice captures the morning light with notes of bright bergamot, calming white tea, and fresh linen.',
    rating: 4.7,
    reviewCount: 210,
    burnTime: '40 Hours',
    scentProfile: 'Fresh, Citrus',
    stock: 100
  },
  {
    id: '4',
    slug: 'terra-form',
    name: 'Terra Form',
    tagline: 'Raw Earth',
    price: 55,
    type: 'sculptural',
    color: 'terracotta',
    material: 'beeswax',
    image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?q=80&w=800&auto=format&fit=crop',
    hoverImage: 'https://images.unsplash.com/photo-1592657388147-380d5d1c97bd?q=80&w=800&auto=format&fit=crop',
    description: 'Inspired by ancient pottery, the Terra Form connects you to the ground. Rich, earthy hues with a natural beeswax aroma.',
    rating: 4.6,
    reviewCount: 56,
    burnTime: '35 Hours',
    scentProfile: 'Earthy, Mineral',
    stock: 15
  },
  {
    id: '5',
    slug: 'luna-set',
    name: 'The Luna Set',
    tagline: 'Trio of Phases',
    price: 120,
    type: 'set',
    color: 'natural',
    material: 'soy-wax',
    image: 'https://images.unsplash.com/photo-1595180633649-7c87c2c9d2bf?q=80&w=800&auto=format&fit=crop',
    hoverImage: 'https://images.unsplash.com/photo-1608546194258-29369cf531dc?q=80&w=800&auto=format&fit=crop',
    description: 'Three stages of light. This set includes the Crescent (small), Quarter (medium), and Full (large) jars in our signature neutral palette.',
    rating: 5.0,
    reviewCount: 42,
    burnTime: '120+ Hours Total',
    scentProfile: 'Vanilla, Sandalwood',
    stock: 30
  },
  {
    id: '6',
    slug: 'void-vessel',
    name: 'Void Vessel',
    tagline: 'Black Amber & Musk',
    price: 48,
    type: 'jar',
    color: 'charcoal',
    material: 'coconut-blend',
    image: 'https://images.unsplash.com/photo-1617377507198-25f02c658a2f?q=80&w=800&auto=format&fit=crop',
    hoverImage: 'https://images.unsplash.com/photo-1570823343906-888e53a3a41a?q=80&w=800&auto=format&fit=crop',
    description: 'A study in darkness. The Void Vessel uses a black-dyed coconut wax blend with a seductive amber and musk fragrance.',
    rating: 4.8,
    reviewCount: 156,
    burnTime: '45 Hours',
    scentProfile: 'Musky, Spicy',
    stock: 50
  }
];