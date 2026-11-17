// Task b36dde1f (J 17 Nov 08:40 Z: "check in my macbook safari"): a person's walk in J's own Safari (his settings, his
// Safari 27), live M and G. One new window for the walk only, closed at the end, focus given back to the app that had it.
// Per salon section in order: jump there, dwell (2300 ms quick visitor, 6000 ms reader); on a step film read its clock
// 1.5 s and 6 s after arriving (as qa/safari.mjs visit does) and capture the window at both moments (peekaboo).
// Run: osascript -l JavaScript b36dde1f-ownwalk.js
ObjC.import('Foundation');
const app = Application.currentApplication(); app.includeStandardAdditions = true;
const OUT = '/Users/j/tmp/2ff6066f/b36dde1f-own2';
app.doShellScript(`rm -rf ${OUT}; mkdir -p ${OUT}/frames`);
const log = (s) => app.doShellScript(`printf '%s\\n' ${JSON.stringify(String(s)).replace(/\$/g, '\\$')} >> ${OUT}/walk.log`);
const save = (o) => { const str = $.NSString.alloc.initWithUTF8String(JSON.stringify(o, null, 1)); str.writeToFileAtomicallyEncodingError(`${OUT}/walk.json`, true, $.NSUTF8StringEncoding, null); };
const SE = Application('System Events');
const front = SE.processes.whose({ frontmost: true })[0].name();
const Safari = Application('Safari');
const res = { started: new Date().toISOString(), front, versions: {} };
let wid = null;
const js = (code) => Safari.doJavaScript(code, { in: Safari.windows.byId(wid).currentTab });
const shot = (name) => {
  const p = `${OUT}/frames/${name}.png`;
  try { app.doShellScript(`/usr/sbin/screencapture -x -o -l${wid} ${p}`); } catch (e) { log('screencapture ' + name + ': ' + e); }
  if (app.doShellScript(`test -s ${p} && echo y || echo n`) === 'y') return;
  try { log('peekaboo ' + name + ': ' + app.doShellScript(`/opt/homebrew/bin/peekaboo image --app Safari --path ${p} 2>&1; echo rc=$?`)); } catch (e) { log('peekaboo ' + name + ': ' + e); }
};
const HERO = `JSON.stringify((function(){const v=document.querySelector('video[data-src$="hero.mp4"]');if(!v)return null;const r=v.getBoundingClientRect();
 return {t:Math.round(v.currentTime*100)/100,paused:v.paused,rate:v.playbackRate,muted:v.muted,ready:v.readyState,src:!!v.getAttribute('src'),stop:v.getAttribute('data-stop'),
 top:Math.round(r.top),h:Math.round(r.height),y:Math.round(scrollY),vh:innerHeight};})())`;
function hero(v, tag) {
  delay(1.5); const a = JSON.parse(js(HERO)); shot(`${v}-hero-${tag}-1.5s`);
  delay(4.5); const z = JSON.parse(js(HERO)); shot(`${v}-hero-${tag}-6s`);
  const moving = !!(a && z && z.t > a.t + 0.3);
  log(`hero ${v} ${tag} moving ${moving} t ${a && a.t}->${z && z.t} paused ${z && z.paused} rate ${z && z.rate} muted ${z && z.muted} stop ${z && z.stop} top ${z && z.top} y ${z && z.y}`);
  return { moving, a, z };
}
const FILM = `(function(id){const s=document.getElementById(id),v=s.querySelector('video'),top=s.querySelector('.ch__top');
 return JSON.stringify({t:v?Math.round(v.currentTime*100)/100:null,paused:v?v.paused:null,ready:v?v.readyState:null,err:v&&v.error?v.error.code:null,
 src:v?(v.currentSrc||'').split('/').pop():null,blob:v?/^blob:/.test(v.currentSrc||''):null,on:v?v.classList.contains('is-on'):null,
 photo:top?Math.round(+getComputedStyle(top).opacity*100)/100:null});})`;
