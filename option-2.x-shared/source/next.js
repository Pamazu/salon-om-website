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
