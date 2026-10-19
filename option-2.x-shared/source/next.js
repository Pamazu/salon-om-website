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
/* the parked pause slide: Shift+V shows it and cycles J's three ideas (1 Photo, 2 Framed, 3 Letter, then 0 the old clay look).
   ?pause=1|2|3|0 opens on one look; the URL follows, so a look can be sent as a link. */
(function () {
  var root = document.documentElement, slides = document.querySelectorAll('.mani[data-pause]'); if (!slides.length) return;
  var NAMES = ['The old clay look (for comparison)', 'Idea 1 of 3 · Photo', 'Idea 2 of 3 · Framed', 'Idea 3 of 3 · Letter'];
  var TONE = ['light', 'dark', 'dark', 'light'], toast, tt;
  function set(n, show) {
    root.setAttribute('data-pause-look', n);
    slides.forEach(function (s) { s.setAttribute('data-look', n); s.setAttribute('data-tone', TONE[n]); });
    try { var u = new URL(location.href); u.searchParams.set('pause', n); history.replaceState(null, '', u.pathname + u.search + u.hash); } catch (e) {}
    if (!show) return;
    if (!toast) { toast = document.createElement('div'); toast.className = 'pz-toast'; toast.setAttribute('role', 'status'); document.body.appendChild(toast); }
    toast.textContent = 'Shift+V · ' + NAMES[n]; toast.classList.add('is-on'); clearTimeout(tt); tt = setTimeout(function () { toast.classList.remove('is-on'); }, 2600);
  }
  var start = root.getAttribute('data-pause-look'); if (start !== null) set(+start, false);
  document.addEventListener('keydown', function (e) {
    if (!e.shiftKey || e.metaKey || e.ctrlKey || e.altKey || (e.key !== 'V' && e.code !== 'KeyV')) return;
    var t = e.target; if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    e.preventDefault();
    var cur = root.getAttribute('data-pause-look'), first = cur === null, n = first ? 1 : (+cur + 1) % 4;
    set(n, true);
    var s = [].filter.call(slides, function (x) { return !x.closest('[hidden]'); })[0];
    if (s && (first || Math.abs(s.getBoundingClientRect().top) > innerHeight * .5)) s.scrollIntoView({ behavior: 'smooth' });
  });
})();
