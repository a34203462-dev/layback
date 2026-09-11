(function () {
  const VIEWPORT_DESKTOP = 1512;
  const VIEWPORT_MOBILE = 393;
  const SIDE = 820;
  const CENTER = 1120;
  const GAP = 16;
  const PHOTO_MOBILE = 349;
  const GAP_MOBILE = 8;
  const HERO_DESKTOP = 982;
  const HERO_MOBILE = 852;
  const MOBILE_BREAK = 768;

  function isMobile() {
    return document.documentElement.classList.contains("is-mobile");
  }

  function viewport() {
    return isMobile() ? VIEWPORT_MOBILE : VIEWPORT_DESKTOP;
  }

  function viewHeight() {
    return window.visualViewport ? window.visualViewport.height : window.innerHeight;
  }

  function applyScale() {
    var width = window.innerWidth;
    var height = viewHeight();
    if (!width || !height) return;
    var q = location.search;
    var forcedMobile = /\bmobile\b/.test(q);
    var forcedDesktop = /\bdesktop\b/.test(q);
    var mobile = forcedMobile ? true : forcedDesktop ? false : width < MOBILE_BREAK;
    var vp = mobile ? VIEWPORT_MOBILE : VIEWPORT_DESKTOP;
    var heroDesign = mobile ? HERO_MOBILE : HERO_DESKTOP;
    var zoom = width / vp;
    var heroH = height / zoom;
    document.documentElement.classList.toggle("is-mobile", mobile);
    document.documentElement.style.zoom = String(zoom);
    document.documentElement.style.setProperty("--page-zoom", String(zoom));
    document.documentElement.style.setProperty("--hero-h", heroH + "px");
    document.documentElement.style.setProperty("--hero-shift", (heroH - heroDesign) + "px");
    document.documentElement.style.setProperty("--hero-y", String(heroH / heroDesign));
  }

  function initScale() {
    applyScale();
    window.addEventListener("resize", applyScale);
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", applyScale);
    }
  }

  function initTextReveal() {
    var section = document.querySelector(".services");
    var title = document.querySelector(".services__title");
    var button = document.querySelector(".services .link-arrow");
    if (!section || !title) return function () {};

    function splitNode(node) {
      if (node.nodeType === Node.TEXT_NODE) {
        var text = node.textContent;
        if (!text) return;
        var frag = document.createDocumentFragment();
        text.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) {
            var space = document.createElement("span");
            space.setAttribute("data-reveal", "");
            space.innerHTML = "&nbsp;";
            frag.appendChild(space);
            return;
          }
          var wrap = document.createElement("span");
          wrap.className = "word-wrapper";
          Array.from(part).forEach(function (ch) {
            var letter = document.createElement("span");
            letter.setAttribute("data-reveal", "");
            letter.textContent = ch;
            wrap.appendChild(letter);
          });
          frag.appendChild(wrap);
        });
        node.parentNode.replaceChild(frag, node);
      } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName !== "BR") {
        Array.from(node.childNodes).forEach(splitNode);
      }
    }

    Array.from(title.childNodes).forEach(splitNode);
    var spans = Array.from(title.querySelectorAll("[data-reveal]"));
    if (button) spans.push(button);

    return function reveal() {
      var rect = section.getBoundingClientRect();
      var vh = window.innerHeight;
      var start = vh * 0.8;
      var end = -vh * 0.2;
      var i;
      if (rect.top <= start && rect.bottom >= end) {
        var progress = (start - rect.top) / (start - end);
        var shown = Math.floor(spans.length * Math.min(1, Math.max(0, progress)));
        for (i = 0; i < spans.length; i += 1) {
          spans[i].classList.toggle("is-on", i < shown);
        }
      } else if (rect.top > start) {
        for (i = 0; i < spans.length; i += 1) spans[i].classList.remove("is-on");
      } else {
        for (i = 0; i < spans.length; i += 1) spans[i].classList.add("is-on");
      }
    };
  }

  function smoothstep(t) {
    t = Math.min(1, Math.max(0, t));
    return t * t * (3 - 2 * t);
  }

  function initHeader() {
    var header = document.querySelector(".js-header");
    var lightTrigger = document.querySelector(".about .link-arrow");
    var about = document.querySelector(".about");
    var amenities = document.querySelector(".amenities");
    var heroCta = document.querySelector(".hero__cta");
    var pageCta = document.querySelector(".cta");
    var riseBlocks = document.querySelectorAll(".about, .amenities, .services, .location");
    var reveal = initTextReveal();
    var lastY = window.scrollY;
    var ticking = false;
    var parallax = 0.025;
    var maxRise = 16;
    var wasLight = false;
    var root = document.documentElement;
    var body = document.body;

    function setPagePaint(from, mid, to, angle, size, pos) {
      var targets = [root, body];
      var i;
      for (i = 0; i < targets.length; i += 1) {
        targets[i].style.setProperty("--page-from", from);
        targets[i].style.setProperty("--page-mid", mid);
        targets[i].style.setProperty("--page-to", to);
        targets[i].style.setProperty("--page-angle", angle);
        targets[i].style.setProperty("--page-size", size);
        targets[i].style.setProperty("--page-pos", pos);
      }
    }

    function paintShimmer(t) {
      setPagePaint(
        "#212121",
        "#2c2c2c",
        "#403f3f",
        (95 + t * 85) + "deg",
        "200% 200%",
        (t * 60) + "% " + (t * 70) + "%"
      );
    }

    function update() {
      var y = window.scrollY;
      if (header) {
        header.classList.toggle("is-hidden", y > lastY && y > 80);
      }

      var i;
      var vh = window.innerHeight;
      for (i = 0; i < riseBlocks.length; i += 1) {
        var el = riseBlocks[i];
        var traveled = Math.max(0, y + vh - el.offsetTop);
        var shift = Math.min(traveled * parallax, maxRise);
        el.style.setProperty("--rise", -shift + "px");
      }

      var textY = 0;
      if (!isMobile() && y > 0) {
        textY = -y * 0.16;
      }
      root.style.setProperty("--hero-text-y", textY + "px");

      var isLight = false;
      var viewH = viewHeight();
      if (isMobile() && amenities && lightTrigger) {
        isLight =
          lightTrigger.getBoundingClientRect().top <= viewH * 0.42 ||
          amenities.getBoundingClientRect().top <= viewH * 0.92;
      } else if (lightTrigger) {
        isLight = lightTrigger.getBoundingClientRect().top <= window.innerHeight / 2;
      }

      if (isLight) {
        if (!wasLight) {
          setPagePaint("#fff", "#fff", "#fff", "180deg", "100% 100%", "0 0");
        }
      } else if (about) {
        var aboutTop = about.getBoundingClientRect().top;
        var span = Math.max(about.offsetHeight * 0.45, vh * 1.1);
        var t = smoothstep((vh * 0.55 - aboutTop) / span);
        paintShimmer(t);
      }

      root.classList.toggle("is-light", isLight);
      body.classList.toggle("is-light", isLight);
      if (header) header.classList.toggle("is-dark", isLight);
      wasLight = isLight;

      if (isMobile() && heroCta && pageCta) {
        heroCta.classList.toggle(
          "is-hidden",
          pageCta.getBoundingClientRect().top <= viewH - 24
        );
      }

      reveal();
      lastY = y;
      ticking = false;
    }

    update();
    window.addEventListener("scroll", function () {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });
    window.addEventListener("resize", function () {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    });
  }

  function cloneSet(items, track, prepend) {
    var frag = document.createDocumentFragment();
    items.forEach(function (item) {
      frag.appendChild(item.cloneNode(true));
    });
    if (prepend) track.insertBefore(frag, track.firstChild);
    else track.appendChild(frag);
  }

  function initLoopedTrack(options) {
    var track = document.getElementById(options.trackId);
    if (!track) return;
    var originals = Array.from(track.querySelectorAll(options.itemSelector));
    if (!originals.length) return;

    cloneSet(originals, track, false);
    cloneSet(originals, track, true);

    var items = Array.from(track.querySelectorAll(options.itemSelector));
    var count = originals.length;
    var start = originals.findIndex(function (item) {
      return item.classList.contains(options.activeClass);
    });
    if (typeof options.startIndex === "number") start = options.startIndex;
    var index = count + (start >= 0 ? start : Math.floor(count / 2));
    var animating = false;
    var jumpTimer;

    function apply(activeIndex, animate) {
      index = activeIndex;
      if (!animate) {
        track.classList.add("is-snapping");
        track.style.transition = "none";
        options.applyClasses(items, index);
        track.style.transform = "translateX(" + options.centerOffset(index) + "px)";
        void track.offsetWidth;
        track.classList.remove("is-snapping");
        track.style.transition = "";
        return;
      }
      options.applyClasses(items, index);
      track.style.transition = "transform 0.6s";
      track.style.transform = "translateX(" + options.centerOffset(index) + "px)";
    }

    function jumpIfNeeded() {
      if (index < count) apply(index + count, false);
      else if (index >= count * 2) apply(index - count, false);
      animating = false;
    }

    function go(delta) {
      if (animating) return;
      animating = true;
      apply(index + delta, true);
      clearTimeout(jumpTimer);
      jumpTimer = setTimeout(jumpIfNeeded, 700);
    }

    track.addEventListener("transitionend", function (event) {
      if (event.target !== track || event.propertyName !== "transform") return;
      clearTimeout(jumpTimer);
      jumpIfNeeded();
    });

    apply(index, false);
    if (options.prev) options.prev.addEventListener("click", function () { go(-1); });
    if (options.next) options.next.addEventListener("click", function () { go(1); });

    var pointerX = 0;
    function onPointerDown(event) {
      pointerX = event.clientX;
    }
    function onPointerUp(event) {
      var dx = event.clientX - pointerX;
      if (dx > 40) go(-1);
      else if (dx < -40) go(1);
    }
    track.addEventListener("pointerdown", onPointerDown);
    track.addEventListener("pointerup", onPointerUp);
  }

  function initMobileSwiper(options) {
    var viewport = document.querySelector(options.viewport);
    var track = document.querySelector(options.track);
    if (!viewport || !track || typeof Swiper === "undefined") return;
    viewport.classList.add("swiper");
    track.classList.add("swiper-wrapper");
    Array.from(track.querySelectorAll(options.slide)).forEach(function (slide) {
      slide.classList.add("swiper-slide");
      var img = slide.querySelector("img");
      if (img) {
        img.setAttribute("draggable", "false");
        img.style.pointerEvents = "none";
      }
    });
    return new Swiper(viewport, {
      loop: true,
      speed: 500,
      slidesPerView: "auto",
      spaceBetween: options.spaceBetween,
      slidesOffsetBefore: options.offset || 0,
      slidesOffsetAfter: options.offset || 0,
      centeredSlides: !!options.centered,
      allowTouchMove: true,
      simulateTouch: true,
      grabCursor: true,
      threshold: 8,
      navigation: options.prev && options.next ? {
        prevEl: options.prev,
        nextEl: options.next
      } : undefined
    });
  }

  function initMobileGallery() {
    var view = document.querySelector(".gallery__viewport");
    var track = document.getElementById("galleryTrack");
    if (!view || !track) return;

    var originals = Array.from(track.querySelectorAll(".gallery__photo"));
    var count = originals.length;
    if (!count) return;

    cloneSet(originals, track, false);
    cloneSet(originals, track, true);

    var slide = PHOTO_MOBILE + GAP_MOBILE;
    var startX = 8 + count * slide;
    var cycle = count * slide;
    var jumping = false;

    function jumpTo(x) {
      jumping = true;
      var snap = view.style.scrollSnapType;
      view.style.scrollSnapType = "none";
      view.scrollLeft = x;
      view.style.scrollSnapType = snap || "";
      requestAnimationFrame(function () {
        jumping = false;
      });
    }

    var wrapTimer;

    function wrap() {
      if (jumping) return;
      var x = view.scrollLeft;
      if (x < startX - slide * 0.4) jumpTo(x + cycle);
      else if (x >= startX + cycle - slide * 0.4) jumpTo(x - cycle);
    }

    jumpTo(startX);
    view.addEventListener("scroll", function () {
      clearTimeout(wrapTimer);
      wrapTimer = setTimeout(wrap, 80);
    }, { passive: true });
    view.addEventListener("scrollend", wrap);
  }

  function initGallery() {
    if (isMobile()) {
      var track = document.getElementById("galleryTrack");
      if (track) {
        track.style.setProperty("transform", "none", "important");
        track.style.setProperty("transition", "none", "important");
      }
      try {
        initMobileGallery();
      } catch (err) {}
      return;
    }
    initLoopedTrack({
      trackId: "galleryTrack",
      itemSelector: ".gallery__photo",
      activeClass: "is-center",
      prev: document.querySelector(".gallery__arrow--prev"),
      next: document.querySelector(".gallery__arrow--next"),
      applyClasses: function (photos, index) {
        photos.forEach(function (photo, i) {
          photo.classList.toggle("is-center", i === index);
        });
      },
      centerOffset: function (activeIndex) {
        var x = 0;
        for (var i = 0; i < activeIndex; i += 1) x += SIDE + GAP;
        return viewport() / 2 - (x + CENTER / 2);
      }
    });
  }

  var REVIEW_LARGE = 304;
  var REVIEW_SMALL = 244;
  var REVIEW_GAP = 32;
  var REVIEW_EDGE = 72;
  var REVIEW_LARGE_M = 242;
  var REVIEW_SMALL_M = 175;
  var REVIEW_GAP_M = 16;
  var REVIEW_EDGE_M = 16;

  function reviewIsLarge(i, activeIndex) {
    if (isMobile()) return i === activeIndex;
    return Math.abs(i - activeIndex) <= 1;
  }

  function reviewGap() {
    return isMobile() ? REVIEW_GAP_M : REVIEW_GAP;
  }

  function reviewEdge() {
    return isMobile() ? REVIEW_EDGE_M : REVIEW_EDGE;
  }

  function reviewLarge() {
    return isMobile() ? REVIEW_LARGE_M : REVIEW_LARGE;
  }

  function reviewSmall() {
    return isMobile() ? REVIEW_SMALL_M : REVIEW_SMALL;
  }

  function reviewGapAfter(i, activeIndex) {
    return reviewIsLarge(i, activeIndex) !== reviewIsLarge(i + 1, activeIndex)
      ? reviewEdge()
      : reviewGap();
  }

  function initReviews() {
    initLoopedTrack({
      trackId: "reviewsTrack",
      itemSelector: ".reviews-slide",
      activeClass: "is-active",
      prev: isMobile() ? null : document.querySelector(".reviews__arrow--prev"),
      next: isMobile() ? null : document.querySelector(".reviews__arrow--next"),
      applyClasses: function (slides, index) {
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === index);
          slide.classList.toggle("is-prev", i === index - 1);
          slide.classList.toggle("is-next", i === index + 1);
          slide.style.marginRight = reviewGapAfter(i, index) + "px";
        });
      },
      centerOffset: function (activeIndex) {
        var large = reviewLarge();
        var x = 0;
        for (var i = 0; i < activeIndex; i += 1) {
          x += (reviewIsLarge(i, activeIndex) ? large : reviewSmall()) + reviewGapAfter(i, activeIndex);
        }
        return viewport() / 2 - (x + large / 2);
      }
    });
  }

  function duplicateSlides(el, minCount) {
    var wrapper = el.querySelector(".swiper-wrapper");
    if (!wrapper) return 0;
    var original = Array.from(wrapper.querySelectorAll(".swiper-slide"));
    var count = original.length;
    if (count === 0) return 0;
    var copies = minCount ? Math.ceil(minCount / count) - 1 : 2;
    for (var i = 0; i < copies; i += 1) {
      original.forEach(function (slide) {
        wrapper.appendChild(slide.cloneNode(true));
      });
    }
    return count;
  }

  function initOffers() {
    var el = document.querySelector(".js-offers-slider");
    if (!el || typeof Swiper === "undefined") return;
    duplicateSlides(el, 8);
    new Swiper(".js-offers-slider", {
      loop: true,
      speed: 300,
      slidesPerView: "auto",
      spaceBetween: isMobile() ? 16 : 24,
      slidesOffsetBefore: isMobile() ? 16 : 17,
      allowTouchMove: true,
      simulateTouch: true,
      autoplay: {
        delay: 2500,
        disableOnInteraction: false,
        pauseOnMouseEnter: true
      },
      pagination: {
        el: ".sales__dots"
      }
    });
  }

  function initMaps() {
    document.querySelectorAll(".footer__map, .location__map").forEach(function (block) {
      var iframe = block.querySelector("iframe.js-map-frame");
      var buttons = block.querySelectorAll(".js-move-map-btn");
      if (!iframe || !buttons.length) return;
      buttons.forEach(function (btn) {
        btn.addEventListener("click", function () {
          buttons.forEach(function (item) { item.classList.remove("is-active"); });
          btn.classList.add("is-active");
          if (btn.dataset.map) iframe.src = btn.dataset.map;
        });
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initScale();
    initHeader();
    initGallery();
    initReviews();
    initOffers();
    initMaps();
  });
})();
