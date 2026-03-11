import logging
from telegram import Update
from telegram.ext import (
    Application, CommandHandler,
    ConversationHandler, MessageHandler, CallbackQueryHandler, filters
)

from config import TOKEN
from bot.states import *
from bot.handlers import (
    start, email, password, main_menu_callback,
    appointment_email, edit_or_new_appointment, appointment_password,
    consulate, consulate_callback, need_cas_callback,
    consulate_asc, consulate_asc_callback, min_date, max_date,
    select_appointment_callback, confirm_delete_callback, schedule_select_callback,
    manual_schedule_id, cancel
)

# Enable logging
logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s", level=logging.INFO
)
logging.getLogger("httpx").setLevel(logging.WARNING)


def main() -> None:
    """Run the bot."""
    application = Application.builder().token(TOKEN).build()

    conv_handler = ConversationHandler(
        entry_points=[CommandHandler("start", start)],
        states={
            EMAIL: [MessageHandler(filters.TEXT & ~filters.COMMAND, email)],
            PASSWORD: [MessageHandler(filters.TEXT & ~filters.COMMAND, password)],
            MAIN_MENU: [CallbackQueryHandler(main_menu_callback)],
            APPOINTMENT_EMAIL: [MessageHandler(filters.TEXT & ~filters.COMMAND, appointment_email)],
            EDIT_OR_NEW_APPOINTMENT: [CallbackQueryHandler(edit_or_new_appointment)],
            APPOINTMENT_PASSWORD: [MessageHandler(filters.TEXT & ~filters.COMMAND, appointment_password)],
            CONSULATE: [
                CallbackQueryHandler(consulate_callback),
                MessageHandler(filters.TEXT & ~filters.COMMAND, consulate),
            ],
            NEED_CAS: [CallbackQueryHandler(need_cas_callback)],
            CONSULATE_ASC: [
                CallbackQueryHandler(consulate_asc_callback),
                MessageHandler(filters.TEXT & ~filters.COMMAND, consulate_asc),
            ],
            MIN_DATE: [MessageHandler(filters.TEXT & ~filters.COMMAND, min_date)],
            MAX_DATE: [MessageHandler(filters.TEXT & ~filters.COMMAND, max_date)],
            SELECT_APPOINTMENT: [CallbackQueryHandler(select_appointment_callback)],
            CONFIRM_DELETE: [CallbackQueryHandler(confirm_delete_callback)],
            SCHEDULE_SELECT: [CallbackQueryHandler(schedule_select_callback)],
            MANUAL_SCHEDULE_ID: [MessageHandler(filters.TEXT & ~filters.COMMAND, manual_schedule_id)],
        },
        fallbacks=[CommandHandler("cancel", cancel)],
    )

    application.add_handler(conv_handler)
    application.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    main()
