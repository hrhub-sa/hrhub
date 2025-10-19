import { ordersAPI, authAPI } from './supabase-client.js';
import { bannerAPI, productsAPI } from './supabase-client.js';

// Admin credentials (في التطبيق الحقيقي، يجب تشفير هذه البيانات)
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
let ordersSubscription = null;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  checkAuthStatus();
  setupEventListeners();
  setupRealtimeSubscription();
  loadBanners();
  loadProducts();
});

// Check if user is already logged in
async function checkAuthStatus() {
  const { user } = await authAPI.getCurrentUser();
  if (user) {
    await showDashboard();
  } else {
    await showLogin();
  }
}

// Show login screen
async function showLogin() {
  loginScreen.classList.remove('hidden');
  adminDashboard.classList.add('hidden');
}

// Show dashboard
async function showDashboard() {
  loginScreen.classList.add('hidden');
  adminDashboard.classList.remove('hidden');
  await loadOrders();
  await updateStats();
}

// Setup event listeners
function setupEventListeners() {
  // Login form
  loginForm.addEventListener('submit', handleLogin);
  
  // Logout button
  logoutBtn.addEventListener('click', handleLogout);
  
  // Filters
  statusFilter.addEventListener('change', applyFilters);
  packageFilter.addEventListener('change', applyFilters);
  searchInput.addEventListener('input', applyFilters);
  clearFiltersBtn.addEventListener('click', clearFilters);
  
  // Export button
  exportBtn.addEventListener('click', exportData);
  
  // Modal close buttons
  closeModalBtns.forEach(btn => {
    btn.addEventListener('click', closeModal);
  });
  
  // Click outside modal to close
  orderModal.addEventListener('click', (e) => {
    if (e.target === orderModal) {
      closeModal();
    }
  });
  
  // Delete order button
  deleteOrderBtn.addEventListener('click', deleteOrder);
  
  // Navigation
  navBtns.forEach(btn => {
    btn.addEventListener('click', () => switchSection(btn.dataset.section));
  });
  
  // Banner management
  addBannerBtn.addEventListener('click', () => openBannerModal());
  bannerForm.addEventListener('submit', saveBanner);
  
  // Product management
  addProductBtn.addEventListener('click', () => openProductModal());
  productForm.addEventListener('submit', saveProduct);
}

// Setup realtime subscription
function setupRealtimeSubscription() {
  ordersSubscription = ordersAPI.subscribeToOrders((payload) => {
    console.log('Realtime update:', payload);
    // Reload orders when there's a change
    loadOrders();
    updateStats();
  });
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
  }
}

// ===== Banner Management =====

// Load banners
async function loadBanners() {
  const result = await bannerAPI.getAllBanners();
  
  if (result.success) {
    renderBanners(result.data);
  } else {
    console.error('Error loading banners:', result.error);
    showNotification('خطأ في تحميل صور البنر', 'error');
  }
}

// Render banners
function renderBanners(banners) {
  if (banners.length === 0) {
    bannersGrid.innerHTML = `
      <div class="no-data">
        <i class="fas fa-images"></i>
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
  currentBannerId = bannerId;
  
  if (bannerId) {
    // Edit mode
    document.getElementById('bannerModalTitle').textContent = 'تعديل صورة البنر';
    // Load banner data (you'll need to implement this)
  } else {
    // Add mode
    document.getElementById('bannerModalTitle').textContent = 'إضافة صورة بنر';
    bannerForm.reset();
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
}

// Edit banner
async function editBanner(bannerId) {
  // You'll need to implement getting banner by ID
  openBannerModal(bannerId);
}

// Delete banner
async function deleteBanner(bannerId) {
  if (confirm('هل أنت متأكد من حذف هذه الصورة؟')) {
    const result = await bannerAPI.deleteBanner(bannerId);
    
    if (result.success) {
      showNotification('تم حذف صورة البنر بنجاح', 'success');
      loadBanners();
    } else {
      showNotification('خطأ في حذف صورة البنر: ' + result.error, 'error');
    }
  }
}

// Close banner modal
function closeBannerModal() {
  bannerModal.classList.add('hidden');
  currentBannerId = null;
}

// ===== Products Management =====

// Load products
async function loadProducts() {
  const result = await productsAPI.getAllProducts();
  
  if (result.success) {
    renderProducts(result.data);
  } else {
    console.error('Error loading products:', result.error);
    showNotification('خطأ في تحميل المنتجات', 'error');
  }
}

// Render products
function renderProducts(products) {
  if (products.length === 0) {
    productsAdminGrid.innerHTML = `
      <div class="no-data">
        <i class="fas fa-box"></i>
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
  currentProductId = productId;
  
  if (productId) {
    // Edit mode
    document.getElementById('productModalTitle').textContent = 'تعديل المنتج';
    // Load product data (you'll need to implement this)
  } else {
    // Add mode
    document.getElementById('productModalTitle').textContent = 'إضافة منتج جديد';
    productForm.reset();
  }
  
  productModal.classList.remove('hidden');
}

// Save product
async function saveProduct(e) {
  e.preventDefault();
  
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
  
  let result;
  if (currentProductId) {
    result = await productsAPI.updateProduct(currentProductId, productData);
  } else {
    result = await productsAPI.createProduct(productData);
  }
  
  if (result.success) {
    showNotification('تم حفظ المنتج بنجاح', 'success');
    closeProductModal();
    loadProducts();
    // Update the main website products
    updateWebsiteProducts();
  } else {
    showNotification('خطأ في حفظ المنتج: ' + result.error, 'error');
  }
}

// Edit product
async function editProduct(productId) {
  // You'll need to implement getting product by ID
  openProductModal(productId);
}

// Delete product
async function deleteProduct(productId) {
  if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
    const result = await productsAPI.deleteProduct(productId);
    
    if (result.success) {
      showNotification('تم حذف المنتج بنجاح', 'success');
      loadProducts();
      updateWebsiteProducts();
    } else {
      showNotification('خطأ في حذف المنتج: ' + result.error, 'error');
    }
  }
}

