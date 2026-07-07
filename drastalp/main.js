// ドラスタ自動車教習所 LP — interactions
(function () {
  'use strict';

  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- Header shrink + scroll progress bar ----
  var hdr = document.getElementById('hdr');
  var prog = document.getElementById('scrollProg');
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (hdr) hdr.classList.toggle('shrunk', y > 20);
    if (prog) {
      var h = document.documentElement;
      var max = (h.scrollHeight - h.clientHeight) || 1;
      prog.style.width = Math.min(100, (y / max) * 100) + '%';
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  onScroll();

  // ---- Scroll-reveal for sections ----
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  // ---- Count-up animation for prices ----
  var counters = document.querySelectorAll('.num[data-count]');
  function animateCount(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    if (isNaN(target)) return;
    if (reduceMotion) { el.textContent = target.toLocaleString('ja-JP'); return; }
    var start = null, dur = 1400;
    function tick(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      el.textContent = Math.round(target * eased).toLocaleString('ja-JP');
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = target.toLocaleString('ja-JP');
    }
    requestAnimationFrame(tick);
  }
  if ('IntersectionObserver' in window && counters.length) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { animateCount(e.target); cio.unobserve(e.target); }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { cio.observe(el); });
  } else {
    counters.forEach(function (el) {
      var t = parseInt(el.getAttribute('data-count'), 10);
      if (!isNaN(t)) el.textContent = t.toLocaleString('ja-JP');
    });
  }

  // ---- Pointer parallax on hero blobs ----
  var heroMedia = document.getElementById('heroMedia');
  if (heroMedia && !reduceMotion && window.matchMedia('(pointer:fine)').matches) {
    var blobs = heroMedia.querySelectorAll('.hero-blob');
    heroMedia.addEventListener('mousemove', function (ev) {
      var r = heroMedia.getBoundingClientRect();
      var cx = (ev.clientX - r.left) / r.width - 0.5;
      var cy = (ev.clientY - r.top) / r.height - 0.5;
      blobs.forEach(function (b, i) {
        var depth = (i + 1) * 10;
        b.style.transform = 'translate(' + (cx * depth) + 'px,' + (cy * depth) + 'px)';
      });
    });
    heroMedia.addEventListener('mouseleave', function () {
      blobs.forEach(function (b) { b.style.transform = ''; });
    });
  }

  // ---- Subtle 3D tilt on reason cards ----
  if (!reduceMotion && window.matchMedia('(pointer:fine)').matches) {
    document.querySelectorAll('.tilt').forEach(function (card) {
      card.addEventListener('mousemove', function (ev) {
        var r = card.getBoundingClientRect();
        var px = (ev.clientX - r.left) / r.width - 0.5;
        var py = (ev.clientY - r.top) / r.height - 0.5;
        card.style.transform =
          'translateY(-8px) rotateX(' + (-py * 8) + 'deg) rotateY(' + (px * 8) + 'deg)';
      });
      card.addEventListener('mouseleave', function () { card.style.transform = ''; });
    });
  }

  // ---- FAQ accordion: keep only one open at a time ----
  var faqs = document.querySelectorAll('.faq');
  faqs.forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (d.open) {
        faqs.forEach(function (other) {
          if (other !== d) other.open = false;
        });
      }
    });
  });
})();
