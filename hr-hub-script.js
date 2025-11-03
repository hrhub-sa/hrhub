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
           onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjVGNUY1Ii8+Cjx0ZXh0IHg9IjE1MCIgeT0iNzUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5OTkiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZHk9Ii4zZW0iPtmE2Kcg2YrZhdmD2YYg2KrYrdmF2YrZhCDYp9mE2LXZiNix2KU8L3RleHQ+Cjwvc3ZnPg=='">
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
      title: 'منصة قوى',
      image_url: 'qiwa.png',
      alt_text: 'QIWA Platform'
    },
    {
      id: '2',
      title: 'منصة أبشر',
      image_url: 'absher.png',
      alt_text: 'Absher Platform'
    }
  ];
  
  renderBanners(defaultBanners);
}

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
    const result = await settingsAPI.getAllSettings();
    let packagesData = [];
    let pricing = {};
    
    if (result.success && result.data.length > 0) {
      const packagesSetting = result.data.find(setting => setting.setting_key === 'hr_hub_packages');
      const pricingSetting = result.data.find(setting => setting.setting_key === 'package_pricing');
      
      if (packagesSetting && packagesSetting.setting_value) {
        packagesData = packagesSetting.setting_value;
      }
      
      if (pricingSetting && pricingSetting.setting_value) {
        pricing = pricingSetting.setting_value;
      }
    }
    
    // Default packages
    if (packagesData.length === 0) {
      packagesData = [
        {
          id: 'economy',
          name: 'الباقة الاقتصادية',
          price: pricing.economyPrice || 3000,
          duration: 'شهرياً',
          features: [
            'إدارة الموظفين الأساسية',
            'متابعة الحضور والانصراف',
            'إدارة الإجازات',
            'التقارير الأساسية',
            'الدعم الفني'
          ],
          featured: false
        },
        {
          id: 'comprehensive',
          name: 'الباقة الشاملة',
          price: pricing.comprehensivePrice || 6000,
          duration: 'شهرياً',
          features: [
            'جميع مميزات الباقة الاقتصادية',
            'إدارة الرواتب والمكافآت',
            'نظام تقييم الأداء',
            'إدارة التدريب والتطوير',
            'التقارير المتقدمة',
            'الشؤون الحكومية',
            'دعم فني متقدم 24/7'
          ],
          featured: true
        }
      ];
    }
    
    renderPackages(packagesData);
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
          ${pkg.price} <span class="currency">ريال</span>
        </div>
        <p class="package-duration">${pkg.duration}</p>
      </div>
      <ul class="package-features">
        ${pkg.features.map(feature => `<li>${feature}</li>`).join('')}
      </ul>
      <button class="package-btn" onclick="selectPackage('${pkg.id}', '${pkg.name}')">
        اختيار الباقة
      </button>
    </div>
  `).join('');
}

// Load default packages
function loadDefaultPackages() {
  const defaultPackages = [
    {
      id: 'economy',
      name: 'الباقة الاقتصادية',
      price: 3000,
      duration: 'شهرياً',
      features: [
        'إدارة الموظفين الأساسية',
        'متابعة الحضور والانصراف',
        'إدارة الإجازات',
        'التقارير الأساسية',
        'الدعم الفني'
      ],
      featured: false
    },
    {
      id: 'comprehensive',
      name: 'الباقة الشاملة',
      price: 6000,
      duration: 'شهرياً',
      features: [
        'جميع مميزات الباقة الاقتصادية',
        'إدارة الرواتب والمكافآت',
        'نظام تقييم الأداء',
        'إدارة التدريب والتطوير',
        'التقارير المتقدمة',
        'الشؤون الحكومية',
        'دعم فني متقدم 24/7'
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
