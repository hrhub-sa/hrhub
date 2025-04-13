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

    // تحميل الصور أولاً ثم تشغيل البنر
    function onImagesLoaded(callback) {
        const imgs = document.querySelectorAll(".banner-images img");
        let loadedCount = 0;
        imgs.forEach((img) => {
            if (img.complete) {
                loadedCount++;
            } else {
                img.addEventListener("load", () => {
                    loadedCount++;
                    if (loadedCount === imgs.length) callback();
                });
            }
        });
        if (loadedCount === imgs.length) callback();
    }

    onImagesLoaded(() => {
        const images = document.querySelectorAll(".banner-images img");
        const totalImages = images.length;
        const bannerWrapper = document.querySelector(".banner-wrapper");
        const arrowLeft = document.querySelector(".arrow-left");
        const arrowRight = document.querySelector(".arrow-right");
        let currentIndex = 0;

        function updateBannerPosition() {
            const imageWidth = images[0].clientWidth;
            bannerWrapper.style.transform = `translateX(-${currentIndex * imageWidth}px)`;
        }

        arrowLeft.addEventListener("click", () => {
            currentIndex = (currentIndex - 1 + totalImages) % totalImages;
            updateBannerPosition();
        });

        arrowRight.addEventListener("click", () => {
            currentIndex = (currentIndex + 1) % totalImages;
            updateBannerPosition();
        });

        setInterval(() => {
            currentIndex = (currentIndex + 1) % totalImages;
            updateBannerPosition();
        }, 5000);
    });

    // إرسال النموذج
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

    // زر العودة للأعلى
    const backToTop = document.getElementById("backToTop");
    window.onscroll = function () {
        if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
            backToTop.style.display = "flex";
        } else {
            backToTop.style.display = "none";
        }
    };

    backToTop.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
});
