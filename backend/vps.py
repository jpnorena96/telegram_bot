import json
import logging
import os
import paramiko
from datetime import datetime
from config import VPS_HOST, VPS_USER, VPS_PASS

logger = logging.getLogger(__name__)

# Mapping: consulate name → (facility_id, asc_facility_id)
CONSULATE_FACILITY_MAP = {
    "bogota": {"facility_id": "25", "asc_facility_id": "26"},
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
    # Default (México)
    "_default": {"facility_id": "65", "asc_facility_id": "77"},
}

# Paths relative to project root
PROJECT_ROOT = os.path.dirname(os.path.dirname(__file__))
SCRIPT_FILE = os.path.join(PROJECT_ROOT, "script.py")
SCRIPT_REQUIREMENTS_FILE = os.path.join(PROJECT_ROOT, "script_requirements.txt")


def _get_facility_ids(consulate_name: str, need_cas: bool) -> tuple[str, str]:
    """Returns (facility_id, asc_facility_id) based on consulate name."""
    key = consulate_name.strip().lower()
    ids = CONSULATE_FACILITY_MAP.get(key, CONSULATE_FACILITY_MAP["_default"])
    facility_id = ids["facility_id"]
    asc_facility_id = ids["asc_facility_id"] if need_cas else "None"
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

        # Format dates from YYYY-MM-DD to DD.MM.YYYY
        min_date_obj = datetime.strptime(user_data["min_consulate_date"], '%Y-%m-%d')
        max_date_obj = datetime.strptime(user_data["max_consulate_date"], '%Y-%m-%d')
        min_date_fmt = min_date_obj.strftime('%d.%m.%Y')
        max_date_fmt = max_date_obj.strftime('%d.%m.%Y')

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
TELEGRAM_BOT_TOKEN=8151514910:AAEHkTr3ZNooaxti2K37oCn02GPCEfVFe9E
TELEGRAM_CHAT_ID={user_data.get("telegram_chat_id", "")}
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

        sftp.close()

        # Create venv and install deps
        _run_ssh_command(ssh, f"python3 -m venv {base_path}/venv")
        if requirements_content:
            _run_ssh_command(ssh, f"{base_path}/venv/bin/pip install --upgrade pip")
            _run_ssh_command(ssh, f"{base_path}/venv/bin/pip install -r {base_path}/requirements.txt")
            logger.info("Dependencies installed")

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
