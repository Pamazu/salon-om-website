/* a new build drops tweak drafts saved in this browser against an older one: a draft keys images and text by slide
   position, so an old draft would show the old pictures and words over the new build (J, 19 Oct: "the site getting updated") */
(function () {
  try {
    var v = document.documentElement.getAttribute('data-variant') || 'x', b = window.OM_BUILD, kb = 'om-build-' + v;
    if (b && localStorage.getItem(kb) !== b) { localStorage.removeItem('om-tweaks-' + v); localStorage.setItem(kb, b); }
  } catch (e) {}
})();
/* Option 2.2 next: the OM line, facts and voices sit the OM line, facts and voices onto light clay, so the header reads them as light */
(function () {
  document.querySelectorAll('main[data-world="salon"] .mani.dark, main[data-world="salon"] .facts, main[data-world="salon"] .voices')
    .forEach(function (s) { s.setAttribute('data-tone', 'light'); });
})();
/* the stacked Rooted slide: the top film plays and pauses with its slide (the engine drives one film per slide) */
(function () {
  var tops = document.querySelectorAll('video[data-src-top]'); if (!tops.length) return;
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      var v = e.target;
      if (e.isIntersecting) {
        if (!v.src) { v.src = v.getAttribute('data-src-top'); v.addEventListener('playing', function () { v.classList.add('is-on'); }); }
        var p = v.play(); if (p && p.catch) p.catch(function () {});
      } else v.pause();
    });
  }, { threshold: 0.01 });
  tops.forEach(function (v) { io.observe(v); });
})();
/* Shift+V: live option cycling for J (19 Oct). It cycles the option set of the slide on screen:
   - on the parked pause slide ("A gentle question", shown with ?pause=1|2|3|0): 1 Photo, 2 Framed, 3 Letter, 0 the old clay look;
   - anywhere else: the world switch, 1 the pill, 2 the "Also here" door (the default since 31 Oct, For-you 6c4f8253), 3 "Two practices" (?switch=a|b|c or 1|2|3).
   The URL follows each change, so any option can be sent as a link. */
(function () {
  var root = document.documentElement, slides = document.querySelectorAll('.mani[data-pause]'), toast, tt;
  var P_NAMES = ['The old clay look (for comparison)', 'Idea 1 of 3 · Photo', 'Idea 2 of 3 · Framed', 'Idea 3 of 3 · Letter'];
  var P_TONE = ['light', 'dark', 'dark', 'light'];
  var S_KEYS = ['a', 'b', 'c'], S_NAMES = ['1 of 3 · The pill', '2 of 3 · The \u201cAlso here\u201d door (default)', '3 of 3 · \u201cTwo practices\u201d'];
  function url(k, v) { try { var u = new URL(location.href); u.searchParams.set(k, v); history.replaceState(null, '', u.pathname + u.search + u.hash); } catch (e) {} }
  function say(t) {
    if (!toast) { toast = document.createElement('div'); toast.className = 'pz-toast'; toast.setAttribute('role', 'status'); document.body.appendChild(toast); }
    toast.textContent = 'Shift+V · ' + t; toast.classList.add('is-on'); clearTimeout(tt); tt = setTimeout(function () { toast.classList.remove('is-on'); }, 2600);
  }
  function setPause(n, show) {
    root.setAttribute('data-pause-look', n);
    slides.forEach(function (s) { s.setAttribute('data-look', n); s.setAttribute('data-tone', P_TONE[n]); });
    url('pause', n); if (show) say('Gentle question: ' + P_NAMES[n]);
  }
  function setSwitch(i, show) { root.setAttribute('data-switch', S_KEYS[i]); url('switch', S_KEYS[i]); if (show) say('World switch: ' + S_NAMES[i]); }
  var start = root.getAttribute('data-pause-look'); if (start !== null && slides.length) setPause(+start, false);
  // a ?pause= link opens ON the slide (J's review link), unless it names another place with a #hash
  if (start !== null && slides.length && !location.hash) addEventListener('load', function () { var s = [].filter.call(slides, function (x) { return !x.closest('[hidden]'); })[0]; if (s) s.scrollIntoView(); });
  function pauseOnScreen() {
    var mid = innerHeight / 2;
    return [].some.call(slides, function (s) { if (s.closest('[hidden]')) return false; var r = s.getBoundingClientRect(); return r.height > 0 && r.top <= mid && r.bottom > mid; });
  }
  document.addEventListener('keydown', function (e) {
    if (!e.shiftKey || e.metaKey || e.ctrlKey || e.altKey || (e.key !== 'V' && e.key !== 'v' && e.code !== 'KeyV')) return;
    var t = e.target; if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    e.preventDefault();
    if (pauseOnScreen()) setPause((+root.getAttribute('data-pause-look') + 1) % 4, true);
    else setSwitch((S_KEYS.indexOf(root.getAttribute('data-switch') || 'b') + 1) % 3, true);
  });
})();
/* Inner Work keeps its film slides dark (J, 19 Oct 2:08:08), so the header turns light over them, as it does in the salon.
   The engine only knows light/dark tones; this marks the header when an Inner Work film slide sits under it. */
(function () {
  var root = document.documentElement, hdr = document.getElementById('hdr'); if (!hdr) return;
  var films = [].slice.call(document.querySelectorAll('main[data-world="coaching"] :is(.s.hero, .s.ch, .s.cta)')); if (!films.length) return;
  var queued = false;
  function check() {
    queued = false;
    var on = root.getAttribute('data-world') === 'coaching' && films.some(function (s) { var r = s.getBoundingClientRect(); return r.top <= 38 && r.bottom > 38; });
    hdr.classList.toggle('is-film', on);
  }
  function q() { if (!queued) { queued = true; requestAnimationFrame(check); } }
  document.addEventListener('scroll', q, { passive: true, capture: true }); addEventListener('resize', q);
  new MutationObserver(function () { q(); setTimeout(q, 1200); }).observe(root, { attributes: true, attributeFilter: ['data-world'] });
  q();
})();
