import { settingsAPI } from './supabase-client.js';

// DOM Elements
const servicesGrid = document.getElementById('servicesGrid');
const contactInfo = document.getElementById('contactInfo');
const whatsappFloat = document.getElementById('whatsappFloat');
const footerSocial = document.getElementById('footerSocial');

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
  loadServices();
  loadContactInfo();
  loadSocialMedia();
});

// Load services
async function loadServices() {
  try {
    const result = await settingsAPI.getAllSettings();
    let cardsData = {};

    if (result.success && result.data.length > 0) {
      const cardsSetting = result.data.find(setting => setting.setting_key === 'homepage_cards');
      if (cardsSetting && cardsSetting.setting_value) {
        cardsData = cardsSetting.setting_value;
      }
    }

    if (cardsData.hrHub || cardsData.webHub) {
      renderServices(cardsData);
    } else {
      showEmptyServices();
    }
  } catch (error) {
    console.error('Error loading services:', error);
    showEmptyServices();
  }
}

// Render services
function renderServices(cards) {
  if (!servicesGrid) return;

  const services = [];
  if (cards.hrHub) {
    services.push({
      ...cards.hrHub,
      link: 'hr-hub.html'
    });
  }
  if (cards.webHub) {
    services.push({
      ...cards.webHub,
      link: 'web-hub.html'
    });
  }

  servicesGrid.innerHTML = services.map(service => `
    <a href="${service.link}" class="service-card">
      <div class="service-icon">
        <i class="${service.icon}"></i>
      </div>
      <h3 class="service-title">${service.titleAr}</h3>
      <p class="service-description">${service.descriptionAr}</p>
    </a>
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

// Load social media
async function loadSocialMedia() {
  try {
    const result = await settingsAPI.getAllSettings();
    let socialData = {};

    if (result.success && result.data.length > 0) {
      const socialSetting = result.data.find(setting => setting.setting_key === 'social_media');
      if (socialSetting && socialSetting.setting_value) {
        socialData = socialSetting.setting_value;
      }
    }

    renderSocialMedia(socialData);
  } catch (error) {
    console.error('Error loading social media:', error);
  }
}

// Render social media
function renderSocialMedia(social) {
  if (!footerSocial) return;

  const socialLinks = [];

  if (social.instagramUrl) {
    socialLinks.push(`
      <a href="${social.instagramUrl}" target="_blank" rel="noopener noreferrer" class="social-link instagram">
        <i class="fab fa-instagram"></i>
      </a>
    `);
  }

  if (social.twitterUrl) {
    socialLinks.push(`
      <a href="${social.twitterUrl}" target="_blank" rel="noopener noreferrer" class="social-link twitter">
        <i class="fab fa-x-twitter"></i>
      </a>
    `);
  }

  if (social.linkedinUrl) {
    socialLinks.push(`
      <a href="${social.linkedinUrl}" target="_blank" rel="noopener noreferrer" class="social-link linkedin">
        <i class="fab fa-linkedin-in"></i>
      </a>
    `);
  }

  if (social.facebookUrl) {
    socialLinks.push(`
      <a href="${social.facebookUrl}" target="_blank" rel="noopener noreferrer" class="social-link facebook">
        <i class="fab fa-facebook-f"></i>
      </a>
    `);
  }

  footerSocial.innerHTML = socialLinks.join('');
}
