/* The lenticular sheet (task e5325977; Designer 3's no-WebGL sheet, task 9b13c4b2, salon-om-lens-options r6 and r7, after
   J's 18 Nov ask: "Take inspiration from how the iphone duo has that folding effect ... The lenticular sheet is a great
   inspiration"; "never have cards that are simple on top like that, use the lenticular sheet and glass effects if you need
   something on top"). ONE block: any element with data-sheet="<preset>" holding a photo (.sh__ph, an <img>) and its words
   (.sh__words) gets a milky ribbed sheet over the photo, the words riding on a soft frost. No WebGL (J's desktop Safari hands
   pages only lost WebGL contexts, measured 18 Nov): at first use the photo is smeared sideways three times (Gaussian sigma
   .006, .016 and .04 of its width, each from the one before) and each frame only sets which copy shows how much (the sheet's
   distance from the photo), the sheet's outline, the milky haze, the frost behind the words, a rainbow arc and the glass rim.
   Presets A-I are r6's and r7's options, unchanged in their motion. A sheet draws only while on screen; calm motion holds it
   still; found again whenever the option switcher swaps a section ("om:swap"). */
(function () {
  'use strict';
  var clamp = function (a, lo, hi) { return Math.max(lo, Math.min(hi, a)); };
  var ease = function (a) { a = clamp(a, 0, 1); return a * a * (3 - 2 * a); };
  var root = document.documentElement, stages = [], scrollY0 = pageYOffset, scrollV = 0, LV = [.006, .016, .04], cache = {}, streak = null, running = false, t0 = performance.now();
  var calm = function () { return root.getAttribute('data-motion') === 'calm' || matchMedia('(prefers-reduced-motion: reduce)').matches; };
  function blurRows(src, w, h, r) {                                   // one sideways box pass, running sums per row
    var out = new Uint8ClampedArray(src.length), n = 2 * r + 1;
    for (var y = 0; y < h; y++) {
      var row = y * w * 4, sr = 0, sg = 0, sb = 0, k, xi;
      for (k = -r; k <= r; k++) { xi = row + clamp(k, 0, w - 1) * 4; sr += src[xi]; sg += src[xi + 1]; sb += src[xi + 2]; }
      for (var x = 0; x < w; x++) {
        var o = row + x * 4; out[o] = sr / n; out[o + 1] = sg / n; out[o + 2] = sb / n; out[o + 3] = 255;
        var xa = row + Math.min(w - 1, x + r + 1) * 4, xr = row + Math.max(0, x - r) * 4;
        sr += src[xa] - src[xr]; sg += src[xa + 1] - src[xr + 1]; sb += src[xa + 2] - src[xr + 2];
      }
    }
    return out;
  }
  function gauss(d, w, h, sigma) { var r = Math.max(1, Math.round((Math.sqrt(4 * sigma * sigma + 1) - 1) / 2)); return blurRows(blurRows(blurRows(d, w, h, r), w, h, r), w, h, r); }
  function turn(d, w, h) {                                            // rows become columns, so the sideways pass also blurs down
    var o = new Uint8ClampedArray(d.length);
    for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) { var i = (y * w + x) * 4, j = (x * h + y) * 4; o[j] = d[i]; o[j + 1] = d[i + 1]; o[j + 2] = d[i + 2]; o[j + 3] = d[i + 3]; }
    return o;
  }
  function streakTexture() {          // the ribs, too fine to see one by one: a soft, irregular vertical streak, never a stripe
    if (streak) return streak;
    var sc = document.createElement('canvas'); sc.width = 1024; sc.height = 4; var g = sc.getContext('2d'), im = g.createImageData(1024, 4);
    var hsh = function (n) { var x = Math.sin(n * 127.1) * 43758.5453; return x - Math.floor(x); };
    var vn = function (x) { var i = Math.floor(x), f = x - i; f = f * f * (3 - 2 * f); return hsh(i) * (1 - f) + hsh(i + 1) * f; };
    for (var x = 0; x < 1024; x++) { var v = 128 + 70 * (vn(x / 26) - .5) + 30 * (vn(x / 11 + 7) - .5); for (var y = 0; y < 4; y++) { var o = (y * 1024 + x) * 4; im.data[o] = im.data[o + 1] = im.data[o + 2] = v; im.data[o + 3] = 255; } }
    g.putImageData(im, 0, 0); return (streak = sc.toDataURL('image/png'));
  }
  function copiesOf(src, done) {      // the three sideways smears of one photo, made once per photo
    var c = cache[src]; if (c && c.urls) return done(c.urls, c.nat); if (c) return c.wait.push(done);
    c = cache[src] = { wait: [done] }; var photo = new Image(); photo.decoding = 'async';
    photo.onload = function () {
      try {
        var w = 960, h = Math.round(photo.naturalHeight * w / photo.naturalWidth), cv = document.createElement('canvas'); cv.width = w; cv.height = h;
        var g = cv.getContext('2d'); g.drawImage(photo, 0, 0, w, h);
        var cur = g.getImageData(0, 0, w, h).data, had = 0, out = [];
        LV.forEach(function (S) {
          var sp = S * w; cur = gauss(cur, w, h, Math.sqrt(sp * sp - had * had)); had = sp;
          var cc = document.createElement('canvas'); cc.width = w; cc.height = h; cc.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(cur), w, h), 0, 0);
          out.push(cc.toDataURL('image/jpeg', .92));
        });
        c.urls = out; c.nat = [photo.naturalWidth, photo.naturalHeight];
      } catch (e) { c.err = e.message; }
      c.wait.forEach(function (f) { f(c.urls, c.nat, c.err); }); c.wait = [];
    };
    photo.onerror = function () { c.err = 'the photo did not load'; c.wait.forEach(function (f) { f(null, null, c.err); }); };
    photo.src = src;
  }
  var LAYERS = '<div class="sh__shade"></div><div class="sh__sheet"><img class="s1" alt=""><img class="s2" alt=""><img class="s3" alt=""><div class="sh__streak"></div><div class="sh__milk"></div><div class="sh__rain"></div></div>'
    + '<div class="sh__sheet2"><img class="s1" alt=""><img class="s2" alt=""><img class="s3" alt=""><div class="sh__milk"></div></div><div class="sh__frost"></div><div class="sh__rim"></div>';
  function Stage(el) {
    var me = this, ph = el.querySelector('.sh__ph img');
    this.el = el; this.id = el.getAttribute('data-sheet'); this.wd = el.querySelector('.sh__words'); this.ph = ph;
    ph.parentNode.insertAdjacentHTML('afterend', LAYERS);
    var q = function (c) { return el.querySelector(c); }, q2 = function (c) { return el.querySelector('.sh__sheet2 ' + c); };
    this.L = { sheet: q('.sh__sheet'), s: [q('.sh__sheet .s1'), q('.sh__sheet .s2'), q('.sh__sheet .s3')], streak: q('.sh__streak'), milk: q('.sh__sheet .sh__milk'), frost: q('.sh__frost'),
      rain: q('.sh__rain'), rim: q('.sh__rim'), shade: q('.sh__shade'), sheet2: q('.sh__sheet2'), s2: [q2('.s1'), q2('.s2'), q2('.s3')], milk2: q2('.sh__milk'), ph: ph };
    this.last = {}; this.px = .5; this.py = .5; this.pointerAt = -1e9; this.vis = false; this.frames = 0; this.dx = null; this.dy = null; this.nat = [1500, 1000];
    el.addEventListener('pointermove', function (e) { var r = el.getBoundingClientRect(); me.px = (e.clientX - r.left) / r.width; me.py = (e.clientY - r.top) / r.height; me.pointerAt = performance.now(); });
    el.addEventListener('pointerdown', function (e) { var r = el.getBoundingClientRect(); me.px = (e.clientX - r.left) / r.width; me.py = (e.clientY - r.top) / r.height; me.pointerAt = performance.now(); });
    // the stage grows to hold its words when they are taller than the screen (Inner Work's long list on a phone), so no word is
    // ever cut off at its foot (task 95e37a41). Sized whenever its words change size (the page loading, a resize, the fonts
    // arriving, the other world's page shown), never first when it comes on screen: a section that grows under the reader moves
    // the page (the tall-section pull measured it, qa/r4 snap). The room it keeps is place()'s: the header above, the door bar below.
    this.fit = function () {
      if (!me.wd.offsetHeight) return;                                  // its world's page is hidden: sized when it is shown
      var hdr = parseFloat(getComputedStyle(root).getPropertyValue('--hdr')) || 76, f = Math.ceil(hdr + 14 + me.wd.offsetHeight + (el.clientWidth < 700 ? 92 : 40));
      me.set(el, 'mh', 'minHeight', f > innerHeight ? f + 'px' : '');
    };
    this.fit(); if ('ResizeObserver' in window) new ResizeObserver(function () { me.fit(); me.fz = null; }).observe(this.wd); else addEventListener('resize', function () { me.fit(); me.fz = null; });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { me.vis = es[0].isIntersecting; if (me.vis) start(); }, { rootMargin: '15% 0px' }).observe(el); else this.vis = true;
    // the photo loads a screen and a half ahead, so its smears are made before the section arrives and its entry (the picture
    // settling in, the words appearing: mgs.css) plays on the drawn sheet as it comes on screen (task 4739f125)
    if ('IntersectionObserver' in window && ph.loading === 'lazy') { var near = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { ph.loading = 'eager'; near.disconnect(); } }, { rootMargin: '150% 0px' }); near.observe(el); }
    function load() {
      copiesOf(ph.currentSrc || ph.src, function (urls, nat, err) {
        if (!urls) { el.setAttribute('data-sheet-error', err || 'no smear'); return; }
        me.nat = nat; me.L.s.concat(me.L.s2).forEach(function (im, i) { im.src = urls[i % 3]; }); me.L.streak.style.backgroundImage = 'url(' + streakTexture() + ')';
        me.ready = true; el.classList.add('sh--on'); start();
      });
    }
    if (ph.complete && ph.naturalWidth) load(); else ph.addEventListener('load', load, { once: true });
  }
  Stage.prototype.set = function (el, key, prop, val) { if (this.last[key] === val) return; this.last[key] = val; el.style[prop] = val; };
  function soft(a0, a1, b0, b1, f) {   // a soft rectangle as a mask: two feathered gradients, intersected (smooth in J's Safari, r6 E)
    return 'linear-gradient(to right, transparent ' + (a0 - f).toFixed(0) + 'px, #000 ' + a0.toFixed(0) + 'px, #000 ' + a1.toFixed(0) + 'px, transparent ' + (a1 + f).toFixed(0) + 'px), linear-gradient(to bottom, transparent ' + (b0 - f).toFixed(0) + 'px, #000 ' + b0.toFixed(0) + 'px, #000 ' + b1.toFixed(0) + 'px, transparent ' + (b1 + f).toFixed(0) + 'px)';
  }
  function spec(x) { var r = clamp(1.5 - Math.abs(4 * x - 3), 0, 1), g = clamp(1.5 - Math.abs(4 * x - 2), 0, 1), b = clamp(1.5 - Math.abs(4 * x - 1), 0, 1); return [r * .7 + .3, g * .7 + .3, b * .7 + .3]; }
  function rainbow(cx, cy, R) {
    var st = ['rgba(0,0,0,0) ' + Math.max(0, R - 46).toFixed(1) + 'px'];
    for (var i = 1; i < 10; i++) { var rt = -1 + i * .2, c = spec(rt * .5 + .5), a = (1 - rt * rt); st.push('rgba(' + Math.round(c[0] * 255) + ',' + Math.round(c[1] * 255) + ',' + Math.round(c[2] * 255) + ',' + a.toFixed(3) + ') ' + (R + rt * 46).toFixed(1) + 'px'); }
    st.push('rgba(0,0,0,0) ' + (R + 46).toFixed(1) + 'px');
    return 'radial-gradient(circle at ' + cx.toFixed(1) + 'px ' + cy.toFixed(1) + 'px, ' + st.join(', ') + ')';
  }
  // each preset: where the sheet is, its lenses, how far it is held from the photo, the light (t = seconds, r = the stage's box)
  var OPT = {
    A: function (s, W, H, t, r, vh) {                                                         // lowers and rises, 6.5 s; scrolling lowers it further
      var phone = W < 700, auto = .5 - .5 * Math.cos(t * 2 * Math.PI / 6.5), sc = ease((vh * .55 - r.top) / (vh * .9)) * .12;
      var topY = H * (-.04 + (phone ? .26 : .36) * auto + sc), sway = Math.sin(t * .9) * 5;
      s.place(phone ? 18 : W * .045, H - s.wdH - (phone ? 36 : H * .08));
      return { rect: [-40 + sway, W + 40 + sway, topY, H + 60], bow: 9, ph: t * 6, dist: 1, blur: phone ? 60 : 100, jit: 7, rib: phone ? 22 : 30,
        haze: .48, disp: .05, thick: 4, rbI: .10, rbC: [W * .7, topY + H * 1.05, H * .9], wz: s.wz(), wzI: .42 };
    },
    B: function (s, W, H, t, r, vh) {                                                         // breathes, 5 s
      var phone = W < 700, br = .5 - .5 * Math.cos(t * 2 * Math.PI / 5), sc = clamp(Math.abs(scrollV) * .01, 0, .25);
      s.place(phone ? 18 : W * .045, phone ? 40 : (H - s.wdH) * .5);
      return { rect: [-40, W + 40, -60, H + 60], bow: 0, ph: t * 4, dist: clamp(.15 + .85 * br + sc, 0, 1), blur: phone ? 60 : 100, jit: 8, rib: phone ? 20 : 28,
        haze: .46, disp: .06, thick: 0, rbI: .10, rbC: [W * (.2 + .6 * (.5 + .5 * Math.sin(t * .45))), H * 1.55, H * 1.25], wz: s.wz(), wzI: .42 };
    },
    C: function (s, W, H, t, r, vh) {                                                         // its edge slides in and out by itself; scrolling too
      var phone = W < 700, edge = W * (phone ? .82 + .05 * Math.sin(t * .6) : .54 + .06 * Math.sin(t * .6)) - r.top * .04;
      edge = clamp(edge, W * (phone ? .76 : .47), W * (phone ? .9 : .64));
      s.place(phone ? 16 : W * .045, (H - s.wdH) * .5, phone ? W * .7 : 0);
      return { rect: [-40, edge, -60, H + 60], bow: 0, ph: t * 5, dist: 1, blur: phone ? 50 : 80, jit: 7, rib: phone ? 22 : 28,
        haze: .44, disp: .06, thick: 7, rbI: .09, rbC: [edge + 260, H * .35, 520], wz: s.wz(), wzI: .42 };
    },
    D: function (s, W, H, t, r, vh) {                                                         // drifts by itself, follows the pointer
      var phone = W < 700, sw = phone ? W * .86 : Math.min(W * .44, 620), shh = phone ? H * .72 : H * .78;
      var tx = W * (.5 + (phone ? .04 : .26) * Math.sin(t * .55)), ty = H * (.5 + .04 * Math.sin(t * .9));
      if (performance.now() - s.pointerAt < 2500) { tx = s.px * W; ty = s.py * H; }
      tx = clamp(tx, sw * .5 + 8, W - sw * .5 - 8); ty = clamp(ty, shh * .5 + 8, H - shh * .5 - 8);
      if (s.dx === null || window.__lensT != null) { s.dx = tx; s.dy = ty; }
      s.dx += (tx - s.dx) * .08; s.dy += (ty - s.dy) * .08;
      var L = s.dx - sw * .5, T = s.dy - shh * .5;
      s.place(L + (phone ? 14 : 30), T + (shh - s.wdH) * .5, sw - (phone ? 28 : 60));
      return { rect: [L, L + sw, T, T + shh], bow: 7, ph: t * 5, dist: 1, blur: phone ? 50 : 70, jit: 7, rib: 28,
        haze: .42, disp: .06, thick: 6, rbI: .10, rbC: [L + sw * 1.1, T + shh * 1.6, shh * 1.25], wz: s.wz(), wzI: .40 };
    },
    E: function (s, W, H, t, r, vh) {                                                         // only behind the words, a soft gradient mask; it breathes
      var phone = W < 700, br = .5 + .5 * Math.sin(t * 2 * Math.PI / 6);
      s.place(phone ? 18 : W * .06, (H - s.wdH) * .5, phone ? 0 : W * .36);
      return { rect: [-40, W + 40, -60, H + 60], bow: 0, ph: t * 8, dist: .8 + .2 * br, blur: phone ? 50 : 80, jit: 7, rib: 28,
        haze: .46, disp: .05, thick: 0, rbI: .08, rbC: [W * (.15 + .3 * br), H * 1.3, H * 1.0], wz: s.wz(), wzI: .42,
        mask: (function (wz, p, f) { return soft(wz[0] - p, wz[2] + p, wz[1] - p, wz[3] + p, f); })(s.wz(), (phone ? 18 : 40) + 16 * br, phone ? 70 : 140), maskAnd: 1 };
    },
    F: function (s, W, H, t, r, vh) {                                                         // the whole section under the sheet; a clear window around the picture's subject, away from the words
      var phone = W < 700;
      s.place(phone ? 18 : W * .045, phone ? H - s.wdH - 40 : (H - s.wdH) * .5, phone ? 0 : W * .48);   // .4 -> .48: the larger words' column (task 4739f125)
      var w = s.subject(W, H), drift = -clamp(r.top, -H, H) * .06;
      if (w) { w.x += W * .012 * Math.sin(t * .35); w.y += H * .015 * Math.sin(t * .5) + drift; }
      else {                                                                                // no subject named: the window drifts on the right, as before
        var R0 = Math.min(W, H) * (phone ? .16 : .15);
        w = { x: phone ? W * (.5 + .28 * Math.sin(t * .4)) : W * (.7 + .15 * Math.sin(t * .35)), y: (phone ? H * (.2 + .06 * Math.sin(t * .5)) : H * (.45 + .14 * Math.sin(t * .5))) - clamp(r.top, -H, H) * .12, rx: R0 * 2.8, ry: R0 * 2.8, c: 1 / 2.8 };
      }
      s.win = w;                                                                            // read by qa/lens-contrast.mjs (the worst moment)
      var at = w.rx.toFixed(0) + 'px ' + w.ry.toFixed(0) + 'px at ' + w.x.toFixed(0) + 'px ' + w.y.toFixed(0) + 'px', c = w.c * 100, f = 100 - c;
      return { rect: [-40, W + 40, -60, H + 60], bow: 0, ph: t * 5, dist: 1, blur: phone ? 60 : 100, jit: 7, rib: 28, haze: .46, disp: .05, thick: 0, rbI: .08, rbC: [W * .3, H * 1.4, H * 1.1], wz: s.wz(), wzI: .7,   // the frost .5 -> .7 (task 95e37a41: J 19 Nov "I need more contrast with the text on the left"; 7:1 at the drift's worst moment)
        // its edge eases out over the outer two fifths of the oval, so the window melts into the sheet (J 19 Nov 14:25 Z)
        mask: 'radial-gradient(ellipse ' + at + ', transparent ' + c.toFixed(1) + '%, rgba(0,0,0,.18) ' + (c + f * .3).toFixed(1) + '%, rgba(0,0,0,.6) ' + (c + f * .62).toFixed(1) + '%, #000 100%)' };
    },
    G: function (s, W, H, t, r, vh) {                                                         // deepest behind the words, lighter further out
      var phone = W < 700, br = .5 + .5 * Math.sin(t * 2 * Math.PI / 7);
      s.place(phone ? 18 : W * .045, phone ? 40 : (H - s.wdH) * .5, phone ? 0 : W * .4);
      return { rect: [-40, W + 40, -60, H + 60], bow: 0, ph: t * 4, dist: .32 + .14 * br, blur: phone ? 60 : 100, jit: 6, rib: 28, haze: .22, disp: .04, thick: 0, rbI: .07, rbC: [W * (.55 + .2 * br), H * 1.5, H * 1.2], wz: s.wz(), wzI: .5,
        inner: { dist: 1, blur: phone ? 60 : 100, haze: .48, pad: (phone ? 10 : 30) + 22 * br, fe: phone ? 140 : 340 } };
    },
    H: function (s, W, H, t, r, vh) {                                                         // a focus pull with the scroll, the photo moving behind the sheet
      var phone = W < 700, k = clamp(1 - Math.abs((r.top + H / 2) - vh / 2) / (vh * .9), 0, 1), br = .5 + .5 * Math.sin(t * 2 * Math.PI / 6);
      s.place(phone ? 18 : W * .045, phone ? 40 : (H - s.wdH) * .5, phone ? 0 : W * .4);
      return { rect: [-40, W + 40, -60, H + 60], bow: 0, ph: t * 5 + r.top * .3, dist: clamp(.5 + .3 * k + .2 * br, 0, 1), blur: phone ? 60 : 100, jit: 7, rib: 28, haze: .44, disp: .05, thick: 0, rbI: .08,
        rbC: [W * (.4 + .3 * br), H * 1.45, H * 1.15], wz: s.wz(), wzI: .5, par: clamp(-r.top * .12, -60, 60) + 18 * Math.sin(t * .5) };
    },
    I: function (s, W, H, t, r, vh) {                                                         // a lighter sheet over everything; the frost only a glow around each letter
      var phone = W < 700, br = .5 + .5 * Math.sin(t * 2 * Math.PI / 6.5);
      s.place(phone ? 18 : W * .045, phone ? 40 : (H - s.wdH) * .5, phone ? 0 : W * .4);
      return { rect: [-40, W + 40, -60, H + 60], bow: 0, ph: t * 6, dist: .55 + .2 * br, blur: phone ? 60 : 100, jit: 7, rib: 28, haze: .34, disp: .05, thick: 0, rbI: .08,
        rbC: [W * (.2 + .5 * br), H * 1.5, H * 1.2], wz: s.wz(), wzI: .28, glow: 1 };
    }
  };
  // the words stay clear of the page's header above and its floating door below (the presets were drawn for a bare page)
  Stage.prototype.place = function (x, y, w) {
    var d = this.wd, H = this.el.clientHeight, top = this.hdr + 14, low = H - this.wdH - (this.el.clientWidth < 700 ? 92 : 40);
    if (w) d.style.width = w + 'px'; else d.style.width = '';
    y = clamp(y, top, Math.max(top, low));
    d.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)'; this.wx = x; this.wy = y;
  };
  Stage.prototype.wz = function () { return [this.wx + 10, this.wy, this.wx + this.wd.offsetWidth - 20, this.wy + this.wdH]; };
  // the picture's subject on the screen (data-subject: left top right bottom, fractions of the picture, mgs_sections.SUBJECTS),
  // through the photo's own crop (object-fit cover at its object-position), as a clear oval around it: the subject stands in the
  // clear part (the inner 58 % of the oval), which never shrinks under a sixth of the screen (task 4739f125)
  Stage.prototype.subject = function (W, H) {
    var b = (this.el.getAttribute('data-subject') || '').split(/\s+/).map(Number); if (b.length !== 4 || b.some(isNaN)) return null;
    var nw = this.nat[0], nh = this.nat[1], k = Math.max(W / nw, H / nh), op = this.op || (this.op = (getComputedStyle(this.ph).objectPosition || '50% 30%').split(' ').map(parseFloat));
    var ox = (W - nw * k) * (op[0] || 50) / 100, oy = (H - nh * k) * (isNaN(op[1]) ? 30 : op[1]) / 100, c = .58;
    var x0 = ox + b[0] * nw * k, x1 = ox + b[2] * nw * k, y0 = oy + b[1] * nh * k, y1 = Math.min(H, oy + b[3] * nh * k);
    var m = Math.min(W, H) / 6 / c;
    return { x: (x0 + x1) / 2, y: (Math.max(0, y0) + y1) / 2, rx: Math.max(m, (x1 - x0) / 2 * 1.15 / c), ry: Math.max(m, (y1 - Math.max(0, y0)) / 2 * 1.15 / c), c: c };
  };
  // the frost behind the words, shaped by the words themselves (task 4739f125; J 19 Nov 14:25 Z: "it looks too square ... The
  // edge is very small and very clear. If you can blend it more so that the edge merges with the surroundings"): each line of
  // text and each button, widened a little, drawn on a small canvas and blurred far (a Gaussian about a twentieth of the stage
  // wide), then lifted so every letter stands on the full frost; the frost melts away over a long distance around the lines'
  // own ragged shape, never a rectangle. Made when the words change size (the stage's ResizeObserver), never per frame.
  Stage.prototype.shape = function () {
    var wd = this.wd; if (!wd.offsetHeight) return;
    var b = wd.getBoundingClientRect(), W = this.el.clientWidth, fs = parseFloat(getComputedStyle(wd).fontSize) || 17;
    // P, how far each line is widened before the blur, is about the blur itself, so even a lone line's end stands on the full frost
    // (at 5d135c1 P was 26 px under a 72 px blur: the end of Why Aveda's longest fact line read 5.3:1 over the fig's leaves)
    var sg = clamp(W * .05, 50, 180), P = Math.max(26, fs * 1.5, sg * .9), M = Math.ceil(3.2 * sg + P), k = .125;
    var cw = Math.ceil((b.width + 2 * M) * k), ch = Math.ceil((b.height + 2 * M) * k), cv = document.createElement('canvas'), g = cv.getContext('2d');
    cv.width = cw; cv.height = ch; g.fillStyle = '#000'; g.fillRect(0, 0, cw, ch); g.fillStyle = '#fff';
    var add = function (r) { if (r.width >= 1 && r.height >= 1) g.fillRect((r.left - b.left + M - P) * k, (r.top - b.top + M - P) * k, (r.width + 2 * P) * k, (r.height + 2 * P) * k); };
    var tw = document.createTreeWalker(wd, NodeFilter.SHOW_TEXT), rg = document.createRange(), n;
    while ((n = tw.nextNode())) { if (!n.nodeValue.trim() || n.parentNode.closest('.btn')) continue; rg.selectNodeContents(n); [].forEach.call(rg.getClientRects(), add); }
    [].forEach.call(wd.querySelectorAll('.btn'), function (e) { add(e.getBoundingClientRect()); });
    var d = g.getImageData(0, 0, cw, ch).data, s = sg * k;
    d = turn(gauss(turn(gauss(d, cw, ch, s), cw, ch), ch, cw, s), ch, cw);
    var im = g.createImageData(cw, ch);
    for (var i = 0; i < d.length; i += 4) im.data[i + 3] = Math.min(255, d[i] * 1.75);      // the lines' own area: full frost
    g.putImageData(im, 0, 0);
    this.fz = { url: 'url(' + cv.toDataURL('image/png') + ')', M: M, w: (b.width + 2 * M).toFixed(0) + 'px ' + (b.height + 2 * M).toFixed(0) + 'px' };
  };
  Stage.prototype.draw = function (t) {
    var r = this.el.getBoundingClientRect(), W = r.width, H = r.height, vh = innerHeight, L = this.L;
    this.wdH = this.wd.offsetHeight; this.hdr = parseFloat(getComputedStyle(root).getPropertyValue('--hdr')) || 76;
    this.fit();
    var o = OPT[this.id](this, W, H, t, r, vh), x0 = o.rect[0], x1 = o.rect[1], y0 = o.rect[2], y1 = o.rect[3];
    var clip = 'inset(' + Math.max(0, y0).toFixed(1) + 'px ' + Math.max(0, W - x1).toFixed(1) + 'px ' + Math.max(0, H - y1).toFixed(1) + 'px ' + Math.max(0, x0).toFixed(1) + 'px)';
    this.set(L.sheet, 'clip', 'clipPath', clip); this.set(L.sheet, 'wclip', 'webkitClipPath', clip);
    var nat = this.nat, fit = nat[0] * Math.max(W / nat[0], H / nat[1]);
    var ops = function (blur, dist) { var sg = blur * dist * .48 / fit; return sg < LV[0] ? [sg / LV[0], 0, 0] : sg < LV[1] ? [1, (sg - LV[0]) / (LV[1] - LV[0]), 0] : [1, 1, clamp((sg - LV[1]) / (LV[2] - LV[1]), 0, 1)]; };
    var op = ops(o.blur, o.dist), i;
    for (i = 0; i < 3; i++) this.set(L.s[i], 'o' + i, 'opacity', op[i].toFixed(3));
    var tr = o.par ? 'translate3d(0,' + o.par.toFixed(1) + 'px,0) scale(1.1)' : 'none', imgs = [L.ph].concat(L.s, L.s2);
    for (i = 0; i < imgs.length; i++) this.set(imgs[i], 'tr' + i, 'transform', tr);
    if (o.inner) {                                                  // a heavier sheet only around the words, fading out (G)
      var qi = o.inner, op2 = ops(qi.blur, qi.dist), wzi = o.wz, m2 = soft(wzi[0] - qi.pad, wzi[2] + qi.pad, wzi[1] - qi.pad, wzi[3] + qi.pad, qi.fe);
      this.set(L.sheet2, 'd2', 'display', 'block');
      for (i = 0; i < 3; i++) this.set(L.s2[i], 'p' + i, 'opacity', op2[i].toFixed(3));
      this.set(L.milk2, 'm2o', 'opacity', Math.min(.95, qi.haze * (.55 + .45 * qi.dist) + .05).toFixed(3));
      this.set(L.sheet2, 'k2', 'webkitMaskImage', m2); this.set(L.sheet2, 'k3', 'maskImage', m2);
      this.set(L.sheet2, 'k4', 'webkitMaskComposite', 'source-in'); this.set(L.sheet2, 'k5', 'maskComposite', 'intersect');
    }
    this.el.classList.toggle('sh--glow', !!o.glow);
    this.set(L.streak, 'stx', 'backgroundPosition', (o.ph || 0).toFixed(1) + 'px 0'); this.set(L.streak, 'sto', 'opacity', (clamp(o.jit / 10, 0, 1) * .45 * o.dist).toFixed(3));
    this.set(L.milk, 'mo', 'opacity', Math.min(.95, o.haze * (.55 + .45 * o.dist) + .05).toFixed(3));
    if (!this.fz) this.shape();
    var fz = this.fz, fp = fz ? (this.wx - fz.M).toFixed(0) + 'px ' + (this.wy - fz.M).toFixed(0) + 'px' : '';   // the frost, shaped by the words (shape())
    if (fz) {
      this.set(L.frost, 'fm', 'webkitMaskImage', fz.url); this.set(L.frost, 'fm2', 'maskImage', fz.url);
      this.set(L.frost, 'fs', 'webkitMaskSize', fz.w); this.set(L.frost, 'fs2', 'maskSize', fz.w);
      this.set(L.frost, 'fp', 'webkitMaskPosition', fp); this.set(L.frost, 'fp2', 'maskPosition', fp);
      this.set(L.frost, 'fr', 'webkitMaskRepeat', 'no-repeat'); this.set(L.frost, 'fr2', 'maskRepeat', 'no-repeat');
    }
    this.set(L.frost, 'fo', 'opacity', o.wzI.toFixed(3));
    this.set(L.rain, 'rb', 'backgroundImage', rainbow(o.rbC[0], o.rbC[1], o.rbC[2])); this.set(L.rain, 'ro', 'opacity', clamp(o.rbI * 2.4, 0, 1).toFixed(3));
    if (o.thick > 0) {
      var box = 'display:block;transform:translate(' + x0.toFixed(1) + 'px,' + y0.toFixed(1) + 'px);width:' + (x1 - x0).toFixed(1) + 'px;height:' + (y1 - y0).toFixed(1) + 'px;';
      this.set(L.rim, 'rim', 'cssText', box + 'box-shadow:inset 0 0 0 1px rgba(255,255,255,.62),inset 0 0 0 ' + o.thick + 'px rgba(255,255,255,.10),inset 0 0 ' + (o.thick * 2.5) + 'px rgba(70,60,50,.10)');
      this.set(L.shade, 'sh', 'cssText', box + 'box-shadow:0 0 14px rgba(0,0,0,.12)');
    } else { this.set(L.rim, 'rim', 'cssText', 'display:none'); this.set(L.shade, 'sh', 'cssText', 'display:none'); }
    if (o.mask) {                                                   // where the sheet shows: E only behind the words, F all but a clearer window
      this.set(L.sheet, 'mask', 'webkitMaskImage', o.mask); this.set(L.sheet, 'mask2', 'maskImage', o.mask);
      this.set(L.sheet, 'mc', 'webkitMaskComposite', o.maskAnd ? 'source-in' : 'source-over'); this.set(L.sheet, 'mc2', 'maskComposite', o.maskAnd ? 'intersect' : 'add');
    }
    this.frames++;
  };
  function loop(now) {
    var y = pageYOffset; scrollV = scrollV * .85 + (y - scrollY0) * .15; scrollY0 = y;
    var t = window.__lensT != null ? window.__lensT : calm() ? 0 : (now - t0) / 1000, any = false;
    stages.forEach(function (s) {
      if (!s.ready || !s.vis || !document.contains(s.el)) return; any = true;
      try { s.draw(t); } catch (e) { s.el.setAttribute('data-sheet-error', e.message); }
    });
    running = any; if (any) requestAnimationFrame(loop);
  }
  function start() { if (!running) { running = true; requestAnimationFrame(loop); } }
  function find() {
    stages = stages.filter(function (s) { return document.contains(s.el); });
    [].forEach.call(document.querySelectorAll('[data-sheet]'), function (el) {
      if (el._sheet || !OPT[el.getAttribute('data-sheet')] || !el.querySelector('.sh__ph img') || !el.querySelector('.sh__words')) return;
      el._sheet = new Stage(el); stages.push(el._sheet);
    });
  }
  document.addEventListener('om:swap', function () { setTimeout(find, 0); });
  find();
  window.__lens = function () { return stages.map(function (s) { return { id: s.id, ready: !!s.ready, frames: s.frames, err: s.el.getAttribute('data-sheet-error') }; }); };
})();
