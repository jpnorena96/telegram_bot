import logging
import mysql.connector
from telegram import Update, ReplyKeyboardRemove, InlineKeyboardButton, InlineKeyboardMarkup, ReplyKeyboardMarkup
from telegram.ext import ContextTypes, ConversationHandler
from datetime import datetime

from backend import db, vps
from bot.states import *

logger = logging.getLogger(__name__)

# Mapping: consulate name → (facility_id, asc_facility_id)
CONSULATE_FACILITY_MAP = {
    "bogota": {"facility_id": "25", "asc_facility_id": "26"},
    # Default (México)
    "_default": {"facility_id": "65", "asc_facility_id": "77"},
}

PLAN_LIMITS = {
    "platino": 3,
    "oro": 5,
    "diamante": 10
}

# Teclado persistente con navegacion rapida
NAV_KEYBOARD = ReplyKeyboardMarkup(
    [["🔄 Reiniciar"]],
    resize_keyboard=True,
    one_time_keyboard=False
)

NAV_TRIGGERS = {"◀️ Menú", "🔄 Reiniciar", "/menu", "/cancel"}


# ─────────────────────────────────────────────
# MAIN MENU
# ─────────────────────────────────────────────

async def show_main_menu(update_or_query, context: ContextTypes.DEFAULT_TYPE, text: str = None) -> int:
    """Displays the main menu with inline buttons."""
    if text is None:
        user_id = context.user_data.get("user_id")
        plan = context.user_data.get("plan", "platino")
        count = db.get_appointment_count(user_id)
        limit = PLAN_LIMITS.get(plan, 3)
        
        text = (
            "🎯 *Menú Principal*\n\n"
            f"👤 *Plan:* {plan.capitalize()} ({count}/{limit} usuarios)\n\n"
            "Selecciona una opción:"
        )

    keyboard = [
        [InlineKeyboardButton("➕ Crear nuevo usuario", callback_data="menu_create")],
        [InlineKeyboardButton("✏️ Editar usuario", callback_data="menu_edit")],
        [InlineKeyboardButton("👁️ Ver mis usuarios", callback_data="menu_view")],
        [InlineKeyboardButton("🚪 Cerrar sesión", callback_data="menu_logout")],
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


async def nav_handler(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Handles ◀️ Menú and 🔄 Reiniciar buttons from any text state."""
    text = (update.message.text or "").strip()
    if text == "🔄 Reiniciar":
        context.user_data.clear()
        await update.message.reply_text(
            "🔄 *Sesión reiniciada.*\n\nVuelve a ingresar tu correo electrónico:",
            parse_mode='Markdown',
            reply_markup=NAV_KEYBOARD
        )
        return EMAIL
    # ◀️ Menú → volver al menú principal
    return await show_main_menu(update, context)


async def main_menu_callback(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Handles the main menu button clicks."""
    query = update.callback_query
    await query.answer()

    if query.data == "back_to_menu":
        return await show_main_menu(update, context)

    if query.data == "menu_create":
        user_id = context.user_data.get("user_id")
        plan = context.user_data.get("plan", "platino")
        count = db.get_appointment_count(user_id)
        limit = PLAN_LIMITS.get(plan, 3)

        if count >= limit:
            msg = (
                f"❌ Has alcanzado el límite de {limit} usuarios para tu plan {plan.capitalize()}.\n\n"
                "Para expandir tu cuota, por favor comunícate por WhatsApp aquí: wa.me/573027365127"
            )
            await query.message.reply_text(msg, parse_mode='Markdown', disable_web_page_preview=True)
            return MAIN_MENU

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
    
    elif query.data == "menu_logout":
        context.user_data.clear()
        await query.edit_message_text(
            "👋 Sesión cerrada exitosamente.\n\n"
            "Usa el comando /start o escribe cualquier mensaje para volver a iniciar sesión.",
            parse_mode='Markdown'
        )
        return ConversationHandler.END

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
                    f"🌎 País: `{appt.get('country', 'co').upper()}`\n"
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
                context.user_data["country"] = appt.get("country", "co")
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
        reply_markup=NAV_KEYBOARD,
        parse_mode='Markdown'
    )
    return EMAIL


async def email(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Stores the email and asks for the password."""
    context.user_data["email"] = update.message.text
    await update.message.reply_text(
        "Gracias. Ahora, por favor ingresa tu contraseña:",
        reply_markup=NAV_KEYBOARD
    )
    return PASSWORD


async def password(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Stores the password, validates against DB, shows main menu, and deletes password msg."""
    password_message = update.message
    password_text = password_message.text
    email_text = context.user_data["email"]

    # Attempt to delete the user's password message for security
    try:
        await password_message.delete()
    except Exception as e:
        logger.warning(f"Could not delete password message: {e}")

    try:
        user = db.verify_user(email_text, password_text)

        if user:
            context.user_data["user_id"] = user["id"]
            context.user_data["plan"] = user.get("plan", "platino")
            # Split comma-separated countries (e.g., 'co,mx') into a list
            countries_str = user.get("country", "co")
            context.user_data["allowed_countries"] = [c.strip() for c in countries_str.split(",") if c.strip()]
            
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


# Country → consulates with their facility IDs
COUNTRY_CONSULATES = {
    "co": [
        {"name": "Bogota", "facility_id": "25", "asc_facility_id": "26"},
    ],
    "mx": [
        {"name": "Ciudad Juarez", "facility_id": "65", "asc_facility_id": "76"},
        {"name": "Guadalajara", "facility_id": "66", "asc_facility_id": "77"},
        {"name": "Hermosillo", "facility_id": "67", "asc_facility_id": "78"},
        {"name": "Matamoros", "facility_id": "68", "asc_facility_id": "79"},
        {"name": "Merida", "facility_id": "69", "asc_facility_id": "81"},
        {"name": "Mexico City", "facility_id": "70", "asc_facility_id": "82"},
        {"name": "Monterrey", "facility_id": "71", "asc_facility_id": "83"},
        {"name": "Nogales", "facility_id": "72", "asc_facility_id": "84"},
        {"name": "Nuevo Laredo", "facility_id": "73", "asc_facility_id": "85"},
        {"name": "Tijuana", "facility_id": "74", "asc_facility_id": "88"},
    ],
}


async def appointment_password(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Stores the appointment password and either shows countries or directly consulates."""
    context.user_data["appt_password"] = update.message.text
    context.user_data["ivr"] = "Ninguno"

    countries = context.user_data.get("allowed_countries", ["co"])
    
    # If the user has multiple assigned countries, ask for selection
    if len(countries) > 1:
        keyboard = []
        for c in countries:
            c_lower = c.strip().lower()
            name = "🇨🇴 Colombia" if c_lower == "co" else ("🇲🇽 México" if c_lower == "mx" else c.upper())
            keyboard.append([InlineKeyboardButton(name, callback_data=f"country_{c_lower}")])
            
        await update.message.reply_text(
            "Contraseña guardada.\n\n"
            "🌎 *Selecciona el país para esta cita:*",
            reply_markup=InlineKeyboardMarkup(keyboard),
            parse_mode='Markdown'
        )
        return SELECT_COUNTRY

    # Single country, proceed directly
    country = countries[0].strip().lower() if countries else "co"
    context.user_data["country"] = country
    return await _show_consulates_menu(update, country)


async def select_country_callback(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Handles country selection when a user is assigned multiple countries."""
    query = update.callback_query
    await query.answer()
    
    country = query.data.replace("country_", "")
    context.user_data["country"] = country
    
    return await _show_consulates_menu(update, country, is_callback=True)


async def _show_consulates_menu(update: Update, country: str, is_callback: bool = False) -> int:
    """Helper to display the consulate options for a selected country."""
    consulates = COUNTRY_CONSULATES.get(country)

    if consulates:
        # Known country → show inline buttons
        keyboard = []
        for c in consulates:
            keyboard.append([InlineKeyboardButton(f"🏛️ {c['name']}", callback_data=f"consul_{c['name']}")])

        text = "Contraseña guardada.\n\n🏛️ *Selecciona el Consulado:*" if not is_callback else "🏛️ *Selecciona el Consulado:*"
        
        reply_markup = InlineKeyboardMarkup(keyboard)
        if is_callback:
            await update.callback_query.edit_message_text(text, reply_markup=reply_markup, parse_mode='Markdown')
        else:
            await update.message.reply_text(text, reply_markup=reply_markup, parse_mode='Markdown')
    else:
        # Unknown country → text input
        text = "Por favor ingresa el Consulado (Normal) donde buscas cita:"
        if not is_callback:
            text = "Contraseña de citas guardada.\n\n" + text
        
        if is_callback:
            await update.callback_query.edit_message_text(text)
        else:
            await update.message.reply_text(text)

    return CONSULATE


async def consulate_callback(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Handles consulate button selection for known countries."""
    query = update.callback_query
    await query.answer()

    consulate_name = query.data.replace("consul_", "")
    context.user_data["consulate"] = consulate_name

    # Auto-lookup facility IDs from the mapping
    country = context.user_data.get("country", "").lower()
    consulates = COUNTRY_CONSULATES.get(country, [])
    selected = next((c for c in consulates if c["name"] == consulate_name), None)

    if selected and selected.get("asc_facility_id"):
        # Has CAS → ask if needed
        keyboard = [
            [InlineKeyboardButton("✅ Sí, necesito CAS", callback_data="cas_yes"),
             InlineKeyboardButton("❌ No necesito CAS", callback_data="cas_no")]
        ]
        await query.edit_message_text(
            f"🏛️ Consulado: *{consulate_name}*\n\n"
            "🏢 *¿Necesitas cita en el Consulado ASC (CAS)?*",
            reply_markup=InlineKeyboardMarkup(keyboard),
            parse_mode='Markdown'
        )
        return NEED_CAS
    else:
        # No CAS available → skip
        context.user_data["need_cas"] = False
        context.user_data["consulate_asc"] = "Ninguno"
        await query.edit_message_text(
            f"🏛️ Consulado: *{consulate_name}*\n\n"
            "Ahora ingresa la *FECHA MÍNIMA* en formato YYYY-MM-DD (ej. 2026-01-01):",
            parse_mode='Markdown'
        )
        return MIN_DATE


async def consulate(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Handles consulate text input (for unknown countries)."""
    context.user_data["consulate"] = update.message.text

    keyboard = [
        [InlineKeyboardButton("✅ Sí, necesito CAS", callback_data="cas_yes"),
         InlineKeyboardButton("❌ No necesito CAS", callback_data="cas_no")]
    ]

    await update.message.reply_text(
        "🏢 *¿Necesitas cita en el Consulado ASC (CAS)?*",
        reply_markup=InlineKeyboardMarkup(keyboard),
        parse_mode='Markdown'
    )
    return NEED_CAS


async def need_cas_callback(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Handles CAS choice: if yes shows CAS consulate options, if no skips to dates."""
    query = update.callback_query
    await query.answer()

    if query.data == "cas_yes":
        context.user_data["need_cas"] = True

        # Check if country has known CAS consulates
        country = context.user_data.get("country", "").lower()
        consulates = COUNTRY_CONSULATES.get(country)

        if consulates:
            # Show CAS consulate buttons
            keyboard = []
            for c in consulates:
                if c.get("asc_facility_id"):
                    keyboard.append([InlineKeyboardButton(
                        f"🏢 {c['name']} (CAS)", callback_data=f"cas_consul_{c['name']}"
                    )])

            if keyboard:
                await query.edit_message_text(
                    "🏢 *Selecciona el Consulado ASC (CAS):*",
                    reply_markup=InlineKeyboardMarkup(keyboard),
                    parse_mode='Markdown'
                )
                return CONSULATE_ASC

        # Unknown country → text input
        await query.edit_message_text(
            "Entendido. Ahora ingresa el *Consulado ASC (CAS)*:",
            parse_mode='Markdown'
        )
        return CONSULATE_ASC
    else:
        context.user_data["need_cas"] = False
        context.user_data["consulate_asc"] = "Ninguno"
        await query.edit_message_text(
            "Entendido, sin cita CAS.\n\n"
            "Ahora necesito las fechas para la cita CONSULAR (Normal).\n"
            "Por favor ingresa la *FECHA MÍNIMA* (desde cuando puedes asistir) en formato YYYY-MM-DD (ej. 2026-01-01):",
            parse_mode='Markdown'
        )
        return MIN_DATE


async def consulate_asc_callback(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Handles CAS consulate button selection."""
    query = update.callback_query
    await query.answer()

    consulate_name = query.data.replace("cas_consul_", "")
    context.user_data["consulate_asc"] = consulate_name

    await query.edit_message_text(
        f"🏢 CAS: *{consulate_name}*\n\n"
        "Ahora ingresa la *FECHA MÍNIMA* en formato YYYY-MM-DD (ej. 2026-01-01):",
        parse_mode='Markdown'
    )
    return MIN_DATE


async def consulate_asc(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Stores the ASC consulate (text input) and asks for the minimum date."""
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
    """Stores the maximum date, deploys to VPS, and runs schedule ID discovery."""
    date_text = update.message.text
    if not validate_date(date_text):
        await update.message.reply_text("Formato de fecha inválido. Por favor usa YYYY-MM-DD (ej. 2026-01-01):")
        return MAX_DATE

    context.user_data["max_consulate_date"] = date_text

    # Auto-assign ASC dates to match Consulate dates
    context.user_data["min_asc_date"] = context.user_data["min_consulate_date"]
    context.user_data["max_asc_date"] = context.user_data["max_consulate_date"]

    # Save to database
    user_data = context.user_data
    telegram_user_id = update.effective_user.id
    user_id = user_data.get("user_id")

    # Capture Telegram chat_id for VPS notifications
    user_data["telegram_chat_id"] = str(update.effective_chat.id)

    try:
        if user_data.get("is_editing") and "appointment_id" in user_data:
            action_text = db.update_appointment(telegram_user_id, user_data["appointment_id"], user_data)
        else:
            action_text = db.save_appointment(telegram_user_id, user_id, user_data)

        await update.message.reply_text(
            f"✅ Información {action_text} exitosamente en la base de datos!\n\n"
            "⏳ Desplegando archivos en el servidor..."
        )

        # Phase 1: Deploy files and create venv (without PM2)
        vps_success = vps.create_vps_config(user_data)
        if not vps_success:
            await update.message.reply_text(
                "⚠️ Error al desplegar archivos en el servidor.\n"
                "Los datos se guardaron en la base de datos."
            )
            return await show_main_menu(update, context, text="🎯 *Menú Principal*\n\nSelecciona una opción:")

        appt_email = user_data["appt_email"]
        ivr_value = user_data.get("ivr", "").strip()

        # If IVR is a valid number → use it as SCHEDULE_ID directly, skip discovery
        if ivr_value and ivr_value.lower() != "ninguno" and ivr_value.isdigit():
            await update.message.reply_text(
                f"📂 Archivos desplegados.\n\n"
                f"🆔 Usando IVR como SCHEDULE\\_ID: `{ivr_value}`\n"
                "🚀 Iniciando script en el servidor...",
                parse_mode='Markdown'
            )
            success = vps.set_schedule_id_and_start(appt_email, ivr_value)
            if success:
                return await show_main_menu(
                    update, context,
                    text=(
                        f"✅ *Script iniciado correctamente!*\n\n"
                        f"🆔 SCHEDULE\\_ID: `{ivr_value}`\n"
                        f"📧 Email: `{appt_email}`\n\n"
                        "🎯 *Menú Principal*\n\nSelecciona una opción:"
                    )
                )
            else:
                return await show_main_menu(
                    update, context,
                    text="⚠️ Hubo un problema iniciando el script.\n\n🎯 *Menú Principal*\n\nSelecciona una opción:"
                )

        # No IVR → run discovery to find Schedule IDs
        await update.message.reply_text(
            "📂 Archivos desplegados en el servidor.\n\n"
            "🔍 Buscando Schedule IDs... esto puede tomar un momento."
        )

        schedule_ids, error_detail = vps.discover_schedule_ids(appt_email)

        if not schedule_ids:
            error_msg = "⚠️ No se pudieron descubrir los Schedule IDs automáticamente."
            if error_detail:
                error_msg += f"\n\n📋 Detalle:\n{error_detail[:500]}"
            error_msg += (
                "\n\n✏️ Puedes ingresar el *SCHEDULE\\_ID* manualmente.\n"
                "Escribe el número de Schedule ID:"
            )
            await update.message.reply_text(error_msg, parse_mode='Markdown')
            return MANUAL_SCHEDULE_ID

        # Store for callback and present as buttons
        context.user_data["discovered_schedule_ids"] = schedule_ids

        keyboard = []
        for sid, description in schedule_ids.items():
            label = f"🆔 {sid} — {description[:50]}"
            keyboard.append([InlineKeyboardButton(label, callback_data=f"schedule_{sid}")])

        keyboard.append([InlineKeyboardButton("◀️ Cancelar", callback_data="schedule_cancel")])

        await update.message.reply_text(
            "🔎 *Schedule IDs encontrados:*\n\n"
            "Selecciona el que deseas usar:",
            reply_markup=InlineKeyboardMarkup(keyboard),
            parse_mode='Markdown'
        )
        return SCHEDULE_SELECT

    except mysql.connector.Error as err:
        logger.error(f"Error: {err}")
        await update.message.reply_text(f"Hubo un error al guardar en la base de datos: {err}")
    except Exception as e:
        logger.error(f"Error: {e}")
        await update.message.reply_text(f"Ocurrió un error inesperado: {e}")

    return await show_main_menu(update, context, text="🎯 *Menú Principal*\n\nSelecciona una opción:")


async def schedule_select_callback(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Handles schedule ID selection. Updates config on VPS and starts PM2."""
    query = update.callback_query
    await query.answer()

    if query.data == "schedule_cancel":
        return await show_main_menu(
            update, context,
            text="❌ Selección cancelada.\n\n🎯 *Menú Principal*\n\nSelecciona una opción:"
        )

    # Extract schedule_id from callback data: "schedule_73159045"
    schedule_id = query.data.replace("schedule_", "")
    appt_email = context.user_data.get("appt_email", "")
    schedule_ids = context.user_data.get("discovered_schedule_ids", {})
    description = schedule_ids.get(schedule_id, "")

    await query.edit_message_text(
        f"⏳ Configurando SCHEDULE\\_ID=`{schedule_id}`\n"
        f"📝 {description}\n\n"
        "Iniciando el script en el servidor...",
        parse_mode='Markdown'
    )

    # Phase 3: Update config with selected SCHEDULE_ID and start PM2
    success = vps.set_schedule_id_and_start(appt_email, schedule_id)

    if success:
        return await show_main_menu(
            update, context,
            text=(
                f"✅ *Script iniciado correctamente!*\n\n"
                f"🆔 SCHEDULE\\_ID: `{schedule_id}`\n"
                f"📧 Email: `{appt_email}`\n\n"
                "🎯 *Menú Principal*\n\nSelecciona una opción:"
            )
        )
    else:
        return await show_main_menu(
            update, context,
            text=(
                "⚠️ Hubo un problema iniciando el script en el servidor.\n\n"
                "🎯 *Menú Principal*\n\nSelecciona una opción:"
            )
        )


async def manual_schedule_id(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Handles manual SCHEDULE_ID entry when discovery fails."""
    schedule_id = update.message.text.strip()
    appt_email = context.user_data.get("appt_email", "")

    if not schedule_id.isdigit():
        await update.message.reply_text(
            "❌ El SCHEDULE\\_ID debe ser un número. Inténtalo de nuevo:",
            parse_mode='Markdown'
        )
        return MANUAL_SCHEDULE_ID

    await update.message.reply_text(
        f"⏳ Configurando SCHEDULE\\_ID=`{schedule_id}`\n"
        "🚀 Iniciando script en el servidor...",
        parse_mode='Markdown'
    )

    success = vps.set_schedule_id_and_start(appt_email, schedule_id)

    if success:
        return await show_main_menu(
            update, context,
            text=(
                f"✅ *Script iniciado correctamente!*\n\n"
                f"🆔 SCHEDULE\\_ID: `{schedule_id}`\n"
                f"📧 Email: `{appt_email}`\n\n"
                "🎯 *Menú Principal*\n\nSelecciona una opción:"
            )
        )
    else:
        return await show_main_menu(
            update, context,
            text="⚠️ Hubo un problema iniciando el script.\n\n🎯 *Menú Principal*\n\nSelecciona una opción:"
        )


async def cancel(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Cancels and ends the conversation."""
    await update.message.reply_text(
        "Operación cancelada.", reply_markup=ReplyKeyboardRemove()
    )
    return ConversationHandler.END
