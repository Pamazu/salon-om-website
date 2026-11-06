/* M/G/S only (task 0ab956d4). G's five-step preview becomes the step rail: as the preview leaves, each row's number
   travels to its own number on the rail (01 to 05) while its words fade, and the rail takes over as they land.
   Scrubbed by the scroll (the same leave value as every slide's --q), so it plays backwards on the way up.
   Off in ?shot review mode and with reduced motion, where the list keeps 2.2's plain leave. */
(function () {
  var sec = document.querySelector('.preview'), rail = document.getElementById('rail'), root = document.documentElement;
  if (!sec || !rail || root.hasAttribute('data-shot') || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var nums = [].slice.call(sec.querySelectorAll('.pv__row b')), marks = [].slice.call(rail.querySelectorAll('a b'));
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
