import sys

with open('src/components/ds160/DS160Wizard.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("import SecurityBackground5 from './SecurityBackground5';", "import SecurityBackground5 from './SecurityBackground5';\nimport PhotoUpload from './PhotoUpload';")
content = content.replace("{currentStep === 16 && <SecurityBackground5 data={formData} updateData={updateData} />}", "{currentStep === 16 && <SecurityBackground5 data={formData} updateData={updateData} />}\n          {currentStep === 17 && <PhotoUpload data={formData} updateData={updateData} />}")
content = content.replace("disabled={currentStep === 16}", "disabled={currentStep === 17}")
content = content.replace("currentStep === 16 ?", "currentStep === 17 ?")

with open('src/components/ds160/DS160Wizard.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated DS160Wizard")
