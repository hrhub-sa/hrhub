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
  const body = document.body;

  // Initialize with HR Hub active
  let currentHub = 'hrhub';

  function switchToHub(hubType) {
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

  // Event listeners for hub switching
  hrhubBtn.addEventListener('click', () => switchToHub('hrhub'));
  webhubBtn.addEventListener('click', () => switchToHub('webhub'));

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
      msgBox.textContent = '🚀 Sending...';
      const data = new FormData(form);
      
      // Add current hub info to form data
      data.append('hub', currentHub);
      
      try {
        const res = await fetch('https://hrhub-backend.onrender.com/send-email', { method:'POST', body:data });
        const json = await res.json();
        msgBox.textContent = res.ok ? '✅ Sent successfully!' : `❌ Error: ${json.error||'Try later'}`;
        msgBox.style.background = res.ok ? '#d4edda' : '#f8d7da';
        
        if (res.ok) {
          form.reset();
        }
      } catch (err) {
        msgBox.textContent = `❌ Failed: ${err.message}`;
        msgBox.style.background = '#f8d7da';
      }
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
});