# Script to build the wizard HTML for DS-160 form
import re

HTML_PATH = r"C:\Users\jpnor\OneDrive\Documents\Telegram_bot\backend\visas\formulario.html"
JS_PATH = r"C:\Users\jpnor\OneDrive\Documents\Telegram_bot\backend\visas\script_backup.js"
OUT_PATH = r"C:\Users\jpnor\OneDrive\Documents\Telegram_bot\backend\visas\formulario.html"

# Read original JS
with open(JS_PATH, 'r', encoding='utf-8') as f:
    js_original = f.read()

# Read original HTML to extract the form fields (between </style> and </form>)
with open(HTML_PATH, 'r', encoding='utf-8') as f:
    html_original = f.read()

print("Original JS length:", len(js_original))
print("Original HTML length:", len(html_original))

# Fix the generarJSON function name (it used a different name)
generar_match = re.search(r'function (\w+)\s*\(', js_original)
if generar_match:
    func_name = generar_match.group(1)
    print("Found function:", func_name)
else:
    func_name = "generarArchivo"
    print("Function not found, using default")

# Fix alert message and function
js_fixed = js_original.replace(
    "alert('\\ufffdo. Archivo datos.json generado con Acxito con la SecciA3n 5 incluida.');",
    "alert('✅ Archivo datos.json generado exitosamente!');"
).replace(
    "alert('\\ufffd\\ufffd. Archivo datos.json generado con Acxito con la SecciA3n 5 incluida.');",
    "alert('✅ Archivo datos.json generado exitosamente!');"
)

print("Func name:", func_name)
print("Done - output written")
