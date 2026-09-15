import io

with open('src/pages/dashboard/VisaProcessesPage.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the navigation path for the DS-160 form
content = content.replace("navigate(`/ds160`)", "navigate(`/dashboard/ds160`)")

with open('src/pages/dashboard/VisaProcessesPage.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixed navigation route to /dashboard/ds160")
