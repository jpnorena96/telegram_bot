import sys

with open('src/components/ds160/DS160Wizard.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("import SecurityBackground2 from './SecurityBackground2';", "import SecurityBackground2 from './SecurityBackground2';\nimport SecurityBackground3 from './SecurityBackground3';")
content = content.replace("{currentStep === 13 && <SecurityBackground2 data={formData} updateData={updateData} />}", "{currentStep === 13 && <SecurityBackground2 data={formData} updateData={updateData} />}\n          {currentStep === 14 && <SecurityBackground3 data={formData} updateData={updateData} />}")
content = content.replace("disabled={currentStep === 13}", "disabled={currentStep === 14}")
content = content.replace("currentStep === 13 ?", "currentStep === 14 ?")

with open('src/components/ds160/DS160Wizard.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated DS160Wizard")
