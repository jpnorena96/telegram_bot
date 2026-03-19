import time
import logging
import paramiko
from config import VPS_HOST, VPS_USER, VPS_PASS

logging.basicConfig(
    format="%(asctime)s - %(levelname)s - %(message)s", level=logging.INFO
)
logger = logging.getLogger(__name__)

def connect_ssh():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(VPS_HOST, port=22, username=VPS_USER, password=VPS_PASS, timeout=30)
    return ssh

def reset_pm2():
    try:
        logger.info("Connecting to VPS to restart PM2 processes...")
        ssh = connect_ssh()
        stdin, stdout, stderr = ssh.exec_command("pm2 restart all")
        out = stdout.read().decode('utf-8').strip()
        err = stderr.read().decode('utf-8').strip()
        
        if out:
            logger.info(f"PM2 Output: {out[:200]}...")
        if err:
            logger.warning(f"PM2 Error: {err[:200]}...")
            
        ssh.close()
        logger.info("Successfully sent PM2 restart command.")
    except Exception as e:
        logger.error(f"Error resetting PM2 processes: {e}")

def main():
    logger.info("Starting PM2 reset scheduler. Will restart every 9 minutes.")
    wait_time = 11 * 60  # 22 minutes in seconds
    
    while True:
        reset_pm2()
        logger.info(f"Waiting 9 minutes until next restart...")
        time.sleep(wait_time)

if __name__ == "__main__":
    main()