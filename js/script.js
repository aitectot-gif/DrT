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

  var reviewsCarousel = document.querySelector(".reviews-carousel");
  if (reviewsCarousel) {
    var reviewsSection = document.getElementById("reviews");
    var reviewsTrack = reviewsCarousel.querySelector(".reviews-track");
    var reviewsPrev = reviewsCarousel.querySelector(".reviews-prev");
    var reviewsNext = reviewsCarousel.querySelector(".reviews-next");
    var reviewsDots = reviewsCarousel.querySelector(".reviews-dots");
    var reviewsEmpty = reviewsSection.querySelector(".reviews-empty");
    var reviewsSummary = reviewsSection.querySelector(".reviews-summary");
    var reviewsReduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var reviewSlides = [];
    var frames = [0];
    var frame = 0;
    var reviewsTimer = null;
    var reviewsLoaded = false;

    function el(tag, className, text) {
      var node = document.createElement(tag);
      if (className) node.className = className;
      if (text) node.textContent = text;
      return node;
    }

    function starsNode(target, rating) {
      var full = Math.round(rating);
      target.setAttribute("aria-label", "Rated " + rating + " out of 5");
      for (var i = 1; i <= 5; i++) {
        var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        var use = document.createElementNS("http://www.w3.org/2000/svg", "use");
        svg.setAttribute("aria-hidden", "true");
        if (i > full) svg.setAttribute("class", "is-empty");
        use.setAttribute("href", "#icon-star");
        svg.appendChild(use);
        target.appendChild(svg);
      }
      return target;
    }

    // Built with textContent only, so review text is shown exactly as written and never parsed as HTML.
    function reviewCard(review) {
      var card = el("article", "review-card");
      var head = el("div", "review-head");

      if (review.photoUri) {
        var img = el("img", "review-avatar");
        img.src = review.photoUri;
        img.alt = "";
        img.width = 44;
        img.height = 44;
        img.loading = "lazy";
        img.referrerPolicy = "no-referrer";
        head.appendChild(img);
      } else {
        head.appendChild(el("span", "review-avatar review-initial", review.author.charAt(0).toUpperCase()));
      }

      var who = el("div", "review-who");
      var author;
      if (review.authorUri) {
        author = el("a", "review-author", review.author);
        author.href = review.authorUri;
        author.target = "_blank";
        author.rel = "noopener";
      } else {
        author = el("span", "review-author", review.author);
      }
      who.appendChild(author);
      if (review.relativeTime) who.appendChild(el("span", "review-date", review.relativeTime));
      head.appendChild(who);
      head.insertAdjacentHTML("beforeend", '<svg class="google-g" viewBox="0 0 48 48" aria-hidden="true"><use href="#icon-google"/></svg>');
      card.appendChild(head);

      var stars = el("span", "review-stars");
      stars.setAttribute("role", "img");
      card.appendChild(starsNode(stars, review.rating));

      if (review.text) {
        card.appendChild(el("p", "review-text", review.text));
        var more = el("button", "review-more", "Read more");
        more.type = "button";
        more.hidden = true;
        more.setAttribute("aria-expanded", "false");
        more.addEventListener("click", function () {
          var expanded = card.classList.toggle("is-expanded");
          more.textContent = expanded ? "Show less" : "Read more";
          more.setAttribute("aria-expanded", String(expanded));
        });
        card.appendChild(more);
      }
      return card;
    }

    function updateReadMore() {
      reviewSlides.forEach(function (slide) {
        var card = slide.firstChild;
        var text = card.querySelector(".review-text");
        var more = card.querySelector(".review-more");
        if (!text || card.classList.contains("is-expanded")) return;
        more.hidden = text.scrollHeight <= text.clientHeight + 1;
      });
    }

    function perView() {
      return parseInt(window.getComputedStyle(reviewsCarousel).getPropertyValue("--per-view"), 10) || 1;
    }

    // Frames advance a full group at a time; the last frame is pulled back so it is never half empty.
    function buildFrames() {
      var n = reviewSlides.length;
      var pv = perView();
      frames = [];
      for (var start = 0; start < n; start += pv) {
        var pos = Math.min(start, Math.max(0, n - pv));
        if (frames.indexOf(pos) === -1) frames.push(pos);
      }
      if (!frames.length) frames = [0];
      frame = Math.min(frame, frames.length - 1);

      reviewsDots.innerHTML = "";
      frames.forEach(function (_, i) {
        var dot = el("button", "reviews-dot");
        dot.type = "button";
        dot.setAttribute("aria-label", "Show review set " + (i + 1) + " of " + frames.length);
        dot.addEventListener("click", function () {
          goToFrame(i);
          startReviews();
        });
        reviewsDots.appendChild(dot);
      });

      var multi = frames.length > 1;
      reviewsPrev.hidden = !multi;
      reviewsNext.hidden = !multi;
      reviewsDots.hidden = !multi;
    }

    function goToFrame(i) {
      frame = (i + frames.length) % frames.length;
      var first = frames[frame];
      var pv = perView();
      var step = reviewSlides.length ? reviewSlides[0].getBoundingClientRect().width + (parseFloat(window.getComputedStyle(reviewsTrack).columnGap) || 0) : 0;
      reviewsTrack.style.transform = "translateX(" + -first * step + "px)";

      // Off-screen cards are removed from tab order and the accessibility tree.
      reviewSlides.forEach(function (slide, idx) {
        var visible = idx >= first && idx < first + pv;
        slide.inert = !visible;
        slide.setAttribute("aria-hidden", String(!visible));
      });
      Array.prototype.forEach.call(reviewsDots.children, function (dot, idx) {
        dot.setAttribute("aria-current", idx === frame ? "true" : "false");
      });
    }

    function startReviews() {
      if (reviewsReduceMotion || frames.length < 2) return;
      stopReviews();
      reviewsTimer = window.setInterval(function () {
        goToFrame(frame + 1);
      }, 6000);
    }

    function stopReviews() {
      if (reviewsTimer) {
        window.clearInterval(reviewsTimer);
        reviewsTimer = null;
      }
    }

    function showReviewsUnavailable() {
      reviewsCarousel.hidden = true;
      reviewsCarousel.setAttribute("aria-busy", "false");
      reviewsEmpty.hidden = false;
      reviewsSection.querySelector(".reviews-footer").hidden = true;
    }

    function showReviews(data) {
      var reviews = (data && data.reviews) || [];
      if (!reviews.length) {
        showReviewsUnavailable();
        return;
      }

      reviewsTrack.innerHTML = "";
      reviewSlides = reviews.map(function (review, i) {
        var slide = el("li", "review-slide");
        slide.setAttribute("aria-roledescription", "slide");
        slide.setAttribute("aria-label", "Review " + (i + 1) + " of " + reviews.length);
        slide.appendChild(reviewCard(review));
        reviewsTrack.appendChild(slide);
        return slide;
      });
      reviewsCarousel.setAttribute("aria-busy", "false");

      var place = data.place || {};
      if (place.rating && place.userRatingCount) {
        reviewsSummary.querySelector(".reviews-summary-score").textContent = place.rating.toFixed(1);
        starsNode(reviewsSummary.querySelector(".review-stars"), place.rating);
        reviewsSummary.querySelector(".reviews-summary-count").textContent =
          "Based on " + place.userRatingCount + " Google review" + (place.userRatingCount === 1 ? "" : "s");
        reviewsSummary.hidden = false;
      }

      buildFrames();
      goToFrame(0);
      updateReadMore();
      startReviews();
    }

    function loadReviews() {
      if (reviewsLoaded) return;
      reviewsLoaded = true;
      var controller = window.AbortController ? new AbortController() : null;
      var timeout = window.setTimeout(function () {
        if (controller) controller.abort();
      }, 10000);

      fetch(reviewsCarousel.getAttribute("data-endpoint"), controller ? { signal: controller.signal } : undefined)
        .then(function (res) {
          return res.ok ? res.json() : null;
        })
        .then(showReviews)
        .catch(showReviewsUnavailable)
        .then(function () {
          window.clearTimeout(timeout);
        });
    }

    reviewsPrev.addEventListener("click", function () {
      goToFrame(frame - 1);
      startReviews();
    });
    reviewsNext.addEventListener("click", function () {
      goToFrame(frame + 1);
      startReviews();
    });

    reviewsCarousel.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") goToFrame(frame - 1);
      if (e.key === "ArrowRight") goToFrame(frame + 1);
    });

    var reviewsTouchX = null;
    reviewsTrack.addEventListener("touchstart", function (e) {
      reviewsTouchX = e.touches[0].clientX;
      stopReviews();
    }, { passive: true });
    reviewsTrack.addEventListener("touchend", function (e) {
      if (reviewsTouchX === null) return;
      var dx = e.changedTouches[0].clientX - reviewsTouchX;
      if (Math.abs(dx) > 40) goToFrame(frame + (dx < 0 ? 1 : -1));
      reviewsTouchX = null;
      startReviews();
    });

    reviewsCarousel.addEventListener("mouseenter", stopReviews);
    reviewsCarousel.addEventListener("mouseleave", startReviews);
    reviewsCarousel.addEventListener("focusin", stopReviews);
    reviewsCarousel.addEventListener("focusout", startReviews);

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        stopReviews();
      } else {
        startReviews();
      }
    });

    var reviewsResizeTimer = null;
    window.addEventListener("resize", function () {
      window.clearTimeout(reviewsResizeTimer);
      reviewsResizeTimer = window.setTimeout(function () {
        if (!reviewSlides.length) return;
        buildFrames();
        goToFrame(frame);
        updateReadMore();
      }, 150);
    });

    // Fetch only as the section nears the viewport so the hero loads first.
    if ("IntersectionObserver" in window) {
      var reviewsObserver = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) {
          reviewsObserver.disconnect();
          loadReviews();
        }
      }, { rootMargin: "400px 0px" });
      reviewsObserver.observe(reviewsSection);
      // Safety net in case the observer never fires; still well after the hero has loaded.
      window.addEventListener("load", function () {
        window.setTimeout(loadReviews, 3000);
      });
    } else {
      loadReviews();
    }
  }
})();
