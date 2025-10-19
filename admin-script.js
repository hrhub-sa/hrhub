import { ordersAPI, authAPI } from './supabase-client.js';
import { bannerAPI, productsAPI } from './supabase-client.js';

// Admin credentials (بيانات تسجيل الدخول المحلية)
const ADMIN_CREDENTIALS = {
  email: 'admin@hrhub.sa',
  password: 'hrhub2025'
};

// DOM Elements
const loginScreen = document.getElementById('loginScreen');
const adminDashboard = document.getElementById('adminDashboard');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const logoutBtn = document.getElementById('logoutBtn');

// Stats elements
const totalOrdersEl = document.getElementById('totalOrders');
const pendingOrdersEl = document.getElementById('pendingOrders');
const subscribedOrdersEl = document.getElementById('subscribedOrders');
const cancelledOrdersEl = document.getElementById('cancelledOrders');

// Filter elements
const statusFilter = document.getElementById('statusFilter');
const packageFilter = document.getElementById('packageFilter');
const searchInput = document.getElementById('searchInput');
const clearFiltersBtn = document.getElementById('clearFilters');

// Table elements
const ordersTableBody = document.getElementById('ordersTableBody');
const noOrdersEl = document.getElementById('noOrders');
const exportBtn = document.getElementById('exportBtn');

// Navigation elements
const navBtns = document.querySelectorAll('.nav-btn');
const adminSections = document.querySelectorAll('.admin-section');

// Settings elements
const saveSettingsBtn = document.getElementById('saveSettingsBtn');

// Banner elements
const addBannerBtn = document.getElementById('addBannerBtn');
const bannerModal = document.getElementById('bannerModal');
const bannerForm = document.getElementById('bannerForm');
const bannersGrid = document.getElementById('bannersGrid');

// Product elements
const addProductBtn = document.getElementById('addProductBtn');
const productModal = document.getElementById('productModal');
const productForm = document.getElementById('productForm');
const productsAdminGrid = document.getElementById('productsAdminGrid');

// Modal elements
const orderModal = document.getElementById('orderModal');
const closeModalBtns = document.querySelectorAll('.close-modal');
const deleteOrderBtn = document.getElementById('deleteOrderBtn');

// Global variables
let currentOrders = [];
let filteredOrders = [];
let currentOrderId = null;
let currentBannerId = null;
let currentProductId = null;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  checkAuthStatus();
  setupEventListeners();
});

// Check if user is already logged in (محلياً)
function checkAuthStatus() {
  const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
  if (isLoggedIn) {
    showDashboard();
  } else {
    showLogin();
  }
}

// Show login screen
function showLogin() {
  loginScreen.classList.remove('hidden');
  adminDashboard.classList.add('hidden');
}

// Show dashboard
function showDashboard() {
  loginScreen.classList.add('hidden');
  adminDashboard.classList.remove('hidden');
  loadOrders();
  updateStats();
  loadBanners();
  loadProducts();
}

// Setup event listeners
function setupEventListeners() {
  // Login form
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
  
  // Logout button
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
  
  // Filters
  if (statusFilter) {
    statusFilter.addEventListener('change', applyFilters);
  }
  if (packageFilter) {
    packageFilter.addEventListener('change', applyFilters);
  }
  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }
  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', clearFilters);
  }
  
  // Export button
  if (exportBtn) {
    exportBtn.addEventListener('click', exportData);
  }
  
  // Modal close buttons
  closeModalBtns.forEach(btn => {
    btn.addEventListener('click', closeModal);
  });
  
  // Click outside modal to close
  if (orderModal) {
    orderModal.addEventListener('click', (e) => {
      if (e.target === orderModal) {
        closeModal();
      }
    });
  }
  
  // Delete order button
  if (deleteOrderBtn) {
    deleteOrderBtn.addEventListener('click', deleteOrder);
  }
  
  // Navigation
  navBtns.forEach(btn => {
    btn.addEventListener('click', () => switchSection(btn.dataset.section));
  });
  
  // Settings
  if (saveSettingsBtn) {
    saveSettingsBtn.addEventListener('click', saveSettings);
  }
  
  // Banner management
  if (addBannerBtn) {
    addBannerBtn.addEventListener('click', () => openBannerModal());
  }
  if (bannerForm) {
    bannerForm.addEventListener('submit', saveBanner);
  }
  
  // Product management
  if (addProductBtn) {
    addProductBtn.addEventListener('click', () => openProductModal());
  }
  if (productForm) {
    productForm.addEventListener('submit', saveProduct);
  }
}

