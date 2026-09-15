import io

with open('src/pages/dashboard/DS160PrintView.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix imports
content = content.replace("'../components/ds160/", "'../../components/ds160/")

with open('src/pages/dashboard/DS160PrintView.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixed import paths")
