const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage({ deviceScaleFactor: 2 });
  await page.goto('file://' + __dirname + '/preview.html');
  await page.waitForTimeout(200);
  const body = await page.$('body');
  const box = await body.boundingBox();
  await page.setViewportSize({ width: Math.ceil(box.width), height: Math.ceil(box.height) });
  await page.waitForTimeout(200);
  await page.screenshot({ path: 'todas-as-telas.png', fullPage: true });
  await browser.close();
  console.log('done');
})();
