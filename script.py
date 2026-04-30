import json
import logging
import os.path
import random
import re
import sys
import time
from datetime import datetime, date, timedelta
from typing import Optional
from urllib.parse import urlencode
import requests
from bs4 import BeautifulSoup
from requests import Response, HTTPError
import os
import tkinter as tk
from tkinter import ttk, messagebox, scrolledtext
import mysql.connector
from mysql.connector import Error
import os
import subprocess
import threading
import queue
from datetime import datetime

HOST = 'ais.usvisa-info.com'
REFERER = 'Referer'
ACCEPT = 'Accept'
SET_COOKIE = 'set-cookie'
CONTENT_TYPE = 'Content-Type'
CACHE_CONTROL_HEADERS = {'Cache-Control': 'no-store'}
DEFAULT_HEADERS = {
    'Host': HOST,
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 YaBrowser/24.1.0.0 Safari/537.36',
    'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "YaBrowser";v="24.1", "Yowser";v="2.5"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': 'Windows'
}
SEC_FETCH_USER_HEADERS = {'Sec-Fetch-User': '?1'}
DOCUMENT_HEADERS = {
    **DEFAULT_HEADERS,
    **CACHE_CONTROL_HEADERS,
    ACCEPT: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'ru,en;q=0.9,de;q=0.8,bg;q=0.7',
    'Connection': 'keep-alive',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'same-origin',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Upgrade-Insecure-Requests': '1'
}
JSON_HEADERS = {
    **DEFAULT_HEADERS,
    ACCEPT: 'application/json, text/javascript, */*; q=0.01',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'ru,en;q=0.9,de;q=0.8,bg;q=0.7',
    'Connection': 'keep-alive',
    'X-Requested-With': 'XMLHttpRequest',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-origin'
}
X_CSRF_TOKEN_HEADER = 'X-CSRF-Token'
COOKIE_HEADER = 'Cookie'
DATE_TIME_FORMAT = '%H:%M %Y-%m-%d'
DATE_FORMAT = '%d.%m.%Y'
HTML_PARSER = 'html.parser'
NONE = 'None'
CONFIG_FILE = 'config'
ASC_FILE = 'asc'
LOG_FILE = 'log.txt'
LOG_FORMAT = '%(asctime)s  %(message)s'


# Telegram — se leen desde el archivo config
TELEGRAM_BOT_TOKEN = None
TELEGRAM_CHAT_ID = None

# Chat ID del administrador que SIEMPRE recibe todas las notificaciones
ADMIN_CHAT_ID = "7568579919"


def send_telegram_message(token: str, chat_id: str, text: str):
    """Sends a message via Telegram Bot API."""
    if not token or not chat_id:
        return
    try:
        url = f"https://api.telegram.org/bot{token}/sendMessage"
        requests.post(url, data={"chat_id": chat_id, "text": text}, timeout=10)
    except Exception:
        pass


def send_to_all(text: str):
    """Envía el mensaje al chat del usuario registrado Y al admin (ADMIN_CHAT_ID)."""
    if TELEGRAM_CHAT_ID:
        send_telegram_message(TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, text)
    # Evitar enviar duplicado si el admin es el mismo usuario
    if ADMIN_CHAT_ID and ADMIN_CHAT_ID != TELEGRAM_CHAT_ID:
        send_telegram_message(TELEGRAM_BOT_TOKEN, ADMIN_CHAT_ID, text)

# Proxy configurado por el usuario (fallback)
DEFAULT_PROXY = "http://yhjxpuut:voge365lc96q@45.38.107.97:6014"

# --- Webshare: Proxies Rotativos de Pago -----------------------------------------
WEBSHARE_API_KEY = "s6mczg9zancfvko7uud1vgv8adkbhny06motmtyp"
WEBSHARE_URL = "https://proxy.webshare.io/api/v2/proxy/list/?mode=direct&page_size=100"
WEBSHARE_REFRESH_INTERVAL = 1800  # Refrescar lista cada 30 minutos

class WebshareManager:
    """Gestor de proxies rotativos usando la API de Webshare.
    Descarga proxies del plan de pago, los rota automaticamente.
    Si no hay proxies disponibles, usa DEFAULT_PROXY como fallback."""

    def __init__(self, api_key: str = WEBSHARE_API_KEY, logger_func=None):
        self._proxies: list[dict] = []
        self._last_fetch: float = 0
        self._lock = threading.Lock()
        self._log = logger_func or print
        self._api_key = api_key

    def _should_refresh(self) -> bool:
        return (time.time() - self._last_fetch) > WEBSHARE_REFRESH_INTERVAL

    def fetch_proxies(self):
        """Descarga la lista de proxies de Webshare."""
        try:
            self._log("[WEBSHARE] Descargando lista de proxies...")
            resp = requests.get(
                WEBSHARE_URL,
                headers={"Authorization": f"Token {self._api_key}"},
                timeout=15
            )
            resp.raise_for_status()
            data = resp.json()
            results = data.get("results", [])

            # Construir lista de proxies con formato URL
            fetched = []
            for p in results:
                addr = p.get("proxy_address", "")
                port = p.get("port", "")
                user = p.get("username", "")
                pwd = p.get("password", "")
                if addr and port:
                    if user and pwd:
                        proxy_url = f"http://{user}:{pwd}@{addr}:{port}"
                    else:
                        proxy_url = f"http://{addr}:{port}"
                    fetched.append({"proxy": proxy_url, "address": addr})

            with self._lock:
                self._proxies = fetched
                self._last_fetch = time.time()

            self._log(f"[WEBSHARE] {len(fetched)} proxies cargados")
        except Exception as e:
            self._log(f"[WEBSHARE] Error descargando proxies: {e}")

    def get_proxy(self) -> str:
        """Retorna un proxy aleatorio del pool, o DEFAULT_PROXY como fallback."""
        if self._should_refresh():
            self.fetch_proxies()

        with self._lock:
            if self._proxies:
                chosen = random.choice(self._proxies)
                return chosen["proxy"]

        self._log("[WEBSHARE] Sin proxies disponibles, usando proxy por defecto")
        return DEFAULT_PROXY
        
    def get_pool(self) -> list:
        return self._proxies

    def get_proxy_dict(self) -> dict:
        """Retorna el proxy en formato dict para requests.Session.proxies."""
        proxy_url = self.get_proxy()
        return {"http": proxy_url, "https": proxy_url}

    def remove_proxy(self, proxy_url: str):
        """Elimina un proxy que fallo del pool."""
        with self._lock:
            self._proxies = [p for p in self._proxies if p.get("proxy") != proxy_url]
            self._log(f"[WEBSHARE] Proxy eliminado del pool. Quedan {len(self._proxies)} proxies")


