// Supabase Client Configuration
import { createClient } from 'https://cdn.skypack.dev/@supabase/supabase-js@2';

// Supabase configuration - سيتم تحديثها تلقائياً عند ربط Supabase
const supabaseUrl = 'https://wufvlgmlxqdgqqsnsgxa.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZnZsZ21seHFkZ3Fxc25zZ3hhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2MjY4NzQsImV4cCI6MjA1MDIwMjg3NH0.dummy';

// Create Supabase client (مع التحقق من وجود البيانات)
let supabase = null;
let isSupabaseConnected = false;

// محاولة الاتصال بـ Supabase (اختياري)
try {
  if (supabaseUrl && supabaseAnonKey && !supabaseAnonKey.includes('dummy')) {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    isSupabaseConnected = true;
    console.log('✅ Supabase connected successfully');
  } else {
    console.log('⚠️ Supabase not configured, using mock data');
  }
} catch (error) {
  console.warn('⚠️ Supabase connection failed, using mock data:', error);
  supabase = null;
  isSupabaseConnected = false;
}

// Helper function to check if Supabase is available
function isSupabaseAvailable() {
  return supabase !== null && isSupabaseConnected;
}

// Helper function to generate UUID
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Helper function to get current timestamp
function getCurrentTimestamp() {
  return new Date().toISOString();
}

// Mock data for testing
const mockOrders = [
  {
    id: '1',
    name: 'أحمد محمد',
    email: 'ahmed@example.com',
    phone: '0501234567',
    message: 'أريد الاستفسار عن باقة HR Hub الشاملة',
    hub: 'hrhub',
    status: 'pending',
    created_at: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    name: 'فاطمة علي',
    email: 'fatima@example.com',
    phone: '0507654321',
    message: 'أحتاج تطوير موقع إلكتروني لشركتي',
    hub: 'webhub',
    status: 'subscribed',
    created_at: '2024-01-14T14:20:00Z'
  }
];

const mockBanners = [
  {
    id: '1',
    title: 'QIWA Platform',
    image_url: 'qiwa.png',
    alt_text: 'QIWA',
    hub_type: 'hrhub',
    display_order: 1,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    title: 'Absher Services',
    image_url: 'absher.png',
    alt_text: 'Absher',
    hub_type: 'hrhub',
    display_order: 2,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z'
  }
];

const mockProducts = [
  {
    id: '1',
    name: 'موقع إلكتروني احترافي',
    description: 'تصميم وتطوير موقع إلكتروني متجاوب مع جميع الأجهزة',
    price: 2500,
    duration: '2-3 أسابيع',
    icon: 'fas fa-globe',
    features: ['تصميم متجاوب', 'لوحة إدارة', 'تحسين محركات البحث'],
    display_order: 1,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'متجر إلكتروني',
    description: 'متجر إلكتروني كامل مع نظام دفع وإدارة المنتجات',
    price: 4500,
    duration: '3-4 أسابيع',
    icon: 'fas fa-shopping-cart',
    features: ['نظام دفع آمن', 'إدارة المخزون', 'تقارير المبيعات'],
    display_order: 2,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    name: 'تطبيق جوال',
    description: 'تطبيق جوال لنظامي iOS و Android',
    price: 8000,
    duration: '4-6 أسابيع',
    icon: 'fas fa-mobile-alt',
    features: ['متوافق مع iOS و Android', 'واجهة سهلة الاستخدام', 'إشعارات فورية'],
    display_order: 3,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z'
  }
];

export { supabase, isSupabaseAvailable };

