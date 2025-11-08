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

// Load services from settings
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
  if (!servicesGrid) return;
  
  servicesGrid.innerHTML = services.map(service => `
    <div class="service-card" onclick="window.location.href='${service.link}'">
      <div class="service-icon">
        <i class="${service.icon}"></i>
      </div>
      <h3>${service.title}</h3>
      <p class="service-subtitle">${service.subtitle}</p>
      <p>${service.description}</p>
      <ul class="service-features">
        ${service.features.map(feature => `<li>${feature}</li>`).join('')}
      </ul>
      <a href="${service.link}" class="service-btn">
        <i class="fas fa-arrow-right"></i>
        Explore Service
      </a>
    </div>
  `).join('');
}

// Load default services
function loadDefaultServices() {
  const defaultServices = [
    {
      id: 'hr-hub',
      title: 'Business Management',
      subtitle: 'HR Hub',
      description: 'Comprehensive solutions for human resources and government affairs management',
      icon: 'fas fa-users',
      features: [
        'Employee & Talent Management',
        'Government Affairs',
        'Official Platforms',
        'Procedures & Updates'
      ],
      link: 'hr-hub-en.html'
    },
    {
      id: 'web-hub',
      title: 'Business Development',
      subtitle: 'Web Hub',
      description: 'Advanced technical solutions for developing your digital business',
      icon: 'fas fa-code',
      features: [
        'Website Development',
        'Mobile Applications',
        'E-commerce Stores',
        'Management Systems'
      ],
      link: 'web-hub-en.html'
    }
  ];
  
  renderServices(defaultServices);
}

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
