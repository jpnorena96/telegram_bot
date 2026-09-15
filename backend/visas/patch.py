with open('playwright_test.py', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    "datos.get('surnames', '')",
    "datos.get('surnames', datos.get('surname', ''))"
)
content = content.replace(
    "datos.get('givenNames', '')",
    "datos.get('givenNames', datos.get('givenName', ''))"
)

old_pob = "await page.fill('#ctl00_SiteContentPlaceHolder_FormView1_tbxAPP_POB_ST_PROVINCE', datos.get('pobState', ''))"
new_pob = """if datos.get('pobStateNA'):
            await page.check('#ctl00_SiteContentPlaceHolder_FormView1_cbexAPP_POB_ST_PROVINCE_NA')
            await page.wait_for_timeout(300)
        else:
            await page.fill('#ctl00_SiteContentPlaceHolder_FormView1_tbxAPP_POB_ST_PROVINCE', datos.get('pobState', ''))"""
content = content.replace(old_pob, new_pob)

with open('playwright_test.py', 'w', encoding='utf-8') as f:
    f.write(content)
print('Patched successfully')
