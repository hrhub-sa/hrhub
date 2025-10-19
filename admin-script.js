import { ordersAPI, authAPI } from './supabase-client.js';

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

// Modal elements
const orderModal = document.getElementById('orderModal');
const closeModalBtns = document.querySelectorAll('.close-modal');
const deleteOrderBtn = document.getElementById('deleteOrderBtn');

// Global variables
let currentOrders = [];
let filteredOrders = [];
let currentOrderId = null;
let ordersSubscription = null;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  checkAuthStatus();
  setupEventListeners();
  setupRealtimeSubscription();
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
function confirmDeleteOrder(orderId) {
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
  await updateStats();
  
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
