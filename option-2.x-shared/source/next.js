/* Option 2.2 next: the OM line, facts and voices sit the OM line, facts and voices onto light clay, so the header reads them as light */
(function () {
  document.querySelectorAll('main[data-world="salon"] .mani.dark, main[data-world="salon"] .facts, main[data-world="salon"] .voices')
    .forEach(function (s) { s.setAttribute('data-tone', 'light'); });
})();
