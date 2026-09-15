import sys

with open('src/components/ds160/DS160Wizard.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("import PhotoUpload from './PhotoUpload';", "import PhotoUpload from './PhotoUpload';\nimport PhotoUploadSubmit from './PhotoUploadSubmit';")
content = content.replace("{currentStep === 17 && <PhotoUpload data={formData} updateData={updateData} />}", "{currentStep === 17 && <PhotoUpload data={formData} updateData={updateData} />}\n          {currentStep === 18 && <PhotoUploadSubmit data={formData} updateData={updateData} />}")
content = content.replace("disabled={currentStep === 17}", "disabled={currentStep === 18}")
content = content.replace("currentStep === 17 ?", "currentStep === 18 ?")

with open('src/components/ds160/DS160Wizard.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated DS160Wizard")