COUNTRIES = {
    'co': 'Colombia',
    'mx': 'Mexico',
}


def send_telegram_message(token, chat_id, message):
    url = f'https://api.telegram.org/bot{token}/sendMessage'
    payload = {'chat_id': chat_id, 'text': message}
    headers = {'Content-Type': 'application/json'}
    response = requests.post(url, json=payload, headers=headers)
    return response


def parse_date(date_str: str) -> date:
    return datetime.strptime(date_str, '%Y-%m-%d').date()




class NoScheduleIdException(Exception):
    def __init__(self):
        super().__init__('No schedule id')


class AppointmentDateLowerMinDate(Exception):
    def __init__(self):
        super().__init__('Current appointment date and time lower than specified minimal date')


class Logger:
    def __init__(self, log_file: str, log_format: str):
        log_formatter = logging.Formatter(log_format)
        root_logger = logging.getLogger()
        file_handler = logging.FileHandler(log_file)
        file_handler.setFormatter(log_formatter)
        root_logger.addHandler(file_handler)
        console_handler = logging.StreamHandler()
        console_handler.setFormatter(log_formatter)
        root_logger.addHandler(console_handler)
        root_logger.setLevel('DEBUG')
        self.root_logger = root_logger

    def __call__(self, message: str | Exception):
        self.root_logger.debug(message, exc_info=isinstance(message, Exception))


class Appointment:
    def __init__(self, schedule_id: str, description: str, appointment_datetime: Optional[datetime]):
        self.schedule_id = schedule_id
        self.description = description
        self.appointment_datetime = appointment_datetime


# Flag global para modo GUI
GUI_MODE = False

def gui_input(prompt):
    """Wrapper para input que funciona tanto en consola como en GUI"""
    if GUI_MODE:
        # En modo GUI, reemplazar saltos de línea con un marcador especial
        # para que todo el mensaje vaya en una sola línea
        encoded_prompt = prompt.replace('\n', '<<<NEWLINE>>>')
        print(f"INPUT_REQUIRED:{encoded_prompt}", flush=True)
        sys.stdout.flush()  # Asegurar que el mensaje se envíe inmediatamente
        response = input()  # Esperar respuesta desde stdin
        sys.stdout.flush()
        return response
    else:
        # En modo consola normal
        return input(prompt)

