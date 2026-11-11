/* M/G/S only (task 0ab956d4). G's five-step preview becomes the step rail: as the preview leaves, each row's number
   travels to its own number on the rail (01 to 05) while its words fade, and the rail takes over as they land.
   Scrubbed by the scroll (the same leave value as every slide's --q), so it plays backwards on the way up.
   Off in ?shot review mode and with reduced motion, where the list keeps 2.2's plain leave. */
(function () {
  var sec = document.querySelector('#visit.lnsec'), rail = document.getElementById('rail'), root = document.documentElement;   // round 4: the preview is the line block
  if (!sec || !rail || root.hasAttribute('data-shot') || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  // round 4: only where step 01 follows the preview (G now has the menu between them, so its rail simply arrives with the steps)
  var nx = sec.nextElementSibling; if (!nx || !nx.classList.contains('ch')) return;
  var nums = [].slice.call(sec.querySelectorAll('.ln__n')), marks = [].slice.call(rail.querySelectorAll('a b'));
  if (!nums.length || marks.length < nums.length) return;
  sec.classList.add('pv--morph');

  // in units of the preview's leave (0..1): the numbers land once step 01's film is behind the rail (its middle fifth)
  var TRAVEL = .58, STAGGER = .02, HAND = .56, HAND_LEN = .12, HOLD = .8;
  var held = false, cFrom = null, cTo = null;
  function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function ease(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }   // in-out, as the site's --io
  function rgb(s) { var m = s.match(/[\d.]+/g) || [0, 0, 0]; return [+m[0], +m[1], +m[2], m[3] == null ? 1 : +m[3]]; }
  function mix(a, b, t) { return 'rgba(' + [0, 1, 2].map(function (i) { return Math.round(a[i] + (b[i] - a[i]) * t); }).join(',') + ',' + (a[3] + (b[3] - a[3]) * t).toFixed(3) + ')'; }
  function at(el) {          // an element's place inside the preview, before any transform
    var x = 0, y = 0;
    for (var e = el; e && e !== sec; e = e.offsetParent) { x += e.offsetLeft; y += e.offsetTop; }
    return { x: x + el.offsetWidth / 2, y: y + el.offsetHeight / 2, h: el.offsetHeight };
  }
  function release() {
    if (!held) return; held = false;
    rail.style.transition = rail.style.opacity = rail.style.visibility = '';
  }
  function frame() {
    var r = sec.getBoundingClientRect(), vh = innerHeight;
    if (r.height && r.top <= 1 && r.bottom > 0) {
      var q = clamp(-r.top / vh);
      if (!cFrom) { cFrom = rgb(getComputedStyle(nums[0]).color); cTo = rgb(getComputedStyle(marks[0]).color); }
      sec.style.setProperty('--pf', clamp(q / TRAVEL).toFixed(4));
      var h = clamp((q - HAND) / HAND_LEN);
      for (var k = 0; k < nums.length; k++) {
        var n = nums[k], a = at(n), m = marks[k].getBoundingClientRect();
        var e = ease(clamp((q - k * STAGGER) / TRAVEL)), s = 1 + (m.height / a.h - 1) * e;
        var dx = (m.left + m.width / 2 - (r.left + a.x)) * e, dy = (m.top + m.height / 2 - (r.top + a.y)) * e;
        n.style.transform = 'translate3d(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px,0) scale(' + s.toFixed(4) + ')';
        // each number takes the colour of what is behind it: forest over the clay preview, the rail's ivory over the film
        n.style.color = mix(cFrom, cTo, clamp((r.top + a.y + dy - r.bottom + 14) / 28));
        n.style.opacity = (1 - h).toFixed(3);
      }
      if (q > 0 && q < HOLD) {         // the rail appears exactly as the numbers land, then the engine keeps it on
        held = true; rail.style.transition = 'none'; rail.style.opacity = h.toFixed(3); rail.style.visibility = h > 0 ? 'visible' : 'hidden';
      } else release();
    } else release();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
/* round 3 (task a2e5a9d0): the menu's photo panel follows the open row. engine.js opens rows and swaps the panel's <img>s;
   a row whose photo is still to come shows a frame (a <div>), which this keeps in step with the open row too. */
(function () {
  [].forEach.call(document.querySelectorAll('.mn'), function (s) {
    var rows = [].slice.call(s.querySelectorAll('.mn__row')), ph = [].slice.call(s.querySelectorAll('.mn__ph > [data-i]'));
    function sync() { var on = rows.findIndex(function (r) { return r.classList.contains('is-on'); }); ph.forEach(function (p, k) { p.classList.toggle('is-on', k === on); }); }
    var mo = new MutationObserver(sync);
    rows.forEach(function (r) { mo.observe(r, { attributes: true, attributeFilter: ['class'] }); });
    sync();
  });
})();
/* review captures only (task a2e5a9d0): ?shot&at=<section id> opens the page at that section, in its own world, so a
   screenshot service that cannot scroll or keep a #hash can still shoot every section. Never in a visitor's link. */
(function () {
  var m = /[?&]at=([\w-]+)/.exec(location.search), el = m && document.getElementById(m[1]);
  if (!el) return;
  function go() { document.documentElement.style.scrollBehavior = 'auto'; scrollTo(0, el.getBoundingClientRect().top + scrollY); }
  var main = el.closest('main');
  if (main && main.hidden) { var b = document.querySelector('[data-to-world="' + main.getAttribute('data-world') + '"]'); if (b) b.click(); setTimeout(go, 1800); }
  else setTimeout(go, 300);
  setTimeout(go, 2600);
})();
/* round 4 (task 2846db82): the floating "Book your visit · Begin" bar never hides content (J's principle 4). It fades out
   while any of this world's own action buttons is on screen (the same action twice is noise), and, checked once the page
   is at rest so it never flickers, while text or a control sits under it. next.js still decides when it may show at all. */
(function () {
  var root = document.documentElement, bars = [].slice.call(document.querySelectorAll('.wdoor'));
  if (!bars.length || !('IntersectionObserver' in window)) return;
  var href = { salon: bars[0].getAttribute('href'), coaching: (bars[1] || bars[0]).getAttribute('href') }, seen = new Map(), under = false, t = 0;
  // content = any element that holds words of its own (a text node), or a control
  function words(e) { if (/^(BUTTON|INPUT|A)$/.test(e.tagName)) return true; for (var c = e.firstChild; c; c = c.nextSibling) if (c.nodeType === 3 && c.nodeValue.trim()) return true; return false; }
  function world() { return root.getAttribute('data-world') || 'salon'; }
  function bar() { return world() === 'coaching' ? (bars[1] || bars[0]) : bars[0]; }
  function apply() {
    var w = world(), own = false;
    seen.forEach(function (v, el) { if (v && el.closest('main').getAttribute('data-world') === w) own = true; });
    root.classList.toggle('wdoor-hold', own || under);
  }
  function check() {
    var b = bar(), r = b.getBoundingClientRect(), hit = false;
    if (r.width) {
      for (var i = 0; i <= 6 && !hit; i++) for (var j = 0; j < 3 && !hit; j++) {
        var x = r.left + 6 + (r.width - 12) * i / 6, y = r.top + 4 + (r.height - 8) * j / 2;
        var els = document.elementsFromPoint(x, y);
        for (var k = 0; k < els.length; k++) {
          var e = els[k];
          if (b.contains(e) || e.closest('.wdoor, .hdr, .tw, .tw-btn, [aria-hidden="true"]')) continue;
          if (e.tagName === 'SECTION' || e.tagName === 'MAIN' || e.tagName === 'BODY' || e.tagName === 'HTML') break;
          if (words(e) && getComputedStyle(e).opacity > .1) { hit = true; break; }
        }
      }
    }
    under = hit; apply();
  }
  // checked at rest, and again as a section's late lines arrive (its reveals run up to about 4.5 s)
  var t2 = 0, t3 = 0;
  function later() { clearTimeout(t); clearTimeout(t2); clearTimeout(t3); t = setTimeout(check, 180); t2 = setTimeout(check, 1600); t3 = setTimeout(check, 4800); }
  var io = new IntersectionObserver(function (es) { es.forEach(function (e) { seen.set(e.target, e.isIntersecting); }); apply(); }, { threshold: 0 });
  [].forEach.call(document.querySelectorAll('main[data-world] section .btn[href]'), function (el) {
    var w = el.closest('main').getAttribute('data-world');
    if (el.getAttribute('href') === href[w]) { seen.set(el, false); io.observe(el); }
  });
  // and while the footer is on screen: the page has ended, its own Begin is just above
  [].forEach.call(document.querySelectorAll('main[data-world] .cl__foot'), function (el) { seen.set(el, false); io.observe(el); });
  addEventListener('scroll', later, { passive: true }); addEventListener('resize', later);
  new MutationObserver(function () { setTimeout(check, 900); }).observe(root, { attributes: true, attributeFilter: ['data-world'] });
  setTimeout(check, 1200);
})();
/* round 4 (task 2846db82, J 11 Nov): calm snapping around a section taller than the window (the menu, Inner Work's long
   pages, the closing screen). 2.2's slideshow snap stays for full-screen slides; while a tall section is on screen the
   browser's snap is off and this settles the page once it is at rest: inside the tall section nothing moves; a little past
   its end, its bottom lines up with the bottom of the window; the next section comes in only once a third of it is showing
   in the direction of travel (the same on the way up). Safari has no rule for sections taller than the window, which is why
   it pulled the reader back to the top of the menu. */
(function () {
  var root = document.documentElement;
  if (root.hasAttribute('data-shot')) return;
  var off = false, t = 0, dir = 1, lastY = scrollY, touching = false, pending = false;
  function sel() { var s = document.getElementById('tw-snap'); return !s || s.value === 'mandatory'; }
  function secs() { var m = document.querySelector('main[data-world]:not([hidden])'); return m ? [].slice.call(m.children).filter(function (e) { return e.classList.contains('s'); }) : []; }
  function snap(on) {
    if (!sel()) return;
    if (on === !off) return;
    off = !on; root.style.scrollSnapType = on ? '' : 'none';
  }
  function look() {
    pending = false;
    var vh = innerHeight, y = scrollY, tall = false;
    if (Math.abs(y - lastY) > .5) { dir = y > lastY ? 1 : -1; lastY = y; }
    var ground = null;
    secs().forEach(function (s) {
      var r = s.getBoundingClientRect();
      // the browser's snap stays off while a tall section is on screen OR within one window of it: coming back up from the
      // slide after the menu, Safari snapped to the menu's top before the menu was on screen to turn it off (WebKit QA)
      if (r.bottom > -vh * .95 && r.top < vh * 1.95 && r.height > vh + 2) tall = true;
      if (r.height > vh + 2 && r.top < -4 && r.bottom > 80) ground = s;      // a tall section scrolling under the header
    });
    if (ground) root.style.setProperty('--hdr-ground', getComputedStyle(ground).backgroundColor);
    root.classList.toggle('hdr-ground', !!ground);
    snap(!tall);
  }
  function settle() {
    if (touching || !off || !sel() || root.classList.contains('menu-open')) return;
    var vh = innerHeight, list = secs(), b = null;
    for (var k = 1; k < list.length; k++) {
      var top = list[k].getBoundingClientRect().top;
      if (top > 2 && top < vh - 2) { b = top; break; }
    }
    if (b === null) return;                         // the window sits inside one section: the reader is reading, leave it
    var third = vh / 3, by = dir > 0 ? ((vh - b) >= third ? b : b - vh) : (b >= third ? b - vh : b);
    scrollBy({ top: by, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }
  function onScroll() {
    if (!pending) { pending = true; requestAnimationFrame(look); }
    clearTimeout(t); t = setTimeout(settle, 200);
  }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('touchstart', function () { touching = true; clearTimeout(t); }, { passive: true });
  addEventListener('touchend', function () { touching = false; clearTimeout(t); t = setTimeout(settle, 260); }, { passive: true });
  addEventListener('resize', onScroll);
  look();
})();
/* round 4: voices (mgs_sections.voices_row). The arrows move the row one card at a time and the count follows the card
   in view, whether the reader used the arrows, a swipe or a trackpad. */
(function () {
  [].forEach.call(document.querySelectorAll('.vo'), function (s) {
    var row = s.querySelector('.vo__row'), cards = [].slice.call(s.querySelectorAll('.vo__card')), count = s.querySelector('.vo__count b'), arr = s.querySelectorAll('.vo__arr'), cur = 0, t = 0;
    if (!row || !cards.length) return;
    function at() { var x = row.scrollLeft + 2, k = 0; cards.forEach(function (c, i) { if (c.offsetLeft - row.offsetLeft - parseFloat(getComputedStyle(row).paddingLeft) <= x) k = i; }); return k; }
    function show() {
      cur = row.scrollLeft + row.clientWidth >= row.scrollWidth - 4 ? cards.length - 1 : at();
      if (count) count.textContent = cur + 1;
      arr[0].disabled = cur === 0; arr[1].disabled = cur === cards.length - 1;
    }
    function go(k) { k = Math.max(0, Math.min(cards.length - 1, k)); row.scrollTo({ left: cards[k].offsetLeft - row.offsetLeft - parseFloat(getComputedStyle(row).paddingLeft) }); }
    [].forEach.call(arr, function (b) { b.addEventListener('click', function () { go(cur + (+b.getAttribute('data-dir'))); }); });
    row.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') { e.preventDefault(); go(cur + 1); } else if (e.key === 'ArrowLeft') { e.preventDefault(); go(cur - 1); } });
    row.addEventListener('scroll', function () { clearTimeout(t); t = setTimeout(show, 80); }, { passive: true });
    addEventListener('resize', show); show();
  });
})();
/* round 4: voices after the dark menu wears the light ground (mgs.css .mn + .vo), so the header reads it as light */
[].forEach.call(document.querySelectorAll('.mn + .vo'), function (s) { s.setAttribute('data-tone', 'light'); });
/* round 4: the salon world's dark teases are dark again in M, G and S (mgs.css), so the header reads them as dark; 2.2
   next marks them light (next.js), which ran first */
[].forEach.call(document.querySelectorAll('main[data-world="salon"] .mani.dark'), function (s) { s.setAttribute('data-tone', 'dark'); });
