import { supabase, supabaseUrl, supabaseAnonKey } from './supabase-client.js';

let currentUser = null;
let allOrders = [];
let filteredOrders = [];
let currentEditingProduct = null;
let currentHub = null;

const loginForm = document.getElementById('loginForm');
const loginScreen = document.getElementById('loginScreen');
const adminDashboard = document.getElementById('adminDashboard');
const loginError = document.getElementById('loginError');
const logoutBtn = document.getElementById('logoutBtn');
const navBtns = document.querySelectorAll('.nav-btn');
const adminSections = document.querySelectorAll('.admin-section');

function checkSession() {
  const sessionData = localStorage.getItem('adminSession');
  if (sessionData) {
    try {
      const session = JSON.parse(sessionData);
      const expiresAt = new Date(session.expiresAt);

      if (expiresAt > new Date()) {
        currentUser = session.user;
        showDashboard();
        return true;
      } else {
        localStorage.removeItem('adminSession');
      }
    } catch (e) {
      localStorage.removeItem('adminSession');
    }
  }
  return false;
}

checkSession();

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  loginError.style.display = 'none';

  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/admin-auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`
      },
      body: JSON.stringify({ email, password })
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'فشل تسجيل الدخول');
    }

    currentUser = result.session.user;
    localStorage.setItem('adminSession', JSON.stringify(result.session));

    showDashboard();
  } catch (error) {
    loginError.textContent = error.message;
    loginError.style.display = 'block';
  }
});

logoutBtn?.addEventListener('click', () => {
  localStorage.removeItem('adminSession');
  currentUser = null;
  loginScreen.classList.remove('hidden');
  adminDashboard.classList.add('hidden');
  loginForm.reset();
  loginError.style.display = 'none';
});

async function showDashboard() {
  loginScreen.classList.add('hidden');
  adminDashboard.classList.remove('hidden');
  document.getElementById('welcomeText').textContent = `مرحباً، ${currentUser.full_name}`;
  loadOrders();
  updateStats();
}

navBtns.forEach(btn => {
  btn.addEventListener('click', () => switchSection(btn.dataset.section));
});

function switchSection(sectionName) {
  navBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.section === sectionName);
  });

  adminSections.forEach(section => {
    section.classList.toggle('active', section.id === sectionName + 'Section' || section.id === sectionName.replace('-', '') + 'Section');
  });

  if (sectionName === 'orders') {
    loadOrders();
    updateStats();
  } else if (sectionName === 'hr-products') {
    loadProducts('hrhub');
  } else if (sectionName === 'web-products') {
    loadProducts('webhub');
  } else if (sectionName === 'homepage') {
    loadHomepageSettings();
  }
}

async function loadOrders() {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    allOrders = data || [];
    filteredOrders = [...allOrders];
    renderOrders();
  } catch (error) {
    console.error('Error loading orders:', error);
    showNotification('خطأ في تحميل الطلبات', 'error');
  }
}

async function updateStats() {
  try {
    const total = allOrders.length;
    const pending = allOrders.filter(o => o.status === 'pending').length;
    const subscribed = allOrders.filter(o => o.status === 'subscribed').length;
    const cancelled = allOrders.filter(o => o.status === 'cancelled').length;

    document.getElementById('totalOrders').textContent = total;
    document.getElementById('pendingOrders').textContent = pending;
    document.getElementById('subscribedOrders').textContent = subscribed;
    document.getElementById('cancelledOrders').textContent = cancelled;
  } catch (error) {
    console.error('Error updating stats:', error);
  }
}

function renderOrders() {
  const tbody = document.getElementById('ordersTableBody');
  const noOrders = document.getElementById('noOrders');

  if (filteredOrders.length === 0) {
    tbody.innerHTML = '';
    noOrders.style.display = 'block';
    return;
  }

  noOrders.style.display = 'none';
  tbody.innerHTML = filteredOrders.map(order => {
    const date = new Date(order.created_at).toLocaleDateString('ar-SA');
    const statusClass = order.status;
    const statusText = {
      'pending': 'بانتظار الاشتراك',
      'subscribed': 'مشترك',
      'cancelled': 'تم الإلغاء',
      'not-subscribed': 'غير مشترك'
    }[order.status];
    const hubText = order.hub === 'hrhub' ? 'HR Hub' : 'Web Hub';

    return `
      <tr>
        <td>${date}</td>
        <td>${order.name}</td>
        <td>${order.email}</td>
        <td>${order.phone}</td>
        <td>${order.message || '-'}</td>
        <td><span class="hub-badge ${order.hub}">${hubText}</span></td>
        <td><span class="status-badge ${statusClass}">${statusText}</span></td>
        <td>
          <button class="action-btn view-btn" onclick="viewOrder('${order.id}')">
            <i class="fas fa-eye"></i>
          </button>
          <button class="action-btn delete-btn" onclick="deleteOrder('${order.id}')">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

