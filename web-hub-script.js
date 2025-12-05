import { productsAPI, settingsAPI, ordersAPI, mainBannerAPI } from './supabase-client.js';

// DOM Elements
const mainBannerContainer = document.getElementById('mainBannerContainer');
const servicesSlider = document.getElementById('servicesSlider');
const productsGrid = document.getElementById('productsGrid');
const contactInfo = document.getElementById('contactInfo');
const whatsappFloat = document.getElementById('whatsappFloat');
const interestForm = document.getElementById('interestForm');
const formMessage = document.getElementById('formMessage');
const productSelect = document.getElementById('productSelect');

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
  loadMainBanner();
  loadServices();
  loadProducts();
  loadContactInfo();
  setupInterestForm();
});

// Load main banner
async function loadMainBanner() {
  try {
    const settingsResult = await mainBannerAPI.getSettings();
    const imagesResult = await mainBannerAPI.getImages();

    if (settingsResult.success && settingsResult.data.is_enabled && imagesResult.success && imagesResult.data.length > 0) {
      renderMainBanner(imagesResult.data, settingsResult.data.auto_slide_interval);
    }
  } catch (error) {
    console.error('Error loading main banner:', error);
  }
}

// Render main banner
function renderMainBanner(images, interval) {
  if (!mainBannerContainer) return;

  if (images.length === 0) {
    mainBannerContainer.style.display = 'none';
    return;
  }

  mainBannerContainer.style.display = 'block';
  mainBannerContainer.innerHTML = images.map((img, idx) => `
    <div class="main-banner-slide" style="display: ${idx === 0 ? 'block' : 'none'};">
      <img src="${img.image_url}" alt="${img.alt_text || img.title}" class="main-banner-image">
    </div>
  `).join('');

  if (images.length > 1) {
    let currentIndex = 0;
    setInterval(() => {
      const slides = mainBannerContainer.querySelectorAll('.main-banner-slide');
      slides.forEach(slide => slide.style.display = 'none');
      currentIndex = (currentIndex + 1) % slides.length;
      slides[currentIndex].style.display = 'block';
    }, (interval || 5) * 1000);
  }
}

// Load services showcase
async function loadServices() {
  try {
    const result = await settingsAPI.getAllSettings();
    let servicesData = [];
    
    if (result.success && result.data.length > 0) {
      const servicesSetting = result.data.find(setting => setting.setting_key === 'web_hub_services');
      if (servicesSetting && servicesSetting.setting_value) {
        servicesData = servicesSetting.setting_value;
      }
    }
    
    // Default services
    if (servicesData.length === 0) {
      servicesData = [
        {
          id: 'web-development',
          title: 'تطوير المواقع',
          description: 'تصميم وتطوير مواقع إلكترونية احترافية ومتجاوبة مع جميع الأجهزة',
          icon: 'fas fa-globe'
        },
        {
          id: 'mobile-apps',
          title: 'تطبيقات الجوال',
          description: 'تطوير تطبيقات ذكية لأنظمة iOS و Android بأحدث التقنيات',
          icon: 'fas fa-mobile-alt'
        },
        {
          id: 'ecommerce',
          title: 'المتاجر الإلكترونية',
          description: 'إنشاء متاجر إلكترونية متكاملة مع أنظمة الدفع والإدارة',
          icon: 'fas fa-shopping-cart'
        },
        {
          id: 'systems',
          title: 'الأنظمة الإدارية',
          description: 'تطوير أنظمة إدارية مخصصة لتسهيل العمليات التجارية',
          icon: 'fas fa-cogs'
        }
      ];
    }
    
    renderServices(servicesData);
  } catch (error) {
    console.error('Error loading services:', error);
    loadDefaultServices();
  }
}

// Render services
function renderServices(services) {
  if (!servicesSlider) return;
  
  servicesSlider.innerHTML = services.map(service => `
    <div class="service-slide">
      <div class="service-icon">
        <i class="${service.icon}"></i>
      </div>
      <h3 class="service-title">${service.title}</h3>
      <p class="service-description">${service.description}</p>
    </div>
  `).join('');
}

