import logging
import mysql.connector
from telegram import Update, ReplyKeyboardRemove, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import ContextTypes, ConversationHandler
from datetime import datetime

from backend import db, vps
from bot.states import *

logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────
# MAIN MENU
# ─────────────────────────────────────────────

async def show_main_menu(update_or_query, context: ContextTypes.DEFAULT_TYPE, text: str = None) -> int:
    """Displays the main menu with inline buttons."""
    if text is None:
        text = (
            "🎯 *Menú Principal*\n\n"
            "Selecciona una opción:"
        )

    keyboard = [
        [InlineKeyboardButton("➕ Crear nuevo usuario", callback_data="menu_create")],
        [InlineKeyboardButton("✏️ Editar usuario", callback_data="menu_edit")],
        [InlineKeyboardButton("👁️ Ver mis usuarios", callback_data="menu_view")],
        [InlineKeyboardButton("🗑️ Eliminar usuario", callback_data="menu_delete")],
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)

    if hasattr(update_or_query, 'callback_query') and update_or_query.callback_query:
        await update_or_query.callback_query.edit_message_text(
            text, reply_markup=reply_markup, parse_mode='Markdown'
        )
    elif hasattr(update_or_query, 'message') and update_or_query.message:
        await update_or_query.message.reply_text(
            text, reply_markup=reply_markup, parse_mode='Markdown'
        )

    return MAIN_MENU


