with open('playwright_test.py', 'r', encoding='utf-8') as f:
    content = f.read()

old_who_pays = """        await page.select_option('#ctl00_SiteContentPlaceHolder_FormView1_ddlWhoIsPaying', datos.get('whoIsPaying', 'S'))
        await page.wait_for_timeout(600)

        who_pays = datos.get('whoIsPaying', 'S')"""

new_who_pays = """        who_pays = datos.get('whoIsPaying', 'S')
        await page.select_option('#ctl00_SiteContentPlaceHolder_FormView1_ddlWhoIsPaying', who_pays)
        await page.wait_for_load_state('networkidle')
        await page.wait_for_timeout(1000)"""

content = content.replace(old_who_pays, new_who_pays)

old_next = """        # ========== 14. NEXT: TRAVEL COMPANIONS ==========
        print("? Click en Next: Travel Companions...")
        async with page.expect_navigation(wait_until='networkidle', timeout=30000):
            await page.click('#ctl00_SiteContentPlaceHolder_UpdateButton3')"""

new_next = """        # ========== 14. NEXT: TRAVEL COMPANIONS ==========
        print("? Click en Next: Travel Companions...")
        await page.wait_for_timeout(1000)
        async with page.expect_navigation(wait_until='networkidle', timeout=30000):
            await page.evaluate("document.getElementById('ctl00_SiteContentPlaceHolder_UpdateButton3').click()")"""

content = content.replace(old_next, new_next)

with open('playwright_test.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("Patched next button")