// Switch between admin sections
function switchSection(sectionName) {
  // Update navigation
  navBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.section === sectionName);
  });
  
  // Update sections
  adminSections.forEach(section => {
    section.classList.toggle('active', section.id === sectionName + 'Section');
  });
  
  // Load data for the active section
  if (sectionName === 'banners') {
    loadBanners();
  } else if (sectionName === 'products') {
    loadProducts();
  } else if (sectionName === 'settings') {
    loadSettings();
  } else if (sectionName === 'orders') {
    loadOrders();
    updateStats();
  }
}

// ===== Settings Management =====

// Load settings
function loadSettings() {
  // Load saved settings from localStorage or use defaults
  const settings = JSON.parse(localStorage.getItem('siteSettings') || '{}');
  
  // Contact Information
  document.getElementById('whatsappNumber').value = settings.whatsappNumber || '+966530017278';
  document.getElementById('phoneNumber').value = settings.phoneNumber || '+966542345930';
  document.getElementById('emailAddress').value = settings.emailAddress || 'hrhub.sa@gmail.com';
  document.getElementById('address').value = settings.address || 'المدينة المنورة، السعودية';
  
  // Social Media
  document.getElementById('instagramUrl').value = settings.instagramUrl || '';
  document.getElementById('twitterUrl').value = settings.twitterUrl || '';
  document.getElementById('linkedinUrl').value = settings.linkedinUrl || '';
  document.getElementById('facebookUrl').value = settings.facebookUrl || '';
  
  // Site Content
  document.getElementById('siteTitleAr').value = settings.siteTitleAr || 'HR Hub ‒ إدارة الموارد البشرية والشؤون الحكومية';
  document.getElementById('siteTitleEn').value = settings.siteTitleEn || 'HR Hub ‒ HR & Government Affairs Solutions';
  document.getElementById('siteDescription').value = settings.siteDescription || 'شريككم المثالي في إدارة الموارد البشرية والشؤون الحكومية';
  
  // Package Pricing
  document.getElementById('economyPrice').value = settings.economyPrice || 3000;
  document.getElementById('comprehensivePrice').value = settings.comprehensivePrice || 6000;
  
  // Web Hub Settings
  document.getElementById('webHubStatus').value = settings.webHubStatus || 'coming-soon';
  document.getElementById('webHubMessage').value = settings.webHubMessage || 'نعمل حالياً على تطوير منصة Web Hub لتقديم أفضل الحلول التقنية والبرمجية';
}

