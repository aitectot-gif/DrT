(function () {
  "use strict";

  var header = document.querySelector(".site-header");
  var navToggle = document.querySelector(".nav-toggle");
  var mobileNav = document.querySelector(".mobile-nav");
  var mobileLinks = mobileNav ? mobileNav.querySelectorAll("a") : [];

  function openMenu() {
    mobileNav.classList.add("is-open");
    navToggle.setAttribute("aria-expanded", "true");
    document.body.classList.add("no-scroll");
  }

  function closeMenu() {
    mobileNav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("no-scroll");
  }

  if (navToggle && mobileNav) {
    navToggle.addEventListener("click", function () {
      var expanded = navToggle.getAttribute("aria-expanded") === "true";
      if (expanded) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    mobileLinks.forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        closeMenu();
      }
    });
  }

  function onScroll() {
    if (!header) return;
    if (window.scrollY > 6) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  var yearEl = document.getElementById("copyright-year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  var slider = document.querySelector(".hero-slider");
  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
    var current = 0;
    var timer = null;
    var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function goTo(index) {
      slides[current].classList.remove("is-active");
      if (dots[current]) {
        dots[current].classList.remove("is-active");
        dots[current].setAttribute("aria-selected", "false");
      }
      current = (index + slides.length) % slides.length;
      slides[current].classList.add("is-active");
      if (dots[current]) {
        dots[current].classList.add("is-active");
        dots[current].setAttribute("aria-selected", "true");
      }
    }

    function next() {
      goTo(current + 1);
    }

    function startAutoplay() {
      if (reduceMotion || slides.length < 2) return;
      stopAutoplay();
      timer = window.setInterval(next, 4000);
    }

    function stopAutoplay() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        goTo(i);
        startAutoplay();
      });
    });

    slider.addEventListener("mouseenter", stopAutoplay);
    slider.addEventListener("mouseleave", startAutoplay);
    slider.addEventListener("focusin", stopAutoplay);
    slider.addEventListener("focusout", startAutoplay);

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        stopAutoplay();
      } else {
        startAutoplay();
      }
    });

    startAutoplay();
  }

  var highlight = document.querySelector(".hero-highlight");
  if (highlight) {
    var items = Array.prototype.slice.call(highlight.querySelectorAll(".hero-highlight-item"));
    var active = 0;
    var highlightTimer = null;
    var highlightReduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function showNextHighlight() {
      items[active].classList.remove("is-active");
      active = (active + 1) % items.length;
      items[active].classList.add("is-active");
    }

    function startHighlight() {
      if (highlightReduceMotion || items.length < 2) return;
      stopHighlight();
      highlightTimer = window.setInterval(showNextHighlight, 3500);
    }

    function stopHighlight() {
      if (highlightTimer) {
        window.clearInterval(highlightTimer);
        highlightTimer = null;
      }
    }

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        stopHighlight();
      } else {
        startHighlight();
      }
    });
    window.addEventListener("pagehide", stopHighlight);

    startHighlight();
  }

  var gallery = document.querySelector(".gallery-carousel");
  if (gallery) {
    var track = gallery.querySelector(".gallery-track");
    var originals = Array.prototype.slice.call(track.children);
    var total = originals.length;
    var index = 0;
    var galleryTimer = null;
    var galleryReduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Append a copy of every photo so the strip can loop without a visible jump.
    originals.forEach(function (slide) {
      var clone = slide.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      clone.querySelector("img").setAttribute("alt", "");
      track.appendChild(clone);
    });

    function stepSize() {
      var gap = parseFloat(window.getComputedStyle(track).columnGap) || 0;
      return originals[0].getBoundingClientRect().width + gap;
    }

    function render(animate) {
      track.classList.toggle("no-transition", !animate);
      track.style.transform = "translateX(" + -index * stepSize() + "px)";
    }

    // Jump without animation between a slide and its identical clone.
    function snapTo(i) {
      index = i;
      render(false);
      void track.offsetWidth;
    }

    function slideBy(delta) {
      if (delta < 0 && index === 0) snapTo(total);
      if (delta > 0 && index >= total) snapTo(0);
      index += delta;
      render(true);
    }

    track.addEventListener("transitionend", function (e) {
      if (e.target === track && index >= total) snapTo(index - total);
    });

    function startGallery() {
      if (galleryReduceMotion) return;
      stopGallery();
      galleryTimer = window.setInterval(function () {
        slideBy(1);
      }, 3000);
    }

    function stopGallery() {
      if (galleryTimer) {
        window.clearInterval(galleryTimer);
        galleryTimer = null;
      }
    }

    gallery.querySelector(".gallery-prev").addEventListener("click", function () {
      slideBy(-1);
      startGallery();
    });
    gallery.querySelector(".gallery-next").addEventListener("click", function () {
      slideBy(1);
      startGallery();
    });

    var touchStartX = null;
    track.addEventListener("touchstart", function (e) {
      touchStartX = e.touches[0].clientX;
      stopGallery();
    }, { passive: true });
    track.addEventListener("touchend", function (e) {
      if (touchStartX === null) return;
      var dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 40) slideBy(dx < 0 ? 1 : -1);
      touchStartX = null;
      startGallery();
    });

    gallery.addEventListener("mouseenter", stopGallery);
    gallery.addEventListener("mouseleave", startGallery);
    gallery.addEventListener("focusin", stopGallery);
    gallery.addEventListener("focusout", startGallery);

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        stopGallery();
      } else {
        startGallery();
      }
    });

    window.addEventListener("resize", function () {
      render(false);
    });

    render(false);
    startGallery();
  }
})();
