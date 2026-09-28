(function () {
  try { if (localStorage.getItem('ep_seen')) return; } catch (e) {}

  const KV_KEY  = 'UpP5xc';
  const KV_LIST = 'VGeaVS';
  const CODE     = 'EARTH10';
  const DELAY    = 8000;
  const NEED     = 3;

  /* ── styles ── */
  const css = `
#ep-ov{position:fixed;inset:0;background:rgba(20,16,8,.75);z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px;font-family:'Jost',sans-serif;}
#ep-box{background:#F2EFE6;border-radius:18px;width:100%;max-width:500px;overflow:hidden;position:relative;box-shadow:0 28px 90px rgba(0,0,0,.5);}
#ep-x{position:absolute;top:12px;right:14px;background:rgba(28,28,28,.08);border:none;border-radius:50%;width:28px;height:28px;cursor:pointer;color:rgba(28,28,28,.4);font-size:1rem;display:flex;align-items:center;justify-content:center;z-index:10;transition:background .2s;}
#ep-x:hover{background:rgba(28,28,28,.16);}
#ep-hd{padding:22px 24px 10px;text-align:center;}
.ep-ey{font-size:.62rem;letter-spacing:.18em;text-transform:uppercase;color:#59624B;font-weight:500;margin-bottom:5px;}
#ep-hd h2{font-family:'Cormorant Garamond',Georgia,serif;font-size:clamp(1.35rem,3vw,1.75rem);font-weight:700;color:#59624B;text-wrap:balance;line-height:1.15;margin-bottom:4px;}
.ep-hint{font-size:.78rem;color:#59624B;font-weight:500;opacity:.75;}
#ep-scene{position:relative;width:100%;}
#ep-scene svg{display:block;width:100%;height:auto;}
.ep-egg{cursor:pointer;}
.ep-egg:hover:not(.ep-taken) .ep-es{filter:brightness(1.12) drop-shadow(0 0 5px rgba(240,230,200,.9));}
.ep-egg.ep-taken{pointer-events:none;}
.ep-egg.ep-taken .ep-es{animation:ep-epop .32s ease forwards;}
@keyframes ep-epop{0%{transform:scale(1);opacity:1;}45%{transform:scale(1.5);opacity:.7;}100%{transform:scale(0);opacity:0;}}
#ep-bk{transform-box:fill-box;transform-origin:center bottom;}
.ep-bb{animation:ep-bb .38s ease;}
@keyframes ep-bb{0%,100%{transform:rotate(0) translate(0,0);}25%{transform:rotate(-6deg) translate(-2px,-3px);}60%{transform:rotate(4deg) translate(2px,-2px);}80%{transform:rotate(-2deg) translate(-1px,-1px);}}
.ep-fe{position:absolute;width:13px;height:17px;background:#F0EDE5;border-radius:50% 50% 55% 45%/45% 45% 55% 55%;border:1px solid #D8D4C4;pointer-events:none;transform:translate(-50%,-50%);}
#ep-pb{display:flex;align-items:center;justify-content:center;gap:7px;padding:9px 20px;border-top:1px solid rgba(28,28,28,.07);background:#F2EFE6;}
.ep-pd{width:8px;height:8px;border-radius:50%;background:#D8D1C2;transition:background .35s,transform .3s;}
.ep-pd.ep-on{background:#59624B;transform:scale(1.2);}
.ep-pl{font-size:.68rem;letter-spacing:.09em;text-transform:uppercase;color:rgba(28,28,28,.35);}
#ep-rw{background:#59624B;color:#fff;padding:20px 24px 24px;transform:translateY(100%);transition:transform .5s cubic-bezier(.22,1,.36,1);}
#ep-rw.ep-open{transform:translateY(0);}
.ep-re{font-size:.62rem;letter-spacing:.14em;text-transform:uppercase;opacity:.6;margin-bottom:3px;}
#ep-rw h3{font-family:'Cormorant Garamond',Georgia,serif;font-size:1.45rem;font-weight:500;margin-bottom:3px;color:#fff!important;}
.ep-rs{font-size:.78rem;font-weight:300;opacity:.72;margin-bottom:13px;}
#ep-rf{display:flex;gap:8px;}
#ep-em{flex:1;min-width:0;background:rgba(255,255,255,.13);border:1px solid rgba(255,255,255,.28);border-radius:9px;padding:9px 13px;color:#fff;font-family:'Jost',sans-serif;font-size:.82rem;outline:none;}
#ep-em::placeholder{color:rgba(255,255,255,.4);}
#ep-em:focus{border-color:rgba(255,255,255,.55);background:rgba(255,255,255,.2);}
#ep-rb{background:#fff;color:#59624B;border:none;border-radius:9px;padding:9px 16px;font-family:'Jost',sans-serif;font-weight:500;font-size:.82rem;cursor:pointer;white-space:nowrap;}
#ep-rb:hover{opacity:.88;}
#ep-cr{display:none;text-align:center;}
#ep-cr.ep-show{display:block;}
.ep-cl{font-size:.62rem;letter-spacing:.12em;text-transform:uppercase;opacity:.6;margin-bottom:5px;}
.ep-cv{font-family:'Cormorant Garamond',Georgia,serif;font-size:2.2rem;font-weight:600;letter-spacing:.1em;}
.ep-cn{font-size:.72rem;opacity:.55;margin-top:4px;font-weight:300;}
#ep-cp{margin-top:10px;background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.28);border-radius:7px;color:#fff;font-family:'Jost',sans-serif;font-size:.72rem;padding:6px 14px;cursor:pointer;}
#ep-cp:hover{background:rgba(255,255,255,.24);}
.ep-sp{position:fixed;border-radius:50%;pointer-events:none;animation:ep-sp .6s ease-out forwards;}
@keyframes ep-sp{0%{transform:translate(0,0) scale(1);opacity:1;}100%{transform:translate(var(--tx),var(--ty)) scale(0);opacity:0;}}
`;

  /* ── HTML ── */
  const html = `
<div id="ep-ov">
 <div id="ep-box">
  <button id="ep-x" aria-label="Close">×</button>
  <div id="ep-hd">
   <p class="ep-ey">EARTHED</p>
   <h2>Help gather the morning eggs</h2>
   <p class="ep-hint">Find &amp; collect 3 eggs to unlock 10% off your first order</p>
  </div>
  <div id="ep-scene">
   <svg viewBox="0 0 500 245" xmlns="http://www.w3.org/2000/svg">
    <defs>
     <linearGradient id="ep-wg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#CCBA90"/><stop offset="100%" stop-color="#B8A478"/></linearGradient>
     <linearGradient id="ep-fg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#9B7040"/><stop offset="100%" stop-color="#7A5530"/></linearGradient>
     <radialGradient id="ep-sun" cx="15%" cy="20%" r="55%"><stop offset="0%" stop-color="#F0E0A0" stop-opacity=".22"/><stop offset="100%" stop-color="#C8B890" stop-opacity="0"/></radialGradient>
    </defs>
    <rect width="500" height="158" fill="url(#ep-wg)"/>
    <rect width="500" height="158" fill="url(#ep-sun)"/>
    <g stroke="#A89060" stroke-width=".6" opacity=".35"><line x1="42" y1="0" x2="42" y2="158"/><line x1="84" y1="0" x2="84" y2="158"/><line x1="126" y1="0" x2="126" y2="158"/><line x1="168" y1="0" x2="168" y2="158"/><line x1="210" y1="0" x2="210" y2="158"/><line x1="252" y1="0" x2="252" y2="158"/><line x1="294" y1="0" x2="294" y2="158"/><line x1="336" y1="0" x2="336" y2="158"/><line x1="378" y1="0" x2="378" y2="158"/><line x1="420" y1="0" x2="420" y2="158"/><line x1="462" y1="0" x2="462" y2="158"/></g>
    <ellipse cx="218" cy="62" rx="4" ry="5" fill="#9A7840" opacity=".45"/>
    <ellipse cx="352" cy="98" rx="3" ry="4" fill="#9A7840" opacity=".38"/>
    <rect y="158" width="500" height="87" fill="url(#ep-fg)"/>
    <g stroke="#6A4420" stroke-width=".8" opacity=".45"><line x1="0" y1="174" x2="500" y2="174"/><line x1="0" y1="191" x2="500" y2="191"/><line x1="0" y1="208" x2="500" y2="208"/><line x1="0" y1="225" x2="500" y2="225"/></g>
    <rect y="153" width="500" height="7" fill="#8A6838"/>
    <rect y="155" width="500" height="1.5" fill="#C8A868" opacity=".5"/>
    <!-- left nesting box -->
    <rect x="46" y="82" width="72" height="58" rx="3" fill="rgba(0,0,0,.12)"/>
    <rect x="43" y="78" width="72" height="58" rx="3" fill="#8B6040"/>
    <rect x="48" y="83" width="62" height="48" rx="2" fill="#6A4828"/>
    <ellipse cx="79" cy="123" rx="30" ry="8" fill="#C8A040"/>
    <path d="M53,119 Q66,113 79,119 Q92,113 105,119" fill="none" stroke="#D4B050" stroke-width="1.2"/>
    <path d="M54,124 Q68,118 82,124 Q96,118 106,124" fill="none" stroke="#B89030" stroke-width=".8"/>
    <path d="M52,128 Q66,122 79,128 Q92,122 106,128" fill="none" stroke="#D4B050" stroke-width="1"/>
    <rect x="43" y="130" width="72" height="8" rx="2" fill="#9B7050"/>
    <rect x="70" y="70" width="18" height="10" rx="2" fill="#7A5030"/>
    <!-- right nesting box -->
    <rect x="387" y="87" width="68" height="52" rx="3" fill="rgba(0,0,0,.12)"/>
    <rect x="384" y="83" width="68" height="52" rx="3" fill="#8B6040"/>
    <rect x="389" y="88" width="58" height="42" rx="2" fill="#6A4828"/>
    <ellipse cx="418" cy="122" rx="27" ry="7" fill="#C8A040"/>
    <path d="M394,118 Q406,112 418,118 Q430,112 442,118" fill="none" stroke="#D4B050" stroke-width="1.2"/>
    <path d="M393,123 Q406,117 418,123 Q430,117 443,123" fill="none" stroke="#B89030" stroke-width=".8"/>
    <rect x="384" y="129" width="68" height="7" rx="2" fill="#9B7050"/>
    <rect x="408" y="76" width="18" height="9" rx="2" fill="#7A5030"/>
    <!-- hay piles -->
    <ellipse cx="68" cy="218" rx="54" ry="16" fill="#A88028" opacity=".65"/>
    <ellipse cx="66" cy="213" rx="48" ry="13" fill="#B89030"/>
    <ellipse cx="70" cy="207" rx="40" ry="11" fill="#C8A040"/>
    <ellipse cx="67" cy="202" rx="33" ry="9" fill="#D4B050"/>
    <path d="M28,210 Q55,202 88,208" fill="none" stroke="#E0C060" stroke-width=".9" opacity=".65"/>
    <path d="M26,215 Q58,207 94,212" fill="none" stroke="#B89030" stroke-width=".8" opacity=".55"/>
    <ellipse cx="236" cy="220" rx="58" ry="14" fill="#A88028" opacity=".6"/>
    <ellipse cx="234" cy="215" rx="52" ry="12" fill="#B89030"/>
    <ellipse cx="238" cy="210" rx="44" ry="10" fill="#C8A040"/>
    <ellipse cx="235" cy="205" rx="36" ry="8" fill="#D4B050"/>
    <path d="M192,212 Q220,204 266,210" fill="none" stroke="#E0C060" stroke-width=".9" opacity=".6"/>
    <ellipse cx="354" cy="218" rx="50" ry="13" fill="#A88028" opacity=".6"/>
    <ellipse cx="352" cy="213" rx="45" ry="11" fill="#B89030"/>
    <ellipse cx="356" cy="208" rx="38" ry="9" fill="#C8A040"/>
    <ellipse cx="353" cy="203" rx="30" ry="8" fill="#D4B050"/>
    <path d="M312,211 Q344,203 388,209" fill="none" stroke="#E0C060" stroke-width=".9" opacity=".6"/>
    <!-- extra straw scattered on floor -->
    <g fill="none" stroke-linecap="round" pointer-events="none">
     <path d="M120,185 Q135,180 152,184" stroke="#D4B050" stroke-width="1.4" opacity=".7"/>
     <path d="M125,190 Q140,186 158,189" stroke="#C8A040" stroke-width="1.1" opacity=".6"/>
     <path d="M170,195 Q185,190 198,194" stroke="#D4B050" stroke-width="1.2" opacity=".65"/>
     <path d="M270,188 Q284,183 298,187" stroke="#C8A040" stroke-width="1.3" opacity=".6"/>
     <path d="M275,193 Q292,188 308,192" stroke="#D4B050" stroke-width="1.1" opacity=".55"/>
     <path d="M395,190 Q410,185 425,189" stroke="#D4B050" stroke-width="1.2" opacity=".65"/>
     <path d="M390,197 Q408,192 424,196" stroke="#C8A040" stroke-width="1" opacity=".55"/>
     <!-- wall straw wisps -->
     <path d="M142,155 Q150,148 160,154" stroke="#C8A040" stroke-width="1.1" opacity=".5"/>
     <path d="M330,158 Q340,151 350,157" stroke="#C8A040" stroke-width="1" opacity=".45"/>
    </g>
    <!-- small background chickens (against wall) -->
    <!-- bg chicken left, peeking near left box -->
    <g transform="translate(148,138)" opacity=".6">
     <ellipse cx="0" cy="13" rx="13" ry="12" fill="#6B4228"/>
     <circle cx="0" cy="-3" r="10" fill="#6B4228"/>
     <path d="M-5,-11 Q-2,-19 0,-11 Q3,-19 6,-11" fill="#B02828"/>
     <circle cx="-4" cy="-5" r="4" fill="white"/>
     <circle cx="4" cy="-5" r="4" fill="white"/>
     <circle cx="-3.5" cy="-4.5" r="2.5" fill="#1C1C1C"/>
     <circle cx="3.5" cy="-4.5" r="2.5" fill="#1C1C1C"/>
     <circle cx="-2.5" cy="-6" r="1" fill="white"/>
     <circle cx="4.5" cy="-6" r="1" fill="white"/>
     <path d="M-3,2 L0,6 L3,2 Z" fill="#D4A830"/>
     <path d="M-3,18 Q-5,15 -4,12" stroke="#C8A030" stroke-width="1.8" fill="none" stroke-linecap="round"/>
     <path d="M3,18 Q5,15 4,12" stroke="#C8A030" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    </g>
    <!-- bg chicken right, near right box -->
    <g transform="translate(368,135)" opacity=".55">
     <ellipse cx="0" cy="13" rx="12" ry="11" fill="#7A5235"/>
     <circle cx="0" cy="-3" r="9" fill="#7A5235"/>
     <path d="M-4,-10 Q-2,-18 0,-10 Q3,-18 5,-10" fill="#B02828"/>
     <circle cx="-4" cy="-5" r="3.5" fill="white"/>
     <circle cx="4" cy="-5" r="3.5" fill="white"/>
     <circle cx="-3.5" cy="-4.5" r="2" fill="#1C1C1C"/>
     <circle cx="3.5" cy="-4.5" r="2" fill="#1C1C1C"/>
     <circle cx="-2.5" cy="-6" r=".9" fill="white"/>
     <circle cx="4.2" cy="-6" r=".9" fill="white"/>
     <path d="M-3,2 L0,6 L3,2 Z" fill="#D4A830"/>
     <path d="M-3,17 Q-5,14 -4,11" stroke="#C8A030" stroke-width="1.8" fill="none" stroke-linecap="round"/>
     <path d="M3,17 Q5,14 4,11" stroke="#C8A030" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    </g>
    <!-- basket -->
    <g id="ep-bk">
     <ellipse cx="452" cy="240" rx="28" ry="5" fill="rgba(0,0,0,.18)"/>
     <path d="M429,210 Q452,186 475,210" fill="none" stroke="#8B6040" stroke-width="5" stroke-linecap="round"/>
     <path d="M429,210 Q452,186 475,210" fill="none" stroke="#B08858" stroke-width="2.5" stroke-linecap="round"/>
     <path d="M426,210 L420,238 Q452,245 484,238 L478,210 Z" fill="#A07848"/>
     <path d="M425,218 Q452,222 479,218" fill="none" stroke="#7A5830" stroke-width="1.2"/>
     <path d="M423,226 Q452,230 481,226" fill="none" stroke="#7A5830" stroke-width="1.2"/>
     <path d="M421,234 Q452,238 483,234" fill="none" stroke="#7A5830" stroke-width="1.2"/>
     <g stroke="#7A5830" stroke-width=".8" opacity=".45"><line x1="429" y1="210" x2="423" y2="237"/><line x1="439" y1="211" x2="435" y2="239"/><line x1="452" y1="212" x2="452" y2="241"/><line x1="465" y1="211" x2="469" y2="239"/><line x1="475" y1="210" x2="481" y2="237"/></g>
     <ellipse cx="452" cy="211" rx="27" ry="5" fill="#B88C58" stroke="#8B6040" stroke-width="1.5"/>
     <ellipse cx="452" cy="210" rx="24" ry="4" fill="#7A5830" opacity=".55"/>
     <circle cx="474" cy="196" r="12" fill="#59624B"/>
     <text id="ep-bct" x="474" y="200.5" text-anchor="middle" font-family="Jost,sans-serif" font-size="11" font-weight="500" fill="white">0/3</text>
    </g>
    <!-- chicken (front-facing, cute) -->
    <g transform="translate(300,168)">
     <ellipse cx="0" cy="52" rx="24" ry="5" fill="rgba(0,0,0,.15)"/>
     <!-- wings -->
     <path d="M-26,22 Q-42,12 -38,34 Q-32,42 -22,34 Z" fill="#6B4228"/>
     <path d="M26,22 Q42,12 38,34 Q32,42 22,34 Z" fill="#6B4228"/>
     <!-- body -->
     <ellipse cx="0" cy="28" rx="27" ry="26" fill="#7A5235"/>
     <!-- head -->
     <circle cx="0" cy="-4" r="20" fill="#7A5235"/>
     <!-- comb -->
     <path d="M-9,-22 Q-6,-34 -2,-22 Q1,-34 5,-22 Q8,-34 11,-20" fill="#C03838"/>
     <!-- rosy cheeks -->
     <circle cx="-12" cy="0" r="6" fill="#C05050" opacity=".3"/>
     <circle cx="12" cy="0" r="6" fill="#C05050" opacity=".3"/>
     <!-- eyes whites -->
     <circle cx="-8" cy="-8" r="7" fill="white"/>
     <circle cx="8" cy="-8" r="7" fill="white"/>
     <!-- pupils -->
     <circle cx="-7" cy="-7" r="4.5" fill="#1C1C1C"/>
     <circle cx="7" cy="-7" r="4.5" fill="#1C1C1C"/>
     <!-- eye shine -->
     <circle cx="-5.5" cy="-9" r="1.8" fill="white"/>
     <circle cx="8.5" cy="-9" r="1.8" fill="white"/>
     <!-- beak -->
     <path d="M-5,0 L0,7 L5,0 Z" fill="#D4A830"/>
     <line x1="-4" y1="2" x2="4" y2="2" stroke="#B8901A" stroke-width=".8"/>
     <!-- wattle -->
     <path d="M-3,8 Q-6,15 -3,19 Q0,15 3,19 Q6,15 3,8 Z" fill="#C03838"/>
     <!-- legs -->
     <line x1="-9" y1="52" x2="-11" y2="64" stroke="#C8A030" stroke-width="3" stroke-linecap="round"/>
     <line x1="9" y1="52" x2="11" y2="64" stroke="#C8A030" stroke-width="3" stroke-linecap="round"/>
     <g stroke="#C8A030" stroke-width="2" stroke-linecap="round" fill="none">
      <path d="M-11,64 L-18,68 M-11,64 L-10,71 M-11,64 L-3,68"/>
      <path d="M11,64 L4,68 M11,64 L12,71 M11,64 L19,68"/>
     </g>
    </g>
    <!-- eggs -->
    <g class="ep-egg" id="ep-e1" transform="translate(76,114)"><g class="ep-es"><ellipse cx="0" cy="0" rx="10" ry="13" fill="#F0EDE5" stroke="#D8D4C4" stroke-width=".8"/><ellipse cx="-3" cy="-4" rx="4" ry="5.5" fill="rgba(255,255,255,.45)"/></g></g>
    <g class="ep-egg" id="ep-e2" transform="translate(52,196)"><g class="ep-es"><ellipse cx="0" cy="0" rx="9" ry="12" fill="#F0EDE5" stroke="#D8D4C4" stroke-width=".8"/><ellipse cx="-2.5" cy="-4" rx="3.5" ry="5" fill="rgba(255,255,255,.4)"/></g></g>
    <g class="ep-egg" id="ep-e3" transform="translate(228,196)"><g class="ep-es"><ellipse cx="0" cy="0" rx="10" ry="13" fill="#C8A888" stroke="#A88868" stroke-width=".8"/><circle cx="3" cy="2" r="1.2" fill="#9A7858" opacity=".6"/><circle cx="-3" cy="5" r="1" fill="#9A7858" opacity=".55"/><circle cx="2" cy="-4" r=".9" fill="#9A7858" opacity=".5"/><circle cx="-2" cy="-6" r="1.1" fill="#9A7858" opacity=".5"/><ellipse cx="-3" cy="-4" rx="3.5" ry="5" fill="rgba(255,255,255,.28)"/></g></g>
    <g class="ep-egg" id="ep-e4" transform="translate(333,194)"><g class="ep-es"><ellipse cx="0" cy="0" rx="9" ry="12" fill="#F0EDE5" stroke="#D8D4C4" stroke-width=".8"/><ellipse cx="-2.5" cy="-3.5" rx="3.5" ry="5" fill="rgba(255,255,255,.4)"/></g></g>
    <g class="ep-egg" id="ep-e5" transform="translate(416,112)"><g class="ep-es"><ellipse cx="0" cy="0" rx="9" ry="12" fill="#C8A888" stroke="#A88868" stroke-width=".8"/><circle cx="2" cy="3" r="1" fill="#9A7858" opacity=".6"/><circle cx="-3" cy="4" r=".9" fill="#9A7858" opacity=".55"/><circle cx="3" cy="-4" r=".8" fill="#9A7858" opacity=".5"/><ellipse cx="-2.5" cy="-4" rx="3" ry="4.5" fill="rgba(255,255,255,.28)"/></g></g>
    <!-- foreground hay wisps -->
    <g pointer-events="none">
     <path d="M18,198 Q42,190 70,196" fill="none" stroke="#D4B050" stroke-width="2.5" stroke-linecap="round" opacity=".82"/>
     <path d="M22,202 Q48,194 78,200" fill="none" stroke="#C8A040" stroke-width="2" stroke-linecap="round" opacity=".68"/>
     <path d="M196,198 Q222,190 258,196" fill="none" stroke="#D4B050" stroke-width="2" stroke-linecap="round" opacity=".78"/>
     <path d="M302,196 Q330,189 360,194" fill="none" stroke="#D4B050" stroke-width="2.2" stroke-linecap="round" opacity=".72"/>
     <path d="M308,200 Q336,193 366,197" fill="none" stroke="#C8A040" stroke-width="1.6" stroke-linecap="round" opacity=".62"/>
    </g>
   </svg>
  </div>
  <div id="ep-pb">
   <span class="ep-pl">Collected</span>
   <div class="ep-pd" id="ep-pd0"></div>
   <div class="ep-pd" id="ep-pd1"></div>
   <div class="ep-pd" id="ep-pd2"></div>
   <span class="ep-pl">— find 3 to get your code</span>
  </div>
  <div id="ep-rw">
   <div id="ep-re">
    <p class="ep-re">WELL DONE — 3 EGGS COLLECTED</p>
    <h3>10% off your first order</h3>
    <p class="ep-rs">Enter your email to reveal your discount code</p>
    <form id="ep-rf" novalidate>
     <input id="ep-em" type="email" placeholder="your@email.com" autocomplete="email" required/>
     <button id="ep-rb" type="submit">Reveal</button>
    </form>
   </div>
   <div id="ep-cr">
    <p class="ep-cl">Your discount code</p>
    <p class="ep-cv">${CODE}</p>
    <p class="ep-cn">10% off your first order · applied at checkout</p>
    <button id="ep-cp">Copy code</button>
   </div>
  </div>
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
    let n = 0, done = false;
    const scene = document.getElementById('ep-scene');
    const bk    = document.getElementById('ep-bk');
    const bct   = document.getElementById('ep-bct');
    const rw    = document.getElementById('ep-rw');
    const dots  = [
      document.getElementById('ep-pd0'),
      document.getElementById('ep-pd1'),
      document.getElementById('ep-pd2')
    ];

    document.querySelectorAll('.ep-egg').forEach(egg => {
      egg.addEventListener('click', function (e) {
        if (this.classList.contains('ep-taken') || done) return;
        this.classList.add('ep-taken');

        const sr = scene.getBoundingClientRect();
        const er = this.getBoundingClientRect();
        const br = bk.getBoundingClientRect();

        const sx = er.left - sr.left + er.width / 2;
        const sy = er.top  - sr.top  + er.height / 2;
        const ex = br.left - sr.left + br.width / 2;
        const ey = br.top  - sr.top  + br.height / 2;

        const f = document.createElement('div');
        f.className = 'ep-fe';
        f.style.cssText = 'left:' + sx + 'px;top:' + sy + 'px;';
        scene.appendChild(f);

        const dx = ex - sx, dy = ey - sy;
        const arc = Math.min(sy, ey) - sy - 52;

        f.animate([
          { transform: 'translate(-50%,-50%) scale(1) rotate(0deg)', opacity: 1 },
          { transform: 'translate(calc(-50% + ' + (dx * .48) + 'px),calc(-50% + ' + arc + 'px)) scale(1.2) rotate(-18deg)', opacity: 1, offset: .42 },
          { transform: 'translate(calc(-50% + ' + dx + 'px),calc(-50% + ' + dy + 'px)) scale(.3) rotate(10deg)', opacity: .35 }
        ], { duration: 540, easing: 'cubic-bezier(.4,0,.6,1)' }).onfinish = function () {
          f.remove();
          n++;
          bct.textContent = n + '/3';
          if (n <= 3) dots[n - 1].classList.add('ep-on');
          bk.classList.remove('ep-bb');
          requestAnimationFrame(() => requestAnimationFrame(() => bk.classList.add('ep-bb')));
          if (n >= NEED && !done) {
            done = true;
            setTimeout(() => rw.classList.add('ep-open'), 280);
          }
        };

        sparks(e.clientX, e.clientY);
      });
    });

    document.getElementById('ep-rf').addEventListener('submit', function (e) {
      e.preventDefault();
      const email = document.getElementById('ep-em').value.trim();
      if (!email || !email.includes('@')) return;
      const btn = document.getElementById('ep-rb');
      btn.textContent = '...';
      btn.disabled = true;

      fetch('https://a.klaviyo.com/client/subscriptions/?company_id=' + KV_KEY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'revision': '2023-12-15' },
        body: JSON.stringify({
          data: {
            type: 'subscription',
            attributes: {
              list_id: KV_LIST,
              email: email,
              custom_source: 'Egg Game Popup'
            }
          }
        })
      }).catch(() => {}).finally(() => {
        try { localStorage.setItem('ep_seen', '1'); } catch (err) {}
        document.getElementById('ep-re').hidden = true;
        document.getElementById('ep-cr').classList.add('ep-show');
      });
    });

    document.getElementById('ep-cp').addEventListener('click', function () {
      navigator.clipboard.writeText(CODE).then(() => {
        this.textContent = 'Copied!';
        setTimeout(() => this.textContent = 'Copy code', 2200);
      }).catch(() => { this.textContent = CODE; });
    });

    document.getElementById('ep-x').addEventListener('click', () => {
      try { localStorage.setItem('ep_seen', '1'); } catch (err) {}
      document.getElementById('ep-ov').remove();
    });
  }

  function sparks(cx, cy) {
    ['#C8A040','#D4B050','#F0EDE5','#8B6040','#59624B'].forEach((c, i) => {
      for (let j = 0; j < 3; j++) {
        const el = document.createElement('div');
        el.className = 'ep-sp';
        const a = ((i * 3 + j) / 15) * Math.PI * 2;
        const d = 22 + Math.random() * 40, s = 4 + Math.random() * 5;
        el.style.cssText = 'left:' + cx + 'px;top:' + cy + 'px;width:' + s + 'px;height:' + s + 'px;background:' + c + ';--tx:' + (Math.cos(a) * d) + 'px;--ty:' + (Math.sin(a) * d) + 'px;animation-duration:' + (.38 + Math.random() * .28) + 's;';
        document.body.appendChild(el);
        el.addEventListener('animationend', () => el.remove());
      }
    });
  }

  setTimeout(inject, DELAY);
})();
