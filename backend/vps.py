import logging
import os
import paramiko
from datetime import datetime
from config import VPS_HOST, VPS_USER, VPS_PASS

logger = logging.getLogger(__name__)

# Path to script.py (relative to project root)
SCRIPT_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "script.py")


def create_vps_config(user_data: dict) -> bool:
    """Creates a config file and uploads script.py on the VPS via SSH/SFTP."""
    try:
        logger.info(f"Connecting to VPS {VPS_HOST} as {VPS_USER}...")

        # Sanitize email for folder name
        email = user_data["appt_email"]
        folder_name = email.replace('@', '_').replace('.', '_')
        base_path = f"/home/{VPS_USER}/{folder_name}"

        # Format dates from YYYY-MM-DD to DD.MM.YYYY
        min_date_obj = datetime.strptime(user_data["min_consulate_date"], '%Y-%m-%d')
        max_date_obj = datetime.strptime(user_data["max_consulate_date"], '%Y-%m-%d')
        min_date_fmt = min_date_obj.strftime('%d.%m.%Y')
        max_date_fmt = max_date_obj.strftime('%d.%m.%Y')

        # Prepare config content
        config_content = f"""EMAIL={email}
PASSWORD={user_data["appt_password"]}
COUNTRY=mx
FACILITY_ID=65
MIN_DATE={min_date_fmt}
MAX_DATE={max_date_fmt}
NEED_ASC=True
ASC_FACILITY_ID=77
SCHEDULE_ID=72344835
"""
        # Read script.py content
        script_content = None
        if os.path.exists(SCRIPT_FILE):
            with open(SCRIPT_FILE, "r", encoding="utf-8") as f:
                script_content = f.read()
            logger.info(f"Loaded script.py ({len(script_content)} bytes)")
        else:
            logger.warning(f"script.py not found at {SCRIPT_FILE}")

        return _upload_files(base_path, config_content, script_content)

    except Exception as e:
        logger.error(f"SSH/VPS Error: {e}")
        return False


def _upload_files(base_path: str, config_content: str, script_content: str = None) -> bool:
    """Connects via SSH password auth and uploads config + script.py."""
    try:
        t = paramiko.Transport((VPS_HOST, 22))
        t.start_client()

        logger.info("Attempting password auth...")
        t.auth_password(VPS_USER, VPS_PASS)

        if not t.is_authenticated():
            logger.error("Password auth failed.")
            return False

        sftp = paramiko.SFTPClient.from_transport(t)

        # Create directory
        try:
            sftp.mkdir(base_path)
            logger.info("Created directory via SFTP")
        except IOError:
            logger.info("Directory might already exist")

        # Write config file
        config_path = f"{base_path}/config"
        with sftp.file(config_path, "w") as f:
            f.write(config_content)
        logger.info(f"Created config at {config_path}")

        # Write script.py file
        if script_content:
            script_path = f"{base_path}/script.py"
            with sftp.file(script_path, "w") as f:
                f.write(script_content)
            logger.info(f"Created script.py at {script_path}")

        sftp.close()
        t.close()
        return True
    except Exception as e:
        logger.error(f"SSH failed: {e}")
        return False
