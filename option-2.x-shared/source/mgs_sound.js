  /* ---- soundscapes, M/G/S (task 5cb93228; J 18 Nov: "the music takes too long to load bro. Ensure films, music all is
     extremely fast so the experience is seamless"). The engine's soundscape (design.md, Soundscapes: one bed and five
     element sounds, 90 s seamless loops from 0.5 s, a crossfade between steps) with three changes. build.py draws this
     block over the engine's own on M, G and S only; 2.2-2.4 keep theirs, byte-identical.
     1. Heard at once: the opening sound's file starts loading with the page, and the first tap brings the level up in
        0.3 s. The engine layered a 2.5 s and a 3 s ease, so even a loaded sound stayed near silent for about a second.
     2. Never waiting for a download: a sound not decoded yet when it is first wanted plays from its file as it streams
        (an <audio> started inside the tap, through the same gain), then hands over in silence to the decoded seamless
        loop at the same moment.
     3. A step's sound ready before the step: each section's sound loads a screen before the section arrives, the crossfade
        keeps the level (equal power), and the sound before stays until the new one plays, so a change never dips. */
  var Sound = (function () {
    var SRC = { bed: 'sound/bed.mp3', earth: 'sound/earth.mp3', water: 'sound/water.mp3', fire: 'sound/fire.mp3', air: 'sound/air.mp3', ether: 'sound/ether.mp3' };
    var NEXT = { bed: 'earth', earth: 'water', water: 'fire', fire: 'air', air: 'ether', ether: 'bed' };
    var PAD = 0.5, LOOP = 90, LEVEL = 0.85, XFADE = 3, FIRST = 0.3, HAND = 0.4;
    var ctx = null, master = null, tracks = {}, bytes = {}, bufs = {}, near = {}, on = false, current = null, target = 'bed', heard = false;
    var buttons = $all('.sound-btn');
    // equal power between two levels: a sound coming in is heard at once and the sum of a crossfade never dips
    function shape(n, from, to) {
      var a = new Float32Array(n), up = to > from;
      for (var i = 0; i < n; i++) { var t = i / (n - 1); a[i] = up ? from + (to - from) * Math.sin(t * Math.PI / 2) : to + (from - to) * Math.cos(t * Math.PI / 2); }
      return a;
    }
    function glide(param, to, dur) {
      var now = ctx.currentTime, from = param.value;
      if (param.cancelAndHoldAtTime) param.cancelAndHoldAtTime(now); else { param.cancelScheduledValues(now); param.setValueAtTime(from, now); }
      if (Math.abs(to - from) < 0.001) { param.setValueAtTime(to, now); return; }
      try { param.setValueCurveAtTime(shape(48, from, to), now + 0.01, dur); } catch (e) { param.linearRampToValueAtTime(to, now + dur); }
    }
    // a sound's file is fetched once (no audio context needed, so the opening's starts with the page) and decoded once
    // a context exists; decoding hands the bytes over, so a dropped sound is fetched again (from the browser's cache)
    function fetchBytes(name) { return bytes[name] || (bytes[name] = fetch(SRC[name]).then(function (r) { if (!r.ok) throw r.status; return r.arrayBuffer(); })); }
    function decode(buf) { return new Promise(function (res, rej) { var p = ctx.decodeAudioData(buf, res, rej); if (p && p.then) p.then(res, rej); }); }
    function buffer(name) {
      if (bufs[name]) return bufs[name];
      var p = bufs[name] = fetchBytes(name).then(function (ab) { delete bytes[name]; return decode(ab); });
      p.catch(function () { if (bufs[name] === p) delete bufs[name]; delete bytes[name]; });
      return p;
    }
    function make() {
      if (ctx) return true;
      var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return false;
      try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) {}
      ctx = new AC(); master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
      // the level comes up when the context truly runs (the first tap), quickly the first time
      ctx.onstatechange = function () { if (ctx.state === 'running' && on && !document.hidden) { glide(master.gain, LEVEL, heard ? 1.2 : FIRST); heard = true; } };
      return true;
    }
    // a track: its own level into the master; inside it the decoded loop (sg) or, until that is ready, the file streaming (eg)
    function track(name) {
      var t = tracks[name]; if (t) return t;
      t = tracks[name] = { gain: ctx.createGain(), sg: ctx.createGain(), src: null, el: null, eg: null, used: performance.now(), heard: false };
      t.gain.gain.value = 0; t.gain.connect(master); t.sg.connect(t.gain);
      t.audible = new Promise(function (res) { t.hear = res; });
      buffer(name).then(function (b) {
        if (tracks[name] !== t) return;
        var at = PAD + Math.random() * 20;
        if (t.el && !t.el.paused && t.el.currentTime > 0) {          // the stream is heard: the loop takes over at its moment
          at = t.el.currentTime < PAD ? PAD : PAD + ((t.el.currentTime - PAD) % LOOP);
          t.sg.gain.value = 0; glide(t.sg.gain, 1, HAND); glide(t.eg.gain, 0, HAND);
          var el = t.el; setTimeout(function () { endStream(t, el); }, (HAND + 0.2) * 1000);
        } else endStream(t, t.el);
        var s = ctx.createBufferSource(); s.buffer = b; s.loop = true; s.loopStart = PAD; s.loopEnd = Math.min(PAD + LOOP, b.duration);
        s.connect(t.sg); s.start(0, at); t.src = s; t.hear();
      }).catch(function () {});
      return t;
    }
    function endStream(t, el) {
      if (!el) return; try { el.pause(); el.removeAttribute('src'); el.load(); } catch (e) {}
      if (t.el === el) { t.el = null; try { t.eg.disconnect(); } catch (e) {} t.eg = null; }
    }
    // inside a tap (Safari plays a sound element only from one): a wanted sound with no decoded loop yet streams at once
    function stream() {
      if (!on || !ctx) return;
      var name = current || target, t = tracks[name] || track(name);
      if (t.src || t.el) return;
      var el = new Audio(); el.preload = 'auto'; el.loop = true; el.src = SRC[name];
      var node; try { node = ctx.createMediaElementSource(el); } catch (e) { return; }
      t.eg = ctx.createGain(); t.eg.gain.value = 1; node.connect(t.eg); t.eg.connect(t.gain); t.el = el;
      el.addEventListener('playing', function () { if (t.el === el) t.hear(); });
      try { el.currentTime = PAD; } catch (e) {}
      var p = el.play(); if (p && p.catch) p.catch(function () { endStream(t, el); });
    }
    function drop(name) {
      var t = tracks[name]; if (!t) return;
      try { t.src && t.src.stop(); } catch (e) {} endStream(t, t.el); t.gain.disconnect(); delete tracks[name];
      if (!near[name]) delete bufs[name];
    }
    // memory (task 5cb93228, J's Safari reloaded the page for significant memory): a decoded loop is some 32 MB, so only
    // the sound playing, the next step's and those of the sections within a screen are kept; a dropped one is decoded
    // again from the browser's cache when its section comes near, and the sound before plays on until it is ready
    function tidy() {
      if (!current) return;
      var keep = {}; keep[current] = 1; keep[NEXT[current]] = 1;
      Object.keys(near).forEach(function (n) { if (near[n] > 0) keep[n] = 1; });
      Object.keys(tracks).forEach(function (n) { if (!keep[n] && performance.now() - tracks[n].used > (XFADE + 1) * 1000) drop(n); });
      Object.keys(bufs).forEach(function (n) { if (!keep[n] && !tracks[n]) delete bufs[n]; });
    }
    function go(name) {
      target = name;
      if (!on || !ctx || name === current) return;
      var prev = current; current = name;
      var t = track(name); t.used = performance.now();
      // the sound before stays until this one is heard, then they cross at equal power
      t.audible.then(function () {
        if (current !== name || !on) return;
        t.used = performance.now(); glide(t.gain.gain, 1, heard && prev ? XFADE : FIRST);
        if (prev && tracks[prev] && prev !== name) { tracks[prev].used = performance.now(); glide(tracks[prev].gain.gain, 0, XFADE); }
        Object.keys(tracks).forEach(function (n) { if (n !== name && n !== prev && tracks[n].gain.gain.value > 0.001) glide(tracks[n].gain.gain, 0, XFADE); });
      });
      setTimeout(function () { if (on && NEXT[name]) buffer(NEXT[name]); }, 1500);
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
        if (!make()) return;
        if (ctx.state === 'running') { glide(master.gain, LEVEL, heard ? 0.6 : FIRST); heard = true; }
        else ctx.resume();
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
    buttons.forEach(function (b) { b.addEventListener('click', function () { if (blocked()) { ctx.resume(); stream(); return; } set(!on); if (on) stream(); }); });
    var GESTURES = ['pointerdown', 'pointerup', 'touchend', 'click', 'keydown'];
    function unlock(e) {
      if (e && e.target && e.target.closest && e.target.closest('.sound-btn')) return;
      if (!on || !ctx) return;
      if (ctx.state === 'running') { GESTURES.forEach(function (ev) { window.removeEventListener(ev, unlock, true); }); return; }
      ctx.resume(); stream();
    }
    GESTURES.forEach(function (ev) { window.addEventListener(ev, unlock, true); });
    // each section's sound loads a screen before the section arrives, from below or above (its file only, until there is
    // a context to decode it); near counts the sections of each sound within a screen now
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        var left = false;
        es.forEach(function (e) {
          var n = e.target.getAttribute('data-sound'); if (!SRC[n]) return;
          var was = !!e.target._near; e.target._near = e.isIntersecting;
          if (e.isIntersecting && !was) { near[n] = (near[n] || 0) + 1; if (on) { if (ctx) buffer(n); else fetchBytes(n); } }
          else if (!e.isIntersecting && was) { near[n] = Math.max(0, near[n] - 1); left = true; }
        });
        if (left) setTimeout(tidy, (XFADE + 1.5) * 1000);
      }, { rootMargin: '100% 0px 100% 0px' });
      $all('[data-sound]').forEach(function (s) { io.observe(s); });
    }
    var pref = null; try { pref = localStorage.getItem('om-sound'); } catch (e) {}
    if (pref === 'off') paint(); else { on = true; paint(); fetchBytes('bed'); set(true, true); }
    document.addEventListener('visibilitychange', function () {
      if (!ctx || !on) return;
      if (document.hidden) { glide(master.gain, 0, 0.6); setTimeout(function () { if (document.hidden) ctx.suspend(); }, 700); }
      else { ctx.resume(); glide(master.gain, LEVEL, 1.5); }
    });
    return { go: go, setLevel: function (v) { LEVEL = v; if (ctx && on) glide(master.gain, LEVEL, 0.6); }, setXfade: function (v) { XFADE = v; } };
  })();
