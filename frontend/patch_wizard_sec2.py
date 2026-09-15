import sys

with open('src/components/ds160/DS160Wizard.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("import SecurityBackground1 from './SecurityBackground1';", "import SecurityBackground1 from './SecurityBackground1';\nimport SecurityBackground2 from './SecurityBackground2';")
content = content.replace("{currentStep === 12 && <SecurityBackground1 data={formData} updateData={updateData} />}", "{currentStep === 12 && <SecurityBackground1 data={formData} updateData={updateData} />}\n          {currentStep === 13 && <SecurityBackground2 data={formData} updateData={updateData} />}")
content = content.replace("disabled={currentStep === 12}", "disabled={currentStep === 13}")
content = content.replace("currentStep === 12 ?", "currentStep === 13 ?")

with open('src/components/ds160/DS160Wizard.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated DS160Wizard")
