(function () {
  'use strict';
  var root = document.documentElement;
  var hdr = document.getElementById('hdr');
  var rail = document.getElementById('rail');
  var railLinks = rail ? [].slice.call(rail.querySelectorAll('a')) : [];
  var reduce = false; try { reduce = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function $all(sel, el) { return [].slice.call((el || document).querySelectorAll(sel)); }

  /* ---- worlds: the salon and its parallel coaching world live in one page ---- */
  var mains = {}; $all('main[data-world]').forEach(function (m) { mains[m.getAttribute('data-world')] = m; });
  var world = (location.hash === '#coaching' || (location.hash && mains.coaching && mains.coaching.querySelector(location.hash.replace(/[^#\w-]/g, '')))) ? 'coaching' : 'salon';
  if (!mains[world]) world = 'salon';
  var slides = [], state = [], films = [];

  /* ---- menu ---- */
  var menu = document.getElementById('menu');
  var menuBtn = document.querySelector('.hdr__menu');
  function setMenu(open) {
    hdr.classList.toggle('is-open', open); menu.classList.toggle('is-open', open); root.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', open); menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.style.overflow = open ? 'hidden' : '';
  }
  menuBtn.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); menuBtn.focus(); } });

  /* ---- text that writes itself in: letters (a leading OM sounds first) or words ---- */
  function writeIn(el, text) {
    var mode = el.getAttribute('data-write'), acc = (el.getAttribute('data-accents') || '').split('|'), i = 0;
    text = (text || el.getAttribute('aria-label') || el.textContent).trim().replace(/\s+/g, ' ');
    el.setAttribute('aria-label', text);
    el.innerHTML = text.split(' ').map(function (w, wi) {
      var a = acc.indexOf(w) >= 0 ? ' acc' : '';
      if (mode === 'words') return '<span class="wd' + a + '" style="--i:' + (i++) + '" aria-hidden="true">' + esc(w) + '</span>';
      if (wi === 0 && w === 'OM') return '<span class="wd acc om" aria-hidden="true"><span class="l" style="--dx:-.16em">O</span><span class="l" style="--dx:.16em">M</span></span>';
      return '<span class="wd' + a + '" aria-hidden="true">' + w.split('').map(function (c) { return '<span class="l" style="--i:' + (i++) + '">' + esc(c) + '</span>'; }).join('') + '</span>';
    }).join(' ');
    el.classList.toggle('no-om', !/^OM /.test(text));
  }
  function esc(t) { return t.replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  $all('[data-write]').forEach(function (el) { writeIn(el); });

  /* ---- photos open only once decoded, so a reveal never plays on an empty frame ---- */
  $all('.ph').forEach(function (m) {
    var img = m.querySelector('img'); if (!img) return;
    function done() { m.classList.add('is-loaded'); }
    function dec() { (img.decode ? img.decode() : Promise.resolve()).then(done, done); }
    if (img.complete && img.naturalWidth) dec(); else { img.addEventListener('load', dec); img.addEventListener('error', done); }
  });

  /* ---- films: stream, fall back to a whole download, loop while on screen ---- */
  var paused = false, cache = {};
  function attach(v) {
    if (v._attached) return; v._attached = true;
    var url = v.getAttribute('data-src'), done = false;
    function ready() { if (done) return; done = true; clearTimeout(timer); if (v._want) play(v); }
    function viaBlob() {
      if (v._blob || !window.fetch) return; v._blob = true;
      (cache[url] = cache[url] || fetch(url).then(function (r) { if (!r.ok) throw r.status; return r.blob(); }).then(function (b) { return URL.createObjectURL(b); }))
        .then(function (u) { v.src = u; v.load(); }).catch(function () {});
    }
    v.addEventListener('loadeddata', ready);
    v.addEventListener('playing', function () { v.classList.add('is-on'); });
    v.addEventListener('error', viaBlob);
    var timer = setTimeout(function () { if (!done) viaBlob(); }, 4500);
    v.src = url; v.load();
  }
  function play(v) { if (paused || !v._want || v._stopped) return; var p = v.play(); if (p && p.catch) p.catch(function () {}); }
  var toggle = document.getElementById('films-toggle');
  toggle.addEventListener('click', function () {
    paused = !paused;
    toggle.setAttribute('aria-pressed', paused); toggle.setAttribute('aria-label', paused ? 'Play the films' : 'Pause the films');
    $all('video[data-src]').forEach(function (v) { if (paused) v.pause(); else play(v); });
  });
  function nudge() { films.forEach(function (v) { if (v && v._want) play(v); }); }
  ['touchstart', 'pointerdown', 'keydown'].forEach(function (ev) { window.addEventListener(ev, nudge, { once: true, passive: true }); });

  /* ---- "everything stops": a hero film that slows to stillness as you arrive ---- */
  function stopFilm(v, delay, dur) {
    if (!v || reduce) return;
    setTimeout(function () {
      var t0 = null;
      function step(now) {
        if (t0 === null) t0 = now;
        var t = clamp((now - t0) / dur, 0, 1), e = 0.5 - 0.5 * Math.cos(Math.PI * t);
        try { v.playbackRate = Math.max(0.0625, 1 - e); } catch (x) {}
        if (t < 1) requestAnimationFrame(step); else { v._stopped = true; v.pause(); root.classList.add('is-still'); }
      }
      requestAnimationFrame(step);
    }, delay);
  }

  /* ---- quotes that breathe from one to the next ---- */
  /* ---- 2.2 rituals menu: one ritual open at a time, the photo follows it; drifts on its own when idle ---- */
  $all('[data-menu]').forEach(function (s) {
    var rows = $all('.om__row', s), ims = $all('.om__ph img', s), cur = 0, hold = false;
    function pick(i) { cur = i; rows.forEach(function (r, k) { r.classList.toggle('is-on', k === i); r.setAttribute('aria-expanded', k === i); }); ims.forEach(function (m, k) { m.classList.toggle('is-on', k === i); }); }
    rows.forEach(function (r, i) {
      r.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') { hold = true; pick(i); } });
      r.addEventListener('pointerleave', function () { hold = false; });
      r.addEventListener('focusin', function () { pick(i); });
      r.addEventListener('click', function (e) { if (!e.target.closest('a')) { hold = true; pick(i); } });
      r.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { if (e.target === r) { e.preventDefault(); pick(i); } } });
    });
    pick(0);
    setInterval(function () { if (!hold && s.classList.contains('is-active') && !document.hidden && !s.contains(document.activeElement)) pick((cur + 1) % rows.length); }, 7000);
  });

  $all('[data-quotes]').forEach(function (q) {
    var items = $all('.q', q), n = 0; if (items.length < 2) return;
    items[0].classList.add('is-on');
    setInterval(function () { if (!q.closest('.s').classList.contains('is-active')) return; items[n].classList.remove('is-on'); n = (n + 1) % items.length; items[n].classList.add('is-on'); }, 6500);
  });

  /* ---- numbers that count up when their slide arrives ---- */
  function count(el) {
    var to = parseFloat(el.getAttribute('data-count')), t0 = null, dur = 1800;
    function step(now) { if (t0 === null) t0 = now; var t = clamp((now - t0) / dur, 0, 1), e = t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; el.textContent = Math.round(to * e); if (t < 1) requestAnimationFrame(step); }
    requestAnimationFrame(step);
  }

  /* ---- soundscapes (see design.md → Soundscapes) ---- */
  var Sound = (function () {
    var SRC = { bed: 'sound/bed.mp3', earth: 'sound/earth.mp3', water: 'sound/water.mp3', fire: 'sound/fire.mp3', air: 'sound/air.mp3', ether: 'sound/ether.mp3' };
    var NEXT = { bed: 'earth', earth: 'water', water: 'fire', fire: 'air', air: 'ether', ether: 'bed' };
    var PAD = 0.5, LOOP = 90, LEVEL = 0.85, XFADE = 3;
    var ctx = null, master = null, tracks = {}, on = false, current = null, target = 'bed';
    var buttons = $all('.sound-btn');
    function ease(n, from, to) { var a = new Float32Array(n); for (var i = 0; i < n; i++) { var t = i / (n - 1); a[i] = from + (to - from) * (0.5 - 0.5 * Math.cos(Math.PI * t)); } return a; }
    function glide(param, to, dur) {
      var now = ctx.currentTime, from = param.value;
      if (param.cancelAndHoldAtTime) param.cancelAndHoldAtTime(now); else { param.cancelScheduledValues(now); param.setValueAtTime(from, now); }
      try { param.setValueCurveAtTime(ease(48, from, to), now + 0.01, dur); } catch (e) { param.linearRampToValueAtTime(to, now + dur); }
    }
    function decode(buf) { return new Promise(function (res, rej) { var p = ctx.decodeAudioData(buf, res, rej); if (p && p.then) p.then(res, rej); }); }
    function load(name) {
      var t = tracks[name]; if (t) return t.ready;
      t = tracks[name] = { gain: ctx.createGain(), src: null, used: performance.now() };
      t.gain.gain.value = 0; t.gain.connect(master);
      t.ready = fetch(SRC[name]).then(function (r) { if (!r.ok) throw r.status; return r.arrayBuffer(); }).then(decode).then(function (b) {
        if (tracks[name] !== t) return;
        var s = ctx.createBufferSource(); s.buffer = b; s.loop = true; s.loopStart = PAD; s.loopEnd = Math.min(PAD + LOOP, b.duration);
        s.connect(t.gain); s.start(0, PAD + Math.random() * 20); t.src = s;
      }).catch(function () { delete tracks[name]; });
      return t.ready;
    }
    function drop(name) { var t = tracks[name]; if (!t) return; try { t.src && t.src.stop(); } catch (e) {} t.gain.disconnect(); delete tracks[name]; }
    function tidy() {
      var keep = {}; keep.bed = 1; keep[current] = 1; keep[NEXT[current]] = 1;
      Object.keys(tracks).forEach(function (n) { if (!keep[n] && performance.now() - tracks[n].used > (XFADE + 1) * 1000) drop(n); });
    }
    function go(name) {
      target = name;
      if (!on || !ctx || name === current) return;
      var prev = current; current = name;
      load(name).then(function () { if (current !== name || !on) return; tracks[name].used = performance.now(); glide(tracks[name].gain.gain, 1, XFADE); });
      if (prev && tracks[prev]) { tracks[prev].used = performance.now(); glide(tracks[prev].gain.gain, 0, XFADE); }
      setTimeout(function () { if (on && NEXT[name]) load(NEXT[name]); }, 1500);
      setTimeout(tidy, (XFADE + 1.5) * 1000);
    }
    function paint() {
      buttons.forEach(function (b) {
        b.setAttribute('aria-pressed', on); b.classList.toggle('is-sound', on);
        var lab = b.querySelector('.sound-label'); if (lab) lab.textContent = on ? 'Sound on' : 'Sound off';
        else b.setAttribute('aria-label', on ? 'Mute sound' : 'Turn sound on');
      });
    }
    function set(stateOn, quiet) {
      on = stateOn; paint();
      if (!quiet) { try { localStorage.setItem('om-sound', on ? 'on' : 'off'); } catch (e) {} }
      if (on) {
        if (!ctx) {
          var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
          try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) {}
          ctx = new AC(); master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
        }
        ctx.resume(); glide(master.gain, LEVEL, 2.5);
        var t = target; Object.keys(tracks).forEach(function (n) { if (n !== t) glide(tracks[n].gain.gain, 0, XFADE); });
        current = null; go(t);
      } else if (ctx) {
        glide(master.gain, 0, 1.2);
        setTimeout(function () { if (!on && ctx) ctx.suspend(); }, 1400);
      }
    }
    // Sound is on by default; the button silences it and a second press brings it back.
    // Browsers only let a page make sound after the visitor's first tap, click or key,
    // so until then the context waits and the first gesture anywhere starts it.
    function blocked() { return on && ctx && ctx.state !== 'running'; }
    buttons.forEach(function (b) { b.addEventListener('click', function () { if (blocked()) { ctx.resume(); return; } set(!on); }); });
    var GESTURES = ['pointerdown', 'pointerup', 'touchend', 'click', 'keydown'];
    function unlock(e) {
      if (e && e.target && e.target.closest && e.target.closest('.sound-btn')) return;
      if (!on || !ctx) return;
      if (ctx.state === 'running') { GESTURES.forEach(function (ev) { window.removeEventListener(ev, unlock, true); }); return; }
      ctx.resume();
    }
    GESTURES.forEach(function (ev) { window.addEventListener(ev, unlock, true); });
    var pref = null; try { pref = localStorage.getItem('om-sound'); } catch (e) {}
    if (pref === 'off') paint(); else { on = true; paint(); setTimeout(function () { if (on) set(true, true); }, 900); }
    document.addEventListener('visibilitychange', function () {
      if (!ctx || !on) return;
      if (document.hidden) { glide(master.gain, 0, 0.6); setTimeout(function () { if (document.hidden) ctx.suspend(); }, 700); }
      else { ctx.resume(); glide(master.gain, LEVEL, 1.5); }
    });
    return { go: go, setLevel: function (v) { LEVEL = v; if (ctx && on) glide(master.gain, LEVEL, 0.6); }, setXfade: function (v) { XFADE = v; } };
  })();
  window.SalonOMSound = Sound;
  window.OMEngine = { writeIn: writeIn, sound: Sound, videos: function () { return $all('video[data-src]'); } };

  /* ---- switching worlds: a soft veil grows from the switch, the other world appears under it ---- */
  var veil = document.getElementById('wveil');
  var switching = false;
  function enter(w, first) {
    world = w; root.setAttribute('data-world', w);
    Object.keys(mains).forEach(function (k) { mains[k].hidden = k !== w; mains[k].classList.toggle('is-current', k === w); });
    slides = $all('.s', mains[w]);
    state = slides.map(function () { return { q: -1, active: false }; });
    $all('.s', mains[w === 'salon' ? 'coaching' : 'salon'] || document.createElement('div')).forEach(function (s) { s.classList.remove('is-active'); });
    films.forEach(function (v) { if (v) { v._want = false; v.pause(); } });
    films = slides.map(function (s) { return s.querySelector('video[data-src]'); });
    $all('[data-to-world]').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-to-world') === w); });
    // the first slide of a world plays its entrance as it appears
    if (slides[0]) { state[0].active = true; slides[0].classList.add('is-active'); }
    var hv = slides[0] && slides[0].querySelector('video[data-stop]'); if (hv) { hv._stopped = false; root.classList.remove('is-still'); stopFilm(hv, +hv.getAttribute('data-stop') || 2400, 3600); }
    $all('[data-count]', slides[0] || document).forEach(count);
    if (!first) { try { history.replaceState(null, '', w === 'coaching' ? '#coaching' : location.pathname + location.search); } catch (e) {} }
  }
  function goWorld(w, from) {
    if (switching || w === world || !mains[w]) return;
    switching = true; setMenu(false);
    var r = from && from.getBoundingClientRect ? from.getBoundingClientRect() : { left: innerWidth / 2, top: 40, width: 0, height: 0 };
    veil.style.setProperty('--vx', (r.left + r.width / 2) + 'px'); veil.style.setProperty('--vy', (r.top + r.height / 2) + 'px');
    veil.setAttribute('data-to', w);
    veil.classList.remove('is-out'); veil.classList.add('is-in');
    setTimeout(function () {
      root.style.scrollSnapType = 'none'; window.scrollTo(0, 0);
      enter(w, false);
      requestAnimationFrame(function () { root.style.scrollSnapType = ''; veil.classList.remove('is-in'); veil.classList.add('is-out'); });
      setTimeout(function () { veil.classList.remove('is-out'); switching = false; }, 1300);
    }, 1050);
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-to-world]'); if (!b) return;
    e.preventDefault(); goWorld(b.getAttribute('data-to-world'), b);
  });
  enter(world, true);

  /* ---- the frame loop: activation, leave-parallax, films, header tone, rail, sound ---- */
  var pendingSound = null, pendingSince = 0;
  function frame() {
    var vh = innerHeight, hdrMid = 38, tone = 'dark', chapter = -1, soundKey = null, soundVis = 0;
    for (var i = 0; i < slides.length; i++) {
      var s = slides[i], st = state[i], r = s.getBoundingClientRect();
      var visible = Math.min(r.bottom, vh) - Math.max(r.top, 0);
      if (!st.active && visible >= Math.min(r.height, vh) * 0.4) { st.active = true; s.classList.add('is-active'); $all('[data-count]', s).forEach(count); }
      else if (st.active && visible <= 0 && i > 0) { st.active = false; s.classList.remove('is-active'); }
      var q = r.height <= vh * 1.05 ? clamp(-r.top / vh, 0, 1) : 0;
      if (Math.abs(q - st.q) > 0.0005) { st.q = q; s.style.setProperty('--q', q.toFixed(4)); }
      var v = films[i];
      if (v) {
        if (r.top < vh * 2 && r.bottom > -vh) attach(v);
        var want = visible > 0;
        if (want !== v._want) { v._want = want; if (want) play(v); else v.pause(); }
      }
      if (r.top <= hdrMid && r.bottom > hdrMid) tone = s.getAttribute('data-tone') || 'dark';
      if (s.hasAttribute('data-chapter') && visible >= vh * 0.5) chapter = +s.getAttribute('data-chapter');
      if (visible > soundVis) { soundVis = visible; soundKey = s.getAttribute('data-sound'); }
    }
    hdr.classList.toggle('is-light', tone === 'light');
    if (rail) {
      rail.classList.toggle('is-on', chapter >= 0 && world === 'salon');
      for (var k = 0; k < railLinks.length; k++) railLinks[k].classList.toggle('is-active', k === chapter);
    }
    if (soundKey && soundKey !== pendingSound) { pendingSound = soundKey; pendingSince = performance.now(); }
    if (pendingSound && performance.now() - pendingSince > 350) Sound.go(pendingSound);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  /* ---- letters forms (preview only) ---- */
  $all('form[data-letters]').forEach(function (form) {
    var msg = form.querySelector('.letters__msg');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var val = form.querySelector('input[type=email]').value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) { msg.textContent = 'Please enter an email address like name@example.com.'; msg.className = 'letters__msg err'; return; }
      msg.textContent = 'Thank you. This is a preview, so nothing was sent yet.'; msg.className = 'letters__msg';
    });
  });
})();
