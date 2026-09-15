import io

with open('src/pages/dashboard/DS160PrintView.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove the whole <style> block from JSX
import re
content = re.sub(r'<style dangerouslySetInnerHTML=.*?/>', '', content, flags=re.DOTALL)

with open('src/pages/dashboard/DS160PrintView.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Removed style block from JSX")

# Now add the print styles to ds160.css
css_append = """
@media print {
  body { background: white !important; -webkit-print-color-adjust: exact; }
  .no-print { display: none !important; }
  .ds160-container { box-shadow: none !important; margin: 0 !important; width: 100% !important; max-width: none !important; }
  button { display: none !important; }
}
"""

with open('src/components/ds160/ds160.css', 'a', encoding='utf-8') as f:
    f.write(css_append)
print("Appended print styles to ds160.css")

