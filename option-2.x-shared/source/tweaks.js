/* Salon OM, Option 2.x — the Tweak panel.
   A small button opens a panel to adjust text, spacing, type, colour, motion, films, images, sound,
   sections and the coaching world. Changes preview instantly and are kept on this device; "Save"
   writes them to tweaks.json next to the page (on Claude, through the artifact's own save), so
   everyone who opens the page sees them. */
(function () {
  'use strict';
  var root = document.documentElement;
  var VARIANT = root.getAttribute('data-variant') || document.title.replace(/[^0-9.]/g, '') || 'x';
  var LS = 'om-tweaks-' + VARIANT;
  function $all(sel, el) { return [].slice.call((el || document).querySelectorAll(sel)); }
  function clone(o) { return JSON.parse(JSON.stringify(o || {})); }
  function store(k, v) { try { if (v === undefined) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  function read(k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } }

  /* ---------------------------------------------------------------- the settings */
  var cs = getComputedStyle(root);
  function cssv(n, d) { var v = cs.getPropertyValue(n).trim(); return v || d; }
  var COLORS = [
    ['--forest', 'Accent (buttons)'], ['--forest-deep', 'Accent text on light'], ['--forest-light', 'Accent text on dark'],
    ['--umber', 'Dark ground'], ['--bark', 'Raised dark ground'], ['--clay', 'Light ground'], ['--clay-deep', 'Deep light ground'],
    ['--ivory', 'Text on dark'], ['--ink', 'Text on light'], ['--ink-soft', 'Soft text on light'],
    ['--earth', 'Chapter 1 accent'], ['--water', 'Chapter 2 accent'], ['--fire', 'Chapter 3 accent'], ['--air', 'Chapter 4 accent'], ['--ether', 'Chapter 5 accent']];
  var RANGES = {
    layout: [
      ['--gutter', 'Side margin', 8, 160, 1, 'px', 56], ['--base', 'Copy distance from the bottom', 12, 180, 1, 'px', 64],
      ['--hdr', 'Header height', 52, 120, 1, 'px', 76], ['--logo-s', 'Hero logo size', .4, 1.6, .01, '', 1],
      ['--logo-top', 'Hero logo height on screen', 20, 70, 1, '%', 45], ['--hook-gap', 'Gap under the hero logo', 0, 4, .05, '', 1],
      ['--tile-gap', 'Gap between tiles', 0, 60, 1, 'px', 14], ['--radius', 'Photo corner radius', 0, 60, 1, 'px', 4],
      ['--btn-r', 'Button roundness', 0, 999, 1, 'px', 999], ['--btn-h', 'Button height', 36, 72, 1, 'px', 50]],
    type: [
      ['--hs', 'Headline size', .6, 1.5, .01, '', 1], ['--chs', 'Chapter word size', .5, 1.4, .01, '', 1],
      ['--hw', 'Headline weight', 300, 500, 100, '', 300], ['--body-fs', 'Body text size', 14, 22, .5, 'px', 17],
      ['--lh', 'Body line height', 1.3, 2, .01, '', 1.65], ['--track', 'Label letter-spacing', 0, .5, .01, 'em', .22],
      ['--label-fs', 'Label size', 9, 16, .5, 'px', 12]],
    motion: [
      ['speed', 'Animation speed', .4, 2.5, .05, '×', 1], ['--m-film', 'Film zoom on arrival', 1, 1.5, .01, '', 1.24],
      ['--m-slide', 'Text slide distance', 0, 160, 1, 'px', 64], ['--m-blur', 'Text blur on arrival', 0, 30, 1, 'px', 12],
      ['--m-par', 'Leaving parallax', 0, 1.5, .05, '', 1], ['--ink-gap', 'Writing speed (ms per letter)', 4, 80, 1, 'ms', 20]],
    films: [
      ['rate', 'Film playback speed', .25, 1.5, .05, '×', 1], ['--film-b', 'Film brightness', .4, 1.6, .01, '', 1],
      ['--film-s', 'Film saturation', 0, 1.8, .01, '', 1], ['--scrim', 'Shade behind text', 0, 1.5, .01, '', 1]],
    sound: [['level', 'Volume', 0, 1, .01, '', .85], ['xfade', 'Crossfade between sections', .5, 8, .1, 's', 3]]
  };
  var EDIT_SEL = ['h1', 'h2 .mask__in', '.mani__text', 'h3', '.ch__body', 'dt', 'dd', '.ch__meta .label b', '.eyebrow', 'p.label', '.lead', '.split__copy p', '.ticks li',
    '.facts p', '.fact span', '.fact b', '.facts blockquote', '.person p', '.team__head p', '.step b', '.step p', '.offers__head p', '.tile__tag', '.tile p',
    '.voices blockquote', '.voices figcaption b', '.bridge p', '.door p', '.door .go', '.walkin p', '.cta__in p', '.hero__hook', '.hero__line b', '.hero__line',
    '.hero__words .sub', '.hero--arch .sub', 'a.btn', '.foot__brand p', '.letters h2 .mask__in', '.tx', '.om__head h2 .mask__in', '.tc__who b', '.of__badge'].join(',');

  /* ---------------------------------------------------------------- keys for text, images and sections */
  var mains = $all('main[data-world]');
  mains.forEach(function (m) {
    var w = m.getAttribute('data-world');
    $all('.s', m).forEach(function (s, si) {
      var sk = w + ':' + (s.id || ('s' + si));
      s.setAttribute('data-sk', sk);
      $all(EDIT_SEL, s).forEach(function (el, i) { if (el.closest('.tw')) return; if (!el.hasAttribute('data-tk')) el.setAttribute('data-tk', sk + ':' + i); });
      $all('img', s).forEach(function (im, i) { im.setAttribute('data-ik', sk + ':' + i); });
      $all('video[data-src]', s).forEach(function (v, i) { v.setAttribute('data-vk', sk + ':' + i); });
    });
  });
  function firstText(el) { for (var n = el.firstChild; n; n = n.nextSibling) if (n.nodeType === 3 && n.nodeValue.trim()) return n; return null; }
  function getText(el) { if (el.hasAttribute('data-write')) return el.getAttribute('aria-label') || el.textContent.trim(); var t = firstText(el); return t ? t.nodeValue.trim() : el.textContent.trim(); }
  function setText(el, txt) {
    if (el.hasAttribute('data-write')) { if (window.OMEngine) window.OMEngine.writeIn(el, txt); else { el.textContent = txt; } return; }
    var t = firstText(el);
    if (t) { var lead = t.nodeValue.match(/^\s*/)[0], trail = t.nodeValue.match(/\s*$/)[0]; t.nodeValue = lead + txt + trail; }
    else if (!el.children.length) el.textContent = txt;
  }
  var ORIGINAL = {};
  $all('[data-tk]').forEach(function (el) { ORIGINAL[el.getAttribute('data-tk')] = getText(el); });

  var BASEVARS = {}; [].concat(COLORS.map(function (c) { return c[0]; }), RANGES.layout.map(function (r) { return r[0]; }), RANGES.type.map(function (r) { return r[0]; }),
    RANGES.motion.map(function (r) { return r[0]; }), RANGES.films.map(function (r) { return r[0]; })).forEach(function (k) { if (k.indexOf('--') === 0) BASEVARS[k] = 1; });
  var BASETHEME = root.getAttribute('data-theme');
  /* ---------------------------------------------------------------- state */
  var saved = {}, state = {}, blobs = {}, editing = false; // blobs: key -> {blob, url, ext}
  function apply(s) {
    var v = s.vars || {};
    // reset everything we may have set, then apply
    $all('[data-tw-var]').forEach(function () {});
    Object.keys(BASEVARS).forEach(function (k) { root.style.removeProperty(k); });
    Object.keys(v).forEach(function (k) { root.style.setProperty(k, v[k]); });
    var sp = (s.motion && s.motion.speed) || 1;
    [['--t-ui', .6], ['--t-text', 1.3], ['--t-title', 1.6], ['--t-film', 3]].forEach(function (p) { if (sp !== 1) root.style.setProperty(p[0], (p[1] / sp).toFixed(3) + 's'); else root.style.removeProperty(p[0]); });
    // text
    if (!editing) $all('[data-tk]').forEach(function (el) { var k = el.getAttribute('data-tk'); var want = (s.text && s.text[k] != null) ? s.text[k] : ORIGINAL[k]; if (getText(el) !== want) setText(el, want); });
    // images
    $all('[data-ik]').forEach(function (im) {
      var k = im.getAttribute('data-ik'), o = (s.img && s.img[k]) || {};
      if (!im.hasAttribute('data-orig')) im.setAttribute('data-orig', im.getAttribute('src'));
      var src = blobs[k] ? blobs[k].url : (o.src || im.getAttribute('data-orig'));
      if (im.getAttribute('src') !== src) im.setAttribute('src', src);
      im.style.objectPosition = o.pos || '';
    });
    // films
    $all('[data-vk]').forEach(function (vd) {
      var k = vd.getAttribute('data-vk'), o = (s.film && s.film[k]);
      if (!vd.hasAttribute('data-orig')) vd.setAttribute('data-orig', vd.getAttribute('data-src'));
      var want = o || vd.getAttribute('data-orig');
      if (vd.getAttribute('data-src') !== want) { vd.setAttribute('data-src', want); if (vd._attached) { vd.src = want; vd.load(); } }
    });
    rate();
    // sections
    $all('[data-sk]').forEach(function (sl) { sl.style.display = (s.hidden && s.hidden[sl.getAttribute('data-sk')]) ? 'none' : ''; });
    // snap, theme, sound
    root.style.scrollSnapType = (s.snap && s.snap !== 'mandatory') ? (s.snap === 'off' ? 'none' : 'y proximity') : '';
    if (s.theme) root.setAttribute('data-theme', s.theme); else if (BASETHEME) root.setAttribute('data-theme', BASETHEME);
    if (window.OMEngine) { var so = s.sound || {}; window.OMEngine.sound.setLevel(so.level != null ? so.level : .85); window.OMEngine.sound.setXfade(so.xfade || 3); }
  }
  function rate() {
    var r = (state.films && state.films.rate) || 1;
    $all('video[data-src]').forEach(function (v) { if (v.hasAttribute('data-stop')) return; try { v.playbackRate = r; v.defaultPlaybackRate = r; } catch (e) {} });
  }
  document.addEventListener('play', function (e) { if (e.target.tagName === 'VIDEO' && !e.target.hasAttribute('data-stop')) { var r = (state.films && state.films.rate) || 1; try { e.target.playbackRate = r; } catch (x) {} } }, true);

  /* ---------------------------------------------------------------- load: published settings, then this device's draft */
  var draft = read(LS);
  if (draft && draft.text) apply({ text: draft.text }); // text first, before the page writes its lines in
  function boot(pub) {
    saved = pub || {};
    state = draft ? clone(draft.state) : clone(saved);
    apply(state);
    renderStatus();
    if (panel && panel.classList.contains('is-open')) build();
  }
  fetch('tweaks.json', { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : {}; }).catch(function () { return {}; }).then(function (pub) {
    if (draft && pub && pub.savedAt && draft.base !== pub.savedAt && draft.at < pub.savedAt) draft = null; // someone saved since: drop the stale draft
    boot(pub || {});
  });
  function change() { store(LS, { state: state, at: Date.now(), base: saved.savedAt || null, text: state.text }); apply(state); renderStatus(); }

  /* ---------------------------------------------------------------- the button and the panel */
  var btn = document.createElement('button');
  btn.className = 'tw-btn'; btn.type = 'button'; btn.setAttribute('aria-label', 'Open the tweak panel'); btn.setAttribute('aria-expanded', 'false');
  btn.innerHTML = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 6h9M15 6h2M3 14h2M8 14h9" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" fill="none"/><circle cx="13.5" cy="6" r="1.7" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="6.5" cy="14" r="1.7" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>';
  var panel = document.createElement('aside');
  panel.className = 'tw'; panel.setAttribute('aria-label', 'Tweak panel'); panel.setAttribute('role', 'dialog');
  document.body.appendChild(btn); document.body.appendChild(panel);
  btn.addEventListener('click', function () { toggle(!panel.classList.contains('is-open')); });
  function toggle(open) { if (open) build(); panel.classList.toggle('is-open', open); root.classList.toggle('tw-open', open); btn.setAttribute('aria-expanded', open); btn.setAttribute('aria-label', open ? 'Close the tweak panel' : 'Open the tweak panel'); if (!open) editMode(false); }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && panel.classList.contains('is-open') && !document.activeElement.isContentEditable) toggle(false); });

  var artifactNS = null, canSave = 'unknown';
  if (window.claude && claude.use) claude.use('artifact').then(function (a) { artifactNS = a; canSave = a ? 'yes' : 'no'; renderStatus(); }, function () { canSave = 'no'; renderStatus(); });
  else canSave = 'no';

  function h(tag, attrs, kids) {
    var el = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) { if (k === 'text') el.textContent = attrs[k]; else if (k.indexOf('on') === 0) el.addEventListener(k.slice(2), attrs[k]); else el.setAttribute(k, attrs[k]); });
    (kids || []).forEach(function (c) { if (c) el.appendChild(c); });
    return el;
  }
  function world() { return root.getAttribute('data-world') || 'salon'; }
  function sec(title, body, open) { var d = h('details', open ? { open: '' } : {}, [h('summary', { text: title })].concat(body)); return d; }
  function getVar(k, d) { return (state.vars && state.vars[k]) || cssv(k, d); }
  function setVar(k, v) { state.vars = state.vars || {}; if (v == null) delete state.vars[k]; else state.vars[k] = v; change(); }
  function range(r, get, set) {
    var id = 'tw-' + r[0].replace(/[^a-z0-9]/gi, '');
    var cur = get(), out = h('output', { for: id, text: fmt(cur, r) });
    var inp = h('input', { type: 'range', id: id, min: r[2], max: r[3], step: r[4], value: cur, oninput: function () { out.textContent = fmt(this.value, r); set(this.value); } });
    return h('div', { class: 'tw-row' }, [h('label', { for: id, text: r[1] }), out, inp]);
  }
  function fmt(v, r) { v = +v; return (r[4] < 1 ? v.toFixed(r[4] < .05 ? 2 : (r[4] < .1 ? 2 : 1)) : String(Math.round(v))) + (r[5] || ''); }
  function num(v, d) { var n = parseFloat(v); return isNaN(n) ? d : n; }

  function build() {
    panel.innerHTML = '';
    var w = world();
    panel.appendChild(h('header', { class: 'tw-head' }, [h('p', { class: 'tw-title', text: 'Tweak' }), h('span', { class: 'tw-sub', text: 'Option ' + VARIANT + ' · ' + w }),
      h('button', { class: 'tw-x', type: 'button', 'aria-label': 'Close', onclick: function () { toggle(false); } }, [h('span', { text: '×' })])]));
    var body = h('div', { class: 'tw-body' });
    panel.appendChild(body);

    // Text
    body.appendChild(sec('Text', [
      h('p', { class: 'tw-note', text: 'Turn on, then click any text on the page to rewrite it. It saves as you type.' }),
      h('label', { class: 'tw-switch' }, [h('input', { type: 'checkbox', onchange: function () { editMode(this.checked); } }), h('span', { text: 'Edit text on the page' })]),
      h('button', { class: 'tw-link', type: 'button', text: 'Restore the original text', onclick: function () { state.text = {}; change(); } })
    ], true));

    // Layout
    body.appendChild(sec('Layout & spacing', RANGES.layout.map(function (r) {
      return range(r, function () { return num(getVar(r[0], r[6] + (r[5] || '')), r[6]); }, function (v) { setVar(r[0], v + (r[5] === '%' ? '%' : (r[5] === 'px' ? 'px' : ''))); });
    })));
    // Type
    body.appendChild(sec('Typography', RANGES.type.map(function (r) {
      return range(r, function () { return num(getVar(r[0], r[6] + (r[5] || '')), r[6]); }, function (v) { setVar(r[0], v + (r[5] === 'px' ? 'px' : (r[5] === 'em' ? 'em' : ''))); });
    })));
    // Colour
    body.appendChild(sec('Colour', COLORS.map(function (c) {
      var id = 'tw-c' + c[0].replace(/[^a-z0-9]/gi, '');
      var cur = toHex(getVar(c[0], '#000000'));
      return h('div', { class: 'tw-row tw-color' }, [h('label', { for: id, text: c[1] }), h('input', { type: 'color', id: id, value: cur, oninput: function () { setVar(c[0], this.value); } })]);
    }).concat([h('button', { class: 'tw-link', type: 'button', text: 'Reset colours', onclick: function () { COLORS.forEach(function (c) { if (state.vars) delete state.vars[c[0]]; }); change(); build(); } })])));
    // Motion
    body.appendChild(sec('Motion', RANGES.motion.map(function (r) {
      if (r[0] === 'speed') return range(r, function () { return (state.motion && state.motion.speed) || 1; }, function (v) { state.motion = state.motion || {}; state.motion.speed = +v; change(); });
      return range(r, function () { return num(getVar(r[0], r[6] + (r[5] || '')), r[6]); }, function (v) { setVar(r[0], v + (r[5] === 'px' ? 'px' : (r[5] === 'ms' ? 'ms' : ''))); });
    }).concat([h('div', { class: 'tw-row' }, [h('label', { for: 'tw-snap', text: 'Scrolling' }), h('select', { id: 'tw-snap', onchange: function () { state.snap = this.value; change(); } },
      [['mandatory', 'Slideshow (snaps to each section)'], ['proximity', 'Gentle snap'], ['off', 'Free scrolling']].map(function (o) { var op = h('option', { value: o[0], text: o[1] }); if ((state.snap || 'mandatory') === o[0]) op.selected = true; return op; }))])])));
    // Films & images
    var media = RANGES.films.map(function (r) {
      if (r[0] === 'rate') return range(r, function () { return (state.films && state.films.rate) || 1; }, function (v) { state.films = state.films || {}; state.films.rate = +v; change(); });
      return range(r, function () { return num(getVar(r[0], r[6]), r[6]); }, function (v) { setVar(r[0], v); });
    });
    var main = document.querySelector('main[data-world="' + w + '"]');
    $all('[data-ik]', main).forEach(function (im) { media.push(imgRow(im)); });
    $all('[data-vk]', main).forEach(function (vd) { media.push(filmRow(vd)); });
    body.appendChild(sec('Films & images', media));
    // Sound
    body.appendChild(sec('Sound', RANGES.sound.map(function (r) {
      return range(r, function () { var s = state.sound || {}; return s[r[0]] != null ? s[r[0]] : r[6]; }, function (v) { state.sound = state.sound || {}; state.sound[r[0]] = +v; change(); });
    })));
    // Sections
    body.appendChild(sec('Sections', $all('.s', main).map(function (sl) {
      var k = sl.getAttribute('data-sk'), name = labelFor(sl);
      var cb = h('input', { type: 'checkbox', onchange: function () { state.hidden = state.hidden || {}; if (this.checked) delete state.hidden[k]; else state.hidden[k] = true; change(); } });
      cb.checked = !(state.hidden && state.hidden[k]);
      return h('label', { class: 'tw-switch' }, [cb, h('span', { text: name })]);
    })));
    // Coaching world look
    body.appendChild(sec('Coaching world', [h('div', { class: 'tw-row' }, [h('label', { for: 'tw-theme', text: 'Look of the coaching world' }), h('select', { id: 'tw-theme', onchange: function () { state.theme = this.value === BASETHEME ? undefined : this.value; change(); } },
      [['dawn', 'Dawn: light, linen and sage'], ['clay', 'Clay: warm daylight, arches'], ['night', 'Night: violet, smoke, inward']].map(function (o) { var op = h('option', { value: o[0], text: o[1] }); if ((state.theme || BASETHEME) === o[0]) op.selected = true; return op; }))]),
      h('p', { class: 'tw-note', text: 'Switch to Coaching (top of the page) to see it.' })]));
    // Save
    var foot = h('footer', { class: 'tw-foot' }, [
      h('p', { class: 'tw-status', id: 'tw-status' }),
      h('div', { class: 'tw-actions' }, [
        h('button', { class: 'tw-save', type: 'button', text: 'Save for everyone', onclick: save }),
        h('button', { class: 'tw-ghost', type: 'button', text: 'Copy settings', onclick: copy }),
        h('button', { class: 'tw-ghost', type: 'button', text: 'Paste settings', onclick: paste }),
        h('button', { class: 'tw-ghost', type: 'button', text: 'Reset all', onclick: function () { if (!confirmReset()) return; state = {}; blobs = {}; store(LS); draft = null; apply(state); build(); renderStatus(); } })])]);
    panel.appendChild(foot);
    renderStatus();
  }
  function confirmReset() { var b = panel.querySelector('.tw-ghost:last-child'); if (b.getAttribute('data-sure')) return true; b.setAttribute('data-sure', '1'); b.textContent = 'Tap again to reset'; setTimeout(function () { b.removeAttribute('data-sure'); b.textContent = 'Reset all'; }, 2500); return false; }
  function labelFor(sl) { var t = sl.querySelector('h1, h2, .mani__label, .eyebrow, blockquote'); var s = t ? (t.getAttribute('aria-label') || t.textContent) : sl.id; s = s.replace(/\s+/g, ' ').trim(); return (s.length > 44 ? s.slice(0, 42) + '…' : s) || sl.id; }
  function toHex(c) { c = String(c).trim(); if (/^#[0-9a-f]{6}$/i.test(c)) return c; var m = c.match(/^#([0-9a-f])([0-9a-f])([0-9a-f])$/i); if (m) return '#' + m[1] + m[1] + m[2] + m[2] + m[3] + m[3]; var d = document.createElement('i'); d.style.color = c; document.body.appendChild(d); var rgb = getComputedStyle(d).color.match(/\d+/g) || [0, 0, 0]; d.remove(); return '#' + rgb.slice(0, 3).map(function (n) { return ('0' + (+n).toString(16)).slice(-2); }).join(''); }

  function imgRow(im) {
    var k = im.getAttribute('data-ik'), o = (state.img && state.img[k]) || {};
    var pos = (o.pos || '50% 50%').split(' ');
    var thumb = h('img', { src: im.getAttribute('src'), alt: '' });
    function setImg(p) { state.img = state.img || {}; state.img[k] = Object.assign({}, state.img[k] || {}, p); change(); }
    var file = h('input', { type: 'file', accept: 'image/*', class: 'tw-file', onchange: function () {
      var f = this.files && this.files[0]; if (!f) return;
      var ext = (f.type.split('/')[1] || 'jpg').replace('jpeg', 'jpg').replace('svg+xml', 'svg');
      blobs[k] = { blob: f, url: URL.createObjectURL(f), ext: ext };
      thumb.src = blobs[k].url; setImg({ pending: true }); renderStatus();
    } });
    var url = h('input', { type: 'url', placeholder: 'or paste an image link', value: (o.src && !/^uploads\//.test(o.src)) ? o.src : '', onchange: function () { delete blobs[k]; setImg({ src: this.value.trim() || undefined }); thumb.src = im.getAttribute('src'); } });
    var px = h('input', { type: 'range', min: 0, max: 100, value: parseFloat(pos[0]) || 50, 'aria-label': 'Focus left to right', oninput: function () { setImg({ pos: this.value + '% ' + (parseFloat(py.value) || 50) + '%' }); } });
    var py = h('input', { type: 'range', min: 0, max: 100, value: parseFloat(pos[1]) || 50, 'aria-label': 'Focus top to bottom', oninput: function () { setImg({ pos: (parseFloat(px.value) || 50) + '% ' + this.value + '%' }); } });
    return h('div', { class: 'tw-img' }, [thumb, h('div', {}, [h('p', { class: 'tw-imgname', text: (im.alt || im.getAttribute('data-orig') || '').slice(0, 48) || 'Image' }),
      h('label', { class: 'tw-upload' }, [h('span', { text: 'Replace' }), file]), url,
      h('div', { class: 'tw-pos' }, [h('span', { text: 'Focus' }), px, py]),
      h('button', { class: 'tw-link', type: 'button', text: 'Use the original', onclick: function () { delete blobs[k]; if (state.img) delete state.img[k]; change(); thumb.src = im.getAttribute('src'); } })])]);
  }
  function filmRow(vd) {
    var k = vd.getAttribute('data-vk');
    var url = h('input', { type: 'url', placeholder: 'Film link (.mp4)', value: (state.film && state.film[k]) || '', onchange: function () { state.film = state.film || {}; if (this.value.trim()) state.film[k] = this.value.trim(); else delete state.film[k]; change(); } });
    return h('div', { class: 'tw-row' }, [h('label', { text: 'Film: ' + (vd.getAttribute('data-orig') || vd.getAttribute('data-src')).replace('media/', '') }), url]);
  }

  /* ---------------------------------------------------------------- editing text in place */
  function editMode(on) {
    editing = on; root.classList.toggle('tw-editing', on);
    var main = document.querySelector('main[data-world="' + world() + '"]');
    $all('[data-tk]', main).forEach(function (el) {
      if (on) {
        var tx = document.createElement('span'); tx.className = 'tw-tx'; tx.contentEditable = 'true'; tx.spellcheck = true;
        tx.textContent = getText(el);
        if (el.hasAttribute('data-write')) { el.setAttribute('data-tw-html', '1'); el.innerHTML = ''; el.appendChild(tx); }
        else { var t = firstText(el); if (t) { el.insertBefore(tx, t); t.remove(); } else if (!el.children.length) { el.textContent = ''; el.appendChild(tx); } else return; }
        tx.addEventListener('input', function () { state.text = state.text || {}; state.text[el.getAttribute('data-tk')] = tx.textContent.trim(); store(LS, { state: state, at: Date.now(), base: saved.savedAt || null, text: state.text }); renderStatus(); });
        tx.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); });
        tx.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); tx.blur(); } });
      } else {
        var tx2 = el.querySelector(':scope > .tw-tx'); if (!tx2) return;
        var val = tx2.textContent.trim();
        if (el.hasAttribute('data-write')) { el.removeAttribute('data-tw-html'); if (window.OMEngine) window.OMEngine.writeIn(el, val); }
        else { tx2.replaceWith(document.createTextNode(val + ' ')); }
      }
    });
    if (!on) apply(state);
  }
  document.addEventListener('click', function (e) { if (editing && e.target.closest('a') && e.target.closest('.tw-tx')) e.preventDefault(); }, true);

  /* ---------------------------------------------------------------- saving */
  function dirty() { return JSON.stringify(stripped(state)) !== JSON.stringify(stripped(saved)) || Object.keys(blobs).length > 0; }
  function stripped(s) { var c = clone(s); delete c.savedAt; if (c.img) Object.keys(c.img).forEach(function (k) { delete c.img[k].pending; }); return c; }
  function renderStatus(msg) {
    var el = document.getElementById('tw-status'); if (!el) return;
    if (msg) { el.textContent = msg; return; }
    var d = dirty();
    el.textContent = d ? (canSave === 'yes' ? 'Unsaved changes, kept on this device. Save to share them.' : 'Changes are kept on this device. Copy settings to share them.') : (saved.savedAt ? 'Everything saved · ' + new Date(saved.savedAt).toLocaleString() : 'No changes yet.');
    var sb = panel.querySelector('.tw-save'); if (sb) { sb.disabled = !d; sb.hidden = canSave === 'no'; }
  }
  function save() {
    if (!artifactNS) { renderStatus('Saving for everyone works on the Claude link. Here, use Copy settings.'); return; }
    var files = {}, next = stripped(state);
    Object.keys(blobs).forEach(function (k) {
      var b = blobs[k], path = 'uploads/' + k.replace(/[^a-z0-9]+/gi, '-') + '-' + Date.now().toString(36) + '.' + b.ext;
      files[path] = b.blob; next.img = next.img || {}; next.img[k] = Object.assign({}, next.img[k] || {}, { src: path });
    });
    next.savedAt = Date.now();
    files['tweaks.json'] = { content: JSON.stringify(next, null, 1), contentType: 'application/json' };
    renderStatus('Saving…');
    artifactNS.publish(files).then(function () {
      saved = next; state = clone(next); blobs = {}; store(LS); draft = null; apply(state); renderStatus('Saved for everyone.'); setTimeout(function () { renderStatus(); }, 2500);
    }, function (e) {
      var c = e && e.code;
      if (c === 'conflict') renderStatus('Someone saved a newer version. The page is reloading to it.');
      else if (c === 'not_writer' || c === 'not_granted') renderStatus('This link is view-only, so saving is off. Your changes stay on this device.');
      else if (c === 'capability_disabled') renderStatus('Saving is not available on this link. Use Copy settings.');
      else renderStatus('Could not save just now. Your changes are safe on this device; try again.');
    });
  }
  function copy() {
    var txt = JSON.stringify(stripped(state), null, 1);
    var done = function () { renderStatus('Settings copied. Paste them into tweaks.json next to index.html, or send them to Claude.'); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(done, function () { showText(txt); }); else showText(txt);
  }
  function showText(txt) { var ta = h('textarea', { class: 'tw-text', rows: 6 }); ta.value = txt; panel.querySelector('.tw-foot').appendChild(ta); ta.select(); renderStatus('Select and copy the settings below.'); }
  function paste() {
    var ta = panel.querySelector('.tw-paste');
    if (!ta) { ta = h('textarea', { class: 'tw-text tw-paste', rows: 5, placeholder: 'Paste settings here, then press Paste settings again' }); panel.querySelector('.tw-foot').appendChild(ta); ta.focus(); return; }
    try { state = JSON.parse(ta.value); change(); build(); renderStatus('Settings applied. Save to share them.'); } catch (e) { renderStatus('That does not look like Salon OM settings.'); }
  }
})();
