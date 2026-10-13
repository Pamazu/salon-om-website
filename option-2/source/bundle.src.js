/* @ds-bundle: {"format":4,"namespace":"SalonOM2","components":[{"name":"Logo"},{"name":"Button"},{"name":"SiteHeader"},{"name":"Slide"},{"name":"Manifesto"},{"name":"ElementChapter"},{"name":"OfferTile"},{"name":"Quote"}]} */
(function () {
  'use strict';
  var React = window.React, h = React.createElement;
  var useEffect = React.useEffect, useRef = React.useRef, useState = React.useState;
  function cx() { return Array.prototype.filter.call(arguments, Boolean).join(' '); }
  var ACC = { earth: 'var(--earth)', water: 'var(--water)', fire: 'var(--fire)', air: 'var(--air)', ether: 'var(--ether)' };

  var LOGO = __LOGO__;

  /* ---------- Logo ---------- */
  function Logo(p) {
    var variant = p.variant || 'stacked';
    var style = p.height ? { height: p.height, width: 'auto' } : (p.width ? { width: p.width, height: 'auto' } : undefined);
    var a = { className: cx('om2-logo', p.className), style: style, role: 'img', 'aria-label': p.title || 'Salon OM' };
    if (variant === 'stacked') {
      var P = LOGO.stacked_parts;
      return h('svg', Object.assign({ viewBox: P.vb, className: cx('om2-logo', p.draw && 'is-drawn', p.className) }, { style: style, role: 'img', 'aria-label': a['aria-label'], overflow: 'visible' }),
        h('path', { className: p.draw ? 'mk-salon' : undefined, fill: 'currentColor', d: P.salon }),
        h('path', { className: p.draw ? 'mk-om' : undefined, fill: 'currentColor', pathLength: 1, d: P.om }));
    }
    var v = LOGO[variant] || LOGO.inline;
    return h('svg', Object.assign({ viewBox: v.vb }, a), h('path', { fill: 'currentColor', d: v.d }));
  }

  /* ---------- Button ---------- */
  function Button(p) {
    var v = p.variant || 'primary';
    var cls = cx('btn', v !== 'primary' && 'btn--' + v, p.size === 'small' && 'btn--sm', p.className);
    var kids = [p.children];
    if (p.arrow) kids.push(h('span', { key: 'a', className: 'arr', 'aria-hidden': true }, '→'));
    if (p.href) return h('a', { className: cls, href: p.href }, kids);
    return h('button', { type: p.type || 'button', className: cls, onClick: p.onClick }, kids);
  }

  /* ---------- SiteHeader ---------- */
  function SiteHeader(p) {
    var st = useState(false), paused = st[0], setPaused = st[1];
    var links = p.links || [];
    return h('header', { className: cx('hdr', p.tone === 'light' && 'is-light', p.className) },
      h('div', { className: 'hdr__in' },
        h('a', { className: 'hdr__logo', href: p.logoHref || '#top', 'aria-label': 'Salon OM, back to the top' }, h(Logo, { variant: 'inline' })),
        h('nav', { className: 'hdr__nav', 'aria-label': 'Main' }, h('ul', null, links.map(function (l) { return h('li', { key: l.href + l.label }, h('a', { href: l.href }, l.label)); }))),
        h('div', { className: 'hdr__end' },
          h('button', { className: 'hdr__icon', type: 'button', 'aria-pressed': paused, 'aria-label': paused ? 'Play the films' : 'Pause the films', onClick: function () { setPaused(!paused); if (p.onPauseChange) p.onPauseChange(!paused); } },
            h('svg', { className: 'i-pause', viewBox: '0 0 14 14', 'aria-hidden': true }, h('rect', { x: 3, y: 2, width: 2, height: 10, fill: 'currentColor' }), h('rect', { x: 9, y: 2, width: 2, height: 10, fill: 'currentColor' })),
            h('svg', { className: 'i-play', viewBox: '0 0 14 14', 'aria-hidden': true }, h('path', { d: 'M4 2.2v9.6L11.6 7z', fill: 'currentColor' }))),
          p.cta && h(Button, { href: p.cta.href, size: 'small', className: 'hdr__book' }, p.cta.label),
          h('button', { className: 'hdr__icon hdr__menu', type: 'button', 'aria-label': 'Open menu', onClick: p.onMenu }, h('span'), h('span')))));
  }

  /* ---------- activation: a slide is active once 40% of it is on screen; it resets once fully gone ---------- */
  function useActive(ref, forced) {
    var st = useState(!!forced), active = st[0], setActive = st[1];
    useEffect(function () {
      if (forced !== undefined) { setActive(!!forced); return; }
      var el = ref.current; if (!el || !('IntersectionObserver' in window)) { setActive(true); return; }
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          var need = Math.min(e.boundingClientRect.height, innerHeight) * 0.4;
          if (e.intersectionRect.height >= need) setActive(true);
          else if (!e.isIntersecting) setActive(false);
        });
      }, { threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6] });
      io.observe(el); return function () { io.disconnect(); };
    }, [forced]);
    return active;
  }
  /* films loop on their own while on screen */
  function useFilm(vref) {
    useEffect(function () {
      var v = vref.current; if (!v || !('IntersectionObserver' in window)) return;
      v.addEventListener('playing', function () { v.classList.add('is-on'); });
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { var pr = v.play(); if (pr && pr.catch) pr.catch(function () {}); } else v.pause(); });
      });
      io.observe(v); return function () { io.disconnect(); };
    }, []);
  }

  /* ---------- Slide ---------- */
  function Slide(p) {
    var ref = useRef(null), vref = useRef(null);
    var active = useActive(ref, p.active);
    useFilm(vref);
    var hasFilm = p.video || p.poster;
    return h('section', { ref: ref, id: p.id, className: cx('s', active && 'is-active', p.className), 'data-tone': p.tone || 'dark', style: p.style, 'aria-label': p.label },
      hasFilm && h('div', { className: 's__media' }, h('div', { className: 's__zoom' },
        p.poster && h('img', { src: p.poster, alt: '' }),
        p.video && h('video', { ref: vref, src: p.video, muted: true, playsInline: true, loop: true, autoPlay: true, preload: 'auto', 'aria-hidden': true }))),
      hasFilm && h('div', { className: cx('s__scrim', p.scrim || 'ch__scrim') }),
      hasFilm && h('div', { className: 's__veil' }),
      p.children,
      h('div', { className: 's__shade' }));
  }

  /* ---------- Manifesto: written in, letter by letter ---------- */
  function Manifesto(p) {
    var accents = p.accents || [];
    var i = 0;
    var words = (p.text || '').trim().split(/\s+/).map(function (w, wi) {
      return [h('span', { key: wi, className: cx('wd', accents.indexOf(w) >= 0 && 'acc') }, w.split('').map(function (c, ci) { return h('span', { key: ci, className: 'l', style: { '--i': i++ } }, c); })), ' '];
    });
    return h(Slide, { className: 'mani', tone: 'light', active: p.active, id: p.id, label: p.label || 'Manifesto' },
      h('div', { className: 'mani__ring', 'aria-hidden': true }, h('svg', { viewBox: '0 0 100 100' }, h('circle', { cx: 50, cy: 50, r: 49.5, pathLength: 1 }), h('circle', { cx: 50, cy: 50, r: 43, pathLength: 1 }))),
      h('div', { className: 's__leave mani__in' },
        p.eyebrow && h('p', { className: 'mani__label label a-left', style: { '--d': '.1s' } }, p.eyebrow),
        h('p', { className: 'mani__text', 'aria-label': p.text }, words)));
  }

  /* ---------- ElementChapter ---------- */
  function ElementChapter(p) {
    var specs = p.specs || [];
    var n = function (x) { return String(x).padStart(2, '0'); };
    return h(Slide, { className: 'ch', id: p.id, active: p.active, video: p.video, poster: p.poster, style: { '--acc': ACC[p.element] || 'var(--earth)' }, label: p.title },
      h('div', { className: 's__leave ch__copy' },
        h('p', { className: 'ch__meta a-left', style: { '--d': '.2s' } },
          h('span', { className: 'ch__num' }, n(p.index || 1), h('small', null, '/ ' + n(p.total || 5))),
          h('span', { className: 'label' }, h('b', null, p.name), p.sanskrit ? ' · ' + p.sanskrit : '')),
        h('h2', { className: 'ch__title' }, h('span', { className: 'mask' }, h('span', { className: 'mask__in', style: { '--d': '.35s' } }, p.title, h('em', null, '.')))),
        h('div', { className: 'ch__side' },
          h('p', { className: 'ch__body a-up', style: { '--d': '.75s' } }, p.body),
          specs.length > 0 && h('dl', { className: 'ch__specs' }, specs.map(function (s, i) { return h('div', { key: i, className: 'a-up', style: { '--d': (0.95 + i * 0.12).toFixed(2) + 's' } }, h('dt', null, s.label), h('dd', null, s.value)); })))));
  }

  /* ---------- OfferTile ---------- */
  function OfferTile(p) {
    return h('article', { className: 'tile', style: { '--d': p.delay || '0s' } },
      h('img', { src: p.image, alt: p.alt || '', loading: 'lazy' }),
      h('div', { className: 'tile__in' },
        p.tag && h('p', { className: 'tile__tag label' }, p.tag),
        h('h3', null, p.title),
        p.text && h('p', null, p.text),
        h('div', { className: 'tile__btns' },
          p.primary && h(Button, { href: p.primary.href, size: 'small' }, p.primary.label),
          p.secondary && h(Button, { href: p.secondary.href, variant: 'ghost', size: 'small' }, p.secondary.label))));
  }

  /* ---------- Quote ---------- */
  function Quote(p) {
    var words = (p.text || '').trim().split(/\s+/);
    return h(Slide, { className: 'voices', active: p.active, label: 'Kind words' },
      h('div', { className: 'voices__aura', 'aria-hidden': true }),
      h('figure', { className: 's__leave' },
        h('span', { className: 'voices__mark a-fade', style: { '--d': '.1s' }, 'aria-hidden': true }, '“'),
        h('blockquote', { 'aria-label': p.text }, words.map(function (w, i) { return [h('span', { key: i, className: 'wd', style: { '--i': i } }, w), ' ']; })),
        (p.name || p.note) && h('figcaption', { className: 'a-up', style: { '--d': '1.2s' } }, h('b', null, p.name), p.note)));
  }

  window.SalonOM2 = Object.assign(window.SalonOM2 || {}, { Logo: Logo, Button: Button, SiteHeader: SiteHeader, Slide: Slide, Manifesto: Manifesto, ElementChapter: ElementChapter, OfferTile: OfferTile, Quote: Quote });
})();
