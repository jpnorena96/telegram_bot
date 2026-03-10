import logging
import mysql.connector
from telegram import Update, ReplyKeyboardMarkup, ReplyKeyboardRemove
from telegram.ext import Application, CommandHandler, ContextTypes, ConversationHandler, MessageHandler, filters
from datetime import datetime
import os
import paramiko

# Enable logging
logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s", level=logging.INFO
)
# set higher logging level for httpx to avoid all GET and POST requests being logged
logging.getLogger("httpx").setLevel(logging.WARNING)

logger = logging.getLogger(__name__)

# Define states for the ConversationHandler
EMAIL, PASSWORD, APPOINTMENT_EMAIL, EDIT_OR_NEW_APPOINTMENT, APPOINTMENT_PASSWORD, IVR, CONSULATE, CONSULATE_ASC, MIN_DATE, MAX_DATE = range(10)

# Database Configuration - Update these or use environment variables
DB_CONFIG = {
    "host": "173.212.225.148",
    "user": "root",
    "password": "Cvpm1234",
    "database": "visa_bot_db_telegram"
}

# VPS SSH Configuration
VPS_HOST = "173.212.225.148" # Assuming same IP based on DB config
VPS_USER = "miguel"
VPS_PASS = "Miguel3"

# Telegram Bot Token - Update this or use environment variable
TOKEN = "8552043794:AAFHoXSeesLdwJT-vLTExsDjpmtDZ7e7ELs"

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Starts the conversation and asks for the email."""
    await update.message.reply_text(
        "Hola! Soy el bot de citas de visa.\n\n"
        "🔒 **Paso 1: Iniciar Sesión**\n"
        "Por favor ingresa tu correo electrónico registrado en el bot:",
        reply_markup=ReplyKeyboardRemove(),
        parse_mode='Markdown'
    )
    return EMAIL

async def email(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Stores the email and asks for the password."""
    context.user_data["email"] = update.message.text
    await update.message.reply_text("Gracias. Ahora, por favor ingresa tu contraseña:")
    return PASSWORD

