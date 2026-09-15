import json

# Update datos.json
with open('datos.json', 'r', encoding='utf-8') as f:
    datos = json.load(f)

if 'otherRelatives' not in datos:
    datos['otherRelatives'] = 'N'

with open('datos.json', 'w', encoding='utf-8') as f:
    json.dump(datos, f, indent=2)

# Update playwright_test.py
with open('playwright_test.py', 'r', encoding='utf-8') as f:
    content = f.read()

old_relative_block = "        rel_in_us_id = 'ctl00_SiteContentPlaceHolder_FormView1_rblUS_IMMED_RELATIVE_IND_0' if datos.get('immediateRelatives') == 'Y' else 'ctl00_SiteContentPlaceHolder_FormView1_rblUS_IMMED_RELATIVE_IND_1'\n        await page.evaluate(f\"if (document.getElementById('{rel_in_us_id}')) document.getElementById('{rel_in_us_id}').click()\")"

new_relative_block = """        rel_in_us_id = 'ctl00_SiteContentPlaceHolder_FormView1_rblUS_IMMED_RELATIVE_IND_0' if datos.get('immediateRelatives') == 'Y' else 'ctl00_SiteContentPlaceHolder_FormView1_rblUS_IMMED_RELATIVE_IND_1'
        await page.evaluate(f"if (document.getElementById('{rel_in_us_id}')) document.getElementById('{rel_in_us_id}').click()")
        await page.wait_for_timeout(500)

        other_rel_id = 'ctl00_SiteContentPlaceHolder_FormView1_rblUS_OTHER_RELATIVE_IND_0' if datos.get('otherRelatives') == 'Y' else 'ctl00_SiteContentPlaceHolder_FormView1_rblUS_OTHER_RELATIVE_IND_1'
        await page.evaluate(f"if (document.getElementById('{other_rel_id}')) document.getElementById('{other_rel_id}').click()")
        await page.wait_for_timeout(500)
"""

content = content.replace(old_relative_block, new_relative_block)

old_end_block = """        print("-> Family completado.")

        print("-> Esperando 2 minutos antes de cerrar el navegador...")
        await page.wait_for_timeout(120000)"""

new_end_block = """        print("-> Family completado.")

        print("-> Click en Next: Work/Education/Training...")
        async with page.expect_navigation(wait_until='networkidle', timeout=30000):
            await page.evaluate("document.getElementById('ctl00_SiteContentPlaceHolder_UpdateButton3').click()")
        print("-> Llegamos a Work/Education/Training")

        print("-> Esperando 2 minutos antes de cerrar el navegador...")
        await page.wait_for_timeout(120000)"""

content = content.replace(old_end_block, new_end_block)

with open('playwright_test.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("Added otherRelatives and Next button click")
