import { bannerAPI, settingsAPI, ordersAPI } from './supabase-client.js';

// DOM Elements
const bannerSlider = document.getElementById('bannerSlider');
const aboutContent = document.getElementById('aboutContent');
const packagesGrid = document.getElementById('packagesGrid');
const contactInfo = document.getElementById('contactInfo');
const whatsappFloat = document.getElementById('whatsappFloat');
const interestForm = document.getElementById('interestForm');
const formMessage = document.getElementById('formMessage');

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
  loadBanners();
  loadAboutContent();
  loadPackages();
  loadContactInfo();
  setupInterestForm();
});

// Load banners
async function loadBanners() {
  try {
    const result = await bannerAPI.getAllBanners('hrhub');
    
    if (result.success && result.data.length > 0) {
      renderBanners(result.data);
    } else {
      loadDefaultBanners();
    }
  } catch (error) {
    console.error('Error loading banners:', error);
    loadDefaultBanners();
  }
}

// Render banners
function renderBanners(banners) {
  if (!bannerSlider) return;
  
  bannerSlider.innerHTML = banners.map(banner => `
    <div class="banner-slide">
      <img src="${banner.image_url}" alt="${banner.alt_text}" class="banner-image" 
           onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjVGNUY1Ii8+Cjx0ZXh0IHg9IjE1MCIgeT0iNzUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5OTkiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZHk9Ii4zZW0iPkltYWdlIG5vdCBhdmFpbGFibGU8L3RleHQ+Cjwvc3ZnPg=='">
      <div class="banner-content">
        <h3 class="banner-title">${banner.title}</h3>
      </div>
    </div>
  `).join('');
}

// Load default banners
function loadDefaultBanners() {
  const defaultBanners = [
    {
      id: '1',
      title: 'QIWA Platform',
      image_url: 'qiwa.png',
      alt_text: 'QIWA Platform'
    },
    {
      id: '2',
      title: 'Absher Platform',
      image_url: 'absher.png',
      alt_text: 'Absher Platform'
    }
  ];
  
  renderBanners(defaultBanners);
}

// Load about content
async function loadAboutContent() {
  try {
    // For English version, always use default English content
    // Database content is in Arabic, so we use translated defaults
    loadDefaultAboutContent();
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
    title: 'About Business Management',
    description: 'We specialize in providing comprehensive solutions for human resources management and government affairs. We help companies and institutions develop employee management systems and deal with government entities with high efficiency.',
    features: [
      'Employee & Talent Management',
      'Government Affairs & Licensing',
      'Official & Government Platforms',
      'Administrative Consultations'
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
    const name = product.name_en || product.name || 'Product';
    const description = product.description_en || product.description || '';
    const duration = product.duration_en || product.duration || '';
    const features = product.features_en || product.features || [];
    const priceHTML = product.price_before ?
      `<div class="product-price">
        <span style="text-decoration: line-through; color: #999; font-size: 0.9em; margin-right: 0.5rem;">${product.price_before} SAR</span>
        <span style="color: #ff6b35; font-weight: 700; font-size: 1.2em;">${product.price} SAR</span>
      </div>` :
      `<div class="product-price">${product.price} SAR</div>`;

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
        Order Now
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
      <p style="color: #999; font-size: 1.2rem;">No products available at this time</p>
    </div>
  `;

  if (productSelect) {
    productSelect.innerHTML = '<option value="">Select Product</option>';
  }
}

// Populate product select dropdown
function populateProductSelect(products) {
  if (!productSelect) return;

  productSelect.innerHTML = '<option value="">Select Product</option>';

  products.forEach(product => {
    const name = product.name_en || product.name || 'Product';
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
      address: 'Medina, Saudi Arabia'
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
      <h4>WhatsApp</h4>
      <p><a href="https://wa.me/${contact.whatsappNumber.replace(/[^0-9]/g, '')}">${contact.whatsappNumber}</a></p>
    </div>
    <div class="contact-item">
      <div class="contact-icon">
        <i class="fas fa-phone"></i>
      </div>
      <h4>Phone</h4>
      <p><a href="tel:${contact.phoneNumber}">${contact.phoneNumber}</a></p>
    </div>
    <div class="contact-item">
      <div class="contact-icon">
        <i class="fas fa-envelope"></i>
      </div>
      <h4>Email</h4>
      <p><a href="mailto:${contact.emailAddress}">${contact.emailAddress}</a></p>
    </div>
    <div class="contact-item">
      <div class="contact-icon">
        <i class="fas fa-map-marker-alt"></i>
      </div>
      <h4>Address</h4>
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
    address: 'Medina, Saudi Arabia'
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
    message: formData.get('message') || 'Interest in HR Hub package',
    hub: 'hrhub'
  };
  
  // Add package info to message
  const selectedPackage = formData.get('package');
  if (selectedPackage) {
    const packageNames = {
      'economy': 'Economy Package',
      'comprehensive': 'Comprehensive Package'
    };
    orderData.message = `Interest in ${packageNames[selectedPackage] || selectedPackage}. ${orderData.message}`;
  }
  
  // Disable submit button
  const submitBtn = interestForm.querySelector('.submit-btn');
  const originalText = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
  
  try {
    const result = await ordersAPI.createOrder(orderData);
    
    if (result.success) {
      showFormMessage('Interest submitted successfully! We will contact you soon.', 'success');
      interestForm.reset();
    } else {
      throw new Error('Failed to submit interest');
    }
  } catch (error) {
    console.error('Error submitting interest:', error);
    showFormMessage('An error occurred while submitting. Please try again.', 'error');
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
