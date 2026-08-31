import os

files_to_fix = [
    ".env",
    "script.py",
    "fix_tokens.py",
    "backend/vps.py",
    "backend/telegram_service.py",
    "backend/visas/script_form_160_drission.py"
]

OLD_INCORRECT = "8451235369:AAFeoGdbIHfRyxAyaBgnV300V91zs-CbtMo"
NEW_CORRECT = "8451235369:AAFeoGdbIHfRyxAyaBgnV3O0V91zs-CbtMo"

base_path = r"c:\Users\jpnor\OneDrive\Documents\Telegram_bot"

for rel_path in files_to_fix:
    full_path = os.path.join(base_path, rel_path)
    if os.path.exists(full_path):
        with open(full_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        if OLD_INCORRECT in content:
            new_content = content.replace(OLD_INCORRECT, NEW_CORRECT)
            with open(full_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Replaced in {rel_path}")
        else:
            print(f"Not found in {rel_path}")
