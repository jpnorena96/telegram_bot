with open('playwright_test.py', 'r', encoding='utf-8') as f:
    content = f.read()

family_code_start = '# ========== 25. NEXT: FAMILY =========='
before_family, family_code = content.split(family_code_start)

new_family_code = '''
        print("-> Click en Next: Family...")
        async with page.expect_navigation(wait_until='networkidle', timeout=30000):
            await page.evaluate("document.getElementById('ctl00_SiteContentPlaceHolder_UpdateButton3').click()")
            
        print("-> Rellenando Family Information: Relatives...")
        await page.wait_for_selector('#ctl00_SiteContentPlaceHolder_FormView1_tbxFATHER_SURNAME', state='visible', timeout=15000)
        
        # Helper for checkbox that triggers postback
        async def check_and_wait(selector):
            if await page.locator(selector).is_visible():
                await page.evaluate(f"document.querySelector('{selector}').click()")
                await page.wait_for_timeout(2000)
                await page.wait_for_load_state('networkidle')

        # Father
        if datos.get('fatherSurnameNA'):
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_cbxFATHER_SURNAME_UNK_IND')
        else:
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxFATHER_SURNAME', datos.get('fatherSurname', ''))
            
        if datos.get('fatherGivenNameNA'):
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_cbxFATHER_GIVEN_NAME_UNK_IND')
        else:
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxFATHER_GIVEN_NAME', datos.get('fatherGivenName', ''))
            
        if datos.get('fatherDOBNA'):
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_cbxFATHER_DOB_UNK_IND')
        else:
            if await page.locator('#ctl00_SiteContentPlaceHolder_FormView1_ddlFathersDOBDay').is_visible():
                await safe_select(page, '#ctl00_SiteContentPlaceHolder_FormView1_ddlFathersDOBDay', str(datos.get('fatherDOBDay', '1')).zfill(2))
                await safe_select(page, '#ctl00_SiteContentPlaceHolder_FormView1_ddlFathersDOBMonth', datos.get('fatherDOBMonth', ''))
                await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxFathersDOBYear', str(datos.get('fatherDOBYear', '')))
            
        father_in_us_id = 'ctl00_SiteContentPlaceHolder_FormView1_rblFATHER_LIVE_IN_US_IND_0' if datos.get('fatherInUS') == 'Y' else 'ctl00_SiteContentPlaceHolder_FormView1_rblFATHER_LIVE_IN_US_IND_1'
        await page.evaluate(f"if (document.getElementById('{father_in_us_id}')) document.getElementById('{father_in_us_id}').click()")

        # Mother
        if datos.get('motherSurnameNA'):
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_cbxMOTHER_SURNAME_UNK_IND')
        else:
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxMOTHER_SURNAME', datos.get('motherSurname', ''))
            
        if datos.get('motherGivenNameNA'):
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_cbxMOTHER_GIVEN_NAME_UNK_IND')
        else:
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxMOTHER_GIVEN_NAME', datos.get('motherGivenName', ''))
            
        if datos.get('motherDOBNA'):
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_cbxMOTHER_DOB_UNK_IND')
        else:
            if await page.locator('#ctl00_SiteContentPlaceHolder_FormView1_ddlMothersDOBDay').is_visible():
                await safe_select(page, '#ctl00_SiteContentPlaceHolder_FormView1_ddlMothersDOBDay', str(datos.get('motherDOBDay', '1')).zfill(2))
                await safe_select(page, '#ctl00_SiteContentPlaceHolder_FormView1_ddlMothersDOBMonth', datos.get('motherDOBMonth', ''))
                await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxMothersDOBYear', str(datos.get('motherDOBYear', '')))
            
        mother_in_us_id = 'ctl00_SiteContentPlaceHolder_FormView1_rblMOTHER_LIVE_IN_US_IND_0' if datos.get('motherInUS') == 'Y' else 'ctl00_SiteContentPlaceHolder_FormView1_rblMOTHER_LIVE_IN_US_IND_1'
        await page.evaluate(f"if (document.getElementById('{mother_in_us_id}')) document.getElementById('{mother_in_us_id}').click()")

        # Immediate Relatives
        rel_in_us_id = 'ctl00_SiteContentPlaceHolder_FormView1_rblUS_IMMED_RELATIVE_IND_0' if datos.get('immediateRelatives') == 'Y' else 'ctl00_SiteContentPlaceHolder_FormView1_rblUS_IMMED_RELATIVE_IND_1'
        await page.evaluate(f"if (document.getElementById('{rel_in_us_id}')) document.getElementById('{rel_in_us_id}').click()")

        print("-> Family completado.")
'''

with open('playwright_test.py', 'w', encoding='utf-8') as f:
    f.write(before_family + family_code_start + new_family_code)

print("Patched Family logic")
