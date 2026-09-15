with open('playwright_test.py', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('tbxPPT_ISSUED_DTEYear', 'tbxPPT_ISSUEDYear')
content = content.replace('tbxPPT_EXPIRE_DTEYear', 'tbxPPT_EXPIREYear')

with open('playwright_test.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("Patched Year IDs")
