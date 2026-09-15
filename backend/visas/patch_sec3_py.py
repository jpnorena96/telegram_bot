with open('playwright_test.py', 'r', encoding='utf-8') as f:
    content = f.read()

old_end_block = """        print("-> Security and Background: Part 2 completado.")

        print("-> Click en Next: Security/Background Part 3...")
        async with page.expect_navigation(wait_until='networkidle', timeout=30000):
            await page.evaluate("document.getElementById('ctl00_SiteContentPlaceHolder_UpdateButton3').click()")
        print("-> Llegamos a Security/Background Part 3")

        print("-> Esperando 2 minutos antes de cerrar el navegador...")
        await page.wait_for_timeout(120000)"""

new_end_block = """        print("-> Security and Background: Part 2 completado.")

        print("-> Click en Next: Security/Background Part 3...")
        async with page.expect_navigation(wait_until='networkidle', timeout=30000):
            await page.evaluate("document.getElementById('ctl00_SiteContentPlaceHolder_UpdateButton3').click()")
        print("-> Llegamos a Security/Background Part 3")

        # ========== 31. SECURITY AND BACKGROUND: PART 3 ==========
        print("-> Rellenando Security and Background: Part 3...")
        await page.wait_for_selector('#ctl00_SiteContentPlaceHolder_FormView1_rblIllegalActivity_1', state='visible', timeout=15000)

        # Illegal Activity
        if datos.get('secIllegalActivity') == 'Y':
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblIllegalActivity_0')
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxIllegalActivity', datos.get('secIllegalActivityExplain', ''))
        else:
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblIllegalActivity_1')

        # Terrorist Activity
        if datos.get('secTerroristActivity') == 'Y':
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblTerroristActivity_0')
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxTerroristActivity', datos.get('secTerroristActivityExplain', ''))
        else:
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblTerroristActivity_1')

        # Terrorist Support
        if datos.get('secTerroristSupport') == 'Y':
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblTerroristSupport_0')
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxTerroristSupport', datos.get('secTerroristSupportExplain', ''))
        else:
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblTerroristSupport_1')

        # Terrorist Org
        if datos.get('secTerroristOrg') == 'Y':
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblTerroristOrg_0')
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxTerroristOrg', datos.get('secTerroristOrgExplain', ''))
        else:
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblTerroristOrg_1')

        # Terrorist Rel
        if datos.get('secTerroristRel') == 'Y':
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblTerroristRel_0')
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxTerroristRel', datos.get('secTerroristRelExplain', ''))
        else:
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblTerroristRel_1')

        # Genocide
        if datos.get('secGenocide') == 'Y':
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblGenocide_0')
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxGenocide', datos.get('secGenocideExplain', ''))
        else:
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblGenocide_1')

        # Torture
        if datos.get('secTorture') == 'Y':
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblTorture_0')
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxTorture', datos.get('secTortureExplain', ''))
        else:
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblTorture_1')

        # ExViolence
        if datos.get('secExViolence') == 'Y':
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblExViolence_0')
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxExViolence', datos.get('secExViolenceExplain', ''))
        else:
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblExViolence_1')

        # Child Soldier
        if datos.get('secChildSoldier') == 'Y':
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblChildSoldier_0')
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxChildSoldier', datos.get('secChildSoldierExplain', ''))
        else:
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblChildSoldier_1')

        # Religious Freedom
        if datos.get('secReligiousFreedom') == 'Y':
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblReligiousFreedom_0')
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxReligiousFreedom', datos.get('secReligiousFreedomExplain', ''))
        else:
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblReligiousFreedom_1')

        # Population Controls
        if datos.get('secPopulationControls') == 'Y':
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblPopulationControls_0')
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxPopulationControls', datos.get('secPopulationControlsExplain', ''))
        else:
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblPopulationControls_1')

        # Transplant
        if datos.get('secTransplant') == 'Y':
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblTransplant_0')
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxTransplant', datos.get('secTransplantExplain', ''))
        else:
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblTransplant_1')

        print("-> Security and Background: Part 3 completado.")

        print("-> Click en Next: Security/Background Part 4...")
        async with page.expect_navigation(wait_until='networkidle', timeout=30000):
            await page.evaluate("document.getElementById('ctl00_SiteContentPlaceHolder_UpdateButton3').click()")
        print("-> Llegamos a Security/Background Part 4")

        print("-> Esperando 2 minutos antes de cerrar el navegador...")
        await page.wait_for_timeout(120000)"""

content = content.replace(old_end_block, new_end_block)

with open('playwright_test.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated script with Security Part 3 block")
