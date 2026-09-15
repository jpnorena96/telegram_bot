with open('playwright_test.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix checkboxes
content = content.replace('cbxAPP_ADDR_STATE_NA', 'cbexAPP_ADDR_STATE_NA')
content = content.replace('cbxAPP_ADDR_POSTAL_CD_NA', 'cbexAPP_ADDR_POSTAL_CD_NA')
content = content.replace('cbxAPP_MOBILE_TEL_NA', 'cbexAPP_MOBILE_TEL_NA')
content = content.replace('cbxAPP_BUS_TEL_NA', 'cbexAPP_BUS_TEL_NA')

# Fix Social Media
content = content.replace(
    "'#ctl00_SiteContentPlaceHolder_FormView1_dlSocialMedia_ctl00_ddlPLATFORM'",
    "'#ctl00_SiteContentPlaceHolder_FormView1_dtlSocial_ctl00_ddlSocialMedia'"
)
content = content.replace(
    "'#ctl00_SiteContentPlaceHolder_FormView1_dlSocialMedia_ctl00_tbxSOCIAL_MEDIA_ID'",
    "'#ctl00_SiteContentPlaceHolder_FormView1_dtlSocial_ctl00_tbxSocialMediaIdent'"
)

with open('playwright_test.py', 'w', encoding='utf-8') as f:
    f.write(content)

print('Patched checkboxes and social media')