window.viewOrder = async function(orderId) {
  try {
    const order = allOrders.find(o => o.id === orderId);
    if (!order) return;

    const statusOptions = ['pending', 'subscribed', 'cancelled', 'not-subscribed'];
    const statusText = {
      'pending': 'بانتظار الاشتراك',
      'subscribed': 'مشترك',
      'cancelled': 'تم الإلغاء',
      'not-subscribed': 'غير مشترك'
    };

    const detailsHtml = `
      <div class="order-details-content">
        <div class="detail-row">
          <strong>الاسم:</strong>
          <span>${order.name}</span>
        </div>
        <div class="detail-row">
          <strong>الإيميل:</strong>
          <span>${order.email}</span>
        </div>
        <div class="detail-row">
          <strong>الهاتف:</strong>
          <span>${order.phone}</span>
        </div>
        <div class="detail-row">
          <strong>الباقة:</strong>
          <span>${order.hub === 'hrhub' ? 'HR Hub' : 'Web Hub'}</span>
        </div>
        <div class="detail-row">
          <strong>الرسالة:</strong>
          <span>${order.message || '-'}</span>
        </div>
        <div class="detail-row">
          <strong>التاريخ:</strong>
          <span>${new Date(order.created_at).toLocaleString('ar-SA')}</span>
        </div>
        <div class="detail-row">
          <strong>تغيير الحالة:</strong>
          <select id="orderStatus" class="status-select">
            ${statusOptions.map(status => `
              <option value="${status}" ${order.status === status ? 'selected' : ''}>
                ${statusText[status]}
              </option>
            `).join('')}
          </select>
        </div>
        <button onclick="updateOrderStatus('${order.id}')" class="save-btn">
          <i class="fas fa-save"></i>
          حفظ التغييرات
        </button>
      </div>
    `;

    document.getElementById('orderDetails').innerHTML = detailsHtml;
    showModal('orderModal');
  } catch (error) {
    console.error('Error viewing order:', error);
    showNotification('خطأ في عرض الطلب', 'error');
  }
};

window.updateOrderStatus = async function(orderId) {
  try {
    const newStatus = document.getElementById('orderStatus').value;

    const { error } = await supabase
      .from('orders')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    if (error) throw error;

    showNotification('تم تحديث حالة الطلب بنجاح', 'success');
    hideModal('orderModal');
    loadOrders();
    updateStats();
  } catch (error) {
    console.error('Error updating order status:', error);
    showNotification('خطأ في تحديث الطلب', 'error');
  }
};

window.deleteOrder = async function(orderId) {
  if (!confirm('هل أنت متأكد من حذف هذا الطلب؟')) return;

  try {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId);

    if (error) throw error;

    showNotification('تم حذف الطلب بنجاح', 'success');
    loadOrders();
    updateStats();
  } catch (error) {
    console.error('Error deleting order:', error);
    showNotification('خطأ في حذف الطلب', 'error');
  }
};