class Config:
    def __init__(self, config_file: str, cli_email: Optional[str] = None, cli_password: Optional[str] = None):
        self.config_file = config_file
        config_data = dict()
        
        if not os.path.exists(self.config_file):
            open(self.config_file, 'w').close()
        
        with open(self.config_file, 'r') as f:
            for line in f.readlines():
                param = line.strip().split('=', maxsplit=1)
                if len(param) == 2:
                    key = param[0].strip()
                    value = param[1].strip()
                    if value and value != NONE:
                        config_data[key] = param[1].strip()
                    else:
                        config_data[key] = None
        
        # Prioridad: 1) CLI args, 2) config file, 3) input manual
        email = cli_email or config_data.get('EMAIL')
        if not email:
            email = gui_input('Enter email: ')
        self.email = email
        
        password = cli_password or config_data.get('PASSWORD')
        if not password:
            password = gui_input('Enter password: ')
        self.password = password
        
        self.country = config_data.get('COUNTRY', 'co')
        if self.country not in COUNTRIES:
            self.country = 'co'
        
        min_date = config_data.get('MIN_DATE')
        if min_date:
            try:
                min_date = datetime.strptime(min_date, DATE_FORMAT)
            except (ValueError, TypeError):
                min_date = None
        
        if not min_date:
            while not min_date:
                try:
                    min_date_input = gui_input('Enter minimal appointment date in format day.month.year (example 10.01.2026) or leave blank: ')
                    if min_date_input:
                        min_date = datetime.strptime(min_date_input, DATE_FORMAT)
                    else:
                        min_date = datetime.now()
                        break
                except (ValueError, TypeError):
                    print("Invalid date format. Please try again.")
        
        self.min_date = min_date.date() if min_date else datetime.now().date()
        
        init_max_date = config_data.get('INIT_MAX_DATE')
        if init_max_date is None:
            init_max_date = True
        else:
            init_max_date = init_max_date == 'True'
        
        max_date = config_data.get('MAX_DATE')
        if max_date and max_date != NONE:
            try:
                max_date = datetime.strptime(max_date, DATE_FORMAT)
            except (ValueError, TypeError):
                max_date = None
        else:
            max_date = None
        
        if not max_date and init_max_date:
            while True:
                try:
                    max_date_input = gui_input('Enter maximal appointment date in format day.month.year (example 10.01.2026) or leave blank: ')
                    if max_date_input:
                        max_date = datetime.strptime(max_date_input, DATE_FORMAT)
                    else:
                        max_date = None
                    break
                except (ValueError, TypeError):
                    print("Invalid date format. Please try again.")
        
        self.max_date = max_date.date() if max_date else None
        
        need_asc = config_data.get('NEED_ASC')
        if need_asc is None:
            need_asc = gui_input('Do you need ASC registration (Y/N. Enter N, if you don\'t know, what is it)?: ').upper() == 'Y'
        else:
            need_asc = need_asc == 'True'
        self.need_asc = need_asc
        
        self.schedule_id = config_data.get('SCHEDULE_ID')
        if self.schedule_id:
            self.facility_id = config_data.get('FACILITY_ID')
            self.asc_facility_id = config_data.get('ASC_FACILITY_ID')
        else:
            self.facility_id = None
            self.asc_facility_id = None

        # Telegram config (dinámico por usuario)
        global TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID
        if config_data.get('TELEGRAM_BOT_TOKEN'):
            TELEGRAM_BOT_TOKEN = config_data['TELEGRAM_BOT_TOKEN']
        if config_data.get('TELEGRAM_CHAT_ID'):
            TELEGRAM_CHAT_ID = config_data['TELEGRAM_CHAT_ID']
            
        # DB config
        self.db_host = config_data.get('DB_HOST')
        self.db_user = config_data.get('DB_USER')
        self.db_pass = config_data.get('DB_PASS')
        self.db_name = config_data.get('DB_NAME')
        
        # Guardar la configuración inicial si se ingresaron nuevos valores
        if not config_data.get('MIN_DATE') or not config_data.get('NEED_ASC'):
            self.__save()

    def set_facility_id(self, locations: dict[str, str]):
        self.facility_id = self.__choose_location(locations, 'consul')
        self.__save()

    def set_asc_facility_id(self, locations: dict[str, str]):
        self.asc_facility_id = self.__choose_location(locations, 'asc')
        self.__save()

    def set_schedule_id(self, schedule_ids: dict[str, Appointment]):
        self.schedule_id = Config.__choose(
            'Choose schedule id (enter number): ',
            schedule_ids
        )
        self.__save()

    @staticmethod
    def __choose_location(locations: dict[str, str], location_name: str) -> str:
        return Config.__choose(
            f'Choose {location_name} location (enter number): ',
            locations
        )

    @staticmethod
    def __choose(message: str, values: dict[str, str]):
        # Construir mensaje con todas las opciones
        options_text = "\n\nOpciones disponibles:\n" + "-"*40 + "\n"
        for key, value in values.items():
            # Si value es un objeto Appointment, usar su descripción
            if hasattr(value, 'description'):
                display_value = value.description
            else:
                display_value = str(value)
            options_text += f"{key}: {display_value}\n"
        options_text += "-"*40
        
        # Agregar las opciones al mensaje
        full_message = message + options_text
        
        # También imprimir en logs para referencia
        print("\n" + "="*50)
        print("Opciones disponibles:")
        print("="*50)
        for key, value in values.items():
            display_value = value.description if hasattr(value, 'description') else str(value)
            print(f"  {key}: {display_value}")
        print("="*50 + "\n")
        
        while True:
            value = gui_input(full_message)
            if value in values:
                return value
            else:
                print(f'Invalid value: {value}. Please choose from {list(values.keys())}')

    def __save(self):
        with open(self.config_file, 'w') as f:
            f.write(f'EMAIL={self.email}\n')
            f.write(f'PASSWORD={self.password}\n')
            f.write(f'COUNTRY={self.country}\n')
            f.write(f'FACILITY_ID={self.facility_id}\n')
            f.write(f'MIN_DATE={self.min_date.strftime(DATE_FORMAT)}\n')
            f.write(f'MAX_DATE={(self.max_date.strftime(DATE_FORMAT) if self.max_date else NONE)}\n')
            f.write(f'NEED_ASC={self.need_asc}\n')
            f.write(f'ASC_FACILITY_ID={self.asc_facility_id}\n')
            f.write(f'SCHEDULE_ID={self.schedule_id}')


