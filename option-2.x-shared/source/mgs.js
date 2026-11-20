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
   line stayed behind). Off in ?shot and with reduced motion, where the rail simply fades in with the steps.
   Task 7a3c013b (J 18 Nov: Inner Work is the salon world's twin, only the copy changes): one rail for both worlds. Each of
   its links carries Inner Work's step name and link beside the salon's and takes its world's as the world changes; each
   world's preview flies into it while that world is on screen, and a world switch (which starts at the top) sets both
   previews' stops back on their line. */
(function () {
  var root = document.documentElement, links = [].slice.call(document.querySelectorAll('#rail a[data-c-href]'));
  if (!links.length) return;
  links.forEach(function (a) { a._salon = [a.getAttribute('href'), a.querySelector('span').textContent]; });
  function apply() {
    var c = root.getAttribute('data-world') === 'coaching';
    links.forEach(function (a) {
      a.setAttribute('href', c ? a.getAttribute('data-c-href') : a._salon[0]);
      a.querySelector('span').textContent = c ? a.getAttribute('data-c-name') : a._salon[1];
    });
  }
  new MutationObserver(apply).observe(root, { attributes: true, attributeFilter: ['data-world'] });
  apply();
})();
[].forEach.call(document.querySelectorAll('#visit.lnsec, #c-visit.lnsec'), function (sec) {
  var rail = document.getElementById('rail'), root = document.documentElement, main = sec.closest('main');
  if (!rail || root.hasAttribute('data-shot') || matchMedia('(prefers-reduced-motion: reduce)').matches || !document.body.animate) return;
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

  new MutationObserver(function () { jump('line'); }).observe(root, { attributes: true, attributeFilter: ['data-world'] });
  var lastY = scrollY;
  (function frame() {
    var y = scrollY, d = y > lastY + .5 ? 1 : y < lastY - .5 ? -1 : 0; lastY = y;
    if (d && !main.hidden) {
      var r = sec.getBoundingClientRect(), vh = innerHeight, railOn = links[0].getBoundingClientRect().width > 0;
      var anyOnLine = st.some(function (o) { return o.at === 'line' || o.at === 'in'; }), anyAway = st.some(function (o) { return o.at === 'rail' || o.at === 'out'; });
      if (d > 0 && anyOnLine && r.height && r.top < -vh * .06) { if (r.bottom <= 0 || !railOn) jump('rail'); else send('out'); }
      else if (d < 0 && anyAway && r.top > -vh * .85) { if (r.top >= vh || !railOn) jump('line'); else send('in'); }
    }
    requestAnimationFrame(frame);
  })();
});
/* task 7a3c013b: the pause's opening sentence leads (mgs.css .is-head): its words, up to the first full stop or question
   mark, in each world. And a voices block with a single quote shows it (engine.js only turns quotes on from two, to rotate) */
function pauseHead() {      // again after the option switcher swaps the pause back in (options.js "om:swap", task e5325977)
  [].forEach.call(document.querySelectorAll('#pause .mani__text, #c-pause .mani__text'), function (t) {
    var w = t.querySelectorAll('.wd');
    for (var i = 0; i < w.length; i++) { w[i].classList.add('is-head'); if (/[.?!]\s*$/.test(w[i].textContent)) { w[i].classList.add('is-head-end'); break; } }
    t.classList.toggle('has-long-head', i > 3);      // task a78e6208: a long opening sentence (Inner Work's) is set a size smaller
  });
}
pauseHead(); document.addEventListener('om:swap', pauseHead);
/* letters written in one by one keep the font's own kerning (task a78e6208, CEO MA 19 Nov: the e and the a of "breath" stood
   apart): each letter is its own box for the ink animation (base.css .l), which drops the kerning the word set whole would have.
   Each pair is measured in the letter's own font on a canvas (which kerns) and the second letter takes the pair's kerning as a
   margin, in em, so it holds at every size. Every element the engine writes letter by letter; again once the fonts have loaded
   and after the option switcher swaps a section in. */
(function () {
  var cv = document.createElement('canvas').getContext('2d'), cache = {};
  function kern() {
    [].forEach.call(document.querySelectorAll('[data-write="letters"] .wd'), function (w) {
      var ls = w.querySelectorAll('.l'); if (ls.length < 2) return;
      for (var i = 1; i < ls.length; i++) {
        var ca = getComputedStyle(ls[i - 1]), cb = getComputedStyle(ls[i]);
        if (ca.fontFamily !== cb.fontFamily || ca.fontStyle !== cb.fontStyle || ca.fontWeight !== cb.fontWeight) { ls[i].style.marginLeft = ''; continue; }
        var font = cb.fontStyle + ' ' + cb.fontWeight + ' 100px ' + cb.fontFamily, a = ls[i - 1].textContent, b = ls[i].textContent, k = font + '|' + a + b;
        if (!(k in cache)) { cv.font = font; cache[k] = (cv.measureText(a + b).width - cv.measureText(a).width - cv.measureText(b).width) / 100; }
        ls[i].style.marginLeft = Math.abs(cache[k]) > .001 ? cache[k].toFixed(4) + 'em' : '';
      }
    });
  }
  kern();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { cache = {}; kern(); });
  document.addEventListener('om:swap', function () { setTimeout(kern, 0); });
})();
/* task a78e6208: what keeps clear of the floating booking bar (.wdoor; the pause's door, nothing sits on a picture) reads the
   bar's real half width, plus a 40 px gap, as --bar-half on <html>: each world's bar has its own words and width */
