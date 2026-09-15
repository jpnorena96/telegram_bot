import io

with open('src/pages/dashboard/VisaProcessesPage.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Since I just broke the navigation strings in the previous run, I need to fix them.
content = content.replace("navigate(/ds160)", "navigate(`/ds160`)")
content = content.replace("window.open(/ds160/print/${p.id}, '_blank')", "window.open(`/ds160/print/${p.id}`, '_blank')")

with open('src/pages/dashboard/VisaProcessesPage.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixed backticks in VisaProcessesPage.jsx")
