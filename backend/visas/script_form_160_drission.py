import os
import time
import logging
import zipfile
import io
import requests
from urllib.parse import urlparse
from DrissionPage import ChromiumPage, ChromiumOptions
import ddddocr
from PIL import Image

TELEGRAM_TOKEN = "8451235369:AAFeoGdbIHfRyxAyaBgnV300V91zs-CbtMo"
TELEGRAM_CHAT_ID = "TU_CHAT_ID_AQUI" # ⚠️ REEMPLAZAR CON TU CHAT ID DE TELEGRAM

def notificar_telegram(mensaje):
    if TELEGRAM_CHAT_ID == "TU_CHAT_ID_AQUI":
        return
    url = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage"
    payload = {
        "chat_id": TELEGRAM_CHAT_ID,
        "text": mensaje,
        "parse_mode": "HTML"
    }
    try:
        requests.post(url, json=payload, timeout=5)
    except Exception as e:
        logging.error(f"Error notificando a Telegram: {e}")

def create_proxy_auth_extension(proxy_url):
    parsed = urlparse(proxy_url)
    if not parsed.username or not parsed.password:
        return None
        
    manifest_json = """
    {
        "version": "1.0.0",
        "manifest_version": 2,
        "name": "Proxy Auth Extension",
        "permissions": [
            "proxy",
            "tabs",
            "unlimitedStorage",
            "storage",
            "<all_urls>",
            "webRequest",
            "webRequestBlocking"
        ],
        "background": {
            "scripts": ["background.js"]
        },
        "minimum_chrome_version":"22.0.0"
    }
    """
    
    background_js = f"""
    var config = {{
            mode: "fixed_servers",
            rules: {{
              singleProxy: {{
                scheme: "http",
                host: "{parsed.hostname}",
                port: parseInt({parsed.port})
              }},
              bypassList: ["localhost"]
            }}
          }};
          
    chrome.proxy.settings.set({{value: config, scope: "regular"}}, function() {{}});
    
    function callbackFn(details) {{
        return {{
            authCredentials: {{
                username: "{parsed.username}",
                password: "{parsed.password}"
            }}
        }};
    }}
    
    chrome.webRequest.onAuthRequired.addListener(
                callbackFn,
                {{urls: ["<all_urls>"]}},
                ['blocking']
    );
    """
    
    plugin_folder = os.path.abspath('proxy_auth_plugin_ext')
    os.makedirs(plugin_folder, exist_ok=True)
    
    with open(os.path.join(plugin_folder, "manifest.json"), 'w') as f:
        f.write(manifest_json)
        
    with open(os.path.join(plugin_folder, "background.js"), 'w') as f:
        f.write(background_js)
        
    return plugin_folder

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def init_session_with_drission(proxy_url=None):
    co = ChromiumOptions()
    
    if proxy_url:
        plugin = create_proxy_auth_extension(proxy_url)
        if plugin:
            co.add_extension(plugin)
            logging.info("Extensión de proxy con autenticación cargada exitosamente.")
        else:
            co.set_proxy(proxy_url)
    
    co.set_argument('--start-maximized')
    co.set_argument('--disable-infobars')
    co.set_argument('--disable-popup-blocking')
    
    logging.info("1. Iniciando navegador con DrissionPage...")
    page = ChromiumPage(co)
    
    max_retries = 10
    success = False
    
    for attempt in range(1, max_retries + 1):
        logging.info(f"\n--- Intento {attempt} de {max_retries} (DrissionPage) ---")
        
        logging.info("2. Navegando a CEAC DS-160...")
        try:
            page.get('https://ceac.state.gov/genniv/', timeout=30)
        except Exception as e:
            logging.error(f"Error de red al navegar: {e}")
            logging.info("Es probable que el proxy haya sido rechazado por el servidor.")
            continue
        
        # Esperamos que cargue la página inicial
        page.wait.load_start()
        
        logging.info("3. Seleccionando la ubicación BGT...")
        try:
            # Esperar a que el selector de ubicación exista
            ddl_location = page.wait.ele_displayed('@name=ctl00$SiteContentPlaceHolder$ucLocation$ddlLocation', timeout=15)
            if not ddl_location:
                logging.warning("No cargó el selector de ubicación. Posible bloqueo de Cloudflare/Akamai.")
                page.get_screenshot(path=f'debug_bloqueo_{attempt}.png')
                continue
                
            # Esperar un momento a que las opciones del AJAX carguen
            time.sleep(1.5)
            
            ddl_location.select.by_value('BGT')
            
            logging.info("Esperando el Postback (recarga)...")
            page.wait.load_start()
            time.sleep(2) # Pausa de seguridad
            
            captcha_img_locator = page.wait.ele_displayed('css:img[id*="CaptchaImage"]', timeout=15)
            if not captcha_img_locator:
                logging.warning("No cargó la imagen del Captcha. Posible bloqueo.")
                continue
                
        except Exception as e:
            logging.error(f"Error interactuando con la página (bloqueo): {e}")
            continue
            
        logging.info("4. Descargando imagen del Captcha...")
        img_name = 'captcha_drission.png'
        if os.path.exists(img_name):
            os.remove(img_name)
        captcha_img_locator.get_screenshot(path=img_name)
        
        logging.info("5. Procesando y resolviendo Captcha con ddddocr...")
        
        # Procesamiento de imagen con PIL para limpiar ruido
        try:
            img = Image.open(img_name)
            img = img.convert("L") # Blanco y negro
            # Binarización para eliminar ruido de fondo (ajustable)
            threshold = 120
            img = img.point(lambda p: p > threshold and 255)
            
            img_byte_arr = io.BytesIO()
            img.save(img_byte_arr, format='PNG')
            img_bytes = img_byte_arr.getvalue()
        except Exception as e:
            logging.warning(f"Error procesando imagen: {e}. Usando original.")
            with open(img_name, 'rb') as f:
                img_bytes = f.read()

        ocr = ddddocr.DdddOcr(show_ad=False)
        captcha_text = ocr.classification(img_bytes).upper()
        
        # Validación de captcha: si tiene caracteres raros o longitud inválida, reintentar
        import re
        if not re.match(r'^[A-Z0-9]{5}$', captcha_text):
            logging.warning(f"❌ Captcha inválido generado por ddddocr: {captcha_text}. Reintentando...")
            continue
            
        logging.info(f" -> CAPTCHA resuelto: {captcha_text}")
        
        logging.info("Llenando el input...")
        captcha_input = page.ele('css:input[id*="txtCodeTextBox"]')
        captcha_input.input(captcha_text, clear=True)
        time.sleep(1)
        
        logging.info("6. Haciendo clic en START AN APPLICATION...")
        btn_start = page.ele('css:a[id*="lnkNew"]')
        btn_start.click()
        
        logging.info("7. Esperando respuesta del servidor...")
        page.wait.load_start()
        time.sleep(3)
        
        page_title = page.title
        
        if "Session Timed Out" in page_title:
            logging.error("❌ Sesión caducada. Akamai bloqueó el request.")
            continue
            
        error_msg = page.ele('css:span[id*="lblError"]')
        if error_msg:
            text = error_msg.text
            if text:
                logging.warning(f"❌ Error en formulario: {text.strip()}")
                continue
                
        app_id_locator = page.ele('css:span[id*="lblAppID"]')
        
        if (app_id_locator and app_id_locator.text) or "Insstructions" in page_title or "Instructions" in page_title:
            app_id_str = app_id_locator.text if (app_id_locator and app_id_locator.text) else "Desconocido (Ver Pantalla)"
            logging.info(f"✅ ¡ÉXITO! Logramos saltar el Captcha con DrissionPage. Application ID: {app_id_str}")
            
            # 🚀 ENVIAR NOTIFICACIÓN A TELEGRAM
            notificar_telegram(f"✅ <b>¡Captcha de Visa Resuelto!</b>\nApplication ID: <code>{app_id_str}</code>\nEl script de DrissionPage logró entrar a CEAC.")
            
            # --- NUEVA FASE: PREGUNTAS DE SEGURIDAD ---
            logging.info("8. Configurando Pregunta de Seguridad (Computer Fraud Page)...")
            
            chk_privacy = page.ele('css:input[id*="chkbxPrivacyAct"]')
            if chk_privacy:
                logging.info(" -> Aceptando Privacy Act...")
                chk_privacy.click()
                time.sleep(3)
            
            ddl_questions = page.ele('css:select[id*="ddlQuestions"]')
            if ddl_questions:
                logging.info(" -> Seleccionando pregunta de seguridad...")
                page.run_js('document.getElementById("ctl00_SiteContentPlaceHolder_ddlQuestions").removeAttribute("disabled");')
                ddl_questions.select("1") 
            
            txt_answer = page.ele('css:input[id*="txtAnswer"]')
            if txt_answer:
                logging.info(" -> Escribiendo clave segura (Token)...")
                secure_token = "SECURETOKEN99"
                page.run_js('document.getElementById("ctl00_SiteContentPlaceHolder_txtAnswer").removeAttribute("disabled");')
                txt_answer.input(secure_token, clear=True)
            
            btn_continue = page.ele('css:input[id*="btnContinue"]')
            if btn_continue:
                logging.info(" -> Haciendo clic en Continue...")
                page.run_js('document.getElementById("ctl00_SiteContentPlaceHolder_btnContinue").removeAttribute("disabled");')
                btn_continue.click()
                
                logging.info("Esperando redirección final...")
                page.wait.load_start()
                time.sleep(3)
            
            app_id_final = page.ele('css:span[id*="lblAppID"]')
            if app_id_final:
                logging.info(f"🎉 APPLICATION ID FINAL: {app_id_final.text.strip()}")
            
            # --- NUEVO: LLENAR CON DRISSIONPAGE ---
            logging.info("➡️ Llenando Personal 1 con DrissionPage...")
            page.ele('css:input[name*="tbxAPP_SURNAME"]').input("PEREZ")
            page.ele('css:input[name*="tbxAPP_GIVEN_NAME"]').input("JUAN")
            
            page.ele('css:input[id*="cbexAPP_FULL_NAME_NATIVE_NA"]').click()
            
            page.ele('css:input[id*="rblOtherNames_1"]').click() # N
            page.ele('css:input[id*="rblTelecodeQuestion_1"]').click() # N
            page.ele('css:select[id*="ddlAPP_GENDER"]').select("M")
            page.ele('css:select[id*="ddlAPP_MARITAL_STATUS"]').select("S")
            
            page.ele('css:select[id*="ddlDOBDay"]').select("01")
            page.ele('css:select[id*="ddlDOBMonth"]').select("JAN")
            page.ele('css:input[id*="tbxDOBYear"]').input("1990")
            
            page.ele('css:input[id*="tbxAPP_POB_CITY"]').input("BOGOTA")
            page.ele('css:input[id*="cbexAPP_POB_ST_PROVINCE_NA"]').click()
            page.ele('css:select[id*="ddlAPP_POB_CNTRY"]').select("COL")
            
            logging.info("➡️ Avanzando a Personal 2...")
            page.ele('css:input[name*="UpdateButton3"]').click()
            page.wait.load_start()
            
            logging.info("➡️ Llenando Personal 2 con DrissionPage...")
            page.ele('css:select[id*="ddlAPP_NATL"]').select("COL")
            page.ele('css:input[id*="rblAPP_OTH_NATL_IND_1"]').click()
            page.ele('css:input[id*="rblPermResOtherCntryInd_1"]').click()
            page.ele('css:input[id*="cbexAPP_NATIONAL_ID_NA"]').click()
            page.ele('css:input[id*="cbexAPP_SSN_NA"]').click()
            page.ele('css:input[id*="cbexAPP_TAX_ID_NA"]').click()
            
            logging.info("➡️ Avanzando a Travel Companions...")
            page.ele('css:input[name*="UpdateButton3"]').click()
            page.wait.load_start()
            
            logging.info("📸 Tomando foto de la victoria...")
            page.get_screenshot(path="foto_victoria_drission.png", full_page=True)
            logging.info("¡Foto guardada como foto_victoria_drission.png!")
            
            time.sleep(5)
            page.quit()
            success = True
            break
        else:
            logging.warning(f"⚠️ Terminado en página desconocida: {page_title}")
            
    if not success:
        page.quit()
        return False
    return True

def test_hybrid_flow(proxy_url=None):
    exito = init_session_with_drission(proxy_url)
    if exito:
        logging.info("✅ PROCESO COMPLETADO EXITOSAMENTE CON DRISSIONPAGE.")
    else:
        logging.error("❌ Falló el proceso.")

if __name__ == "__main__":
    logging.info("Usando proxy rotativo residencial de Webshare con DrissionPage...")
    
    proxy_rotativo = "http://yhjxpuutresidential-US-1:voge365lc96q@p.webshare.io:80"
    
    logging.info(f"\n======================================")
    logging.info(f"Iniciando flujo con proxy: {proxy_rotativo}")
    logging.info(f"======================================\n")
    
    test_hybrid_flow(proxy_url=proxy_rotativo)
