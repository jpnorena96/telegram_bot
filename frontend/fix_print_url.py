import io
import re

with open('src/pages/dashboard/VisaProcessesPage.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the broken URL which was parsed out as /ds160/print/ by powershell variables
content = re.sub(r'window\.open\(/ds160/print/.*?,\s*\'_blank\'\)', r'window.open(`/ds160/print/${p.id}`, \'_blank\')', content)

with open('src/pages/dashboard/VisaProcessesPage.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixed backticks and variable interpolation in VisaProcessesPage.jsx")
