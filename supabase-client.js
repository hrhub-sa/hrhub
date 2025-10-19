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
    console.log('⚠️ Supabase not configured, using localStorage fallback');
  }
} catch (error) {
  console.warn('⚠️ Supabase connection failed, using localStorage fallback:', error);
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
          .insert([{
            name: orderData.name,
            email: orderData.email,
            phone: orderData.phone,
            message: orderData.message,
            hub: orderData.hub,
            status: 'pending'
          }])
          .select()
          .single();

        if (error) throw error;
        return { success: true, data };
      } catch (error) {
        console.error('Error creating order via Supabase:', error);
        // Fallback to localStorage
      }
    }
    
    // localStorage fallback
    try {
      const newOrder = {
        id: generateUUID(),
        ...orderData,
        status: 'pending',
        created_at: getCurrentTimestamp(),
        updated_at: getCurrentTimestamp()
      };
      
      const existingOrders = localStorage.getItem('customerOrders');
      const orders = existingOrders ? JSON.parse(existingOrders) : [];
      orders.push(newOrder);
      localStorage.setItem('customerOrders', JSON.stringify(orders));
      
      return { success: true, data: newOrder };
    } catch (error) {
      console.error('Error creating order:', error);
      return { success: false, error: error.message };
    }
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
        return { success: true, data };
      } catch (error) {
        console.error('Error fetching orders via Supabase:', error);
        // Fallback to localStorage
      }
    }
    
    // localStorage fallback
    try {
      const orders = localStorage.getItem('customerOrders');
      const data = orders ? JSON.parse(orders) : [];
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching orders:', error);
      return { success: false, error: error.message };
    }
  },

  // تحديث حالة الطلب
  async updateOrderStatus(orderId, newStatus) {
    if (isSupabaseAvailable()) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .update({ status: newStatus })
          .eq('id', orderId)
          .select()
          .single();

        if (error) throw error;
        return { success: true, data };
      } catch (error) {
        console.error('Error updating order status via Supabase:', error);
        // Fallback to localStorage
      }
    }
    
    // localStorage fallback
    try {
      const orders = localStorage.getItem('customerOrders');
      if (!orders) return { success: false, error: 'No orders found' };
      
      const ordersArray = JSON.parse(orders);
      const orderIndex = ordersArray.findIndex(o => o.id === orderId);
      
      if (orderIndex === -1) {
        return { success: false, error: 'Order not found' };
      }
      
      ordersArray[orderIndex].status = newStatus;
      ordersArray[orderIndex].updated_at = getCurrentTimestamp();
      
      localStorage.setItem('customerOrders', JSON.stringify(ordersArray));
      return { success: true, data: ordersArray[orderIndex] };
    } catch (error) {
      console.error('Error updating order status:', error);
      return { success: false, error: error.message };
    }
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
        return { success: true };
      } catch (error) {
        console.error('Error deleting order via Supabase:', error);
        // Fallback to localStorage
      }
    }
    
    // localStorage fallback
    try {
      const orders = localStorage.getItem('customerOrders');
      if (!orders) return { success: false, error: 'No orders found' };
      
      const ordersArray = JSON.parse(orders);
      const filteredOrders = ordersArray.filter(o => o.id !== orderId);
      
      localStorage.setItem('customerOrders', JSON.stringify(filteredOrders));
      return { success: true };
    } catch (error) {
      console.error('Error deleting order:', error);
      return { success: false, error: error.message };
    }
  },

  // الاشتراك في التحديثات المباشرة
  subscribeToOrders(callback) {
    if (isSupabaseAvailable()) {
      return supabase
        .channel('orders-changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'orders' }, 
          callback
        )
        .subscribe();
    }
    return null;
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
        return { success: true, data };
      } catch (error) {
        console.error('Error fetching banners via Supabase:', error);
        // Fallback to localStorage
      }
    }
    
    // localStorage fallback
    try {
      const banners = localStorage.getItem('bannerImages');
      let data = banners ? JSON.parse(banners) : [];
      
      if (hubType) {
        data = data.filter(banner => banner.hub_type === hubType);
      }
      
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching banners:', error);
      return { success: false, error: error.message };
    }
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
        return { success: true, data };
      } catch (error) {
        console.error('Error creating banner via Supabase:', error);
        // Fallback to localStorage
      }
    }
    
    // localStorage fallback
    try {
      const newBanner = {
        id: generateUUID(),
        ...bannerData,
        is_active: true,
        created_at: getCurrentTimestamp(),
        updated_at: getCurrentTimestamp()
      };
      
      const existingBanners = localStorage.getItem('bannerImages');
      const banners = existingBanners ? JSON.parse(existingBanners) : [];
      banners.push(newBanner);
      localStorage.setItem('bannerImages', JSON.stringify(banners));
      
      return { success: true, data: newBanner };
    } catch (error) {
      console.error('Error creating banner:', error);
      return { success: false, error: error.message };
    }
  },

  // تحديث صورة بنر
  async updateBanner(bannerId, bannerData) {
    if (isSupabaseAvailable()) {
      try {
        const { data, error } = await supabase
          .from('banner_images')
          .update(bannerData)
          .eq('id', bannerId)
          .select()
          .single();

        if (error) throw error;
        return { success: true, data };
      } catch (error) {
        console.error('Error updating banner via Supabase:', error);
        // Fallback to localStorage
      }
    }
    
    // localStorage fallback
    try {
      const banners = localStorage.getItem('bannerImages');
      if (!banners) return { success: false, error: 'No banners found' };
      
      const bannersArray = JSON.parse(banners);
      const bannerIndex = bannersArray.findIndex(b => b.id === bannerId);
      
      if (bannerIndex === -1) {
        return { success: false, error: 'Banner not found' };
      }
      
      bannersArray[bannerIndex] = {
        ...bannersArray[bannerIndex],
        ...bannerData,
        updated_at: getCurrentTimestamp()
      };
      
      localStorage.setItem('bannerImages', JSON.stringify(bannersArray));
      return { success: true, data: bannersArray[bannerIndex] };
    } catch (error) {
      console.error('Error updating banner:', error);
      return { success: false, error: error.message };
    }
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
        return { success: true };
      } catch (error) {
        console.error('Error deleting banner via Supabase:', error);
        // Fallback to localStorage
      }
    }
    
    // localStorage fallback
    try {
      const banners = localStorage.getItem('bannerImages');
      if (!banners) return { success: false, error: 'No banners found' };
      
      const bannersArray = JSON.parse(banners);
      const filteredBanners = bannersArray.filter(b => b.id !== bannerId);
      
      localStorage.setItem('bannerImages', JSON.stringify(filteredBanners));
      return { success: true };
    } catch (error) {
      console.error('Error deleting banner:', error);
      return { success: false, error: error.message };
    }
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
        return { success: true, data };
      } catch (error) {
        console.error('Error fetching products via Supabase:', error);
        // Fallback to localStorage
      }
    }
    
    // localStorage fallback
    try {
      const products = localStorage.getItem('products');
      const data = products ? JSON.parse(products) : [];
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching products:', error);
      return { success: false, error: error.message };
    }
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
        return { success: true, data };
      } catch (error) {
        console.error('Error creating product via Supabase:', error);
        // Fallback to localStorage
      }
    }
    
    // localStorage fallback
    try {
      const newProduct = {
        id: generateUUID(),
        ...productData,
        is_active: true,
        created_at: getCurrentTimestamp(),
        updated_at: getCurrentTimestamp()
      };
      
      const existingProducts = localStorage.getItem('products');
      const products = existingProducts ? JSON.parse(existingProducts) : [];
      products.push(newProduct);
      localStorage.setItem('products', JSON.stringify(products));
      
      return { success: true, data: newProduct };
    } catch (error) {
      console.error('Error creating product:', error);
      return { success: false, error: error.message };
    }
  },

  // تحديث منتج
  async updateProduct(productId, productData) {
    if (isSupabaseAvailable()) {
      try {
        const { data, error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', productId)
          .select()
          .single();

        if (error) throw error;
        return { success: true, data };
      } catch (error) {
        console.error('Error updating product via Supabase:', error);
        // Fallback to localStorage
      }
    }
    
    // localStorage fallback
    try {
      const products = localStorage.getItem('products');
      if (!products) return { success: false, error: 'No products found' };
      
      const productsArray = JSON.parse(products);
      const productIndex = productsArray.findIndex(p => p.id === productId);
      
      if (productIndex === -1) {
        return { success: false, error: 'Product not found' };
      }
      
      productsArray[productIndex] = {
        ...productsArray[productIndex],
        ...productData,
        updated_at: getCurrentTimestamp()
      };
      
      localStorage.setItem('products', JSON.stringify(productsArray));
      return { success: true, data: productsArray[productIndex] };
    } catch (error) {
      console.error('Error updating product:', error);
      return { success: false, error: error.message };
    }
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
        return { success: true };
      } catch (error) {
        console.error('Error deleting product via Supabase:', error);
        // Fallback to localStorage
      }
    }
    
    // localStorage fallback
    try {
      const products = localStorage.getItem('products');
      if (!products) return { success: false, error: 'No products found' };
      
      const productsArray = JSON.parse(products);
      const filteredProducts = productsArray.filter(p => p.id !== productId);
      
      localStorage.setItem('products', JSON.stringify(filteredProducts));
      return { success: true };
    } catch (error) {
      console.error('Error deleting product:', error);
      return { success: false, error: error.message };
    }
  }
};

// Authentication functions
export const authAPI = {
  // تسجيل دخول المدير
  async signInAdmin(email, password) {
    if (isSupabaseAvailable()) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw error;
        return { success: true, data };
      } catch (error) {
        console.error('Error signing in via Supabase:', error);
        // Fallback to local authentication
      }
    }
    
    // Local authentication fallback
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
    if (isSupabaseAvailable()) {
      try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        return { success: true };
      } catch (error) {
        console.error('Error signing out via Supabase:', error);
      }
    }
    
    // Always return success for local logout
    return { success: true };
  },

  // جلب المستخدم الحالي
  async getCurrentUser() {
    if (isSupabaseAvailable()) {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        return { success: true, user };
      } catch (error) {
        console.error('Error getting current user via Supabase:', error);
      }
    }
    
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
    if (isSupabaseAvailable()) {
      return supabase.auth.onAuthStateChange(callback);
    }
    return null;
  }
};