const PLAYLOG = `(function(){if(!window.__fv){const fv=window.__fv={plays:[]},p0=HTMLMediaElement.prototype.play;
 HTMLMediaElement.prototype.play=function(){const rec={src:(this.currentSrc||this.src||'').split('/').pop().slice(0,24),at:Math.round(performance.now()),out:'pending'};
 fv.plays.push(rec);const pr=p0.apply(this,arguments);if(pr&&pr.then)pr.then(()=>{rec.out='ok'},(e)=>{rec.out=(e&&e.name)||'rejected'});return pr;};}return 1;})()`;
const JUMP = `(function(i){const s=document.querySelectorAll('main[data-world="salon"] > section.s')[i],r=document.documentElement,b=r.style.scrollBehavior,sn=r.style.scrollSnapType;
 r.style.scrollBehavior='auto';r.style.scrollSnapType='none';scrollTo(0,s.getBoundingClientRect().top+scrollY);requestAnimationFrame(()=>{r.style.scrollSnapType=sn;r.style.scrollBehavior=b;});return 1;})`;
function walk(v, dwell) {
  Safari.windows.byId(wid).currentTab.url = `https://salon-om-2-2-${v}.web.app/?walk=${dwell}`;
  delay(1); js(PLAYLOG); const heroTop = hero(v, 'top');
  const env = JSON.parse(js(`JSON.stringify({w:innerWidth,h:innerHeight,dpr:devicePixelRatio,vis:document.visibilityState,ua:navigator.userAgent})`));
  const secs = JSON.parse(js(`JSON.stringify([...document.querySelectorAll('main[data-world="salon"] > section.s')].map((s,i)=>({i,id:s.id||null,step:!!(s.querySelector('.ch__top')&&s.querySelector('video'))})))`));
  const steps = [];
  for (const s of secs) {
    js(`${JUMP}(${s.i})`);
    if (!s.step) { delay(dwell / 1000); continue; }
    delay(1.5); const a = JSON.parse(js(`${FILM}(${JSON.stringify(s.id)})`)); shot(`${v}-${dwell}-${s.id}-1.5s`);
    delay(4.5); const z = JSON.parse(js(`${FILM}(${JSON.stringify(s.id)})`)); shot(`${v}-${dwell}-${s.id}-6s`);
    const moving = z.t != null && a.t != null && z.t > a.t + 0.5 && !z.paused && z.err == null;
    steps.push({ id: s.id, moving, a, z });
    log(`visit ${v} ${dwell} ${s.id} film ${moving} t ${a.t}->${z.t} paused ${z.paused} ready ${z.ready} blob ${a.blob}->${z.blob} on ${z.on} photo ${z.photo}`);
  }
  js(`scrollTo(0,0)`); const heroBack = hero(v, 'back');
  const plays = JSON.parse(js(`JSON.stringify(window.__fv.plays)`));
  return { dwell, env, steps, plays, heroTop, heroBack };
}
try {
  Safari.activate(); delay(0.5);
  log('peekaboo help: ' + app.doShellScript('/opt/homebrew/bin/peekaboo image --help 2>&1 | head -30 | tr "\\n" "|"'));
  const doc = Safari.Document({ url: 'about:blank' }); Safari.documents.push(doc); delay(1.5);
  wid = Safari.windows[0].id(); res.windowId = wid;
  for (const v of ['m', 'g']) {
    res.versions[v] = {};
    for (const d of [2300]) { try { res.versions[v]['visit' + d] = walk(v, d); } catch (e) { res.versions[v]['visit' + d] = { error: String(e) }; log(`${v} ${d} error ${e}`); } save(res); }
  }
} catch (e) { res.error = String(e); log('error ' + e); }
finally {
  try { if (wid) Safari.windows.byId(wid).close(); } catch (e) { log('close: ' + e); }
  try { Application(front).activate(); } catch (e) { log('refocus: ' + e); }
  res.ended = new Date().toISOString(); save(res);
  log('DONE');
}