(function () {
  var bars = document.querySelectorAll('.wdoor'); if (!bars.length || !window.ResizeObserver) return;
  var set = function () {
    for (var k = 0; k < bars.length; k++) { var r = bars[k].getBoundingClientRect();
      if (r.width > 0) { document.documentElement.style.setProperty('--bar-half', Math.ceil(r.width / 2 + 40) + 'px'); return; } }
  };
  var ro = new ResizeObserver(set); [].forEach.call(bars, function (b) { ro.observe(b); }); set();
})();
[].forEach.call(document.querySelectorAll('[data-quotes]'), function (q) { var it = q.querySelectorAll('.q'); if (it.length === 1) it[0].classList.add('is-on'); });
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
/* task 0e3c8e1c: a menu row opens when the mouse moves onto it, never when the page moves under a still mouse (a wheel
   scroll, the settle's pull, a snap). engine.js opens a row on the browser's pointerenter and lets the menu drift again on
   pointerleave, and browsers send both when the list slides under a pointer that has not moved. Here the browser's own
   mouse enter/leave on a row stop at the menu, and the same two events are sent to engine.js only for the mouse's own
   moves. engine.js is unchanged (2.2-2.4 share it); touch, click and keys never pass through here. */
(function () {
  var menus = [].slice.call(document.querySelectorAll('.mn'));
  if (!menus.length || !window.PointerEvent) return;
  var x = null, y = null, at = null, own = false;
  function send(row, type) { own = true; try { row.dispatchEvent(new PointerEvent(type, { pointerType: 'mouse', clientX: x, clientY: y })); } finally { own = false; } }
  menus.forEach(function (s) {
    ['pointerenter', 'pointerleave'].forEach(function (type) {
      s.addEventListener(type, function (e) {
        if (!own && e.pointerType === 'mouse' && e.target.classList && e.target.classList.contains('mn__row')) e.stopImmediatePropagation();
      }, true);
    });
  });
  addEventListener('pointermove', function (e) {
    if (e.pointerType !== 'mouse' || (e.clientX === x && e.clientY === y)) return;   // same spot: the page moved, not the mouse
    x = e.clientX; y = e.clientY;
    var row = e.target.closest ? e.target.closest('.mn .mn__row') : null;
    if (row === at) return;
    if (at) send(at, 'pointerleave');
    at = row;
    if (row) send(row, 'pointerenter');
  }, { capture: true, passive: true });
  // the mouse leaves the window: the row it was on lets go, as before
  document.documentElement.addEventListener('pointerleave', function (e) {
    if (e.pointerType === 'mouse' && at) { send(at, 'pointerleave'); at = null; x = y = null; }
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
/* the glass under the header (mgs.css .hdr-glass, task 95ac520e): its own layer, just before the header */
(function () {
  var h = document.getElementById('hdr'); if (!h || document.querySelector('.hdr-glass')) return;
  var g = document.createElement('div'); g.className = 'hdr-glass'; g.setAttribute('aria-hidden', 'true'); h.parentNode.insertBefore(g, h);
})();
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
    if (ground) {      // the glass header's veil (mgs.css .hdr-glass): the section's ground, or its tone's when it paints none
      var bg = getComputedStyle(ground).backgroundColor;
      if (bg === 'transparent' || /rgba\([^)]*,\s*0\)$/.test(bg)) bg = ground.getAttribute('data-tone') === 'dark' ? 'var(--umber)' : 'var(--clay)';
      root.style.setProperty('--hdr-ground', bg);
    }
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
[].forEach.call(document.querySelectorAll('main[data-world] .mani.dark'), function (s) { s.setAttribute('data-tone', 'dark'); });
/* round 5 (task 2846db82): the voices slide is round 3's centred one again, on the forest ground (mgs.css), so the header
   reads it as dark (next.js marked it light for 2.2's clay); a long quote is set smaller so the quotes' shared box, sized
   by the longest, does not leave a short quote floating far below the quote mark */
[].forEach.call(document.querySelectorAll('main[data-world] .voices'), function (s) { s.setAttribute('data-tone', 'dark'); });
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
  // a refused start (Safari will not start a muted film in a window it judges unseen, e.g. another desktop or a hidden
  // Stage Manager set, nor any film on an iPhone in Low Power Mode until a tap) leaves the film's photo drifting slowly
  // instead of standing still (mgs.css is-held); a tap, click or key still starts it
  function refused(v) { var f = v.closest('.ch__top, .s__zoom'); if (f) f.classList.add('is-held'); if (!refusing) { refusing = true; films.forEach(function (x) { if (x._mine) asImage(x); }); } asImage(v); }
  /* task b36dde1f (J 17 Nov: "When you go into that section and scroll, the video is static and doesn't move at all. When
     the image at the top disappears, a few seconds later the video starts reproducing"): measured in J's own Safari (Low
     Power Mode on, even on power): until the person's first click or key Safari refuses every <video>, but the same film
     laid in as <img src="film.mp4"> moves by itself (57 % of its pixels changed between two frames, the <video> 0 %). So
     once a film is refused, each film (this one at once, the others as they are attached two screens ahead) is laid into
     its frame under the <video> as that moving image, fading in over the photo, and moves alongside it from the moment its
     step is on screen; a later click or key still starts the <video> itself, which fades in over it. The hero, which slows
     to a stillness, keeps its drifting photo. Browsers that cannot show a film as an image (Chromium) never refuse it. */
  var refusing = false;
  function asImage(v) {
    if (v._img || calm || v.hasAttribute('data-stop')) return;
    var im = document.createElement('img'); im.className = 'film-img'; im.alt = ''; im.setAttribute('aria-hidden', 'true');
    im.addEventListener('load', function () { im.classList.add('is-on'); });
    // over the <video> (a refused start still fires "playing" then "pause", which shows the <video>'s still first frame)
    // and under the photo; it steps aside once the <video> truly plays, its clock moving after a click or key
    if (!v._tu) { v._tu = true; v.addEventListener('timeupdate', function () { if (v._img && !v.paused && v.currentTime > 0.2) v._img.classList.remove('is-on'); }); }
    // the lighter HEVC twin where the browser plays HEVC: iOS Safari moves it laid in as a picture as it moves the H.264 film
    // (qa/sim-img-films.mjs, 19 Nov, two screenshots 900 ms apart: SSIM 0.56 for each, a still control 1.00); a twin it
    // refuses as a picture gives way to the H.264 film
    var h264 = v.getAttribute('data-src'), url = !v._noHevc && window.omFilmSrc ? window.omFilmSrc(v) : h264;
    if (url !== h264) im.addEventListener('error', function () { if (im.getAttribute('src') !== h264) im.src = h264; });
    im.src = url; v.parentNode.insertBefore(im, v.nextSibling); v._img = im;
  }
  function go(v) { if (calm || !v._want || v._stopped || held() || !v.paused || !v.getAttribute('src')) return; var p = v.play(); if (p && p.catch) p.catch(function (e) { if (e && e.name === 'NotAllowedError') refused(v); }); }
  function attach(v) {
    if (v._mine || calm) return; v._mine = true;
    if (refusing) asImage(v);
    var url = v.getAttribute('data-src');
    // the lighter HEVC twin where this browser plays HEVC (mgs_parts.FILM_HEAD), until it once fails here
    if (!v._noHevc && window.omFilmSrc) url = window.omFilmSrc(v);
    if (!v._wired) {
      v._wired = true;
      v.addEventListener('playing', function () { if (v._mine) v.classList.add('is-on'); });
      v.addEventListener('canplay', function () { go(v); });
      v.addEventListener('error', function () {
        if (!v._mine) return;
        // a twin that fails gives way to the H.264 film, then (as before) the whole download of it
        if (!v._noHevc && v.getAttribute('src') === v.getAttribute('data-src-hevc')) { v._noHevc = true; v.src = v.getAttribute('data-src'); v.load(); go(v); return; }
        url = v.getAttribute('data-src');
        if (v._blob || !window.fetch) return; v._blob = true;
        (cache[url] = cache[url] || fetch(url).then(function (r) { if (!r.ok) throw r.status; return r.blob(); }).then(function (b) { return URL.createObjectURL(b); }))
          .then(function (u) { v._blobUrl = u; if (v._mine) { v.src = u; go(v); } }).catch(function () {});
      });
    }
    // load() as the engine did: a browser that fetches ahead on it (WebKit on a Mac does, preload="none" or not) has the
    // film ready when the person arrives; measured, without it a phone-speed film starts 0.8-1.3 s late (task b36dde1f)
    v.src = v._blobUrl || url; v.load(); go(v);
  }
  /* task 5cb93228 (CEO MA 18 Nov: J's Safari "reloaded because it was using significant memory"): measured in WebKit
     through a whole read of M, every film stayed loaded once attached, and a refused film's moving image beside it. A
     film more than two screens away is let go (its decoder and buffer freed, its moving image removed) and is attached
     again two screens before the person reaches it, from the browser's cache; its photo stands in its frame meanwhile,
     as it does before any film arrives. */
  function release(v) {
    v._pfrom = 0; v._dec = false;      // its photo is decoded ahead again when its step comes back near (task 5cf1107e)
    if (!v._mine) return; v._mine = false;
    try { v.pause(); } catch (e) {}
    v.classList.remove('is-on');
    if (v._img) { var im = v._img; v._img = null; im.removeAttribute('src'); if (im.parentNode) im.parentNode.removeChild(im); }
    v.removeAttribute('src'); try { v.load(); } catch (e) {}
  }
  // the engine's own attach steps aside (it returns at once on _attached); its frame loop still says which film is wanted
  films.forEach(function (v) { v._attached = true; });
  // each film's section is watched (a film's own box can be zero-sized while its world is hidden): attached two screens
  // ahead, let go once it is more than two screens away in either direction (or its world is hidden)
  var of = new Map();
  films.forEach(function (v) { var s = v.closest('.s') || v; of.set(s, (of.get(s) || []).concat(v)); });
  /* nearest first (task 5cb93228, J 18 Nov: "Ensure films, music all is extremely fast so the experience is seamless"):
     measured on one shared 4G line, coming near the first step attached three step films at once (3.8 + 5.9 + 2.0 MB) and
     the step's own film moved only after 8.4 s. So of the films within two screens, every film on screen loads at once, and
     of the others only the nearest, the next one once it can play (or 4 s on, so a stalled film never holds the rest). */
  /* a step's own photo first, then its film (task 5cf1107e, J 19 Nov: "It takes to long to load all images especially in the
     5 steps sections, brakes the user experience"): measured on one shared 4G line, a jump to the fourth step waited 12 s for
     its photo and 9.5 s for its film, behind all five steps' photos (asked from the page's start), three films and four
     sounds; the sections just above and below the screen counted as on it, so their films loaded at once too. So a step's
     photo loads only as its step comes near (build.chapter: loading="lazy"), in this same nearest-first line: its photo,
     decoded ahead so painting it never holds a frame, then its film, then the next step's. A section beside the screen is
     not on it. */
  function away(v) { var r = (v.closest('.s') || v).getBoundingClientRect(); if (!r.width && !r.height) return 1e9; return r.bottom <= 0 ? 1 - r.bottom : r.top >= innerHeight ? 1 + r.top - innerHeight : 0; }
  function ready(v) { return !v.paused || v.readyState >= 3 || (v._img && v._img.complete) || performance.now() - v._from > 4000; }
  function photo(v) { if (v._ph === undefined) { var s = v.closest('.s'); v._ph = (s && s.querySelector('.ch__top img')) || null; } return v._ph; }
  function photoReady(v) { var im = photo(v); return !im || (im.complete && im.naturalWidth > 0 && v._dec) || performance.now() - v._pfrom > 4000; }
  function ask(v) {
    var im = photo(v); if (!im || v._pfrom) return; v._pfrom = performance.now();
    var done = function () { v._dec = true; pump(); };
    if (im.loading === 'lazy') im.loading = 'eager';
    if (im.decode) im.decode().then(done, done); else if (im.complete) done(); else { im.addEventListener('load', done); im.addEventListener('error', done); }
  }
  function pump() {
    if (calm) return; var busy = false;
    films.filter(function (v) { return v._near; }).map(function (v) { return [away(v), v]; }).sort(function (a, b) { return a[0] - b[0]; })
      .forEach(function (x) { var v = x[1]; if (x[0] > 0 && busy) return; ask(v); if (!photoReady(v)) { busy = true; return; }
        if (!v._mine) { v._from = performance.now(); attach(v); } if (!ready(v)) busy = true; });
  }
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { of.get(e.target).forEach(function (v) { v._near = e.isIntersecting; if (!v._near) release(v); }); });
    pump();
  }, { rootMargin: '200% 0px 200% 0px' });
  of.forEach(function (vs, s) { io.observe(s); });
  films.forEach(function (v) { ['canplay', 'canplaythrough', 'playing'].forEach(function (ev) { v.addEventListener(ev, pump); }); });
  var pumping = false; addEventListener('scroll', function () { if (!pumping) { pumping = true; requestAnimationFrame(function () { pumping = false; pump(); }); } }, { passive: true });
  ['touchend', 'click', 'keydown'].forEach(function (ev) { addEventListener(ev, function () { films.forEach(go); }, { passive: true }); });
  // a wanted film that is still paused a moment after it came into view (a refused play, a stalled start) is asked again,
  // and the next film in line starts loading once the one before it can play
  setInterval(function () { if (!document.hidden) { pump(); films.forEach(go); } }, 1500);
})();
/* Each picture at the size the screen needs (task b1dd24c9): build.py gives M/G/S pictures a srcset, which a browser
   prefers to src. The tweak panel (tweaks.js, shared with 2.2) swaps a picture by setting its src, so while a picture
   shows a tweaked file its srcset is set aside, and it comes back with "Use the original". */
