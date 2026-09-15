import sys

with open('src/components/ds160/DS160Wizard.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("import PreviousWorkEducation from './PreviousWorkEducation';", "import PreviousWorkEducation from './PreviousWorkEducation';\nimport AdditionalWorkEducation from './AdditionalWorkEducation';")
content = content.replace("{currentStep === 10 && <PreviousWorkEducation data={formData} updateData={updateData} />}", "{currentStep === 10 && <PreviousWorkEducation data={formData} updateData={updateData} />}\n          {currentStep === 11 && <AdditionalWorkEducation data={formData} updateData={updateData} />}")
content = content.replace("disabled={currentStep === 10}", "disabled={currentStep === 11}")
content = content.replace("currentStep === 10 ?", "currentStep === 11 ?")

with open('src/components/ds160/DS160Wizard.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated DS160Wizard")
