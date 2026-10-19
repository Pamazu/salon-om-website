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
