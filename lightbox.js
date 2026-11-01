/* ============================================
   EARTHED — Tap the main product image to view it full screen.
   Pinch to zoom in further on a phone. Arrows or swipe move
   through the gallery; tap the X, the dark area or press Escape to close.
   ============================================ */
(function () {
  var img = document.getElementById('product-img');
  if (!img) return;

  var css = document.createElement('style');
  css.textContent =
    '#product-img{cursor:zoom-in}' +
    '.lb{position:fixed;inset:0;z-index:10000;background:rgba(15,12,6,.94);display:none;align-items:center;justify-content:center;touch-action:pinch-zoom}' +
    '.lb.open{display:flex}' +
    '.lb img{max-width:100%;max-height:100%;width:auto;height:auto;object-fit:contain;display:block;user-select:none;-webkit-user-select:none}' +
    '.lb button{position:absolute;border:0;border-radius:50%;background:rgba(255,255,255,.9);color:#1C1C1C;cursor:pointer;display:flex;align-items:center;justify-content:center;line-height:1;font-family:inherit}' +
    '.lb-x{top:max(12px,env(safe-area-inset-top));right:12px;width:40px;height:40px;font-size:1.5rem}' +
    '.lb-nav{top:50%;transform:translateY(-50%);width:40px;height:40px;font-size:1.1rem}' +
    '.lb-prev{left:10px}.lb-next{right:10px}' +
    '.lb-hint{position:absolute;bottom:max(14px,env(safe-area-inset-bottom));left:0;right:0;text-align:center;color:rgba(255,255,255,.7);font-family:var(--body,sans-serif);font-size:.75rem;letter-spacing:.04em;pointer-events:none}';
  document.head.appendChild(css);

  var lb = document.createElement('div');
  lb.className = 'lb';
  lb.setAttribute('role', 'dialog');
  lb.setAttribute('aria-modal', 'true');
  lb.setAttribute('aria-label', 'Product image');
  lb.innerHTML =
    '<img alt="">' +
    '<button type="button" class="lb-x" aria-label="Close">&times;</button>' +
    '<button type="button" class="lb-nav lb-prev" aria-label="Previous image">&#8592;</button>' +
    '<button type="button" class="lb-nav lb-next" aria-label="Next image">&#8594;</button>' +
    '<div class="lb-hint">Pinch to zoom</div>';
  document.body.appendChild(lb);

  var big = lb.querySelector('img');
  function sync() { big.src = img.src; big.alt = img.alt || ''; }
  function open() { sync(); lb.classList.add('open'); document.body.style.overflow = 'hidden'; }
  function close() { lb.classList.remove('open'); document.body.style.overflow = ''; }
  function step(id) { var b = document.getElementById(id); if (b) { b.click(); setTimeout(sync, 60); } }

  img.addEventListener('click', open);
  lb.querySelector('.lb-x').addEventListener('click', close);
  lb.querySelector('.lb-prev').addEventListener('click', function (e) { e.stopPropagation(); step('gallery-prev'); });
  lb.querySelector('.lb-next').addEventListener('click', function (e) { e.stopPropagation(); step('gallery-next'); });
  lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
  document.addEventListener('keydown', function (e) {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') step('gallery-prev');
    if (e.key === 'ArrowRight') step('gallery-next');
  });

  var x0 = null;
  lb.addEventListener('touchstart', function (e) { x0 = e.touches.length === 1 ? e.touches[0].clientX : null; }, { passive: true });
  lb.addEventListener('touchend', function (e) {
    if (x0 === null || !e.changedTouches.length) return;
    var dx = e.changedTouches[0].clientX - x0; x0 = null;
    if (Math.abs(dx) > 60 && window.visualViewport && window.visualViewport.scale <= 1.05) step(dx < 0 ? 'gallery-next' : 'gallery-prev');
  }, { passive: true });
})();
