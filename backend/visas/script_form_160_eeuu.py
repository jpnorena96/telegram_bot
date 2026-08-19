from curl_cffi import requests
from bs4 import BeautifulSoup
import ddddocr
import logging
import time

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def extraer_todos_los_campos(soup):
    campos = {}
    for input_tag in soup.find_all('input'):
        nombre = input_tag.get('name')
        if not nombre:
            continue
        tipo = input_tag.get('type', 'text').lower()
        if tipo not in ['submit', 'button', 'image']:
            campos[nombre] = input_tag.get('value', '')
    return campos

def iniciar_tramite_ds160():
    url_base = "https://ceac.state.gov"
    url_inicio = f"{url_base}/GenNIV/Default.aspx"
    ubicacion = "BGT"
    
    # Impersonamos Chrome 120 para evadir la huella TLS de Akamai
    session = requests.Session(impersonate="chrome120")
    
    session.headers.update({
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "es-ES,es;q=0.9,en-US;q=0.8,en;q=0.7",
        "Upgrade-Insecure-Requests": "1"
    })

    logging.info("1. Haciendo GET inicial...")
    resp1 = session.get(url_inicio)
    soup1 = BeautifulSoup(resp1.text, 'html.parser')
    tokens_paso1 = extraer_todos_los_campos(soup1)

    logging.info(f"2. Enviando Postback para ubicación: {ubicacion}...")
    payload_ubicacion = tokens_paso1.copy()
    payload_ubicacion.update({
        "__EVENTTARGET": "ctl00$SiteContentPlaceHolder$ucLocation$ddlLocation",
        "__EVENTARGUMENT": "",
        "ctl00$SiteContentPlaceHolder$ucLocation$ddlLocation": ubicacion
    })
    
    # Referer estricto
    session.headers["Referer"] = url_inicio
    resp2 = session.post(url_inicio, data=payload_ubicacion)
    soup2 = BeautifulSoup(resp2.text, 'html.parser')
    tokens_paso2 = extraer_todos_los_campos(soup2)

    logging.info("3. Extrayendo y resolviendo CAPTCHA...")
    img_tag = soup2.find('img', id=lambda x: x and 'CaptchaImage' in x)
    
    if not img_tag:
        logging.error("No se encontró el CAPTCHA.")
        return

    captcha_url = url_base + img_tag.get('src')
    resp_captcha = session.get(captcha_url)
    
    ocr = ddddocr.DdddOcr(show_ad=False)
    texto_captcha = ocr.classification(resp_captcha.content).upper()
    logging.info(f" -> CAPTCHA resuelto: {texto_captcha}")

    logging.info("4. Enviando formulario final...")
    payload_final = tokens_paso2.copy()
    payload_final.update({
        "__EVENTTARGET": "ctl00$SiteContentPlaceHolder$lnkNew",
        "__EVENTARGUMENT": "",
        "ctl00$SiteContentPlaceHolder$ucLocation$ddlLocation": ubicacion,
        "ctl00$SiteContentPlaceHolder$ucLocation$IdentifyCaptcha1$txtCodeTextBox": texto_captcha
    })

    # APAGAMOS las redirecciones automáticas (allow_redirects=False)
    session.headers["Referer"] = url_inicio
    resp3 = session.post(url_inicio, data=payload_final, allow_redirects=False)
    
    html_final = resp3.text
    url_actual = url_inicio

    # --- CONTROL MANUAL DE REDIRECCIONES (Evita pérdida de sesión) ---
    if resp3.status_code == 302:
        loc1 = resp3.headers.get('Location')
        url_redirect1 = f"{url_base}{loc1}" if loc1.startswith('/') else loc1
        logging.info(f" -> Servidor aceptó el POST. Redirigiendo a: {url_redirect1}")
        
        # El referer para esta carga debe ser la página desde donde hicimos el POST
        session.headers["Referer"] = url_inicio
        resp4 = session.get(url_redirect1, allow_redirects=False)
        
        if resp4.status_code == 302:
            loc2 = resp4.headers.get('Location')
            url_redirect2 = f"{url_base}{loc2}" if loc2.startswith('/') else loc2
            logging.info(f" -> Segunda redirección hacia: {url_redirect2}")
            
            # El referer ahora cambia a la URL intermedia
            session.headers["Referer"] = url_redirect1
            resp5 = session.get(url_redirect2, allow_redirects=False)
            html_final = resp5.text
            url_actual = url_redirect2
        else:
            html_final = resp4.text
            url_actual = url_redirect1

    logging.info(f" -> Aterrizamos en: {url_actual}")

    ## PASO 5: Validación de Éxito
    soup_final = BeautifulSoup(html_final, 'html.parser')
    titulo = soup_final.title.string.strip() if soup_final.title else "Sin Título"
    
    if "Session Timed Out" in titulo:
        logging.error("❌ Sesión caducada. Akamai bloqueó el request en el último paso.")
    elif "Application Information" in titulo or "Security Question" in titulo:
        logging.info("✅ ¡Éxito absoluto! Bypasseado correctamente.")
        app_id = soup_final.find('span', id=lambda x: x and 'lblAppID' in x)
        if app_id:
            logging.info(f"🎉 APPLICATION ID: {app_id.text}")
    else:
        logging.warning(f"⚠️ Terminado en página desconocida: {titulo}")

if __name__ == "__main__":
    iniciar_tramite_ds160()