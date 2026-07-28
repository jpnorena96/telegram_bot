import json
import logging
import os
import paramiko
from datetime import datetime
from config import VPS_HOST, VPS_USER, VPS_PASS

logger = logging.getLogger(__name__)

# Mapping: consulate name → (facility_id, asc_facility_id)
CONSULATE_FACILITY_MAP = {
    # Colombia
    "bogotá": {"facility_id": "25", "asc_facility_id": "26"},
    
    # Mexico
    "ciudad juarez": {"facility_id": "65", "asc_facility_id": "76"},
    "guadalajara": {"facility_id": "66", "asc_facility_id": "77"},
    "hermosillo": {"facility_id": "67", "asc_facility_id": "78"},
    "matamoros": {"facility_id": "68", "asc_facility_id": "79"},
    "merida": {"facility_id": "69", "asc_facility_id": "81"},
    "mexico city": {"facility_id": "70", "asc_facility_id": "82"},
    "monterrey": {"facility_id": "71", "asc_facility_id": "83"},
    "nogales": {"facility_id": "72", "asc_facility_id": "84"},
    "nuevo laredo": {"facility_id": "73", "asc_facility_id": "85"},
    "tijuana": {"facility_id": "74", "asc_facility_id": "88"},
    
    # Argentina
    "buenos aires": {"facility_id": "Buenos Aires", "asc_facility_id": "Buenos Aires_cas"},
    
    # Brazil
    "brasilia": {"facility_id": "Brasilia", "asc_facility_id": "Brasilia_cas"},
    "são paulo": {"facility_id": "São Paulo", "asc_facility_id": "São Paulo_cas"},
    "río de janeiro": {"facility_id": "Río", "asc_facility_id": "Río_cas"},
    "recife": {"facility_id": "Recife", "asc_facility_id": "Recife_cas"},
    "porto alegre": {"facility_id": "Porto Alegre", "asc_facility_id": "Porto Alegre_cas"},
    
    # Ecuador
    "quito": {"facility_id": "Quito", "asc_facility_id": "Quito_cas"},
    "guayaquil": {"facility_id": "Guayaquil", "asc_facility_id": "Guayaquil_cas"},
    
    # Peru
    "lima": {"facility_id": "115", "asc_facility_id": None},
    
    # Chile
    "santiago": {"facility_id": "Santiago", "asc_facility_id": "Santiago_cas"},
    
    # Uruguay
    "montevideo": {"facility_id": "Montevideo", "asc_facility_id": "Montevideo_cas"},
    
    # Jamaica
    "kingston": {"facility_id": "Kingston", "asc_facility_id": "Kingston_cas"},
    
    # Canada
    "toronto": {"facility_id": "Toronto", "asc_facility_id": "Toronto_cas"},
    "vancouver": {"facility_id": "Vancouver", "asc_facility_id": "Vancouver_cas"},
    
    # Default (fallback)
    "_default": {"facility_id": "25", "asc_facility_id": "26"},
}

# Paths relative to project root
PROJECT_ROOT = os.path.dirname(os.path.dirname(__file__))
SCRIPT_FILE = os.path.join(PROJECT_ROOT, "script.py")
SCRIPT_REQUIREMENTS_FILE = os.path.join(PROJECT_ROOT, "script_requirements.txt")


def _get_facility_ids(consulate_name: str, need_cas: bool) -> tuple[str, str]:
    """Returns (facility_id, asc_facility_id) based on consulate name or facility ID."""
    key = consulate_name.strip().lower()
    
    # 1. Intentar buscar por coincidencia exacta de facility_id en los valores del mapa
    found_ids = None
    for k, val in CONSULATE_FACILITY_MAP.items():
        if val.get("facility_id") == consulate_name:
            found_ids = val
            break
            
    # 2. Si no se encontró, buscar por nombre clave (ej. "bogota")
    if not found_ids:
        found_ids = CONSULATE_FACILITY_MAP.get(key)
        
    # 3. Si aún así no se encuentra, pero es numérico (un ID enviado directamente), usarlo directamente
    if not found_ids:
        if key.isdigit() or (key and not any(c.isalpha() for c in key)):
            facility_id = key
            asc_facility_id = "None"
            return facility_id, asc_facility_id
        else:
            # Fallback por defecto (Bogotá)
            found_ids = CONSULATE_FACILITY_MAP["_default"]

    facility_id = found_ids["facility_id"]
    # Only use asc_facility_id if CAS is needed AND the consulate supports it
    asc = found_ids.get("asc_facility_id")
    asc_facility_id = asc if (need_cas and asc) else "None"
    return facility_id, asc_facility_id


