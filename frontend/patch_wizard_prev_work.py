import sys

with open('src/components/ds160/DS160Wizard.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("import WorkEducationInformation from './WorkEducationInformation';", "import WorkEducationInformation from './WorkEducationInformation';\nimport PreviousWorkEducation from './PreviousWorkEducation';")
content = content.replace("{currentStep === 9 && <WorkEducationInformation data={formData} updateData={updateData} />}", "{currentStep === 9 && <WorkEducationInformation data={formData} updateData={updateData} />}\n          {currentStep === 10 && <PreviousWorkEducation data={formData} updateData={updateData} />}")
content = content.replace("disabled={currentStep === 9}", "disabled={currentStep === 10}")
content = content.replace("currentStep === 9 ?", "currentStep === 10 ?")

with open('src/components/ds160/DS160Wizard.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated DS160Wizard")
