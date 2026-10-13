/* @ds-bundle: {"format":4,"namespace":"SalonOM","components":[{"name":"Logo"},{"name":"Button"},{"name":"Section"},{"name":"SectionHeading"},{"name":"SiteHeader"},{"name":"Hero"},{"name":"ArchImage"},{"name":"Shoreline"},{"name":"WaveSound"},{"name":"OfferingCard"},{"name":"Affirmation"},{"name":"Testimonial"},{"name":"AboutStory"},{"name":"JourneySteps"},{"name":"MoodStrip"},{"name":"CTABand"},{"name":"TextField"},{"name":"NewsletterForm"},{"name":"FAQ"},{"name":"SiteFooter"}]} */
(function () {
  'use strict';
  var React = window.React;
  var h = React.createElement;
  var useState = React.useState, useEffect = React.useEffect, useRef = React.useRef;
  function cx() { return Array.prototype.filter.call(arguments, Boolean).join(' '); }
  function rest(props, omit) { var o = {}; for (var k in props) if (omit.indexOf(k) < 0) o[k] = props[k]; return o; }
  function reducedMotion() { try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } }

  /* Two cuts of one mark, drawn in the same frame:
     master = the artwork as supplied (use at 240px wide and up)
     small  = optical cut for small sizes: heavier hairlines, larger SALON (under 240px) */
  var LOGO = { w: __W__, h: __H__, master: '__MASTER_D__', small: '__SMALL_D__' };

  /* ---------- Logo ---------- */
  function Logo(p) {
    var cut = p.cut || (p.size && p.size < 240 ? 'small' : 'master');
    var style = p.size ? { width: p.size, height: 'auto' } : (p.height ? { height: p.height, width: 'auto' } : undefined);
    return h('svg', {
      className: cx('om-logo', 'om-logo--' + (p.tone || 'gold'), p.className),
      viewBox: '0 0 ' + LOGO.w + ' ' + LOGO.h, style: style, role: 'img', 'aria-label': p.title || 'Salon OM'
    }, h('path', { d: cut === 'small' ? LOGO.small : LOGO.master, fill: 'currentColor' }));
  }

  /* ---------- Button ---------- */
  function Button(p) {
    var variant = p.variant || 'primary';
    var cls = cx('om-btn', 'om-btn--' + variant, p.size === 'small' && 'om-btn--small', p.className);
    var inner = [h('span', { key: 'l' }, p.children)];
    if (variant === 'text') inner.push(h('span', { key: 'a', className: 'om-btn__arrow', 'aria-hidden': true }, '→'));
    var r = rest(p, ['variant', 'size', 'className', 'children', 'href']);
    if (p.href) return h('a', Object.assign({ href: p.href, className: cls }, r), inner);
    return h('button', Object.assign({ type: 'button', className: cls }, r), inner);
  }

  /* ---------- Section: the page band every block sits in ---------- */
  function Section(p) {
    return h('section', { id: p.id, 'aria-label': p.label, className: cx('om-section', 'om-section--' + (p.tone || 'surface'), p.flush && 'om-section--flush', p.className) },
      h('div', { className: cx('om-section__inner', 'om-section__inner--' + (p.width || 'content')) }, p.children));
  }

  /* ---------- SectionHeading ---------- */
  function SectionHeading(p) {
    var Tag = p.as || 'h2';
    return h('header', { className: cx('om-heading', 'om-heading--' + (p.align || 'start'), p.size === 'large' && 'om-heading--large', p.className) },
      p.eyebrow && h('p', { className: 'om-eyebrow' }, p.eyebrow),
      h(Tag, { className: 'om-heading__title' }, p.title),
      p.ornament !== false && h('span', { className: 'om-ornament', 'aria-hidden': true }),
      p.lead && h('p', { className: 'om-heading__lead' }, p.lead));
  }

  /* ---------- SiteHeader: tall, white, the full logo at the centre ---------- */
  function SiteHeader(p) {
    var st = useState(!!p.defaultOpen), open = st[0], setOpen = st[1];
    var links = p.links || [];
    var split = Math.ceil(links.length / 2);
    function item(l) { return h('li', { key: l.href }, h('a', { href: l.href, 'aria-current': l.href === p.current ? 'page' : undefined, onClick: function () { setOpen(false); } }, l.label)); }
    return h('header', { className: cx('om-header', p.transparent && 'om-header--transparent', p.compact && 'is-compact', open && 'is-open', p.className) },
      h('div', { className: 'om-header__inner' },
        h('nav', { className: 'om-header__nav om-header__nav--start', 'aria-label': 'Main' }, h('ul', null, links.slice(0, split).map(item))),
        h('a', { className: 'om-header__brand', href: p.homeHref || '/', 'aria-label': 'Salon OM, home' }, h(Logo, { cut: 'small', tone: 'gold' })),
        h('div', { className: 'om-header__end' },
          h('nav', { className: 'om-header__nav', 'aria-label': 'More' }, h('ul', null, links.slice(split).map(item))),
          p.extra,
          p.cta && h(Button, { href: p.cta.href, size: 'small', className: 'om-header__cta' }, p.cta.label)),
        h('button', { type: 'button', className: 'om-header__toggle', 'aria-expanded': open, 'aria-controls': 'om-drawer', 'aria-label': open ? 'Close menu' : 'Open menu', onClick: function () { setOpen(!open); } },
          h('span'), h('span'))),
      h('div', { id: 'om-drawer', className: 'om-header__drawer', hidden: !open },
        h('ul', null, links.map(item)),
        p.cta && h(Button, { href: p.cta.href, className: 'om-header__drawer-cta' }, p.cta.label)));
  }

  /* ---------- ArchImage ---------- */
  function ArchImage(p) {
    var shape = p.shape || 'arch';
    var body = p.children
      ? h('div', { className: 'om-arch__media' }, p.children)
      : p.src ? h('img', { src: p.src, alt: p.alt || '', loading: p.eager ? 'eager' : 'lazy', decoding: 'async' })
      : h('div', { className: 'om-arch__slot om-tone--' + (p.tone || 'sand'), role: 'img', 'aria-label': p.alt || p.label || 'Image to come' }, h('span', null, p.label || 'Image'));
    return h('figure', { className: cx('om-arch', 'om-arch--' + shape, p.className), style: { aspectRatio: p.ratio || '3 / 4' } },
      body, p.caption && h('figcaption', null, p.caption));
  }

  /* ---------- The wave clock: one timeline shared by the sea and its sound ---------- */
  function hash1(n) { var x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
  var T0 = (typeof performance !== 'undefined' ? performance.now() : 0);
  function cycleAt(t) {
    // walk whole waves: each lasts 8.5–12 s and reaches a different height
    var k = 0, start = 0;
    var period = function (i) { return 8.5 + 3.5 * hash1(i); };
    var idx = Math.floor(t / 10.25); // fast guess, then correct
    k = Math.max(0, idx - 2); start = 0;
    for (var i = 0; i < k; i++) start += period(i);
    while (start + period(k) <= t) { start += period(k); k++; }
    while (start > t && k > 0) { k--; start -= period(k); }
    return { k: k, u: (t - start) / period(k), T: period(k) };
  }
  function ease(x) { return 1 - Math.pow(1 - x, 3); }
  function waveState(seconds) {
    var c = cycleAt(seconds), u = c.u;
    var amp = 0.55 + 0.45 * hash1(c.k + 17);
    var prevAmp = 0.55 + 0.45 * hash1(c.k + 16);
    var UP = 0.36;
    var swash = u < UP ? ease(u / UP) * amp : amp * (1 - (0.5 - 0.5 * Math.cos(Math.PI * (u - UP) / (1 - UP))));
    var crest = u > 0.72 ? (u - 0.72) / 0.28 : 0;                       // the next breaker rolling in
    var surge = u < UP ? Math.sin(Math.PI * Math.min(1, u / UP)) * (u < 0.06 ? u / 0.06 : 1) : 0; // the rush up the sand
    var crash = u > 0.9 ? (u - 0.9) / 0.1 : (u < 0.08 ? 1 - u / 0.08 : 0);  // the break
    var backwash = u > UP ? Math.sin(Math.PI * (u - UP) / (1 - UP)) : 0;  // the hiss draining back
    var wetMax = u < UP ? Math.max(swash, prevAmp * (1 - u / UP)) : amp;
    var wetAlpha = u < UP ? 1 : 1 - 0.65 * ((u - UP) / (1 - UP));
    return { swash: swash, amp: amp, crest: crest, surge: surge, crash: crash, backwash: backwash, wetMax: wetMax, wetAlpha: wetAlpha };
  }
  function clockNow() { return ((typeof performance !== 'undefined' ? performance.now() : Date.now()) - T0) / 1000 + 4.0; }

  /* ---------- Shoreline: a living, generated sea (WebGL) ---------- */
  var FRAG = [
    'precision highp float;',
    'uniform vec2 uRes; uniform float uTime, uSwash, uCrest, uWetMax, uWetAlpha, uDark;',
    'float hash(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }',
    'float noise(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f*f*(3.0-2.0*f);',
    '  return mix(mix(hash(i), hash(i+vec2(1.0,0.0)), u.x), mix(hash(i+vec2(0.0,1.0)), hash(i+vec2(1.0,1.0)), u.x), u.y); }',
    'float fbm(vec2 p){ float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++){ v += a*noise(p); p = p*2.03 + 17.1; a *= 0.5; } return v; }',
    'void main(){',
    '  vec2 uv = gl_FragCoord.xy/uRes; uv.y = 1.0-uv.y;',
    '  float asp = uRes.x/uRes.y; vec2 p = vec2(uv.x*asp, uv.y);',
    '  float t = uTime;',
    // shoreline: a soft diagonal, uneven along the beach
    '  float base = 0.40 + 0.10*(uv.x-0.5) + 0.05*sin(p.x*2.1+0.7) + 0.08*(fbm(vec2(p.x*1.4, 3.7))-0.5);',
    '  float lobe = 0.70 + 0.60*fbm(vec2(p.x*2.2 + 0.4, 9.0 + t*0.01));',
    '  float reach = 0.32*lobe;',
    '  float edge = base + uSwash*reach + 0.006*sin(p.x*40.0 + t*0.8)*uSwash;',
    '  float wetEdge = base + uWetMax*reach;',
    '  float d = edge - p.y;',                      // > 0 in the water
    // sand: ripples under raking light, fine grain
    '  float warp = fbm(p*2.6)*1.4;',
    '  float rip = sin(p.y*120.0 + p.x*22.0 + warp*14.0);',
    '  float rip2 = sin(p.y*230.0 - p.x*40.0 + warp*19.0)*0.35;',
    '  float grain = noise(p*vec2(700.0,700.0))*0.6 + noise(p*vec2(260.0))*0.4;',
    '  vec3 dry = mix(vec3(0.905,0.851,0.773), vec3(0.866,0.800,0.712), fbm(p*3.0));',
    '  float dune = fbm(p*vec2(1.2, 2.4));',
    '  vec3 sand = dry*(0.93 + 0.055*rip + 0.025*rip2 + 0.07*(grain-0.5) + 0.06*(dune-0.5));',
    '  float wet = smoothstep(wetEdge+0.012, wetEdge-0.02, p.y)*uWetAlpha;',
    '  float damp = smoothstep(base+0.42, base, p.y)*0.35;',
    '  vec3 wetSand = sand*vec3(0.80,0.79,0.78);',
    '  vec3 col = mix(sand, wetSand, clamp(wet + damp*0.5, 0.0, 1.0));',
    '  col += vec3(0.07)*wet*pow(noise(p*vec2(30.0,90.0)), 3.0);',              // sheen on wet sand
    // water
    '  float depth = max(d, 0.0);',
    '  vec3 shallow = vec3(0.700,0.760,0.720);',
    '  vec3 mid = vec3(0.420,0.560,0.555);',
    '  vec3 deep = vec3(0.247,0.365,0.388);',
    '  vec3 water = mix(shallow, mid, smoothstep(0.02, 0.22, depth));',
    '  water = mix(water, deep, smoothstep(0.18, 0.55, depth + 0.1*(fbm(p*1.5 + t*0.01)-0.5)));',
    '  float swell = sin((p.y + t*0.018)*34.0 + fbm(p*2.5)*5.0)*0.5+0.5;',
    '  water *= 0.97 + 0.05*swell*smoothstep(0.05, 0.3, depth);',
    '  float caus = 1.0 - abs(fbm(p*vec2(13.0,16.0) + vec2(t*0.05, -t*0.07)) - 0.5)*2.0;',
    '  water += vec3(0.10,0.11,0.09)*pow(caus, 7.0)*(1.0 - smoothstep(0.0, 0.16, depth));',
    '  float clear = smoothstep(0.0, 0.10, depth);',
    '  vec3 seen = mix(mix(wetSand*vec3(0.92,0.98,0.97), water, 0.45), water, clear);',
    '  col = mix(col, seen, smoothstep(-0.002, 0.004, d));',
    // glints of sun on the water: sparse, small, gathered along the sun's path
    '  vec2 gp = p*vec2(260.0, 520.0);',
    '  float g = noise(gp + vec2(t*0.9, -t*1.6)) * noise(gp*0.73 - vec2(t*0.6, t*1.1));',
    '  float path = smoothstep(0.75, 0.05, length((uv - vec2(0.78, 0.12))*vec2(1.0, 1.6)));',
    '  float glint = smoothstep(0.70, 0.86, g)*smoothstep(0.04, 0.28, depth)*(0.03 + 0.97*path);',
    '  col += vec3(1.0,0.97,0.90)*glint*0.85;',
    '  col += vec3(0.05,0.045,0.03)*path*smoothstep(0.05, 0.4, depth);',
    // foam: the lace at the edge of the swash and the breaker rolling in
    '  float lace = smoothstep(0.40, 0.70, fbm(p*vec2(22.0,44.0) + vec2(t*0.05, t*0.12)));',
    '  float holes = smoothstep(0.35, 0.55, noise(p*vec2(90.0,140.0) + t*0.2));',
    '  float rim = smoothstep(0.022, 0.0, d)*smoothstep(-0.0025, 0.002, d);',
    '  float band = smoothstep(0.07, 0.0, d)*step(0.0, d)*lace*holes*(0.30 + 0.70*uSwash);',
    '  float back = smoothstep(0.16, 0.02, d)*step(0.0, d)*smoothstep(0.55, 0.85, fbm(p*vec2(8.0, 70.0) + vec2(0.0, t*0.04)))*0.45;',
    '  float crestY = base - 0.36 + 0.36*uCrest;',
    '  float cr = exp(-pow((p.y - crestY + 0.015*sin(p.x*6.0 + t*0.3))/0.010, 2.0))*uCrest*(0.5 + 0.5*lace);',
    '  float foam = clamp(rim*(0.70 + 0.30*lace) + band*0.85 + back + cr*0.75, 0.0, 1.0);',
    '  col = mix(col, vec3(0.965,0.952,0.930), foam);',
    // soft light from the top right, a quiet vignette
    '  col *= 0.94 + 0.08*smoothstep(1.2, 0.0, length(uv - vec2(1.0, 0.0)));',
    '  col *= 1.0 - 0.10*pow(length(uv - 0.5)*1.25, 2.0);',
    '  col *= mix(1.0, 0.82, uDark);',
    '  gl_FragColor = vec4(col, 1.0);',
    '}'
  ].join('\n');
  var VERT = 'attribute vec2 a; void main(){ gl_Position = vec4(a, 0.0, 1.0); }';

  function Shoreline(p) {
    var ref = useRef(null);
    var fb = useState(false), failed = fb[0], setFailed = fb[1];
    useEffect(function () {
      var canvas = ref.current; if (!canvas) return;
      var gl = canvas.getContext('webgl', { antialias: false, premultipliedAlpha: false, preserveDrawingBuffer: false });
      if (!gl) { setFailed(true); return; }
      function sh(type, src) { var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; }
      var prog = gl.createProgram();
      gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { setFailed(true); return; }
      gl.useProgram(prog);
      var buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      var loc = gl.getAttribLocation(prog, 'a'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      var U = {}; ['uRes', 'uTime', 'uSwash', 'uCrest', 'uWetMax', 'uWetAlpha', 'uDark'].forEach(function (n) { U[n] = gl.getUniformLocation(prog, n); });
      var still = p.still || reducedMotion();
      var raf = 0, visible = true, alive = true;
      function size() {
        var r = canvas.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        var w = Math.max(2, Math.round(r.width * dpr)), hh = Math.max(2, Math.round(r.height * dpr));
        if (canvas.width !== w || canvas.height !== hh) { canvas.width = w; canvas.height = hh; gl.viewport(0, 0, w, hh); }
      }
      function draw() {
        size();
        var t = still ? (typeof p.time === 'number' ? p.time : 6.2) : clockNow(), s = waveState(t);
        var dark = 0;
        try { var th = document.documentElement.getAttribute('data-theme'); dark = th === 'dark' || (!th && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 1 : 0; } catch (e) {}
        gl.uniform2f(U.uRes, canvas.width, canvas.height); gl.uniform1f(U.uTime, t);
        gl.uniform1f(U.uSwash, s.swash); gl.uniform1f(U.uCrest, s.crest); gl.uniform1f(U.uWetMax, s.wetMax); gl.uniform1f(U.uWetAlpha, s.wetAlpha); gl.uniform1f(U.uDark, dark);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }
      function loop() { if (!alive) return; if (visible) draw(); raf = requestAnimationFrame(loop); }
      var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }) : null;
      if (io) io.observe(canvas);
      var ro = 'ResizeObserver' in window ? new ResizeObserver(function () { if (still) draw(); }) : null;
      if (ro) ro.observe(canvas);
      if (still) draw(); else loop();
      return function () { alive = false; cancelAnimationFrame(raf); if (io) io.disconnect(); if (ro) ro.disconnect(); };
    }, [p.still, p.time]);
    if (failed && p.fallbackSrc) return h('img', { className: cx('om-shore', p.className), src: p.fallbackSrc, alt: p.label || '' });
    return h('canvas', { ref: ref, className: cx('om-shore', p.className), role: 'img', 'aria-label': p.label || 'Gentle waves washing over sand' });
  }

  /* ---------- WaveSound: generated, restorative surf (Web Audio) ---------- */
  var audio = null;
  function startSound() {
    var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
    var ctx = new AC();
    if (ctx.state === 'suspended' && ctx.resume) ctx.resume();
    var len = ctx.sampleRate * 6, buffer = ctx.createBuffer(2, len, ctx.sampleRate);
    for (var ch = 0; ch < 2; ch++) {           // pink-ish noise, a different take per ear
      var d = buffer.getChannelData(ch), b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0;
      for (var i = 0; i < len; i++) {
        var w = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + w * 0.0555179; b1 = 0.99332 * b1 + w * 0.0750759; b2 = 0.96900 * b2 + w * 0.1538520;
        b3 = 0.86650 * b3 + w * 0.3104856; b4 = 0.55000 * b4 - w * 0.5329522; b5 = -0.7616 * b5 - w * 0.0168980;
        d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + w * 0.5362) * 0.11;
      }
    }
    function src() { var s = ctx.createBufferSource(); s.buffer = buffer; s.loop = true; s.loopStart = Math.random() * 2; s.start(0, Math.random() * 5); return s; }
    var master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
    // distant surf: always there, low and soft
    var bedF = ctx.createBiquadFilter(); bedF.type = 'lowpass'; bedF.frequency.value = 320;
    var bedG = ctx.createGain(); bedG.gain.value = 0.18; src().connect(bedF); bedF.connect(bedG); bedG.connect(master);
    // the rush of a wave up the sand
    var rushF = ctx.createBiquadFilter(); rushF.type = 'lowpass'; rushF.frequency.value = 500; rushF.Q.value = 0.4;
    var rushG = ctx.createGain(); rushG.gain.value = 0; src().connect(rushF); rushF.connect(rushG); rushG.connect(master);
    // the hiss of water draining back through the sand
    var hissF = ctx.createBiquadFilter(); hissF.type = 'bandpass'; hissF.frequency.value = 3800; hissF.Q.value = 0.7;
    var hissG = ctx.createGain(); hissG.gain.value = 0; src().connect(hissF); hissF.connect(hissG); hissG.connect(master);
    master.gain.setTargetAtTime(0.55, ctx.currentTime, 1.2);   // fade in
    var timer = setInterval(function () {
      var s = waveState(clockNow()), now = ctx.currentTime;
      var rush = Math.max(s.surge, s.crash * 0.9) * (0.6 + 0.4 * s.amp);
      rushG.gain.setTargetAtTime(0.06 + 0.62 * rush, now, 0.25);
      rushF.frequency.setTargetAtTime(380 + 1900 * rush, now, 0.3);
      hissG.gain.setTargetAtTime(0.015 + 0.16 * s.backwash * s.amp, now, 0.4);
      hissF.frequency.setTargetAtTime(3200 + 1600 * s.backwash, now, 0.5);
    }, 50);
    return { ctx: ctx, master: master, timer: timer };
  }
  function stopSound() {
    if (!audio) return; var a = audio; audio = null;
    a.master.gain.setTargetAtTime(0, a.ctx.currentTime, 0.4);
    setTimeout(function () { clearInterval(a.timer); a.ctx.close(); }, 1600);
  }
  function announce() { try { window.dispatchEvent(new CustomEvent('om-sound')); } catch (e) {} }
  function WaveSound(p) {
    var st = useState(!!audio), on = st[0], setOn = st[1];
    useEffect(function () {
      function sync() { setOn(!!audio); }
      window.addEventListener('om-sound', sync);
      return function () { window.removeEventListener('om-sound', sync); if (p.stopOnUnmount) stopSound(); };
    }, []);
    function toggle() { if (audio) stopSound(); else audio = startSound(); setOn(!!audio); announce(); }
    var label = on ? (p.onLabel || 'Sound of the sea: on') : (p.offLabel || 'Play the sound of the sea');
    return h('button', { type: 'button', className: cx('om-sound', p.compact && 'om-sound--compact', on && 'is-on', p.className), 'aria-pressed': on, 'aria-label': p.compact ? (on ? 'Turn off the sound of the sea' : 'Play the sound of the sea') : undefined, title: p.compact ? label : undefined, onClick: toggle },
      h('span', { className: 'om-sound__bars', 'aria-hidden': true }, h('i'), h('i'), h('i'), h('i')),
      !p.compact && h('span', { className: 'om-sound__label' }, label));
  }

  /* ---------- Hero ---------- */
  function Hero(p) {
    var media = p.media || (p.image ? null : undefined);
    return h('section', { className: cx('om-hero', p.className) },
      h('div', { className: 'om-hero__inner' },
        h('div', { className: 'om-hero__text' },
          p.eyebrow && h('p', { className: 'om-eyebrow' }, p.eyebrow),
          h('h1', { className: 'om-hero__title' }, p.title),
          p.lead && h('p', { className: 'om-hero__lead' }, p.lead),
          (p.primary || p.secondary) && h('div', { className: 'om-hero__actions' },
            p.primary && h(Button, { href: p.primary.href }, p.primary.label),
            p.secondary && h(Button, { href: p.secondary.href, variant: 'text' }, p.secondary.label)),
          p.footnote && h('div', { className: 'om-hero__footnote' }, p.footnote)),
        h('div', { className: 'om-hero__media' },
          h(ArchImage, { src: p.image, alt: p.imageAlt, tone: p.imageTone || 'sand', label: p.imageLabel, ratio: '4 / 5', eager: true }, media),
          p.mediaCaption && h('div', { className: 'om-hero__caption' }, p.mediaCaption))));
  }

  /* ---------- OfferingCard (stacks when narrow, lies flat when its column is wide) ---------- */
  function OfferingCard(p) {
    return h('article', { className: cx('om-offer', p.className) },
      h('div', { className: 'om-offer__card' },
        h('div', { className: 'om-offer__media' }, h(ArchImage, { eager: p.eager, src: p.image, alt: p.imageAlt, tone: p.tone || 'sand', label: p.imageLabel, ratio: '4 / 3', shape: 'square' })),
        h('div', { className: 'om-offer__body' },
          p.meta && h('p', { className: 'om-offer__meta' }, p.meta),
          h('h3', { className: 'om-offer__title' }, p.title),
          p.description && h('p', { className: 'om-offer__desc' }, p.description),
          h('div', { className: 'om-offer__foot' },
            p.price && h('span', { className: 'om-offer__price' }, p.price),
            p.href && h(Button, { href: p.href, variant: 'text' }, p.actionLabel || 'Learn more')))));
  }

  /* ---------- Affirmation ---------- */
  function Affirmation(p) {
    return h('figure', { className: cx('om-affirm', 'om-tone--' + (p.tone || 'sand'), p.image && 'om-affirm--image', p.className), style: p.image ? { backgroundImage: 'url(' + p.image + ')' } : undefined },
      h('blockquote', null, h('p', null, p.text)),
      p.attribution && h('figcaption', null, p.attribution));
  }

  /* ---------- Testimonial ---------- */
  function Testimonial(p) {
    return h('figure', { className: cx('om-testimonial', p.className) },
      h('span', { className: 'om-testimonial__mark', 'aria-hidden': true }, '“'),
      h('blockquote', null, h('p', null, p.quote)),
      h('figcaption', null, h('span', { className: 'om-testimonial__name' }, p.name), p.detail && h('span', { className: 'om-testimonial__detail' }, p.detail)));
  }

  /* ---------- AboutStory ---------- */
  function AboutStory(p) {
    var paras = p.paragraphs || [];
    return h('div', { className: cx('om-about', p.reverse && 'om-about--reverse', p.className) },
      h('div', { className: 'om-about__inner' },
        h('div', { className: 'om-about__media' }, h(ArchImage, { eager: p.eager, src: p.image, alt: p.imageAlt, tone: p.imageTone || 'stone', label: p.imageLabel, ratio: '3 / 4' })),
        h('div', { className: 'om-about__text' },
          h(SectionHeading, { eyebrow: p.eyebrow, title: p.title }),
          paras.map(function (t, i) { return h('p', { key: i, className: i === 0 ? 'om-about__first' : undefined }, t); }),
          p.signature && h('p', { className: 'om-about__signature' }, p.signature),
          p.action && h(Button, { href: p.action.href, variant: 'outline' }, p.action.label))));
  }

  /* ---------- JourneySteps ---------- */
  function JourneySteps(p) {
    var steps = p.steps || [];
    return h('div', { className: cx('om-steps-wrap', p.className) }, h('ol', { className: 'om-steps' }, steps.map(function (s, i) {
      return h('li', { key: i, className: 'om-steps__item' },
        h('span', { className: 'om-steps__num', 'aria-hidden': true }, String(i + 1).padStart(2, '0')),
        h('div', { className: 'om-steps__body' },
          h('h3', { className: 'om-steps__title' }, s.title),
          s.text && h('p', { className: 'om-steps__text' }, s.text)));
    })));
  }

  /* ---------- MoodStrip: the palette at its real proportions ---------- */
  var DEFAULT_MIX = [
    { name: 'Ivory', token: 'surface', weight: 46, tier: 'Neutral' },
    { name: 'Linen', token: 'surface-sunken', weight: 20, tier: 'Neutral' },
    { name: 'Sand', token: 'sand', weight: 12, tier: 'Neutral' },
    { name: 'Stone', token: 'stone', weight: 7, tier: 'Neutral' },
    { name: 'Sage', token: 'sage', weight: 5, tier: 'Natural' },
    { name: 'Ink', token: 'ink', weight: 4, tier: 'Natural' },
    { name: 'Gold', token: 'gold', weight: 3, tier: 'Accent' },
    { name: 'Forest', token: 'forest', weight: 1.5, tier: 'Accent' },
    { name: 'Ocean', token: 'ocean', weight: 0.5, tier: 'Accent' },
    { name: 'Clay', token: 'clay', weight: 0.5, tier: 'Accent' },
    { name: 'Chestnut', token: 'chestnut', weight: 0.5, tier: 'Accent' }
  ];
  function MoodStrip(p) {
    var bands = p.bands || DEFAULT_MIX;
    var total = bands.reduce(function (a, b) { return a + (b.weight || 1); }, 0);
    var tiers = {};
    bands.forEach(function (b) { if (b.tier) tiers[b.tier] = (tiers[b.tier] || 0) + (b.weight || 1); });
    function pct(v) { var x = v / total * 100, r = Math.round(x * 10) / 10; return (r % 1 ? r.toFixed(1) : String(r)) + '%'; }
    return h('figure', { className: cx('om-mood', p.className) },
      h('div', { className: 'om-mood__strip', style: { height: p.height || 280 } }, bands.map(function (b, i) {
        var st = { flexGrow: b.weight || 1, background: b.token ? 'var(--' + b.token + ')' : undefined };
        if (b.image) { st.backgroundImage = 'url(' + b.image + ')'; st.backgroundSize = 'cover'; st.backgroundPosition = 'center'; }
        var wide = (b.weight || 1) / total > 0.06;
        return h('div', { key: i, className: cx('om-mood__band', b.token && 'om-on--' + b.token), style: st, title: b.name + ' ' + pct(b.weight || 1) },
          wide && p.labels !== false && h('span', { className: 'om-mood__label' }, b.name + ' · ' + pct(b.weight || 1)));
      })),
      p.legend !== false && h('figcaption', { className: 'om-mood__legend' },
        Object.keys(tiers).length > 0 && h('p', { className: 'om-mood__tiers' }, Object.keys(tiers).map(function (t, i) {
          return h('span', { key: t }, (i ? ' · ' : '') + t + 's ' + pct(tiers[t]));
        })),
        h('ul', null, bands.map(function (b, i) {
          return h('li', { key: i }, h('span', { className: 'om-mood__chip', style: { background: b.token ? 'var(--' + b.token + ')' : undefined } }), h('span', null, b.name), h('span', { className: 'om-mood__pct' }, pct(b.weight || 1)));
        }))));
  }

  /* ---------- CTABand ---------- */
  function CTABand(p) {
    return h('section', { className: cx('om-cta', 'om-cta--' + (p.tone || 'sand'), p.className) },
      h('div', { className: 'om-cta__inner' },
        p.logo !== false && h(Logo, { cut: 'small', tone: p.tone === 'forest' ? 'current' : 'gold', className: 'om-cta__mark' }),
        p.eyebrow && h('p', { className: 'om-eyebrow' }, p.eyebrow),
        h('h2', { className: 'om-cta__title' }, p.title),
        p.text && h('p', { className: 'om-cta__text' }, p.text),
        (p.action || p.extra) && h('div', { className: 'om-cta__actions' },
          p.action && h(Button, { href: p.action.href, variant: p.tone === 'forest' ? 'light' : 'primary' }, p.action.label),
          p.extra)));
  }

  /* ---------- TextField ---------- */
  var uid = 0;
  function TextField(p) {
    var idState = useState(function () { uid += 1; return 'om-field-' + uid; });
    var id = p.id || idState[0];
    var Tag = p.multiline ? 'textarea' : 'input';
    var describedBy = cx(p.hint && id + '-hint', p.error && id + '-err') || undefined;
    var r = rest(p, ['label', 'hint', 'error', 'multiline', 'className', 'id']);
    return h('div', { className: cx('om-field', p.error && 'om-field--error', p.className) },
      h('label', { htmlFor: id, className: 'om-field__label' }, p.label, p.required && h('span', { 'aria-hidden': true }, ' *')),
      h(Tag, Object.assign({ id: id, className: 'om-field__input', 'aria-invalid': p.error ? true : undefined, 'aria-describedby': describedBy, rows: p.multiline ? 4 : undefined }, r)),
      p.hint && !p.error && h('p', { id: id + '-hint', className: 'om-field__hint' }, p.hint),
      p.error && h('p', { id: id + '-err', className: 'om-field__error', role: 'alert' }, p.error));
  }

  /* ---------- NewsletterForm ---------- */
  function NewsletterForm(p) {
    var s = useState(p.initialStatus || 'idle'), status = s[0], setStatus = s[1];
    var e = useState(''), email = e[0], setEmail = e[1];
    var er = useState(p.initialError || ''), err = er[0], setErr = er[1];
    function submit(ev) {
      ev.preventDefault();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setErr('Please enter an email address like name@example.com.'); return; }
      setErr('');
      var done = function () { setStatus('done'); };
      var res = p.onSubmit ? p.onSubmit(email) : null;
      if (res && res.then) { setStatus('sending'); res.then(done, function () { setStatus('idle'); setErr('That didn’t go through. Please try again in a moment.'); }); } else done();
    }
    return h('div', { className: cx('om-news', p.className) },
      h('div', { className: 'om-news__inner' },
        h('div', { className: 'om-news__copy' },
          p.eyebrow && h('p', { className: 'om-eyebrow' }, p.eyebrow),
          h('h2', { className: 'om-news__title' }, p.title || 'Letters for the journey'),
          p.text && h('p', { className: 'om-news__text' }, p.text)),
        status === 'done'
          ? h('p', { className: 'om-news__done', role: 'status' }, p.doneText || '✓ Thank you. Your first letter is on its way.')
          : h('form', { className: 'om-news__form', onSubmit: submit, noValidate: true },
              h(TextField, { id: p.fieldId || 'om-news-email', label: 'Email address', type: 'email', name: 'email', autoComplete: 'email', value: email, error: err, onChange: function (ev) { setEmail(ev.target.value); } }),
              h(Button, { type: 'submit', disabled: status === 'sending' }, status === 'sending' ? 'Sending…' : (p.buttonLabel || 'Subscribe')))));
  }

  /* ---------- FAQ ---------- */
  function FAQ(p) {
    var items = p.items || [];
    return h('div', { className: cx('om-faq', p.className) }, items.map(function (it, i) {
      return h('details', { key: i, className: 'om-faq__item', open: p.openFirst && i === 0 ? true : undefined },
        h('summary', null, h('span', null, it.q), h('span', { className: 'om-faq__icon', 'aria-hidden': true })),
        h('div', { className: 'om-faq__a' }, h('p', null, it.a)));
    }));
  }

  /* ---------- SiteFooter ---------- */
  function SiteFooter(p) {
    var cols = p.columns || [];
    return h('footer', { className: 'om-footer' }, h('div', { className: 'om-footer__wrap' },
      h('div', { className: 'om-footer__inner' },
        h('div', { className: 'om-footer__brand' },
          h(Logo, { cut: 'small', tone: 'gold', className: 'om-footer__logo' }),
          p.tagline && h('p', { className: 'om-footer__tagline' }, p.tagline)),
        cols.map(function (c, i) {
          return h('div', { key: i, className: 'om-footer__col' },
            h('p', { className: 'om-eyebrow' }, c.title),
            h('ul', null, (c.links || []).map(function (l, j) {
              return h('li', { key: j }, l.href ? h('a', { href: l.href }, l.label) : l.label);
            })));
        })),
      h('div', { className: 'om-footer__base' },
        h('span', null, '© ' + (p.year || new Date().getFullYear()) + ' Salon OM'),
        p.note && h('span', null, p.note))));
  }

  var api = { Logo: Logo, Button: Button, Section: Section, SectionHeading: SectionHeading, SiteHeader: SiteHeader, Hero: Hero, ArchImage: ArchImage,
    Shoreline: Shoreline, WaveSound: WaveSound, OfferingCard: OfferingCard, Affirmation: Affirmation, Testimonial: Testimonial, AboutStory: AboutStory,
    JourneySteps: JourneySteps, MoodStrip: MoodStrip, CTABand: CTABand, TextField: TextField, NewsletterForm: NewsletterForm, FAQ: FAQ, SiteFooter: SiteFooter,
    waveState: waveState, PALETTE_MIX: DEFAULT_MIX };
  window.SalonOM = Object.assign(window.SalonOM || {}, api);
})();
