with open('playwright_test.py', 'r', encoding='utf-8') as f:
    content = f.read()

old_end_block = """        print("-> Security and Background: Part 4 completado.")

        print("-> Click en Next: Security/Background Part 5...")
        async with page.expect_navigation(wait_until='networkidle', timeout=30000):
            await page.evaluate("document.getElementById('ctl00_SiteContentPlaceHolder_UpdateButton3').click()")
        print("-> Llegamos a Security/Background Part 5")

        print("-> Esperando 2 minutos antes de cerrar el navegador...")
        await page.wait_for_timeout(120000)"""

new_end_block = """        print("-> Security and Background: Part 4 completado.")

        print("-> Click en Next: Security/Background Part 5...")
        async with page.expect_navigation(wait_until='networkidle', timeout=30000):
            await page.evaluate("document.getElementById('ctl00_SiteContentPlaceHolder_UpdateButton3').click()")
        print("-> Llegamos a Security/Background Part 5")

        # ========== 33. SECURITY AND BACKGROUND: PART 5 ==========
        print("-> Rellenando Security and Background: Part 5...")
        await page.wait_for_selector('#ctl00_SiteContentPlaceHolder_FormView1_rblChildCustody_1', state='visible', timeout=15000)

        # Child Custody
        if datos.get('secChildCustody') == 'Y':
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblChildCustody_0')
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxChildCustody', datos.get('secChildCustodyExplain', ''))
        else:
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblChildCustody_1')

        # Voting Violation
        if datos.get('secVotingViolation') == 'Y':
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblVotingViolation_0')
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxVotingViolation', datos.get('secVotingViolationExplain', ''))
        else:
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblVotingViolation_1')

        # Renounce Citizenship for Tax
        if datos.get('secRenounceExp') == 'Y':
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblRenounceExp_0')
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxRenounceExp', datos.get('secRenounceExpExplain', ''))
        else:
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblRenounceExp_1')

        print("-> Security and Background: Part 5 completado.")

        print("-> Click en Next: PHOTO...")
        async with page.expect_navigation(wait_until='networkidle', timeout=30000):
            await page.evaluate("document.getElementById('ctl00_SiteContentPlaceHolder_UpdateButton3').click()")
        print("-> Llegamos a PHOTO")

        print("-> Esperando 2 minutos antes de cerrar el navegador...")
        await page.wait_for_timeout(120000)"""

content = content.replace(old_end_block, new_end_block)

with open('playwright_test.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated script with Security Part 5 block")
