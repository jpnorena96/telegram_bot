with open('playwright_test.py', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# keep all lines up to '-> Family completado.'
new_lines = []
for line in lines:
    new_lines.append(line)
    if '-> Family completado.' in line:
        break

new_lines.append('\nif __name__ == \"__main__\":\n')
new_lines.append('    asyncio.run(run())\n')

with open('playwright_test.py', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
print('Fixed syntax error')
