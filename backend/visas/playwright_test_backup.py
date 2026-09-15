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
        print("â†’ Navegando a CEAC...")
        await page.goto('https://ceac.state.gov/genniv/', wait_until='networkidle', timeout=60000)

        # ========== 2. SELECCIONAR BGT ==========
        print("â†’ Seleccionando BGT...")
        await page.select_option(
            'select[name="ctl00$SiteContentPlaceHolder$ucLocation$ddlLocation"]',
            'BGT'
        )
        await page.wait_for_timeout(2000)

        # ========== 3. CERRAR POPUP ==========
        print("â†’ Cerrando popup (Close)...")
        try:
            close_btn = await page.wait_for_selector(
                '#ctl00_SiteContentPlaceHolder_ucPostMessage_ucPost_ctl01_lnkClose',
                timeout=8000
            )
            await close_btn.click()
            print("   âœ… Close clickeado")
            await page.wait_for_timeout(1500)
        except:
            print("   âš ï¸ No apareciÃ³ el botÃ³n Close")

        # ========== 4. CAPTURAR + RESOLVER CAPTCHA ==========
        print("â†’ Capturando CAPTCHA...")
        await page.wait_for_selector('img[id*="CaptchaImage"]', timeout=10000)
        captcha_element = await page.query_selector('img[id*="CaptchaImage"]')
        captcha_bytes = await captcha_element.screenshot()
        
        with open("captcha.png", "wb") as f:
            f.write(captcha_bytes)

        print("â†’ Enviando a 2Captcha...")
        try:
            captcha_b64 = base64.b64encode(captcha_bytes).decode('utf-8')
            result = solver.normal(captcha_b64)
            captcha_text = result['code'].strip().upper()
            print(f"   âœ… CAPTCHA resuelto: {captcha_text}")
        except Exception as e:
            print(f"âŒ Error 2Captcha: {e}")
            return

        await page.fill(
            'input[name="ctl00$SiteContentPlaceHolder$ucLocation$IdentifyCaptcha1$txtCodeTextBox"]',
            captcha_text
        )
        await page.wait_for_timeout(500)

        # ========== 5. START AN APPLICATION ==========
        print("â†’ Click en START AN APPLICATION...")
        async with page.expect_navigation(wait_until='networkidle', timeout=30000):
            await page.click('#ctl00_SiteContentPlaceHolder_lnkNew')

        # ========== 6. ACEPTAR TÃ‰RMINOS ==========
        print("â†’ Aceptando tÃ©rminos (Privacy Act)...")
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
            print("   âœ… TÃ©rminos aceptados")
        except Exception as e:
            print(f"   âš ï¸ Error con checkbox: {e}")

        # ========== 7. PREGUNTA DE SEGURIDAD ==========
        print("â†’ Rellenando pregunta de seguridad...")
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
        print(f"   âœ… Pregunta: {chosen['value']} â†’ {chosen['answer']}")
        await page.wait_for_timeout(500)

        # ========== 8. CONTINUE ==========
        print("â†’ Click en Continue...")
        async with page.expect_navigation(wait_until='networkidle', timeout=30000):
            await page.click('#ctl00_SiteContentPlaceHolder_btnContinue')

        # ========== 9. PERSONAL INFORMATION 1 ==========
        print("â†’ Rellenando Personal Information 1...")

        await page.fill('#ctl00_SiteContentPlaceHolder_FormView1_tbxAPP_SURNAME', datos.get('surnames', ''))
        await page.fill('#ctl00_SiteContentPlaceHolder_FormView1_tbxAPP_GIVEN_NAME', datos.get('givenNames', ''))

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
        await page.fill('#ctl00_SiteContentPlaceHolder_FormView1_tbxAPP_POB_ST_PROVINCE', datos.get('pobState', ''))
        await page.select_option('#ctl00_SiteContentPlaceHolder_FormView1_ddlAPP_POB_CNTRY', datos.get('pobCountry', ''))
        await page.wait_for_timeout(500)
        print("   âœ… Personal Information 1 rellenada")

        # ========== 10. NEXT: PERSONAL 2 ==========
        print("â†’ Click en Next: Personal 2...")
        async with page.expect_navigation(wait_until='networkidle', timeout=30000):
            await page.click('#ctl00_SiteContentPlaceHolder_UpdateButton3')
        print("   âœ… Llegamos a Personal Information 2")

        # ========== 11. PERSONAL INFORMATION 2 ==========
        print("â†’ Rellenando Personal Information 2...")

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
        print("   âœ… Personal Information 2 rellenada")

        # ========== 12. NEXT: TRAVEL ==========
        print("â†’ Click en Next: Travel...")
        async with page.expect_navigation(wait_until='networkidle', timeout=30000):
            await page.click('#ctl00_SiteContentPlaceHolder_UpdateButton3')
        print("   âœ… Llegamos a Travel Information")

        # ========== 13. TRAVEL INFORMATION ==========
        print("â†’ Rellenando Travel Information...")

        await page.select_option('#ctl00_SiteContentPlaceHolder_FormView1_dlPrincipalAppTravel_ctl00_ddlPurposeOfTrip', datos.get('purposeOfTrip', ''))
        await page.wait_for_timeout(1500)

        await page.select_option('#ctl00_SiteContentPlaceHolder_FormView1_dlPrincipalAppTravel_ctl00_ddlOtherPurpose', datos.get('specifyPurpose', ''))
        await page.wait_for_timeout(800)

        if datos.get('specificTravelPlans') == 'Y':
            await page.click('#ctl00_SiteContentPlaceHolder_FormView1_rblSpecificTravel_0')
            await page.wait_for_timeout(1000)
            await page.select_option('#ctl00_SiteContentPlaceHolder_FormView1_ddlSpecificTravelArrivalDay', str(int(datos.get('specificArrivalDay', 0))))
            await page.select_option('#ctl00_SiteContentPlaceHolder_FormView1_ddlSpecificTravelArrivalMonth', str(datos.get('specificArrivalMonth', '')))
            await page.fill('#ctl00_SiteContentPlaceHolder_FormView1_tbxSpecificTravelArrivalYear', str(datos.get('specificArrivalYear', '')))
            await page.fill('#ctl00_SiteContentPlaceHolder_FormView1_tbxSpecificTravelArrivalFlight', datos.get('arrivalFlight', ''))
            await page.fill('#ctl00_SiteContentPlaceHolder_FormView1_tbxSpecificTravelArrivalCity', datos.get('arrivalCity', ''))
            
            await page.select_option('#ctl00_SiteContentPlaceHolder_FormView1_ddlSpecificTravelDepartDay', str(int(datos.get('specificDepDay', 0))))
            await page.select_option('#ctl00_SiteContentPlaceHolder_FormView1_ddlSpecificTravelDepartMonth', str(datos.get('specificDepMonth', '')))
            await page.fill('#ctl00_SiteContentPlaceHolder_FormView1_tbxSpecificTravelDepartYear', str(datos.get('specificDepYear', '')))
            await page.fill('#ctl00_SiteContentPlaceHolder_FormView1_tbxSpecificTravelDepartFlight', datos.get('departureFlight', ''))
            await page.fill('#ctl00_SiteContentPlaceHolder_FormView1_tbxSpecificTravelDepartCity', datos.get('departureCity', ''))
            await page.fill('#ctl00_SiteContentPlaceHolder_FormView1_dlSpecificTravelLocation_ctl00_tbxSpecificTravelLocation', datos.get('locationsToVisit', ''))
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

        print('â†’ Rellenando direcciÃ³n en EE.UU....')
        await page.fill('#ctl00_SiteContentPlaceHolder_FormView1_tbxStreetAddress1', datos.get('usStreet1', ''))
        if datos.get('usStreet2'):
            await page.fill('#ctl00_SiteContentPlaceHolder_FormView1_tbxStreetAddress2', datos.get('usStreet2', ''))
        await page.fill('#ctl00_SiteContentPlaceHolder_FormView1_tbxCity', datos.get('usCity', ''))
        await page.select_option('#ctl00_SiteContentPlaceHolder_FormView1_ddlTravelState', datos.get('usState', ''))
        await page.fill('#ctl00_SiteContentPlaceHolder_FormView1_tbZIPCode', datos.get('usZip', ''))
        await page.wait_for_timeout(600)

        await page.select_option('#ctl00_SiteContentPlaceHolder_FormView1_ddlWhoIsPaying', datos.get('whoIsPaying', 'S'))
        await page.wait_for_timeout(600)
        
        who_pays = datos.get('whoIsPaying', 'S')
        if who_pays == 'O':
            await page.fill('#ctl00_SiteContentPlaceHolder_FormView1_tbxPayerSurname', datos.get('payerSurname', ''))
            await page.fill('#ctl00_SiteContentPlaceHolder_FormView1_tbxPayerGivenName', datos.get('payerGivenName', ''))
            await page.fill('#ctl00_SiteContentPlaceHolder_FormView1_tbxPayerPhone', datos.get('payerPhone', ''))
            await page.fill('#ctl00_SiteContentPlaceHolder_FormView1_tbxPayerEmail', datos.get('payerEmail', ''))
            await page.select_option('#ctl00_SiteContentPlaceHolder_FormView1_ddlPayerRelationship', datos.get('payerRelationship', ''))
        elif who_pays in ['P', 'U', 'C', 'H']:
            await page.fill('#ctl00_SiteContentPlaceHolder_FormView1_tbxPayerOrgName', datos.get('payerOrgName', ''))
            await page.fill('#ctl00_SiteContentPlaceHolder_FormView1_tbxPayerOrgPhone', datos.get('payerOrgPhone', ''))
            await page.fill('#ctl00_SiteContentPlaceHolder_FormView1_tbxPayerOrgRelationship', datos.get('payerOrgRelationship', ''))

        print("   âœ… Travel Information rellenada correctamente")

        # ========== 14. NEXT: TRAVEL COMPANIONS ==========
        print("â†’ Click en Next: Travel Companions...")
        async with page.expect_navigation(wait_until='networkidle', timeout=30000):
            await page.click('#ctl00_SiteContentPlaceHolder_UpdateButton3')
        print("   âœ… Llegamos a Travel Companions")

        # ========== 15. TRAVEL COMPANIONS ==========
        print("â†’ Rellenando Travel Companions...")
        
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
                        print(f"â†’ Agregando acompaÃ±ante {i+2}...")
                        async with page.expect_navigation(wait_until='networkidle', timeout=30000):
                            await page.click(f'#ctl00_SiteContentPlaceHolder_FormView1_dlTravelCompanions_ctl{idx}_InsertButtonPrincipalPOT')
                        await page.wait_for_timeout(800)
            await page.wait_for_timeout(800)
        else:
            await page.click('#ctl00_SiteContentPlaceHolder_FormView1_rblOtherPersonsTravelingWithYou_1')
            await page.wait_for_timeout(800)
        print("   âœ… Travel Companions rellenada correctamente")

        # ========== 16. NEXT: PREVIOUS U.S. TRAVEL ==========
        print("â†’ Saliendo de Travel Companions y navegando a Previous U.S. Travel...")
        async with page.expect_navigation(wait_until='networkidle', timeout=30000):
            await page.click('#ctl00_SiteContentPlaceHolder_UpdateButton3')
        print("   âœ… Llegamos a Previous U.S. Travel")

        # ========== 17. PREVIOUS U.S. TRAVEL INFORMATION ==========
        print("â†’ Rellenando Previous U.S. Travel Information...")

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

        print("   âœ… Previous U.S. Travel Information rellenada correctamente")

        # ========== 18. NEXT: ADDRESS & PHONE ==========
        print("â†’ Click en Next: Address & Phone...")
        async with page.expect_navigation(wait_until='networkidle', timeout=30000):
            await page.click('#ctl00_SiteContentPlaceHolder_UpdateButton3')
            
        print("   âœ… Llegamos a Address & Phone")

        # ========== 19. ADDRESS AND PHONE INFORMATION ==========
        print("â†’ Rellenando Address & Phone Information...")
        
        await page.fill('#ctl00_SiteContentPlaceHolder_FormView1_tbxAPP_ADDR_LN1', datos.get('homeStreet1', ''))
        if datos.get('homeStreet2'):
            await page.fill('#ctl00_SiteContentPlaceHolder_FormView1_tbxAPP_ADDR_LN2', datos.get('homeStreet2', ''))
            
        await page.fill('#ctl00_SiteContentPlaceHolder_FormView1_tbxAPP_ADDR_CITY', datos.get('homeCity', ''))
        
        if datos.get('homeStateNA'):
            await page.check('#ctl00_SiteContentPlaceHolder_FormView1_cbxAPP_ADDR_STATE_NA')
        else:
            await page.fill('#ctl00_SiteContentPlaceHolder_FormView1_tbxAPP_ADDR_STATE', datos.get('homeState', ''))
            
        if datos.get('homeZipNA'):
            await page.check('#ctl00_SiteContentPlaceHolder_FormView1_cbxAPP_ADDR_POSTAL_CD_NA')
        else:
            await page.fill('#ctl00_SiteContentPlaceHolder_FormView1_tbxAPP_ADDR_POSTAL_CD', datos.get('homeZip', ''))
            
        await page.select_option('#ctl00_SiteContentPlaceHolder_FormView1_ddlAPP_ADDR_CNTRY', datos.get('homeCountry', 'MEX'))

        # Is your Mailing Address the same as your Home Address?
        if datos.get('sameMailingAddress') == 'Y':
            await page.click('#ctl00_SiteContentPlaceHolder_FormView1_rblAPP_MAIL_ADDR_SAME_IND_0') # Yes
        else:
            await page.click('#ctl00_SiteContentPlaceHolder_FormView1_rblAPP_MAIL_ADDR_SAME_IND_1') # No
            await page.wait_for_timeout(800)
            
        await page.fill('#ctl00_SiteContentPlaceHolder_FormView1_tbxAPP_HOME_TEL', datos.get('primaryPhone', ''))
        
        if datos.get('secondaryPhoneNA'):
            await page.check('#ctl00_SiteContentPlaceHolder_FormView1_cbxAPP_MOBILE_TEL_NA')
        else:
            await page.fill('#ctl00_SiteContentPlaceHolder_FormView1_tbxAPP_MOBILE_TEL', datos.get('secondaryPhone', ''))
            
        if datos.get('workPhoneNA'):
            await page.check('#ctl00_SiteContentPlaceHolder_FormView1_cbxAPP_BUS_TEL_NA')
        else:
            await page.fill('#ctl00_SiteContentPlaceHolder_FormView1_tbxAPP_BUS_TEL', datos.get('workPhone', ''))

        await page.fill('#ctl00_SiteContentPlaceHolder_FormView1_tbxAPP_EMAIL_ADDR', datos.get('emailAddress', ''))
        
        if datos.get('otherEmails') == 'Y':
            await page.click('#ctl00_SiteContentPlaceHolder_FormView1_rblAPP_OTHER_EMAIL_IND_0')
            await page.wait_for_timeout(800)
        else:
            await page.click('#ctl00_SiteContentPlaceHolder_FormView1_rblAPP_OTHER_EMAIL_IND_1')
            
        # Social Media
        platform = datos.get('socialMediaPlatform', 'NONE')
        await page.select_option('#ctl00_SiteContentPlaceHolder_FormView1_dlSocialMedia_ctl00_ddlPLATFORM', platform)
        if platform != 'NONE':
            await page.fill('#ctl00_SiteContentPlaceHolder_FormView1_dlSocialMedia_ctl00_tbxSOCIAL_MEDIA_ID', datos.get('socialMediaHandle', ''))

        # Other websites
        if datos.get('otherSocialMedia') == 'Y':
            await page.click('#ctl00_SiteContentPlaceHolder_FormView1_rblAPP_OTHER_SOCIAL_MEDIA_IND_0')
        else:
            await page.click('#ctl00_SiteContentPlaceHolder_FormView1_rblAPP_OTHER_SOCIAL_MEDIA_IND_1')

        print("   âœ… Address & Phone Information rellenada correctamente")

        # ========== 20. NEXT: PASSPORT ==========
        print("â†’ Click en Next: Passport...")
        async with page.expect_navigation(wait_until='networkidle', timeout=30000):
            await page.click('#ctl00_SiteContentPlaceHolder_UpdateButton3')
            
        print("   âœ… Llegamos a Passport")

        print(f"\nâœ… Proceso completado exitosamente hasta la SecciÃ³n Passport")
        print(f"   URL actual: {page.url}")
        print(f"   TÃ­tulo: {await page.title()}")

        input("\nPresiona Enter para cerrar el navegador...")

if __name__ == "__main__":
    asyncio.run(run())
