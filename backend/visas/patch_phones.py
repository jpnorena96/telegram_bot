import re

with open('playwright_test.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Add other phones question after work phone
old_work_phone = """        if datos.get('workPhoneNA'):
            await page.check('#ctl00_SiteContentPlaceHolder_FormView1_cbxAPP_BUS_TEL_NA')
        else:
            await page.fill('#ctl00_SiteContentPlaceHolder_FormView1_tbxAPP_BUS_TEL', datos.get('workPhone', ''))"""

new_work_phone = """        if datos.get('workPhoneNA'):
            await page.check('#ctl00_SiteContentPlaceHolder_FormView1_cbxAPP_BUS_TEL_NA')
        else:
            await page.fill('#ctl00_SiteContentPlaceHolder_FormView1_tbxAPP_BUS_TEL', datos.get('workPhone', ''))
            
        # Have you used any other telephone numbers in the last five years?
        if datos.get('otherPhones') == 'Y':
            await page.click('#ctl00_SiteContentPlaceHolder_FormView1_rblAPP_OTHER_PHONES_IND_0')
            await page.wait_for_timeout(800)
        else:
            await page.click('#ctl00_SiteContentPlaceHolder_FormView1_rblAPP_OTHER_PHONES_IND_1')
            await page.wait_for_timeout(300)"""
            
content = content.replace(old_work_phone, new_work_phone)

with open('playwright_test.py', 'w', encoding='utf-8') as f:
    f.write(content)
print('Patched other phones successfully')
