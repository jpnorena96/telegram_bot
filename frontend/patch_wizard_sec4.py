import sys

with open('src/components/ds160/DS160Wizard.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("import SecurityBackground3 from './SecurityBackground3';", "import SecurityBackground3 from './SecurityBackground3';\nimport SecurityBackground4 from './SecurityBackground4';")
content = content.replace("{currentStep === 14 && <SecurityBackground3 data={formData} updateData={updateData} />}", "{currentStep === 14 && <SecurityBackground3 data={formData} updateData={updateData} />}\n          {currentStep === 15 && <SecurityBackground4 data={formData} updateData={updateData} />}")
content = content.replace("disabled={currentStep === 14}", "disabled={currentStep === 15}")
content = content.replace("currentStep === 14 ?", "currentStep === 15 ?")

with open('src/components/ds160/DS160Wizard.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated DS160Wizard")
