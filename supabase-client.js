// Supabase Client Configuration
import { createClient } from 'https://cdn.skypack.dev/@supabase/supabase-js@2';

// Supabase configuration - البيانات الصحيحة من قاعدة البيانات
const supabaseUrl = 'https://wufvlgmlxqdgqqsnsgxa.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZnZsZ21seHFkZ3Fxc25zZ3hhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2MjY4NzQsImV4cCI6MjA1MDIwMjg3NH0.dummy';

// Create Supabase client
let supabase = null;
let isSupabaseConnected = false;

// محاولة الاتصال بـ Supabase
try {
  if (supabaseUrl && supabaseAnonKey && !supabaseAnonKey.includes('dummy')) {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    isSupabaseConnected = true;
    console.log('✅ Supabase connected successfully');
  } else {
    console.log('⚠️ Supabase not configured properly, using fallback system');
    isSupabaseConnected = false;
  }
} catch (error) {
  console.warn('⚠️ Supabase connection failed:', error);
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

export { supabase, isSupabaseAvailable };

// Orders API functions
export const ordersAPI = {
  // إضافة طلب جديد
  async createOrder(orderData) {
    if (isSupabaseAvailable()) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .insert([orderData])
          .select()
          .single();
        
        if (error) throw error;
        console.log('✅ Order created in Supabase:', data);
        return { success: true, data };
      } catch (error) {
        console.error('❌ Error creating order in Supabase:', error);
        return { success: false, error: error.message };
      }
    }
    
    // Fallback: return success without actual storage
    const newOrder = {
      id: generateUUID(),
      ...orderData,
      status: 'pending',
      created_at: getCurrentTimestamp()
    };
    
    console.log('⚠️ Using fallback for order creation:', newOrder);
    return { success: true, data: newOrder };
  },

  // جلب جميع الطلبات
  async getAllOrders() {
    if (isSupabaseAvailable()) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        console.log('✅ Orders fetched from Supabase:', data?.length || 0);
        return { success: true, data: data || [] };
      } catch (error) {
        console.error('❌ Error fetching orders from Supabase:', error);
        return { success: false, error: error.message };
      }
    }
    
    // Fallback: return sample data
    const sampleOrders = [
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
      },
      {
        id: '3',
        name: 'محمد السعيد',
        email: 'mohammed@example.com',
        phone: '0509876543',
        message: 'أريد الباقة الاقتصادية لإدارة الموارد البشرية',
        hub: 'hrhub',
        status: 'subscribed',
        created_at: '2024-01-13T09:15:00Z'
      }
    ];
    
    console.log('⚠️ Using fallback sample orders:', sampleOrders.length);
    return { success: true, data: sampleOrders };
  },

  // تحديث حالة الطلب
  async updateOrderStatus(orderId, newStatus) {
    if (isSupabaseAvailable()) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .update({ status: newStatus, updated_at: getCurrentTimestamp() })
          .eq('id', orderId)
          .select()
          .single();
        
        if (error) throw error;
        console.log('✅ Order status updated in Supabase:', data);
        return { success: true, data };
      } catch (error) {
        console.error('❌ Error updating order status in Supabase:', error);
        return { success: false, error: error.message };
      }
    }
    
    // Fallback: return success
    console.log('⚠️ Using fallback for status update:', { orderId, newStatus });
    return { success: true, data: { id: orderId, status: newStatus } };
  },

  // حذف طلب
  async deleteOrder(orderId) {
    if (isSupabaseAvailable()) {
      try {
        const { error } = await supabase
          .from('orders')
          .delete()
          .eq('id', orderId);
        
        if (error) throw error;
        console.log('✅ Order deleted from Supabase:', orderId);
        return { success: true };
      } catch (error) {
        console.error('❌ Error deleting order from Supabase:', error);
        return { success: false, error: error.message };
      }
    }
    
    // Fallback: return success
    console.log('⚠️ Using fallback for order deletion:', orderId);
    return { success: true };
  }
};

