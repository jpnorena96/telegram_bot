import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))
import vps

def update_scripts_on_vps():
    print("Conectando al VPS...")
    try:
        ssh = vps._connect_ssh()
        print("Conectado exitosamente. Subiendo el nuevo script.py...")
        
        # Read the local updated script.py
        local_script_path = os.path.join(os.path.dirname(__file__), 'script.py')
        with open(local_script_path, 'r', encoding='utf-8') as f:
            script_content = f.read()
            
        sftp = ssh.open_sftp()
        
        # Guardar en una ubicación temporal
        temp_path = "/home/miguel/temp_script.py"
        with sftp.file(temp_path, "w") as f:
            f.write(script_content)
        sftp.close()
        
        print("Reemplazando script.py en todas las carpetas activas...")
        # Buscar todas las carpetas y reemplazar el script.py
        cmd_replace = f"find /home/miguel -name script.py -type f -exec cp {temp_path} {{}} \\;"
        vps._run_ssh_command(ssh, cmd_replace)
        
        print("Reiniciando procesos en PM2 para aplicar los cambios...")
        vps._run_ssh_command(ssh, "pm2 restart all")
        
        # Limpiar temporal
        vps._run_ssh_command(ssh, f"rm {temp_path}")
        
        print("¡Todos los procesos han sido actualizados con el nuevo formato de WhatsApp!")
        ssh.close()
    except Exception as e:
        print(f"Error al conectar o ejecutar comandos en el VPS: {e}")

if __name__ == '__main__':
    update_scripts_on_vps()
