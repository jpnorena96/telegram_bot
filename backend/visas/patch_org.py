with open('playwright_test.py', 'r', encoding='utf-8') as f:
    content = f.read()

import re

old_org = re.compile(r"elif who_pays in \['P', 'U', 'C', 'H'\]:")
new_org = "elif who_pays in ['C', 'H']:"
content = old_org.sub(new_org, content)

with open('playwright_test.py', 'w', encoding='utf-8') as f:
    f.write(content)
print('Patched org fields successfully')
