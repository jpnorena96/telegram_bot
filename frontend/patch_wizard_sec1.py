import sys

with open('src/components/ds160/DS160Wizard.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("import AdditionalWorkEducation from './AdditionalWorkEducation';", "import AdditionalWorkEducation from './AdditionalWorkEducation';\nimport SecurityBackground1 from './SecurityBackground1';")
content = content.replace("{currentStep === 11 && <AdditionalWorkEducation data={formData} updateData={updateData} />}", "{currentStep === 11 && <AdditionalWorkEducation data={formData} updateData={updateData} />}\n          {currentStep === 12 && <SecurityBackground1 data={formData} updateData={updateData} />}")
content = content.replace("disabled={currentStep === 11}", "disabled={currentStep === 12}")
content = content.replace("currentStep === 11 ?", "currentStep === 12 ?")

with open('src/components/ds160/DS160Wizard.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated DS160Wizard")