def _connect_ssh():
    """Returns an SSHClient connected to VPS."""
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(VPS_HOST, port=22, username=VPS_USER, password=VPS_PASS, timeout=30)
    return ssh


def _run_ssh_command(ssh_client, command: str, timeout: int = 120) -> tuple[str, str]:
    """Executes a command via SSH and returns (stdout, stderr)."""
    logger.info(f"[SSH] Running: {command}")
    stdin, stdout, stderr = ssh_client.exec_command(command, timeout=timeout)
    out = stdout.read().decode('utf-8', errors='replace').strip()
    err = stderr.read().decode('utf-8', errors='replace').strip()
    if out:
        logger.info(f"[SSH] stdout: {out[:500]}")
    if err:
        logger.warning(f"[SSH] stderr: {err[:500]}")
    return out, err


def _get_base_path(email: str, appointment_id: int = None) -> tuple[str, str]:
    """Returns (base_path, folder_name) from email."""
    folder_name = email.replace('@', '_').replace('.', '_')
    if appointment_id:
        folder_name = f"{folder_name}_{appointment_id}"
    base_path = f"/home/{VPS_USER}/{folder_name}"
    return base_path, folder_name


def create_vps_config(user_data: dict) -> bool:
    """Phase 1: Upload files, create venv, install deps. Does NOT start PM2 yet."""
    try:
        logger.info(f"Connecting to VPS {VPS_HOST} as {VPS_USER}...")

        email = user_data["appt_email"]
        appointment_id = user_data.get("appointment_id")
        base_path, folder_name = _get_base_path(email, appointment_id)

        # Get facility IDs based on consulate
        need_cas = user_data.get("need_cas", True)
        consulate_name = user_data.get("consulate", "")
        facility_id, asc_facility_id = _get_facility_ids(consulate_name, need_cas)
        logger.info(f"Consulate: {consulate_name} → FACILITY_ID={facility_id}, ASC={asc_facility_id}, NEED_ASC={need_cas}")

        # Format dates from YYYY-MM-DD to DD.MM.YYYY (safely handle optional dates)
        if user_data.get("min_consulate_date"):
            min_date_obj = datetime.strptime(user_data["min_consulate_date"], '%Y-%m-%d')
            min_date_fmt = min_date_obj.strftime('%d.%m.%Y')
        else:
            # Si no hay fecha mínima configurada, usar el día de hoy por defecto para evitar prompts
            min_date_fmt = datetime.now().strftime('%d.%m.%Y')

        if user_data.get("max_consulate_date"):
            max_date_obj = datetime.strptime(user_data["max_consulate_date"], '%Y-%m-%d')
            max_date_fmt = max_date_obj.strftime('%d.%m.%Y')
        else:
            # Si no hay fecha máxima, establecer como None string para script.py
            max_date_fmt = "None"

        # Config WITHOUT SCHEDULE_ID (will be set after discovery)
        config_content = f"""EMAIL={email}
PASSWORD={user_data["appt_password"]}
COUNTRY={user_data.get("country", "co")}
FACILITY_ID={facility_id}
MIN_DATE={min_date_fmt}
MAX_DATE={max_date_fmt}
NEED_ASC={need_cas}
ASC_FACILITY_ID={asc_facility_id}
SCHEDULE_ID=
APPOINTMENT_ID={appointment_id or ''}
TELEGRAM_BOT_TOKEN=8451235369:AAHhokjI65kP9o_mFvj6UW7LsVWh8Z-vl3s
TELEGRAM_CHAT_ID={user_data.get("telegram_user_id") or user_data.get("telegram_chat_id", "")}
DB_HOST={os.getenv("DB_HOST", "")}
DB_USER={os.getenv("DB_USER", "")}
DB_PASS={os.getenv("DB_PASS", "")}
DB_NAME={os.getenv("DB_NAME", "")}
"""

        # Read local files
        script_content = None
        if os.path.exists(SCRIPT_FILE):
            with open(SCRIPT_FILE, "r", encoding="utf-8") as f:
                script_content = f.read()
            logger.info(f"Loaded script.py ({len(script_content)} bytes)")

        requirements_content = None
        if os.path.exists(SCRIPT_REQUIREMENTS_FILE):
            with open(SCRIPT_REQUIREMENTS_FILE, "r", encoding="utf-8") as f:
                requirements_content = f.read()

        # Connect and deploy
        ssh = _connect_ssh()
        sftp = ssh.open_sftp()

        try:
            sftp.mkdir(base_path)
            logger.info(f"Created directory: {base_path}")
        except IOError:
            logger.info("Directory already exists")

        # Upload files
        with sftp.file(f"{base_path}/config", "w") as f:
            f.write(config_content)
        logger.info("Uploaded config")

        if script_content:
            with sftp.file(f"{base_path}/script.py", "w") as f:
                f.write(script_content)
            logger.info("Uploaded script.py")

        if requirements_content:
            with sftp.file(f"{base_path}/requirements.txt", "w") as f:
                f.write(requirements_content)
            logger.info("Uploaded requirements.txt")

        # Check if the shared venv exists on the VPS
        shared_venv = f"/home/{VPS_USER}/shared_venv"
        check_out, check_err = _run_ssh_command(ssh, f"test -d {shared_venv} && echo 'YES' || echo 'NO'")
        
        if "YES" not in check_out:
            logger.info(f"Shared virtual environment does not exist. Creating at {shared_venv} on VPS...")
            if requirements_content:
                with sftp.file(f"/home/{VPS_USER}/temp_reqs.txt", "w") as temp_req_f:
                    temp_req_f.write(requirements_content)
                logger.info("Uploaded temp_reqs.txt for shared venv installation")
        
        sftp.close()

        if "YES" not in check_out:
            _run_ssh_command(ssh, f"python3 -m venv {shared_venv}")
            _run_ssh_command(ssh, f"{shared_venv}/bin/pip install --upgrade pip")
            if requirements_content:
                _run_ssh_command(ssh, f"{shared_venv}/bin/pip install -r /home/{VPS_USER}/temp_reqs.txt")
                _run_ssh_command(ssh, f"rm /home/{VPS_USER}/temp_reqs.txt")
            logger.info("Shared virtual environment created and dependencies installed.")
        else:
            logger.info("Reusing existing shared virtual environment on VPS.")

        # Create symbolic link from base_path/venv to shared_venv
        _run_ssh_command(ssh, f"ln -sfn {shared_venv} {base_path}/venv")
        logger.info(f"Symlink created from {base_path}/venv to {shared_venv}")

        ssh.close()
        return True

    except Exception as e:
        logger.error(f"SSH/VPS Error: {e}")
        return False