// Save settings
function saveSettings() {
  const settings = {
    // Contact Information
    whatsappNumber: document.getElementById('whatsappNumber').value,
    phoneNumber: document.getElementById('phoneNumber').value,
    emailAddress: document.getElementById('emailAddress').value,
    address: document.getElementById('address').value,
    
    // Social Media
    instagramUrl: document.getElementById('instagramUrl').value,
    twitterUrl: document.getElementById('twitterUrl').value,
    linkedinUrl: document.getElementById('linkedinUrl').value,
    facebookUrl: document.getElementById('facebookUrl').value,
    
    // Site Content
    siteTitleAr: document.getElementById('siteTitleAr').value,
    siteTitleEn: document.getElementById('siteTitleEn').value,
    siteDescription: document.getElementById('siteDescription').value,
    
    // Package Pricing
    economyPrice: parseInt(document.getElementById('economyPrice').value),
    comprehensivePrice: parseInt(document.getElementById('comprehensivePrice').value),
    
    // Web Hub Settings
    webHubStatus: document.getElementById('webHubStatus').value,
    webHubMessage: document.getElementById('webHubMessage').value,
    
    // Timestamp
    lastUpdated: new Date().toISOString()
  };
  
  // Handle password change
  const newPassword = document.getElementById('newAdminPassword').value;
  const confirmPassword = document.getElementById('confirmAdminPassword').value;
  
  if (newPassword && confirmPassword) {
    if (newPassword === confirmPassword) {
      if (newPassword.length >= 6) {
        localStorage.setItem('adminPassword', newPassword);
        showNotification('تم تغيير كلمة المرور بنجاح', 'success');
        document.getElementById('newAdminPassword').value = '';
        document.getElementById('confirmAdminPassword').value = '';
      } else {
        showNotification('كلمة المرور يجب أن تكون 6 أحرف على الأقل', 'warning');
        return;
      }
    } else {
      showNotification('كلمة المرور وتأكيدها غير متطابقين', 'error');
      return;
    }
  }
  
  // Save settings
  localStorage.setItem('siteSettings', JSON.stringify(settings));
  
  // Update live site (this would normally update the database)
  updateLiveSite(settings);
  
  showNotification('تم حفظ الإعدادات بنجاح', 'success');
}

// Update live site with new settings
function updateLiveSite(settings) {
  // This function would normally send the settings to update the live website
  // For now, we'll just log the settings
  console.log('🔄 Updating live site with settings:', settings);
  
  // In a real implementation, you would:
  // 1. Send settings to your backend API
  // 2. Update the database
  // 3. Refresh the live website content
}
// ===== Banner Management =====

// Load banners
async function loadBanners() {
  try {
    const result = await bannerAPI.getAllBanners();
    
    if (result.success) {
      renderBanners(result.data);
    } else {
      console.error('Error loading banners:', result.error);
      renderBanners([]);
    }
  } catch (error) {
    console.error('Error loading banners:', error);
    renderBanners([]);
  }
}

