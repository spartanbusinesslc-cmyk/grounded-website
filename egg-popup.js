(function () {
  try { if (localStorage.getItem('ep_seen')) return; } catch (e) {}

  const KV_KEY  = 'UpP5xc';
  const KV_LIST = 'TKGvVv';
  const CODE    = 'EARTH15';
  const DELAY   = 4000;

  const css = `
#ep-ov{position:fixed;inset:0;background:rgba(20,16,8,.72);z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px;font-family:'Jost',sans-serif;}
#ep-box{background:#59624B;border-radius:16px;width:100%;max-width:420px;padding:36px 32px 32px;position:relative;box-shadow:0 24px 80px rgba(0,0,0,.45);text-align:center;}
#ep-x{position:absolute;top:14px;right:14px;background:rgba(255,255,255,.15);border:none;border-radius:50%;width:30px;height:30px;cursor:pointer;color:rgba(255,255,255,.8);font-size:1.1rem;display:flex;align-items:center;justify-content:center;transition:background .2s;line-height:1;}
#ep-x:hover{background:rgba(255,255,255,.28);}
#ep-ey{font-size:.6rem;letter-spacing:.2em;text-transform:uppercase;color:rgba(255,255,255,.6);margin-bottom:10px;}
#ep-hd{font-family:'Cormorant Garamond',Georgia,serif;font-size:clamp(1.5rem,4vw,2rem);font-weight:600;color:#fff;line-height:1.15;margin-bottom:10px;}
#ep-sub{font-size:.82rem;color:rgba(255,255,255,.75);margin-bottom:24px;line-height:1.5;}
#ep-form{display:flex;gap:8px;flex-wrap:wrap;}
#ep-em{flex:1;min-width:0;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.3);border-radius:9px;padding:11px 14px;color:#fff;font-family:'Jost',sans-serif;font-size:.84rem;outline:none;}
#ep-em::placeholder{color:rgba(255,255,255,.4);}
#ep-em:focus{border-color:rgba(255,255,255,.6);background:rgba(255,255,255,.18);}
#ep-btn{background:#fff;color:#59624B;border:none;border-radius:9px;padding:11px 18px;font-family:'Jost',sans-serif;font-weight:600;font-size:.84rem;cursor:pointer;white-space:nowrap;transition:opacity .2s;}
#ep-btn:hover{opacity:.88;}
#ep-code{display:none;margin-top:20px;}
#ep-code.show{display:block;}
#ep-cl{font-size:.62rem;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.6);margin-bottom:6px;}
#ep-cv{font-family:'Cormorant Garamond',Georgia,serif;font-size:2rem;font-weight:600;letter-spacing:.1em;color:#fff;}
#ep-cn{font-size:.72rem;color:rgba(255,255,255,.55);margin-top:4px;}
#ep-cp{margin-top:12px;background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.28);border-radius:7px;color:#fff;font-family:'Jost',sans-serif;font-size:.72rem;padding:7px 16px;cursor:pointer;transition:background .2s;}
#ep-cp:hover{background:rgba(255,255,255,.24);}
#ep-skip{margin-top:14px;font-size:.7rem;color:rgba(255,255,255,.4);cursor:pointer;background:none;border:none;font-family:'Jost',sans-serif;text-decoration:underline;text-underline-offset:2px;}
#ep-skip:hover{color:rgba(255,255,255,.65);}
`;

  const html = `
<div id="ep-ov">
  <div id="ep-box">
    <button id="ep-x" aria-label="Close">&#x2715;</button>
    <p id="ep-ey">EARTHED</p>
    <h2 id="ep-hd">Get 15% off your first order</h2>
    <p id="ep-sub">Enter your email and we'll send you a discount code to use at checkout.</p>
    <form id="ep-form" novalidate>
      <input id="ep-em" type="email" placeholder="your@email.com" autocomplete="email" required/>
      <button id="ep-btn" type="submit">Get 15% off</button>
    </form>
    <div id="ep-code">
      <p id="ep-cl">Your discount code</p>
      <p id="ep-cv">${CODE}</p>
      <p id="ep-cn">15% off your first order &middot; applied at checkout</p>
      <button id="ep-cp">Copy code</button>
    </div>
    <button id="ep-skip">No thanks</button>
  </div>
</div>`;

  function inject() {
    const st = document.createElement('style');
    st.textContent = css;
    document.head.appendChild(st);
    document.body.insertAdjacentHTML('beforeend', html);
    setup();
  }

  function setup() {
    document.getElementById('ep-form').addEventListener('submit', function (e) {
      e.preventDefault();
      const email = document.getElementById('ep-em').value.trim();
      if (!email || !email.includes('@')) return;
      const btn = document.getElementById('ep-btn');
      btn.textContent = '...';
      btn.disabled = true;

      fetch('https://a.klaviyo.com/client/subscriptions/?company_id=' + KV_KEY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'revision': '2023-12-15' },
        body: JSON.stringify({
          data: {
            type: 'subscription',
            attributes: { list_id: KV_LIST, email: email, custom_source: 'Popup' }
          }
        })
      }).catch(() => {}).finally(() => {
        try { localStorage.setItem('ep_seen', '1'); } catch (err) {}
        document.getElementById('ep-form').hidden = true;
        document.getElementById('ep-sub').hidden = true;
        document.getElementById('ep-skip').hidden = true;
        document.getElementById('ep-code').classList.add('show');
      });
    });

    document.getElementById('ep-cp').addEventListener('click', function () {
      navigator.clipboard.writeText(CODE).then(() => {
        this.textContent = 'Copied!';
        setTimeout(() => this.textContent = 'Copy code', 2200);
      }).catch(() => { this.textContent = CODE; });
    });

    function dismiss() {
      try { localStorage.setItem('ep_seen', '1'); } catch (err) {}
      document.getElementById('ep-ov').remove();
    }

    document.getElementById('ep-x').addEventListener('click', dismiss);
    document.getElementById('ep-skip').addEventListener('click', dismiss);
  }

  setTimeout(inject, DELAY);
})();
