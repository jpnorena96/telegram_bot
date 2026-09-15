with open('playwright_test.py', 'r', encoding='utf-8') as f:
    content = f.read()

old_end_block = """        print("-> Additional Work/Education/Training completado.")

        print("-> Click en Next: Security and Background...")
        async with page.expect_navigation(wait_until='networkidle', timeout=30000):
            await page.evaluate("document.getElementById('ctl00_SiteContentPlaceHolder_UpdateButton3').click()")
        print("-> Llegamos a Security and Background")

        print("-> Esperando 2 minutos antes de cerrar el navegador...")
        await page.wait_for_timeout(120000)"""

new_end_block = """        print("-> Additional Work/Education/Training completado.")

        print("-> Click en Next: Security and Background...")
        async with page.expect_navigation(wait_until='networkidle', timeout=30000):
            await page.evaluate("document.getElementById('ctl00_SiteContentPlaceHolder_UpdateButton3').click()")
        print("-> Llegamos a Security and Background")

        # ========== 29. SECURITY AND BACKGROUND: PART 1 ==========
        print("-> Rellenando Security and Background: Part 1...")
        await page.wait_for_selector('#ctl00_SiteContentPlaceHolder_FormView1_rblDisease_1', state='visible', timeout=15000)

        # Disease
        if datos.get('secDisease') == 'Y':
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblDisease_0')
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxDisease', datos.get('secDiseaseExplain', ''))
        else:
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblDisease_1')

        # Disorder
        if datos.get('secDisorder') == 'Y':
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblDisorder_0')
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxDisorder', datos.get('secDisorderExplain', ''))
        else:
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblDisorder_1')

        # Drug User
        if datos.get('secDruguser') == 'Y':
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblDruguser_0')
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxDruguser', datos.get('secDruguserExplain', ''))
        else:
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblDruguser_1')

        print("-> Security and Background: Part 1 completado.")

        print("-> Click en Next: Security/Background Part 2...")
        async with page.expect_navigation(wait_until='networkidle', timeout=30000):
            await page.evaluate("document.getElementById('ctl00_SiteContentPlaceHolder_UpdateButton3').click()")
        print("-> Llegamos a Security/Background Part 2")

        print("-> Esperando 2 minutos antes de cerrar el navegador...")
        await page.wait_for_timeout(120000)"""

content = content.replace(old_end_block, new_end_block)

with open('playwright_test.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated script with Security Part 1 block")
