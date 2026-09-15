with open('playwright_test.py', 'r', encoding='utf-8') as f:
    content = f.read()

old_end_block = """        print("-> Security and Background: Part 5 completado.")

        print("-> Click en Next: PHOTO...")
        async with page.expect_navigation(wait_until='networkidle', timeout=30000):
            await page.evaluate("document.getElementById('ctl00_SiteContentPlaceHolder_UpdateButton3').click()")
        print("-> Llegamos a PHOTO")

        print("-> Esperando 2 minutos antes de cerrar el navegador...")
        await page.wait_for_timeout(120000)"""

new_end_block = """        print("-> Security and Background: Part 5 completado.")

        print("-> Click en Next: PHOTO...")
        async with page.expect_navigation(wait_until='networkidle', timeout=30000):
            await page.evaluate("document.getElementById('ctl00_SiteContentPlaceHolder_UpdateButton3').click()")
        print("-> Llegamos a PHOTO")

        # ========== 34. PHOTO ==========
        print("-> Click en Upload Your Photo...")
        await page.wait_for_selector('#ctl00_SiteContentPlaceHolder_btnUploadPhoto', state='visible', timeout=15000)
        async with page.expect_navigation(wait_until='networkidle', timeout=30000):
            await page.evaluate("document.getElementById('ctl00_SiteContentPlaceHolder_btnUploadPhoto').click()")
        print("-> Llegamos al sistema de subir foto")

        print("-> Esperando 2 minutos antes de cerrar el navegador...")
        await page.wait_for_timeout(120000)"""

content = content.replace(old_end_block, new_end_block)

with open('playwright_test.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated script with PHOTO block")
