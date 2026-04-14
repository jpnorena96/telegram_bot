import logging
import traceback
import html
import json
from telegram import Update
from telegram.ext import (
    Application, CommandHandler,
    ConversationHandler, MessageHandler, CallbackQueryHandler, filters,
    ContextTypes
)

from config import TOKEN
from bot.states import *
from bot.handlers import (
    start, email, password, main_menu_callback,
    appointment_email, edit_or_new_appointment, appointment_password,
    select_country_callback,
    consulate, consulate_callback, need_cas_callback,
    consulate_asc, consulate_asc_callback, min_date, max_date,
    select_appointment_callback, confirm_delete_callback, schedule_select_callback,
    manual_schedule_id, cancel, nav_handler, NAV_TRIGGERS
)

# Enable logging
logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s", level=logging.INFO
)
logging.getLogger("httpx").setLevel(logging.WARNING)

# Filter: matches the nav keyboard buttons so they're intercepted before normal handlers
NAV_FILTER = filters.Text(list(NAV_TRIGGERS))


async def error_handler(update: object, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Log the error and handle network-related exceptions gracefully."""
    logger = logging.getLogger(__name__)
    
    # Log the error with traceback
    logger.error("Exception while handling an update:", exc_info=context.error)

    # Handle common network errors silently (they are usually transient)
    from telegram.error import NetworkError, TimedOut
    if isinstance(context.error, (NetworkError, TimedOut)):
        logger.warning(f"Network-related error occurred: {context.error}. These are usually transient.")
        return

    # For other errors, we could notify the developer if a chat ID is configured,
    # but for now, we just ensure it's logged and doesn't crash the polling loop.
    if isinstance(update, Update) and update.effective_message:
        try:
            await update.effective_message.reply_text(
                "❌ Ocurrió un error inesperado al procesar tu solicitud. Por favor, intenta de nuevo más tarde."
            )
        except Exception:
            pass


def main() -> None:
    """Run the bot."""
    application = Application.builder().token(TOKEN).build()

    # Register error handler
    application.add_error_handler(error_handler)

    conv_handler = ConversationHandler(
        entry_points=[
            CommandHandler("start", start),
            CommandHandler("login", start),   # /login → igual que /start
            CommandHandler("menu", start),    # /menu  → igual que /start
            MessageHandler(filters.TEXT & ~filters.COMMAND, start),  # cualquier texto → inicia sesión
        ],
        states={
            EMAIL: [
                MessageHandler(NAV_FILTER, nav_handler),
                MessageHandler(filters.TEXT & ~filters.COMMAND, email),
            ],
            PASSWORD: [
                MessageHandler(NAV_FILTER, nav_handler),
                MessageHandler(filters.TEXT & ~filters.COMMAND, password),
            ],
            MAIN_MENU: [CallbackQueryHandler(main_menu_callback)],
            APPOINTMENT_EMAIL: [
                MessageHandler(NAV_FILTER, nav_handler),
                MessageHandler(filters.TEXT & ~filters.COMMAND, appointment_email),
            ],
            EDIT_OR_NEW_APPOINTMENT: [CallbackQueryHandler(edit_or_new_appointment)],
            APPOINTMENT_PASSWORD: [
                MessageHandler(NAV_FILTER, nav_handler),
                MessageHandler(filters.TEXT & ~filters.COMMAND, appointment_password),
            ],
            SELECT_COUNTRY: [CallbackQueryHandler(select_country_callback)],
            CONSULATE: [
                CallbackQueryHandler(consulate_callback),
                MessageHandler(NAV_FILTER, nav_handler),
                MessageHandler(filters.TEXT & ~filters.COMMAND, consulate),
            ],
            NEED_CAS: [CallbackQueryHandler(need_cas_callback)],
            CONSULATE_ASC: [
                CallbackQueryHandler(consulate_asc_callback),
                MessageHandler(NAV_FILTER, nav_handler),
                MessageHandler(filters.TEXT & ~filters.COMMAND, consulate_asc),
            ],
            MIN_DATE: [
                MessageHandler(NAV_FILTER, nav_handler),
                MessageHandler(filters.TEXT & ~filters.COMMAND, min_date),
            ],
            MAX_DATE: [
                MessageHandler(NAV_FILTER, nav_handler),
                MessageHandler(filters.TEXT & ~filters.COMMAND, max_date),
            ],
            SELECT_APPOINTMENT: [CallbackQueryHandler(select_appointment_callback)],
            CONFIRM_DELETE: [CallbackQueryHandler(confirm_delete_callback)],
            SCHEDULE_SELECT: [CallbackQueryHandler(schedule_select_callback)],
            MANUAL_SCHEDULE_ID: [
                MessageHandler(NAV_FILTER, nav_handler),
                MessageHandler(filters.TEXT & ~filters.COMMAND, manual_schedule_id),
            ],
        },
        fallbacks=[
            CommandHandler("cancel", cancel),
            CommandHandler("menu", nav_handler),
            MessageHandler(NAV_FILTER, nav_handler),
        ],
    )

    application.add_handler(conv_handler)
    application.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    main()
