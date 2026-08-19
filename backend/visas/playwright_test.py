import asyncio
from playwright.async_api import async_playwright
import ddddocr

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        page = await browser.new_page()
        
        print("Navigating to CEAC...")
        await page.goto('https://ceac.state.gov/genniv/', wait_until='networkidle')
        
        print("Selecting BGT...")
        await page.select_option('select[name="ctl00$SiteContentPlaceHolder$ucLocation$ddlLocation"]', 'BGT')
        await page.wait_for_timeout(2000) # Wait for page refresh/captcha to reload
        
        print("Capturing captcha...")
        captcha_element = await page.query_selector('img[id*="CaptchaImage"]')
        await captcha_element.screenshot(path='captcha.png')
        
        print("Solving captcha...")
        ocr = ddddocr.DdddOcr(show_ad=False)
        with open('captcha.png', 'rb') as f:
            img_bytes = f.read()
        captcha_text = ocr.classification(img_bytes)
        print(f"OCR Result: {captcha_text}")
        
        print("Typing captcha...")
        await page.fill('input[name="ctl00$SiteContentPlaceHolder$ucLocation$IdentifyCaptcha1$txtCodeTextBox"]', captcha_text)
        
        print("Submitting form...")
        # Start an application button
        async with page.expect_navigation():
            await page.click('a[id="ctl00_SiteContentPlaceHolder_btnNew"]')
            
        print(f"New page URL: {page.url}")
        print(f"New page Title: {await page.title()}")
        
        await browser.close()

if __name__ == '__main__':
    asyncio.run(run())
