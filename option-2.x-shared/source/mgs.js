/* M/G/S only (task 59b17d9c; J 17 Nov: "a nice beautiful animation that's creative that eases in and out each steps or
   list items of the visit into the right side pagination/stepper of the next sections"). The visit preview hands its
   five stops to the step rail. As the preview leaves, the stops lift off the line one after another (01 to 05): each
   number flies on a soft arc to its own number on the rail and each name to the rail's label, shrinking and taking the
   rail's ivory, with the site's in-out ease; each label shows as it lands, then settles, and the line unthreads towards
   the rail behind them. Scrolling back up flies them back in the same order and the line draws itself again.
   Played in time, not scrubbed, so a slide's short snap never rushes it; turning round mid-flight sends each stop back
   from where it is. The moment the preview starts to leave, all five lift off where the reader saw them and stay there
   while the page slides away beneath them, already turning to the rail's ivory, so a later stop never starts from
   wherever the slide has carried it (QA 17 Nov: in Safari stops 03 to 05 left from the top edge, grey on the photo). Replaces round 5's numbers-only morph (its CSS still targeted the old list, so the names and the
   line stayed behind). Off in ?shot and with reduced motion, where the rail simply fades in with the steps. */
(function () {
  var sec = document.querySelector('#visit.lnsec'), rail = document.getElementById('rail'), root = document.documentElement;
  if (!sec || !rail || root.hasAttribute('data-shot') || matchMedia('(prefers-reduced-motion: reduce)').matches || !document.body.animate) return;
  var nx = sec.nextElementSibling; if (!nx || !nx.classList.contains('ch')) return;   // only where step 01 follows the preview
  var stops = [].slice.call(sec.querySelectorAll('.ln__stop')), links = [].slice.call(rail.querySelectorAll('a'));
  if (!stops.length || links.length < stops.length) return;
  sec.classList.add('pv--morph');

  var DUR = 1200, GAP = 150, LAND = .8, EASE = 'cubic-bezier(.65, 0, .35, 1)';   // the site's --io
  var TONE = .35;   // a traveller has taken its new tone a third of the way, as the page under it has changed by then
  var svg = sec.querySelector('.ln__svg'), layer = document.createElement('div');
  layer.className = 'vfly'; layer.setAttribute('aria-hidden', 'true'); document.body.appendChild(layer);
  function traveller(cls, text) { var c = document.createElement('span'); c.className = cls; c.textContent = text; layer.appendChild(c); return c; }
  // each stop is 'line' (resting on it), 'out' (flying to the rail), 'rail' or 'in' (flying home)
  var st = stops.map(function (li) {
    var n = li.querySelector('.ln__n'), nm = li.querySelector('.ln__name');
    return { li: li, n: n, nm: nm, cn: traveller('vfly__n', n.textContent), cm: traveller('vfly__name', nm.textContent), at: 'line', fly: false, an: [], tm: [] };
  });
  var lt = links.map(function () { return 0; });   // each label's show-then-settle timer

  function rgb(s) { var m = s.match(/[\d.]+/g) || [0, 0, 0]; return [+m[0], +m[1], +m[2], m[3] == null ? 1 : +m[3]]; }
  function mix(a, b, t, ta) { if (ta == null) ta = t; return 'rgba(' + [0, 1, 2].map(function (i) { return Math.round(a[i] + (b[i] - a[i]) * t); }).join(',') + ',' + (a[3] + (b[3] - a[3]) * ta).toFixed(3) + ')'; }
  function box(el) {          // the words' own box, not the block's full column
    var r = document.createRange(); r.selectNodeContents(el); var b = r.getBoundingClientRect();
    return b.width ? b : el.getBoundingClientRect();
  }
  function dress(c, src) {    // a traveller takes its stop's type before it is measured
    var s = getComputedStyle(src);
    ['fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'lineHeight', 'letterSpacing'].forEach(function (p) { c.style[p] = s[p]; });
  }
  function halt(o) {          // freeze each traveller where it is, so a reversal starts from there
    o.an.forEach(function (a) { try { a.commitStyles(); } catch (e) {} a.cancel(); });
    o.tm.forEach(clearTimeout); o.an = []; o.tm = [];
  }

  function pin(o, k) {        // lift off where the reader saw it and wait there for its turn, taking the rail's tone
    o.fly = true;
    var rc = rgb(getComputedStyle(links[k]).color), tone = 'rgba(' + rc[0] + ',' + rc[1] + ',' + rc[2] + ',1)';   // the rail's ivory, at full strength in the air
    [[o.cn, o.n], [o.cm, o.nm]].forEach(function (p) {
      var c = p[0], src = p[1]; dress(c, src);
      var h = c.offsetHeight, sb = box(src), ink = getComputedStyle(src).color;
      c.style.transform = 'translate3d(' + sb.left.toFixed(1) + 'px,' + (sb.top + (sb.height - h) / 2).toFixed(1) + 'px,0) scale(1)';
      c.style.color = ink; c.style.opacity = '1'; c.style.visibility = 'visible'; c._pin = true;
      o.an.push(c.animate([{ color: ink }, { color: tone }], { duration: DUR * TONE, easing: EASE, fill: 'forwards' }));
    });
  }

  function travel(c, src, dst, align, dir, f, dy, cRail) {
    var on = o_on(c), full = !on || c._pin; c._pin = false;
    if (!on) dress(c, src);
    var w = c.offsetWidth, h = c.offsetHeight, sb = box(src), db = box(dst), s1 = db.height / h;
    var rx = align === 'c' ? db.left + db.width / 2 - w * s1 / 2 : align === 'r' ? db.right - w * s1 : db.left - 10 - w * s1;
    var railAt = { x: rx, y: db.top + db.height / 2 - h * s1 / 2, s: s1 };
    var lineAt = { x: sb.left, y: sb.top + dy + (sb.height - h) / 2, s: 1 };
    var cur = c.getBoundingClientRect(), cs = getComputedStyle(c);
    var a = on ? { x: cur.left, y: cur.top, s: cur.height / h } : dir === 'out' ? lineAt : railAt, z = dir === 'out' ? railAt : lineAt;
    var cHome = rgb(getComputedStyle(src).color), c0 = on ? rgb(cs.color) : dir === 'out' ? cHome : cRail, c1 = dir === 'out' ? cRail : cHome;
    var o0 = on ? +cs.opacity : dir === 'out' ? 1 : 0;
    // a soft arc: lifted above the straight line by a twelfth of the distance travelled, bending late towards its end
    var cx = a.x + (z.x - a.x) * .78, cy = Math.min(a.y, z.y) - Math.hypot(z.x - a.x, z.y - a.y) * .08, ks = [];
    for (var i = 0; i <= 12; i++) {
      var t = i / 12, u = 1 - t;
      var x = u * u * a.x + 2 * u * t * cx + t * t * z.x, y = u * u * a.y + 2 * u * t * cy + t * t * z.y, s = a.s + (z.s - a.s) * t;
      var op = dir === 'out' ? (t < f ? o0 : o0 * (1 - (t - f) / (1 - f))) : (t < f ? o0 + (1 - o0) * t / f : 1);
      ks.push({ offset: t, transform: 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0) scale(' + s.toFixed(4) + ')', color: mix(c0, c1, Math.min(1, t / TONE), dir === 'out' ? Math.max(0, (t - .7) / .3) : Math.min(1, t / TONE)), opacity: op.toFixed(3) });   // dims to the rail's quiet tone only as it lands
    }
    c.style.visibility = 'visible';
    return c.animate(ks, { duration: full ? DUR : DUR * .8, easing: EASE, fill: 'forwards' });
  }
  function o_on(c) { return c.style.visibility === 'visible'; }

  function settle(o, k, where) {
    halt(o); o.fly = false; o.at = where;
    o.cn.style.visibility = o.cm.style.visibility = 'hidden'; o.cn._pin = o.cm._pin = false;
    o.li.classList.toggle('is-flown', where === 'rail');
    links[k].classList.toggle('is-landed', where === 'rail');
    if (where === 'line') { clearTimeout(lt[k]); links[k].classList.remove('is-land'); }
    if (!st.every(function (x) { return x.at === where; })) return;
    if (where === 'line') {   // all back: the rail goes quiet at once (the engine hides it before step 01)
      rail.style.transition = 'none'; rail.classList.remove('rail--fly'); void rail.offsetWidth; rail.style.transition = '';
    } else rail.classList.remove('rail--fly');   // all on the rail: the engine keeps it on through the five steps
  }
  function launch(o, k, dir) {
    halt(o); o.fly = true;    // a pinned traveller keeps the tone it has reached
    var lk = links[k], b = lk.querySelector('b'), sp = lk.querySelector('span'), lab = sp && sp.offsetWidth > 0;
    var dy = dir === 'in' ? -sec.getBoundingClientRect().top : 0;   // flying back: where the stop rests once the slide settles
    var cRail = rgb(getComputedStyle(lk).color);
    if (dir === 'in') { clearTimeout(lt[k]); lk.classList.remove('is-landed', 'is-land'); }
    o.an = [travel(o.cn, o.n, b, 'c', dir, dir === 'out' ? .85 : .15, dy, cRail),
            travel(o.cm, o.nm, lab ? sp : b, lab ? 'r' : 'l', dir, lab ? .6 : .35, dy, cRail)];   // no label (the phone): the name gives way before it meets its number
    if (dir === 'out') o.tm.push(setTimeout(function () {
      lk.classList.add('is-landed', 'is-land'); clearTimeout(lt[k]);
      lt[k] = setTimeout(function () { lk.classList.remove('is-land'); }, 1100);   // its label shows as it lands, then settles
    }, (o.an[0].effect.getTiming().duration) * LAND));
    o.an[0].onfinish = function () { settle(o, k, dir === 'out' ? 'rail' : 'line'); };
  }
  function go(o, k, dir, delay) {
    var was = o.at, fl = o.fly; halt(o);
    // not yet lifted off (still waiting its turn): it simply stays where it is
    if (!fl && was !== 'line' && was !== 'rail') { settle(o, k, dir === 'in' ? 'line' : 'rail'); return; }
    o.at = dir;
    if (dir === 'out' && !fl) pin(o, k);   // pinned travellers count as flying: turning round sends them back to the line from there
    if (dir === 'out') o.li.classList.add('is-flown');
    o.tm.push(setTimeout(function () { launch(o, k, dir); }, fl ? 0 : delay));
  }
  function redraw() {         // the line draws itself in again from the left, as on arrival
    if (!sec.classList.contains('vfly-away')) return;
    if (svg) { svg.style.transition = 'none'; svg.style.clipPath = 'inset(-12px 100% -12px 0)'; }
    sec.classList.remove('vfly-away');
    if (svg) { void svg.getBoundingClientRect(); svg.style.transition = svg.style.clipPath = ''; }
  }
  function send(dir) {
    if (dir === 'out') sec.classList.add('vfly-away'); else redraw();
    rail.classList.add('rail--fly');
    var j = 0;
    st.forEach(function (o, k) {
      if (dir === 'out' ? (o.at === 'line' || o.at === 'in') : (o.at === 'rail' || o.at === 'out')) go(o, k, dir, j++ * GAP);
    });
  }
  function jump(where) {      // the preview was passed in one jump (a link, a key): no flight, just the end state
    if (where === 'rail') sec.classList.add('vfly-away'); else redraw();
    st.forEach(function (o, k) { settle(o, k, where); });
  }

  var lastY = scrollY;
  (function frame() {
    var y = scrollY, d = y > lastY + .5 ? 1 : y < lastY - .5 ? -1 : 0; lastY = y;
    if (d) {
      var r = sec.getBoundingClientRect(), vh = innerHeight, railOn = links[0].getBoundingClientRect().width > 0;
      var anyOnLine = st.some(function (o) { return o.at === 'line' || o.at === 'in'; }), anyAway = st.some(function (o) { return o.at === 'rail' || o.at === 'out'; });
      if (d > 0 && anyOnLine && r.height && r.top < -vh * .06) { if (r.bottom <= 0 || !railOn) jump('rail'); else send('out'); }
      else if (d < 0 && anyAway && r.top > -vh * .85) { if (r.top >= vh || !railOn) jump('line'); else send('in'); }
    }
    requestAnimationFrame(frame);
  })();
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
  // and once the closing screen fills the lower part of the window: it is where the bar leads, so the bar has nothing
  // more to offer there (round 5 QA, task 2846db82: S on a phone showed it on its own closing screen, beside the last line)
  var io2 = new IntersectionObserver(function (es) { es.forEach(function (e) { seen.set(e.target, e.isIntersecting); }); apply(); }, { threshold: 0, rootMargin: '0px 0px -40% 0px' });
  ['begin', 'c-begin'].forEach(function (id) { var s = document.getElementById(id); if (s) { seen.set(s, false); io2.observe(s); } });
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
    pull(by);
  }
  /* round 5 (J 13 Nov: "I don't get any sense of gravity or pull like I do when scrolling between the other slides ... take
     inspiration from how the Apple Watch does it"): the settle is a short pull, fast then soft (ease-out, 420 to 640 ms by
     distance), like the slides' own snap, not the browser's slow smooth scroll; any wheel, touch or key stops it */
  var anim = 0, animating = false;
  function stop() { if (anim) cancelAnimationFrame(anim); anim = 0; animating = false; }
  function pull(by) {
    stop();
    if (Math.abs(by) < 1) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { scrollBy(0, by); return; }
    var y0 = scrollY, t0 = performance.now(), dur = Math.min(640, 420 + Math.abs(by) * .25);
    animating = true;
    (function step(now) {
      var k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 4);
      scrollTo(0, y0 + by * e);
      if (k < 1 && animating) anim = requestAnimationFrame(step); else stop();
    })(t0);
  }
  ['wheel', 'keydown', 'mousedown'].forEach(function (ev) { addEventListener(ev, stop, { passive: true }); });
  function onScroll() {
    if (!pending) { pending = true; requestAnimationFrame(look); }
    if (animating) return;
    clearTimeout(t); t = setTimeout(settle, 140);
  }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('touchstart', function () { touching = true; stop(); clearTimeout(t); }, { passive: true });
  addEventListener('touchend', function () { touching = false; clearTimeout(t); t = setTimeout(settle, 220); }, { passive: true });
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
/* round 5 (task 2846db82): the voices slide is round 3's centred one again, on the forest ground (mgs.css), so the header
   reads it as dark (next.js marked it light for 2.2's clay); a long quote is set smaller so the quotes' shared box, sized
   by the longest, does not leave a short quote floating far below the quote mark */
[].forEach.call(document.querySelectorAll('main[data-world="salon"] .voices'), function (s) { s.setAttribute('data-tone', 'dark'); });
[].forEach.call(document.querySelectorAll('.voices .q blockquote'), function (b) { if (b.textContent.trim().length > 90) b.parentNode.classList.add('is-long'); });
/* task b36dde1f (J, 17 Nov: "The videos are not moving"): the films start the way a person arrives, on every Safari.
   The shared engine attaches each film two screens ahead and, 4.5 s later, if no frame has loaded yet, swaps it to a
   whole download and reloads it. With preload="none" nothing loads until a film is asked to play, so for a person (who
   takes more than 4.5 s to come down two screens) every film was swapped, and a film already asked to play was reset to
   paused by the swap and never asked again. M/G/S attach their films here instead (2.2-2.4 keep the engine's, byte-
   identical): the stream only, the whole download only after a real error, and a film the page wants is asked to play
   again after any swap, once it can play, and on every tap (a phone in Low Power Mode plays films only from a tap). */
(function () {
  var films = [].slice.call(document.querySelectorAll('video[data-src]')), toggle = document.getElementById('films-toggle'), cache = {};
  // the one motion switch (mgs_parts.MOTION_HEAD): on the launched site a device asking for Reduce Motion gets the photos, no films
  var calm = document.documentElement.getAttribute('data-motion') === 'calm';
  if (!films.length || !('IntersectionObserver' in window)) return;
  function held() { return toggle && toggle.getAttribute('aria-pressed') === 'true'; }
  // the engine sets _want (on screen) and _stopped (the hero that slows to stillness); this only asks again
  // a refused start (Safari in Low Power Mode refuses every film until a tap, click or key; scrolling never counts,
  // measured on J's MacBook 17 Nov) leaves the film's photo drifting slowly instead of standing still (mgs.css is-held)
  function refused(v) { var f = v.closest('.ch__top, .s__zoom'); if (f) f.classList.add('is-held'); }
  function go(v) { if (calm || !v._want || v._stopped || held() || !v.paused || !v.getAttribute('src')) return; var p = v.play(); if (p && p.catch) p.catch(function (e) { if (e && e.name === 'NotAllowedError') refused(v); }); }
  function attach(v) {
    if (v._mine || calm) return; v._mine = true;
    var url = v.getAttribute('data-src');
    v.addEventListener('playing', function () { v.classList.add('is-on'); });
    v.addEventListener('canplay', function () { go(v); });
    v.addEventListener('error', function () {
      if (v._blob || !window.fetch) return; v._blob = true;
      (cache[url] = cache[url] || fetch(url).then(function (r) { if (!r.ok) throw r.status; return r.blob(); }).then(function (b) { return URL.createObjectURL(b); }))
        .then(function (u) { v.src = u; go(v); }).catch(function () {});
    });
    // load() as the engine did: a browser that fetches ahead on it (WebKit on a Mac does, preload="none" or not) has the
    // film ready when the person arrives; measured, without it a phone-speed film starts 0.8-1.3 s late (task b36dde1f)
    v.src = url; v.load(); go(v);
  }
  // the engine's own attach steps aside (it returns at once on _attached); its frame loop still says which film is wanted
  films.forEach(function (v) { v._attached = true; });
  // each film's section is watched (a film's own box can be zero-sized while its world is hidden), two screens ahead
  var of = new Map();
  films.forEach(function (v) { var s = v.closest('.s') || v; of.set(s, (of.get(s) || []).concat(v)); });
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { of.get(e.target).forEach(attach); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px 200% 0px' });
  of.forEach(function (vs, s) { io.observe(s); });
  ['touchend', 'click', 'keydown'].forEach(function (ev) { addEventListener(ev, function () { films.forEach(go); }, { passive: true }); });
  // a wanted film that is still paused a moment after it came into view (a refused play, a stalled start) is asked again
  setInterval(function () { if (!document.hidden) films.forEach(go); }, 1500);
})();
