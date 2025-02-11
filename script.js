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