// Close product modal
function closeProductModal() {
  productModal.classList.add('hidden');
  currentProductId = null;
}

// Update website products (this would typically trigger a rebuild)
function updateWebsiteProducts() {
  // In a real application, you might want to trigger a rebuild
  // or update the products in real-time
  console.log('Products updated - website should refresh products');
}

// Handle login
async function handleLogin(e) {
  e.preventDefault();
  
  const email = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  
  // Try Supabase authentication first
  const result = await authAPI.signInAdmin(email, password);
  
  if (result.success) {
    await showDashboard();
    loginError.classList.remove('show');
  } else if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
    // Fallback to local authentication
    localStorage.setItem('adminLoggedIn', 'true');
    await showDashboard();
    loginError.classList.remove('show');
  } else {
    loginError.textContent = 'اسم المستخدم أو كلمة المرور غير صحيحة';
    loginError.classList.add('show');
  }
}

// Handle logout
async function handleLogout() {
  await authAPI.signOut();
  localStorage.removeItem('adminLoggedIn');
  await showLogin();
  // Clear form
  loginForm.reset();
  loginError.classList.remove('show');
  if (ordersSubscription) ordersSubscription.unsubscribe();
}

// Load orders from localStorage
async function loadOrders() {
  // Try to load from Supabase first
  const result = await ordersAPI.getAllOrders();
  
  if (result.success) {
    currentOrders = result.data.map(order => ({
      ...order,
      date: order.created_at // Map created_at to date for compatibility
    }));
  } else {
    // Fallback to localStorage
    const orders = localStorage.getItem('customerOrders');
    currentOrders = orders ? JSON.parse(orders) : [];
  }
  
  filteredOrders = [...currentOrders];
  renderOrders();
}

// Update statistics
async function updateStats() {
  const total = currentOrders.length;
  const pending = currentOrders.filter(order => order.status === 'pending').length;
  const subscribed = currentOrders.filter(order => order.status === 'subscribed').length;
  const cancelled = currentOrders.filter(order => order.status === 'cancelled').length;
  
  totalOrdersEl.textContent = total;
  pendingOrdersEl.textContent = pending;
  subscribedOrdersEl.textContent = subscribed;
  cancelledOrdersEl.textContent = cancelled;
}

// Apply filters
function applyFilters() {
  const statusValue = statusFilter.value;
  const packageValue = packageFilter.value;
  const searchValue = searchInput.value.toLowerCase();
  
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
  statusFilter.value = 'all';
  packageFilter.value = 'all';
  searchInput.value = '';
  filteredOrders = [...currentOrders];
  renderOrders();
}

// Render orders table
function renderOrders() {
  if (filteredOrders.length === 0) {
    ordersTableBody.innerHTML = '';
    noOrdersEl.classList.remove('hidden');
    return;
  }
  
  noOrdersEl.classList.add('hidden');
  
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
    btn.addEventListener('click', () => changeOrderStatus(btn.dataset.status));
  });
  
  // Show modal
  orderModal.classList.remove('hidden');
}

// Change order status
async function changeOrderStatus(newStatus) {
  if (!currentOrderId) return;
  
  // Try to update in Supabase first
  const result = await ordersAPI.updateOrderStatus(currentOrderId, newStatus);
  
  if (result.success) {
    // Update local data
    const orderIndex = currentOrders.findIndex(o => o.id === currentOrderId);
    if (orderIndex !== -1) {
      currentOrders[orderIndex].status = newStatus;
    }
  } else {
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
  await updateStats();
  
  // Show success message
  showNotification('تم تحديث حالة الطلب بنجاح', 'success');
}

// Confirm delete order
async function confirmDeleteOrder(orderId) {
  if (confirm('هل أنت متأكد من حذف هذا الطلب؟ لا يمكن التراجع عن هذا الإجراء.')) {
    await deleteOrderById(orderId);
  }
}

// Delete order
async function deleteOrder() {
  if (!currentOrderId) return;
  
  if (confirm('هل أنت متأكد من حذف هذا الطلب؟ لا يمكن التراجع عن هذا الإجراء.')) {
    await deleteOrderById(currentOrderId);
    closeModal();
  }
}

// Delete order by ID
async function deleteOrderById(orderId) {
  // Try to delete from Supabase first
  const result = await ordersAPI.deleteOrder(orderId);
  
  if (result.success) {
    // Remove from local data
    const orderIndex = currentOrders.findIndex(o => o.id === orderId);
    if (orderIndex !== -1) {
      currentOrders.splice(orderIndex, 1);
    }
  } else {
    // Fallback to localStorage
    const orderIndex = currentOrders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) return;
    
    currentOrders.splice(orderIndex, 1);
    localStorage.setItem('customerOrders', JSON.stringify(currentOrders));
  }
  
  // Refresh UI
  applyFilters();
  updateStats();
  
  showNotification('تم حذف الطلب بنجاح', 'success');
}

// Close modal
function closeModal() {
  orderModal.classList.add('hidden');
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
      `"${order.message.replace(/"/g, '""')}"`, // Escape quotes in message
      order.hub === 'hrhub' ? 'HR Hub' : 'Web Hub',
      getStatusText(order.status)
    ].join(','))
  ].join('\n');
  
  // Create and download file
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
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
    <span>${message}</span>
  `;
  
  // Add styles
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
  
  // Animate in
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 100);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      document.body.removeChild(notification);
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
window.editBanner = editBanner;
window.deleteBanner = deleteBanner;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;  