(function () {
  function sync(im) {
    var custom = im.hasAttribute('data-orig') && im.getAttribute('src') !== im.getAttribute('data-orig');
    if (custom && im.hasAttribute('srcset')) { im.setAttribute('data-hd-srcset', im.getAttribute('srcset')); im.removeAttribute('srcset'); }
    else if (!custom && im.hasAttribute('data-hd-srcset')) { im.setAttribute('srcset', im.getAttribute('data-hd-srcset')); im.removeAttribute('data-hd-srcset'); }
  }
  var mo = new MutationObserver(function (ms) { ms.forEach(function (m) { if (m.target.tagName === 'IMG') sync(m.target); }); });
  document.querySelectorAll('img[srcset]').forEach(function (im) { mo.observe(im, { attributes: true, attributeFilter: ['src', 'data-orig'] }); sync(im); });
})();

/* the fluted glass (one block; task a78e6208): an element with data-flute="<ribs>" over a picture gets that many ribs, each the
   same picture, shifted a little and softened, locked to the picture behind it as the glass slides and the page scrolls. The
   picture is the first <img> of the nearest ancestor holding one; data-flute-bend sets how far a rib bends it (px, 14) and
   data-flute-mag how much it magnifies (1.06). No WebGL (J's desktop Safari, 18 Nov). Used by A's strip (.ps__lens), the
   glass door's two leaves and Step through's strip. Draws only while on screen; calm motion holds it still. */
