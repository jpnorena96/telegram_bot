with open('playwright_test.py', 'r', encoding='utf-8') as f:
    content = f.read()

work_education_code = """        print("-> Llegamos a Work/Education/Training")

        # ========== 26. PRESENT WORK/EDUCATION/TRAINING ==========
        print("-> Rellenando Work/Education/Training...")
        await page.wait_for_selector('#ctl00_SiteContentPlaceHolder_FormView1_ddlPresentOccupation', state='visible', timeout=15000)

        primary_occ = datos.get('primaryOccupation', '')
        await safe_select(page, '#ctl00_SiteContentPlaceHolder_FormView1_ddlPresentOccupation', primary_occ)
        await page.wait_for_load_state('networkidle')
        await page.wait_for_timeout(1500)

        not_employed_or_homemaker = primary_occ in ['N', 'H', 'RT']

        if not not_employed_or_homemaker and primary_occ != '':
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxEmpSchName', datos.get('empSchName', ''))
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxEmpSchAddr1', datos.get('empSchAddr1', ''))
            
            if datos.get('empSchAddr2'):
                await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxEmpSchAddr2', datos.get('empSchAddr2', ''))
                
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxEmpSchCity', datos.get('empSchCity', ''))
            
            if datos.get('empSchStateNA'):
                await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_cbxWORK_EDUC_ADDR_STATE_NA')
            else:
                await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxWORK_EDUC_ADDR_STATE', datos.get('empSchState', ''))
                
            if datos.get('empSchZipCodeNA'):
                await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_cbxWORK_EDUC_ADDR_POSTAL_CD_NA')
            else:
                await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxWORK_EDUC_ADDR_POSTAL_CD', datos.get('empSchZipCode', ''))
                
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxWORK_EDUC_TEL', datos.get('empSchPhone', ''))
            await safe_select(page, '#ctl00_SiteContentPlaceHolder_FormView1_ddlEmpSchCountry', datos.get('empSchCountry', ''))
            await page.wait_for_load_state('networkidle')
            await page.wait_for_timeout(1000)
            
            day = str(datos.get('empStartDateDay', '1')).zfill(2)
            await safe_select(page, '#ctl00_SiteContentPlaceHolder_FormView1_ddlEmpDateFromDay', day if day != '00' else '')
            await safe_select(page, '#ctl00_SiteContentPlaceHolder_FormView1_ddlEmpDateFromMonth', str(datos.get('empStartDateMonth', '')))
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxEmpDateFromYear', str(datos.get('empStartDateYear', '')))
            
            if datos.get('monthlyIncomeNA'):
                await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_cbxCURR_MONTHLY_SALARY_NA')
            else:
                await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxCURR_MONTHLY_SALARY', datos.get('monthlyIncome', ''))
                
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxDescribeDuties', datos.get('empDuties', ''))

        elif primary_occ == 'N':
            # Not employed explain
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxExplainOtherPresentOccupation', datos.get('notEmployedExplain', ''))

        print("-> Work/Education/Training completado.")

        print("-> Esperando 2 minutos antes de cerrar el navegador...")
        await page.wait_for_timeout(120000)"""

content = content.replace('        print("-> Llegamos a Work/Education/Training")\n\n        print("-> Esperando 2 minutos antes de cerrar el navegador...")\n        await page.wait_for_timeout(120000)', work_education_code)

with open('playwright_test.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated script")