def discover_schedule_ids(email: str, appointment_id: int = None) -> tuple[dict, str]:
    """Phase 2: Runs script.py --discover on VPS.
    Returns (schedule_ids_dict, error_message). error_message is empty on success."""
    try:
        base_path, folder_name = _get_base_path(email, appointment_id)
        ssh = _connect_ssh()

        discover_cmd = (
            f"cd {base_path} && "
            f"{base_path}/venv/bin/python script.py --discover 2>&1"
        )
        out, err = _run_ssh_command(ssh, discover_cmd, timeout=180)
        ssh.close()

        # Parse DISCOVER_RESULT or DISCOVER_ERROR from output
        for line in out.split('\n'):
            if line.startswith('DISCOVER_RESULT:'):
                json_str = line[len('DISCOVER_RESULT:'):]
                schedule_ids = json.loads(json_str)
                logger.info(f"Discovered {len(schedule_ids)} schedule IDs")
                return schedule_ids, ""
            elif line.startswith('DISCOVER_ERROR:'):
                error_msg = line[len('DISCOVER_ERROR:'):]
                logger.warning(f"Discovery error from script: {error_msg}")
                return {}, error_msg

        # No result found — build diagnostic message
        last_lines = '\n'.join(out.split('\n')[-15:]) if out else '(sin salida)'
        error_detail = f"Última salida del script:\n{last_lines}"
        if err:
            error_detail += f"\n\nStderr:\n{err[-500:]}"
        logger.warning(f"No DISCOVER_RESULT found. Output tail: {last_lines}")
        return {}, error_detail

    except Exception as e:
        logger.error(f"Discovery failed: {e}")
        return {}, str(e)


