/* The lenticular sheet (task a73569a9, J 18 Nov: "the lenticular sheet is a great inspiration ... use the lenticular sheet and
   glass effects if you need something on top"; his reference: a ribbed plastic sheet over a colour chart, 2:20-2:40). ONE block
   for every glass pane on M, G and S (the pause's door, Why Aveda's sheet): a small WebGL canvas drawn only over the pane,
   the same picture the page shows beside it seen through vertical ribs. Each rib is a cylinder lens (it shows a mirrored,
   squeezed slice of the picture, with a thin colour fringe on its edge); the sheet slides with the scroll and the bands
   smear while it moves; lying flat (the pane's strength 0) it is clear, so a picture is never held behind ribs at rest
   unless the pane is meant to stay glass.
   Markup (mgs_parts.lens): <div class="len" data-len="img/hd/x-1280.webp" data-len-fig=".sel" data-len-pos="50% 18%"
   data-len-base="0|.6" data-len-rib="34" data-len-grade=".96"><canvas></canvas></div>. data-len-fig is the picture's box
   (the pane's picture is that box drawn object-fit: cover at data-len-pos, as the page's <img> beside it); data-len-base is
   the strength at rest (0 = clear at rest).
   Light by construction: one 1280 px texture per pane (never the page's big file), a canvas capped at 1.5x, drawn only when
   something moved and the pane is near the screen, its context released when far (Safari reloaded the page once for
   memory, J 18 Nov); the motion switch's calm mode, the films' pause button and ?shot draw one still frame; a device
   with no WebGL keeps the CSS frost (mgs.css .len--css). */