document.getElementById('statusFilter')?.addEventListener('change', applyFilters);
document.getElementById('packageFilter')?.addEventListener('change', applyFilters);
document.getElementById('searchInput')?.addEventListener('input', applyFilters);
document.getElementById('clearFilters')?.addEventListener('click', () => {
  document.getElementById('statusFilter').value = 'all';
  document.getElementById('packageFilter').value = 'all';
  document.getElementById('searchInput').value = '';
  applyFilters();
});

function applyFilters() {
  const statusFilter = document.getElementById('statusFilter').value;
  const packageFilter = document.getElementById('packageFilter').value;
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();

  filteredOrders = allOrders.filter(order => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesPackage = packageFilter === 'all' || order.hub === packageFilter;
    const matchesSearch = !searchTerm ||
      order.name.toLowerCase().includes(searchTerm) ||
      order.email.toLowerCase().includes(searchTerm) ||
      order.phone.includes(searchTerm);

    return matchesStatus && matchesPackage && matchesSearch;
  });

  renderOrders();
}

document.getElementById('exportBtn')?.addEventListener('click', () => {
  if (filteredOrders.length === 0) {
    showNotification('لا توجد بيانات للتصدير', 'error');
    return;
  }

  const csv = [
    ['التاريخ', 'الاسم', 'الإيميل', 'الهاتف', 'الرسالة', 'الباقة', 'الحالة'],
    ...filteredOrders.map(order => [
      new Date(order.created_at).toLocaleDateString('ar-SA'),
      order.name,
      order.email,
      order.phone,
      order.message || '-',
      order.hub === 'hrhub' ? 'HR Hub' : 'Web Hub',
      order.status
    ])
  ].map(row => row.join(',')).join('\n');

  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `orders_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
});

async function loadProducts(hub) {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('hub_type', hub)
      .order('display_order', { ascending: true });

    if (error) throw error;

    const products = data || [];
    const gridId = hub === 'hrhub' ? 'hrProductsGrid' : 'webProductsGrid';
    const noDataId = hub === 'hrhub' ? 'noHrProducts' : 'noWebProducts';
    const grid = document.getElementById(gridId);
    const noData = document.getElementById(noDataId);

    if (products.length === 0) {
      grid.style.display = 'none';
      noData.style.display = 'block';
    } else {
      grid.style.display = 'grid';
      noData.style.display = 'none';
      renderProducts(products, hub);
    }
  } catch (error) {
    console.error('Error loading products:', error);
    showNotification('خطأ في تحميل المنتجات', 'error');
  }
}

function renderProducts(products, hub) {
  const gridId = hub === 'hrhub' ? 'hrProductsGrid' : 'webProductsGrid';
  const grid = document.getElementById(gridId);

  grid.innerHTML = products.map(product => {
    const hasDiscount = product.price_before && product.price_before > product.price;

    return `
      <div class="product-card ${!product.is_active ? 'inactive' : ''}">
        <div class="product-header">
          <div class="product-icon">
            <i class="${product.icon}"></i>
          </div>
          <h3>${product.name_ar}</h3>
          ${!product.is_active ? '<span class="inactive-badge">غير نشط</span>' : ''}
        </div>

        <p class="product-description">${product.description_ar}</p>

        <div class="product-features">
          ${(product.features_ar || []).map(feature => `
            <div class="feature-item">
              <i class="fas fa-check"></i>
              <span>${feature}</span>
            </div>
          `).join('')}
        </div>

        <div class="product-price">
          ${hasDiscount ? `<span class="price-before">${product.price_before} ريال</span>` : ''}
          <span class="price-current">${product.price} ريال</span>
        </div>

        <div class="product-duration">
          <i class="fas fa-clock"></i>
          ${product.duration_ar}
        </div>

        <div class="product-actions">
          <button class="edit-btn" onclick="editProduct('${product.id}', '${hub}')">
            <i class="fas fa-edit"></i>
            تعديل
          </button>
          <button class="delete-btn" onclick="deleteProduct('${product.id}', '${hub}')">
            <i class="fas fa-trash"></i>
            حذف
          </button>
        </div>
      </div>
    `;
  }).join('');
}

document.getElementById('addHrProductBtn')?.addEventListener('click', () => {
  openProductModal(null, 'hrhub');
});

document.getElementById('addWebProductBtn')?.addEventListener('click', () => {
  openProductModal(null, 'webhub');
});

function openProductModal(productId, hub) {
  currentEditingProduct = productId;
  currentHub = hub;

  const title = hub === 'hrhub' ? 'منتجات إدارة الأعمال' : 'منتجات تطوير الأعمال';
  document.getElementById('productModalTitle').textContent =
    productId ? `تعديل منتج - ${title}` : `إضافة منتج - ${title}`;

  document.getElementById('productHub').value = hub;

  if (productId) {
    loadProductForEdit(productId);
  } else {
    document.getElementById('productForm').reset();
    document.getElementById('productHub').value = hub;
    document.getElementById('productIsActive').checked = true;
    resetFeatureInputs();
  }

  showModal('productModal');
}

async function loadProductForEdit(productId) {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return;

    document.getElementById('productNameAr').value = data.name_ar;
    document.getElementById('productNameEn').value = data.name_en;
    document.getElementById('productDescriptionAr').value = data.description_ar;
    document.getElementById('productDescriptionEn').value = data.description_en;
    document.getElementById('productDurationAr').value = data.duration_ar;
    document.getElementById('productDurationEn').value = data.duration_en;
    document.getElementById('productPriceBefore').value = data.price_before || '';
    document.getElementById('productPrice').value = data.price;
    document.getElementById('productImageUrl').value = data.image_url || '';
    document.getElementById('productIcon').value = data.icon;
    document.getElementById('productOrder').value = data.display_order;
    document.getElementById('productIsActive').checked = data.is_active;

    populateFeatures(data.features_ar || [], data.features_en || []);
  } catch (error) {
    console.error('Error loading product:', error);
    showNotification('خطأ في تحميل المنتج', 'error');
  }
}

function resetFeatureInputs() {
  const arContainer = document.getElementById('featuresArContainer');
  const enContainer = document.getElementById('featuresEnContainer');

  arContainer.innerHTML = `
    <div class="feature-input-group">
      <input type="text" class="feature-ar-input" placeholder="أدخل ميزة">
      <button type="button" class="remove-feature-btn" onclick="this.parentElement.remove()">
        <i class="fas fa-times"></i>
      </button>
    </div>
  `;

  enContainer.innerHTML = `
    <div class="feature-input-group">
      <input type="text" class="feature-en-input" placeholder="Enter feature">
      <button type="button" class="remove-feature-btn" onclick="this.parentElement.remove()">
        <i class="fas fa-times"></i>
      </button>
    </div>
  `;
}

function populateFeatures(featuresAr, featuresEn) {
  const arContainer = document.getElementById('featuresArContainer');
  const enContainer = document.getElementById('featuresEnContainer');

  arContainer.innerHTML = featuresAr.map(feature => `
    <div class="feature-input-group">
      <input type="text" class="feature-ar-input" placeholder="أدخل ميزة" value="${feature}">
      <button type="button" class="remove-feature-btn" onclick="this.parentElement.remove()">
        <i class="fas fa-times"></i>
      </button>
    </div>
  `).join('');

  enContainer.innerHTML = featuresEn.map(feature => `
    <div class="feature-input-group">
      <input type="text" class="feature-en-input" placeholder="Enter feature" value="${feature}">
      <button type="button" class="remove-feature-btn" onclick="this.parentElement.remove()">
        <i class="fas fa-times"></i>
      </button>
    </div>
  `).join('');
}

document.getElementById('addFeatureArBtn')?.addEventListener('click', () => {
  const container = document.getElementById('featuresArContainer');
  const div = document.createElement('div');
  div.className = 'feature-input-group';
  div.innerHTML = `
    <input type="text" class="feature-ar-input" placeholder="أدخل ميزة">
    <button type="button" class="remove-feature-btn" onclick="this.parentElement.remove()">
      <i class="fas fa-times"></i>
    </button>
  `;
  container.appendChild(div);
});

document.getElementById('addFeatureEnBtn')?.addEventListener('click', () => {
  const container = document.getElementById('featuresEnContainer');
  const div = document.createElement('div');
  div.className = 'feature-input-group';
  div.innerHTML = `
    <input type="text" class="feature-en-input" placeholder="Enter feature">
    <button type="button" class="remove-feature-btn" onclick="this.parentElement.remove()">
      <i class="fas fa-times"></i>
    </button>
  `;
  container.appendChild(div);
});

document.getElementById('productForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const featuresAr = Array.from(document.querySelectorAll('.feature-ar-input'))
    .map(input => input.value.trim())
    .filter(val => val);

  const featuresEn = Array.from(document.querySelectorAll('.feature-en-input'))
    .map(input => input.value.trim())
    .filter(val => val);

  const productData = {
    hub_type: document.getElementById('productHub').value,
    name_ar: document.getElementById('productNameAr').value,
    name_en: document.getElementById('productNameEn').value,
    description_ar: document.getElementById('productDescriptionAr').value,
    description_en: document.getElementById('productDescriptionEn').value,
    duration_ar: document.getElementById('productDurationAr').value,
    duration_en: document.getElementById('productDurationEn').value,
    price_before: parseFloat(document.getElementById('productPriceBefore').value) || null,
    price: parseFloat(document.getElementById('productPrice').value),
    image_url: document.getElementById('productImageUrl').value || '',
    icon: document.getElementById('productIcon').value,
    display_order: parseInt(document.getElementById('productOrder').value),
    is_active: document.getElementById('productIsActive').checked,
    features_ar: featuresAr,
    features_en: featuresEn,
    updated_at: new Date().toISOString()
  };

  try {
    let result;
    if (currentEditingProduct) {
      result = await supabase
        .from('products')
        .update(productData)
        .eq('id', currentEditingProduct);
    } else {
      result = await supabase
        .from('products')
        .insert([productData]);
    }

    if (result.error) throw result.error;

    showNotification('تم حفظ المنتج بنجاح', 'success');
    hideModal('productModal');
    loadProducts(currentHub);
  } catch (error) {
    console.error('Error saving product:', error);
    showNotification('خطأ في حفظ المنتج', 'error');
  }
});

window.editProduct = function(productId, hub) {
  openProductModal(productId, hub);
};

window.deleteProduct = async function(productId, hub) {
  if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;

  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) throw error;

    showNotification('تم حذف المنتج بنجاح', 'success');
    loadProducts(hub);
  } catch (error) {
    console.error('Error deleting product:', error);
    showNotification('خطأ في حذف المنتج', 'error');
  }
};

async function loadHomepageSettings() {
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*');

    if (error) throw error;

    const settings = {};
    (data || []).forEach(setting => {
      settings[setting.setting_key] = setting.setting_value;
    });

    const contactInfo = settings.contact_info || {};
    document.getElementById('whatsappNumber').value = contactInfo.whatsappNumber || '';
    document.getElementById('phoneNumber').value = contactInfo.phoneNumber || '';
    document.getElementById('emailAddress').value = contactInfo.emailAddress || '';
    document.getElementById('address').value = contactInfo.address || '';

    const socialMedia = settings.social_media || {};
    document.getElementById('instagramUrl').value = socialMedia.instagramUrl || '';
    document.getElementById('twitterUrl').value = socialMedia.twitterUrl || '';
    document.getElementById('linkedinUrl').value = socialMedia.linkedinUrl || '';
    document.getElementById('facebookUrl').value = socialMedia.facebookUrl || '';

    const siteContent = settings.site_content || {};
    document.getElementById('siteTitleAr').value = siteContent.siteTitleAr || '';
    document.getElementById('siteTitleEn').value = siteContent.siteTitleEn || '';
    document.getElementById('siteDescription').value = siteContent.siteDescription || '';

    const homepageCards = settings.homepage_cards || {};
    const hrCard = homepageCards.hrHub || {};
    document.getElementById('hrCardTitleAr').value = hrCard.titleAr || '';
    document.getElementById('hrCardTitleEn').value = hrCard.titleEn || '';
    document.getElementById('hrCardDescriptionAr').value = hrCard.descriptionAr || '';
    document.getElementById('hrCardDescriptionEn').value = hrCard.descriptionEn || '';
    document.getElementById('hrCardIcon').value = hrCard.icon || 'fas fa-users';

    const webCard = homepageCards.webHub || {};
    document.getElementById('webCardTitleAr').value = webCard.titleAr || '';
    document.getElementById('webCardTitleEn').value = webCard.titleEn || '';
    document.getElementById('webCardDescriptionAr').value = webCard.descriptionAr || '';
    document.getElementById('webCardDescriptionEn').value = webCard.descriptionEn || '';
    document.getElementById('webCardIcon').value = webCard.icon || 'fas fa-code';
  } catch (error) {
    console.error('Error loading homepage settings:', error);
    showNotification('خطأ في تحميل الإعدادات', 'error');
  }
}

document.getElementById('homepageSettingsForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const contactInfo = {
    whatsappNumber: document.getElementById('whatsappNumber').value,
    phoneNumber: document.getElementById('phoneNumber').value,
    emailAddress: document.getElementById('emailAddress').value,
    address: document.getElementById('address').value
  };

  const socialMedia = {
    instagramUrl: document.getElementById('instagramUrl').value,
    twitterUrl: document.getElementById('twitterUrl').value,
    linkedinUrl: document.getElementById('linkedinUrl').value,
    facebookUrl: document.getElementById('facebookUrl').value
  };

  const siteContent = {
    siteTitleAr: document.getElementById('siteTitleAr').value,
    siteTitleEn: document.getElementById('siteTitleEn').value,
    siteDescription: document.getElementById('siteDescription').value
  };

  const homepageCards = {
    hrHub: {
      titleAr: document.getElementById('hrCardTitleAr').value,
      titleEn: document.getElementById('hrCardTitleEn').value,
      descriptionAr: document.getElementById('hrCardDescriptionAr').value,
      descriptionEn: document.getElementById('hrCardDescriptionEn').value,
      icon: document.getElementById('hrCardIcon').value
    },
    webHub: {
      titleAr: document.getElementById('webCardTitleAr').value,
      titleEn: document.getElementById('webCardTitleEn').value,
      descriptionAr: document.getElementById('webCardDescriptionAr').value,
      descriptionEn: document.getElementById('webCardDescriptionEn').value,
      icon: document.getElementById('webCardIcon').value
    }
  };

  try {
    const updates = [
      { key: 'contact_info', value: contactInfo },
      { key: 'social_media', value: socialMedia },
      { key: 'site_content', value: siteContent },
      { key: 'homepage_cards', value: homepageCards }
    ];

    for (const update of updates) {
      const { error } = await supabase
        .from('site_settings')
        .upsert({
          setting_key: update.key,
          setting_value: update.value,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'setting_key'
        });

      if (error) throw error;
    }

    showNotification('تم حفظ الإعدادات بنجاح', 'success');
  } catch (error) {
    console.error('Error saving homepage settings:', error);
    showNotification('خطأ في حفظ الإعدادات', 'error');
  }
});

function showModal(modalId) {
  document.getElementById(modalId)?.classList.remove('hidden');
}

function hideModal(modalId) {
  document.getElementById(modalId)?.classList.add('hidden');
}

document.querySelectorAll('.close-modal').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const modal = e.target.closest('.modal');
    if (modal) modal.classList.add('hidden');
  });
});

document.querySelectorAll('.modal').forEach(modal => {
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.add('hidden');
    }
  });
});

function showNotification(message, type = 'success') {
  const notification = document.getElementById('notification');
  const messageElement = document.getElementById('notificationMessage');

  messageElement.textContent = message;
  notification.className = `notification ${type}`;
  notification.classList.remove('hidden');

  setTimeout(() => {
    notification.classList.add('hidden');
  }, 3000);
}

supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT') {
    currentUser = null;
    loginScreen.classList.remove('hidden');
    adminDashboard.classList.add('hidden');
  }
});
