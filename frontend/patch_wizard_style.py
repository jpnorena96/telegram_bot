with open('src/components/ds160/DS160Wizard.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("currentStep === 7 ? '#ccc'", "currentStep === 8 ? '#ccc'")
content = content.replace("currentStep === 7 ? 'not-allowed'", "currentStep === 8 ? 'not-allowed'")

with open('src/components/ds160/DS160Wizard.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed step 8 styling in DS160Wizard.jsx")
