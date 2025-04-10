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

// تحديث موقع الصور
function updateBannerPosition() {
    bannerWrapper.style.transform = `translateX(-${currentIndex * 33.33}%)`;
}

// تغيير الصور كل 5 ثوانٍ
setInterval(changeBannerImage, 5000);


document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("contactForm");
    const endpoint = "https://hrhub-backend.onrender.com/send-email";
    const messageBox = document.getElementById("responseMessage");

    if (form) {
        form.addEventListener("submit", async function (e) {
            e.preventDefault();

            const formData = new FormData(form);
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
        });
    }
});