// Load default services
function loadDefaultServices() {
  const defaultServices = [
    {
      id: 'web-development',
      title: 'تطوير المواقع',
      description: 'تصميم وتطوير مواقع إلكترونية احترافية ومتجاوبة مع جميع الأجهزة',
      icon: 'fas fa-globe'
    },
    {
      id: 'mobile-apps',
      title: 'تطبيقات الجوال',
      description: 'تطوير تطبيقات ذكية لأنظمة iOS و Android بأحدث التقنيات',
      icon: 'fas fa-mobile-alt'
    },
    {
      id: 'ecommerce',
      title: 'المتاجر الإلكترونية',
      description: 'إنشاء متاجر إلكترونية متكاملة مع أنظمة الدفع والإدارة',
      icon: 'fas fa-shopping-cart'
    },
    {
      id: 'systems',
      title: 'الأنظمة الإدارية',
      description: 'تطوير أنظمة إدارية مخصصة لتسهيل العمليات التجارية',
      icon: 'fas fa-cogs'
    }
  ];
  
  renderServices(defaultServices);
}

// Load products
async function loadProducts() {
  try {
    const result = await productsAPI.getAllProducts();

    if (result.success && result.data.length > 0) {
      renderProducts(result.data);
      populateProductSelect(result.data);
    } else {
      showEmptyProducts();
    }
  } catch (error) {
    console.error('Error loading products:', error);
    showEmptyProducts();
  }
}

// Render products
function renderProducts(products) {
  if (!productsGrid) return;

  productsGrid.innerHTML = products.map(product => {
    const name = product.name_ar || product.name || 'منتج';
    const description = product.description_ar || product.description || '';
    const duration = product.duration_ar || product.duration || '';
    const features = product.features_ar || product.features || [];
    const priceHTML = product.price_before ?
      `<div class="product-price">
        <span style="text-decoration: line-through; color: #999; font-size: 0.9em; margin-left: 0.5rem;">${product.price_before} ريال</span>
        <span style="color: #ff6b35; font-weight: 700; font-size: 1.2em;">${product.price} ريال</span>
      </div>` :
      `<div class="product-price">${product.price} ريال</div>`;

    return `
    <div class="product-card">
      <div class="product-header">
        <div class="product-icon">
          <i class="${product.icon || 'fas fa-box'}"></i>
        </div>
        <div class="product-info">
          <h3 class="product-name">${name}</h3>
          ${priceHTML}
        </div>
      </div>
      <p class="product-description">${description}</p>
      <div class="product-meta">
        <span class="product-duration">
          <i class="fas fa-clock"></i>
          ${duration}
        </span>
      </div>
      ${features && features.length > 0 ? `
        <ul class="product-features">
          ${features.map(feature => `<li>${feature}</li>`).join('')}
        </ul>
      ` : ''}
      <button class="product-btn" onclick="selectProduct('${product.id}', '${name}')">
        <i class="fas fa-shopping-cart"></i>
        اطلب الآن
      </button>
    </div>
  `}).join('');
}

// Show empty products message
function showEmptyProducts() {
  if (!productsGrid) return;

  productsGrid.innerHTML = `
    <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
      <i class="fas fa-box-open" style="font-size: 4rem; color: #666; margin-bottom: 1rem;"></i>
      <p style="color: #999; font-size: 1.2rem;">لا توجد منتجات متاحة حالياً</p>
    </div>
  `;

  if (productSelect) {
    productSelect.innerHTML = '<option value="">اختر المنتج</option>';
  }
}

// Populate product select dropdown
function populateProductSelect(products) {
  if (!productSelect) return;

  // Clear existing options except the first one
  productSelect.innerHTML = '<option value="">اختر المنتج</option>';

  products.forEach(product => {
    const name = product.name_ar || product.name || 'منتج';
    const option = document.createElement('option');
    option.value = product.id;
    option.textContent = name;
    productSelect.appendChild(option);
  });
}

// Select product function
window.selectProduct = function(productId, productName) {
  // Scroll to interest form
  document.querySelector('.interest-section').scrollIntoView({ 
    behavior: 'smooth' 
  });
  
  // Pre-select the product in the form
  if (productSelect) {
    productSelect.value = productId;
  }
};

