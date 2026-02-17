import logging
import mysql.connector
from telegram import Update, ReplyKeyboardMarkup, ReplyKeyboardRemove
from telegram.ext import Application, CommandHandler, ContextTypes, ConversationHandler, MessageHandler, filters
from datetime import datetime
import os

# Enable logging
logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s", level=logging.INFO
)
# set higher logging level for httpx to avoid all GET and POST requests being logged
logging.getLogger("httpx").setLevel(logging.WARNING)

logger = logging.getLogger(__name__)

# Define states for the ConversationHandler
EMAIL, PASSWORD, APPOINTMENT_EMAIL, APPOINTMENT_PASSWORD, CONSULATE, CONSULATE_ASC, MIN_DATE, MAX_DATE = range(8)

# Database Configuration - Update these or use environment variables
DB_CONFIG = {
    "host": "173.212.225.148",
    "user": "root",
    "password": "Cvpm1234",
    "database": "visa_bot_db_telegram"
}

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
    """Stores the appointment email and asks for the appointment password."""
    context.user_data["appt_email"] = update.message.text
    await update.message.reply_text("Correo de citas guardado.\n\nAhora ingresa la **Contraseña de la cuenta de Visas**:", parse_mode='Markdown')
    return APPOINTMENT_PASSWORD

async def appointment_password(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Stores the appointment password and asks for the consulate."""
    context.user_data["appt_password"] = update.message.text
    await update.message.reply_text("Contraseña de citas guardada.\n\nPor favor ingresa el Consulado (Normal) donde buscas cita (ej. Bogota, Lima):")
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
        
        sql = """INSERT INTO user_appointments 
                 (telegram_user_id, user_id, email, password, consulate, consulate_asc, 
                  min_consulate_date, max_consulate_date, min_asc_date, max_asc_date, status) 
                 VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'pending')"""
        
        val = (telegram_user_id, user_id, user_data["appt_email"], user_data["appt_password"], 
               user_data["consulate"], user_data["consulate_asc"], 
               user_data["min_consulate_date"], user_data["max_consulate_date"], 
               user_data["min_asc_date"], user_data["max_asc_date"])
        
        cursor.execute(sql, val)
        conn.commit()
        
        cursor.close()
        conn.close()
        
        await update.message.reply_text(
            "¡Información guardada exitosamente en la base de datos!\n"
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
            APPOINTMENT_PASSWORD: [MessageHandler(filters.TEXT & ~filters.COMMAND, appointment_password)],
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
