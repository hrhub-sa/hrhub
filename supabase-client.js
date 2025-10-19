// Supabase Client Configuration
import { createClient } from 'https://cdn.skypack.dev/@supabase/supabase-js@2';

// Supabase configuration - سيتم تحديثها تلقائياً عند ربط Supabase
const supabaseUrl = 'https://wufvlgmlxqdgqqsnsgxa.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZnZsZ21seHFkZ3Fxc25zZ3hhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4OTU0ODcsImV4cCI6MjA3NjQ3MTQ4N30.GtP6FafY8D3u9UBx9BcToBc9oeaV8ilOp-P6jI_Fb8s';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Orders API functions
export const ordersAPI = {
  // إضافة طلب جديد
  async createOrder(orderData) {
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
      console.error('Error creating order:', error);
      return { success: false, error: error.message };
    }
  },

  // جلب جميع الطلبات
  async getAllOrders() {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching orders:', error);
      return { success: false, error: error.message };
    }
  },

  // تحديث حالة الطلب
  async updateOrderStatus(orderId, newStatus) {
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
      console.error('Error updating order status:', error);
      return { success: false, error: error.message };
    }
  },

  // حذف طلب
  async deleteOrder(orderId) {
    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error deleting order:', error);
      return { success: false, error: error.message };
    }
  },

  // الاشتراك في التحديثات المباشرة
  subscribeToOrders(callback) {
    return supabase
      .channel('orders-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'orders' }, 
        callback
      )
      .subscribe();
  }
};

// Banner Images API functions
export const bannerAPI = {
  // جلب جميع صور البنر
  async getAllBanners(hubType = null) {
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
      console.error('Error fetching banners:', error);
      return { success: false, error: error.message };
    }
  },

  // إضافة صورة بنر جديدة
  async createBanner(bannerData) {
    try {
      const { data, error } = await supabase
        .from('banner_images')
        .insert([bannerData])
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error creating banner:', error);
      return { success: false, error: error.message };
    }
  },

  // تحديث صورة بنر
  async updateBanner(bannerId, bannerData) {
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
      console.error('Error updating banner:', error);
      return { success: false, error: error.message };
    }
  },

  // حذف صورة بنر
  async deleteBanner(bannerId) {
    try {
      const { error } = await supabase
        .from('banner_images')
        .delete()
        .eq('id', bannerId);

      if (error) throw error;
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
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching products:', error);
      return { success: false, error: error.message };
    }
  },

  // إضافة منتج جديد
  async createProduct(productData) {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error creating product:', error);
      return { success: false, error: error.message };
    }
  },

  // تحديث منتج
  async updateProduct(productId, productData) {
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
      console.error('Error updating product:', error);
      return { success: false, error: error.message };
    }
  },

  // حذف منتج
  async deleteProduct(productId) {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;
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
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error signing in:', error);
      return { success: false, error: error.message };
    }
  },

  // تسجيل خروج
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error signing out:', error);
      return { success: false, error: error.message };
    }
  },

  // جلب المستخدم الحالي
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return { success: true, user };
    } catch (error) {
      console.error('Error getting current user:', error);
      return { success: false, error: error.message };
    }
  },

  // الاشتراك في تغييرات المصادقة
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  }
};
