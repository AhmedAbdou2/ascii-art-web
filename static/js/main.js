document.addEventListener("DOMContentLoaded", function () {
  const currentPath = window.location.pathname;

  const navLinks = document.querySelectorAll(".nav-menu a");
  navLinks.forEach((link) => {
    const href = link.getAttribute("href");

    if (
      (currentPath === "/" && href === "/") ||
      (currentPath !== "/" && href === currentPath)
    ) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });

  const page = document.querySelector(".page");
  if (page) {
    page.classList.add("active");
  }

  const hamburger = document.querySelector(".hamburger");
  const navMenu = document.querySelector(".nav-menu");

  if (hamburger && navMenu) {
    hamburger.addEventListener("click", function () {
      navMenu.classList.toggle("active");
      hamburger.classList.toggle("active");
    });
  }
});
