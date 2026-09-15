import io

with open('src/pages/dashboard/DS160PrintView.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

bad_style = """      <style dangerouslySetInnerHTML={{__html: 
        @media print {
          body { background: white !important; -webkit-print-color-adjust: exact; }
          .no-print { display: none !important; }
          .ds160-container { box-shadow: none !important; margin: 0 !important; width: 100% !important; max-width: none !important; }
          button { display: none !important; }
        }
      }} />"""

good_style = """      <style dangerouslySetInnerHTML={{__html: 
        @media print {
          body { background: white !important; -webkit-print-color-adjust: exact; }
          .no-print { display: none !important; }
          .ds160-container { box-shadow: none !important; margin: 0 !important; width: 100% !important; max-width: none !important; }
          button { display: none !important; }
        }
      }} />"""

content = content.replace(bad_style, good_style)

with open('src/pages/dashboard/DS160PrintView.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixed backticks in DS160PrintView.jsx")
