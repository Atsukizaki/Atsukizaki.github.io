// Run after starting scripts/preview.cjs. Playwright is a local QA dependency only.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
(async()=>{
 fs.mkdirSync('.qa',{recursive:true});
 const chromeCandidates=[process.env.CHROME_PATH,'C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'];
 const executablePath=chromeCandidates.find(file=>file&&fs.existsSync(file));
 const browser=await chromium.launch({...(executablePath?{executablePath}:{}),headless:true});
 const errors=[];
 for(const [name,width,height] of [['desktop',1440,1000],['tablet',768,1024],['mobile',390,844],['small-mobile',320,700]]){
  const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
  page.on('pageerror',e=>errors.push(e.message));
  for(const file of ['index.html','about.html','study.html','activities.html']){
   await page.goto('http://127.0.0.1:8000/'+file);
   if(file==='study.html'||file==='activities.html') await page.waitForFunction(()=>document.querySelector('.count').textContent==='0件の記録');
   assert.equal(await page.locator('h1').count(),1);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`${name}/${file} overflow`);
   for(const href of await page.locator('a[href]').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('href')).filter(h=>!h.startsWith('http')))){
    const u=new URL(href,page.url());
    if(u.hash)assert.equal(await page.locator(u.hash).count()>0,true,`missing ${href}`);
    else assert.equal((await page.request.get(u.href)).ok(),true,`missing ${href}`);
   }
   await page.screenshot({path:`.qa/${name}-${file.replace('.html','')}.png`,fullPage:true});
  }
  if(width<=760){
   await page.getByRole('button',{name:'メニュー',exact:true}).click();
   assert.equal(await page.getByRole('navigation').isVisible(),true);
   await page.keyboard.press('Escape');
   assert.equal(await page.getByRole('navigation').isVisible(),false);
  }
  await page.close();
 }
 const page=await browser.newPage();
 const fixture={studies:[{title:'QA record AI',category:'AI',date:'2026-01-02',description:'<script>test</script>',url:'javascript:alert(1)'},{title:'QA record statistics',category:'統計学',date:'2026-01-03',description:'QA only',url:'https://example.com'}],achievements:[],posts:[]};
 await page.route('**/data/portfolio.json',route=>route.fulfill({json:fixture}));
 await page.goto('http://127.0.0.1:8000/study.html');
 await page.waitForFunction(()=>document.querySelector('.count').textContent==='2件の記録');
 assert.equal(await page.locator('.record-card').count(),2);
 assert.equal(await page.locator('.record-card').first().locator('h3').textContent(),'QA record statistics');
 await page.getByRole('button',{name:'AI',exact:true}).click();
 assert.equal(await page.locator('.record-card').count(),1);
 assert.equal(await page.locator('.record-card a').count(),0);
 assert.equal(await page.locator('.record-card p').textContent(),'<script>test</script>');
 await page.getByRole('button',{name:'経営学',exact:true}).click();
 assert.equal(await page.locator('.record-card').count(),0);
 await page.unroute('**/data/portfolio.json');
 await page.route('**/data/portfolio.json',route=>route.fulfill({status:500,body:'Error'}));
 await page.reload();await page.getByText('記録を読み込めませんでした').waitFor();
 await page.close();
 const nojs=await browser.newContext({javaScriptEnabled:false});const fallback=await nojs.newPage();
 await fallback.goto('http://127.0.0.1:8000/about.html');assert.equal(await fallback.getByRole('navigation').isVisible(),true);assert.equal(await fallback.locator('.timeline>li').count(),4);
 await browser.close();assert.deepEqual(errors,[]);console.log('PASS: 4 pages x 4 viewport sizes; links, menu, filters, safe rendering, empty/error states, no-JS fallback.');
})().catch(error=>{console.error(error);process.exit(1);});
