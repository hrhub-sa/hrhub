import { productsAPI, settingsAPI, ordersAPI } from './supabase-client.js';

// DOM Elements
const servicesSlider = document.getElementById('servicesSlider');
const productsGrid = document.getElementById('productsGrid');
const contactInfo = document.getElementById('contactInfo');
const whatsappFloat = document.getElementById('whatsappFloat');
const interestForm = document.getElementById('interestForm');
const formMessage = document.getElementById('formMessage');
const productSelect = document.getElementById('productSelect');

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
  loadServices();
  loadProducts();
  loadContactInfo();
  setupInterestForm();
});

// Load services showcase
async function loadServices() {
  try {
    // For English version, always use default English services
    // Database services are in Arabic, so we use translated defaults
    loadDefaultServices();
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
      title: 'Web Development',
      description: 'Design and develop professional, responsive websites compatible with all devices',
      icon: 'fas fa-globe'
    },
    {
      id: 'mobile-apps',
      title: 'Mobile Applications',
      description: 'Develop smart applications for iOS and Android systems using the latest technologies',
      icon: 'fas fa-mobile-alt'
    },
    {
      id: 'ecommerce',
      title: 'E-commerce Stores',
      description: 'Create integrated e-commerce stores with payment and management systems',
      icon: 'fas fa-shopping-cart'
    },
    {
      id: 'systems',
      title: 'Management Systems',
      description: 'Develop custom management systems to facilitate business operations',
      icon: 'fas fa-cogs'
    }
  ];
  
  renderServices(defaultServices);
}

// Load products
async function loadProducts() {
  try {
    // For English version, always use default English products
    // Database products are in Arabic, so we use translated defaults
    loadDefaultProducts();
  } catch (error) {
    console.error('Error loading products:', error);
    loadDefaultProducts();
  }
}

// Render products
function renderProducts(products) {
  if (!productsGrid) return;
  
  productsGrid.innerHTML = products.map(product => `
    <div class="product-card">
      <div class="product-header">
        <div class="product-icon">
          <i class="${product.icon}"></i>
        </div>
        <div class="product-info">
          <h3 class="product-name">${product.name_en}</h3>
          <div class="product-price">${product.price} SAR</div>
        </div>
      </div>
      <p class="product-description">${product.description_en}</p>
      <div class="product-meta">
        <span class="product-duration">
          <i class="fas fa-clock"></i>
          ${product.duration_en}
        </span>
      </div>
      ${product.features_en && product.features_en.length > 0 ? `
        <ul class="product-features">
          ${product.features_en.map(feature => `<li>${feature}</li>`).join('')}
        </ul>
      ` : ''}
      <button class="product-btn" onclick="selectProduct('${product.id}', '${product.name_en}')">
        <i class="fas fa-shopping-cart"></i>
        Order Now
      </button>
    </div>
  `).join('');
}

// Load default products
function loadDefaultProducts() {
  const defaultProducts = [
    {
      id: '1',
      name: 'Professional Website',
      description: 'Design and develop a responsive website compatible with all devices using the latest technologies',
      price: 2500,
      duration: '2-3 weeks',
      icon: 'fas fa-globe',
      features: ['Responsive Design', 'Admin Panel', 'SEO Optimization', 'Free Hosting for 1 Year']
    },
    {
      id: '2',
      name: 'E-commerce Store',
      description: 'Complete e-commerce store with payment system and product & inventory management',
      price: 4500,
      duration: '3-4 weeks',
      icon: 'fas fa-shopping-cart',
      features: ['Secure Payment System', 'Inventory Management', 'Sales Reports', 'Free Mobile App']
    },
    {
      id: '3',
      name: 'Mobile Application',
      description: 'Professional mobile app for iOS and Android systems with advanced user interface',
      price: 8000,
      duration: '4-6 weeks',
      icon: 'fas fa-mobile-alt',
      features: ['iOS & Android Compatible', 'User-Friendly Interface', 'Push Notifications', 'Free Updates']
    },
    {
      id: '4',
      name: 'Content Management System',
      description: 'Custom content management system for easy website and content management',
      price: 3500,
      duration: '3-4 weeks',
      icon: 'fas fa-cogs',
      features: ['Comprehensive Control Panel', 'User Management', 'Permissions System', 'Detailed Reports']
    }
  ];
  
  renderProducts(defaultProducts);
  populateProductSelect(defaultProducts);
}

// Populate product select dropdown
function populateProductSelect(products) {
  if (!productSelect) return;

  // Clear existing options except the first one
  productSelect.innerHTML = '<option value="">Select Product</option>';

  products.forEach(product => {
    const option = document.createElement('option');
    option.value = product.id;
    option.textContent = product.name_en;
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
    message: formData.get('message') || 'Interest in Web Hub product',
    hub: 'webhub'
  };
  
  // Add product info to message
  const selectedProduct = formData.get('product');
  if (selectedProduct) {
    // Get product name from the select options
    const productOption = productSelect.querySelector(`option[value="${selectedProduct}"]`);
    const productName = productOption ? productOption.textContent : selectedProduct;
    orderData.message = `Interest in ${productName}. ${orderData.message}`;
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