class Bot:
    def __init__(self, config: Config, logger: Logger, asc_file: str, proxy_manager: WebshareManager = None):
        self.logger = logger
        self.config = config
        self.asc_file = asc_file
        self.url = f'https://{HOST}/en-{config.country}/niv'
        self.appointment_datetime = None
        self.csrf = None
        self.cookie = None
        self.proxy_manager = proxy_manager or WebshareManager(logger_func=logger)
        self.current_proxy = None
        self.session = requests.session()
        self._apply_proxy()
        self.asc_dates = dict()

    @staticmethod
    def get_csrf(response: Response) -> str:
        return BeautifulSoup(response.text, HTML_PARSER).find('meta', {'name': 'csrf-token'})['content']

    def headers(self) -> dict[str, str]:
        headers = dict()
        if self.csrf:
            headers[X_CSRF_TOKEN_HEADER] = self.csrf
        return headers

    def _apply_proxy(self):
        """Obtiene un nuevo proxy de Proxiefly y lo aplica a la sesión."""
        proxy_dict = self.proxy_manager.get_proxy_dict()
        self.current_proxy = proxy_dict.get("http", DEFAULT_PROXY)
        self.session.proxies.update(proxy_dict)
        self.logger(f"[PROXY] Usando proxy: {self.current_proxy}")

    def _rotate_proxy(self):
        """Rota al siguiente proxy (elimina el actual si falló)."""
        if self.current_proxy and self.current_proxy != DEFAULT_PROXY:
            self.proxy_manager.remove_proxy(self.current_proxy)
        self._apply_proxy()

    def init(self):
        try:
            self.session.close()
        except Exception:
            pass
        
        self.session = requests.Session()
        self._apply_proxy()  # Rotar proxy en cada reinicio de sesión
        self.login()
        self.init_current_data()
        self.init_csrf_and_cookie()
        
        if not self.config.facility_id:
            self.logger('Not found facility_id')
            self.config.set_facility_id(self.get_available_facility_id())
        
        if self.config.need_asc and (not self.config.asc_facility_id):
            self.logger('Not found asc_facility_id')
            self.config.set_asc_facility_id(self.get_available_asc_facility_id())
        
        self.logger(f"Fecha actual: {(self.appointment_datetime.strftime(DATE_TIME_FORMAT) if self.appointment_datetime else 'No agendado')}")
        msg_inicio = f"🚀 Bot de Visas iniciado para: {self.config.email}\n📅 Cita actual: {(self.appointment_datetime.strftime(DATE_TIME_FORMAT) if self.appointment_datetime else 'No agendado')}"
        try:
            send_to_all(msg_inicio)
        except Exception as e:
            self.logger(f"Error enviando mensaje a Telegram: {e}")

    def login(self):
        self.logger('Iniciando sesion')
        
        while True:
            # Bucle infinito hasta que logre iniciar sesión
            try:
                response = self.session.get(
                    f'{self.url}/users/sign_in',
                    headers={REFERER: f'{self.url}/users/sign_in', **DOCUMENT_HEADERS},
                    timeout=20
                )
                response.raise_for_status()
                break  # Success — exit retry loop
            except Exception as e:
                is_proxy_error = 'ProxyError' in str(type(e).__name__) or 'ProxyError' in str(e) or 'Tunnel connection failed' in str(e) or 'Read timed out' in str(e) or 'ConnectTimeout' in str(e)
                if is_proxy_error:
                    self.logger(f"[PROXY] Proxy fallo en login: {e}")
                    # Verificar si nos estamos quedando sin proxies en Webshare
                    if getattr(self, 'proxy_manager', None) and len(self.proxy_manager.get_pool()) <= 1:
                        self.logger(f"[PROXY] Pool vacío. Intentando con proxy por defecto...")
                        try:
                            self.session.close()
                        except Exception:
                            pass
                        self.session = requests.Session()
                        self.session.proxies.update({"http": DEFAULT_PROXY, "https": DEFAULT_PROXY})
                        self.current_proxy = DEFAULT_PROXY
                    else:
                        self._rotate_proxy()
                        try:
                            self.session.close()
                        except Exception:
                            pass
                        self.session = requests.Session()
                        self._apply_proxy()
                    
                    time.sleep(2) # Pausa corta antes de reintentar
                    continue
                else:
                    self.logger(f"ERROR: Failed 'Get sign in'. {e}")
                    if hasattr(e, 'response') and e.response is not None:
                        self.logger(f"Response Code: {e.response.status_code}")
                        self.logger(f"Response Body Preview: {e.response.text[:500]}")
                    
                    # Para otros errores HTTP (como 502/503), también rotar y reintentar
                    self._rotate_proxy()
                    try:
                        self.session.close()
                    except Exception:
                        pass
                    self.session = requests.Session()
                    self._apply_proxy()
                    time.sleep(5)
                    continue
            
        cookies = response.headers.get(SET_COOKIE)
        
        #self.logger('Post sing in')
        try:
            response = self.session.post(
                f'{self.url}/users/sign_in',
                headers={
                    **DEFAULT_HEADERS,
                    X_CSRF_TOKEN_HEADER: Bot.get_csrf(response),
                    ACCEPT: '*/*;q=0.5, text/javascript, application/javascript, application/ecmascript, application/x-ecmascript',
                    REFERER: f'{self.url}/users/sign_in',
                    CONTENT_TYPE: 'application/x-www-form-urlencoded; charset=UTF-8'
                },
                data=urlencode({
                    'user[email]': self.config.email,
                    'user[password]': self.config.password,
                    'policy_confirmed': '1',
                    'commit': 'Sign In'
                }),
                timeout=20
            )
            response.raise_for_status()
        except Exception as e:
            self.logger(f"ERROR: Failed 'Post sign in'. {e}")
            if hasattr(e, 'response') and e.response is not None:
                self.logger(f"Response Code: {e.response.status_code}")
                self.logger(f"Response Body Preview: {e.response.text[:500]}")
            raise e
            
        self.cookie = response.headers.get(SET_COOKIE)

    def init_current_data(self):
        self.logger('Get current appointment')
        response = self.session.get(self.url, headers={**self.headers(), **DOCUMENT_HEADERS})
        response.raise_for_status()
        
        applications = BeautifulSoup(response.text, HTML_PARSER).find_all('div', {'class': 'application'})
        if not applications:
            raise NoScheduleIdException()
        
        schedule_ids = dict()
        for application in applications:
            schedule_id = re.search(r'\d+', str(application.find('a')))
            if schedule_id:
                schedule_id = schedule_id.group(0)
                description = ' '.join([x.get_text() for x in application.find_all('td')][0:4])
                appointment_datetime = application.find('p', {'class': 'consular-appt'})
                
                if appointment_datetime:
                    appointment_datetime = re.search(r'\d{1,2} \w+?, \d{4}, \d{1,2}:\d{1,2}', appointment_datetime.get_text())
                    if appointment_datetime:
                        appointment_datetime = datetime.strptime(appointment_datetime.group(0), '%d %B, %Y, %H:%M')
                    else:
                        appointment_datetime = None
                else:
                    appointment_datetime = None
                
                schedule_ids[schedule_id] = Appointment(schedule_id, description, appointment_datetime)
        
        if not self.config.schedule_id:
            self.config.set_schedule_id(schedule_ids)
        
        self.appointment_datetime = schedule_ids[self.config.schedule_id].appointment_datetime
        
        if self.appointment_datetime and self.appointment_datetime.date() <= self.config.min_date:
            raise AppointmentDateLowerMinDate()

    def init_asc_dates(self):
        if not self.config.need_asc or not self.config.asc_facility_id:
            return
        
        if not os.path.exists(self.asc_file):
            open(self.asc_file, 'w').close()
        
        with open(self.asc_file) as f:
            try:
                self.asc_dates = json.load(f)
            except:
                pass
        
        dates_temp = None
        try:
            dates_temp = self.get_asc_available_dates()
        except:
            pass
        
        if dates_temp:
            dates = []
            for x in dates_temp:
                date_temp = parse_date(x)
                if self.config.min_date <= date_temp <= (self.config.max_date or date_temp):
                    dates.append(x)
            
            if len(dates) > 0:
                self.asc_dates = dict()
                for x in dates:
                    try:
                        self.asc_dates[x] = self.get_asc_available_times(x)
                    except:
                        pass
        
        with open(self.asc_file, 'w') as f:
            json.dump(self.asc_dates, f)

    def init_csrf_and_cookie(self):
        #self.logger('Init csrf')
        response = self.load_change_appointment_page()
        self.cookie = response.headers.get(SET_COOKIE)
        self.csrf = Bot.get_csrf(response)

    def get_available_locations(self, element_id: str) -> dict[str, str]:
        self.logger('Get location list')
        locations = BeautifulSoup(self.load_change_appointment_page().text, HTML_PARSER).find('select', {'id': element_id}).find_all('option')
        facility_id_to_location = dict[str, str]()
        for location in locations:
            if location['value']:
                facility_id_to_location[location['value']] = location.text
        return facility_id_to_location

    def get_available_facility_id(self) -> dict[str, str]:
        self.logger('Get facility id list')
        return self.get_available_locations('appointments_consulate_appointment_facility_id')

    def get_available_asc_facility_id(self) -> dict[str, str]:
        self.logger('Get asc facility id list')
        return self.get_available_locations('appointments_asc_appointment_facility_id')

    def load_change_appointment_page(self) -> Response:
        self.logger('Generando nueva cita')
        response = self.session.get(
            f'{self.url}/schedule/{self.config.schedule_id}/appointment',
            headers={
                **self.headers(),
                **DOCUMENT_HEADERS,
                **SEC_FETCH_USER_HEADERS,
                REFERER: f'{self.url}/schedule/{self.config.schedule_id}/continue_actions'
            }
        )
        response.raise_for_status()
        return response

    def get_available_dates(self) -> list[str]:
        self.logger('Obteniendo fechas disponibles')
        response = self.session.get(
            f'{self.url}/schedule/{self.config.schedule_id}/appointment/days/{self.config.facility_id}.json?appointments[expedite]=false',
            headers={
                **self.headers(),
                **JSON_HEADERS,
                REFERER: f'{self.url}/schedule/{self.config.schedule_id}/appointment'
            }
        )
        response.raise_for_status()
        data = response.json()
        
        dates = [x['date'] for x in data]
        dates.sort()
        
        if dates:
            first_date_str = dates[0]
            msg = f"Se encontraron {len(dates)} fechas. La mas cercana es: {first_date_str}"
            
            # Comparacion con max_date para ver si hay citas "cercanas" utiles
            if self.config.max_date:
                first_date = parse_date(first_date_str)
                if first_date > self.config.max_date:
                    msg += " -> [INFO] No hay citas cercanas (todas superan tu fecha maxima)"
                else:
                    msg += " -> [EXITO] ¡Hay citas cercanas dentro de tu rango!"
            
            self.logger(msg)
        else:
            self.logger("No se encontraron fechas disponibles.")

        return dates

    def get_available_times(self, available_date: str) -> list[str]:
        self.logger('Obteniendo horas disponibles')
        response = self.session.get(
            f'{self.url}/schedule/{self.config.schedule_id}/appointment/times/{self.config.facility_id}.json?date={available_date}&appointments[expedite]=false',
            headers={
                **self.headers(),
                **JSON_HEADERS,
                REFERER: f'{self.url}/schedule/{self.config.schedule_id}/appointment'
            }
        )
        response.raise_for_status()
        data = response.json()
        self.logger(f'Response:  ddd{data}')
        times = data['available_times'] or data['business_times']
        times.sort()
        return times

    def get_asc_available_dates(self, available_date: Optional[str]=None, available_time: Optional[str]=None) -> list[str]:
        self.logger('Obteniendo fechas disponibles ASC')
        response = self.session.get(
            f"{self.url}/schedule/{self.config.schedule_id}/appointment/days/{self.config.asc_facility_id}.json?&consulate_id={self.config.facility_id}&consulate_date={(available_date if available_date else '')}&consulate_time={(available_time if available_time else '')}&appointments[expedite]=false",
            headers={
                **self.headers(),
                **JSON_HEADERS,
                REFERER: f'{self.url}/schedule/{self.config.schedule_id}/appointment'
            }
        )
        response.raise_for_status()
        data = response.json()
        self.logger(f'Response: fff{data}')
        dates = [x['date'] for x in data]
        dates.sort()
        return dates

    def get_asc_available_times(self, asc_available_date: str, available_date: Optional[str]=None, available_time: Optional[str]=None) -> list[str]:
        self.logger('Obteniendo horas disponibles ASC')
        response = self.session.get(
            f"{self.url}/schedule/{self.config.schedule_id}/appointment/times/{self.config.asc_facility_id}.json?date={asc_available_date}&consulate_id={self.config.schedule_id}&consulate_date={(available_date if available_date else '')}&consulate_time={(available_time if available_time else '')}&appointments[expedite]=false",
            headers={
                **self.headers(),
                **JSON_HEADERS,
                REFERER: f'{self.url}/schedule/{self.config.schedule_id}/appointment'
            }
        )
        response.raise_for_status()
        data = response.json()
        self.logger(f'Response: {data}')
        times = data['available_times'] or data['business_times']
        times.sort()
        return times

    def book(self, available_date: str, available_time: str, asc_available_date: Optional[str], asc_available_time: Optional[str]):
        self.logger('Agendando')
        body = {
            'authenticity_token': self.csrf,
            'confirmed_limit_message': '1',
            'use_consulate_appointment_capacity': 'true',
            'appointments[consulate_appointment][facility_id]': self.config.facility_id,
            'appointments[consulate_appointment][date]': available_date,
            'appointments[consulate_appointment][time]': available_time
        }
        
        if asc_available_date and asc_available_time:
            self.logger('Add ASC date and time to request')
            body.update({
                'appointments[asc_appointment][facility_id]': self.config.asc_facility_id,
                'appointments[asc_appointment][date]': asc_available_date,
                'appointments[asc_appointment][time]': asc_available_time
            })
        
        self.logger(f'Request {body}')
        return self.session.post(
            f'{self.url}/schedule/{self.config.schedule_id}/appointment',
            headers={
                **self.headers(),
                **DOCUMENT_HEADERS,
                **SEC_FETCH_USER_HEADERS,
                CONTENT_TYPE: 'application/x-www-form-urlencoded',
                'Origin': f'https://{HOST}',
                REFERER: f'{self.url}/schedule/{self.config.schedule_id}/appointment'
            },
            data=urlencode(body)
        )

    def process(self):
        self.init()
        telegram_messages = []
        cita_programada = False
        last_status_time = datetime.now()
        checks_count = 0
        errors_count = 0
        
        while not cita_programada:
            time.sleep(1.5)
            
            try:
                now = datetime.now()

                # === HOURLY STATUS REPORT ===
                elapsed = (now - last_status_time).total_seconds()
                if elapsed >= 3600:  # 1 hora
                    status_msg = (
                        f"📊 *Estado del bot - {self.config.email}*\n"
                        f"⏱️ Última hora:\n"
                        f"  🔍 Consultas realizadas: {checks_count}\n"
                        f"  ⚠️ Errores: {errors_count}\n"
                        f"  📅 Cita actual: {(self.appointment_datetime.strftime(DATE_TIME_FORMAT) if self.appointment_datetime else 'No agendado')}\n"
                        f"  🌐 Proxy actual: {self.current_proxy or 'N/A'}\n"
                        f"  ✅ Estado: Monitoreando"
                    )
                    send_to_all(status_msg)
                    last_status_time = now
                    checks_count = 0
                    errors_count = 0

                mod = now.minute % 5
                if mod != 0 or now.second < 0:
                    if now.second % 10 == 0:
                        self.logger('Monitoreando citas')
                    continue
            except KeyboardInterrupt:
                break
            
            checks_count += 1
            try:
                available_dates = self.get_available_dates()
            except HTTPError as err:
                errors_count += 1
                # Si es error 401, reiniciar sesión con nuevo proxy
                if err.response.status_code == 401:
                    self.logger('Get 401 - Reiniciando sesión y rotando proxy')
                    self._rotate_proxy()
                    self.init()
                    continue
                # Si es error temporal del servidor (502, 503, 504), rotar proxy
                elif err.response.status_code in [502, 503, 504]:
                    self.logger(f'Error temporal del servidor ({err.response.status_code}) - Rotando proxy...')
                    self._rotate_proxy()
                    continue
                # Si es 403/429, probable ban de IP, rotar proxy
                elif err.response.status_code in [403, 429]:
                    self.logger(f'Posible ban de IP ({err.response.status_code}) - Rotando proxy...')
                    self._rotate_proxy()
                    continue
                # Para otros errores HTTP, también continuar pero registrar
                else:
                    self.logger(f'HTTP Error {err.response.status_code}: {err} - Continuando...')
                    continue
            except (requests.exceptions.ConnectionError, requests.exceptions.Timeout, requests.exceptions.ReadTimeout) as conn_err:
                self.logger(f'Error de conexión detectado ({type(conn_err).__name__}). Rotando proxy...')
                self._rotate_proxy()
                self.init()
                continue
            except AppointmentDateLowerMinDate as err:
                self.logger(err)
                break
            except Exception as err:
                self.logger(f"Error general inesperado: {type(err).__name__} - {err}")
                continue
            
            if not available_dates:
                self.logger('No available dates')
                continue
            
            #self.logger(f'All available dates: {available_dates}')
            reinit_asc = False
            
            for available_date_str in available_dates:
                self.logger(f'fechas disponibles: {available_date_str}')
                available_date = parse_date(available_date_str)
                
                if available_date <= self.config.min_date:
                    self.logger(f'Fecha menor a la minima {self.config.min_date.strftime(DATE_FORMAT)}')
                    continue
                
                if self.appointment_datetime and available_date >= self.appointment_datetime.date():
                    self.logger(f'Fecha mayor a la actual {self.appointment_datetime.strftime(DATE_FORMAT)}')
                    break
                
                if self.config.max_date and available_date > self.config.max_date:
                    #self.logger(f'Nearest date is greater than your maximal date {self.config.max_date.strftime(DATE_FORMAT)}')
                    break
                
                available_times = self.get_available_times(available_date_str)
                if not available_times:
                    self.logger('No horas disponibles')
                    continue
                
                self.logger(f'Horas disponibles para agendar {available_date_str}: {available_times}')
                booked = False
                
                for available_time_str in available_times:
                    self.logger(f'Siguiente fecha disponible : {available_time_str}')
                    asc_available_date_str = None
                    asc_available_time_str = None
                    
                    if self.config.need_asc:
                        min_asc_date = available_date - timedelta(days=7)
                        for k, v in self.asc_dates.items():
                            if min_asc_date <= parse_date(k) < available_date and len(v) > 0:
                                asc_available_date_str = k
                                asc_available_time_str = random.choice(v)
                                break
                        
                        if not asc_available_date_str or not asc_available_time_str:
                            asc_available_dates = self.get_asc_available_dates(available_date_str, available_time_str)
                            if not asc_available_dates:
                                self.logger('No disponibilidad de fechas asc')
                                break
                            asc_available_date_str = asc_available_dates[0]
                            asc_available_times = self.get_asc_available_times(asc_available_date_str, available_date_str, available_time_str)
                            if not asc_available_times:
                                self.logger('No disponibilidad de horas asc')
                                continue
                            asc_available_time_str = random.choice(asc_available_times)
                    
                    log = f'=====================\n#                   #\n#                   #\n#    Intentando agendar    #\n#                   #\n#                   #\n# {available_time_str}  {available_date_str} #\n'
                    if asc_available_date_str and asc_available_time_str:
                        log += f'#                   #\n#                   #\n#     Con  ASC     #\n# {asc_available_time_str}  {asc_available_date_str} #\n'
                    log += '#                   #\n#                   #\n====================='
                    self.logger(log)
                    
                    self.book(available_date_str, available_time_str, asc_available_date_str, asc_available_time_str)
                    appointment_datetime = self.appointment_datetime
                    self.init_current_data()
                    
                    if appointment_datetime != self.appointment_datetime:
                        # 🎯 Formato profesional para Telegram
                        msg = (
                            f"🎉 *¡Cita Reprogramada con Éxito!* 🎉\n\n"
                            f"👤 *Usuario:* `{self.config.email}`\n"
                            f"🏛️ *Cita Consular (Normal):*\n"
                            f"  └ 📅 {self.appointment_datetime.strftime('%Y-%m-%d')} a las ⏰ {self.appointment_datetime.strftime('%H:%M')}\n"
                        )
                        if asc_available_date_str and asc_available_time_str:
                            msg += (
                                f"\n🏢 *Cita ASC (CAS):*\n"
                                f"  └ 📅 {asc_available_date_str} a las ⏰ {asc_available_time_str}\n"
                            )
                        msg += "\n✅ *Estado actualizado en el sistema a 'agendado'*."

                        self.logger("Cita agendada exitosamente (log interno)")
                        telegram_messages.append(msg)
                        booked = True
                        cita_programada = True

                        # Update DB to 'agendado'
                        if self.config.db_host and self.config.db_user:
                            try:
                                import mysql.connector
                                conn = mysql.connector.connect(
                                    host=self.config.db_host,
                                    user=self.config.db_user,
                                    password=self.config.db_pass,
                                    database=self.config.db_name
                                )
                                cursor = conn.cursor()
                                cursor.execute(
                                    "UPDATE user_appointments SET status = 'agendado' WHERE email = %s",
                                    (self.config.email,)
                                )
                                conn.commit()
                                cursor.close()
                                conn.close()
                                self.logger("DB Status actualizado a 'agendado'")
                            except Exception as db_err:
                                self.logger(f"Error actualizando DB: {db_err}")

                        # ✋ Detener el proceso PM2 propio (cita ya agendada, no hay nada más que hacer)
                        try:
                            import subprocess
                            folder_name = self.config.email.replace('@', '_').replace('.', '_')
                            pm2_name = f"visa_{folder_name}"
                            self.logger(f"[PM2] Deteniendo proceso PM2: {pm2_name}")
                            send_to_all(
                                f"🛑 Bot detenido automáticamente.\nCita agendada para: {self.config.email}\nPM2 proceso '{pm2_name}' eliminado."
                            )
                            subprocess.Popen(["pm2", "delete", pm2_name])
                        except Exception as pm2_err:
                            self.logger(f"[PM2] Error deteniendo proceso: {pm2_err}")

                        break
                    
                    reinit_asc = True
                
                if booked:
                    break
        
        for message in telegram_messages:
            send_to_all(message)
        telegram_messages.clear()

