(function () {
  'use strict';
  var root = document.documentElement;
  var hdr = document.getElementById('hdr');
  var slides = [].slice.call(document.querySelectorAll('.s'));
  var rail = document.getElementById('rail');
  var railLinks = rail ? [].slice.call(rail.querySelectorAll('a')) : [];
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  /* ---- menu ---- */
  var menu = document.getElementById('menu');
  var menuBtn = document.querySelector('.hdr__menu');
  function setMenu(open) {
    hdr.classList.toggle('is-open', open); menu.classList.toggle('is-open', open);
    menuBtn.setAttribute('aria-expanded', open); menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.style.overflow = open ? 'hidden' : '';
  }
  menuBtn.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); menuBtn.focus(); } });

  /* ---- split text so it can be written in, letter by letter (manifesto) or word by word (voices) ---- */
  function splitLetters(el, accents) {
    var i = 0;
    el.innerHTML = el.textContent.trim().split(/\s+/).map(function (w, wi) {
      // a leading "OM" is sounded on its own first: its letters drift together from either side
      if (wi === 0 && w === 'OM') return '<span class="wd acc om"><span class="l" style="--dx:-.16em">O</span><span class="l" style="--dx:.16em">M</span></span>';
      var letters = w.split('').map(function (c) { return '<span class="l" style="--i:' + (i++) + '">' + c + '</span>'; }).join('');
      return '<span class="wd' + (accents[w] ? ' acc' : '') + '">' + letters + '</span>';
    }).join(' ');
    el.setAttribute('aria-label', el.textContent);
  }
  function splitWords(el) {
    el.innerHTML = el.textContent.trim().split(/\s+/).map(function (w, i) { return '<span class="wd" style="--i:' + i + '">' + w + '</span>'; }).join(' ');
  }
  var mt = document.getElementById('mani-text'); if (mt) splitLetters(mt, { 'OM': 1, 'everything.': 1, 'one.': 1, 'all.': 1 });
  var vt = document.getElementById('voice-text'); if (vt) splitWords(vt);

  /* ---- the story photo opens only once it is decoded, so the reveal never plays on an empty frame ---- */
  [].forEach.call(document.querySelectorAll('.story__media'), function (m) {
    var img = m.querySelector('img'); if (!img) return;
    function done() { m.classList.add('is-loaded'); }
    if (img.complete && img.naturalWidth) { (img.decode ? img.decode() : Promise.resolve()).then(done, done); }
    else { img.addEventListener('load', function () { (img.decode ? img.decode() : Promise.resolve()).then(done, done); }); img.addEventListener('error', done); }
  });

  /* ---- films ----
     Every film loops on its own, in slow motion, while its slide is on screen. The poster sits
     underneath until the film is playing. A film is streamed from its URL; if the host refuses
     (or it has not started after a few seconds), it is fetched whole and played from memory. */
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
  function play(v) { if (paused || !v._want) return; var p = v.play(); if (p && p.catch) p.catch(function () {}); }
  var films = slides.map(function (s) { return s.querySelector('video'); });
  var toggle = document.getElementById('films-toggle');
  toggle.addEventListener('click', function () {
    paused = !paused;
    toggle.setAttribute('aria-pressed', paused); toggle.setAttribute('aria-label', paused ? 'Play the films' : 'Pause the films');
    films.forEach(function (v) { if (!v) return; if (paused) v.pause(); else play(v); });
  });
  // a first touch lets strict mobile browsers start muted films
  function nudge() { films.forEach(function (v) { if (v && v._want) play(v); }); }
  ['touchstart', 'pointerdown', 'keydown'].forEach(function (ev) { window.addEventListener(ev, nudge, { once: true, passive: true }); });

  /* ---- soundscapes ----
     Each element has its own soundscape (ambient music + a nature layer); every other slide shares a
     soft background bed. Sound starts only when the visitor turns it on. Tracks are seamless 90s loops
     (files carry 0.5s of padding each side) and crossfade over 3s on an ease-in-out curve when the
     slide changes. Only the bed, the current and the next soundscape are kept decoded. */
  var Sound = (function () {
    var SRC = { bed: 'sound/bed.mp3', earth: 'sound/earth.mp3', water: 'sound/water.mp3', fire: 'sound/fire.mp3', air: 'sound/air.mp3', ether: 'sound/ether.mp3' };
    var ORDER = ['bed', 'earth', 'water', 'fire', 'air', 'ether'];
    var PAD = 0.5, LOOP = 90, LEVEL = 0.85, XFADE = 3;
    var ctx = null, master = null, tracks = {}, on = false, current = null, target = 'bed';
    var buttons = [].slice.call(document.querySelectorAll('#sound-toggle, #sound-cta'));
    function ease(n, from, to) { var a = new Float32Array(n); for (var i = 0; i < n; i++) { var t = i / (n - 1); a[i] = from + (to - from) * (0.5 - 0.5 * Math.cos(Math.PI * t)); } return a; }
    function glide(param, to, dur) {
      var now = ctx.currentTime, from = param.value;
      if (param.cancelAndHoldAtTime) param.cancelAndHoldAtTime(now); else { param.cancelScheduledValues(now); param.setValueAtTime(from, now); }
      try { param.setValueCurveAtTime(ease(48, from, to), now + 0.01, dur); } catch (e) { param.linearRampToValueAtTime(to, now + dur); }
    }
    function decode(buf) { return new Promise(function (res, rej) { var p = ctx.decodeAudioData(buf, res, rej); if (p && p.then) p.then(res, rej); }); }
    function load(name) {
      var t = tracks[name];
      if (t) return t.ready;
      t = tracks[name] = { gain: ctx.createGain(), src: null, used: 0 };
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
      var keep = { bed: 1 }; keep[current] = 1; var i = ORDER.indexOf(current); if (i > 0 && i < ORDER.length - 1) keep[ORDER[i + 1]] = 1;
      Object.keys(tracks).forEach(function (n) { if (!keep[n] && performance.now() - tracks[n].used > (XFADE + 1) * 1000) drop(n); });
    }
    function go(name) {
      target = name;
      if (!on || !ctx || name === current) return;
      var prev = current; current = name;
      load(name).then(function () { if (current !== name || !on) return; tracks[name].used = performance.now(); glide(tracks[name].gain.gain, 1, XFADE); });
      if (prev && tracks[prev]) { tracks[prev].used = performance.now(); glide(tracks[prev].gain.gain, 0, XFADE); }
      var i = ORDER.indexOf(name); if (i > 0 && i < ORDER.length - 1) setTimeout(function () { if (on) load(ORDER[i + 1]); }, 1500);
      setTimeout(tidy, (XFADE + 1.5) * 1000);
    }
    function set(state) {
      on = state;
      buttons.forEach(function (b) {
        b.setAttribute('aria-pressed', on); b.classList.toggle('is-sound', on);
        if (b.id === 'sound-toggle') b.setAttribute('aria-label', on ? 'Turn sound off' : 'Turn sound on');
        else b.lastChild.textContent = on ? 'Sound on' : 'Turn on sound';
      });
      try { localStorage.setItem('om-sound', on ? 'on' : 'off'); } catch (e) {}
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
    buttons.forEach(function (b) { b.addEventListener('click', function () { set(!on); }); });
    // a visitor who chose sound before gets it back on their first tap or key (browsers need a gesture)
    var pref = null; try { pref = localStorage.getItem('om-sound'); } catch (e) {}
    if (pref === 'on') {
      var resume = function (e) { if (e.target && e.target.closest && e.target.closest('#sound-toggle, #sound-cta')) return; if (!on) set(true); };
      ['pointerdown', 'keydown', 'touchend'].forEach(function (ev) { window.addEventListener(ev, resume, { once: true }); });
    }
    document.addEventListener('visibilitychange', function () {
      if (!ctx || !on) return;
      if (document.hidden) { glide(master.gain, 0, 0.6); setTimeout(function () { if (document.hidden) ctx.suspend(); }, 700); }
      else { ctx.resume(); glide(master.gain, LEVEL, 1.5); }
    });
    return { go: go, state: function () { return { on: on, current: current, ctx: ctx && ctx.state, tracks: Object.keys(tracks).map(function (n) { return n + ':' + tracks[n].gain.gain.value.toFixed(2) + (tracks[n].src ? '' : '(loading)'); }) }; } };
  })();
  window.SalonOMSound = Sound;

  /* ---- the frame loop: activation, leave-parallax, films, header tone, rail, sound ---- */
  var state = slides.map(function () { return { q: -1, active: false }; });
  var pendingSound = null, pendingSince = 0;
  state[0].active = true;
  function frame() {
    var vh = innerHeight, hdrMid = 38, tone = 'dark', chapter = -1, soundKey = null, soundVis = 0;
    for (var i = 0; i < slides.length; i++) {
      var s = slides[i], st = state[i], r = s.getBoundingClientRect();
      var visible = Math.min(r.bottom, vh) - Math.max(r.top, 0);
      // arrives: animate in once most of it is on screen; resets only once it is fully gone
      if (!st.active && visible >= Math.min(r.height, vh) * 0.4) { st.active = true; s.classList.add('is-active'); }
      else if (st.active && visible <= 0 && i > 0) { st.active = false; s.classList.remove('is-active'); }
      // leaves upward: drift and darken under the next slide
      var q = r.height <= vh * 1.05 ? clamp(-r.top / vh, 0, 1) : 0;
      if (Math.abs(q - st.q) > 0.0005) { st.q = q; s.style.setProperty('--q', q.toFixed(4)); }
      // films: load one screen ahead, play only while on screen
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
    // sound follows the slide that fills most of the screen, once it has settled for a moment
    if (soundKey && soundKey !== pendingSound) { pendingSound = soundKey; pendingSince = performance.now(); }
    if (pendingSound && performance.now() - pendingSince > 350) Sound.go(pendingSound);
    hdr.classList.toggle('is-light', tone === 'light');
    if (rail) {
      rail.classList.toggle('is-on', chapter >= 0);
      for (var k = 0; k < railLinks.length; k++) railLinks[k].classList.toggle('is-active', k === chapter);
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  /* ---- letters form (preview only) ---- */
  var form = document.getElementById('letters-form');
  var msg = document.getElementById('letters-msg');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var val = document.getElementById('letters-email').value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) { msg.textContent = 'Please enter an email address like name@example.com.'; msg.className = 'letters__msg err'; return; }
    msg.textContent = 'Thank you. This is a preview, so nothing was sent yet.'; msg.className = 'letters__msg';
  });
})();
