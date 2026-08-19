const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const fs = require('fs');

async function run() {
    const browser = await puppeteer.launch({ headless: false }); // Set false to see it
    const page = await browser.newPage();
    
    await page.goto('https://ceac.state.gov/genniv/', { waitUntil: 'networkidle2' });
    
    // Select BGT
    await page.select('select[name="ctl00$SiteContentPlaceHolder$ucLocation$ddlLocation"]', 'BGT');
    await page.waitForTimeout(2000); // wait for reload

    // Get captcha image
    const element = await page.$('img[id*="CaptchaImage"]');
    await element.screenshot({path: 'captcha.png'});
    
    // Call python ddddocr locally (hacky but works for POC)
    const execSync = require('child_process').execSync;
    const result = execSync('python -c "import ddddocr; ocr=ddddocr.DdddOcr(show_ad=False); print(ocr.classification(open(\'captcha.png\', \'rb\').read()))"').toString().trim();
    console.log("OCR Result:", result);

    // Type captcha
    await page.type('input[name="ctl00$SiteContentPlaceHolder$ucLocation$IdentifyCaptcha1$txtCodeTextBox"]', result);
    
    // Click submit
    await page.click('a[id="ctl00_SiteContentPlaceHolder_btnNew"]');
    
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    console.log("New page URL:", page.url());
    
    await browser.close();
}

run();
