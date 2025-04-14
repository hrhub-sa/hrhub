// كشف لغة المتصفح والتحويل التلقائي لأول زيارة
if (!localStorage.getItem("preferredLanguage")) {
    const userLang = navigator.language || navigator.userLanguage;

    if (userLang.startsWith("en")) {
        if (!window.location.href.includes("index-en.html")) {
            window.location.href = "index-en.html";
        }
    } else {
        if (window.location.href.includes("index-en.html")) {
            window.location.href = "index.html";
        }
    }

    localStorage.setItem("preferredLanguage", "set");
}

document.addEventListener("DOMContentLoaded", function () {
  // ===== سلايدر الشعارات =====
  const slides = document.querySelectorAll(".banner-slider .slide");
  let current = 0;
  let startX = 0;

  function showSlide(index) {
    slides.forEach((slide, i) => {
      slide.classList.toggle("active", i === index);
    });
  }

  setInterval(() => {
    current = (current + 1) % slides.length;
    showSlide(current);
  }, 5000);

  const slider = document.querySelector(".banner-slider");
  if (slider) {
    slider.addEventListener("touchstart", (e) => {
      startX = e.touches[0].clientX;
    });

    slider.addEventListener("touchend", (e) => {
      const endX = e.changedTouches[0].clientX;
      const diffX = startX - endX;

      if (Math.abs(diffX) > 50) {
        current = diffX > 0
          ? (current + 1) % slides.length
          : (current - 1 + slides.length) % slides.length;
        showSlide(current);
      }
    });
  }

  // ===== نموذج الاتصال =====
  const form = document.getElementById("contactForm");
  const endpoint = "https://hrhub-backend.onrender.com/send-email";
  const messageBox = document.getElementById("responseMessage");

  if (form) {
    form.addEventListener("submit", async function (e) {
      e.preventDefault();

      const formData = new FormData(form);
      const submitButton = form.querySelector("button[type='submit']");
      submitButton.disabled = true;

      const isArabic = document.documentElement.lang === "ar";

      messageBox.style.display = "block";
      messageBox.innerText = isArabic
        ? "🚀 جاري الإرسال..."
        : "🚀 Sending...";
      messageBox.style.backgroundColor = "#fff3cd";
      messageBox.style.color = "#856404";

      try {
        const response = await fetch(endpoint, {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        if (response.ok) {
          messageBox.innerText = isArabic
            ? "✅ تم الإرسال بنجاح!"
            : "✅ Sent successfully!";
          messageBox.style.backgroundColor = "#d4edda";
          messageBox.style.color = "#155724";
          form.reset();

          setTimeout(() => {
            location.reload();
          }, 3000);
        } else {
          messageBox.innerText = isArabic
            ? "❌ خطأ: " + (result?.error || "يرجى المحاولة لاحقاً")
            : "❌ Error: " + (result?.error || "Please try again later");
          messageBox.style.backgroundColor = "#f8d7da";
          messageBox.style.color = "#721c24";
        }
      } catch (error) {
        messageBox.innerText = isArabic
          ? "❌ لم يتم الإرسال: " + error.message
          : "❌ Failed to send: " + error.message;
        messageBox.style.backgroundColor = "#f8d7da";
        messageBox.style.color = "#721c24";
      }

      submitButton.disabled = false;
    });
  }

  // ===== زر العودة للأعلى =====
  const backToTop = document.getElementById("backToTop");
  window.addEventListener("scroll", function () {
    if (window.scrollY > 300) {
      backToTop.style.display = "flex";
    } else {
      backToTop.style.display = "none";
    }
  });

  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});
