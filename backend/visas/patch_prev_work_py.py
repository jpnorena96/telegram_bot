with open('playwright_test.py', 'r', encoding='utf-8') as f:
    content = f.read()

old_end_block = """        print("-> Work/Education/Training completado.")

        print("-> Click en Next: Work/Education: Previous...")
        async with page.expect_navigation(wait_until='networkidle', timeout=30000):
            await page.evaluate("document.getElementById('ctl00_SiteContentPlaceHolder_UpdateButton3').click()")
        print("-> Llegamos a Work/Education: Previous")

        print("-> Esperando 2 minutos antes de cerrar el navegador...")
        await page.wait_for_timeout(120000)"""

new_end_block = """        print("-> Work/Education/Training completado.")

        print("-> Click en Next: Work/Education: Previous...")
        async with page.expect_navigation(wait_until='networkidle', timeout=30000):
            await page.evaluate("document.getElementById('ctl00_SiteContentPlaceHolder_UpdateButton3').click()")
        print("-> Llegamos a Work/Education: Previous")

        # ========== 27. PREVIOUS WORK/EDUCATION/TRAINING ==========
        print("-> Rellenando Previous Work/Education/Training...")
        await page.wait_for_selector('#ctl00_SiteContentPlaceHolder_FormView1_rblPreviouslyEmployed_0', state='visible', timeout=15000)
        
        prev_employed = datos.get('prevEmployed', 'N')
        if prev_employed == 'Y':
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblPreviouslyEmployed_0')
            await page.wait_for_selector('#ctl00_SiteContentPlaceHolder_FormView1_dtlPrevEmpl_ctl00_tbEmployerName', state='visible', timeout=10000)
            
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_dtlPrevEmpl_ctl00_tbEmployerName', datos.get('prevEmpName', ''))
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_dtlPrevEmpl_ctl00_tbEmployerStreetAddress1', datos.get('prevEmpAddr1', ''))
            if datos.get('prevEmpAddr2'):
                await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_dtlPrevEmpl_ctl00_tbEmployerStreetAddress2', datos.get('prevEmpAddr2', ''))
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_dtlPrevEmpl_ctl00_tbEmployerCity', datos.get('prevEmpCity', ''))
            
            if datos.get('prevEmpStateNA'):
                await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_dtlPrevEmpl_ctl00_cbxPREV_EMPL_ADDR_STATE_NA')
            else:
                await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_dtlPrevEmpl_ctl00_tbxPREV_EMPL_ADDR_STATE', datos.get('prevEmpState', ''))
                
            if datos.get('prevEmpZipCodeNA'):
                await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_dtlPrevEmpl_ctl00_cbxPREV_EMPL_ADDR_POSTAL_CD_NA')
            else:
                await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_dtlPrevEmpl_ctl00_tbxPREV_EMPL_ADDR_POSTAL_CD', datos.get('prevEmpZipCode', ''))
                
            await safe_select(page, '#ctl00_SiteContentPlaceHolder_FormView1_dtlPrevEmpl_ctl00_DropDownList2', datos.get('prevEmpCountry', ''))
            await page.wait_for_load_state('networkidle')
            await page.wait_for_timeout(1000)
            
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_dtlPrevEmpl_ctl00_tbEmployerPhone', datos.get('prevEmpPhone', ''))
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_dtlPrevEmpl_ctl00_tbJobTitle', datos.get('prevEmpJobTitle', ''))
            
            if datos.get('prevEmpSupervisorSurnameNA'):
                await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_dtlPrevEmpl_ctl00_cbxSupervisorSurname_NA')
            else:
                await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_dtlPrevEmpl_ctl00_tbSupervisorSurname', datos.get('prevEmpSupervisorSurname', ''))
                
            if datos.get('prevEmpSupervisorGivenNameNA'):
                await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_dtlPrevEmpl_ctl00_cbxSupervisorGivenName_NA')
            else:
                await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_dtlPrevEmpl_ctl00_tbSupervisorGivenName', datos.get('prevEmpSupervisorGivenName', ''))
                
            s_day = str(datos.get('prevEmpStartDateDay', '1')).zfill(2)
            await safe_select(page, '#ctl00_SiteContentPlaceHolder_FormView1_dtlPrevEmpl_ctl00_ddlEmpDateFromDay', s_day if s_day != '00' else '')
            await safe_select(page, '#ctl00_SiteContentPlaceHolder_FormView1_dtlPrevEmpl_ctl00_ddlEmpDateFromMonth', str(datos.get('prevEmpStartDateMonth', '')))
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_dtlPrevEmpl_ctl00_tbxEmpDateFromYear', str(datos.get('prevEmpStartDateYear', '')))
            
            e_day = str(datos.get('prevEmpEndDateDay', '1')).zfill(2)
            await safe_select(page, '#ctl00_SiteContentPlaceHolder_FormView1_dtlPrevEmpl_ctl00_ddlEmpDateToDay', e_day if e_day != '00' else '')
            await safe_select(page, '#ctl00_SiteContentPlaceHolder_FormView1_dtlPrevEmpl_ctl00_ddlEmpDateToMonth', str(datos.get('prevEmpEndDateMonth', '')))
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_dtlPrevEmpl_ctl00_tbxEmpDateToYear', str(datos.get('prevEmpEndDateYear', '')))
            
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_dtlPrevEmpl_ctl00_tbDescribeDuties', datos.get('prevEmpDuties', ''))
        else:
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblPreviouslyEmployed_1')
            
        prev_educ = datos.get('prevEduc', 'N')
        if prev_educ == 'Y':
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblOtherEduc_0')
            await page.wait_for_selector('#ctl00_SiteContentPlaceHolder_FormView1_dtlPrevEduc_ctl00_tbxSchoolName', state='visible', timeout=10000)
            
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_dtlPrevEduc_ctl00_tbxSchoolName', datos.get('prevEducName', ''))
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_dtlPrevEduc_ctl00_tbxSchoolAddr1', datos.get('prevEducAddr1', ''))
            if datos.get('prevEducAddr2'):
                await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_dtlPrevEduc_ctl00_tbxSchoolAddr2', datos.get('prevEducAddr2', ''))
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_dtlPrevEduc_ctl00_tbxSchoolCity', datos.get('prevEducCity', ''))
            
            if datos.get('prevEducStateNA'):
                await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_dtlPrevEduc_ctl00_cbxEDUC_INST_ADDR_STATE_NA')
            else:
                await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_dtlPrevEduc_ctl00_tbxEDUC_INST_ADDR_STATE', datos.get('prevEducState', ''))
                
            if datos.get('prevEducZipCodeNA'):
                await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_dtlPrevEduc_ctl00_cbxEDUC_INST_POSTAL_CD_NA')
            else:
                await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_dtlPrevEduc_ctl00_tbxEDUC_INST_POSTAL_CD', datos.get('prevEducZipCode', ''))
                
            await safe_select(page, '#ctl00_SiteContentPlaceHolder_FormView1_dtlPrevEduc_ctl00_ddlSchoolCountry', datos.get('prevEducCountry', ''))
            await page.wait_for_load_state('networkidle')
            await page.wait_for_timeout(1000)
            
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_dtlPrevEduc_ctl00_tbxSchoolCourseOfStudy', datos.get('prevEducCourse', ''))
            
            s_day = str(datos.get('prevEducStartDateDay', '1')).zfill(2)
            await safe_select(page, '#ctl00_SiteContentPlaceHolder_FormView1_dtlPrevEduc_ctl00_ddlSchoolFromDay', s_day if s_day != '00' else '')
            await safe_select(page, '#ctl00_SiteContentPlaceHolder_FormView1_dtlPrevEduc_ctl00_ddlSchoolFromMonth', str(datos.get('prevEducStartDateMonth', '')))
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_dtlPrevEduc_ctl00_tbxSchoolFromYear', str(datos.get('prevEducStartDateYear', '')))
            
            e_day = str(datos.get('prevEducEndDateDay', '1')).zfill(2)
            await safe_select(page, '#ctl00_SiteContentPlaceHolder_FormView1_dtlPrevEduc_ctl00_ddlSchoolToDay', e_day if e_day != '00' else '')
            await safe_select(page, '#ctl00_SiteContentPlaceHolder_FormView1_dtlPrevEduc_ctl00_ddlSchoolToMonth', str(datos.get('prevEducEndDateMonth', '')))
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_dtlPrevEduc_ctl00_tbxSchoolToYear', str(datos.get('prevEducEndDateYear', '')))
        else:
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblOtherEduc_1')

        print("-> Previous Work/Education/Training completado.")

        print("-> Click en Next: Work/Education: Additional...")
        async with page.expect_navigation(wait_until='networkidle', timeout=30000):
            await page.evaluate("document.getElementById('ctl00_SiteContentPlaceHolder_UpdateButton3').click()")
        print("-> Llegamos a Work/Education: Additional")

        print("-> Esperando 2 minutos antes de cerrar el navegador...")
        await page.wait_for_timeout(120000)"""

content = content.replace(old_end_block, new_end_block)

with open('playwright_test.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated script with Previous Work block")
