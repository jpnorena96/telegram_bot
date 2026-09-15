import re

with open('playwright_test.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix whoIsPaying
old_who = re.compile(r"await page\.select_option\('#ctl00_SiteContentPlaceHolder_FormView1_ddlWhoIsPaying', datos\.get\('whoIsPaying', 'S'\)\)\s+await page\.wait_for_timeout\(600\)")
new_who = '''who_pays = datos.get('whoIsPaying', 'S')
        await page.select_option('#ctl00_SiteContentPlaceHolder_FormView1_ddlWhoIsPaying', who_pays)
        await page.wait_for_load_state('networkidle')
        await page.wait_for_timeout(1500)'''
content = old_who.sub(new_who, content)

# Fix Next Button
old_next = re.compile(r"await page\.click\('#ctl00_SiteContentPlaceHolder_UpdateButton3'\)")
new_next = "await page.evaluate(\"document.getElementById('ctl00_SiteContentPlaceHolder_UpdateButton3').click()\")"
content = old_next.sub(new_next, content)

with open('playwright_test.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("Travel Next patched successfully with regex")
