/* The option switcher (task e5325977, J 19 Nov 2026: "the options just give them to me in the page directly, so I can do shift v
   and see a option switcher, shift v again hides it. The option swicher changes based on the section I'm in").
   ONE block for every section; it names none. A section that declares options (section_options.py) carries its menu in
   data-opts; its other options wait in <template>s in #opt-store. Shift+V shows a small panel listing the options of the
   section on screen (it follows the section as you scroll); choosing one swaps that section in place, in both worlds (its
   Inner Work twin too), the same <section> element, so the engine keeps tracking it; Shift+V again hides it. The choice is
   kept per section in this browser and in the address (?opt-<section>=<option>), so a link shows it. The page's own options
   (window.OM_PAGE_OPTS: an attribute on <html>, e.g. the world switch) are listed under the section's. On a phone a small
   handle opens it. Only on review pages (<html data-review>, or ?review in the address). Runs before the engine, so a
   remembered option is in place before anything is drawn. A section that sets itself up at load listens for "om:swap". */
(function () {
  'use strict';
  var root = document.documentElement;
  if (!root.hasAttribute('data-review') && !/[?&]review\b/.test(location.search)) return;
  var LIVE = 'live', LS = 'om-opt-' + (root.getAttribute('data-variant') || 'x') + '-', PAGE = window.OM_PAGE_OPTS || [];
  var KEEP = { id: 1, 'data-opt-key': 1, 'data-opts': 1, 'data-opt': 1, 'data-sk': 1, hidden: 1 };
  var calm = function () { return root.getAttribute('data-motion') === 'calm' || matchMedia('(prefers-reduced-motion: reduce)').matches; };
  var secs = [].slice.call(document.querySelectorAll('section[data-opt-key]'));
  var tpl = {}, live = {};
  [].forEach.call(document.querySelectorAll('#opt-store template[data-opt-for]'), function (t) {
    var id = t.getAttribute('data-opt-for'); (tpl[id] = tpl[id] || {})[t.getAttribute('data-opt')] = t;
  });
  function attrsOf(el) { var o = {}; [].forEach.call(el.attributes, function (a) { o[a.name] = a.value; }); return o; }
  secs.forEach(function (s) { live[s.id] = { attrs: attrsOf(s), html: s.innerHTML }; });    // the live default, as drawn
  function menuOf(s) { try { return JSON.parse(s.getAttribute('data-opts')) || []; } catch (e) { return []; } }
  function keyOf(s) { return s.getAttribute('data-opt-key'); }
  function twinsOf(key) { return secs.filter(function (s) { return keyOf(s) === key; }); }
  function has(menu, k) { return menu.some(function (o) { return o.k === k; }); }

  /* ---- where a choice lives: the address first (a shared link), then this browser */
  function param(name) { var m = new RegExp('[?&]' + name + '=([^&#]*)').exec(location.search); return m ? decodeURIComponent(m[1]) : null; }
  function saved(name) { try { return localStorage.getItem(LS + name); } catch (e) { return null; } }
  function keep(name, val, def) {
    try { if (val === def) localStorage.removeItem(LS + name); else localStorage.setItem(LS + name, val); } catch (e) {}
    try {
      var u = new URL(location.href); if (val === def) u.searchParams.delete(name); else u.searchParams.set(name, val);
      history.replaceState(history.state, '', u.pathname + u.search + u.hash);
    } catch (e) {}
  }

  /* ---- the swap: the option's attributes and content into the same element */
  function swapOne(s, k) {
    var src;
    if (k === LIVE) src = live[s.id];
    else {
      var t = (tpl[s.id] || {})[k]; if (!t) return;
      src = { attrs: JSON.parse(t.getAttribute('data-attrs')), html: t.hasAttribute('data-same') ? live[s.id].html : t.innerHTML };
    }
    var q = s.style.getPropertyValue('--q');
    Object.keys(s._optAttrs || live[s.id].attrs).forEach(function (a) { if (!KEEP[a]) s.removeAttribute(a); });
    Object.keys(src.attrs).forEach(function (a) { if (!KEEP[a]) s.setAttribute(a, src.attrs[a]); });
    s._optAttrs = src.attrs;
    if (q) s.style.setProperty('--q', q);
    s.setAttribute('data-opt', k);
    s.innerHTML = src.html;
    if (window.OMEngine) [].forEach.call(s.querySelectorAll('[data-write]'), function (el) { window.OMEngine.writeIn(el); });
    s.dispatchEvent(new CustomEvent('om:swap', { bubbles: true, detail: { key: keyOf(s), option: k } }));
  }
  function choose(key, k, animate) {
    var ts = twinsOf(key); if (!ts.length || !has(menuOf(ts[0]), k) || ts[0].getAttribute('data-opt') === k) return;
    keep('opt-' + key, k, LIVE);
    var shown = ts.filter(function (s) { var r = s.getBoundingClientRect(); return r.height > 0 && r.bottom > 0 && r.top < innerHeight; });
    function go() {
      ts.forEach(function (s) {
        var on = s.classList.contains('is-active');
        swapOne(s, k);
        if (on) { void s.offsetWidth; s.classList.add('is-active'); }      // its entrance plays again, as on arrival
        s.classList.remove('opt-out');
        if (shown.indexOf(s) >= 0 && animate) { s.classList.add('opt-in'); setTimeout(function () { s.classList.remove('opt-in'); }, 700); }
      });
      draw(true);
    }
    if (!animate || !shown.length || calm()) return go();
    shown.forEach(function (s) { s.classList.add('opt-out'); });
    setTimeout(go, 260);
  }
  function choosePage(p, v) {
    if (root.getAttribute(p.attr) === v) return;
    root.setAttribute(p.attr, v); keep(p.p, v, p.d); draw(true);
  }

  /* ---- at load, before the engine: a linked or remembered option is in place */
  var done = {};
  secs.forEach(function (s) {
    var key = keyOf(s); if (done[key]) return; done[key] = 1;
    var k = param('opt-' + key) || saved('opt-' + key);
    if (k && k !== LIVE && has(menuOf(s), k)) twinsOf(key).forEach(function (t) { swapOne(t, k); });
  });
  PAGE.forEach(function (p) {
    var v = param(p.p) || saved(p.p);
    if (v && p.o.some(function (o) { return o[0] === v; })) root.setAttribute(p.attr, v);
  });

  /* ---- the panel */
  var panel, handle, open = false, cur = null, queued = false;
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function nameOf(s) {
    var n = s.getAttribute('aria-label'), by = s.getAttribute('aria-labelledby');
    if (!n && by && document.getElementById(by)) n = document.getElementById(by).textContent;
    return (n || s.id || '').replace(/\s+/g, ' ').trim();
  }
  function onScreen() {
    var mid = innerHeight / 2, all = document.querySelectorAll('main[data-world]:not([hidden]) > .s');
    for (var i = 0; i < all.length; i++) { var r = all[i].getBoundingClientRect(); if (r.height > 0 && r.top <= mid && r.bottom > mid) return all[i]; }
    return null;
  }
  function build() {
    panel = document.createElement('div');
    panel.className = 'opt'; panel.id = 'opt-panel'; panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-label', 'Options for the section on screen');
    panel.hidden = true;
    panel.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      if (b.hasAttribute('data-k')) choose(b.getAttribute('data-key'), b.getAttribute('data-k'), true);
      else if (b.hasAttribute('data-v')) choosePage(PAGE[+b.getAttribute('data-p')], b.getAttribute('data-v'));
      else if (b.hasAttribute('data-go')) { var t = twinsOf(b.getAttribute('data-go')).filter(function (s) { return !s.closest('[hidden]'); })[0]; if (t) t.scrollIntoView({ behavior: calm() ? 'auto' : 'smooth' }); }
    });
    document.body.appendChild(panel);
  }
  function draw(force) {
    if (!open) return;
    var s = onScreen(), sig = (s ? s.id + ':' + (s.getAttribute('data-opt') || '') : '-') + '|' + PAGE.map(function (p) { return root.getAttribute(p.attr); }).join(',');
    if (!force && sig === cur) return; cur = sig;
    var h = '<div class="opt__head"><p class="opt__k">Options</p><kbd class="opt__kbd" aria-label="Shift V">⇧V</kbd></div>';
    h += '<p class="opt__sec">' + esc(s ? nameOf(s) : 'This part of the page') + '</p>';
    var menu = s && s.hasAttribute('data-opt-key') ? menuOf(s) : [];
    if (menu.length) {
      var key = keyOf(s), on = s.getAttribute('data-opt') || LIVE;
      h += '<div class="opt__list" role="radiogroup" aria-label="' + esc(nameOf(s)) + '">';
      menu.forEach(function (o, i) {
        var sel = o.k === on;
        h += '<button type="button" class="opt__row" role="radio" aria-checked="' + sel + '" data-key="' + esc(key) + '" data-k="' + esc(o.k) + '">'
          + '<b aria-hidden="true">' + (i < 9 ? i + 1 : '') + '</b><span>' + esc(o.n) + (sel && o.d ? '<small>' + esc(o.d) + '</small>' : '') + '</span></button>';
      });
      h += '</div>';
    } else {
      var seen = {}, more = secs.filter(function (x) { var k = keyOf(x); if (seen[k] || x.closest('[hidden]')) return false; seen[k] = 1; return true; });
      h += '<p class="opt__none">No options in this section.</p>';
      if (more.length) h += '<div class="opt__go">' + more.map(function (x) { return '<button type="button" data-go="' + esc(keyOf(x)) + '">' + esc(nameOf(x)) + ' <span aria-hidden="true">→</span></button>'; }).join('') + '</div>';
    }
    PAGE.forEach(function (p, pi) {
      var on = root.getAttribute(p.attr) || p.d;
      h += '<div class="opt__page"><p class="opt__k">Whole page · ' + esc(p.n) + '</p><div class="opt__chips" role="radiogroup" aria-label="' + esc(p.n) + '">'
        + p.o.map(function (o) { return '<button type="button" role="radio" aria-checked="' + (o[0] === on) + '" data-p="' + pi + '" data-v="' + esc(o[0]) + '" title="' + esc(o[1]) + '">' + esc(o[1]) + '</button>'; }).join('')
        + '</div></div>';
    });
    panel.innerHTML = h;
  }
  function show(v) {
    if (!panel) build();
    open = v; root.classList.toggle('opt-open', v);
    if (handle) handle.setAttribute('aria-expanded', v);
    if (v) { panel.hidden = false; cur = null; draw(true); requestAnimationFrame(function () { panel.classList.add('is-on'); }); }
    else { panel.classList.remove('is-on'); setTimeout(function () { if (!open) panel.hidden = true; }, calm() ? 0 : 320); }
  }
  document.addEventListener('keydown', function (e) {
    var t = e.target; if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    if (e.shiftKey && !e.metaKey && !e.ctrlKey && !e.altKey && (e.code === 'KeyV' || e.key === 'V' || e.key === 'v')) { e.preventDefault(); show(!open); return; }
    if (!open || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === 'Escape') { show(false); return; }
    if (/^[1-9]$/.test(e.key)) {
      var b = panel.querySelectorAll('.opt__row')[+e.key - 1]; if (b) { e.preventDefault(); b.click(); }
    }
  }, true);
  function q() { if (open && !queued) { queued = true; requestAnimationFrame(function () { queued = false; draw(false); }); } }
  addEventListener('scroll', q, { passive: true }); addEventListener('resize', q);
  new MutationObserver(function () { q(); setTimeout(q, 1400); }).observe(root, { attributes: true, attributeFilter: ['data-world'] });

  /* ---- on a phone: a small handle beside the tweak button opens it */
  function addHandle() {
    handle = document.createElement('button');
    handle.type = 'button'; handle.className = 'opt-handle'; handle.setAttribute('aria-label', 'Show the options for this section');
    handle.setAttribute('aria-controls', 'opt-panel'); handle.setAttribute('aria-expanded', 'false');
    handle.innerHTML = '<svg viewBox="0 0 18 18" aria-hidden="true"><rect x="2.5" y="2.5" width="13" height="5" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.4"/><rect x="2.5" y="10.5" width="13" height="5" rx="2.5" fill="currentColor"/></svg>';
    handle.addEventListener('click', function () { show(!open); });
    document.body.appendChild(handle);
  }
  if (document.body) addHandle(); else addEventListener('DOMContentLoaded', addHandle);
  window.OMOptions = { show: show, choose: choose };
})();
