import sys

with open('src/components/ds160/DS160Wizard.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("import FamilyInformation from './FamilyInformation';", "import FamilyInformation from './FamilyInformation';\nimport WorkEducationInformation from './WorkEducationInformation';")
content = content.replace("{currentStep === 8 && <FamilyInformation data={formData} updateData={updateData} />}", "{currentStep === 8 && <FamilyInformation data={formData} updateData={updateData} />}\n          {currentStep === 9 && <WorkEducationInformation data={formData} updateData={updateData} />}")
content = content.replace("disabled={currentStep === 8}", "disabled={currentStep === 9}")
content = content.replace("currentStep === 8 ?", "currentStep === 9 ?")

with open('src/components/ds160/DS160Wizard.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated DS160Wizard")
