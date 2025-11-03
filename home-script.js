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
    const result = await settingsAPI.getAllSettings();
    let services = [];
    
    if (result.success && result.data.length > 0) {
      const servicesData = result.data.find(setting => setting.setting_key === 'home_services');
      if (servicesData && servicesData.setting_value) {
        services = servicesData.setting_value;
      }
    }
    
    // Default services if none found
    if (services.length === 0) {
      services = [
        {
          id: 'hr-hub',
          title: 'إدارة الأعمال',
          subtitle: 'HR Hub',
          description: 'حلول شاملة لإدارة الموارد البشرية والشؤون الحكومية',
          icon: 'fas fa-users',
          features: [
            'إدارة الموظفين والمواهب',
            'الشؤون الحكومية',
            'المنصات الرسمية',
            'الإجراءات والتحديثات'
          ],
          link: 'hr-hub.html'
        },
        {
          id: 'web-hub',
          title: 'تطوير الأعمال',
          subtitle: 'Web Hub',
          description: 'حلول تقنية متقدمة لتطوير أعمالك الرقمية',
          icon: 'fas fa-code',
          features: [
            'تطوير المواقع الإلكترونية',
            'التطبيقات الذكية',
            'المتاجر الإلكترونية',
            'الأنظمة الإدارية'
          ],
          link: 'web-hub.html'
        }
      ];
    }
    
    renderServices(services);
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
        <i class="fas fa-arrow-left"></i>
        استكشف الخدمة
      </a>
    </div>
  `).join('');
}

// Load default services
function loadDefaultServices() {
  const defaultServices = [
    {
      id: 'hr-hub',
      title: 'إدارة الأعمال',
      subtitle: 'HR Hub',
      description: 'حلول شاملة لإدارة الموارد البشرية والشؤون الحكومية',
      icon: 'fas fa-users',
      features: [
        'إدارة الموظفين والمواهب',
        'الشؤون الحكومية',
        'المنصات الرسمية',
        'الإجراءات والتحديثات'
      ],
      link: 'hr-hub.html'
    },
    {
      id: 'web-hub',
      title: 'تطوير الأعمال',
      subtitle: 'Web Hub',
      description: 'حلول تقنية متقدمة لتطوير أعمالك الرقمية',
      icon: 'fas fa-code',
      features: [
        'تطوير المواقع الإلكترونية',
        'التطبيقات الذكية',
        'المتاجر الإلكترونية',
        'الأنظمة الإدارية'
      ],
      link: 'web-hub.html'
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