// Orders API functions
export const ordersAPI = {
  // إضافة طلب جديد
  async createOrder(orderData) {
    // Always use mock data for now
    const newOrder = {
      id: generateUUID(),
      ...orderData,
      status: 'pending',
      created_at: getCurrentTimestamp()
    };
    
    mockOrders.unshift(newOrder);
    return { success: true, data: newOrder };
  },

  // جلب جميع الطلبات
  async getAllOrders() {
    // Always use mock data for now
    return { success: true, data: [...mockOrders] };
  },

  // تحديث حالة الطلب
  async updateOrderStatus(orderId, newStatus) {
    const orderIndex = mockOrders.findIndex(o => o.id === orderId);
    
    if (orderIndex === -1) {
      return { success: false, error: 'Order not found' };
    }
    
    mockOrders[orderIndex].status = newStatus;
    mockOrders[orderIndex].updated_at = getCurrentTimestamp();
    
    return { success: true, data: mockOrders[orderIndex] };
  },

  // حذف طلب
  async deleteOrder(orderId) {
    const orderIndex = mockOrders.findIndex(o => o.id === orderId);
    
    if (orderIndex === -1) {
      return { success: false, error: 'Order not found' };
    }
    
    mockOrders.splice(orderIndex, 1);
    return { success: true };
  },

  // الاشتراك في التحديثات المباشرة
  subscribeToOrders(callback) {
    // Mock subscription - not implemented
    return null;
  }
};

// Banner Images API functions
export const bannerAPI = {
  // جلب جميع صور البنر
  async getAllBanners(hubType = null) {
    let data = [...mockBanners];
    
    if (hubType) {
      data = data.filter(banner => banner.hub_type === hubType);
    }
    
    return { success: true, data };
  },

  // إضافة صورة بنر جديدة
  async createBanner(bannerData) {
    const newBanner = {
      id: generateUUID(),
      ...bannerData,
      is_active: true,
      created_at: getCurrentTimestamp()
    };
    
    mockBanners.push(newBanner);
    return { success: true, data: newBanner };
  },

  // تحديث صورة بنر
  async updateBanner(bannerId, bannerData) {
    const bannerIndex = mockBanners.findIndex(b => b.id === bannerId);
    
    if (bannerIndex === -1) {
      return { success: false, error: 'Banner not found' };
    }
    
    mockBanners[bannerIndex] = {
      ...mockBanners[bannerIndex],
      ...bannerData,
      updated_at: getCurrentTimestamp()
    };
    
    return { success: true, data: mockBanners[bannerIndex] };
  },

  // حذف صورة بنر
  async deleteBanner(bannerId) {
    const bannerIndex = mockBanners.findIndex(b => b.id === bannerId);
    
    if (bannerIndex === -1) {
      return { success: false, error: 'Banner not found' };
    }
    
    mockBanners.splice(bannerIndex, 1);
    return { success: true };
  }
};

// Products API functions
export const productsAPI = {
  // جلب جميع المنتجات
  async getAllProducts() {
    return { success: true, data: [...mockProducts] };
  },

  // إضافة منتج جديد
  async createProduct(productData) {
    const newProduct = {
      id: generateUUID(),
      ...productData,
      is_active: true,
      created_at: getCurrentTimestamp()
    };
    
    mockProducts.push(newProduct);
    return { success: true, data: newProduct };
  },

  // تحديث منتج
  async updateProduct(productId, productData) {
    const productIndex = mockProducts.findIndex(p => p.id === productId);
    
    if (productIndex === -1) {
      return { success: false, error: 'Product not found' };
    }
    
    mockProducts[productIndex] = {
      ...mockProducts[productIndex],
      ...productData,
      updated_at: getCurrentTimestamp()
    };
    
    return { success: true, data: mockProducts[productIndex] };
  },

  // حذف منتج
  async deleteProduct(productId) {
    const productIndex = mockProducts.findIndex(p => p.id === productId);
    
    if (productIndex === -1) {
      return { success: false, error: 'Product not found' };
    }
    
    mockProducts.splice(productIndex, 1);
    return { success: true };
  }
};

// Authentication functions
export const authAPI = {
  // تسجيل دخول المدير
  async signInAdmin(email, password) {
    // Local authentication
    const ADMIN_CREDENTIALS = {
      email: 'admin@hrhub.sa',
      password: 'hrhub2025'
    };
    
    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
      return { success: true, data: { user: { email } } };
    } else {
      return { success: false, error: 'Invalid credentials' };
    }
  },

  // تسجيل خروج
  async signOut() {
    return { success: true };
  },

  // جلب المستخدم الحالي
  async getCurrentUser() {
    // Check local authentication
    const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
    if (isLoggedIn) {
      return { success: true, user: { email: 'admin@hrhub.sa' } };
    } else {
      return { success: false, error: 'No user logged in' };
    }
  },

  // الاشتراك في تغييرات المصادقة
  onAuthStateChange(callback) {
    return null;
  }
};
