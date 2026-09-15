with open('playwright_test.py', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    "'#ctl00_SiteContentPlaceHolder_FormView1_ddlSpecificTravelArrivalDay'",
    "'#ctl00_SiteContentPlaceHolder_FormView1_ddlARRIVAL_US_DTEDay'"
)
content = content.replace(
    "'#ctl00_SiteContentPlaceHolder_FormView1_ddlSpecificTravelArrivalMonth'",
    "'#ctl00_SiteContentPlaceHolder_FormView1_ddlARRIVAL_US_DTEMonth'"
)
content = content.replace(
    "'#ctl00_SiteContentPlaceHolder_FormView1_tbxSpecificTravelArrivalYear'",
    "'#ctl00_SiteContentPlaceHolder_FormView1_tbxARRIVAL_US_DTEYear'"
)
content = content.replace(
    "'#ctl00_SiteContentPlaceHolder_FormView1_tbxSpecificTravelArrivalFlight'",
    "'#ctl00_SiteContentPlaceHolder_FormView1_tbxArriveFlight'"
)
content = content.replace(
    "'#ctl00_SiteContentPlaceHolder_FormView1_tbxSpecificTravelArrivalCity'",
    "'#ctl00_SiteContentPlaceHolder_FormView1_tbxArriveCity'"
)

content = content.replace(
    "'#ctl00_SiteContentPlaceHolder_FormView1_ddlSpecificTravelDepartDay'",
    "'#ctl00_SiteContentPlaceHolder_FormView1_ddlDEPARTURE_US_DTEDay'"
)
content = content.replace(
    "'#ctl00_SiteContentPlaceHolder_FormView1_ddlSpecificTravelDepartMonth'",
    "'#ctl00_SiteContentPlaceHolder_FormView1_ddlDEPARTURE_US_DTEMonth'"
)
content = content.replace(
    "'#ctl00_SiteContentPlaceHolder_FormView1_tbxSpecificTravelDepartYear'",
    "'#ctl00_SiteContentPlaceHolder_FormView1_tbxDEPARTURE_US_DTEYear'"
)
content = content.replace(
    "'#ctl00_SiteContentPlaceHolder_FormView1_tbxSpecificTravelDepartFlight'",
    "'#ctl00_SiteContentPlaceHolder_FormView1_tbxDepartFlight'"
)
content = content.replace(
    "'#ctl00_SiteContentPlaceHolder_FormView1_tbxSpecificTravelDepartCity'",
    "'#ctl00_SiteContentPlaceHolder_FormView1_tbxDepartCity'"
)

content = content.replace(
    "'#ctl00_SiteContentPlaceHolder_FormView1_dlSpecificTravelLocation_ctl00_tbxSpecificTravelLocation'",
    "'#ctl00_SiteContentPlaceHolder_FormView1_dtlTravelLoc_ctl00_tbxSPECTRAVEL_LOCATION'"
)

with open('playwright_test.py', 'w', encoding='utf-8') as f:
    f.write(content)
print('Travel patched successfully')
