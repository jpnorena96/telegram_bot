import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))
import vps

OLD_TOKEN = "8451235369:AAFeoGdbIHfRyxAyaBgnV300V91zs-CbtMo"
NEW_TOKEN = "8451235369:AAFeoGdbIHfRyxAyaBgnV3O0V91zs-CbtMo"

def fix_tokens_on_vps():
    print("Conectando al VPS...")
    try:
        ssh = vps._connect_ssh()
        print("Conectado exitosamente. Actualizando tokens en los archivos de configuración y script.py...")
        
        # Replace in config files
        cmd1 = f"find /home/miguel -name config -type f -exec sed -i 's/{OLD_TOKEN}/{NEW_TOKEN}/g' {{}} +"
        vps._run_ssh_command(ssh, cmd1)
        
        # Replace in script.py files
        cmd2 = f"find /home/miguel -name script.py -type f -exec sed -i 's/{OLD_TOKEN}/{NEW_TOKEN}/g' {{}} +"
        vps._run_ssh_command(ssh, cmd2)
        
        print("Reiniciando procesos en PM2 para aplicar los cambios...")
        vps._run_ssh_command(ssh, "pm2 restart all")
        
        print("¡Todos los procesos han sido actualizados y reiniciados!")
        ssh.close()
    except Exception as e:
        print(f"Error al conectar o ejecutar comandos en el VPS: {e}")

if __name__ == '__main__':
    fix_tokens_on_vps()