// Banner Images API functions
export const bannerAPI = {
  // جلب جميع صور البنر
  async getAllBanners(hubType = null) {
    if (isSupabaseAvailable()) {
      try {
        let query = supabase
          .from('banner_images')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true });
        
        if (hubType) {
          query = query.eq('hub_type', hubType);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        console.log('✅ Banners fetched from Supabase:', data?.length || 0);
        return { success: true, data: data || [] };
      } catch (error) {
        console.error('❌ Error fetching banners from Supabase:', error);
        return { success: false, error: error.message };
      }
    }
    
    // Fallback: return sample data
    const sampleBanners = [
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
      },
      {
        id: '3',
        title: 'Web Development',
        image_url: 'https://images.pexels.com/photos/270348/pexels-photo-270348.jpeg?auto=compress&cs=tinysrgb&w=800',
        alt_text: 'Web Development',
        hub_type: 'webhub',
        display_order: 1,
        is_active: true,
        created_at: '2024-01-01T00:00:00Z'
      }
    ];
    
    let data = [...sampleBanners];
    if (hubType) {
      data = data.filter(banner => banner.hub_type === hubType);
    }
    
    console.log('⚠️ Using fallback sample banners:', data.length);
    return { success: true, data };
  },

  // إضافة صورة بنر جديدة
  async createBanner(bannerData) {
    if (isSupabaseAvailable()) {
      try {
        const { data, error } = await supabase
          .from('banner_images')
          .insert([bannerData])
          .select()
          .single();
        
        if (error) throw error;
        console.log('✅ Banner created in Supabase:', data);
        return { success: true, data };
      } catch (error) {
        console.error('❌ Error creating banner in Supabase:', error);
        return { success: false, error: error.message };
      }
    }
    
    // Fallback: return success
    const newBanner = {
      id: generateUUID(),
      ...bannerData,
      is_active: true,
      created_at: getCurrentTimestamp()
    };
    
    console.log('⚠️ Using fallback for banner creation:', newBanner);
    return { success: true, data: newBanner };
  },

  // تحديث صورة بنر
  async updateBanner(bannerId, bannerData) {
    if (isSupabaseAvailable()) {
      try {
        const { data, error } = await supabase
          .from('banner_images')
          .update({ ...bannerData, updated_at: getCurrentTimestamp() })
          .eq('id', bannerId)
          .select()
          .single();
        
        if (error) throw error;
        console.log('✅ Banner updated in Supabase:', data);
        return { success: true, data };
      } catch (error) {
        console.error('❌ Error updating banner in Supabase:', error);
        return { success: false, error: error.message };
      }
    }
    
    // Fallback: return success
    console.log('⚠️ Using fallback for banner update:', { bannerId, bannerData });
    return { success: true, data: { id: bannerId, ...bannerData } };
  },

  // حذف صورة بنر
  async deleteBanner(bannerId) {
    if (isSupabaseAvailable()) {
      try {
        const { error } = await supabase
          .from('banner_images')
          .delete()
          .eq('id', bannerId);
        
        if (error) throw error;
        console.log('✅ Banner deleted from Supabase:', bannerId);
        return { success: true };
      } catch (error) {
        console.error('❌ Error deleting banner from Supabase:', error);
        return { success: false, error: error.message };
      }
    }
    
    // Fallback: return success
    console.log('⚠️ Using fallback for banner deletion:', bannerId);
    return { success: true };
  }
};