async def password(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Stores the password, validates against DB, and asks for the consulate."""
    password_text = update.message.text
    email_text = context.user_data["email"]
    
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor(dictionary=True)
        
        # Verify credentials in users table
        sql = "SELECT id FROM users WHERE email = %s AND password = %s"
        cursor.execute(sql, (email_text, password_text))
        user = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        if user:
            context.user_data["user_id"] = user["id"]
            await update.message.reply_text(
                "¡Login exitoso! ✅\n\n"
                "Ahora vamos a configurar los datos para la búsqueda de citas.\n"
                "Por favor ingresa el **Correo Electrónico de la cuenta de Visas** (donde buscaremos la cita):",
                parse_mode='Markdown'
            )
            return APPOINTMENT_EMAIL
        else:
            await update.message.reply_text("❌ Credenciales incorrectas.\n\nPor favor intenta nuevamente ingresando tu correo de usuario del bot:")
            return EMAIL
            
    except mysql.connector.Error as err:
        logger.error(f"Database Error: {err}")
        await update.message.reply_text("Error de conexión a la base de datos. Intenta más tarde.")
        return ConversationHandler.END
    except Exception as e:
        logger.error(f"Error: {e}")
        await update.message.reply_text("Ocurrió un error inesperado.")
        return ConversationHandler.END

async def appointment_email(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Stores the appointment email, checks if it exists, and asks for the appointment password."""
    appt_email = update.message.text
    context.user_data["appt_email"] = appt_email
    user_id = context.user_data.get("user_id")

    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor(dictionary=True)
        sql = "SELECT id FROM user_appointments WHERE user_id = %s AND email = %s"
        cursor.execute(sql, (user_id, appt_email))
        existing = cursor.fetchone()
        cursor.close()
        conn.close()

        if existing:
            context.user_data["is_editing"] = True
            context.user_data["appointment_id"] = existing["id"]
            
            reply_keyboard = [["Sí", "No"]]
            
            await update.message.reply_text(
                "⚠️ Este correo de citas ya está registrado.\n"
                "¿Deseas editar la información de configuración de este usuario?",
                reply_markup=ReplyKeyboardMarkup(reply_keyboard, one_time_keyboard=True, resize_keyboard=True)
            )
            return EDIT_OR_NEW_APPOINTMENT
    except mysql.connector.Error as err:
        logger.error(f"Database Error: {err}")
        # Proceed silently if DB error to avoid breaking the flow completely
    
    context.user_data["is_editing"] = False
    await update.message.reply_text(
        "Correo de citas guardado.\n\nAhora ingresa la **Contraseña de la cuenta de Visas**:",
        reply_markup=ReplyKeyboardRemove(),
        parse_mode='Markdown'
    )
    return APPOINTMENT_PASSWORD

async def edit_or_new_appointment(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Handles the user's choice to edit an existing appointment or provide a new email."""
    text = update.message.text.lower()
    if text in ['sí', 'si', 'yes', 'y', 's']:
        await update.message.reply_text(
            "Perfecto. Vamos a actualizar la información.\n\n"
            "Por favor ingresa la nueva **Contraseña de la cuenta de Visas**:", 
            reply_markup=ReplyKeyboardRemove(),
            parse_mode='Markdown'
        )
        return APPOINTMENT_PASSWORD
    else:
        context.user_data["is_editing"] = False
        if "appointment_id" in context.user_data:
            del context.user_data["appointment_id"]
            
        await update.message.reply_text(
            "Entendido. Por favor ingresa un **Correo Electrónico de la cuenta de Visas** diferente:", 
            reply_markup=ReplyKeyboardRemove(),
            parse_mode='Markdown'
        )
        return APPOINTMENT_EMAIL

async def appointment_password(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Stores the appointment password and asks for the IVR."""
    context.user_data["appt_password"] = update.message.text
    await update.message.reply_text("Contraseña de citas guardada.\n\nPor favor ingresa el número de IVR (o escribe 'Ninguno' si no aplica):")
    return IVR

async def ivr(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Stores the IVR and asks for the consulate."""
    context.user_data["ivr"] = update.message.text
    await update.message.reply_text("IVR guardado.\n\nPor favor ingresa el Consulado (Normal) donde buscas cita (ej. Bogota, Lima):")
    return CONSULATE

async def consulate(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Stores the consulate and asks for the ASC consulate."""
    context.user_data["consulate"] = update.message.text
    await update.message.reply_text("Entendido. Ahora ingresa el Consulado ASC (CAS):")
    return CONSULATE_ASC

async def consulate_asc(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Stores the ASC consulate and asks for the minimum date."""
    context.user_data["consulate_asc"] = update.message.text
    await update.message.reply_text(
        "Ahora necesito las fechas para la cita CONSULAR (Normal).\n"
        "Por favor ingresa la FECHA MÍNIMA (desde cuando puedes asistir) en formato YYYY-MM-DD (ej. 2026-01-01):"
    )
    return MIN_DATE

def validate_date(date_text):
    try:
        datetime.strptime(date_text, '%Y-%m-%d')
        return True
    except ValueError:
        return False

import subprocess
import tempfile

def create_vps_config(user_data):
    """Creates a config file on the VPS via native ssh/sftp."""
    try:
        logger.info(f"Connecting to VPS {VPS_HOST} as {VPS_USER} via native SSH...")
        
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
        # Step 1: Create folder using native ssh commands
        # Windows native OpenSSH client is being used here since Paramiko auth failed
        mkdir_cmd = [
            "ssh", "-o", "StrictHostKeyChecking=no", "-o", "PreferredAuthentications=password", 
            "-o", "PubkeyAuthentication=no", f"{VPS_USER}@{VPS_HOST}", 
            f"mkdir -p {base_path}"
        ]
        
        logger.info("Executing mkdir via SSH...")
        # Note: since this requires a password, we will use a workaround to pass it 
        # On Windows, sshpass is not available natively. Paramiko should be the fallback but since it fails,
        # We will use temporary ssh key or prompt if needed.
        # Actually, let's inject a Python paramiko connection but using invoke_shell to simulate real keyboard input
        
        return create_vps_config_interactive(user_data, base_path, config_content)
        
    except Exception as e:
        logger.error(f"SSH/VPS Error: {e}")
        return False

def interactive_handler(title, instructions, prompt_list):
    # This handler automatically returns the password for any prompt the server sends during interactive login
    return [VPS_PASS for _ in prompt_list]

def create_vps_config_interactive(user_data, base_path, config_content):
    """Fallback interactive SSH login if standard auth fails."""
    try:
        # We use a lower level Transport to handle custom authentication types
        t = paramiko.Transport((VPS_HOST, 22))
        t.start_client()
        
        # Determine accepted auth types
        try:
            t.auth_none(VPS_USER)
        except paramiko.BadAuthenticationType as e:
            pass # Expected, we wanted to see what it supports or just prime the connection
            
        # Try keyboard-interactive auth which handles prompts like PuTTY/Terminal does
        logger.info("Attempting keyboard-interactive auth...")
        t.auth_interactive(VPS_USER, interactive_handler)
        
        if not t.is_authenticated():
            logger.error("Interactive auth failed.")
            return False
            
        # Create an SFTP client from the authenticated transport
        sftp = paramiko.SFTPClient.from_transport(t)
        
        # Create directory
        try:
            sftp.mkdir(base_path)
            logger.info("Created directory via SFTP")
        except IOError:
            logger.info("Directory might already exist")
            
        # Write config file
        file_path = f"{base_path}/config"
        with sftp.file(file_path, "w") as f:
            f.write(config_content)
        
        logger.info(f"Successfully created config file at {file_path}")
        sftp.close()
        t.close()
        return True
    except Exception as e:
        logger.error(f"Interactive SSH failed: {e}")
        return False

async def min_date(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Stores the minimum date and asks for the maximum date."""
    date_text = update.message.text
    if not validate_date(date_text):
        await update.message.reply_text("Formato de fecha inválido. Por favor usa YYYY-MM-DD (ej. 2026-01-01):")
        return MIN_DATE
    
    context.user_data["min_consulate_date"] = date_text
    await update.message.reply_text("Fecha mínima guardada.\n\nAhora ingresa la FECHA MÁXIMA (hasta cuando puedes asistir) para la cita CONSULAR en formato YYYY-MM-DD:")
    return MAX_DATE

async def max_date(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Stores the maximum date and saves everything to the database, using same dates for ASC."""
    date_text = update.message.text
    if not validate_date(date_text):
        await update.message.reply_text("Formato de fecha inválido. Por favor usa YYYY-MM-DD (ej. 2026-01-01):")
        return MAX_DATE

    context.user_data["max_consulate_date"] = date_text
    
    # Auto-assign ASC dates to match Consulate dates
    context.user_data["min_asc_date"] = context.user_data["min_consulate_date"]
    context.user_data["max_asc_date"] = context.user_data["max_consulate_date"]
    
    await update.message.reply_text(
        "Fechas consulares guardadas.\n"
        "Configurando automáticamente las mismas fechas para la cita ASC (CAS)..."
    )
    
    # Save to database
    user_data = context.user_data
    telegram_user_id = update.effective_user.id
    user_id = user_data.get("user_id") # Retrieved from login
    
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        if user_data.get("is_editing") and "appointment_id" in user_data:
            sql = """UPDATE user_appointments SET
                     telegram_user_id = %s, password = %s, ivr = %s, consulate = %s, consulate_asc = %s,
                     min_consulate_date = %s, max_consulate_date = %s,
                     min_asc_date = %s, max_asc_date = %s, status = 'pending'
                     WHERE id = %s"""
            val = (telegram_user_id, user_data["appt_password"], user_data.get("ivr"),
                   user_data["consulate"], user_data["consulate_asc"], 
                   user_data["min_consulate_date"], user_data["max_consulate_date"], 
                   user_data["min_asc_date"], user_data["max_asc_date"],
                   user_data["appointment_id"])
            cursor.execute(sql, val)
            action_text = "actualizada"
        else:
            sql = """INSERT INTO user_appointments 
                     (telegram_user_id, user_id, email, password, ivr, consulate, consulate_asc, 
                      min_consulate_date, max_consulate_date, min_asc_date, max_asc_date, status) 
                     VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'pending')"""
            val = (telegram_user_id, user_id, user_data["appt_email"], user_data["appt_password"], user_data.get("ivr"),
                   user_data["consulate"], user_data["consulate_asc"], 
                   user_data["min_consulate_date"], user_data["max_consulate_date"], 
                   user_data["min_asc_date"], user_data["max_asc_date"])
            cursor.execute(sql, val)
            action_text = "guardada"
            

        conn.commit()
        
        cursor.close()
        conn.close()
        
        # Create config file on VPS
        vps_success = create_vps_config(user_data)
        vps_msg = "\n📂 Archivo de configuración creado en el servidor." if vps_success else "\n⚠️ Hubo un problema creando la carpeta en el servidor, pero los datos se guardaron en la base de datos."

        await update.message.reply_text(
            f"¡Información {action_text} exitosamente en la base de datos!{vps_msg}\n"
            "El bot comenzará a buscar citas con estos parámetros pronto."
        )
    except mysql.connector.Error as err:
        logger.error(f"Error: {err}")
        await update.message.reply_text(f"Hubo un error al guardar en la base de datos: {err}")
    except Exception as e:
        logger.error(f"Error: {e}")
        await update.message.reply_text(f"Ocurrió un error inesperado: {e}")

    return ConversationHandler.END

async def cancel(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Cancels and ends the conversation."""
    await update.message.reply_text(
        "Operación cancelada.", reply_markup=ReplyKeyboardRemove()
    )
    return ConversationHandler.END

def main() -> None:
    """Run the bot."""
    # Create the Application and pass it your bot's token.
    application = Application.builder().token(TOKEN).build()

    # Add conversation handler with the states
    conv_handler = ConversationHandler(
        entry_points=[CommandHandler("start", start)],
        states={
            EMAIL: [MessageHandler(filters.TEXT & ~filters.COMMAND, email)],
            PASSWORD: [MessageHandler(filters.TEXT & ~filters.COMMAND, password)],
            APPOINTMENT_EMAIL: [MessageHandler(filters.TEXT & ~filters.COMMAND, appointment_email)],
            EDIT_OR_NEW_APPOINTMENT: [MessageHandler(filters.TEXT & ~filters.COMMAND, edit_or_new_appointment)],
            APPOINTMENT_PASSWORD: [MessageHandler(filters.TEXT & ~filters.COMMAND, appointment_password)],
            IVR: [MessageHandler(filters.TEXT & ~filters.COMMAND, ivr)],
            CONSULATE: [MessageHandler(filters.TEXT & ~filters.COMMAND, consulate)],
            CONSULATE_ASC: [MessageHandler(filters.TEXT & ~filters.COMMAND, consulate_asc)],
            MIN_DATE: [MessageHandler(filters.TEXT & ~filters.COMMAND, min_date)],
            MAX_DATE: [MessageHandler(filters.TEXT & ~filters.COMMAND, max_date)],
        },
        fallbacks=[CommandHandler("cancel", cancel)],
    )

    application.add_handler(conv_handler)

    # Run the bot until the user presses Ctrl-C
    application.run_polling(allowed_updates=Update.ALL_TYPES)

if __name__ == "__main__":
    main()