(function () {
  var all = [], queued = false, running = false;
  var calm = function () { return document.documentElement.getAttribute('data-motion') === 'calm' || matchMedia('(prefers-reduced-motion: reduce)').matches; };
  function find() {
    all = [].slice.call(document.querySelectorAll('[data-flute]')).map(function (el) {
      var p = el.parentElement; while (p && !p.querySelector('img')) p = p.parentElement;
      if (!p) return null;
      var n = +el.getAttribute('data-flute') || 12;
      if (el.children.length !== n) { el.textContent = ''; for (var k = 0; k < n; k++) el.appendChild(document.createElement('i')); }
      return { el: el, scope: el.closest('section') || p, img: p.querySelector('img'), ribs: [].slice.call(el.children), src: '',
               bend: +(el.getAttribute('data-flute-bend') || 14), mag: +(el.getAttribute('data-flute-mag') || 1.06) };
    }).filter(Boolean);
    q();
  }
  function draw(x) {
    var sr = x.scope.getBoundingClientRect(); if (sr.height === 0 || sr.bottom < 0 || sr.top > innerHeight) return false;
    var src = x.img.currentSrc || x.img.src; if (!src) return false;
    if (src !== x.src) { x.src = src; x.ribs.forEach(function (r) { r.style.backgroundImage = 'url("' + src + '")'; }); }
    var ir = x.img.getBoundingClientRect(), ar = (x.img.naturalWidth / x.img.naturalHeight) || 1.5;
    var bw = ir.width, bh = ir.width / ar; if (bh < ir.height) { bh = ir.height; bw = bh * ar; }
    var op = (getComputedStyle(x.img).objectPosition || '50% 50%').split(' ').map(function (v) { return v.indexOf('%') > 0 ? parseFloat(v) / 100 : .5; });
    var ox = ir.left + (ir.width - bw) * op[0], oy = ir.top + (ir.height - bh) * (op[1] == null ? .5 : op[1]);
    var still = calm(), fr = x.el.getBoundingClientRect(), n = x.ribs.length, rw = fr.width / n, shift = still ? 0 : (sr.top / sr.height) * 26;
    x.ribs.forEach(function (r, j) {
      var b = Math.sin((j / n) * Math.PI * 2 + (still ? 0 : sr.top / 220)) * x.bend + shift;
      r.style.backgroundSize = (bw * x.mag) + 'px ' + (bh * x.mag) + 'px';
      r.style.backgroundPosition = (ox - (fr.left + j * rw) + b) + 'px ' + (oy - fr.top) + 'px';
    });
    return true;
  }
  function frame() {
    queued = false; var any = false;
    all.forEach(function (x) { if (draw(x)) any = true; });
    // while a glass on screen can move by itself (a leaf sliding, a picture breathing), keep drawing; off screen or calm, stop
    if (any && !calm()) { running = true; requestAnimationFrame(frame); } else running = false;
  }
  function q() { if (!queued && !running) { queued = true; requestAnimationFrame(frame); } }
  addEventListener('scroll', q, { passive: true }); addEventListener('resize', q);
  document.addEventListener('om:swap', function () { setTimeout(find, 0); });
  document.addEventListener('load', function (e) { if (e.target && e.target.tagName === 'IMG') q(); }, true);
  find();
})();

