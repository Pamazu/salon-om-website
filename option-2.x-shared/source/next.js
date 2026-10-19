/* Option 2.2 next: accent option B moves the OM line, facts and voices onto light clay, so the header reads them as light */
(function () {
  if (document.documentElement.getAttribute('data-accent') !== 'b') return;
  document.querySelectorAll('main[data-world="salon"] .mani.dark, main[data-world="salon"] .facts, main[data-world="salon"] .voices')
    .forEach(function (s) { s.setAttribute('data-tone', 'light'); });
})();
