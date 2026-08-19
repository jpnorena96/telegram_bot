import asyncio
from playwright.async_api import async_playwright
import httpx
from bs4 import BeautifulSoup
import ddddocr
import logging
import time
import os

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

async def init_session_with_playwright(proxy_url=None):
    async with async_playwright() as p:
        launch_args = {
            "headless": False,  
            "args": ["--start-maximized"]
        }
        logging.info("1. Iniciando navegador con Playwright...")
        browser = await p.chromium.launch(**launch_args)
        
        context_args = {"no_viewport": True}
        
        if proxy_url:
            from urllib.parse import urlparse
            parsed = urlparse(proxy_url)
            if parsed.username and parsed.password:
                context_args["proxy"] = {
                    "server": f"{parsed.scheme}://{parsed.hostname}:{parsed.port}",
                    "username": parsed.username,
                    "password": parsed.password
                }
            else:
                context_args["proxy"] = {"server": proxy_url}
                
        context = await browser.new_context(**context_args)
        page = await context.new_page()

        max_retries = 10
        for attempt in range(1, max_retries + 1):
            logging.info(f"\n--- Intento {attempt} de {max_retries} (Playwright) ---")
            
            logging.info("2. Navegando a CEAC DS-160...")
            try:
                await page.goto('https://ceac.state.gov/genniv/', wait_until="domcontentloaded", timeout=30000)
            except Exception as e:
                logging.error(f"Error de red al navegar: {e}")
                logging.info("Es probable que el proxy haya sido rechazado por el servidor.")
                continue
            
            logging.info("3. Seleccionando la ubicación BGT...")
            await page.select_option('select[name="ctl00$SiteContentPlaceHolder$ucLocation$ddlLocation"]', 'BGT')
            
            logging.info("Esperando el Postback (recarga)...")
            # El proxy puede hacer que el postback sea lento. 
            # Esperamos a que no haya peticiones de red activas para asegurar que recargó.
            try:
                await page.wait_for_load_state("networkidle", timeout=15000)
            except Exception:
                # Si falla el networkidle (por algún script residual), damos una pausa fija larga
                await asyncio.sleep(8)
                
            await asyncio.sleep(2) # Pausa de seguridad adicional antes de interactuar 
            
            captcha_img_locator = page.locator('img[id*="CaptchaImage"]')
            if await captcha_img_locator.count() == 0:
                logging.warning("No cargó la imagen del Captcha.")
                continue
                
            logging.info("4. Descargando imagen del Captcha...")
            img_name = 'captcha_playwright.png'
            if os.path.exists(img_name):
                os.remove(img_name)
            await captcha_img_locator.first.screenshot(path=img_name)
            
            logging.info("5. Resolviendo Captcha con ddddocr...")
            ocr = ddddocr.DdddOcr(show_ad=False)
            with open(img_name, 'rb') as f:
                img_bytes = f.read()
            captcha_text = ocr.classification(img_bytes).upper()
            logging.info(f" -> CAPTCHA resuelto: {captcha_text}")
            
            logging.info("Llenando el input...")
            captcha_input = page.locator('input[id*="txtCodeTextBox"]')
            await captcha_input.first.fill("")
            await captcha_input.first.type(captcha_text, delay=150) 
            
            await asyncio.sleep(1)
            
            logging.info("6. Haciendo clic en START AN APPLICATION (ValidNavigation)...")
            # Hover & Click
            btn_start = page.locator('a[id="ctl00_SiteContentPlaceHolder_lnkNew"]')
            await btn_start.first.hover()
            await asyncio.sleep(1)
            
            # Clic nativo
            await btn_start.first.click()
            
            logging.info("7. Esperando respuesta del servidor...")
            await asyncio.sleep(5)
            
            page_title = await page.title()
            
            if "Session Timed Out" in page_title:
                logging.error("❌ Sesión caducada. Akamai bloqueó el request. Prueba cambiando de proxy.")
                continue
                
            error_msg = page.locator('span[id*="lblError"]')
            if await error_msg.count() > 0:
                text = await error_msg.first.text_content()
                if text:
                    logging.warning(f"❌ Error en formulario: {text.strip()}")
                    continue
                    
            app_id_locator = page.locator('span[id*="lblAppID"]')
            page_html = await page.content()
            
            if await app_id_locator.count() > 0 or "Computer Fraud" in page_html or "Terms and Conditions" in page_html:
                logging.info(f"✅ ¡ÉXITO! Logramos saltar el Captcha con Playwright.")
                
                # --- NUEVA FASE: PREGUNTAS DE SEGURIDAD ---
                logging.info("8. Configurando Pregunta de Seguridad (Computer Fraud Page)...")
                
                # Seleccionar Checkbox de Privacidad
                chk_privacy = page.locator('input[id*="chkbxPrivacyAct"]')
                if await chk_privacy.count() > 0:
                    logging.info(" -> Aceptando Privacy Act...")
                    await chk_privacy.first.click()
                    # El checkbox dispara un postback que habilita el dropdown, esperamos a que pase
                    try:
                        await page.wait_for_load_state("networkidle", timeout=10000)
                    except:
                        await asyncio.sleep(4)
                
                # Seleccionar Pregunta
                ddl_questions = page.locator('select[id*="ddlQuestions"]')
                if await ddl_questions.count() > 0:
                    logging.info(" -> Seleccionando pregunta de seguridad...")
                    # Forzar remoción del disabled por si el postback falló
                    await page.evaluate('document.getElementById("ctl00_SiteContentPlaceHolder_ddlQuestions").removeAttribute("disabled");')
                    await ddl_questions.first.select_option("1") # What is the given name of your mother's mother?
                
                # Escribir Respuesta
                txt_answer = page.locator('input[id*="txtAnswer"]')
                if await txt_answer.count() > 0:
                    logging.info(" -> Escribiendo clave segura (Token)...")
                    secure_token = "SECURETOKEN99"
                    await page.evaluate('document.getElementById("ctl00_SiteContentPlaceHolder_txtAnswer").removeAttribute("disabled");')
                    await txt_answer.first.fill(secure_token)
                
                # Clic en Continue
                btn_continue = page.locator('input[id*="btnContinue"]')
                if await btn_continue.count() > 0:
                    logging.info(" -> Haciendo clic en Continue...")
                    await page.evaluate('document.getElementById("ctl00_SiteContentPlaceHolder_btnContinue").removeAttribute("disabled");')
                    await btn_continue.first.click()
                    
                    logging.info("Esperando redirección final...")
                    try:
                        await page.wait_for_load_state("networkidle", timeout=15000)
                    except:
                        await asyncio.sleep(5)
                
                app_id_final = await page.locator('span[id*="lblAppID"]').first.text_content()
                if app_id_final:
                    logging.info(f"🎉 APPLICATION ID FINAL: {app_id_final.strip()}")
                
                # --- NUEVO: LLENAR CON PLAYWRIGHT ---
                logging.info("➡️ Llenando Personal 1 con Playwright...")
                await page.fill('input[name*="tbxAPP_SURNAME"]', "PEREZ")
                await page.fill('input[name*="tbxAPP_GIVEN_NAME"]', "JUAN")
                
                # En Playwright, al hacer check a la casilla NA, se dispara el JS enableTbx automáticamente!
                await page.check('input[id*="cbexAPP_FULL_NAME_NATIVE_NA"]') 
                
                await page.check('input[id*="rblOtherNames_1"]') # N
                await page.check('input[id*="rblTelecodeQuestion_1"]') # N
                await page.select_option('select[id*="ddlAPP_GENDER"]', "M")
                await page.select_option('select[id*="ddlAPP_MARITAL_STATUS"]', "S")
                
                await page.select_option('select[id*="ddlDOBDay"]', "01")
                await page.select_option('select[id*="ddlDOBMonth"]', "JAN")
                await page.fill('input[id*="tbxDOBYear"]', "1990")
                
                await page.fill('input[id*="tbxAPP_POB_CITY"]', "BOGOTA")
                await page.check('input[id*="cbexAPP_POB_ST_PROVINCE_NA"]')
                await page.select_option('select[id*="ddlAPP_POB_CNTRY"]', "COL")
                
                logging.info("➡️ Avanzando a Personal 2...")
                await page.click('input[name*="UpdateButton3"]') # Next: Personal 2
                await page.wait_for_load_state("networkidle")
                
                logging.info("➡️ Llenando Personal 2 con Playwright...")
                await page.select_option('select[id*="ddlAPP_NATL"]', "COL")
                await page.check('input[id*="rblAPP_OTH_NATL_IND_1"]')
                await page.check('input[id*="rblPermResOtherCntryInd_1"]')
                await page.check('input[id*="cbexAPP_NATIONAL_ID_NA"]')
                await page.check('input[id*="cbexAPP_SSN_NA"]')
                await page.check('input[id*="cbexAPP_TAX_ID_NA"]')
                
                logging.info("➡️ Avanzando a Travel Companions...")
                await page.click('input[name*="UpdateButton3"]') # Next: Travel Companions
                await page.wait_for_load_state("networkidle")
                
                logging.info("📸 Tomando foto de la victoria...")
                await page.screenshot(path="foto_victoria_playwright.png", full_page=True)
                logging.info("¡Foto guardada como foto_victoria_playwright.png!")
                
                # Esperar 5 seg antes de cerrar
                await asyncio.sleep(5)
                
                await browser.close()
                return True
            else:
                logging.warning(f"⚠️ Terminado en página desconocida: {page_title}")
                
        await browser.close()
        return False