// Render banners
function renderBanners(banners) {
  if (!bannersGrid) return;
  
  if (banners.length === 0) {
    bannersGrid.innerHTML = `
      <div class="no-data" style="text-align: center; padding: 3rem; color: #666;">
        <i class="fas fa-images" style="font-size: 3rem; margin-bottom: 1rem;"></i>
        <h3>لا توجد صور بنر</h3>
        <p>اضغط على "إضافة صورة جديدة" لإضافة أول صورة</p>
      </div>
    `;
    return;
  }
  
  bannersGrid.innerHTML = banners.map(banner => `
    <div class="banner-card">
      <img src="${banner.image_url}" alt="${banner.alt_text}" class="banner-image" 
           onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDMwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjVGNUY1Ii8+Cjx0ZXh0IHg9IjE1MCIgeT0iNzUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5OTkiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZHk9Ii4zZW0iPtmE2Kcg2YrZhdmD2YYg2KrYrdmF2YrZhCDYp9mE2LXZiNix2KU8L3RleHQ+Cjwvc3ZnPg=='">
      <div class="banner-info">
        <h3 class="banner-title">${banner.title}</h3>
        <div class="banner-meta">
          <span class="hub-type ${banner.hub_type}">
            ${banner.hub_type === 'hrhub' ? 'HR Hub' : 'Web Hub'}
          </span>
          <span>ترتيب: ${banner.display_order}</span>
        </div>
        <div class="banner-actions">
          <button class="edit-btn" onclick="editBanner('${banner.id}')">
            <i class="fas fa-edit"></i>
            تعديل
          </button>
          <button class="delete-btn" onclick="deleteBanner('${banner.id}')">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

// Open banner modal
function openBannerModal(bannerId = null) {
  if (!bannerModal) return;
  
  currentBannerId = bannerId;
  
  if (bannerId) {
    document.getElementById('bannerModalTitle').textContent = 'تعديل صورة البنر';
  } else {
    document.getElementById('bannerModalTitle').textContent = 'إضافة صورة بنر';
    if (bannerForm) bannerForm.reset();
  }
  
  bannerModal.classList.remove('hidden');
}

// Save banner
async function saveBanner(e) {
  e.preventDefault();
  
  const bannerData = {
    title: document.getElementById('bannerTitle').value,
    image_url: document.getElementById('bannerImageUrl').value,
    alt_text: document.getElementById('bannerAltText').value,
    hub_type: document.getElementById('bannerHubType').value,
    display_order: parseInt(document.getElementById('bannerOrder').value)
  };
  
  try {
    let result;
    if (currentBannerId) {
      result = await bannerAPI.updateBanner(currentBannerId, bannerData);
    } else {
      result = await bannerAPI.createBanner(bannerData);
    }
    
    if (result.success) {
      showNotification('تم حفظ صورة البنر بنجاح', 'success');
      closeBannerModal();
      loadBanners();
    } else {
      showNotification('خطأ في حفظ صورة البنر: ' + result.error, 'error');
    }
  } catch (error) {
    console.error('Error saving banner:', error);
    showNotification('خطأ في حفظ صورة البنر', 'error');
  }
}

// Close banner modal
function closeBannerModal() {
  if (bannerModal) {
    bannerModal.classList.add('hidden');
  }
  currentBannerId = null;
}

// ===== Products Management =====

// Load products
async function loadProducts() {
  try {
    const result = await productsAPI.getAllProducts();
    
    if (result.success) {
      renderProducts(result.data);
    } else {
      console.error('Error loading products:', result.error);
      renderProducts([]);
    }
  } catch (error) {
    console.error('Error loading products:', error);
    renderProducts([]);
  }
}

// Render products
function renderProducts(products) {
  if (!productsAdminGrid) return;
  
  if (products.length === 0) {
    productsAdminGrid.innerHTML = `
      <div class="no-data" style="text-align: center; padding: 3rem; color: #666;">
        <i class="fas fa-box" style="font-size: 3rem; margin-bottom: 1rem;"></i>
        <h3>لا توجد منتجات</h3>
        <p>اضغط على "إضافة منتج جديد" لإضافة أول منتج</p>
      </div>
    `;
    return;
  }
  
  productsAdminGrid.innerHTML = products.map(product => `
    <div class="product-admin-card">
      <div class="product-header">
        <div class="product-icon-display">
          <i class="${product.icon}"></i>
        </div>
        <h3 class="product-name">${product.name}</h3>
      </div>
      
      <p class="product-description">${product.description}</p>
      
      <div class="product-details-grid">
        <div class="product-detail">
          <strong>${product.price} ريال</strong>
          <span>السعر</span>
        </div>
        <div class="product-detail">
          <strong>${product.duration}</strong>
          <span>المدة</span>
        </div>
      </div>
      
      ${product.features && product.features.length > 0 ? `
        <div class="product-features-list">
          <h4>المميزات:</h4>
          <ul>
            ${product.features.map(feature => `<li>${feature}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
      
      <div class="product-actions">
        <button class="edit-btn" onclick="editProduct('${product.id}')">
          <i class="fas fa-edit"></i>
          تعديل
        </button>
        <button class="delete-btn" onclick="deleteProduct('${product.id}')">
          <i class="fas fa-trash"></i>
          حذف
        </button>
      </div>
    </div>
  `).join('');
}

// Open product modal
function openProductModal(productId = null) {
  if (!productModal) return;
  
  currentProductId = productId;
  
  if (productId) {
    document.getElementById('productModalTitle').textContent = 'تعديل المنتج';
  } else {
    document.getElementById('productModalTitle').textContent = 'إضافة منتج جديد';
    if (productForm) productForm.reset();
  }
  
  productModal.classList.remove('hidden');
}

// Save product
async function saveProduct(e) {
  e.preventDefault();
  
  console.log('🔄 Saving product...');
  
  const featuresText = document.getElementById('productFeatures').value;
  const features = featuresText ? featuresText.split('\n').filter(f => f.trim()) : [];
  
  const productData = {
    name: document.getElementById('productName').value,
    description: document.getElementById('productDescription').value,
    price: parseFloat(document.getElementById('productPrice').value),
    duration: document.getElementById('productDuration').value,
    image_url: document.getElementById('productImageUrl').value,
    icon: document.getElementById('productIcon').value,
    display_order: parseInt(document.getElementById('productOrder').value),
    features: features
  };
  
  console.log('📝 Product data:', productData);
  
  try {
    let result;
    if (currentProductId) {
      console.log('🔄 Updating existing product:', currentProductId);
      result = await productsAPI.updateProduct(currentProductId, productData);
    } else {
      console.log('🔄 Creating new product');
      result = await productsAPI.createProduct(productData);
    }
    
    if (result.success) {
      showNotification('تم حفظ المنتج بنجاح', 'success');
      closeProductModal();
      loadProducts();
    } else {
      console.error('❌ Save failed:', result.error);
      showNotification('خطأ في حفظ المنتج: ' + result.error, 'error');
    }
  } catch (error) {
    console.error('Error saving product:', error);
    showNotification('خطأ في حفظ المنتج', 'error');
  }
}

// Close product modal
function closeProductModal() {
  if (productModal) {
    productModal.classList.add('hidden');
  }
  currentProductId = null;
}

// Handle login
async function handleLogin(e) {
  e.preventDefault();
  
  const email = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  
  // استخدام المصادقة المحلية أولاً
  if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
    localStorage.setItem('adminLoggedIn', 'true');
    showDashboard();
    loginError.classList.remove('show');
    return;
  }
  
  // محاولة المصادقة عبر Supabase كخيار ثانوي
  try {
    const result = await authAPI.signInAdmin(email, password);
    if (result.success) {
      localStorage.setItem('adminLoggedIn', 'true');
      showDashboard();
      loginError.classList.remove('show');
    } else {
      throw new Error('Invalid credentials');
    }
  } catch (error) {
    loginError.textContent = 'اسم المستخدم أو كلمة المرور غير صحيحة';
    loginError.classList.add('show');
  }
}

// Handle logout
function handleLogout() {
  localStorage.removeItem('adminLoggedIn');
  showLogin();
  loginForm.reset();
  loginError.classList.remove('show');
}

// Load orders
async function loadOrders() {
  try {
    const result = await ordersAPI.getAllOrders();
    
    if (result.success) {
      currentOrders = result.data.map(order => ({
        ...order,
        date: order.created_at
      }));
      console.log('✅ Orders loaded successfully:', currentOrders.length);
    } else {
      console.error('❌ Failed to load orders:', result.error);
      currentOrders = [];
    }
  } catch (error) {
    console.error('❌ Error loading orders:', error);
    currentOrders = [];
  }
  
  filteredOrders = [...currentOrders];
  renderOrders();
}

// Update statistics
function updateStats() {
  const total = currentOrders.length;
  const pending = currentOrders.filter(order => order.status === 'pending').length;
  const subscribed = currentOrders.filter(order => order.status === 'subscribed').length;
  const cancelled = currentOrders.filter(order => order.status === 'cancelled').length;
  
  if (totalOrdersEl) totalOrdersEl.textContent = total;
  if (pendingOrdersEl) pendingOrdersEl.textContent = pending;
  if (subscribedOrdersEl) subscribedOrdersEl.textContent = subscribed;
  if (cancelledOrdersEl) cancelledOrdersEl.textContent = cancelled;
}

// Apply filters
function applyFilters() {
  const statusValue = statusFilter ? statusFilter.value : 'all';
  const packageValue = packageFilter ? packageFilter.value : 'all';
  const searchValue = searchInput ? searchInput.value.toLowerCase() : '';
  
  filteredOrders = currentOrders.filter(order => {
    const matchesStatus = statusValue === 'all' || order.status === statusValue;
    const matchesPackage = packageValue === 'all' || order.hub === packageValue;
    const matchesSearch = searchValue === '' || 
      order.name.toLowerCase().includes(searchValue) ||
      order.email.toLowerCase().includes(searchValue) ||
      order.phone.includes(searchValue);
    
    return matchesStatus && matchesPackage && matchesSearch;
  });
  
  renderOrders();
}

// Clear all filters
function clearFilters() {
  if (statusFilter) statusFilter.value = 'all';
  if (packageFilter) packageFilter.value = 'all';
  if (searchInput) searchInput.value = '';
  filteredOrders = [...currentOrders];
  renderOrders();
}

// Render orders table
function renderOrders() {
  if (!ordersTableBody) return;
  
  if (filteredOrders.length === 0) {
    ordersTableBody.innerHTML = '';
    if (noOrdersEl) noOrdersEl.classList.remove('hidden');
    return;
  }
  
  if (noOrdersEl) noOrdersEl.classList.add('hidden');
  
  ordersTableBody.innerHTML = filteredOrders.map(order => `
    <tr>
      <td>${formatDate(order.date)}</td>
      <td>${order.name}</td>
      <td>${order.email}</td>
      <td>${order.phone}</td>
      <td>
        <div class="message-preview" title="${order.message}">
          ${order.message}
        </div>
      </td>
      <td>
        <span class="hub-badge ${order.hub}">
          ${order.hub === 'hrhub' ? 'HR Hub' : 'Web Hub'}
        </span>
      </td>
      <td>
        <span class="status-badge ${order.status}">
          ${getStatusText(order.status)}
        </span>
      </td>
      <td>
        <div class="action-buttons">
          <button class="action-btn view-btn" onclick="viewOrder('${order.id}')" title="عرض التفاصيل">
            <i class="fas fa-eye"></i>
          </button>
          <button class="action-btn delete-btn" onclick="confirmDeleteOrder('${order.id}')" title="حذف">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

// Format date
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Get status text in Arabic
function getStatusText(status) {
  const statusTexts = {
    'pending': 'بانتظار الاشتراك',
    'subscribed': 'مشترك',
    'cancelled': 'تم الإلغاء',
    'not-subscribed': 'غير مشترك'
  };
  return statusTexts[status] || status;
}

// View order details
function viewOrder(orderId) {
  const order = currentOrders.find(o => o.id === orderId);
  if (!order) return;
  
  currentOrderId = orderId;
  
  // Populate modal with order details
  document.getElementById('modalDate').textContent = formatDate(order.date);
  document.getElementById('modalName').textContent = order.name;
  document.getElementById('modalEmail').textContent = order.email;
  document.getElementById('modalPhone').textContent = order.phone;
  document.getElementById('modalHub').textContent = order.hub === 'hrhub' ? 'HR Hub' : 'Web Hub';
  document.getElementById('modalMessage').textContent = order.message;
  
  const statusBadge = document.getElementById('modalStatus');
  statusBadge.textContent = getStatusText(order.status);
  statusBadge.className = `status-badge ${order.status}`;
  
  // Setup status change buttons
  const statusButtons = document.querySelectorAll('.status-btn');
  statusButtons.forEach(btn => {
    btn.onclick = () => changeOrderStatus(btn.dataset.status);
  });
  
  // Show modal
  if (orderModal) orderModal.classList.remove('hidden');
}

// Change order status
async function changeOrderStatus(newStatus) {
  if (!currentOrderId) return;
  
  try {
    const result = await ordersAPI.updateOrderStatus(currentOrderId, newStatus);
    
    if (result.success) {
      const orderIndex = currentOrders.findIndex(o => o.id === currentOrderId);
      if (orderIndex !== -1) {
        currentOrders[orderIndex].status = newStatus;
      }
    } else {
      throw new Error('Failed to update via Supabase');
    }
  } catch (error) {
    // Fallback to localStorage
    const orderIndex = currentOrders.findIndex(o => o.id === currentOrderId);
    if (orderIndex === -1) return;
    
    currentOrders[orderIndex].status = newStatus;
    localStorage.setItem('customerOrders', JSON.stringify(currentOrders));
  }
  
  // Update UI
  const statusBadge = document.getElementById('modalStatus');
  statusBadge.textContent = getStatusText(newStatus);
  statusBadge.className = `status-badge ${newStatus}`;
  
  // Refresh table and stats
  applyFilters();
  updateStats();
  
  showNotification('تم تحديث حالة الطلب بنجاح', 'success');
}

// Confirm delete order
function confirmDeleteOrder(orderId) {
  if (confirm('هل أنت متأكد من حذف هذا الطلب؟ لا يمكن التراجع عن هذا الإجراء.')) {
    deleteOrderById(orderId);
  }
}

// Delete order
function deleteOrder() {
  if (!currentOrderId) return;
  
  if (confirm('هل أنت متأكد من حذف هذا الطلب؟ لا يمكن التراجع عن هذا الإجراء.')) {
    deleteOrderById(currentOrderId);
    closeModal();
  }
}

// Delete order by ID
async function deleteOrderById(orderId) {
  try {
    const result = await ordersAPI.deleteOrder(orderId);
    
    if (result.success) {
      const orderIndex = currentOrders.findIndex(o => o.id === orderId);
      if (orderIndex !== -1) {
        currentOrders.splice(orderIndex, 1);
      }
      console.log('✅ Order deleted successfully');
    } else {
      console.error('❌ Failed to delete order:', result.error);
    }
  } catch (error) {
    console.error('❌ Error deleting order:', error);
  }
  
  // Refresh UI
  applyFilters();
  updateStats();
  
  showNotification('تم حذف الطلب بنجاح', 'success');
}

// Close modal
function closeModal() {
  if (orderModal) orderModal.classList.add('hidden');
  if (bannerModal) bannerModal.classList.add('hidden');
  if (productModal) productModal.classList.add('hidden');
  currentOrderId = null;
}

// Export data to CSV
function exportData() {
  if (filteredOrders.length === 0) {
    showNotification('لا توجد بيانات للتصدير', 'warning');
    return;
  }
  
  const headers = ['التاريخ', 'الاسم', 'الإيميل', 'الهاتف', 'الرسالة', 'الباقة', 'الحالة'];
  const csvContent = [
    headers.join(','),
    ...filteredOrders.map(order => [
      formatDate(order.date),
      order.name,
      order.email,
      order.phone,
      `"${order.message.replace(/"/g, '""')}"`,
      order.hub === 'hrhub' ? 'HR Hub' : 'Web Hub',
      getStatusText(order.status)
    ].join(','))
  ].join('\n');
  
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `hr-hub-orders-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  showNotification('تم تصدير البيانات بنجاح', 'success');
}

// Show notification
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
    <span>${message}</span>
  `;
  
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'success' ? '#4caf50' : type === 'warning' ? '#ff9800' : '#2196f3'};
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    z-index: 10000;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-family: 'Cairo', sans-serif;
    font-weight: 600;
    transform: translateX(100%);
    transition: transform 0.3s ease;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 100);
  
  setTimeout(() => {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

// Make functions globally available
window.viewOrder = viewOrder;
window.confirmDeleteOrder = confirmDeleteOrder;
window.editBanner = editBanner;
window.deleteBanner = deleteBanner;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;

// Edit banner function
async function editBanner(bannerId) {
  openBannerModal(bannerId);
}

// Delete banner function
async function deleteBanner(bannerId) {
  if (confirm('هل أنت متأكد من حذف هذه الصورة؟')) {
    try {
      const result = await bannerAPI.deleteBanner(bannerId);
      
      if (result.success) {
        showNotification('تم حذف صورة البنر بنجاح', 'success');
        loadBanners();
      } else {
        showNotification('خطأ في حذف صورة البنر: ' + result.error, 'error');
      }
    } catch (error) {
      console.error('Error deleting banner:', error);
      showNotification('خطأ في حذف صورة البنر', 'error');
    }
  }
}

// Edit product function
async function editProduct(productId) {
  openProductModal(productId);
}

// Delete product function
async function deleteProduct(productId) {
  if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
    try {
      const result = await productsAPI.deleteProduct(productId);
      
      if (result.success) {
        showNotification('تم حذف المنتج بنجاح', 'success');
        loadProducts();
      } else {
        showNotification('خطأ في حذف المنتج: ' + result.error, 'error');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      showNotification('خطأ في حذف المنتج', 'error');
    }
  }
}
