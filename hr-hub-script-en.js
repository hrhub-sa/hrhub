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
    // For English version, always use default English packages
    // Database packages are in Arabic, so we use translated defaults
    loadDefaultPackages();
  } catch (error) {
    console.error('Error loading packages:', error);
    loadDefaultPackages();
  }
}

// Render packages
function renderPackages(packages) {
  if (!packagesGrid) return;
  
  packagesGrid.innerHTML = packages.map(pkg => `
    <div class="package-card ${pkg.featured ? 'featured' : ''}">
      <div class="package-header">
        <h3 class="package-name">${pkg.name}</h3>
        <div class="package-price">
          ${pkg.price} <span class="currency">SAR</span>
        </div>
        <p class="package-duration">${pkg.duration}</p>
      </div>
      <ul class="package-features">
        ${pkg.features.map(feature => `<li>${feature}</li>`).join('')}
      </ul>
      <button class="package-btn" onclick="selectPackage('${pkg.id}', '${pkg.name}')">
        Select Package
      </button>
    </div>
  `).join('');
}

// Load default packages
function loadDefaultPackages() {
  const defaultPackages = [
    {
      id: 'economy',
      name: 'Economy Package',
      price: 3000,
      duration: 'Monthly',
      features: [
        'Basic Employee Management',
        'Attendance & Departure Tracking',
        'Leave Management',
        'Basic Reports',
        'Technical Support'
      ],
      featured: false
    },
    {
      id: 'comprehensive',
      name: 'Comprehensive Package',
      price: 6000,
      duration: 'Monthly',
      features: [
        'All Economy Package Features',
        'Payroll & Bonus Management',
        'Performance Evaluation System',
        'Training & Development Management',
        'Advanced Reports',
        'Government Affairs',
        'Advanced 24/7 Technical Support'
      ],
      featured: true
    }
  ];
  
  renderPackages(defaultPackages);
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
