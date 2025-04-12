let currentIndex = 0;
const images = document.querySelectorAll(".banner-images img");
const totalImages = images.length;
const bannerWrapper = document.querySelector(".banner-wrapper");
const arrowLeft = document.querySelector(".arrow-left");
const arrowRight = document.querySelector(".arrow-right");

function changeBannerImage() {
    currentIndex = (currentIndex + 1) % totalImages;
    updateBannerPosition();
}

// التفاعل مع السهم الأيسر
arrowLeft.addEventListener("click", () => {
    currentIndex = (currentIndex - 1 + totalImages) % totalImages;
    updateBannerPosition();
});

// التفاعل مع السهم الأيمن
arrowRight.addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % totalImages;
    updateBannerPosition();
});

// تحديث موقع الصور بناءً على عدد الصور
function updateBannerPosition() {
    const step = 100 / totalImages;
    bannerWrapper.style.transform = `translateX(-${currentIndex * step}%)`;
}

// تغيير الصور تلقائيًا كل 5 ثوانٍ
setInterval(changeBannerImage, 5000);

// إرسال النموذج
document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("contactForm");
    const endpoint = "https://hrhub-backend.onrender.com/send-email";
    const messageBox = document.getElementById("responseMessage");

    if (form) {
        form.addEventListener("submit", async function (e) {
            e.preventDefault();

            const formData = new FormData(form);
            const submitButton = form.querySelector("button[type='submit']");
            submitButton.disabled = true;

            messageBox.style.display = "block";
            messageBox.innerText = "🚀 جاري الإرسال...";
            messageBox.style.backgroundColor = "#fff3cd";
            messageBox.style.color = "#856404";

            try {
                const response = await fetch(endpoint, {
                    method: "POST",
                    body: formData,
                });

                const result = await response.json();

                if (response.ok) {
                    messageBox.innerText = "✅ تم الإرسال بنجاح!";
                    messageBox.style.backgroundColor = "#d4edda";
                    messageBox.style.color = "#155724";
                    form.reset();

                    setTimeout(() => {
                        location.reload();
                    }, 3000);
                } else {
                    messageBox.innerText = "❌ خطأ: " + (result?.error || "يرجى المحاولة لاحقاً");
                    messageBox.style.backgroundColor = "#f8d7da";
                    messageBox.style.color = "#721c24";
                }
            } catch (error) {
                messageBox.innerText = "❌ لم يتم الإرسال: " + error.message;
                messageBox.style.backgroundColor = "#f8d7da";
                messageBox.style.color = "#721c24";
            }

            submitButton.disabled = false;
        });
    }
});

// إظهار/إخفاء زر العودة للأعلى
const backToTop = document.getElementById("backToTop");
window.onscroll = function () {
    if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
        backToTop.style.display = "flex";
    } else {
        backToTop.style.display = "none";
    }
};

// التمرير لأعلى عند الضغط على الزر
backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
});

// إظهار أو إخفاء الزر عند التمرير
window.addEventListener("scroll", () => {
    const button = document.getElementById("backToTop");
    if (window.pageYOffset > 300) {
        button.style.display = "block";
    } else {
        button.style.display = "none";
    }
});

// التمرير لأعلى عند الضغط على الزر
document.getElementById("backToTop").addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
});