// Load contact info
async function loadContactInfo() {
  try {
    const result = await settingsAPI.getAllSettings();
    let contactData = {};
    
    if (result.success && result.data.length > 0) {
      const contactSetting = result.data.find(setting => setting.setting_key === 'contact_info');
      if (contactSetting && contactSetting.setting_value) {
        contactData = contactSetting.setting_value;
      }
    }
    
    // Default contact info
    const defaultContact = {
      whatsappNumber: '+966530017278',
      phoneNumber: '+966542345930',
      emailAddress: 'hrhub.sa@gmail.com',
      address: 'المدينة المنورة، السعودية'
    };
    
    const contact = { ...defaultContact, ...contactData };
    
    renderContactInfo(contact);
    updateWhatsAppLink(contact.whatsappNumber);
  } catch (error) {
    console.error('Error loading contact info:', error);
    loadDefaultContactInfo();
  }
}

// Render contact info
function renderContactInfo(contact) {
  if (!contactInfo) return;
  
  contactInfo.innerHTML = `
    <div class="contact-item">
      <div class="contact-icon">
        <i class="fab fa-whatsapp"></i>
      </div>
      <h4>واتساب</h4>
      <p><a href="https://wa.me/${contact.whatsappNumber.replace(/[^0-9]/g, '')}">${contact.whatsappNumber}</a></p>
    </div>
    <div class="contact-item">
      <div class="contact-icon">
        <i class="fas fa-phone"></i>
      </div>
      <h4>الهاتف</h4>
      <p><a href="tel:${contact.phoneNumber}">${contact.phoneNumber}</a></p>
    </div>
    <div class="contact-item">
      <div class="contact-icon">
        <i class="fas fa-envelope"></i>
      </div>
      <h4>البريد الإلكتروني</h4>
      <p><a href="mailto:${contact.emailAddress}">${contact.emailAddress}</a></p>
    </div>
    <div class="contact-item">
      <div class="contact-icon">
        <i class="fas fa-map-marker-alt"></i>
      </div>
      <h4>العنوان</h4>
      <p>${contact.address}</p>
    </div>
  `;
}

// Load default contact info
function loadDefaultContactInfo() {
  const defaultContact = {
    whatsappNumber: '+966530017278',
    phoneNumber: '+966542345930',
    emailAddress: 'hrhub.sa@gmail.com',
    address: 'المدينة المنورة، السعودية'
  };
  
  renderContactInfo(defaultContact);
  updateWhatsAppLink(defaultContact.whatsappNumber);
}

// Update WhatsApp link
function updateWhatsAppLink(whatsappNumber) {
  if (whatsappFloat) {
    const cleanNumber = whatsappNumber.replace(/[^0-9]/g, '');
    whatsappFloat.href = `https://wa.me/${cleanNumber}`;
  }
}

// Setup interest form
function setupInterestForm() {
  if (!interestForm) return;
  
  interestForm.addEventListener('submit', handleInterestSubmit);
}

// Handle interest form submission
async function handleInterestSubmit(e) {
  e.preventDefault();
  
  const formData = new FormData(interestForm);
  const orderData = {
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    message: formData.get('message') || 'طلب اهتمام بمنتج Web Hub',
    hub: 'webhub'
  };
  
  // Add product info to message
  const selectedProduct = formData.get('product');
  if (selectedProduct) {
    // Get product name from the select options
    const productOption = productSelect.querySelector(`option[value="${selectedProduct}"]`);
    const productName = productOption ? productOption.textContent : selectedProduct;
    orderData.message = `اهتمام بـ ${productName}. ${orderData.message}`;
  }
  
  // Disable submit button
  const submitBtn = interestForm.querySelector('.submit-btn');
  const originalText = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإرسال...';
  
  try {
    const result = await ordersAPI.createOrder(orderData);
    
    if (result.success) {
      showFormMessage('تم إرسال طلب الاهتمام بنجاح! سنتواصل معك قريباً.', 'success');
      interestForm.reset();
    } else {
      throw new Error('فشل في إرسال الطلب');
    }
  } catch (error) {
    console.error('Error submitting interest:', error);
    showFormMessage('حدث خطأ في إرسال الطلب. يرجى المحاولة مرة أخرى.', 'error');
  } finally {
    // Re-enable submit button
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;
  }
}

// Show form message
function showFormMessage(message, type) {
  if (!formMessage) return;
  
  formMessage.textContent = message;
  formMessage.className = `form-message ${type} show`;
  
  setTimeout(() => {
    formMessage.classList.remove('show');
  }, 5000);
}