async def main_menu_callback(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Handles the main menu button clicks."""
    query = update.callback_query
    await query.answer()

    if query.data == "back_to_menu":
        return await show_main_menu(update, context)

    if query.data == "menu_create":
        context.user_data["is_editing"] = False
        await query.edit_message_text(
            "➕ *Crear Nuevo Usuario de Citas*\n\n"
            "Por favor ingresa el *Correo Electrónico de la cuenta de Visas*:",
            parse_mode='Markdown'
        )
        return APPOINTMENT_EMAIL

    elif query.data == "menu_edit":
        return await show_appointment_list(update, context, action="edit")

    elif query.data == "menu_view":
        return await view_appointments(update, context)

    elif query.data == "menu_delete":
        return await show_appointment_list(update, context, action="delete")

    return MAIN_MENU


async def view_appointments(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Shows all appointments for the current user."""
    query = update.callback_query
    user_id = context.user_data.get("user_id")

    try:
        appointments = db.get_appointments(user_id)

        if not appointments:
            text = (
                "📭 *No tienes usuarios registrados*\n\n"
                "Usa la opción *➕ Crear nuevo usuario* para agregar uno."
            )
        else:
            text = "👁️ *Tus Usuarios Registrados:*\n\n"
            for i, appt in enumerate(appointments, 1):
                status_emoji = "✅" if appt.get("status") == "pending" else "⏸️"
                text += (
                    f"━━━━━━━━━━━━━━━━━━\n"
                    f"{status_emoji} *Usuario {i}*\n"
                    f"📧 Email: `{appt.get('email', 'N/A')}`\n"
                    f"🏛️ Consulado: {appt.get('consulate', 'N/A')}\n"
                    f"🏢 ASC: {appt.get('consulate_asc', 'N/A')}\n"
                    f"📅 Fechas: {appt.get('min_consulate_date', 'N/A')} → {appt.get('max_consulate_date', 'N/A')}\n"
                    f"📊 Estado: {appt.get('status', 'N/A')}\n\n"
                )
    except mysql.connector.Error as err:
        logger.error(f"Database Error: {err}")
        text = "❌ Error al consultar la base de datos."

    keyboard = [[InlineKeyboardButton("◀️ Volver al Menú", callback_data="back_to_menu")]]
    await query.edit_message_text(text, reply_markup=InlineKeyboardMarkup(keyboard), parse_mode='Markdown')
    return MAIN_MENU


async def show_appointment_list(update: Update, context: ContextTypes.DEFAULT_TYPE, action: str) -> int:
    """Shows a list of appointments as inline buttons for edit/delete."""
    query = update.callback_query
    user_id = context.user_data.get("user_id")

    try:
        appointments = db.get_appointment_list(user_id)

        if not appointments:
            text = (
                "📭 *No tienes usuarios registrados*\n\n"
                "Usa la opción *➕ Crear nuevo usuario* para agregar uno."
            )
            keyboard = [[InlineKeyboardButton("◀️ Volver al Menú", callback_data="back_to_menu")]]
            await query.edit_message_text(text, reply_markup=InlineKeyboardMarkup(keyboard), parse_mode='Markdown')
            return MAIN_MENU

        context.user_data["menu_action"] = action

        if action == "edit":
            text = "✏️ *Selecciona el usuario a editar:*\n"
        else:
            text = "🗑️ *Selecciona el usuario a eliminar:*\n"

        keyboard = []
        for appt in appointments:
            label = f"📧 {appt['email']} — 🏛️ {appt.get('consulate', '?')}"
            callback = f"select_{action}_{appt['id']}"
            keyboard.append([InlineKeyboardButton(label, callback_data=callback)])

        keyboard.append([InlineKeyboardButton("◀️ Volver al Menú", callback_data="back_to_menu")])

        await query.edit_message_text(text, reply_markup=InlineKeyboardMarkup(keyboard), parse_mode='Markdown')
        return SELECT_APPOINTMENT

    except mysql.connector.Error as err:
        logger.error(f"Database Error: {err}")
        await query.edit_message_text("❌ Error al consultar la base de datos.")
        return MAIN_MENU


async def select_appointment_callback(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Handles selection of an appointment for edit or delete."""
    query = update.callback_query
    await query.answer()

    if query.data == "back_to_menu":
        return await show_main_menu(update, context)

    parts = query.data.split("_")
    action = parts[1]
    appointment_id = int(parts[2])

    context.user_data["appointment_id"] = appointment_id

    if action == "edit":
        context.user_data["is_editing"] = True

        try:
            appt = db.get_appointment(appointment_id)
            if appt:
                context.user_data["appt_email"] = appt["email"]
        except mysql.connector.Error:
            pass

        await query.edit_message_text(
            "✏️ *Editando usuario*\n\n"
            "Ingresa la nueva *Contraseña de la cuenta de Visas*:",
            parse_mode='Markdown'
        )
        return APPOINTMENT_PASSWORD

    elif action == "delete":
        try:
            appt = db.get_appointment(appointment_id)
        except mysql.connector.Error:
            appt = None

        email_display = appt['email'] if appt else 'N/A'
        consulate_display = appt.get('consulate', 'N/A') if appt else 'N/A'

        keyboard = [
            [InlineKeyboardButton("✅ Sí, eliminar", callback_data="confirm_delete_yes"),
             InlineKeyboardButton("❌ No, cancelar", callback_data="confirm_delete_no")]
        ]

        await query.edit_message_text(
            f"⚠️ *¿Estás seguro de eliminar este usuario?*\n\n"
            f"📧 Email: `{email_display}`\n"
            f"🏛️ Consulado: {consulate_display}\n\n"
            f"Esta acción no se puede deshacer.",
            reply_markup=InlineKeyboardMarkup(keyboard),
            parse_mode='Markdown'
        )
        return CONFIRM_DELETE


async def confirm_delete_callback(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Handles delete confirmation."""
    query = update.callback_query
    await query.answer()

    if query.data == "confirm_delete_yes":
        appointment_id = context.user_data.get("appointment_id")
        try:
            db.delete_appointment(appointment_id)
            return await show_main_menu(
                update, context,
                text="✅ *Usuario eliminado exitosamente.*\n\n🎯 *Menú Principal*\n\nSelecciona una opción:"
            )
        except mysql.connector.Error as err:
            logger.error(f"Database Error: {err}")
            await query.edit_message_text("❌ Error al eliminar el usuario.")
            return MAIN_MENU
    else:
        return await show_main_menu(
            update, context,
            text="❌ Eliminación cancelada.\n\n🎯 *Menú Principal*\n\nSelecciona una opción:"
        )


# ─────────────────────────────────────────────
# LOGIN FLOW
# ─────────────────────────────────────────────

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
    """Stores the password, validates against DB, and shows main menu."""
    password_text = update.message.text
    email_text = context.user_data["email"]

    try:
        user = db.verify_user(email_text, password_text)

        if user:
            context.user_data["user_id"] = user["id"]
            return await show_main_menu(
                update, context,
                text=(
                    "¡Login exitoso! ✅\n\n"
                    "🎯 *Menú Principal*\n\n"
                    "Selecciona una opción:"
                )
            )
        else:
            await update.message.reply_text(
                "❌ Credenciales incorrectas.\n\n"
                "Por favor intenta nuevamente ingresando tu correo de usuario del bot:"
            )
            return EMAIL

    except mysql.connector.Error as err:
        logger.error(f"Database Error: {err}")
        await update.message.reply_text("Error de conexión a la base de datos. Intenta más tarde.")
        return ConversationHandler.END
    except Exception as e:
        logger.error(f"Error: {e}")
        await update.message.reply_text("Ocurrió un error inesperado.")
        return ConversationHandler.END


# ─────────────────────────────────────────────
# APPOINTMENT CREATION / EDIT FLOW
# ─────────────────────────────────────────────

async def appointment_email(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Stores the appointment email, checks if it exists, and asks for password."""
    appt_email = update.message.text
    context.user_data["appt_email"] = appt_email
    user_id = context.user_data.get("user_id")

    try:
        existing = db.check_existing_appointment(user_id, appt_email)

        if existing:
            context.user_data["is_editing"] = True
            context.user_data["appointment_id"] = existing["id"]

            keyboard = [
                [InlineKeyboardButton("✅ Sí", callback_data="edit_yes"),
                 InlineKeyboardButton("❌ No", callback_data="edit_no")]
            ]

            await update.message.reply_text(
                "⚠️ Este correo de citas ya está registrado.\n"
                "¿Deseas editar la información de configuración de este usuario?",
                reply_markup=InlineKeyboardMarkup(keyboard)
            )
            return EDIT_OR_NEW_APPOINTMENT
    except mysql.connector.Error as err:
        logger.error(f"Database Error: {err}")

    context.user_data["is_editing"] = False
    await update.message.reply_text(
        "Correo de citas guardado.\n\nAhora ingresa la **Contraseña de la cuenta de Visas**:",
        reply_markup=ReplyKeyboardRemove(),
        parse_mode='Markdown'
    )
    return APPOINTMENT_PASSWORD


async def edit_or_new_appointment(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Handles the user's choice to edit an existing appointment or provide a new email."""
    query = update.callback_query
    await query.answer()

    if query.data == "edit_yes":
        await query.edit_message_text(
            "✅ Perfecto. Vamos a actualizar la información.\n\n"
            "Por favor ingresa la nueva **Contraseña de la cuenta de Visas**:",
            parse_mode='Markdown'
        )
        return APPOINTMENT_PASSWORD
    else:
        context.user_data["is_editing"] = False
        if "appointment_id" in context.user_data:
            del context.user_data["appointment_id"]

        await query.edit_message_text(
            "Entendido. Por favor ingresa un **Correo Electrónico de la cuenta de Visas** diferente:",
            parse_mode='Markdown'
        )
        return APPOINTMENT_EMAIL


async def appointment_password(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Stores the appointment password and asks for the IVR."""
    context.user_data["appt_password"] = update.message.text
    await update.message.reply_text(
        "Contraseña de citas guardada.\n\n"
        "Por favor ingresa el número de IVR (o escribe 'Ninguno' si no aplica):"
    )
    return IVR


async def ivr(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Stores the IVR and asks for the consulate."""
    context.user_data["ivr"] = update.message.text
    await update.message.reply_text(
        "IVR guardado.\n\n"
        "Por favor ingresa el Consulado (Normal) donde buscas cita (ej. Bogota, Lima):"
    )
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


# ─────────────────────────────────────────────
# DATE HANDLERS & SAVE
# ─────────────────────────────────────────────

async def min_date(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Stores the minimum date and asks for the maximum date."""
    date_text = update.message.text
    if not validate_date(date_text):
        await update.message.reply_text("Formato de fecha inválido. Por favor usa YYYY-MM-DD (ej. 2026-01-01):")
        return MIN_DATE

    context.user_data["min_consulate_date"] = date_text
    await update.message.reply_text(
        "Fecha mínima guardada.\n\n"
        "Ahora ingresa la FECHA MÁXIMA (hasta cuando puedes asistir) para la cita CONSULAR en formato YYYY-MM-DD:"
    )
    return MAX_DATE


async def max_date(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Stores the maximum date and saves everything to the database."""
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
    user_id = user_data.get("user_id")

    try:
        if user_data.get("is_editing") and "appointment_id" in user_data:
            action_text = db.update_appointment(telegram_user_id, user_data["appointment_id"], user_data)
        else:
            action_text = db.save_appointment(telegram_user_id, user_id, user_data)

        # Create config file on VPS
        vps_success = vps.create_vps_config(user_data)
        vps_msg = (
            "\n📂 Archivo de configuración creado en el servidor."
            if vps_success
            else "\n⚠️ Hubo un problema creando la carpeta en el servidor, pero los datos se guardaron en la base de datos."
        )

        await update.message.reply_text(
            f"¡Información {action_text} exitosamente en la base de datos!{vps_msg}"
        )
    except mysql.connector.Error as err:
        logger.error(f"Error: {err}")
        await update.message.reply_text(f"Hubo un error al guardar en la base de datos: {err}")
    except Exception as e:
        logger.error(f"Error: {e}")
        await update.message.reply_text(f"Ocurrió un error inesperado: {e}")

    # Return to main menu
    return await show_main_menu(
        update, context,
        text="🎯 *Menú Principal*\n\nSelecciona una opción:"
    )


async def cancel(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Cancels and ends the conversation."""
    await update.message.reply_text(
        "Operación cancelada.", reply_markup=ReplyKeyboardRemove()
    )
    return ConversationHandler.END
