/* ============================================
   EARTHED — On-site reviews display
   Reads approved reviews from /api/reviews and
   fills the star rating under the product title
   and the #reviews section. Product pages only.
   ============================================ */
(function () {
  var section = document.getElementById("reviews");
  var link = document.querySelector(".product-rating-link");
  var product = location.pathname.replace(/^\/|\.html$/g, "");
  if (!section || !product) return;

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function stars(n) { return "★".repeat(n) + "☆".repeat(5 - n); }

  fetch("/api/reviews?product=" + encodeURIComponent(product)).then(function (r) { return r.json(); }).then(function (d) {
    var s = d.summary && d.summary[product];
    if (!s || !s.count) return;

    if (link) {
      link.querySelector(".product-rating-stars").textContent = stars(Math.round(s.average));
      link.querySelector(".product-rating-count").textContent = s.average.toFixed(1) + " (" + s.count + " review" + (s.count > 1 ? "s" : "") + ")";
    }

    var max = Math.max.apply(null, s.stars) || 1;
    var bars = [5, 4, 3, 2, 1].map(function (n) {
      return "<div class='rv-bar'><span>" + n + " ★</span><i><b style='width:" + Math.round(s.stars[n - 1] / max * 100) + "%'></b></i><span>" + s.stars[n - 1] + "</span></div>";
    }).join("");

    var cards = d.reviews.map(function (r, i) {
      var badge = r.badge === "free" ? "Received free product" : "Verified purchase";
      return "<div class='review-card" + (i >= 6 ? " rv-extra' hidden" : "'") + ">" +
        "<div class='review-stars'>" + stars(r.rating) + "</div>" +
        "<p class='review-text'>" + esc(r.text) + "</p>" +
        (r.photo ? "<img class='rv-photo' loading='lazy' src='" + r.photo + "' alt='Photo from " + esc(r.name) + "'>" : "") +
        "<span class='review-author'>" + esc(r.name) + "</span>" +
        "<span class='rv-badge'>" + badge + "</span></div>";
    }).join("");

    section.innerHTML = "<div class='wrap'><h2>What our customers say</h2>" +
      "<div class='rv-summary'><div class='rv-avg'><b>" + s.average.toFixed(1) + "</b><span class='review-stars'>" + stars(Math.round(s.average)) + "</span><small>" + s.count + " review" + (s.count > 1 ? "s" : "") + "</small></div>" +
      "<div class='rv-bars'>" + bars + "</div></div>" +
      "<div class='reviews-grid'>" + cards + "</div>" +
      (d.reviews.length > 6 ? "<button class='btn rv-more' type='button'>Show more reviews</button>" : "") + "</div>";

    var more = section.querySelector(".rv-more");
    if (more) more.onclick = function () {
      [].forEach.call(section.querySelectorAll(".rv-extra"), function (c) { c.hidden = false; });
      more.remove();
    };
  }).catch(function () { /* leave the page as it is */ });
})();
