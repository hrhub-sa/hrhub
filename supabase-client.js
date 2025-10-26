// Supabase Client Configuration
import { createClient } from 'https://cdn.skypack.dev/@supabase/supabase-js@2';

// Supabase configuration
const supabaseUrl = 'https://wufvlgmlxqdgqqsnsgxa.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZnZsZ21seHFkZ3Fxc25zZ3hhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4OTU0ODcsImV4cCI6MjA3NjQ3MTQ4N30.GtP6FafY8D3u9UBx9BcToBc9oeaV8ilOp-P6jI_Fb8s';

// Create Supabase client
let supabase = null;
let isSupabaseConnected = false;

// Initialize Supabase connection
try {
  if (supabaseUrl && supabaseAnonKey) {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    isSupabaseConnected = true;
    console.log('✅ Supabase connected successfully');
  } else {
    console.warn('⚠️ Supabase configuration missing');
    isSupabaseConnected = false;
  }
} catch (error) {
  console.error('❌ Supabase connection failed:', error);
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
  // Create new order
  async createOrder(orderData) {
    if (isSupabaseAvailable()) {
      try {
        console.log('🔄 Creating order:', orderData);
        const { data, error } = await supabase
          .from('orders')
          .insert([orderData])
          .select()
          .single();
        
        if (error) throw error;
        console.log('✅ Order created successfully:', data.id);
        return { success: true, data };
      } catch (error) {
        console.error('❌ Error creating order:', error.message || error);
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
    
    console.warn('⚠️ Using fallback for order creation');
    return { success: true, data: newOrder };
  },

  // Get all orders
  async getAllOrders() {
    if (isSupabaseAvailable()) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        console.log('✅ Orders loaded:', data?.length || 0);
        return { success: true, data: data || [] };
      } catch (error) {
        console.error('❌ Error loading orders:', error);
        return { success: false, error: error.message };
      }
    }
    
    console.warn('⚠️ Using fallback - no orders available');
    return { success: true, data: [] };
  },

  // Update order status
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
        console.log('✅ Order status updated:', orderId);
        return { success: true, data };
      } catch (error) {
        console.error('❌ Error updating order status:', error);
        return { success: false, error: error.message };
      }
    }
    
    console.warn('⚠️ Using fallback for status update');
    return { success: true, data: { id: orderId, status: newStatus } };
  },

  // Delete order
  async deleteOrder(orderId) {
    if (isSupabaseAvailable()) {
      try {
        const { error } = await supabase
          .from('orders')
          .delete()
          .eq('id', orderId);
        
        if (error) throw error;
        console.log('✅ Order deleted:', orderId);
        return { success: true };
      } catch (error) {
        console.error('❌ Error deleting order:', error);
        return { success: false, error: error.message };
      }
    }
    
    console.warn('⚠️ Using fallback for order deletion');
    return { success: true };
  }
};