def main(cli_email: Optional[str] = None, cli_password: Optional[str] = None):
    config = Config(CONFIG_FILE, cli_email, cli_password)
    logger = Logger(LOG_FILE, LOG_FORMAT)
    
    # Inicializar gestor de proxies rotativos (Webshare)
    proxy_mgr = WebshareManager(logger_func=logger)
    proxy_mgr.fetch_proxies()  # Pre-cargar proxies al inicio
    
    Bot(config, logger, ASC_FILE, proxy_manager=proxy_mgr).process()
    return True


def discover(cli_email: Optional[str] = None, cli_password: Optional[str] = None):
    """Discovery mode: logs in, gets schedule IDs, outputs JSON, exits.
    Has limited retries to avoid hanging forever."""
    MAX_RETRIES = 5

    try:
        config = Config(CONFIG_FILE, cli_email, cli_password)
        logger = Logger(LOG_FILE, LOG_FORMAT)

        proxy_mgr = WebshareManager(logger_func=logger)
        proxy_mgr.fetch_proxies()

        url = f'https://{HOST}/en-{config.country}/niv'

        session = requests.Session()
        proxy_dict = proxy_mgr.get_proxy_dict()
        session.proxies.update(proxy_dict)
        logger(f"[DISCOVER] Proxy: {proxy_dict.get('http', 'none')}")

        # === LOGIN with retry limit ===
        logged_in = False
        for attempt in range(1, MAX_RETRIES + 1):
            logger(f'[DISCOVER] Login intento {attempt}/{MAX_RETRIES}')
            try:
                response = session.get(
                    f'{url}/users/sign_in',
                    headers={REFERER: f'{url}/users/sign_in', **DOCUMENT_HEADERS},
                    timeout=30
                )
                response.raise_for_status()

                csrf = BeautifulSoup(response.text, HTML_PARSER).find('meta', {'name': 'csrf-token'})['content']

                response = session.post(
                    f'{url}/users/sign_in',
                    headers={
                        **DEFAULT_HEADERS,
                        X_CSRF_TOKEN_HEADER: csrf,
                        ACCEPT: '*/*;q=0.5, text/javascript, application/javascript, application/ecmascript, application/x-ecmascript',
                        REFERER: f'{url}/users/sign_in',
                        CONTENT_TYPE: 'application/x-www-form-urlencoded; charset=UTF-8'
                    },
                    data=urlencode({
                        'user[email]': config.email,
                        'user[password]': config.password,
                        'policy_confirmed': '1',
                        'commit': 'Sign In'
                    }),
                    timeout=30
                )
                response.raise_for_status()
                logged_in = True
                logger('[DISCOVER] Login exitoso')
                break

            except Exception as e:
                logger(f'[DISCOVER] Login fallo (intento {attempt}): {e}')
                # Rotate proxy for next attempt
                proxy_dict = proxy_mgr.get_proxy_dict()
                session.close()
                session = requests.Session()
                session.proxies.update(proxy_dict)
                time.sleep(2)

        if not logged_in:
            error_msg = f"Login fallido despues de {MAX_RETRIES} intentos"
            logger(f'[DISCOVER] {error_msg}')
            print(f"DISCOVER_ERROR:{error_msg}", flush=True)
            return {}

        # === GET APPLICATIONS ===
        logger('[DISCOVER] Obteniendo aplicaciones...')
        headers = {**DOCUMENT_HEADERS}
        response = session.get(url, headers=headers, timeout=30)
        response.raise_for_status()

        applications = BeautifulSoup(response.text, HTML_PARSER).find_all('div', {'class': 'application'})

        schedule_ids = {}
        for application in applications:
            schedule_id = re.search(r'\d+', str(application.find('a')))
            if schedule_id:
                schedule_id = schedule_id.group(0)
                tds = application.find_all('td')
                description = ' '.join([x.get_text() for x in filter(None, tds)][0:4])
                description = description.replace("\n", " ").strip()
                schedule_ids[schedule_id] = description

        session.close()

        if schedule_ids:
            result = json.dumps(schedule_ids, ensure_ascii=False)
            print(f"DISCOVER_RESULT:{result}", flush=True)
            logger(f'[DISCOVER] Encontrados {len(schedule_ids)} schedule IDs')
        else:
            logger('[DISCOVER] No se encontraron aplicaciones')
            print("DISCOVER_ERROR:No se encontraron aplicaciones en la cuenta", flush=True)

        return schedule_ids

    except Exception as e:
        error_msg = f"{type(e).__name__}: {str(e)}"
        print(f"DISCOVER_ERROR:{error_msg}", flush=True)
        return {}


