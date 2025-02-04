document.addEventListener("DOMContentLoaded", () => {
    const nav = document.querySelector(".nav"),
        navOpenBtn = document.querySelector(".navOpenBtn"),
        navCloseBtn = document.querySelector(".navCloseBtn");

    if (navOpenBtn) {
        navOpenBtn.addEventListener("click", () => {
            nav.classList.add("openNav");
        });
    }

    if (navCloseBtn) {
        navCloseBtn.addEventListener("click", () => {
            nav.classList.remove("openNav");
        });
    }
});