// Banner Images API functions
export const bannerAPI = {
  // جلب جميع صور البنر
  async getAllBanners(hubType = null, includeHidden = false) {
    if (isSupabaseAvailable()) {
      try {
        let query = supabase
          .from('banner_images')
          .select('*')
          .order('display_order', { ascending: true });
        
        // إذا لم نطلب المخفية، فلتر فقط الظاهرة
        if (!includeHidden) {
          query = query.eq('is_active', true);
        }
        
        if (hubType) {
          query = query.eq('hub_type', hubType);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        console.log(`✅ Banners fetched from Supabase: ${data?.length || 0} ${includeHidden ? '(including hidden)' : '(visible only)'}`);
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
        console.log('🔄 Creating banner:', bannerData);
        const { data, error } = await supabase
          .from('banner_images')
          .insert([bannerData])
          .select()
          .single();
        
        if (error) throw error;
        console.log('✅ Banner created in Supabase:', data);
        return { success: true, data };
      } catch (error) {
        console.error('❌ Error creating banner in Supabase:', error.message || error);
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
        console.log('🔄 Updating banner in Supabase:', bannerId, bannerData);
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

// Site Settings API functions
export const settingsAPI = {
  // جلب جميع الإعدادات
  async getAllSettings() {
    if (isSupabaseAvailable()) {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('*')
          .eq('is_active', true);
        
        if (error) throw error;
        console.log('✅ Settings fetched from Supabase:', data?.length || 0);
        return { success: true, data: data || [] };
      } catch (error) {
        console.error('❌ Error fetching settings from Supabase:', error);
        return { success: false, error: error.message };
      }
    }
    
    console.warn('⚠️ Using fallback - no settings available');
    return { success: true, data: [] };
  },

  // تحديث إعداد معين
  async updateSetting(settingKey, settingValue) {
    if (isSupabaseAvailable()) {
      try {
        console.log(`🔄 Updating setting ${settingKey} in Supabase:`, settingValue);
        
        // أولاً، تحقق من وجود الإعداد
        const { data: existingData, error: checkError } = await supabase
          .from('site_settings')
          .select('*')
          .eq('setting_key', settingKey)
          .single();
        
        let result;
        if (existingData) {
          // تحديث الإعداد الموجود
          const { data, error } = await supabase
            .from('site_settings')
            .update({ 
              setting_value: settingValue, 
              updated_at: getCurrentTimestamp() 
            })
            .eq('setting_key', settingKey)
            .select()
            .single();
          result = { data, error };
        } else {
          // إنشاء إعداد جديد
          const { data, error } = await supabase
            .from('site_settings')
            .insert([{ 
              setting_key: settingKey, 
              setting_value: settingValue,
              is_active: true
            }])
            .select()
            .single();
          result = { data, error };
        }
        
        if (result.error) throw result.error;
        console.log(`✅ Setting ${settingKey} saved successfully:`, result.data);
        return { success: true, data: result.data };
      } catch (error) {
        console.error(`❌ Error saving setting ${settingKey}:`, error);
        return { success: false, error: error.message };
      }
    }
    
    console.warn(`⚠️ Using fallback for setting ${settingKey}`);
    return { success: true, data: { setting_key: settingKey, setting_value: settingValue } };
  },

  // إضافة أو تحديث إعداد
  async upsertSetting(settingKey, settingValue) {
    if (isSupabaseAvailable()) {
      try {
        console.log(`🔄 Upserting setting ${settingKey}:`, settingValue);
        const { data, error } = await supabase
          .from('site_settings')
          .upsert({ 
            setting_key: settingKey,
            setting_value: settingValue,
            is_active: true,
            updated_at: getCurrentTimestamp()
          }, { 
            onConflict: 'setting_key' 
          })
          .select()
          .single();
        
        if (error) throw error;
        console.log(`✅ Setting ${settingKey} upserted successfully:`, data);
        return { success: true, data };
      } catch (error) {
        console.error(`❌ Error upserting setting ${settingKey}:`, error);
        return { success: false, error: error.message };
      }
    }
    
    console.warn(`⚠️ Using fallback for setting ${settingKey}`);
    return { success: true, data: { setting_key: settingKey, setting_value: settingValue } };
  },

  // إضافة إعداد جديد
  async createSetting(settingKey, settingValue) {
    if (isSupabaseAvailable()) {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .insert([{ setting_key: settingKey, setting_value: settingValue }])
          .select()
          .single();
        
        if (error) throw error;
        console.log('✅ Setting created in Supabase:', settingKey);
        return { success: true, data };
      } catch (error) {
        console.error('❌ Error creating setting in Supabase:', error);
        return { success: false, error: error.message };
      }
    }
    
    console.warn('⚠️ Using fallback for setting creation');
    return { success: true, data: { setting_key: settingKey, setting_value: settingValue } };
  }
};

// Products API functions
export const productsAPI = {
  // جلب جميع المنتجات
  async getAllProducts(includeHidden = false) {
    if (isSupabaseAvailable()) {
      try {
        let query = supabase
          .from('products')
          .select('*')
          .order('display_order', { ascending: true });
        
        // إذا لم نطلب المخفية، فلتر فقط الظاهرة
        if (!includeHidden) {
          query = query.eq('is_active', true);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        console.log(`✅ Products fetched from Supabase: ${data?.length || 0} ${includeHidden ? '(including hidden)' : '(visible only)'}`);
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
        console.log('🔄 Creating product:', productData);
        const { data, error } = await supabase
          .from('products')
          .insert([productData])
          .select()
          .single();
        
        if (error) throw error;
        console.log('✅ Product created in Supabase:', data);
        return { success: true, data };
      } catch (error) {
        console.error('❌ Error creating product in Supabase:', error.message || error);
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
        console.log('🔄 Updating product in Supabase:', productId, productData);
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
  // تسجيل دخول المدير من قاعدة البيانات
  async signInAdmin(email, password) {
    if (isSupabaseAvailable()) {
      try {
        console.log('🔐 Authenticating admin via database...');
        
        // استدعاء دالة المصادقة من قاعدة البيانات
        const { data, error } = await supabase.rpc('authenticate_admin', {
          user_email: email,
          user_password: password
        });
        
        if (error) throw error;
        
        if (data && data.success) {
          console.log('✅ Database authentication successful');
          return { success: true, data: data.user };
        } else {
          console.log('❌ Database authentication failed:', data?.error);
          return { success: false, error: data?.error || 'Authentication failed' };
        }
      } catch (error) {
        console.error('❌ Database authentication error:', error);
        return { success: false, error: error.message };
      }
    }
    
    console.log('❌ Database not available');
    return { success: false, error: 'Authentication service unavailable' };
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
