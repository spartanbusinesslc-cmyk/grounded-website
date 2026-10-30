/* ============================================
   EARTHED — Instagram reels
   ---------------------------------------------
   To add a reel: put the compressed video and a
   poster image in assets/reels/ and add a line to
   REELS below. Leave out "video" to show only the
   poster (used while setting up).
   ============================================ */
(function () {
  var REELS = window.EARTHED_REELS || [];
  if (!REELS.length) return;

  var saveData = !!(navigator.connection && navigator.connection.saveData);
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var autoplayOK = !saveData && !reduceMotion;

  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  // ---------- pop-up player ----------
  var modal = null, current = 0, lastFocus = null;
  function buildModal() {
    modal = el('div', 'reel-modal');
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Instagram reel');
    modal.innerHTML =
      '<div class="reel-modal-box">' +
        '<button type="button" class="reel-modal-close" aria-label="Close">&times;</button>' +
        '<div class="reel-stage"></div>' +
        '<div class="reel-meta"><span class="reel-caption"></span><a class="reel-link" target="_blank" rel="noopener">View on Instagram</a></div>' +
        '<button type="button" class="reel-nav prev" aria-label="Previous reel">&#8592;</button>' +
        '<button type="button" class="reel-nav next" aria-label="Next reel">&#8594;</button>' +
      '</div>';
    document.body.appendChild(modal);
    modal.addEventListener('click', function (e) { if (e.target === modal || e.target.closest('.reel-modal-close')) closeModal(); });
    modal.querySelector('.prev').addEventListener('click', function () { show(current - 1); });
    modal.querySelector('.next').addEventListener('click', function () { show(current + 1); });
    document.addEventListener('keydown', function (e) {
      if (!modal.classList.contains('open')) return;
      if (e.key === 'Escape') closeModal();
      if (e.key === 'ArrowLeft') show(current - 1);
      if (e.key === 'ArrowRight') show(current + 1);
    });
  }
  function show(i) {
    current = (i + REELS.length) % REELS.length;
    var r = REELS[current];
    var stage = modal.querySelector('.reel-stage');
    stage.innerHTML = '';
    if (r.video) {
      var v = el('video');
      v.src = r.video; v.poster = r.poster || ''; v.controls = true; v.autoplay = true; v.loop = true; v.playsInline = true;
      stage.appendChild(v);
      var p = v.play(); if (p && p.catch) p.catch(function () {});
    } else {
      stage.innerHTML = '<img src="' + esc(r.poster) + '" alt="">';
      stage.appendChild(el('div', 'reel-demo-note', 'Preview only: video not added yet'));
    }
    modal.querySelector('.reel-caption').textContent = r.caption || '';
    var a = modal.querySelector('.reel-link');
    a.hidden = !r.url; if (r.url) a.href = r.url;
  }
  function openModal(i, trigger) {
    if (!modal) buildModal();
    lastFocus = trigger || null;
    show(i);
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    modal.querySelector('.reel-modal-close').focus();
  }
  function closeModal() {
    modal.classList.remove('open');
    var v = modal.querySelector('video'); if (v) v.pause();
    modal.querySelector('.reel-stage').innerHTML = '';
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }

  // ---------- homepage fan ----------
  var fan = document.getElementById('reels-fan');
  if (fan) {
    var mid = (REELS.length - 1) / 2;
    REELS.forEach(function (r, i) {
      var b = el('button', 'reel-card');
      b.type = 'button';
      b.setAttribute('aria-label', 'Play reel' + (r.caption ? ': ' + r.caption : ''));
      b.style.setProperty('--o', (i - mid).toFixed(2));
      b.innerHTML = '<img src="' + esc(r.poster) + '" alt="" loading="lazy">' + '<span class="reel-play"></span>';
      b.addEventListener('click', function () { openModal(i, b); });
      fan.appendChild(b);
      if (r.video && autoplayOK) {
        var v = el('video');
        v.muted = true; v.loop = true; v.playsInline = true; v.preload = 'none'; v.setAttribute('muted', ''); v.dataset.src = r.video;
        b.insertBefore(v, b.querySelector('.reel-play'));
      }
    });
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          var v = en.target.querySelector('video'); if (!v) return;
          if (en.isIntersecting) {
            if (!v.src) v.src = v.dataset.src;
            var p = v.play(); if (p && p.catch) p.catch(function () {});
          } else { v.pause(); }
        });
      }, { threshold: 0.4 });
      Array.prototype.forEach.call(fan.querySelectorAll('.reel-card'), function (c) { io.observe(c); });
    }
  }

  // ---------- product page circles ----------
  var circles = document.getElementById('reels-circles');
  if (circles) {
    var track = el('div', 'reels-circles-track');
    REELS.forEach(function (r, i) {
      var b = el('button', 'reel-circle');
      b.type = 'button';
      b.setAttribute('aria-label', 'Play reel' + (r.caption ? ': ' + r.caption : ''));
      b.innerHTML = '<img src="' + esc(r.poster) + '" alt="" loading="lazy">';
      b.addEventListener('click', function () { openModal(i, b); });
      track.appendChild(b);
    });
    var prev = el('button', 'reels-arrow prev', '&#8249;'); prev.type = 'button'; prev.setAttribute('aria-label', 'Scroll back');
    var next = el('button', 'reels-arrow next', '&#8250;'); next.type = 'button'; next.setAttribute('aria-label', 'Scroll forward');
    prev.addEventListener('click', function () { track.scrollBy({ left: -200, behavior: 'smooth' }); });
    next.addEventListener('click', function () { track.scrollBy({ left: 200, behavior: 'smooth' }); });
    circles.appendChild(prev); circles.appendChild(track); circles.appendChild(next);
    function checkOverflow() { circles.classList.toggle('has-overflow', track.scrollWidth > track.clientWidth + 4); }
    checkOverflow(); window.addEventListener('resize', checkOverflow);
  }
})();
