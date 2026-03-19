import paramiko
import os
from dotenv import load_dotenv

load_dotenv()

VPS_HOST = os.getenv("VPS_HOST")
VPS_USER = os.getenv("VPS_USER")
VPS_PASS = os.getenv("VPS_PASS")

def check_logs():
    print(f"Connecting to {VPS_HOST} as {VPS_USER}...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(VPS_HOST, port=22, username=VPS_USER, password=VPS_PASS, timeout=30)
    
    stdin, stdout, stderr = ssh.exec_command("ls -td /home/miguel/*/ | head -n 3")
    folders = stdout.read().decode('utf-8').strip().split('\n')
    
    for folder in folders:
        if not folder.strip():
            continue
        print(f"\n--- Checking logs in {folder} ---")
        cmd = f"tail -n 30 {folder.strip()}log.txt"
        stdin, stdout, stderr = ssh.exec_command(cmd)
        out = stdout.read().decode('utf-8')
        print(out)
        
    ssh.close()

if __name__ == "__main__":
    check_logs()