(function () {
  var root = document.documentElement, panes = [].slice.call(document.querySelectorAll('[data-len]'));
  if (!panes.length) return;
  var toggle = document.getElementById('films-toggle');
  function still() { return root.getAttribute('data-motion') === 'calm' || root.hasAttribute('data-shot') || (toggle && toggle.getAttribute('aria-pressed') === 'true'); }
  var VS = 'attribute vec2 p;varying vec2 v;void main(){v=p*.5+.5;gl_Position=vec4(p,0.,1.);}';
  var FS = [
    '#ifdef GL_FRAGMENT_PRECISION_HIGH', 'precision highp float;', '#else', 'precision mediump float;', '#endif',
    'varying vec2 v;uniform sampler2D t;',
    'uniform vec4 box;uniform vec2 fig,img,pos;',                 // the pane in the picture's box (css px), the box, the texture, object-position
    'uniform float rib,off,str,smear,grade;',                      // rib width (css px), the sheet's slide (ribs), strength 0..1, smear (css px), brightness
    'vec3 pic(vec2 q){',
    '  float k=max(fig.x/img.x,fig.y/img.y);vec2 sz=img*k,org=(fig-sz)*pos;',
    '  vec2 u=(q-org)/sz;u=1.-abs(1.-mod(u,2.));',                    // past the picture's edge the glass shows it mirrored (a pane longer than its photo), never the last row stretched
    '  return texture2D(t,u).rgb;}',
    'void main(){',
    '  vec2 q=vec2(v.x,1.-v.y)*box.zw+box.xy;',
    '  float c=fract((q.x+off*rib)/rib)-.5;',                      // across one rib, -.5 .. .5
    '  float dx=-c*str*1.15*rib;',                                 // a cylinder lens: each rib shows its slice magnified (full strength just starts to mirror it; 2.3 read as venetian blinds at J's 6K window)
    '  vec3 col=vec3(0.);',
    '  for(int i=0;i<5;i++){',
    '    float s=(float(i)/4.-.5)*smear;',
    '    col.r+=pic(vec2(q.x+dx*(1.+.07*str)+s,q.y)).r;',
    '    col.g+=pic(vec2(q.x+dx+s,q.y)).g;',
    '    col.b+=pic(vec2(q.x+dx*(1.-.07*str)+s,q.y)).b;}',
    '  col/=5.;',
    '  float hi=smoothstep(-.5,-.4,c)*(1.-smoothstep(-.4,-.24,c)),lo=smoothstep(.3,.5,c);',   // a thin light on a rib's left edge, a shadow on its right
    '  col=col*(1.-.16*str*lo)+.09*str*hi;',
    '  gl_FragColor=vec4(col*grade,1.);}'
  ].join('\n');

  function Pane(el) {
    this.el = el; this.base = +el.getAttribute('data-len-base') || 0; this.rib = +el.getAttribute('data-len-rib') || 34;
    this.grade = +el.getAttribute('data-len-grade') || 1; this.src = el.getAttribute('data-len');
    var p = (el.getAttribute('data-len-pos') || '50% 50%').split(' ');
    this.pos = [parseFloat(p[0]) / 100, parseFloat(p[1]) / 100];
    this.cur = null; this.vel = 0; this.dirty = true; this.gl = null; this.dead = false; this.img = null;
  }
  Pane.prototype.fig = function () { var s = this.el.getAttribute('data-len-fig'); return (s && (this.el.closest('section') || document).querySelector(s)) || this.el.parentNode; };
  Pane.prototype.release = function () {
    if (!this.gl) return; var x = this.gl.getExtension('WEBGL_lose_context'); if (x) x.loseContext();
    var c = this.canvas, n = c.cloneNode(false); c.parentNode.replaceChild(n, c); this.canvas = n; this.gl = null; this.prog = null; this.tex = null; this.dirty = true;
  };
  Pane.prototype.init = function () {
    if (this.gl || this.dead) return !!this.gl;
    this.canvas = this.canvas || this.el.querySelector('canvas');
    var gl = null; try { gl = this.canvas.getContext('webgl', { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: 'low-power' }); } catch (e) {}
    if (!gl) { this.dead = true; this.el.classList.add('len--css'); return false; }
    function sh(type, src) { var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null; }
    var vs = sh(gl.VERTEX_SHADER, VS), fs = sh(gl.FRAGMENT_SHADER, FS), pr = gl.createProgram();
    if (!vs || !fs) { this.dead = true; this.el.classList.add('len--css'); return false; }
    gl.attachShader(pr, vs); gl.attachShader(pr, fs); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) { this.dead = true; this.el.classList.add('len--css'); return false; }
    gl.useProgram(pr); this.prog = pr; this.gl = gl; this.u = {}; root.classList.add('len-on');   // the glass is live: the pause's own CSS blur-in stands down
    ['t', 'box', 'fig', 'img', 'pos', 'rib', 'off', 'str', 'smear', 'grade'].forEach(function (n) { this.u[n] = gl.getUniformLocation(pr, n); }, this);
    var b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    var a = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(a); gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);
    this.tex = gl.createTexture(); this.ready = false;
    var self = this, im = this.img || new Image(); this.img = im;
    var up = function () {
      if (!self.gl) return; gl.bindTexture(gl.TEXTURE_2D, self.tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, im); self.ready = true; self.dirty = true; self.el.classList.add('len--gl');
    };
    if (im.complete && im.naturalWidth) up(); else { im.onload = up; if (!im.src) im.src = this.src; }
    this.canvas.addEventListener('webglcontextlost', function (e) { e.preventDefault(); var c = self.canvas, n = c.cloneNode(false); if (c.parentNode) c.parentNode.replaceChild(n, c); self.canvas = n; self.gl = null; self.ready = false; self.dirty = true; self.el.classList.remove('len--gl'); }, false);
    return true;
  };
  // the sheet's place from where the picture's box sits in the window: d = -1 .. 1 (0 = centred on the screen)
  Pane.prototype.target = function (d) {
    var s = still(), a = Math.abs(d);
    if (s) return { x: 0, s: this.base };
    var k = Math.min(1, Math.max(0, (a - .06) / .62));
    return { x: d * 9, s: this.base + (1 - this.base) * k * k * (3 - 2 * k) * (this.base ? .5 : 1) };
  };
  Pane.prototype.follow = function () {     // the picture beside the pane keeps its own object-position per window size
    var im = this.fig().querySelector('img'), p = im && getComputedStyle(im).objectPosition;
    if (p) { var a = p.split(' '); this.pos = [parseFloat(a[0]) / 100, parseFloat(a[1] || a[0]) / 100]; }
  };
  Pane.prototype.frame = function (now, dt) {
    var fg = this.fig(), r = fg.getBoundingClientRect(), pr = this.el.getBoundingClientRect(), vh = innerHeight;
    if (pr.width < 8 || pr.height < 8) return false;                                   // the pane of the other layout is hidden
    var near = r.bottom > -vh * 1.2 && r.top < vh * 2.2, far = r.bottom < -vh * 2.6 || r.top > vh * 3.6;
    if (far) { this.release(); return false; }
    if (!near) return false;
    if (!this.init()) return false;
    if (this.dirty && !this.known) { this.follow(); this.known = true; }
    var d = (r.top + r.height / 2 - vh / 2) / vh, t = this.target(d), c = this.cur;
    if (!c) { c = this.cur = still() ? { x: t.x, s: t.s } : { x: 11 * (d < 0 ? -1 : 1), s: 1 }; this.dirty = true; }   // it slides in the first time
    var k = still() ? 1 : 1 - Math.exp(-dt / 380), nx = c.x + (t.x - c.x) * k, ns = c.s + (t.s - c.s) * k;
    var vx = Math.abs(nx - c.x) * this.rib / Math.max(dt, 8) * 1000;                    // css px per second the bands travel
    var sm = Math.min(30, vx * .05) * (.5 + ns);
    if (Math.abs(nx - c.x) > 1e-4 || Math.abs(ns - c.s) > 1e-4 || Math.abs(sm - (this.sm || 0)) > .05) this.dirty = true;
    c.x = nx; c.s = ns; this.sm = sm;
    var fw = fg.offsetWidth || r.width, sc = r.width / fw || 1, w = pr.width / sc, h = pr.height / sc, dpr = Math.min(devicePixelRatio || 1, 1.5), cw = Math.round(pr.width * dpr), ch = Math.round(pr.height * dpr);
    if (this.canvas.width !== cw || this.canvas.height !== ch) { this.canvas.width = cw; this.canvas.height = ch; this.dirty = true; }
    var clear = ns < .004 && Math.abs(nx) < .02 && !this.base;                           // lying flat on a clear pane: the page's own picture shows
    this.el.classList.toggle('is-clear', clear);
    if (!this.ready || !this.dirty || clear) return !clear && !still() && Math.abs(nx - t.x) > 1e-3;
    var gl = this.gl, u = this.u;
    gl.viewport(0, 0, cw, ch);
    gl.uniform1i(u.t, 0); gl.uniform4f(u.box, (pr.left - r.left) / sc, (pr.top - r.top) / sc, w, h); gl.uniform2f(u.fig, fw, fg.offsetHeight || r.height / sc);
    gl.uniform2f(u.img, this.img.naturalWidth, this.img.naturalHeight); gl.uniform2f(u.pos, this.pos[0], this.pos[1]);
    gl.uniform1f(u.rib, this.rib); gl.uniform1f(u.off, c.x); gl.uniform1f(u.str, Math.min(1, c.s)); gl.uniform1f(u.smear, sm); gl.uniform1f(u.grade, this.grade);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); this.dirty = false;
    return Math.abs(c.x - t.x) > 1e-3 || Math.abs(c.s - t.s) > 1e-3 || sm > .05;
  };

  var list = panes.map(function (e) { return new Pane(e); }), raf = 0, last = 0, awake = false;
  function loop(now) {
    raf = 0; var dt = Math.min(64, now - (last || now - 16)); last = now, busy = false;
    list.forEach(function (p) { if (p.frame(now, dt)) busy = true; });
    if (busy) raf = requestAnimationFrame(loop); else last = 0;
  }
  var busy = false;
  function wake() { if (!raf) raf = requestAnimationFrame(loop); }
  addEventListener('scroll', wake, { passive: true }); addEventListener('resize', function () { list.forEach(function (p) { p.dirty = true; p.known = false; }); wake(); }, { passive: true });
  if (toggle) toggle.addEventListener('click', function () { list.forEach(function (p) { p.dirty = true; }); wake(); });
  document.addEventListener('visibilitychange', function () { if (document.hidden) list.forEach(function (p) { p.release(); }); else wake(); });
  wake();
})();