def set_schedule_id_and_start(email: str, schedule_id: str, appointment_id: int = None) -> bool:
    """Phase 3: Updates config with SCHEDULE_ID and starts script via PM2."""
    try:
        base_path, folder_name = _get_base_path(email, appointment_id)
        ssh = _connect_ssh()

        # Read current config, replace SCHEDULE_ID
        sftp = ssh.open_sftp()
        config_path = f"{base_path}/config"
        with sftp.file(config_path, "r") as f:
            config_lines = f.read().decode('utf-8')

        # Replace empty SCHEDULE_ID with the selected one
        new_config = []
        for line in config_lines.splitlines():
            if line.startswith("SCHEDULE_ID="):
                new_config.append(f"SCHEDULE_ID={schedule_id}")
            else:
                new_config.append(line)

        with sftp.file(config_path, "w") as f:
            f.write('\n'.join(new_config) + '\n')
        logger.info(f"Updated config with SCHEDULE_ID={schedule_id}")

        sftp.close()

        # Stop any existing PM2 process, then start
        pm2_name = f"visa_{folder_name}"
        _run_ssh_command(ssh, f"pm2 delete {pm2_name} 2>/dev/null || true")

        pm2_cmd = (
            f"cd {base_path} && "
            f"pm2 start script.py "
            f"--name {pm2_name} "
            f"--interpreter {base_path}/venv/bin/python "
            f"--interpreter-args \"-u\" "
            f"--cwd {base_path}"
        )
        _run_ssh_command(ssh, pm2_cmd)
        logger.info(f"Started PM2 process: {pm2_name}")

        _run_ssh_command(ssh, "pm2 save")
        ssh.close()
        return True

    except Exception as e:
        logger.error(f"Failed to set schedule ID and start: {e}")
        return False


def stop_pm2_process(email: str, appointment_id: int = None) -> bool:
    """Stops the PM2 process for the given appointment on the VPS."""
    try:
        base_path, folder_name = _get_base_path(email, appointment_id)
        pm2_name = f"visa_{folder_name}"
        logger.info(f"Connecting to VPS to stop PM2 process: {pm2_name}")
        
        ssh = _connect_ssh()
        _run_ssh_command(ssh, f"pm2 stop {pm2_name}")
        _run_ssh_command(ssh, "pm2 save")
        ssh.close()
        return True
    except Exception as e:
        logger.error(f"Failed to stop PM2 process {pm2_name or email}: {e}")
        return False


def start_pm2_process(email: str, appointment_id: int = None) -> bool:
    """Starts/resumes the PM2 process for the given appointment on the VPS."""
    try:
        base_path, folder_name = _get_base_path(email, appointment_id)
        pm2_name = f"visa_{folder_name}"
        logger.info(f"Connecting to VPS to start PM2 process: {pm2_name}")
        
        ssh = _connect_ssh()
        _run_ssh_command(ssh, f"pm2 start {pm2_name}")
        _run_ssh_command(ssh, "pm2 save")
        ssh.close()
        return True
    except Exception as e:
        logger.error(f"Failed to start PM2 process {pm2_name or email}: {e}")
        return False

def get_pm2_logs(email: str, appointment_id: int = None, lines: int = 100) -> str:
    """Fetches the last N lines of PM2 logs for the given appointment's process."""
    try:
        base_path, folder_name = _get_base_path(email, appointment_id)
        pm2_name = f"visa_{folder_name}"
        logger.info(f"Connecting to VPS to fetch logs for: {pm2_name}")
        
        ssh = _connect_ssh()
        # use --nostream to just get the output and exit
        cmd = f"pm2 logs {pm2_name} --lines {lines} --nostream"
        stdin, stdout, stderr = ssh.exec_command(cmd)
        
        out = stdout.read().decode('utf-8')
        err = stderr.read().decode('utf-8')
        ssh.close()
        
        if not out and not err:
            return "No se encontraron logs o el proceso no existe."
            
        return out + "\n" + err
    except Exception as e:
        logger.error(f"Failed to fetch PM2 logs for {email}: {e}")
        return f"Error al conectar con el servidor: {e}"