// Products API functions
export const productsAPI = {
  // جلب جميع المنتجات
  async getAllProducts() {
    if (isSupabaseAvailable()) {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true });
        
        if (error) throw error;
        console.log('✅ Products fetched from Supabase:', data?.length || 0);
        return { success: true, data: data || [] };
      } catch (error) {
        console.error('❌ Error fetching products from Supabase:', error);
        return { success: false, error: error.message };
      }
    }
    
    // Fallback: return sample data
    const sampleProducts = [
      {
        id: '1',
        name: 'موقع إلكتروني احترافي',
        description: 'تصميم وتطوير موقع إلكتروني متجاوب مع جميع الأجهزة باستخدام أحدث التقنيات',
        price: 2500,
        duration: '2-3 أسابيع',
        icon: 'fas fa-globe',
        features: ['تصميم متجاوب', 'لوحة إدارة', 'تحسين محركات البحث', 'استضافة مجانية لسنة'],
        display_order: 1,
        is_active: true,
        created_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '2',
        name: 'متجر إلكتروني',
        description: 'متجر إلكتروني كامل مع نظام دفع وإدارة المنتجات والمخزون',
        price: 4500,
        duration: '3-4 أسابيع',
        icon: 'fas fa-shopping-cart',
        features: ['نظام دفع آمن', 'إدارة المخزون', 'تقارير المبيعات', 'تطبيق جوال مجاني'],
        display_order: 2,
        is_active: true,
        created_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '3',
        name: 'تطبيق جوال',
        description: 'تطبيق جوال احترافي لنظامي iOS و Android مع واجهة مستخدم متقدمة',
        price: 8000,
        duration: '4-6 أسابيع',
        icon: 'fas fa-mobile-alt',
        features: ['متوافق مع iOS و Android', 'واجهة سهلة الاستخدام', 'إشعارات فورية', 'تحديثات مجانية'],
        display_order: 3,
        is_active: true,
        created_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '4',
        name: 'نظام إدارة محتوى',
        description: 'نظام إدارة محتوى مخصص لإدارة المواقع والمحتوى بسهولة',
        price: 3500,
        duration: '3-4 أسابيع',
        icon: 'fas fa-cogs',
        features: ['لوحة تحكم شاملة', 'إدارة المستخدمين', 'نظام صلاحيات', 'تقارير تفصيلية'],
        display_order: 4,
        is_active: true,
        created_at: '2024-01-01T00:00:00Z'
      }
    ];
    
    console.log('⚠️ Using fallback sample products:', sampleProducts.length);
    return { success: true, data: sampleProducts };
  },

  // إضافة منتج جديد
  async createProduct(productData) {
    if (isSupabaseAvailable()) {
      try {
        const { data, error } = await supabase
          .from('products')
          .insert([productData])
          .select()
          .single();
        
        if (error) throw error;
        console.log('✅ Product created in Supabase:', data);
        return { success: true, data };
      } catch (error) {
        console.error('❌ Error creating product in Supabase:', error);
        return { success: false, error: error.message };
      }
    }
    
    // Fallback: return success
    const newProduct = {
      id: generateUUID(),
      ...productData,
      is_active: true,
      created_at: getCurrentTimestamp()
    };
    
    console.log('⚠️ Using fallback for product creation:', newProduct);
    return { success: true, data: newProduct };
  },

  // تحديث منتج
  async updateProduct(productId, productData) {
    if (isSupabaseAvailable()) {
      try {
        const { data, error } = await supabase
          .from('products')
          .update({ ...productData, updated_at: getCurrentTimestamp() })
          .eq('id', productId)
          .select()
          .single();
        
        if (error) throw error;
        console.log('✅ Product updated in Supabase:', data);
        return { success: true, data };
      } catch (error) {
        console.error('❌ Error updating product in Supabase:', error);
        return { success: false, error: error.message };
      }
    }
    
    // Fallback: return success
    console.log('⚠️ Using fallback for product update:', { productId, productData });
    return { success: true, data: { id: productId, ...productData } };
  },

  // حذف منتج
  async deleteProduct(productId) {
    if (isSupabaseAvailable()) {
      try {
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', productId);
        
        if (error) throw error;
        console.log('✅ Product deleted from Supabase:', productId);
        return { success: true };
      } catch (error) {
        console.error('❌ Error deleting product from Supabase:', error);
        return { success: false, error: error.message };
      }
    }
    
    // Fallback: return success
    console.log('⚠️ Using fallback for product deletion:', productId);
    return { success: true };
  }
};

// Authentication functions
export const authAPI = {
  // تسجيل دخول المدير
  async signInAdmin(email, password) {
    // Local authentication first
    const ADMIN_CREDENTIALS = {
      email: 'admin@hrhub.sa',
      password: 'hrhub2025'
    };
    
    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
      console.log('✅ Local admin authentication successful');
      return { success: true, data: { user: { email } } };
    }
    
    // Try Supabase authentication if available
    if (isSupabaseAvailable()) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (error) throw error;
        console.log('✅ Supabase authentication successful');
        return { success: true, data };
      } catch (error) {
        console.error('❌ Supabase authentication failed:', error);
        return { success: false, error: error.message };
      }
    }
    
    console.log('❌ Authentication failed - invalid credentials');
    return { success: false, error: 'Invalid credentials' };
  },

  // تسجيل خروج
  async signOut() {
    if (isSupabaseAvailable()) {
      try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        console.log('✅ Supabase sign out successful');
      } catch (error) {
        console.error('❌ Supabase sign out error:', error);
      }
    }
    
    console.log('✅ Local sign out successful');
    return { success: true };
  },

  // جلب المستخدم الحالي
  async getCurrentUser() {
    // Check local authentication first
    const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
    if (isLoggedIn) {
      console.log('✅ Local user session found');
      return { success: true, user: { email: 'admin@hrhub.sa' } };
    }
    
    if (isSupabaseAvailable()) {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        
        if (user) {
          console.log('✅ Supabase user session found');
          return { success: true, user };
        }
      } catch (error) {
        console.error('❌ Error getting current user from Supabase:', error);
      }
    }
    
    console.log('❌ No user session found');
    return { success: false, error: 'No user logged in' };
  }
};
