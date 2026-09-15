with open('playwright_test.py', 'r', encoding='utf-8') as f:
    content = f.read()

old_end_block = """        print("-> Previous Work/Education/Training completado.")

        print("-> Click en Next: Work/Education: Additional...")
        async with page.expect_navigation(wait_until='networkidle', timeout=30000):
            await page.evaluate("document.getElementById('ctl00_SiteContentPlaceHolder_UpdateButton3').click()")
        print("-> Llegamos a Work/Education: Additional")

        print("-> Esperando 2 minutos antes de cerrar el navegador...")
        await page.wait_for_timeout(120000)"""

new_end_block = """        print("-> Previous Work/Education/Training completado.")

        print("-> Click en Next: Work/Education: Additional...")
        async with page.expect_navigation(wait_until='networkidle', timeout=30000):
            await page.evaluate("document.getElementById('ctl00_SiteContentPlaceHolder_UpdateButton3').click()")
        print("-> Llegamos a Work/Education: Additional")

        # ========== 28. ADDITIONAL WORK/EDUCATION/TRAINING ==========
        print("-> Rellenando Additional Work/Education/Training...")
        await page.wait_for_selector('#ctl00_SiteContentPlaceHolder_FormView1_rblCLAN_TRIBE_IND_1', state='visible', timeout=15000)

        # Clan/Tribe
        if datos.get('clanTribe') == 'Y':
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblCLAN_TRIBE_IND_0')
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxCLAN_TRIBE_NAME', datos.get('clanTribeName', ''))
        else:
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblCLAN_TRIBE_IND_1')

        # Languages
        if datos.get('language1'):
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_dtlLANGUAGES_ctl00_tbxLANGUAGE_NAME', datos.get('language1', ''))
            if datos.get('language2'):
                # Assuming standard 'Add Another' handling might be needed in real code if ctl01 is not visible by default,
                # but based on provided HTML, it seems both fields are there or JS adds them.
                # If ctl01 fails, we might need to click Add Another. For now, try to fill it safely.
                try:
                    await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_dtlLANGUAGES_ctl01_tbxLANGUAGE_NAME', datos.get('language2', ''))
                except:
                    pass

        # Countries Visited
        if datos.get('countriesVisited') == 'Y':
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblCOUNTRIES_VISITED_IND_0')
            await safe_select(page, '#ctl00_SiteContentPlaceHolder_FormView1_dtlCountriesVisited_ctl00_ddlCOUNTRIES_VISITED', datos.get('countryVisited1', ''))
        else:
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblCOUNTRIES_VISITED_IND_1')

        # Organizations
        if datos.get('organizations') == 'Y':
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblORGANIZATION_IND_0')
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_dtlORGANIZATIONS_ctl00_tbxORGANIZATION_NAME', datos.get('organization1', ''))
        else:
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblORGANIZATION_IND_1')

        # Specialized Skills
        if datos.get('specializedSkills') == 'Y':
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblSPECIALIZED_SKILLS_IND_0')
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxSPECIALIZED_SKILLS_EXPL', datos.get('specializedSkillsExplain', ''))
        else:
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblSPECIALIZED_SKILLS_IND_1')

        # Military Service
        if datos.get('militaryService') == 'Y':
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblMILITARY_SERVICE_IND_0')
            await safe_select(page, '#ctl00_SiteContentPlaceHolder_FormView1_dtlMILITARY_SERVICE_ctl00_ddlMILITARY_SVC_CNTRY', datos.get('militaryCountry', ''))
            await page.wait_for_load_state('networkidle')
            await page.wait_for_timeout(1000)
            
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_dtlMILITARY_SERVICE_ctl00_tbxMILITARY_SVC_BRANCH', datos.get('militaryBranch', ''))
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_dtlMILITARY_SERVICE_ctl00_tbxMILITARY_SVC_RANK', datos.get('militaryRank', ''))
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_dtlMILITARY_SERVICE_ctl00_tbxMILITARY_SVC_SPECIALTY', datos.get('militarySpecialty', ''))
            
            s_day = str(datos.get('militaryStartDateDay', '1')).zfill(2)
            await safe_select(page, '#ctl00_SiteContentPlaceHolder_FormView1_dtlMILITARY_SERVICE_ctl00_ddlMILITARY_SVC_FROMDay', s_day if s_day != '00' else '')
            await safe_select(page, '#ctl00_SiteContentPlaceHolder_FormView1_dtlMILITARY_SERVICE_ctl00_ddlMILITARY_SVC_FROMMonth', str(datos.get('militaryStartDateMonth', '')))
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_dtlMILITARY_SERVICE_ctl00_tbxMILITARY_SVC_FROMYear', str(datos.get('militaryStartDateYear', '')))
            
            e_day = str(datos.get('militaryEndDateDay', '1')).zfill(2)
            await safe_select(page, '#ctl00_SiteContentPlaceHolder_FormView1_dtlMILITARY_SERVICE_ctl00_ddlMILITARY_SVC_TODay', e_day if e_day != '00' else '')
            await safe_select(page, '#ctl00_SiteContentPlaceHolder_FormView1_dtlMILITARY_SERVICE_ctl00_ddlMILITARY_SVC_TOMonth', str(datos.get('militaryEndDateMonth', '')))
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_dtlMILITARY_SERVICE_ctl00_tbxMILITARY_SVC_TOYear', str(datos.get('militaryEndDateYear', '')))
        else:
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblMILITARY_SERVICE_IND_1')

        # Insurgent Org
        if datos.get('insurgentOrg') == 'Y':
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblINSURGENT_ORG_IND_0')
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxINSURGENT_ORG_EXPL', datos.get('insurgentOrgExplain', ''))
        else:
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblINSURGENT_ORG_IND_1')

        print("-> Additional Work/Education/Training completado.")

        print("-> Click en Next: Security and Background...")
        async with page.expect_navigation(wait_until='networkidle', timeout=30000):
            await page.evaluate("document.getElementById('ctl00_SiteContentPlaceHolder_UpdateButton3').click()")
        print("-> Llegamos a Security and Background")

        print("-> Esperando 2 minutos antes de cerrar el navegador...")
        await page.wait_for_timeout(120000)"""

content = content.replace(old_end_block, new_end_block)

with open('playwright_test.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated script with Additional Work block")
