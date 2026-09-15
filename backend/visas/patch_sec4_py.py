with open('playwright_test.py', 'r', encoding='utf-8') as f:
    content = f.read()

old_end_block = """        print("-> Security and Background: Part 3 completado.")

        print("-> Click en Next: Security/Background Part 4...")
        async with page.expect_navigation(wait_until='networkidle', timeout=30000):
            await page.evaluate("document.getElementById('ctl00_SiteContentPlaceHolder_UpdateButton3').click()")
        print("-> Llegamos a Security/Background Part 4")

        print("-> Esperando 2 minutos antes de cerrar el navegador...")
        await page.wait_for_timeout(120000)"""

new_end_block = """        print("-> Security and Background: Part 3 completado.")

        print("-> Click en Next: Security/Background Part 4...")
        async with page.expect_navigation(wait_until='networkidle', timeout=30000):
            await page.evaluate("document.getElementById('ctl00_SiteContentPlaceHolder_UpdateButton3').click()")
        print("-> Llegamos a Security/Background Part 4")

        # ========== 32. SECURITY AND BACKGROUND: PART 4 ==========
        print("-> Rellenando Security and Background: Part 4...")
        await page.wait_for_selector('#ctl00_SiteContentPlaceHolder_FormView1_rblImmigrationFraud_1', state='visible', timeout=15000)

        # Immigration Fraud
        if datos.get('secImmigrationFraud') == 'Y':
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblImmigrationFraud_0')
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxImmigrationFraud', datos.get('secImmigrationFraudExplain', ''))
        else:
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblImmigrationFraud_1')

        # Deport
        if datos.get('secDeport') == 'Y':
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblDeport_0')
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxDeport_EXPL', datos.get('secDeportExplain', ''))
        else:
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblDeport_1')

        print("-> Security and Background: Part 4 completado.")

        print("-> Click en Next: Security/Background Part 5...")
        async with page.expect_navigation(wait_until='networkidle', timeout=30000):
            await page.evaluate("document.getElementById('ctl00_SiteContentPlaceHolder_UpdateButton3').click()")
        print("-> Llegamos a Security/Background Part 5")

        print("-> Esperando 2 minutos antes de cerrar el navegador...")
        await page.wait_for_timeout(120000)"""

content = content.replace(old_end_block, new_end_block)

with open('playwright_test.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated script with Security Part 4 block")
