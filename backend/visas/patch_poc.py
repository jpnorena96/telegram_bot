with open('playwright_test.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the U.S. Point of Contact NA logic
old_poc_logic = """        if datos.get('pocNameNA'):
            # Usamos check() o evaluate() para forzar el click del checkbox
            await page.evaluate("document.getElementById('ctl00_SiteContentPlaceHolder_FormView1_cbxUS_POC_NAME_NA').click()")
            await page.wait_for_timeout(2000)
            await page.wait_for_load_state('networkidle')
        else:
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxUS_POC_SURNAME', datos.get('pocSurname', ''))
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxUS_POC_GIVEN_NAME', datos.get('pocGivenName', ''))

        if datos.get('pocOrgNA'):
            await page.click('#ctl00_SiteContentPlaceHolder_FormView1_cbxUS_POC_ORG_NA_IND')
            await page.wait_for_load_state('domcontentloaded')
            await page.wait_for_timeout(2000)
        else:
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxUS_POC_ORGANIZATION', datos.get('pocOrgName', ''))"""

new_poc_logic = """        # If we know the person, fill them in.
        # Note: CEAC defaults to Org NA checked.
        if not datos.get('pocNameNA'):
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxUS_POC_SURNAME', datos.get('pocSurname', ''))
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxUS_POC_GIVEN_NAME', datos.get('pocGivenName', ''))
        else:
            # We don't know the name. Make sure Name NA is checked.
            # First uncheck Org NA if it's checked so we can check Name NA
            try:
                await page.uncheck('#ctl00_SiteContentPlaceHolder_FormView1_cbxUS_POC_ORG_NA_IND')
                await page.wait_for_timeout(1000)
                await page.check('#ctl00_SiteContentPlaceHolder_FormView1_cbxUS_POC_NAME_NA')
                await page.wait_for_timeout(1000)
            except:
                pass
                
        if not datos.get('pocOrgNA'):
            try:
                await page.uncheck('#ctl00_SiteContentPlaceHolder_FormView1_cbxUS_POC_ORG_NA_IND')
                await page.wait_for_timeout(1000)
            except:
                pass
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxUS_POC_ORGANIZATION', datos.get('pocOrgName', ''))
        else:
            try:
                await page.check('#ctl00_SiteContentPlaceHolder_FormView1_cbxUS_POC_ORG_NA_IND')
                await page.wait_for_timeout(1000)
            except:
                pass"""

content = content.replace(old_poc_logic, new_poc_logic)

with open('playwright_test.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("Patched US POC NA logic")
