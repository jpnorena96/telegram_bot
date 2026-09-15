import sys

with open('src/components/ds160/DS160Wizard.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("import SecurityBackground4 from './SecurityBackground4';", "import SecurityBackground4 from './SecurityBackground4';\nimport SecurityBackground5 from './SecurityBackground5';")
content = content.replace("{currentStep === 15 && <SecurityBackground4 data={formData} updateData={updateData} />}", "{currentStep === 15 && <SecurityBackground4 data={formData} updateData={updateData} />}\n          {currentStep === 16 && <SecurityBackground5 data={formData} updateData={updateData} />}")
content = content.replace("disabled={currentStep === 15}", "disabled={currentStep === 16}")
content = content.replace("currentStep === 15 ?", "currentStep === 16 ?")

with open('src/components/ds160/DS160Wizard.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated DS160Wizard")
