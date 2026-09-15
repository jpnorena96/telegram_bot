with open('playwright_test.py', 'r', encoding='utf-8') as f:
    content = f.read()

family_code = '''
        # ========== 25. NEXT: FAMILY ==========
        print("-> Click en Next: Family...")
        async with page.expect_navigation(wait_until='networkidle', timeout=30000):
            await page.evaluate("document.getElementById('ctl00_SiteContentPlaceHolder_UpdateButton3').click()")
            
        print("-> Rellenando Family Information: Relatives...")
        await page.wait_for_selector('#ctl00_SiteContentPlaceHolder_FormView1_tbxFATHER_SURNAME', state='visible', timeout=15000)
        
        # Father
        if datos.get('fatherSurnameNA'):
            await safe_check(page, '#ctl00_SiteContentPlaceHolder_FormView1_cbxFATHER_SURNAME_UNK_IND')
        else:
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxFATHER_SURNAME', datos.get('fatherSurname', ''))
            
        if datos.get('fatherGivenNameNA'):
            await safe_check(page, '#ctl00_SiteContentPlaceHolder_FormView1_cbxFATHER_GIVEN_NAME_UNK_IND')
        else:
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxFATHER_GIVEN_NAME', datos.get('fatherGivenName', ''))
            
        if datos.get('fatherDOBNA'):
            await safe_check(page, '#ctl00_SiteContentPlaceHolder_FormView1_cbxFATHER_DOB_UNK_IND')
        else:
            await safe_select(page, '#ctl00_SiteContentPlaceHolder_FormView1_ddlFathersDOBDay', str(datos.get('fatherDOBDay', '1')).zfill(2))
            await safe_select(page, '#ctl00_SiteContentPlaceHolder_FormView1_ddlFathersDOBMonth', datos.get('fatherDOBMonth', ''))
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxFathersDOBYear', str(datos.get('fatherDOBYear', '')))
            
        if datos.get('fatherInUS') == 'Y':
            await page.evaluate("document.getElementById('ctl00_SiteContentPlaceHolder_FormView1_rblFATHER_LIVE_IN_US_IND_0').click()")
        else:
            await page.evaluate("document.getElementById('ctl00_SiteContentPlaceHolder_FormView1_rblFATHER_LIVE_IN_US_IND_1').click()")

        # Mother
        if datos.get('motherSurnameNA'):
            await safe_check(page, '#ctl00_SiteContentPlaceHolder_FormView1_cbxMOTHER_SURNAME_UNK_IND')
        else:
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxMOTHER_SURNAME', datos.get('motherSurname', ''))
            
        if datos.get('motherGivenNameNA'):
            await safe_check(page, '#ctl00_SiteContentPlaceHolder_FormView1_cbxMOTHER_GIVEN_NAME_UNK_IND')
        else:
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxMOTHER_GIVEN_NAME', datos.get('motherGivenName', ''))
            
        if datos.get('motherDOBNA'):
            await safe_check(page, '#ctl00_SiteContentPlaceHolder_FormView1_cbxMOTHER_DOB_UNK_IND')
        else:
            await safe_select(page, '#ctl00_SiteContentPlaceHolder_FormView1_ddlMothersDOBDay', str(datos.get('motherDOBDay', '1')).zfill(2))
            await safe_select(page, '#ctl00_SiteContentPlaceHolder_FormView1_ddlMothersDOBMonth', datos.get('motherDOBMonth', ''))
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxMothersDOBYear', str(datos.get('motherDOBYear', '')))
            
        if datos.get('motherInUS') == 'Y':
            await page.evaluate("document.getElementById('ctl00_SiteContentPlaceHolder_FormView1_rblMOTHER_LIVE_IN_US_IND_0').click()")
        else:
            await page.evaluate("document.getElementById('ctl00_SiteContentPlaceHolder_FormView1_rblMOTHER_LIVE_IN_US_IND_1').click()")

        # Immediate Relatives
        if datos.get('immediateRelatives') == 'Y':
            await page.evaluate("document.getElementById('ctl00_SiteContentPlaceHolder_FormView1_rblUS_IMMED_RELATIVE_IND_0').click()")
        else:
            await page.evaluate("document.getElementById('ctl00_SiteContentPlaceHolder_FormView1_rblUS_IMMED_RELATIVE_IND_1').click()")

        print("-> Family completado.")
'''

content = content.replace('print("-> U.S. Point of Contact completado.")', 'print("-> U.S. Point of Contact completado.")\n' + family_code)

with open('playwright_test.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("Appended Family section")
