const { chromium } = require('playwright');
const fs = require('fs'); const path = require('path');
const data = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const outDir = process.argv[3];
const only = process.argv[4];
const esc = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/\n/g,'<br>');
function html(slide, i, n) {
  const last = i === n - 1;
  return `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Inter:wght@400;500&family=JetBrains+Mono:wght@500&display=block" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{width:1080px;height:1350px;background:#0A0B0F;color:#F4F4F0;font-family:Inter,sans-serif;position:relative;overflow:hidden}
.grid{position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.035) 1px,transparent 1px);background-size:90px 90px}
.glow{position:absolute;width:900px;height:900px;right:-380px;top:-380px;background:radial-gradient(circle,rgba(212,255,79,.16),transparent 62%)}
.top{position:absolute;top:80px;left:90px;right:90px;display:flex;justify-content:space-between;font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:.12em;color:rgba(244,244,240,.62)}
.kicker{color:#D4FF4F}
.main{position:absolute;left:90px;right:90px;top:300px}
h1{font-family:Fraunces,serif;font-weight:500;font-size:${slide.headline.length>60?84:slide.headline.length>38?98:116}px;line-height:1.04;letter-spacing:-.02em}
p{margin-top:56px;font-size:40px;line-height:1.38;color:rgba(244,244,240,.72);max-width:860px}
.bar{position:absolute;left:90px;bottom:250px;width:120px;height:8px;background:#D4FF4F}
.foot{position:absolute;left:90px;right:90px;bottom:90px;display:flex;justify-content:space-between;align-items:center;border-top:1px solid rgba(255,255,255,.18);padding-top:36px;font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:.08em;color:rgba(244,244,240,.62)}
.brand{font-family:Fraunces,serif;font-size:36px;letter-spacing:0;color:#F4F4F0}
.cta{background:#D4FF4F;color:#0A0B0F;padding:16px 26px;font-weight:500}
.dots{display:flex;gap:10px}.dots i{width:12px;height:12px;border:1px solid rgba(244,244,240,.5)}.dots i.on{background:#D4FF4F;border-color:#D4FF4F}
</style></head><body><div class="grid"></div><div class="glow"></div>
<div class="top"><span class="kicker">${esc(slide.kicker)}</span><span>${n>1?String(i+1).padStart(2,'0')+' / '+String(n).padStart(2,'0'):''}</span></div>
<div class="main"><h1>${esc(slide.headline)}</h1><p>${esc(slide.body)}</p></div>
<div class="bar"></div>
<div class="foot"><span class="brand">VoxReception</span>${last?'<span class="cta">CALL +1 (859) 724-5646</span>':`<span class="dots">${Array.from({length:n},(_,k)=>`<i class="${k===i?'on':''}"></i>`).join('')}</span>`}</div>
</body></html>`;
}
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
  for (const post of data.posts) {
    if (only && post.id !== only) continue;
    const dir = path.join(outDir, post.id); fs.mkdirSync(dir, { recursive: true });
    for (let i = 0; i < post.slides.length; i++) {
      await page.setContent(html(post.slides[i], i, post.slides.length), { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({ path: path.join(dir, `slide-${i+1}.jpg`), type: 'jpeg', quality: 90 });
    }
    console.log('rendered', post.id, post.slides.length);
  }
  await browser.close();
})();
