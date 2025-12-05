import { settingsAPI } from './supabase-client.js';

// DOM Elements
const servicesGrid = document.getElementById('servicesGrid');
const contactInfo = document.getElementById('contactInfo');
const whatsappFloat = document.getElementById('whatsappFloat');

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
  loadServices();
  loadContactInfo();
});

// Load services
async function loadServices() {
  try {
    const result = await settingsAPI.getAllSettings();
    let servicesData = [];

    if (result.success && result.data.length > 0) {
      const servicesSetting = result.data.find(setting => setting.setting_key === 'home_services');
      if (servicesSetting && servicesSetting.setting_value) {
        servicesData = servicesSetting.setting_value;
      }
    }

    if (servicesData.length > 0) {
      renderServices(servicesData);
    } else {
      showEmptyServices();
    }
  } catch (error) {
    console.error('Error loading services:', error);
    showEmptyServices();
  }
}

// Render services
function renderServices(services) {
  if (!servicesGrid) return;

  servicesGrid.innerHTML = services.map(service => `
    <div class="service-card" onclick="navigateToService('${service.link}')">
      <div class="service-icon">
        <i class="${service.icon}"></i>
      </div>
      <h3 class="service-title">${service.title_ar || service.title}</h3>
      <p class="service-description">${service.description_ar || service.description}</p>
    </div>
  `).join('');
}

// Show empty services message
function showEmptyServices() {
  if (!servicesGrid) return;

  servicesGrid.innerHTML = `
    <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
      <i class="fas fa-box-open" style="font-size: 4rem; color: #666; margin-bottom: 1rem;"></i>
      <p style="color: #999; font-size: 1.2rem;">لا توجد خدمات متاحة حالياً</p>
    </div>
  `;
}

// Navigate to service
window.navigateToService = function(link) {
  if (link) {
    window.location.href = link;
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
function updateWhatsAppLink(phoneNumber) {
  if (whatsappFloat) {
    const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
    whatsappFloat.href = `https://wa.me/${cleanNumber}`;
  }
}