/* the pause's scenes (mgs_sections.pause_scene, offered by the option switcher, task e5325977; Designer 3's r1 page and the
   door options, task a78e6208): B's breath, the room opening as you scroll in and the question arriving on the exhale; D2's
   step through, the door growing from where the default draws it until it fills the screen. Found again after every swap.
   The five steps' scroll options too (build.chapter ch--scroll, task 5cf1107e; J 19 Nov: "play with scroll to switch between
   the nature video and the other video ... Just like in the take a breath section"): the same progress through the section;
   the step's content is held on screen in one sticky frame (.ch__stick, put in here and taken out again when today's comes
   back, its elements moved, never redrawn, so its film plays on) and --e says how far its photo has handed over to its film
   (0 the photo, 1 the film); mgs.css draws each way. The sheet's ribs are the fluted glass (data-flute) over the photo. */
(function () {
  var breaths = [], throughs = [], steps = [], queued = false, RIBS = 18;
  var calm = function () { return document.documentElement.getAttribute('data-motion') === 'calm' || matchMedia('(prefers-reduced-motion: reduce)').matches; };
  function find() {
    breaths = [].slice.call(document.querySelectorAll('.ps--breath')).map(function (s) {
      return { s: s, pic: s.querySelector('.ps__pic'), cue: s.querySelector('.ps__cue') };
    });
    throughs = [].slice.call(document.querySelectorAll('.ps--through'));
    var ribbed = false;
    [].forEach.call(document.querySelectorAll('.s.ch.ch--stack'), function (s) {
      var on = s.classList.contains('ch--scroll'), st = s.querySelector(':scope > .ch__stick');
      if (on && !st) { st = document.createElement('div'); st.className = 'ch__stick'; while (s.firstChild) st.appendChild(s.firstChild); s.appendChild(st); }
      else if (!on && st) { while (st.firstChild) s.insertBefore(st.firstChild, st); s.removeChild(st); s.style.removeProperty('--e'); }
      var top = s.querySelector('.ch__top'), rb = top && top.querySelector(':scope > .ch__ribs'), want = s.classList.contains('ch--scroll-sheet');
      if (want && top && !rb) {
        rb = document.createElement('div'); rb.className = 'ch__ribs'; rb.setAttribute('aria-hidden', 'true');
        rb.setAttribute('data-flute', RIBS); rb.setAttribute('data-flute-bend', '10'); rb.setAttribute('data-flute-mag', '1.03');
        for (var k = 0; k < RIBS; k++) { var i = document.createElement('i'); i.style.setProperty('--j', (k / (RIBS - 1)).toFixed(3)); rb.appendChild(i); }
        top.appendChild(rb); ribbed = true;
      } else if (!want && rb) top.removeChild(rb);
    });
    steps = [].slice.call(document.querySelectorAll('.s.ch--scroll'));
    // the fluted glass finds its ribs when a swap is announced; ribs put in at load (a remembered option) are announced here
    if (ribbed && !loaded) document.dispatchEvent(new CustomEvent('om:swap', { detail: { key: 'steps', ribs: true } }));
    q();
  }
  var ease = function (t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  // how far the reader is through a section taller than the screen: 0 its top at the screen's top, 1 its end at the screen's end
  function prog(s) { var r = s.getBoundingClientRect(), span = r.height - innerHeight; return r.height === 0 || span <= 0 ? null : Math.min(1, Math.max(0, -r.top / span)); }
  function breath(x) {
    var p = prog(x.s); if (p === null) return;
    if (calm() || document.documentElement.hasAttribute('data-shot')) p = 1;
    var inh = ease(Math.min(1, p / .5)), exh = ease(Math.min(1, Math.max(0, (p - .5) / .35))), narrow = innerWidth < 760;
    x.s.style.setProperty('--ct', (48 * (1 - inh)) + '%');
    x.s.style.setProperty('--cs', ((narrow ? 6 : 18) * (1 - inh)) + '%');
    x.s.style.setProperty('--cr', (40 * (1 - inh)) + 'px');
    x.s.style.setProperty('--sc', (1 + .08 * inh - .06 * exh).toFixed(4));
    x.s.style.setProperty('--dim', (.2 + .35 * inh - .1 * exh).toFixed(3));
    if (x.cue) { x.cue.textContent = x.cue.getAttribute(p < .5 ? 'data-in' : 'data-out'); x.cue.style.opacity = p > .92 ? 0 : 1; }
    x.s.classList.toggle('is-exhale', p > .58); x.s.classList.toggle('is-rest', p > .86);
  }
  // the door's box at the start is the default's (mgs.css #pause: on the column's right end, 86 % of the screen tall, clear of
  // the "Book your visit" bar; on a phone centred under the words); at the end it stands wider than the screen is tall,
  // centred, its arch above the top edge, so the room fills the view
  function through(s) {
    var H = innerHeight, W = innerWidth, p = prog(s); if (p === null) return;
    var still = calm();
    if (still) p = 0;
    var e = ease(Math.min(1, p / .8)), cs = getComputedStyle(s), st = s.querySelector('.ps__stick'), g = st ? parseFloat(getComputedStyle(st).paddingLeft) || 0 : 0;
    var w0, h0, l0, t0;
    if (W >= 1024) {
      var col = Math.min(W, 2000), bar = parseFloat(cs.getPropertyValue('--bar-half')) || 230;
      w0 = Math.min(.86 * H * .625, col / 2 - g - bar); h0 = w0 * 1.6; l0 = (W + col) / 2 - g - w0; t0 = H - h0;
    } else {
      w0 = Math.min(.7 * W, 320, .42 * H * .75); h0 = w0 * 4 / 3; l0 = (W - w0) / 2; t0 = H - h0 - Math.max(.06 * H, 92);
    }
    var w1 = W >= 1024 ? Math.max(w0, H * 1.05, W * .86) : W, l1 = (W - w1) / 2, t1 = -w1 * .42, h1 = H - t1;   // 86 %: the widest the photo stays sharp on J's 6K window
    var L = function (a, b) { return a + (b - a) * e; };
    s.style.setProperty('--dl', L(l0, l1).toFixed(1) + 'px'); s.style.setProperty('--dt', L(t0, t1).toFixed(1) + 'px');
    s.style.setProperty('--dw', L(w0, w1).toFixed(1) + 'px'); s.style.setProperty('--dh', L(h0, h1).toFixed(1) + 'px');
    s.style.setProperty('--dr', (L(w0, w1) / 2).toFixed(1) + 'px');
    s.style.setProperty('--wo', Math.max(0, 1 - p / .38).toFixed(3));                    // her words step aside as you walk in
    s.style.setProperty('--co', Math.min(1, Math.max(0, (p - .7) / .2)).toFixed(3));      // the last line, once you stand in the room
    s.classList.toggle('is-still', still);
  }
  // a step: the photo held alone for the first part of the scroll (its words read on it), then handing over to the film, which
  // has the last part to itself; calm motion and screenshots keep the photo (as today's step does under reduced motion)
  function step(s) {
    var p = prog(s); if (p === null) { if (s._e) { s._e = null; s.style.removeProperty('--e'); } return; }
    if (calm() || document.documentElement.hasAttribute('data-shot')) p = 0;
    var e = ease(Math.min(1, Math.max(0, (p - .12) / .73))).toFixed(4);
    if (s._e !== e) { s._e = e; s.style.setProperty('--e', e); }
  }
  function frame() { queued = false; breaths.forEach(breath); throughs.forEach(through); steps.forEach(step); }
  function q() { if (!queued) { queued = true; requestAnimationFrame(frame); } }
  addEventListener('scroll', q, { passive: true }); addEventListener('resize', q);
  document.addEventListener('om:swap', function (e) { if (e.detail && e.detail.ribs) return; find(); setTimeout(find, 0); });
  var loaded = false; find(); loaded = true;
})();
