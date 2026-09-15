import asyncio
import random
import json
from camoufox.async_api import AsyncCamoufox
from twocaptcha import TwoCaptcha
import base64

API_KEY = "d89167f7b2b7e07e5ae1927c94790af8"

SECURITY_QUESTIONS = [
    {"value": "1", "answer": "Maria"},
    {"value": "2", "answer": "Jose"},
    {"value": "3", "answer": "Garcia"},
    {"value": "4", "answer": "Pepe"},
    {"value": "6", "answer": "Carlos"},
]


async def safe_fill(page, selector, value):
    try:
        if value:
            await page.fill(selector, str(value))
    except Exception as e:
        print(f"Warning: Could not fill {selector} - {e}")

async def safe_select(page, selector, value):
    try:
        if value:
            await page.select_option(selector, str(value))
    except Exception as e:
        print(f"Warning: Could not select {selector} - {e}")

async def safe_check(page, selector):
    try:
        await page.check(selector)
    except Exception as e:
        print(f"Warning: Could not check {selector} - {e}")

async def run():
    with open('datos.json', 'r', encoding='utf-8') as f:
        datos = json.load(f)

    solver = TwoCaptcha(API_KEY)

    async with AsyncCamoufox(
        headless=False,
        humanize=True,
        os="windows",
    ) as browser:
        page = await browser.new_page()

        # ========== 1. INICIO ==========
        print("ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ Navegando a CEAC...")
        await page.goto('https://ceac.state.gov/genniv/', wait_until='networkidle', timeout=60000)

        # ========== 2. SELECCIONAR BGT ==========
        print("ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ Seleccionando BGT...")
        await page.select_option(
            'select[name="ctl00$SiteContentPlaceHolder$ucLocation$ddlLocation"]',
            'BGT'
        )
        await page.wait_for_timeout(2000)

        # ========== 3. CERRAR POPUP ==========
        print("ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ Cerrando popup (Close)...")
        try:
            close_btn = await page.wait_for_selector(
                '#ctl00_SiteContentPlaceHolder_ucPostMessage_ucPost_ctl01_lnkClose',
                timeout=8000
            )
            await close_btn.click()
            print("   ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¦ Close clickeado")
            await page.wait_for_timeout(1500)
        except:
            print("   ÃƒÂ¢Ã…Â¡Ã‚Â ÃƒÂ¯Ã‚Â¸Ã‚Â No apareciÃƒÆ’Ã‚Â³ el botÃƒÆ’Ã‚Â³n Close")

        # ========== 4. CAPTURAR + RESOLVER CAPTCHA ==========
        print("ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ Capturando CAPTCHA...")
        await page.wait_for_selector('img[id*="CaptchaImage"]', timeout=10000)
        captcha_element = await page.query_selector('img[id*="CaptchaImage"]')
        captcha_bytes = await captcha_element.screenshot()
        
        with open("captcha.png", "wb") as f:
            f.write(captcha_bytes)

        print("ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ Enviando a 2Captcha...")
        try:
            captcha_b64 = base64.b64encode(captcha_bytes).decode('utf-8')
            result = solver.normal(captcha_b64)
            captcha_text = result['code'].strip().upper()
            print(f"   ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¦ CAPTCHA resuelto: {captcha_text}")
        except Exception as e:
            print(f"ÃƒÂ¢Ã‚ÂÃ…â€™ Error 2Captcha: {e}")
            return

        await page.fill(
            'input[name="ctl00$SiteContentPlaceHolder$ucLocation$IdentifyCaptcha1$txtCodeTextBox"]',
            captcha_text
        )
        await page.wait_for_timeout(500)

        # ========== 5. START AN APPLICATION ==========
        print("ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ Click en START AN APPLICATION...")
        async with page.expect_navigation(wait_until='networkidle', timeout=30000):
            await page.click('#ctl00_SiteContentPlaceHolder_lnkNew')

        # ========== 6. ACEPTAR TÃƒÆ’Ã¢â‚¬Â°RMINOS ==========
        print("ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ Aceptando tÃƒÆ’Ã‚Â©rminos (Privacy Act)...")
        try:
            checkbox = await page.wait_for_selector(
                '#ctl00_SiteContentPlaceHolder_chkbxPrivacyAct', timeout=8000
            )
            if not await checkbox.is_checked():
                await checkbox.click()
            else:
                await checkbox.click()
                await page.wait_for_timeout(200)
                await checkbox.click()
            await page.wait_for_timeout(800)
            print("   ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¦ TÃƒÆ’Ã‚Â©rminos aceptados")
        except Exception as e:
            print(f"   ÃƒÂ¢Ã…Â¡Ã‚Â ÃƒÂ¯Ã‚Â¸Ã‚Â Error con checkbox: {e}")

        # ========== 7. PREGUNTA DE SEGURIDAD ==========
        print("ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ Rellenando pregunta de seguridad...")
        await page.evaluate('''() => {
            const select = document.getElementById("ctl00_SiteContentPlaceHolder_ddlQuestions");
            if (select) select.disabled = false;
            const input = document.getElementById("ctl00_SiteContentPlaceHolder_txtAnswer");
            if (input) input.disabled = false;
        }''')

        chosen = random.choice(SECURITY_QUESTIONS)
        await page.select_option('#ctl00_SiteContentPlaceHolder_ddlQuestions', chosen['value'])
        await page.wait_for_timeout(500)
        await page.fill('#ctl00_SiteContentPlaceHolder_txtAnswer', chosen['answer'])
        print(f"   ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¦ Pregunta: {chosen['value']} ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ {chosen['answer']}")
        await page.wait_for_timeout(500)

        # ========== 8. CONTINUE ==========
        print("ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ Click en Continue...")
        async with page.expect_navigation(wait_until='networkidle', timeout=30000):
            await page.click('#ctl00_SiteContentPlaceHolder_btnContinue')

        # ========== 9. PERSONAL INFORMATION 1 ==========
        print("ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ Rellenando Personal Information 1...")

        await page.fill('#ctl00_SiteContentPlaceHolder_FormView1_tbxAPP_SURNAME', datos.get('surnames', datos.get('surname', '')))
        await page.fill('#ctl00_SiteContentPlaceHolder_FormView1_tbxAPP_GIVEN_NAME', datos.get('givenNames', datos.get('givenName', '')))

        if datos.get('nativeName') == 'NA':
            await page.check('#ctl00_SiteContentPlaceHolder_FormView1_cbexAPP_FULL_NAME_NATIVE_NA')
        else:
            await page.fill('#ctl00_SiteContentPlaceHolder_FormView1_tbxAPP_FULL_NAME_NATIVE', datos.get('nativeNameText', ''))
        await page.wait_for_timeout(300)

        if datos.get('otherNames') == 'Y':
            await page.click('#ctl00_SiteContentPlaceHolder_FormView1_rblOtherNames_0')
        else:
            await page.click('#ctl00_SiteContentPlaceHolder_FormView1_rblOtherNames_1')
        await page.wait_for_timeout(400)

        if datos.get('telecode') == 'Y':
            await page.click('#ctl00_SiteContentPlaceHolder_FormView1_rblTelecodeQuestion_0')
        else:
            await page.click('#ctl00_SiteContentPlaceHolder_FormView1_rblTelecodeQuestion_1')
        await page.wait_for_timeout(400)

        await page.select_option('#ctl00_SiteContentPlaceHolder_FormView1_ddlAPP_GENDER', datos.get('gender', ''))
        await page.wait_for_timeout(300)

        await page.select_option('#ctl00_SiteContentPlaceHolder_FormView1_ddlAPP_MARITAL_STATUS', datos.get('marital', ''))
        await page.wait_for_timeout(500)

        await page.select_option('#ctl00_SiteContentPlaceHolder_FormView1_ddlDOBDay', str(int(datos.get('dobDay', 0))))
        await page.select_option('#ctl00_SiteContentPlaceHolder_FormView1_ddlDOBMonth', datos.get('dobMonth', ''))
        await page.fill('#ctl00_SiteContentPlaceHolder_FormView1_tbxDOBYear', str(datos.get('dobYear', '')))
        await page.wait_for_timeout(300)

        await page.fill('#ctl00_SiteContentPlaceHolder_FormView1_tbxAPP_POB_CITY', datos.get('pobCity', ''))
        if datos.get('pobStateNA'):
            await page.check('#ctl00_SiteContentPlaceHolder_FormView1_cbexAPP_POB_ST_PROVINCE_NA')
            await page.wait_for_timeout(300)
        else:
            await page.fill('#ctl00_SiteContentPlaceHolder_FormView1_tbxAPP_POB_ST_PROVINCE', datos.get('pobState', ''))
        await page.select_option('#ctl00_SiteContentPlaceHolder_FormView1_ddlAPP_POB_CNTRY', datos.get('pobCountry', ''))
        await page.wait_for_timeout(500)
        print("   ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¦ Personal Information 1 rellenada")

        # ========== 10. NEXT: PERSONAL 2 ==========
        print("ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ Click en Next: Personal 2...")
        async with page.expect_navigation(wait_until='networkidle', timeout=30000):
            await page.evaluate("document.getElementById('ctl00_SiteContentPlaceHolder_UpdateButton3').click()")
        print("   ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¦ Llegamos a Personal Information 2")

        # ========== 11. PERSONAL INFORMATION 2 ==========
        print("ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ Rellenando Personal Information 2...")

        await page.select_option('#ctl00_SiteContentPlaceHolder_FormView1_ddlAPP_NATL', datos.get('nationality', ''))
        await page.wait_for_timeout(800)

        if datos.get('otherNationality') == 'Y':
            await page.click('#ctl00_SiteContentPlaceHolder_FormView1_rblAPP_OTH_NATL_IND_0')
        else:
            await page.click('#ctl00_SiteContentPlaceHolder_FormView1_rblAPP_OTH_NATL_IND_1')
        await page.wait_for_timeout(600)

        if datos.get('permResidentOther') == 'Y':
            await page.click('#ctl00_SiteContentPlaceHolder_FormView1_rblPermResOtherCntryInd_0')
        else:
            await page.click('#ctl00_SiteContentPlaceHolder_FormView1_rblPermResOtherCntryInd_1')
        await page.wait_for_timeout(600)

        if datos.get('nationalIdNA'):
            await page.check('#ctl00_SiteContentPlaceHolder_FormView1_cbexAPP_NATIONAL_ID_NA')
        else:
            await page.fill('#ctl00_SiteContentPlaceHolder_FormView1_tbxAPP_NATIONAL_ID', datos.get('nationalId', ''))
        await page.wait_for_timeout(400)

        if datos.get('ssnNA'):
            await page.check('#ctl00_SiteContentPlaceHolder_FormView1_cbexAPP_SSN_NA')
        else:
            await page.fill('#ctl00_SiteContentPlaceHolder_FormView1_tbxAPP_SSN', datos.get('ssn', ''))
        await page.wait_for_timeout(400)

        if datos.get('taxIdNA'):
            await page.check('#ctl00_SiteContentPlaceHolder_FormView1_cbexAPP_TAX_ID_NA')
        else:
            await page.fill('#ctl00_SiteContentPlaceHolder_FormView1_tbxAPP_TAX_ID', datos.get('taxId', ''))
        await page.wait_for_timeout(400)
        print("   ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¦ Personal Information 2 rellenada")

        # ========== 12. NEXT: TRAVEL ==========
        print("ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ Click en Next: Travel...")
        async with page.expect_navigation(wait_until='networkidle', timeout=30000):
            await page.evaluate("document.getElementById('ctl00_SiteContentPlaceHolder_UpdateButton3').click()")
        print("   ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¦ Llegamos a Travel Information")

        # ========== 13. TRAVEL INFORMATION ==========
        print("ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ Rellenando Travel Information...")

        await page.select_option('#ctl00_SiteContentPlaceHolder_FormView1_dlPrincipalAppTravel_ctl00_ddlPurposeOfTrip', datos.get('purposeOfTrip', ''))
        await page.wait_for_timeout(1500)

        await page.select_option('#ctl00_SiteContentPlaceHolder_FormView1_dlPrincipalAppTravel_ctl00_ddlOtherPurpose', datos.get('specifyPurpose', ''))
        await page.wait_for_timeout(800)

        if datos.get('specificTravelPlans') == 'Y':
            await page.click('#ctl00_SiteContentPlaceHolder_FormView1_rblSpecificTravel_0')
            await page.wait_for_timeout(1000)
            await page.select_option('#ctl00_SiteContentPlaceHolder_FormView1_ddlARRIVAL_US_DTEDay', str(int(datos.get('specificArrivalDay', 0))))
            await page.select_option('#ctl00_SiteContentPlaceHolder_FormView1_ddlARRIVAL_US_DTEMonth', str(datos.get('specificArrivalMonth', '')))
            await page.fill('#ctl00_SiteContentPlaceHolder_FormView1_tbxARRIVAL_US_DTEYear', str(datos.get('specificArrivalYear', '')))
            await page.fill('#ctl00_SiteContentPlaceHolder_FormView1_tbxArriveFlight', datos.get('arrivalFlight', ''))
            await page.fill('#ctl00_SiteContentPlaceHolder_FormView1_tbxArriveCity', datos.get('arrivalCity', ''))
            
            await page.select_option('#ctl00_SiteContentPlaceHolder_FormView1_ddlDEPARTURE_US_DTEDay', str(int(datos.get('specificDepDay', 0))))
            await page.select_option('#ctl00_SiteContentPlaceHolder_FormView1_ddlDEPARTURE_US_DTEMonth', str(datos.get('specificDepMonth', '')))
            await page.fill('#ctl00_SiteContentPlaceHolder_FormView1_tbxDEPARTURE_US_DTEYear', str(datos.get('specificDepYear', '')))
            await page.fill('#ctl00_SiteContentPlaceHolder_FormView1_tbxDepartFlight', datos.get('departureFlight', ''))
            await page.fill('#ctl00_SiteContentPlaceHolder_FormView1_tbxDepartCity', datos.get('departureCity', ''))
            await page.fill('#ctl00_SiteContentPlaceHolder_FormView1_dtlTravelLoc_ctl00_tbxSPECTRAVEL_LOCATION', datos.get('locationsToVisit', ''))
        else:
            await page.click('#ctl00_SiteContentPlaceHolder_FormView1_rblSpecificTravel_1')
            await page.wait_for_timeout(1000)
            await page.select_option('#ctl00_SiteContentPlaceHolder_FormView1_ddlTRAVEL_DTEDay', str(int(datos.get('arrivalDay', 0))))
            await page.select_option('#ctl00_SiteContentPlaceHolder_FormView1_ddlTRAVEL_DTEMonth', str(datos.get('arrivalMonth', '')))
            await page.fill('#ctl00_SiteContentPlaceHolder_FormView1_tbxTRAVEL_DTEYear', str(datos.get('arrivalYear', '')))
            await page.wait_for_timeout(400)

            await page.fill('#ctl00_SiteContentPlaceHolder_FormView1_tbxTRAVEL_LOS', str(datos.get('stayLength', '')))
            await page.select_option('#ctl00_SiteContentPlaceHolder_FormView1_ddlTRAVEL_LOS_CD', datos.get('stayUnit', ''))
        await page.wait_for_timeout(400)

        print('ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ Rellenando direcciÃƒÆ’Ã‚Â³n en EE.UU....')
        await page.fill('#ctl00_SiteContentPlaceHolder_FormView1_tbxStreetAddress1', datos.get('usStreet1', ''))
        if datos.get('usStreet2'):
            await page.fill('#ctl00_SiteContentPlaceHolder_FormView1_tbxStreetAddress2', datos.get('usStreet2', ''))
        await page.fill('#ctl00_SiteContentPlaceHolder_FormView1_tbxCity', datos.get('usCity', ''))
        await page.select_option('#ctl00_SiteContentPlaceHolder_FormView1_ddlTravelState', datos.get('usState', ''))
        await page.fill('#ctl00_SiteContentPlaceHolder_FormView1_tbZIPCode', datos.get('usZip', ''))
        await page.wait_for_timeout(600)

        who_pays = datos.get('whoIsPaying', 'S')
        await page.select_option('#ctl00_SiteContentPlaceHolder_FormView1_ddlWhoIsPaying', who_pays)
        await page.wait_for_load_state('networkidle')
        await page.wait_for_timeout(1500)
        
        who_pays = datos.get('whoIsPaying', 'S')
        if who_pays == 'O':
            await page.fill('#ctl00_SiteContentPlaceHolder_FormView1_tbxPayerSurname', datos.get('payerSurname', ''))
            await page.fill('#ctl00_SiteContentPlaceHolder_FormView1_tbxPayerGivenName', datos.get('payerGivenName', ''))
            await page.fill('#ctl00_SiteContentPlaceHolder_FormView1_tbxPayerPhone', datos.get('payerPhone', ''))
            await page.fill('#ctl00_SiteContentPlaceHolder_FormView1_tbxPayerEmail', datos.get('payerEmail', ''))
            await page.select_option('#ctl00_SiteContentPlaceHolder_FormView1_ddlPayerRelationship', datos.get('payerRelationship', ''))
        elif who_pays in ['C', 'H']:
            await page.fill('#ctl00_SiteContentPlaceHolder_FormView1_tbxPayerOrgName', datos.get('payerOrgName', ''))
            await page.fill('#ctl00_SiteContentPlaceHolder_FormView1_tbxPayerOrgPhone', datos.get('payerOrgPhone', ''))
            await page.fill('#ctl00_SiteContentPlaceHolder_FormView1_tbxPayerOrgRelationship', datos.get('payerOrgRelationship', ''))

        print("   ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¦ Travel Information rellenada correctamente")

        # ========== 14. NEXT: TRAVEL COMPANIONS ==========
        print("ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ Click en Next: Travel Companions...")
        async with page.expect_navigation(wait_until='networkidle', timeout=30000):
            await page.evaluate("document.getElementById('ctl00_SiteContentPlaceHolder_UpdateButton3').click()")
        print("   ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¦ Llegamos a Travel Companions")

        # ========== 15. TRAVEL COMPANIONS ==========
        print("ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ Rellenando Travel Companions...")
        
        if datos.get('otherPersonsTravelingWithYou') == 'Y':
            await page.click('#ctl00_SiteContentPlaceHolder_FormView1_rblOtherPersonsTravelingWithYou_0')
            await page.wait_for_timeout(1000)
            
            if datos.get('groupTravel') == 'Y':
                await page.click('#ctl00_SiteContentPlaceHolder_FormView1_rblGroupTravel_0')
                await page.wait_for_timeout(800)
                await page.fill('#ctl00_SiteContentPlaceHolder_FormView1_tbxGroupName', datos.get('groupName', ''))
            else:
                await page.click('#ctl00_SiteContentPlaceHolder_FormView1_rblGroupTravel_1')
                await page.wait_for_timeout(800)
                
                companions = datos.get('companions', [])
                for i, comp in enumerate(companions):
                    idx = f"{i:02d}"
                    await page.fill(f'#ctl00_SiteContentPlaceHolder_FormView1_dlTravelCompanions_ctl{idx}_tbxSurname', comp.get('surname', ''))
                    await page.fill(f'#ctl00_SiteContentPlaceHolder_FormView1_dlTravelCompanions_ctl{idx}_tbxGivenName', comp.get('givenName', ''))
                    await page.select_option(f'#ctl00_SiteContentPlaceHolder_FormView1_dlTravelCompanions_ctl{idx}_ddlTCRelationship', comp.get('relationship', ''))
                    
                    if i < len(companions) - 1:
                        print(f"ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ Agregando acompaÃƒÆ’Ã‚Â±ante {i+2}...")
                        async with page.expect_navigation(wait_until='networkidle', timeout=30000):
                            await page.click(f'#ctl00_SiteContentPlaceHolder_FormView1_dlTravelCompanions_ctl{idx}_InsertButtonPrincipalPOT')
                        await page.wait_for_timeout(800)
            await page.wait_for_timeout(800)
        else:
            await page.click('#ctl00_SiteContentPlaceHolder_FormView1_rblOtherPersonsTravelingWithYou_1')
            await page.wait_for_timeout(800)
        print("   ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¦ Travel Companions rellenada correctamente")

        # ========== 16. NEXT: PREVIOUS U.S. TRAVEL ==========
        print("ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ Saliendo de Travel Companions y navegando a Previous U.S. Travel...")
        async with page.expect_navigation(wait_until='networkidle', timeout=30000):
            await page.evaluate("document.getElementById('ctl00_SiteContentPlaceHolder_UpdateButton3').click()")
        print("   ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¦ Llegamos a Previous U.S. Travel")

        # ========== 17. PREVIOUS U.S. TRAVEL INFORMATION ==========
        print("ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ Rellenando Previous U.S. Travel Information...")

        if datos.get('prevUsTravel') == 'Y':
            await page.click('#ctl00_SiteContentPlaceHolder_FormView1_rblPREV_US_TRAVEL_IND_0')
            await page.wait_for_timeout(1000)

            await page.select_option('#ctl00_SiteContentPlaceHolder_FormView1_dtlPREV_US_VISIT_ctl00_ddlPREV_US_VISIT_DTEDay', str(int(datos.get('prevUsVisitDay', 0))))
            await page.select_option('#ctl00_SiteContentPlaceHolder_FormView1_dtlPREV_US_VISIT_ctl00_ddlPREV_US_VISIT_DTEMonth', str(datos.get('prevUsVisitMonth', '')))
            await page.fill('#ctl00_SiteContentPlaceHolder_FormView1_dtlPREV_US_VISIT_ctl00_tbxPREV_US_VISIT_DTEYear', str(datos.get('prevUsVisitYear', '')))
            await page.fill('#ctl00_SiteContentPlaceHolder_FormView1_dtlPREV_US_VISIT_ctl00_tbxPREV_US_VISIT_LOS', str(datos.get('prevUsVisitLOS', '')))
            await page.select_option('#ctl00_SiteContentPlaceHolder_FormView1_dtlPREV_US_VISIT_ctl00_ddlPREV_US_VISIT_LOS_CD', datos.get('prevUsVisitLOS_CD', ''))
            await page.wait_for_timeout(500)

            if datos.get('hasUsDriverLicense') == 'Y':
                await page.click('#ctl00_SiteContentPlaceHolder_FormView1_rblPREV_US_DRIVER_LIC_IND_0')
                await page.wait_for_timeout(800)
                if datos.get('prevUsDriverLicenseNA'):
                    await page.check('#ctl00_SiteContentPlaceHolder_FormView1_dtlUS_DRIVER_LICENSE_ctl00_cbxUS_DRIVER_LICENSE_NA')
                else:
                    await page.fill('#ctl00_SiteContentPlaceHolder_FormView1_dtlUS_DRIVER_LICENSE_ctl00_tbxUS_DRIVER_LICENSE', datos.get('prevUsDriverLicenseNum', ''))
                await page.select_option('#ctl00_SiteContentPlaceHolder_FormView1_dtlUS_DRIVER_LICENSE_ctl00_ddlUS_DRIVER_LICENSE_STATE', datos.get('prevUsDriverLicenseState', ''))
            else:
                await page.click('#ctl00_SiteContentPlaceHolder_FormView1_rblPREV_US_DRIVER_LIC_IND_1')
                
            await page.wait_for_timeout(500)
        else:
            await page.click('#ctl00_SiteContentPlaceHolder_FormView1_rblPREV_US_TRAVEL_IND_1')
            await page.wait_for_timeout(1000)

        if datos.get('prevVisa') == 'Y':
            await page.click('#ctl00_SiteContentPlaceHolder_FormView1_rblPREV_VISA_IND_0')
            await page.wait_for_timeout(1000)

            await page.select_option('#ctl00_SiteContentPlaceHolder_FormView1_ddlPREV_VISA_ISSUED_DTEDay', str(int(datos.get('prevVisaIssuedDay', 0))))
            await page.select_option('#ctl00_SiteContentPlaceHolder_FormView1_ddlPREV_VISA_ISSUED_DTEMonth', str(datos.get('prevVisaIssuedMonth', '')))
            await page.fill('#ctl00_SiteContentPlaceHolder_FormView1_tbxPREV_VISA_ISSUED_DTEYear', str(datos.get('prevVisaIssuedYear', '')))
            
            if datos.get('prevVisaNumberNA'):
                await page.check('#ctl00_SiteContentPlaceHolder_FormView1_cbxPREV_VISA_FOIL_NUMBER_NA')
            else:
                await page.fill('#ctl00_SiteContentPlaceHolder_FormView1_tbxPREV_VISA_FOIL_NUMBER', datos.get('prevVisaNumber', ''))

            await page.click('#ctl00_SiteContentPlaceHolder_FormView1_rblPREV_VISA_SAME_TYPE_IND_0' if datos.get('sameVisaType') == 'Y' else '#ctl00_SiteContentPlaceHolder_FormView1_rblPREV_VISA_SAME_TYPE_IND_1')
            await page.click('#ctl00_SiteContentPlaceHolder_FormView1_rblPREV_VISA_SAME_CNTRY_IND_0' if datos.get('sameCountry') == 'Y' else '#ctl00_SiteContentPlaceHolder_FormView1_rblPREV_VISA_SAME_CNTRY_IND_1')
            await page.click('#ctl00_SiteContentPlaceHolder_FormView1_rblPREV_VISA_TEN_PRINT_IND_0' if datos.get('tenPrinted') == 'Y' else '#ctl00_SiteContentPlaceHolder_FormView1_rblPREV_VISA_TEN_PRINT_IND_1')
            
            await page.click('#ctl00_SiteContentPlaceHolder_FormView1_rblPREV_VISA_LOST_IND_0' if datos.get('lostVisa') == 'Y' else '#ctl00_SiteContentPlaceHolder_FormView1_rblPREV_VISA_LOST_IND_1')
            await page.wait_for_timeout(500)
            
            await page.click('#ctl00_SiteContentPlaceHolder_FormView1_rblPREV_VISA_CANCELLED_IND_0' if datos.get('cancelledVisa') == 'Y' else '#ctl00_SiteContentPlaceHolder_FormView1_rblPREV_VISA_CANCELLED_IND_1')
            await page.wait_for_timeout(500)
        else:
            await page.click('#ctl00_SiteContentPlaceHolder_FormView1_rblPREV_VISA_IND_1')
            await page.wait_for_timeout(1000)

        if datos.get('refusedVisa') == 'Y':
            await page.click('#ctl00_SiteContentPlaceHolder_FormView1_rblPREV_VISA_REFUSED_IND_0')
            await page.wait_for_timeout(800)
            await page.fill('#ctl00_SiteContentPlaceHolder_FormView1_tbxPREV_VISA_REFUSED_EXPL', datos.get('refusedVisaExplain', ''))
        else:
            await page.click('#ctl00_SiteContentPlaceHolder_FormView1_rblPREV_VISA_REFUSED_IND_1')
            await page.wait_for_timeout(800)

        if datos.get('immigrantPetition') == 'Y':
            await page.click('#ctl00_SiteContentPlaceHolder_FormView1_rblIV_PETITION_IND_0')
            await page.wait_for_timeout(800)
            await page.fill('#ctl00_SiteContentPlaceHolder_FormView1_tbxIV_PETITION_EXPL', datos.get('immigrantPetitionExplain', ''))
        else:
            await page.click('#ctl00_SiteContentPlaceHolder_FormView1_rblIV_PETITION_IND_1')
            await page.wait_for_timeout(800)

        print("   ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¦ Previous U.S. Travel Information rellenada correctamente")

        # ========== 18. NEXT: ADDRESS & PHONE ==========
        print("ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ Click en Next: Address & Phone...")
        async with page.expect_navigation(wait_until='networkidle', timeout=30000):
            await page.evaluate("document.getElementById('ctl00_SiteContentPlaceHolder_UpdateButton3').click()")
            
        print("   ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¦ Llegamos a Address & Phone")

        # ========== 19. ADDRESS AND PHONE INFORMATION ==========
        print("ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ Rellenando Address & Phone Information...")
        
        await page.fill('#ctl00_SiteContentPlaceHolder_FormView1_tbxAPP_ADDR_LN1', datos.get('homeStreet1', ''))
        if datos.get('homeStreet2'):
            await page.fill('#ctl00_SiteContentPlaceHolder_FormView1_tbxAPP_ADDR_LN2', datos.get('homeStreet2', ''))
            
        await page.fill('#ctl00_SiteContentPlaceHolder_FormView1_tbxAPP_ADDR_CITY', datos.get('homeCity', ''))
        
        if datos.get('homeStateNA'):
            await page.check('#ctl00_SiteContentPlaceHolder_FormView1_cbexAPP_ADDR_STATE_NA')
        else:
            await page.fill('#ctl00_SiteContentPlaceHolder_FormView1_tbxAPP_ADDR_STATE', datos.get('homeState', ''))
            
        if datos.get('homeZipNA'):
            await page.check('#ctl00_SiteContentPlaceHolder_FormView1_cbexAPP_ADDR_POSTAL_CD_NA')
        else:
            await page.fill('#ctl00_SiteContentPlaceHolder_FormView1_tbxAPP_ADDR_POSTAL_CD', datos.get('homeZip', ''))
            
        await page.select_option('#ctl00_SiteContentPlaceHolder_FormView1_ddlCountry', datos.get('homeCountry', 'MEX'))
        await page.wait_for_load_state('networkidle')
        await page.wait_for_timeout(800)

        # Is your Mailing Address the same as your Home Address?
        if datos.get('sameMailingAddress') == 'Y':
            await page.click('#ctl00_SiteContentPlaceHolder_FormView1_rblMailingAddrSame_0') # Yes
            await page.wait_for_timeout(800)
        else:
            await page.click('#ctl00_SiteContentPlaceHolder_FormView1_rblMailingAddrSame_1') # No
            await page.wait_for_timeout(800)
            
        await page.fill('#ctl00_SiteContentPlaceHolder_FormView1_tbxAPP_HOME_TEL', datos.get('primaryPhone', ''))
        
        if datos.get('secondaryPhoneNA'):
            await page.check('#ctl00_SiteContentPlaceHolder_FormView1_cbexAPP_MOBILE_TEL_NA')
        else:
            await page.fill('#ctl00_SiteContentPlaceHolder_FormView1_tbxAPP_MOBILE_TEL', datos.get('secondaryPhone', ''))
            
        if datos.get('workPhoneNA'):
            await page.check('#ctl00_SiteContentPlaceHolder_FormView1_cbexAPP_BUS_TEL_NA')
        else:
            await page.fill('#ctl00_SiteContentPlaceHolder_FormView1_tbxAPP_BUS_TEL', datos.get('workPhone', ''))
            
        # Have you used any other telephone numbers in the last five years?
        if datos.get('otherPhones') == 'Y':
            await page.click('#ctl00_SiteContentPlaceHolder_FormView1_rblAddPhone_0')
            await page.wait_for_timeout(800)
        else:
            await page.click('#ctl00_SiteContentPlaceHolder_FormView1_rblAddPhone_1')
            await page.wait_for_timeout(300)

        await page.fill('#ctl00_SiteContentPlaceHolder_FormView1_tbxAPP_EMAIL_ADDR', datos.get('emailAddress', ''))
        
        if datos.get('otherEmails') == 'Y':
            await page.click('#ctl00_SiteContentPlaceHolder_FormView1_rblAddEmail_0')
            await page.wait_for_timeout(800)
        else:
            await page.click('#ctl00_SiteContentPlaceHolder_FormView1_rblAddEmail_1')
            
        # Social Media
        platform = datos.get('socialMediaPlatform', 'NONE')
        await page.select_option('#ctl00_SiteContentPlaceHolder_FormView1_dtlSocial_ctl00_ddlSocialMedia', platform)
        if platform != 'NONE':
            await page.fill('#ctl00_SiteContentPlaceHolder_FormView1_dtlSocial_ctl00_tbxSocialMediaIdent', datos.get('socialMediaIdent', ''))

        # Other websites
        if datos.get('otherSocialMedia') == 'Y':
            await page.click('#ctl00_SiteContentPlaceHolder_FormView1_rblAddSocial_0')
        else:
            await page.click('#ctl00_SiteContentPlaceHolder_FormView1_rblAddSocial_1')

        print("   ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¦ Address & Phone Information rellenada correctamente")

        
        # ========== 20. NEXT: PASSPORT ==========
        print("-> Click en Next: Passport...")
        async with page.expect_navigation(wait_until='networkidle', timeout=30000):
            await page.evaluate("document.getElementById('ctl00_SiteContentPlaceHolder_UpdateButton3').click()")

        print("-> Rellenando Passport Information...")
        await page.wait_for_selector('#ctl00_SiteContentPlaceHolder_FormView1_ddlPPT_TYPE', state='visible', timeout=15000)

        await safe_select(page, '#ctl00_SiteContentPlaceHolder_FormView1_ddlPPT_TYPE', datos.get('passportType', 'R'))
        await page.wait_for_load_state('networkidle')
        await page.wait_for_timeout(800)
        await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxPPT_NUM', datos.get('passportNumber', ''))

        if datos.get('passportBookNumberNA'):
            await safe_check(page, '#ctl00_SiteContentPlaceHolder_FormView1_cbexPPT_BOOK_NUM_NA')
            await page.wait_for_timeout(500)
        else:
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxPPT_BOOK_NUM', datos.get('passportBookNumber', ''))

        await safe_select(page, '#ctl00_SiteContentPlaceHolder_FormView1_ddlPPT_ISSUED_CNTRY', datos.get('passportIssuedCountry', ''))
        await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxPPT_ISSUED_IN_CITY', datos.get('passportIssuedCity', ''))
        await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxPPT_ISSUED_IN_STATE', datos.get('passportIssuedState', ''))
        await safe_select(page, '#ctl00_SiteContentPlaceHolder_FormView1_ddlPPT_ISSUED_IN_CNTRY', datos.get('passportIssuedCountryRegion', ''))

        issued_day = str(datos.get('passportIssuedDay', '1')).zfill(2)
        issued_month = str(datos.get('passportIssuedMonth', '1')).zfill(2)
        await safe_select(page, '#ctl00_SiteContentPlaceHolder_FormView1_ddlPPT_ISSUED_DTEDay', issued_day)
        await safe_select(page, '#ctl00_SiteContentPlaceHolder_FormView1_ddlPPT_ISSUED_DTEMonth', issued_month)
        await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxPPT_ISSUEDYear', str(datos.get('passportIssuedYear', '')))

        expire_day = str(datos.get('passportExpireDay', '1')).zfill(2)
        expire_month = str(datos.get('passportExpireMonth', '1')).zfill(2)
        await safe_select(page, '#ctl00_SiteContentPlaceHolder_FormView1_ddlPPT_EXPIRE_DTEDay', expire_day)
        await safe_select(page, '#ctl00_SiteContentPlaceHolder_FormView1_ddlPPT_EXPIRE_DTEMonth', expire_month)
        await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxPPT_EXPIREYear', str(datos.get('passportExpireYear', '')))

        if datos.get('lostPassport') == 'Y':
            await page.evaluate("document.getElementById('ctl00_SiteContentPlaceHolder_FormView1_rblLOST_PPT_IND_0').click()")
        else:
            await page.evaluate("document.getElementById('ctl00_SiteContentPlaceHolder_FormView1_rblLOST_PPT_IND_1').click()")
        
        await page.wait_for_timeout(2000)
        await page.wait_for_load_state('networkidle')

        print("-> Click en Next: U.S. Contacts...")
        async with page.expect_navigation(wait_until='networkidle', timeout=30000):
            await page.evaluate("document.getElementById('ctl00_SiteContentPlaceHolder_UpdateButton3').click()")
        
        await page.wait_for_timeout(1500)
        modal_visible = await page.is_visible('#ctl00_SiteContentPlaceHolder_pnlDifferentNationality2')
        if modal_visible:
            await safe_select(page, '#ctl00_SiteContentPlaceHolder_ddlPPT_ISSUED_CNTRY', datos.get('passportIssuedCountry', ''))
            await page.wait_for_timeout(500)
            await safe_select(page, '#ctl00_SiteContentPlaceHolder_ddlNationality', datos.get('nationality', ''))
            await page.wait_for_timeout(500)
            async with page.expect_navigation(wait_until='networkidle', timeout=60000):
                await page.click('#ctl00_SiteContentPlaceHolder_btnChangeNationality')

        # ========== 23. U.S. POINT OF CONTACT ==========
        print("-> Rellenando U.S. Point of Contact Information...")
        await page.wait_for_selector('#ctl00_SiteContentPlaceHolder_FormView1_tbxUS_POC_SURNAME', state='visible', timeout=15000)
        # If we know the person, fill them in.
        # Note: CEAC defaults to Org NA checked.
        if not datos.get('pocNameNA'):
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxUS_POC_SURNAME', datos.get('pocSurname', ''))
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxUS_POC_GIVEN_NAME', datos.get('pocGivenName', ''))
        else:
            # We don't know the name. Make sure Name NA is checked.
            # First uncheck Org NA if it's checked so we can check Name NA
            try:
                await page.uncheck('#ctl00_SiteContentPlaceHolder_FormView1_cbxUS_POC_ORG_NA_IND')
                await page.wait_for_timeout(1000)
                await page.check('#ctl00_SiteContentPlaceHolder_FormView1_cbxUS_POC_NAME_NA')
                await page.wait_for_timeout(1000)
            except:
                pass
                
        if not datos.get('pocOrgNA'):
            try:
                await page.uncheck('#ctl00_SiteContentPlaceHolder_FormView1_cbxUS_POC_ORG_NA_IND')
                await page.wait_for_timeout(1000)
            except:
                pass
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxUS_POC_ORGANIZATION', datos.get('pocOrgName', ''))
        else:
            try:
                await page.check('#ctl00_SiteContentPlaceHolder_FormView1_cbxUS_POC_ORG_NA_IND')
                await page.wait_for_timeout(1000)
            except:
                pass

        await safe_select(page, '#ctl00_SiteContentPlaceHolder_FormView1_ddlUS_POC_REL_TO_APP', datos.get('pocRelationship', 'C'))
        await page.wait_for_load_state('networkidle')
        await page.wait_for_timeout(1000) 

        await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxUS_POC_ADDR_LN1', datos.get('pocStreet1', ''))
        if datos.get('pocStreet2'):
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxUS_POC_ADDR_LN2', datos.get('pocStreet2', ''))

        await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxUS_POC_ADDR_CITY', datos.get('pocCity', ''))
        await safe_select(page, '#ctl00_SiteContentPlaceHolder_FormView1_ddlUS_POC_ADDR_STATE', datos.get('pocState', ''))
        await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxUS_POC_ADDR_POSTAL_CD', datos.get('pocZipCode', ''))
        await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxUS_POC_HOME_TEL', datos.get('pocPhone', ''))

        if datos.get('pocEmailNA'):
            await page.click('#ctl00_SiteContentPlaceHolder_FormView1_cbexUS_POC_EMAIL_ADDR_NA')
            await page.wait_for_load_state('domcontentloaded')
            await page.wait_for_timeout(1000)
        else:
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxUS_POC_EMAIL_ADDR', datos.get('pocEmail', ''))

        print("-> U.S. Point of Contact completado.")

        # ========== 25. NEXT: FAMILY ==========
        print("-> Click en Next: Family...")
        async with page.expect_navigation(wait_until='networkidle', timeout=30000):
            await page.evaluate("document.getElementById('ctl00_SiteContentPlaceHolder_UpdateButton3').click()")
            
        print("-> Rellenando Family Information: Relatives...")
        await page.wait_for_selector('#ctl00_SiteContentPlaceHolder_FormView1_tbxFATHER_SURNAME', state='visible', timeout=15000)
        
        # Helper for checkbox that triggers postback
        async def check_and_wait(selector):
            if await page.locator(selector).is_visible():
                await page.evaluate(f"document.querySelector('{selector}').click()")
                await page.wait_for_timeout(2000)
                await page.wait_for_load_state('networkidle')

        # Father
        if datos.get('fatherSurnameNA'):
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_cbxFATHER_SURNAME_UNK_IND')
        else:
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxFATHER_SURNAME', datos.get('fatherSurname', ''))
            
        if datos.get('fatherGivenNameNA'):
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_cbxFATHER_GIVEN_NAME_UNK_IND')
        else:
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxFATHER_GIVEN_NAME', datos.get('fatherGivenName', ''))
            
        if datos.get('fatherDOBNA'):
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_cbxFATHER_DOB_UNK_IND')
        else:
            if await page.locator('#ctl00_SiteContentPlaceHolder_FormView1_ddlFathersDOBDay').is_visible():
                await safe_select(page, '#ctl00_SiteContentPlaceHolder_FormView1_ddlFathersDOBDay', str(datos.get('fatherDOBDay', '1')).zfill(2))
                await safe_select(page, '#ctl00_SiteContentPlaceHolder_FormView1_ddlFathersDOBMonth', datos.get('fatherDOBMonth', ''))
                await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxFathersDOBYear', str(datos.get('fatherDOBYear', '')))
            
        father_in_us_id = 'ctl00_SiteContentPlaceHolder_FormView1_rblFATHER_LIVE_IN_US_IND_0' if datos.get('fatherInUS') == 'Y' else 'ctl00_SiteContentPlaceHolder_FormView1_rblFATHER_LIVE_IN_US_IND_1'
        await page.evaluate(f"if (document.getElementById('{father_in_us_id}')) document.getElementById('{father_in_us_id}').click()")

        # Mother
        if datos.get('motherSurnameNA'):
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_cbxMOTHER_SURNAME_UNK_IND')
        else:
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxMOTHER_SURNAME', datos.get('motherSurname', ''))
            
        if datos.get('motherGivenNameNA'):
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_cbxMOTHER_GIVEN_NAME_UNK_IND')
        else:
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxMOTHER_GIVEN_NAME', datos.get('motherGivenName', ''))
            
        if datos.get('motherDOBNA'):
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_cbxMOTHER_DOB_UNK_IND')
        else:
            if await page.locator('#ctl00_SiteContentPlaceHolder_FormView1_ddlMothersDOBDay').is_visible():
                await safe_select(page, '#ctl00_SiteContentPlaceHolder_FormView1_ddlMothersDOBDay', str(datos.get('motherDOBDay', '1')).zfill(2))
                await safe_select(page, '#ctl00_SiteContentPlaceHolder_FormView1_ddlMothersDOBMonth', datos.get('motherDOBMonth', ''))
                await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxMothersDOBYear', str(datos.get('motherDOBYear', '')))
            
        mother_in_us_id = 'ctl00_SiteContentPlaceHolder_FormView1_rblMOTHER_LIVE_IN_US_IND_0' if datos.get('motherInUS') == 'Y' else 'ctl00_SiteContentPlaceHolder_FormView1_rblMOTHER_LIVE_IN_US_IND_1'
        await page.evaluate(f"if (document.getElementById('{mother_in_us_id}')) document.getElementById('{mother_in_us_id}').click()")

        # Immediate Relatives
        rel_in_us_id = 'ctl00_SiteContentPlaceHolder_FormView1_rblUS_IMMED_RELATIVE_IND_0' if datos.get('immediateRelatives') == 'Y' else 'ctl00_SiteContentPlaceHolder_FormView1_rblUS_IMMED_RELATIVE_IND_1'
        await page.evaluate(f"if (document.getElementById('{rel_in_us_id}')) document.getElementById('{rel_in_us_id}').click()")
        await page.wait_for_timeout(500)

        other_rel_id = 'ctl00_SiteContentPlaceHolder_FormView1_rblUS_OTHER_RELATIVE_IND_0' if datos.get('otherRelatives') == 'Y' else 'ctl00_SiteContentPlaceHolder_FormView1_rblUS_OTHER_RELATIVE_IND_1'
        await page.evaluate(f"if (document.getElementById('{other_rel_id}')) document.getElementById('{other_rel_id}').click()")
        await page.wait_for_timeout(500)


        print("-> Family completado.")

        print("-> Click en Next: Work/Education/Training...")
        async with page.expect_navigation(wait_until='networkidle', timeout=30000):
            await page.evaluate("document.getElementById('ctl00_SiteContentPlaceHolder_UpdateButton3').click()")
        print("-> Llegamos a Work/Education/Training")

        # ========== 26. PRESENT WORK/EDUCATION/TRAINING ==========
        print("-> Rellenando Work/Education/Training...")
        await page.wait_for_selector('#ctl00_SiteContentPlaceHolder_FormView1_ddlPresentOccupation', state='visible', timeout=15000)

        primary_occ = datos.get('primaryOccupation', '')
        await safe_select(page, '#ctl00_SiteContentPlaceHolder_FormView1_ddlPresentOccupation', primary_occ)
        await page.wait_for_load_state('networkidle')
        await page.wait_for_timeout(1500)

        not_employed_or_homemaker = primary_occ in ['N', 'H', 'RT']

        if not not_employed_or_homemaker and primary_occ != '':
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxEmpSchName', datos.get('empSchName', ''))
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxEmpSchAddr1', datos.get('empSchAddr1', ''))
            
            if datos.get('empSchAddr2'):
                await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxEmpSchAddr2', datos.get('empSchAddr2', ''))
                
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxEmpSchCity', datos.get('empSchCity', ''))
            
            if datos.get('empSchStateNA'):
                await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_cbxWORK_EDUC_ADDR_STATE_NA')
            else:
                await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxWORK_EDUC_ADDR_STATE', datos.get('empSchState', ''))
                
            if datos.get('empSchZipCodeNA'):
                await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_cbxWORK_EDUC_ADDR_POSTAL_CD_NA')
            else:
                await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxWORK_EDUC_ADDR_POSTAL_CD', datos.get('empSchZipCode', ''))
                
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxWORK_EDUC_TEL', datos.get('empSchPhone', ''))
            await safe_select(page, '#ctl00_SiteContentPlaceHolder_FormView1_ddlEmpSchCountry', datos.get('empSchCountry', ''))
            await page.wait_for_load_state('networkidle')
            await page.wait_for_timeout(1000)
            
            day = str(datos.get('empStartDateDay', '1')).zfill(2)
            await safe_select(page, '#ctl00_SiteContentPlaceHolder_FormView1_ddlEmpDateFromDay', day if day != '00' else '')
            await safe_select(page, '#ctl00_SiteContentPlaceHolder_FormView1_ddlEmpDateFromMonth', str(datos.get('empStartDateMonth', '')))
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxEmpDateFromYear', str(datos.get('empStartDateYear', '')))
            
            if datos.get('monthlyIncomeNA'):
                await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_cbxCURR_MONTHLY_SALARY_NA')
            else:
                await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxCURR_MONTHLY_SALARY', datos.get('monthlyIncome', ''))
                
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxDescribeDuties', datos.get('empDuties', ''))

        elif primary_occ == 'N':
            # Not employed explain
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxExplainOtherPresentOccupation', datos.get('notEmployedExplain', ''))

        print("-> Work/Education/Training completado.")

        print("-> Click en Next: Work/Education: Previous...")
        async with page.expect_navigation(wait_until='networkidle', timeout=30000):
            await page.evaluate("document.getElementById('ctl00_SiteContentPlaceHolder_UpdateButton3').click()")
        print("-> Llegamos a Work/Education: Previous")

        # ========== 27. PREVIOUS WORK/EDUCATION/TRAINING ==========
        print("-> Rellenando Previous Work/Education/Training...")
        await page.wait_for_selector('#ctl00_SiteContentPlaceHolder_FormView1_rblPreviouslyEmployed_0', state='visible', timeout=15000)
        
        prev_employed = datos.get('prevEmployed', 'N')
        if prev_employed == 'Y':
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblPreviouslyEmployed_0')
            await page.wait_for_selector('#ctl00_SiteContentPlaceHolder_FormView1_dtlPrevEmpl_ctl00_tbEmployerName', state='visible', timeout=10000)
            
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_dtlPrevEmpl_ctl00_tbEmployerName', datos.get('prevEmpName', ''))
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_dtlPrevEmpl_ctl00_tbEmployerStreetAddress1', datos.get('prevEmpAddr1', ''))
            if datos.get('prevEmpAddr2'):
                await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_dtlPrevEmpl_ctl00_tbEmployerStreetAddress2', datos.get('prevEmpAddr2', ''))
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_dtlPrevEmpl_ctl00_tbEmployerCity', datos.get('prevEmpCity', ''))
            
            if datos.get('prevEmpStateNA'):
                await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_dtlPrevEmpl_ctl00_cbxPREV_EMPL_ADDR_STATE_NA')
            else:
                await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_dtlPrevEmpl_ctl00_tbxPREV_EMPL_ADDR_STATE', datos.get('prevEmpState', ''))
                
            if datos.get('prevEmpZipCodeNA'):
                await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_dtlPrevEmpl_ctl00_cbxPREV_EMPL_ADDR_POSTAL_CD_NA')
            else:
                await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_dtlPrevEmpl_ctl00_tbxPREV_EMPL_ADDR_POSTAL_CD', datos.get('prevEmpZipCode', ''))
                
            await safe_select(page, '#ctl00_SiteContentPlaceHolder_FormView1_dtlPrevEmpl_ctl00_DropDownList2', datos.get('prevEmpCountry', ''))
            await page.wait_for_load_state('networkidle')
            await page.wait_for_timeout(1000)
            
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_dtlPrevEmpl_ctl00_tbEmployerPhone', datos.get('prevEmpPhone', ''))
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_dtlPrevEmpl_ctl00_tbJobTitle', datos.get('prevEmpJobTitle', ''))
            
            if datos.get('prevEmpSupervisorSurnameNA'):
                await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_dtlPrevEmpl_ctl00_cbxSupervisorSurname_NA')
            else:
                await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_dtlPrevEmpl_ctl00_tbSupervisorSurname', datos.get('prevEmpSupervisorSurname', ''))
                
            if datos.get('prevEmpSupervisorGivenNameNA'):
                await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_dtlPrevEmpl_ctl00_cbxSupervisorGivenName_NA')
            else:
                await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_dtlPrevEmpl_ctl00_tbSupervisorGivenName', datos.get('prevEmpSupervisorGivenName', ''))
                
            s_day = str(datos.get('prevEmpStartDateDay', '1')).zfill(2)
            await safe_select(page, '#ctl00_SiteContentPlaceHolder_FormView1_dtlPrevEmpl_ctl00_ddlEmpDateFromDay', s_day if s_day != '00' else '')
            await safe_select(page, '#ctl00_SiteContentPlaceHolder_FormView1_dtlPrevEmpl_ctl00_ddlEmpDateFromMonth', str(datos.get('prevEmpStartDateMonth', '')))
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_dtlPrevEmpl_ctl00_tbxEmpDateFromYear', str(datos.get('prevEmpStartDateYear', '')))
            
            e_day = str(datos.get('prevEmpEndDateDay', '1')).zfill(2)
            await safe_select(page, '#ctl00_SiteContentPlaceHolder_FormView1_dtlPrevEmpl_ctl00_ddlEmpDateToDay', e_day if e_day != '00' else '')
            await safe_select(page, '#ctl00_SiteContentPlaceHolder_FormView1_dtlPrevEmpl_ctl00_ddlEmpDateToMonth', str(datos.get('prevEmpEndDateMonth', '')))
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_dtlPrevEmpl_ctl00_tbxEmpDateToYear', str(datos.get('prevEmpEndDateYear', '')))
            
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_dtlPrevEmpl_ctl00_tbDescribeDuties', datos.get('prevEmpDuties', ''))
        else:
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblPreviouslyEmployed_1')
            
        prev_educ = datos.get('prevEduc', 'N')
        if prev_educ == 'Y':
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblOtherEduc_0')
            await page.wait_for_selector('#ctl00_SiteContentPlaceHolder_FormView1_dtlPrevEduc_ctl00_tbxSchoolName', state='visible', timeout=10000)
            
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_dtlPrevEduc_ctl00_tbxSchoolName', datos.get('prevEducName', ''))
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_dtlPrevEduc_ctl00_tbxSchoolAddr1', datos.get('prevEducAddr1', ''))
            if datos.get('prevEducAddr2'):
                await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_dtlPrevEduc_ctl00_tbxSchoolAddr2', datos.get('prevEducAddr2', ''))
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_dtlPrevEduc_ctl00_tbxSchoolCity', datos.get('prevEducCity', ''))
            
            if datos.get('prevEducStateNA'):
                await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_dtlPrevEduc_ctl00_cbxEDUC_INST_ADDR_STATE_NA')
            else:
                await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_dtlPrevEduc_ctl00_tbxEDUC_INST_ADDR_STATE', datos.get('prevEducState', ''))
                
            if datos.get('prevEducZipCodeNA'):
                await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_dtlPrevEduc_ctl00_cbxEDUC_INST_POSTAL_CD_NA')
            else:
                await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_dtlPrevEduc_ctl00_tbxEDUC_INST_POSTAL_CD', datos.get('prevEducZipCode', ''))
                
            await safe_select(page, '#ctl00_SiteContentPlaceHolder_FormView1_dtlPrevEduc_ctl00_ddlSchoolCountry', datos.get('prevEducCountry', ''))
            await page.wait_for_load_state('networkidle')
            await page.wait_for_timeout(1000)
            
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_dtlPrevEduc_ctl00_tbxSchoolCourseOfStudy', datos.get('prevEducCourse', ''))
            
            s_day = str(datos.get('prevEducStartDateDay', '1')).zfill(2)
            await safe_select(page, '#ctl00_SiteContentPlaceHolder_FormView1_dtlPrevEduc_ctl00_ddlSchoolFromDay', s_day if s_day != '00' else '')
            await safe_select(page, '#ctl00_SiteContentPlaceHolder_FormView1_dtlPrevEduc_ctl00_ddlSchoolFromMonth', str(datos.get('prevEducStartDateMonth', '')))
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_dtlPrevEduc_ctl00_tbxSchoolFromYear', str(datos.get('prevEducStartDateYear', '')))
            
            e_day = str(datos.get('prevEducEndDateDay', '1')).zfill(2)
            await safe_select(page, '#ctl00_SiteContentPlaceHolder_FormView1_dtlPrevEduc_ctl00_ddlSchoolToDay', e_day if e_day != '00' else '')
            await safe_select(page, '#ctl00_SiteContentPlaceHolder_FormView1_dtlPrevEduc_ctl00_ddlSchoolToMonth', str(datos.get('prevEducEndDateMonth', '')))
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_dtlPrevEduc_ctl00_tbxSchoolToYear', str(datos.get('prevEducEndDateYear', '')))
        else:
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblOtherEduc_1')

        print("-> Previous Work/Education/Training completado.")

        print("-> Click en Next: Work/Education: Additional...")
        async with page.expect_navigation(wait_until='networkidle', timeout=30000):
            await page.evaluate("document.getElementById('ctl00_SiteContentPlaceHolder_UpdateButton3').click()")
        print("-> Llegamos a Work/Education: Additional")

        # ========== 28. ADDITIONAL WORK/EDUCATION/TRAINING ==========
        print("-> Rellenando Additional Work/Education/Training...")
        await page.wait_for_selector('#ctl00_SiteContentPlaceHolder_FormView1_rblCLAN_TRIBE_IND_1', state='visible', timeout=15000)

        # Clan/Tribe
        if datos.get('clanTribe') == 'Y':
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblCLAN_TRIBE_IND_0')
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxCLAN_TRIBE_NAME', datos.get('clanTribeName', ''))
        else:
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblCLAN_TRIBE_IND_1')

        # Languages
        if datos.get('language1'):
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_dtlLANGUAGES_ctl00_tbxLANGUAGE_NAME', datos.get('language1', ''))
            if datos.get('language2'):
                # Assuming standard 'Add Another' handling might be needed in real code if ctl01 is not visible by default,
                # but based on provided HTML, it seems both fields are there or JS adds them.
                # If ctl01 fails, we might need to click Add Another. For now, try to fill it safely.
                try:
                    await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_dtlLANGUAGES_ctl01_tbxLANGUAGE_NAME', datos.get('language2', ''))
                except:
                    pass

        # Countries Visited
        if datos.get('countriesVisited') == 'Y':
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblCOUNTRIES_VISITED_IND_0')
            await safe_select(page, '#ctl00_SiteContentPlaceHolder_FormView1_dtlCountriesVisited_ctl00_ddlCOUNTRIES_VISITED', datos.get('countryVisited1', ''))
        else:
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblCOUNTRIES_VISITED_IND_1')

        # Organizations
        if datos.get('organizations') == 'Y':
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblORGANIZATION_IND_0')
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_dtlORGANIZATIONS_ctl00_tbxORGANIZATION_NAME', datos.get('organization1', ''))
        else:
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblORGANIZATION_IND_1')

        # Specialized Skills
        if datos.get('specializedSkills') == 'Y':
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblSPECIALIZED_SKILLS_IND_0')
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxSPECIALIZED_SKILLS_EXPL', datos.get('specializedSkillsExplain', ''))
        else:
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblSPECIALIZED_SKILLS_IND_1')

        # Military Service
        if datos.get('militaryService') == 'Y':
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblMILITARY_SERVICE_IND_0')
            await safe_select(page, '#ctl00_SiteContentPlaceHolder_FormView1_dtlMILITARY_SERVICE_ctl00_ddlMILITARY_SVC_CNTRY', datos.get('militaryCountry', ''))
            await page.wait_for_load_state('networkidle')
            await page.wait_for_timeout(1000)
            
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_dtlMILITARY_SERVICE_ctl00_tbxMILITARY_SVC_BRANCH', datos.get('militaryBranch', ''))
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_dtlMILITARY_SERVICE_ctl00_tbxMILITARY_SVC_RANK', datos.get('militaryRank', ''))
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_dtlMILITARY_SERVICE_ctl00_tbxMILITARY_SVC_SPECIALTY', datos.get('militarySpecialty', ''))
            
            s_day = str(datos.get('militaryStartDateDay', '1')).zfill(2)
            await safe_select(page, '#ctl00_SiteContentPlaceHolder_FormView1_dtlMILITARY_SERVICE_ctl00_ddlMILITARY_SVC_FROMDay', s_day if s_day != '00' else '')
            await safe_select(page, '#ctl00_SiteContentPlaceHolder_FormView1_dtlMILITARY_SERVICE_ctl00_ddlMILITARY_SVC_FROMMonth', str(datos.get('militaryStartDateMonth', '')))
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_dtlMILITARY_SERVICE_ctl00_tbxMILITARY_SVC_FROMYear', str(datos.get('militaryStartDateYear', '')))
            
            e_day = str(datos.get('militaryEndDateDay', '1')).zfill(2)
            await safe_select(page, '#ctl00_SiteContentPlaceHolder_FormView1_dtlMILITARY_SERVICE_ctl00_ddlMILITARY_SVC_TODay', e_day if e_day != '00' else '')
            await safe_select(page, '#ctl00_SiteContentPlaceHolder_FormView1_dtlMILITARY_SERVICE_ctl00_ddlMILITARY_SVC_TOMonth', str(datos.get('militaryEndDateMonth', '')))
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_dtlMILITARY_SERVICE_ctl00_tbxMILITARY_SVC_TOYear', str(datos.get('militaryEndDateYear', '')))
        else:
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblMILITARY_SERVICE_IND_1')

        # Insurgent Org
        if datos.get('insurgentOrg') == 'Y':
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblINSURGENT_ORG_IND_0')
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxINSURGENT_ORG_EXPL', datos.get('insurgentOrgExplain', ''))
        else:
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblINSURGENT_ORG_IND_1')

        print("-> Additional Work/Education/Training completado.")

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

        # ========== 30. SECURITY AND BACKGROUND: PART 2 ==========
        print("-> Rellenando Security and Background: Part 2...")
        await page.wait_for_selector('#ctl00_SiteContentPlaceHolder_FormView1_rblArrested_1', state='visible', timeout=15000)

        # Arrested
        if datos.get('secArrested') == 'Y':
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblArrested_0')
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxArrested', datos.get('secArrestedExplain', ''))
        else:
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblArrested_1')

        # Controlled Substances
        if datos.get('secControlledSubstances') == 'Y':
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblControlledSubstances_0')
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxControlledSubstances', datos.get('secControlledSubstancesExplain', ''))
        else:
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblControlledSubstances_1')

        # Prostitution
        if datos.get('secProstitution') == 'Y':
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblProstitution_0')
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxProstitution', datos.get('secProstitutionExplain', ''))
        else:
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblProstitution_1')

        # Money Laundering
        if datos.get('secMoneyLaundering') == 'Y':
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblMoneyLaundering_0')
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxMoneyLaundering', datos.get('secMoneyLaunderingExplain', ''))
        else:
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblMoneyLaundering_1')

        # Human Trafficking
        if datos.get('secHumanTrafficking') == 'Y':
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblHumanTrafficking_0')
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxHumanTrafficking', datos.get('secHumanTraffickingExplain', ''))
        else:
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblHumanTrafficking_1')

        # Assisted Severe Trafficking
        if datos.get('secAssistedSevereTrafficking') == 'Y':
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblAssistedSevereTrafficking_0')
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxAssistedSevereTrafficking', datos.get('secAssistedSevereTraffickingExplain', ''))
        else:
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblAssistedSevereTrafficking_1')

        # Human Trafficking Related
        if datos.get('secHumanTraffickingRelated') == 'Y':
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblHumanTraffickingRelated_0')
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxHumanTraffickingRelated', datos.get('secHumanTraffickingRelatedExplain', ''))
        else:
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblHumanTraffickingRelated_1')

        print("-> Security and Background: Part 2 completado.")

        print("-> Click en Next: Security/Background Part 3...")
        async with page.expect_navigation(wait_until='networkidle', timeout=30000):
            await page.evaluate("document.getElementById('ctl00_SiteContentPlaceHolder_UpdateButton3').click()")
        print("-> Llegamos a Security/Background Part 3")

        # ========== 31. SECURITY AND BACKGROUND: PART 3 ==========
        print("-> Rellenando Security and Background: Part 3...")
        await page.wait_for_selector('#ctl00_SiteContentPlaceHolder_FormView1_rblIllegalActivity_1', state='visible', timeout=15000)

        # Illegal Activity
        if datos.get('secIllegalActivity') == 'Y':
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblIllegalActivity_0')
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxIllegalActivity', datos.get('secIllegalActivityExplain', ''))
        else:
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblIllegalActivity_1')

        # Terrorist Activity
        if datos.get('secTerroristActivity') == 'Y':
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblTerroristActivity_0')
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxTerroristActivity', datos.get('secTerroristActivityExplain', ''))
        else:
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblTerroristActivity_1')

        # Terrorist Support
        if datos.get('secTerroristSupport') == 'Y':
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblTerroristSupport_0')
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxTerroristSupport', datos.get('secTerroristSupportExplain', ''))
        else:
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblTerroristSupport_1')

        # Terrorist Org
        if datos.get('secTerroristOrg') == 'Y':
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblTerroristOrg_0')
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxTerroristOrg', datos.get('secTerroristOrgExplain', ''))
        else:
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblTerroristOrg_1')

        # Terrorist Rel
        if datos.get('secTerroristRel') == 'Y':
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblTerroristRel_0')
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxTerroristRel', datos.get('secTerroristRelExplain', ''))
        else:
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblTerroristRel_1')

        # Genocide
        if datos.get('secGenocide') == 'Y':
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblGenocide_0')
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxGenocide', datos.get('secGenocideExplain', ''))
        else:
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblGenocide_1')

        # Torture
        if datos.get('secTorture') == 'Y':
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblTorture_0')
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxTorture', datos.get('secTortureExplain', ''))
        else:
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblTorture_1')

        # ExViolence
        if datos.get('secExViolence') == 'Y':
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblExViolence_0')
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxExViolence', datos.get('secExViolenceExplain', ''))
        else:
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblExViolence_1')

        # Child Soldier
        if datos.get('secChildSoldier') == 'Y':
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblChildSoldier_0')
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxChildSoldier', datos.get('secChildSoldierExplain', ''))
        else:
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblChildSoldier_1')

        # Religious Freedom
        if datos.get('secReligiousFreedom') == 'Y':
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblReligiousFreedom_0')
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxReligiousFreedom', datos.get('secReligiousFreedomExplain', ''))
        else:
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblReligiousFreedom_1')

        # Population Controls
        if datos.get('secPopulationControls') == 'Y':
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblPopulationControls_0')
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxPopulationControls', datos.get('secPopulationControlsExplain', ''))
        else:
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblPopulationControls_1')

        # Transplant
        if datos.get('secTransplant') == 'Y':
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblTransplant_0')
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxTransplant', datos.get('secTransplantExplain', ''))
        else:
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblTransplant_1')

        print("-> Security and Background: Part 3 completado.")

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

        # ========== 33. SECURITY AND BACKGROUND: PART 5 ==========
        print("-> Rellenando Security and Background: Part 5...")
        await page.wait_for_selector('#ctl00_SiteContentPlaceHolder_FormView1_rblChildCustody_1', state='visible', timeout=15000)

        # Child Custody
        if datos.get('secChildCustody') == 'Y':
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblChildCustody_0')
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxChildCustody', datos.get('secChildCustodyExplain', ''))
        else:
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblChildCustody_1')

        # Voting Violation
        if datos.get('secVotingViolation') == 'Y':
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblVotingViolation_0')
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxVotingViolation', datos.get('secVotingViolationExplain', ''))
        else:
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblVotingViolation_1')

        # Renounce Citizenship for Tax
        if datos.get('secRenounceExp') == 'Y':
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblRenounceExp_0')
            await safe_fill(page, '#ctl00_SiteContentPlaceHolder_FormView1_tbxRenounceExp', datos.get('secRenounceExpExplain', ''))
        else:
            await check_and_wait('#ctl00_SiteContentPlaceHolder_FormView1_rblRenounceExp_1')

        print("-> Security and Background: Part 5 completado.")

        print("-> Click en Next: PHOTO...")
        async with page.expect_navigation(wait_until='networkidle', timeout=30000):
            await page.evaluate("document.getElementById('ctl00_SiteContentPlaceHolder_UpdateButton3').click()")
        print("-> Llegamos a PHOTO")

        # ========== 34. PHOTO ==========
        print("-> Click en Upload Your Photo...")
        await page.wait_for_selector('#ctl00_SiteContentPlaceHolder_btnUploadPhoto', state='visible', timeout=15000)
        async with page.expect_navigation(wait_until='networkidle', timeout=30000):
            await page.evaluate("document.getElementById('ctl00_SiteContentPlaceHolder_btnUploadPhoto').click()")
        print("-> Llegamos al sistema de subir foto")

        # ========== 35. PHOTO UPLOAD (SUBMIT) ==========
        print("-> Seleccionando archivo de foto...")
        await page.wait_for_selector('#ctl00_cphMain_imageFileUpload', state='visible', timeout=15000)
        
        photo_path = datos.get('photoPath', '')
        if photo_path:
            import os
            # Resolve to absolute path to avoid issues
            abs_photo_path = os.path.abspath(photo_path)
            if os.path.exists(abs_photo_path):
                print(f"-> Subiendo foto desde: {abs_photo_path}")
                await page.set_input_files('#ctl00_cphMain_imageFileUpload', abs_photo_path)
            else:
                print(f"-> [ADVERTENCIA] La foto {abs_photo_path} no existe. Crea el archivo si quieres pasar de aqui.")
        else:
            print("-> [ADVERTENCIA] No hay photoPath en datos.json")

        print("-> Click en Upload Selected Photo...")
        async with page.expect_navigation(wait_until='networkidle', timeout=30000):
            # The submit button acts as a form submit, sometimes it takes a while to upload
            await page.evaluate("document.getElementById('ctl00_cphButtons_btnUpload').click()")
        print("-> Foto enviada a validacion")

        print("-> Esperando 2 minutos antes de cerrar el navegador...")
        await page.wait_for_timeout(120000)

if __name__ == "__main__":
    asyncio.run(run())