def test_hybrid_flow(proxy_url=None):
    # Usamos Playwright para todo el flujo inicial
    exito = asyncio.run(init_session_with_playwright(proxy_url))
    if exito:
        logging.info("✅ PROCESO COMPLETADO EXITOSAMENTE CON PLAYWRIGHT.")
    else:
        logging.error("❌ Falló el proceso.")

def get_webshare_proxies():
    import requests
    url = "https://proxy.webshare.io/api/v2/proxy/list/?mode=direct&page_size=10"
    headers = {"Authorization": "Token s6mczg9zancfvko7uud1vgv8adkbhny06motmtyp"}
    try:
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            data = response.json()
            proxies = []
            for p in data.get("results", []):
                if p["valid"]:
                    proxy_str = f"http://{p['username']}:{p['password']}@{p['proxy_address']}:{p['port']}"
                    proxies.append(proxy_str)
            return proxies
    except Exception as e:
        logging.error(f"Error descargando proxies de Webshare: {e}")
    return []

if __name__ == "__main__":
    logging.info("Descargando proxies rotativos de Webshare...")
    proxies = get_webshare_proxies()
    
    if not proxies:
        logging.warning("No se pudieron obtener proxies, probando sin proxy...")
        test_hybrid_flow(proxy_url=None)
    else:
        logging.info(f"Se encontraron {len(proxies)} proxies activos. Iniciando rotación...")
        for pxy in proxies:
            logging.info(f"\n======================================")
            logging.info(f"Probando proxy: {pxy}")
            logging.info(f"======================================\n")
            test_hybrid_flow(proxy_url=pxy)
            # Como test_hybrid_flow ya hace 10 reintentos internos, si falla pasará al siguiente proxy en la lista de Webshare

