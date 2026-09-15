with open('playwright_test.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace country
content = content.replace(
    "'#ctl00_SiteContentPlaceHolder_FormView1_ddlAPP_ADDR_CNTRY'",
    "'#ctl00_SiteContentPlaceHolder_FormView1_ddlCountry'"
)

# Replace mailing address radio
content = content.replace(
    "'#ctl00_SiteContentPlaceHolder_FormView1_rblAPP_MAIL_ADDR_SAME_IND_0'",
    "'#ctl00_SiteContentPlaceHolder_FormView1_rblMailingAddrSame_0'"
)
content = content.replace(
    "'#ctl00_SiteContentPlaceHolder_FormView1_rblAPP_MAIL_ADDR_SAME_IND_1'",
    "'#ctl00_SiteContentPlaceHolder_FormView1_rblMailingAddrSame_1'"
)

# Replace other phones radio
content = content.replace(
    "'#ctl00_SiteContentPlaceHolder_FormView1_rblAPP_OTHER_PHONES_IND_0'",
    "'#ctl00_SiteContentPlaceHolder_FormView1_rblAddPhone_0'"
)
content = content.replace(
    "'#ctl00_SiteContentPlaceHolder_FormView1_rblAPP_OTHER_PHONES_IND_1'",
    "'#ctl00_SiteContentPlaceHolder_FormView1_rblAddPhone_1'"
)

# Replace other emails radio
content = content.replace(
    "'#ctl00_SiteContentPlaceHolder_FormView1_rblAPP_OTHER_EMAIL_IND_0'",
    "'#ctl00_SiteContentPlaceHolder_FormView1_rblAddEmail_0'"
)
content = content.replace(
    "'#ctl00_SiteContentPlaceHolder_FormView1_rblAPP_OTHER_EMAIL_IND_1'",
    "'#ctl00_SiteContentPlaceHolder_FormView1_rblAddEmail_1'"
)

# Replace other social media radio
content = content.replace(
    "'#ctl00_SiteContentPlaceHolder_FormView1_rblAPP_OTHER_SOCIAL_MEDIA_IND_0'",
    "'#ctl00_SiteContentPlaceHolder_FormView1_rblAddSocial_0'"
)
content = content.replace(
    "'#ctl00_SiteContentPlaceHolder_FormView1_rblAPP_OTHER_SOCIAL_MEDIA_IND_1'",
    "'#ctl00_SiteContentPlaceHolder_FormView1_rblAddSocial_1'"
)

with open('playwright_test.py', 'w', encoding='utf-8') as f:
    f.write(content)
print('Address selectors patched successfully')
