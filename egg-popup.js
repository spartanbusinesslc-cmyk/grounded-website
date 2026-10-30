/* ============================================
   EARTHED — Spin-the-wheel pop-up
   ---------------------------------------------
   Appears 15 seconds after arriving on the site.
   Visitor spins the wheel, then enters their email
   to claim the prize. The email goes to Klaviyo
   (same list as the footer form).
   Every prize needs a matching code in Stripe:
   EARTH10, EARTH15, FREESOAP.
   Shown again only after 30 days.
   ============================================ */
(function () {
  if (/success/.test(location.pathname)) return;

  const KV_KEY  = 'UpP5xc';
  const KV_LIST = 'TKGvVv';
  const DELAY   = 15000;
  const STORE   = 'ep_wheel';
  const DAYS_30 = 30 * 24 * 60 * 60 * 1000;

  // Slices run clockwise from the top. w = how likely each prize is (they add up to 100).
  const PRIZES = [
    { label: '10%', sub: 'OFF',  code: 'EARTH10',  w: 55, win: 'You won 10% off!',         how: 'Enter this code at checkout.' },
    { label: 'FREE', sub: 'SOAP', code: 'FREESOAP', w: 15, win: 'You won a free soap bar!', how: 'Enter this code at checkout and we will pop a free soap bar into your parcel.' },
    { label: '15%', sub: 'OFF',  code: 'EARTH15',  w: 30, win: 'You won 15% off!',         how: 'Enter this code at checkout.' }
  ];
  const COLORS = [
    { bg: '#59624B', fg: '#F2EFE6' },
    { bg: '#D8D1C2', fg: '#59624B' },
    { bg: '#7A5F44', fg: '#F2EFE6' }
  ];

  let state = {};
  try { state = JSON.parse(localStorage.getItem(STORE) || '{}'); } catch (e) {}
  if (state.t && Date.now() - state.t < DAYS_30) return;

  function save(extra) {
    state = Object.assign({ t: Date.now() }, extra || {});
    try { localStorage.setItem(STORE, JSON.stringify(state)); } catch (e) {}
  }

  const css = `
#ep-ov{position:fixed;inset:0;background:rgba(20,16,8,.72);z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px;font-family:'Jost',sans-serif;}
#ep-box{background:#59624B;border-radius:16px;width:100%;max-width:420px;max-height:calc(100vh - 32px);max-height:calc(100dvh - 32px);overflow-y:auto;padding:30px 28px 24px;position:relative;box-shadow:0 24px 80px rgba(0,0,0,.45);text-align:center;outline:none;}
#ep-x{position:absolute;top:12px;right:12px;background:rgba(255,255,255,.15);border:none;border-radius:50%;width:30px;height:30px;cursor:pointer;color:rgba(255,255,255,.85);font-size:1.1rem;display:flex;align-items:center;justify-content:center;}
#ep-x:hover{background:rgba(255,255,255,.28);}
#ep-ey{font-size:.6rem;letter-spacing:.2em;text-transform:uppercase;color:rgba(255,255,255,.6);margin:0 0 8px;}
#ep-hd{font-family:'Cormorant Garamond',Georgia,serif;font-size:clamp(1.5rem,4vw,1.9rem);font-weight:600;color:#fff;line-height:1.15;margin:0 0 8px;}
#ep-sub{font-size:.82rem;color:rgba(255,255,255,.78);margin:0 0 16px;line-height:1.5;}
#ep-wheel-wrap{position:relative;width:240px;height:240px;margin:0 auto 16px;}
#ep-ptr{position:absolute;top:-6px;left:50%;transform:translateX(-50%);width:0;height:0;border-left:11px solid transparent;border-right:11px solid transparent;border-top:20px solid #fff;filter:drop-shadow(0 2px 3px rgba(0,0,0,.35));z-index:2;}
#ep-wheel{width:100%;height:100%;display:block;transition:transform 5s cubic-bezier(.12,.6,.1,1);}
#ep-spin{background:#fff;color:#59624B;border:none;border-radius:9px;padding:12px 28px;font-family:'Jost',sans-serif;font-weight:600;font-size:.9rem;letter-spacing:.04em;cursor:pointer;}
#ep-spin:hover{opacity:.9;}
#ep-spin:disabled{opacity:.5;cursor:default;}
#ep-result{display:none;}
#ep-result.show{display:block;}
#ep-form{display:flex;gap:8px;flex-wrap:wrap;margin-top:4px;}
#ep-em{flex:1;min-width:0;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.3);border-radius:9px;padding:11px 14px;color:#fff;font-family:'Jost',sans-serif;font-size:.84rem;outline:none;}
#ep-em::placeholder{color:rgba(255,255,255,.5);}
#ep-em:focus{border-color:rgba(255,255,255,.6);background:rgba(255,255,255,.18);}
#ep-btn{background:#fff;color:#59624B;border:none;border-radius:9px;padding:11px 18px;font-family:'Jost',sans-serif;font-weight:600;font-size:.84rem;cursor:pointer;white-space:nowrap;}
#ep-btn:hover{opacity:.88;}
#ep-consent{font-size:.64rem;color:rgba(255,255,255,.6);line-height:1.45;margin:10px 0 0;}
#ep-consent a,#ep-terms a{color:rgba(255,255,255,.8);}
#ep-code{display:none;margin-top:6px;}
#ep-code.show{display:block;}
#ep-cl{font-size:.62rem;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.6);margin:0 0 6px;}
#ep-cv{font-family:'Cormorant Garamond',Georgia,serif;font-size:2rem;font-weight:600;letter-spacing:.1em;color:#fff;margin:0;}
#ep-cn{font-size:.74rem;color:rgba(255,255,255,.7);margin:6px 0 0;line-height:1.45;}
#ep-cp{margin-top:12px;background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.28);border-radius:7px;color:#fff;font-family:'Jost',sans-serif;font-size:.74rem;padding:8px 16px;cursor:pointer;}
#ep-cp:hover{background:rgba(255,255,255,.24);}
#ep-terms{font-size:.62rem;color:rgba(255,255,255,.5);line-height:1.45;margin:14px 0 0;}
#ep-skip{margin-top:10px;font-size:.7rem;color:rgba(255,255,255,.55);cursor:pointer;background:none;border:none;font-family:'Jost',sans-serif;text-decoration:underline;text-underline-offset:2px;}
#ep-skip:hover{color:rgba(255,255,255,.8);}
@media (max-width:600px){
  #ep-ov{align-items:flex-end;padding:0;}
  #ep-box{max-width:none;border-radius:18px 18px 0 0;padding:26px 22px calc(20px + env(safe-area-inset-bottom,0px));max-height:92vh;max-height:92dvh;}
  #ep-wheel-wrap{width:210px;height:210px;}
}
@media (prefers-reduced-motion:reduce){#ep-wheel{transition-duration:.6s;}}
`;

  function wheelSvg() {
    const c = 150, r = 146, n = PRIZES.length, step = 360 / n;
    const pt = (deg, rad) => {
      const a = deg * Math.PI / 180;
      return [(c + rad * Math.sin(a)).toFixed(2), (c - rad * Math.cos(a)).toFixed(2)];
    };
    let out = '<svg id="ep-wheel" viewBox="0 0 300 300" aria-hidden="true"><circle cx="150" cy="150" r="149" fill="#fff"/>';
    PRIZES.forEach((p, i) => {
      const a0 = i * step, a1 = (i + 1) * step, mid = a0 + step / 2;
      const s = pt(a0, r), e = pt(a1, r);
      out += '<path d="M150 150 L' + s[0] + ' ' + s[1] + ' A' + r + ' ' + r + ' 0 0 1 ' + e[0] + ' ' + e[1] + ' Z" fill="' + COLORS[i].bg + '" stroke="#fff" stroke-width="2"/>';
      out += '<g transform="rotate(' + mid + ' 150 150)" fill="' + COLORS[i].fg + '" font-family="Jost,sans-serif" text-anchor="middle">' +
        '<text x="150" y="68" font-size="' + (p.label.length > 3 ? 26 : 34) + '" font-weight="600">' + p.label + '</text>' +
        '<text x="150" y="88" font-size="13" letter-spacing="2" font-weight="500">' + p.sub + '</text></g>';
    });
    out += '<circle cx="150" cy="150" r="18" fill="#fff"/><circle cx="150" cy="150" r="7" fill="#59624B"/></svg>';
    return out;
  }

  const html = `
<div id="ep-ov">
  <div id="ep-box" role="dialog" aria-modal="true" aria-labelledby="ep-hd" tabindex="-1">
    <button id="ep-x" aria-label="Close">&#x2715;</button>
    <p id="ep-ey">EARTHED</p>
    <h2 id="ep-hd">Spin to win a discount</h2>
    <p id="ep-sub">Everyone wins something. Give the wheel a spin.</p>
    <div id="ep-wheel-wrap"><div id="ep-ptr"></div>${wheelSvg()}</div>
    <button id="ep-spin" type="button">Spin the wheel</button>
    <div id="ep-result">
      <form id="ep-form" novalidate>
        <input id="ep-em" type="email" placeholder="your@email.com" autocomplete="email" aria-label="Your email address" required/>
        <button id="ep-btn" type="submit">Claim my prize</button>
      </form>
      <p id="ep-consent">By claiming, you agree to receive marketing emails from EARTHED. Unsubscribe any time. See our <a href="privacy-policy.html">Privacy Policy</a>.</p>
    </div>
    <div id="ep-code">
      <p id="ep-cl">Your discount code</p>
      <p id="ep-cv"></p>
      <p id="ep-cn"></p>
      <button id="ep-cp" type="button">Copy code</button>
    </div>
    <p id="ep-terms">One spin per person. Prizes are not equally likely. Codes cannot be combined and can't be used with the Apple Pay shortcut button.</p>
    <button id="ep-skip" type="button">No thanks</button>
  </div>
</div>`;

  function pick() {
    let r = Math.random() * PRIZES.reduce((a, p) => a + p.w, 0);
    for (let i = 0; i < PRIZES.length; i++) { r -= PRIZES[i].w; if (r < 0) return i; }
    return 0;
  }

  function inject() {
    if (document.getElementById('ep-ov')) return;
    const st = document.createElement('style');
    st.textContent = css;
    document.head.appendChild(st);
    document.body.insertAdjacentHTML('beforeend', html);
    setup();
  }

  function setup() {
    const $ = id => document.getElementById(id);
    const box = $('ep-box');
    let prize = null, spinning = false;

    function dismiss() {
      save({ closed: true });
      document.removeEventListener('keydown', onKey);
      $('ep-ov').remove();
    }
    function onKey(e) { if (e.key === 'Escape') dismiss(); }
    document.addEventListener('keydown', onKey);
    $('ep-x').addEventListener('click', dismiss);
    $('ep-skip').addEventListener('click', dismiss);
    $('ep-ov').addEventListener('click', e => { if (e.target === $('ep-ov')) dismiss(); });

    function showResult(p) {
      prize = p;
      $('ep-hd').textContent = p.win;
      $('ep-sub').textContent = 'Enter your email to claim your prize.';
      $('ep-spin').hidden = true;
      $('ep-result').classList.add('show');
      $('ep-em').focus({ preventScroll: true });
    }

    $('ep-spin').addEventListener('click', function () {
      if (spinning) return;
      spinning = true;
      this.disabled = true;
      const i = pick();
      const step = 360 / PRIZES.length;
      const centre = i * step + step / 2;
      const jitter = (Math.random() - 0.5) * (step * 0.6);
      const turn = 360 * 5 - centre + jitter;
      const wheel = $('ep-wheel');
      const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      let done = false;
      const finish = () => { if (done) return; done = true; spinning = false; showResult(PRIZES[i]); };
      wheel.addEventListener('transitionend', finish, { once: true });
      setTimeout(finish, (reduce ? 600 : 5000) + 400);
      requestAnimationFrame(() => { wheel.style.transform = 'rotate(' + turn + 'deg)'; });
    });

    $('ep-form').addEventListener('submit', function (e) {
      e.preventDefault();
      const email = $('ep-em').value.trim();
      if (!email || email.indexOf('@') < 1 || !prize) return;
      const btn = $('ep-btn');
      btn.textContent = '...';
      btn.disabled = true;

      fetch('https://a.klaviyo.com/client/subscriptions/?company_id=' + KV_KEY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'revision': '2024-02-15' },
        body: JSON.stringify({
          data: {
            type: 'subscription',
            attributes: {
              custom_source: 'Spin Wheel',
              profile: { data: { type: 'profile', attributes: { email: email } } }
            },
            relationships: { list: { data: { type: 'list', id: KV_LIST } } }
          }
        })
      }).catch(() => {}).finally(() => {
        save({ claimed: true, prize: prize.code });
        $('ep-result').classList.remove('show');
        $('ep-sub').hidden = true;
        $('ep-skip').hidden = true;
        $('ep-hd').textContent = prize.win;
        $('ep-cv').textContent = prize.code;
        $('ep-cn').textContent = prize.how;
        $('ep-code').classList.add('show');
      });
    });

    $('ep-cp').addEventListener('click', function () {
      const code = prize && prize.code;
      if (!code) return;
      navigator.clipboard.writeText(code).then(() => {
        this.textContent = 'Copied!';
        setTimeout(() => this.textContent = 'Copy code', 2200);
      }).catch(() => { this.textContent = code; });
    });

    box.focus({ preventScroll: true });
  }

  setTimeout(inject, DELAY);
})();
