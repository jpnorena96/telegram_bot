with open('playwright_test.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix postback after Passport Type
old_type = "await safe_select(page, '#ctl00_SiteContentPlaceHolder_FormView1_ddlPPT_TYPE', datos.get('passportType', 'R'))"
new_type = """await safe_select(page, '#ctl00_SiteContentPlaceHolder_FormView1_ddlPPT_TYPE', datos.get('passportType', 'R'))
        await page.wait_for_load_state('networkidle')
        await page.wait_for_timeout(800)"""
content = content.replace(old_type, new_type)

# Fix Book Number NA
content = content.replace('cbxPPT_BOOK_NUM_NA', 'cbexPPT_BOOK_NUM_NA')

# Fix Issued Year
content = content.replace('tbxPPT_ISSUED_Year', 'tbxPPT_ISSUED_DTEYear')

# Fix Expire Year
content = content.replace('tbxPPT_EXPIREYear', 'tbxPPT_EXPIRE_DTEYear')

# Fix Lost Passport radio
old_lost = """        if datos.get('lostPassport') == 'Y':
            await page.click('#ctl00_SiteContentPlaceHolder_FormView1_rblLOST_PPT_IND_0')
        else:
            await page.click('#ctl00_SiteContentPlaceHolder_FormView1_rblLOST_PPT_IND_1')"""
new_lost = """        if datos.get('lostPassport') == 'Y':
            await page.evaluate("document.getElementById('ctl00_SiteContentPlaceHolder_FormView1_rblLOST_PPT_IND_0').click()")
        else:
            await page.evaluate("document.getElementById('ctl00_SiteContentPlaceHolder_FormView1_rblLOST_PPT_IND_1').click()")"""
content = content.replace(old_lost, new_lost)

with open('playwright_test.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("Passport patched successfully")
