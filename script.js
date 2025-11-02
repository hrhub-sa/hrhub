import { ordersAPI } from './supabase-client.js';
import { bannerAPI, productsAPI } from './supabase-client.js';

// Language detection & redirect
if (!localStorage.getItem("preferredLanguage")) {
  const lang = navigator.language.startsWith("en") ? "en" : "ar";
  localStorage.setItem("preferredLanguage", lang);
  if (lang === "en" && !location.href.includes("index-en")) location.href = "index-en.html";
  if (lang === "ar" && location.href.includes("index-en")) location.href = "index.html";
}

document.addEventListener("DOMContentLoaded", () => {
  // Hub switching functionality
  const hrhubBtn = document.getElementById('hrhub-btn');
  const webhubBtn = document.getElementById('webhub-btn');
  const hrhubContent = document.getElementById('hrhub-content');
  const webhubContent = document.getElementById('webhub-content');
  const mainIntro = document.getElementById('main-intro');
  const body = document.body;

  // Initialize with main intro visible
  let currentHub = null;
  let isMainIntroVisible = true;

  // Show main intro by default
  if (mainIntro) {
    mainIntro.style.display = 'block';
  }
  if (hrhubContent) {
    hrhubContent.classList.remove('active');
  }
  if (webhubContent) {
    webhubContent.classList.remove('active');
  }

  function switchToHub(hubType) {
    // Hide main intro section and header
    if (mainIntro && isMainIntroVisible) {
      mainIntro.style.display = 'none';
      isMainIntroVisible = false;
    }
    
    if (hubType === 'webhub') {
      // Switch to Web Hub
      hrhubBtn.classList.remove('active');
      webhubBtn.classList.add('active');
      hrhubContent.classList.remove('active');
      webhubContent.classList.add('active');
      body.classList.add('webhub-theme');
      currentHub = 'webhub';
      
      // Update page title
      document.title = document.documentElement.lang === 'ar' 
        ? 'Web Hub ‒ حلول المواقع والتطبيقات البرمجية'
        : 'Web Hub ‒ Web Development & Software Solutions';
    } else {
      // Switch to HR Hub
      webhubBtn.classList.remove('active');
      hrhubBtn.classList.add('active');
      webhubContent.classList.remove('active');
      hrhubContent.classList.add('active');
      body.classList.remove('webhub-theme');
      currentHub = 'hrhub';
      
      // Update page title
      document.title = document.documentElement.lang === 'ar'
        ? 'HR Hub ‒ إدارة الموارد البشرية والشؤون الحكومية'
        : 'HR Hub ‒ HR & Government Affairs Solutions';
    }
    
    // Re-initialize animations for the new content
    initializeAnimations();
    // Re-initialize slider for the new content
    setTimeout(() => {
      initializeSlider();
    }, 100);
  }

  // Function to return to main intro
  function returnToMain() {
    // Show main intro
    if (mainIntro) {
      mainIntro.style.display = 'block';
      isMainIntroVisible = true;
    }
    
    // Hide hub contents
    hrhubContent.classList.remove('active');
    webhubContent.classList.remove('active');
    hrhubBtn.classList.remove('active');
    webhubBtn.classList.remove('active');
    body.classList.remove('webhub-theme');
    currentHub = null;
    
    // Reset page title
    document.title = document.documentElement.lang === 'ar'
      ? 'HR Hub ‒ منصة شاملة لإدارة وتطوير الأعمال'
      : 'HR Hub ‒ Comprehensive Business Management & Development Platform';
  }

  // Make returnToMain globally available
  window.returnToMain = returnToMain;

  // Event listeners for hub switching
  hrhubBtn.addEventListener('click', () => switchToHub('hrhub'));
  webhubBtn.addEventListener('click', () => switchToHub('webhub'));
  
  // Service selection function
  window.selectService = function(serviceType) {
    switchToHub(serviceType);
  };

  // GSAP ScrollTrigger for cards
  function initializeAnimations() {
    gsap.registerPlugin(ScrollTrigger);
    
    // Clear existing ScrollTriggers
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    
    // Animate package cards
    gsap.utils.toArray('.package-card').forEach(card => {
      gsap.fromTo(card, 
        { y: 50, opacity: 0 },
        {
          y: 0, 
          opacity: 1, 
          duration: 0.8,
          scrollTrigger: { 
            trigger: card, 
            start: 'top 80%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    });

    // Animate product cards
    gsap.utils.toArray('.product-card').forEach((card, index) => {
      gsap.fromTo(card, 
        { y: 60, opacity: 0, scale: 0.9 },
        {
          y: 0, 
          opacity: 1, 
          scale: 1,
          duration: 0.6,
          delay: index * 0.1,
          scrollTrigger: { 
            trigger: card, 
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    });

    // Background parallax
    gsap.utils.toArray('#background .lines, #background .dots').forEach(el => {
      gsap.to(el, {
        yPercent: el.classList.contains('lines') ? 20 : 40,
        ease: 'none',
        scrollTrigger: {
          trigger: 'body',
          start: 'top top',
          end: 'bottom bottom',
          scrub: true
        }
      });
    });
  }

  // Initialize animations on page load
  initializeAnimations();

  // Load dynamic content
  loadBannerImages();
  loadWebHubProducts();

  // Slider auto-cycle
  function initializeSlider() {
    const activeContent = document.querySelector('.hub-content.active');
    if (!activeContent) return;
    
    const slides = activeContent.querySelectorAll('.banner-slider .slide');
    if (slides.length === 0) return;
    
    let idx = 0;
    
    // Clear any existing interval
    if (window.sliderInterval) {
      clearInterval(window.sliderInterval);
    }
    
    window.sliderInterval = setInterval(() => {
      slides[idx].classList.remove('active');
      idx = (idx + 1) % slides.length;
      slides[idx].classList.add('active');
    }, 4000);
  }

  // Initialize slider
  initializeSlider();

  // Contact form
  const form = document.getElementById('contactForm');
  const msgBox = document.getElementById('responseMessage');
  if (form) {
    form.addEventListener('submit', async e => {
      e.preventDefault();
      msgBox.style.display = 'block';
      msgBox.textContent = '🚀 جاري حفظ الطلب...';
      const data = new FormData(form);
      
      // Add current hub info to form data
      const orderData = {
        name: data.get('name'),
        email: data.get('email'),
        phone: data.get('phone'),
        message: data.get('message'),
        hub: currentHub
      };
      
      try {
        // Save to Supabase database
        const result = await ordersAPI.createOrder(orderData);
        
        if (result.success) {
          // Show success message
          msgBox.textContent = '✅ تم إرسال طلبك بنجاح! سنتواصل معك قريباً';
          msgBox.style.background = '#d4edda';
          msgBox.style.color = '#155724';
          msgBox.style.border = '1px solid #c3e6cb';
          
          // Reset form
          form.reset();
        } else {
          throw new Error(result.error);
        }
      } catch (error) {
        console.error('Error saving order:', error);
        
        // Fallback to localStorage if Supabase fails
        const fallbackOrder = {
          id: Date.now().toString(),
          ...orderData,
          status: 'pending',
          created_at: new Date().toISOString()
        };
        
        const existingOrders = localStorage.getItem('customerOrders');
        const orders = existingOrders ? JSON.parse(existingOrders) : [];
        orders.push(fallbackOrder);
        localStorage.setItem('customerOrders', JSON.stringify(orders));
        
        msgBox.textContent = '✅ تم حفظ طلبك محلياً! سنتواصل معك قريباً';
        msgBox.style.background = '#fff3cd';
        msgBox.style.color = '#856404';
        msgBox.style.border = '1px solid #ffeaa7';
        
        form.reset();
      }
      
      // Hide message after 5 seconds
      setTimeout(() => {
        msgBox.style.display = 'none';
      }, 5000);
    });
  }

  // Back to top
  const back = document.getElementById('backToTop');
  window.addEventListener('scroll', () => {
    back.style.display = window.scrollY > 300 ? 'block' : 'none';
  });
  back.addEventListener('click', () => window.scrollTo({ top:0, behavior:'smooth' }));

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // Product card interactions
  document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-8px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0) scale(1)';
    });
  });

  // Load banner images from database
  async function loadBannerImages() {
    const result = await bannerAPI.getAllBanners();
    
    if (result.success && result.data.length > 0) {
      updateBannerSliders(result.data);
    }
  }

  // Update banner sliders with dynamic content
  function updateBannerSliders(banners) {
    const hrhubBanners = banners.filter(b => b.hub_type === 'hrhub');
    const webhubBanners = banners.filter(b => b.hub_type === 'webhub');
    
    // Update HR Hub slider
    const hrhubSlider = document.querySelector('#hrhub-content .banner-slider');
    if (hrhubSlider && hrhubBanners.length > 0) {
      hrhubSlider.innerHTML = hrhubBanners.map((banner, index) => `
        <div class="slide ${index === 0 ? 'active' : ''}">
          <img src="${banner.image_url}" alt="${banner.alt_text}">
        </div>
      `).join('');
    }
    
    // Update Web Hub slider (keep service cards for now)
    // You can modify this to use banner images if needed
  }

  // Load Web Hub products from database
  async function loadWebHubProducts() {
    const result = await productsAPI.getAllProducts();
    
    if (result.success && result.data.length > 0) {
      updateWebHubProducts(result.data);
    } else {
      // إضافة منتجات افتراضية إذا لم توجد منتجات في قاعدة البيانات
      const defaultProducts = [
        {
          id: 'default-1',
          name: 'موقع إلكتروني احترافي',
          description: 'تصميم وتطوير موقع إلكتروني متجاوب مع جميع الأجهزة',
          price: 2500,
          duration: '2-3 أسابيع',
          icon: 'fas fa-globe',
          features: ['تصميم متجاوب', 'لوحة إدارة', 'تحسين محركات البحث']
        },
        {
          id: 'default-2',
          name: 'متجر إلكتروني',
          description: 'متجر إلكتروني كامل مع نظام دفع وإدارة المنتجات',
          price: 4500,
          duration: '3-4 أسابيع',
          icon: 'fas fa-shopping-cart',
          features: ['نظام دفع آمن', 'إدارة المخزون', 'تقارير المبيعات']
        },
        {
          id: 'default-3',
          name: 'تطبيق جوال',
          description: 'تطبيق جوال لنظامي iOS و Android',
          price: 8000,
          duration: '4-6 أسابيع',
          icon: 'fas fa-mobile-alt',
          features: ['متوافق مع iOS و Android', 'واجهة سهلة الاستخدام', 'إشعارات فورية']
        }
      ];
      updateWebHubProducts(defaultProducts);
    }
  }

  // Update Web Hub products section
  function updateWebHubProducts(products) {
    const webhubContent = document.getElementById('webhub-content');
    if (!webhubContent) return;
    
    // Create products section if it doesn't exist
    let productsSection = webhubContent.querySelector('.products-section');
    if (!productsSection) {
      productsSection = document.createElement('section');
      productsSection.className = 'section products-section';
      productsSection.innerHTML = `
        <h2>منتجاتنا وخدماتنا</h2>
        <div class="products-grid" id="webhub-products-grid"></div>
      `;
      
      // Insert before coming soon section
      const comingSoonSection = webhubContent.querySelector('.coming-soon-section');
      if (comingSoonSection) {
        webhubContent.insertBefore(productsSection, comingSoonSection);
      } else {
        webhubContent.appendChild(productsSection);
      }
    }
    
    const productsGrid = productsSection.querySelector('.products-grid');
    if (!productsGrid) return;
    
    productsGrid.innerHTML = products.map(product => `
      <div class="product-card">
        <div class="product-icon">
          <i class="${product.icon}"></i>
        </div>
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        ${product.features && product.features.length > 0 ? `
          <div class="product-features">
            <h4>المميزات:</h4>
            <ul>
              ${product.features.map(feature => `<li>${feature}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
        <div class="product-details">
          <div class="duration">
            <i class="fas fa-clock"></i>
            ${product.duration}
          </div>
          <div class="price">${product.price} ريال</div>
        </div>
        <a href="#contact" class="product-btn">اطلب الآن</a>
      </div>
    `).join('');
    
    // Re-initialize animations for new products
    setTimeout(() => {
      gsap.utils.toArray('.product-card').forEach((card, index) => {
        gsap.fromTo(card, 
          { y: 60, opacity: 0, scale: 0.9 },
          {
            y: 0, 
            opacity: 1, 
            scale: 1,
            duration: 0.6,
            delay: index * 0.1,
            scrollTrigger: { 
              trigger: card, 
              start: 'top 85%',
              toggleActions: 'play none none reverse'
            }
          }
        );
      });
    }, 100);
  }

});
