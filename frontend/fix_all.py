import io

with open('src/pages/dashboard/VisaProcessesPage.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the invalid escape characters in window.open
content = content.replace(r"\'_blank\'", "'_blank'")

# Fix the navigate URL for 'Ver Expediente' which also lost its backticks and ${p.id}
content = content.replace("navigate(/dashboard/visa-processes/)", "navigate(`/dashboard/visa-processes/${p.id}`)")

with open('src/pages/dashboard/VisaProcessesPage.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("All backticks and escape characters fixed.")
