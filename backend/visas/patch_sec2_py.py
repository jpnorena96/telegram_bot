with open('playwright_test.py', 'r', encoding='utf-8') as f:
    content = f.read()

old_end_block = """        print("-> Security and Background: Part 1 completado.")

        print("-> Click en Next: Security/Background Part 2...")
        async with page.expect_navigation(wait_until='networkidle', timeout=30000):
            await page.evaluate("document.getElementById('ctl00_SiteContentPlaceHolder_UpdateButton3').click()")
        print("-> Llegamos a Security/Background Part 2")

        print("-> Esperando 2 minutos antes de cerrar el navegador...")
        await page.wait_for_timeout(120000)"""

new_end_block = """        print("-> Security and Background: Part 1 completado.")

        print("-> Click en Next: Security/Background Part 2...")
        async with page.expect_navigation(wait_until='networkidle', timeout=30000):
            await page.evaluate("document.getElementById('ctl00_SiteContentPlaceHolder_UpdateButton3').click()")
        print("-> Llegamos a Security/Background Part 2")

        # ========== 30. SECURITY AND BACKGROUND: PART 2 ==========
        print("-> Rellenando Security and Background: Part 2...")
        await page.wait_for_selector('#ctl00_SiteContentPlaceHolder_FormView1_rblArrested_1', state='visible', timeout=15000)

        # Arrested
        if datos.get('secArrested') == 'Y':
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblArrested_0')
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxArrested', datos.get('secArrestedExplain', ''))
        else:
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblArrested_1')

        # Controlled Substances
        if datos.get('secControlledSubstances') == 'Y':
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblControlledSubstances_0')
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxControlledSubstances', datos.get('secControlledSubstancesExplain', ''))
        else:
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblControlledSubstances_1')

        # Prostitution
        if datos.get('secProstitution') == 'Y':
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblProstitution_0')
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxProstitution', datos.get('secProstitutionExplain', ''))
        else:
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblProstitution_1')

        # Money Laundering
        if datos.get('secMoneyLaundering') == 'Y':
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblMoneyLaundering_0')
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxMoneyLaundering', datos.get('secMoneyLaunderingExplain', ''))
        else:
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblMoneyLaundering_1')

        # Human Trafficking
        if datos.get('secHumanTrafficking') == 'Y':
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblHumanTrafficking_0')
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxHumanTrafficking', datos.get('secHumanTraffickingExplain', ''))
        else:
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblHumanTrafficking_1')

        # Assisted Severe Trafficking
        if datos.get('secAssistedSevereTrafficking') == 'Y':
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblAssistedSevereTrafficking_0')
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxAssistedSevereTrafficking', datos.get('secAssistedSevereTraffickingExplain', ''))
        else:
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblAssistedSevereTrafficking_1')

        # Human Trafficking Related
        if datos.get('secHumanTraffickingRelated') == 'Y':
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblHumanTraffickingRelated_0')
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxHumanTraffickingRelated', datos.get('secHumanTraffickingRelatedExplain', ''))
        else:
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblHumanTraffickingRelated_1')

        print("-> Security and Background: Part 2 completado.")

        print("-> Click en Next: Security/Background Part 3...")
        async with page.expect_navigation(wait_until='networkidle', timeout=30000):
            await page.evaluate("document.getElementById('ctl00_SiteContentPlaceHolder_UpdateButton3').click()")
        print("-> Llegamos a Security/Background Part 3")

        print("-> Esperando 2 minutos antes de cerrar el navegador...")
        await page.wait_for_timeout(120000)"""

content = content.replace(old_end_block, new_end_block)

with open('playwright_test.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated script with Security Part 2 block")
