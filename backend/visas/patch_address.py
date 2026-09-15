import re

with open('playwright_test.py', 'r', encoding='utf-8') as f:
    content = f.read()

old_country = "await page.select_option('#ctl00_SiteContentPlaceHolder_FormView1_ddlAPP_ADDR_CNTRY', datos.get('homeCountry', 'MEX'))"
new_country = """await page.select_option('#ctl00_SiteContentPlaceHolder_FormView1_ddlAPP_ADDR_CNTRY', datos.get('homeCountry', 'MEX'))
        await page.wait_for_load_state('networkidle')
        await page.wait_for_timeout(800)"""
content = content.replace(old_country, new_country)

old_same_mail = """        if datos.get('sameMailingAddress') == 'Y':
            await page.click('#ctl00_SiteContentPlaceHolder_FormView1_rblAPP_MAIL_ADDR_SAME_IND_0') # Yes
        else:
            await page.click('#ctl00_SiteContentPlaceHolder_FormView1_rblAPP_MAIL_ADDR_SAME_IND_1') # No
            await page.wait_for_timeout(800)"""
new_same_mail = """        if datos.get('sameMailingAddress') == 'Y':
            await page.click('#ctl00_SiteContentPlaceHolder_FormView1_rblAPP_MAIL_ADDR_SAME_IND_0') # Yes
            await page.wait_for_timeout(800)
        else:
            await page.click('#ctl00_SiteContentPlaceHolder_FormView1_rblAPP_MAIL_ADDR_SAME_IND_1') # No
            await page.wait_for_timeout(800)"""
content = content.replace(old_same_mail, new_same_mail)

with open('playwright_test.py', 'w', encoding='utf-8') as f:
    f.write(content)
print('Patched country and mailing address properly')