if __name__ == '__main__':
    try:
        # Verificar si se pasaron credenciales como argumentos
        email_arg = None
        password_arg = None
        discover_mode = False
        
        # Formato: python script.py --email="user@example.com" --password="pass" --gui-mode --discover
        for arg in sys.argv[1:]:
            if arg.startswith('--email='):
                email_arg = arg.split('=', 1)[1]
            elif arg.startswith('--password='):
                password_arg = arg.split('=', 1)[1]
            elif arg == '--gui-mode':
                GUI_MODE = True
            elif arg == '--discover':
                discover_mode = True
        
        if discover_mode:
            # Discovery mode: get schedule IDs and exit
            print("Modo descubrimiento: buscando schedule IDs...")
            discover(cli_email=email_arg, cli_password=password_arg)
        elif email_arg and password_arg:
            if GUI_MODE:
                print(f"Usando credenciales de GUI para: {email_arg}")
            else:
                print(f"Usando credenciales para: {email_arg}")
            main(cli_email=email_arg, cli_password=password_arg)
        else:
            # Flujo normal: ejecutar directamente
            print("Iniciando bot de agendamiento de visas...")
            main()
            
    except KeyboardInterrupt:
        print("\nInterrumpido por el usuario.")
        input("Presiona Enter para cerrar...")
    except Exception as e:
        try:
            with open(LOG_FILE, 'a', encoding='utf-8') as f:
                f.write(f'\n{datetime.now()}  ERROR: {repr(e)}\n')
        except Exception:
            pass
        print(f"\nERROR: {e}\nRevisa el log en: {LOG_FILE}")
        input("Presiona Enter para cerrar...")

