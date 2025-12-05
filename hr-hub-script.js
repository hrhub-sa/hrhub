import { settingsAPI, ordersAPI } from './supabase-client.js';

// DOM Elements
const aboutContent = document.getElementById('aboutContent');
const packagesGrid = document.getElementById('packagesGrid');
const contactInfo = document.getElementById('contactInfo');
const whatsappFloat = document.getElementById('whatsappFloat');
const interestForm = document.getElementById('interestForm');
const formMessage = document.getElementById('formMessage');

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
  loadAboutContent();
  loadPackages();
  loadContactInfo();
  setupInterestForm();
});

// Load about content
async function loadAboutContent() {
  try {
    const result = await settingsAPI.getAllSettings();
    let aboutData = {};
    
    if (result.success && result.data.length > 0) {
      const aboutSetting = result.data.find(setting => setting.setting_key === 'hr_hub_about');
      if (aboutSetting && aboutSetting.setting_value) {
        aboutData = aboutSetting.setting_value;
      }
    }
    
    // Default about content
    const defaultAbout = {
      title: 'عن إدارة الأعمال',
      description: 'نحن متخصصون في تقديم حلول شاملة لإدارة الموارد البشرية والشؤون الحكومية. نساعد الشركات والمؤسسات في تطوير أنظمة إدارة الموظفين والتعامل مع الجهات الحكومية بكفاءة عالية.',
      features: [
        'إدارة الموظفين والمواهب',
        'الشؤون الحكومية والتراخيص',
        'المنصات الرسمية والحكومية',
        'الاستشارات الإدارية'
      ]
    };
    
    const about = { ...defaultAbout, ...aboutData };
    renderAboutContent(about);
  } catch (error) {
    console.error('Error loading about content:', error);
    loadDefaultAboutContent();
  }
}

// Render about content
function renderAboutContent(about) {
  if (!aboutContent) return;
  
  aboutContent.innerHTML = `
    <h2>${about.title}</h2>
    <p>${about.description}</p>
    ${about.features ? `
      <ul class="about-features">
        ${about.features.map(feature => `<li>${feature}</li>`).join('')}
      </ul>
    ` : ''}
  `;
}

// Load default about content
function loadDefaultAboutContent() {
  const defaultAbout = {
    title: 'عن إدارة الأعمال',
    description: 'نحن متخصصون في تقديم حلول شاملة لإدارة الموارد البشرية والشؤون الحكومية. نساعد الشركات والمؤسسات في تطوير أنظمة إدارة الموظفين والتعامل مع الجهات الحكومية بكفاءة عالية.',
    features: [
      'إدارة الموظفين والمواهب',
      'الشؤون الحكومية والتراخيص',
      'المنصات الرسمية والحكومية',
      'الاستشارات الإدارية'
    ]
  };
  
  renderAboutContent(defaultAbout);
}

// Load packages
async function loadPackages() {
  try {
    const result = await productsAPI.getAllProducts();

    if (result.success && result.data.length > 0) {
      renderProducts(result.data);
      populateProductSelect(result.data);
    } else {
      showEmptyProducts();
    }
  } catch (error) {
    console.error('Error loading packages:', error);
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
      <button class="product-btn" onclick="selectPackage('${product.id}', '${name}')">
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

  productSelect.innerHTML = '<option value="">اختر المنتج</option>';

  products.forEach(product => {
    const name = product.name_ar || product.name || 'منتج';
    const option = document.createElement('option');
    option.value = product.id;
    option.textContent = name;
    productSelect.appendChild(option);
  });
}

// Select package function
window.selectPackage = function(packageId, packageName) {
  // Scroll to interest form
  document.querySelector('.interest-section').scrollIntoView({ 
    behavior: 'smooth' 
  });
  
  // Pre-select the package in the form
  const packageSelect = document.querySelector('select[name="package"]');
  if (packageSelect) {
    packageSelect.value = packageId;
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
    message: formData.get('message') || 'طلب اهتمام بباقة HR Hub',
    hub: 'hrhub'
  };
  
  // Add package info to message
  const selectedPackage = formData.get('package');
  if (selectedPackage) {
    const packageNames = {
      'economy': 'الباقة الاقتصادية',
      'comprehensive': 'الباقة الشاملة'
    };
    orderData.message = `اهتمام بـ ${packageNames[selectedPackage] || selectedPackage}. ${orderData.message}`;
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