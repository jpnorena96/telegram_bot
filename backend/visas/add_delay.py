with open('playwright_test.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the end to add a 2 minute wait
old_end = "    asyncio.run(run())"
new_end = '''    # Wait for 2 minutes before closing browser so user can see it
        print("-> Esperando 2 minutos antes de cerrar...")
        await page.wait_for_timeout(120000)

if __name__ == "__main__":
    asyncio.run(run())
'''

# The current end of the file is:
# if __name__ == "__main__":
#     asyncio.run(run())
# So I'll just replace the last 2 lines.

with open('playwright_test.py', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i in range(len(lines)-1, -1, -1):
    if 'if __name__' in lines[i]:
        lines = lines[:i]
        break

lines.append('        print("-> Esperando 2 minutos antes de cerrar el navegador...")\n')
lines.append('        await page.wait_for_timeout(120000)\n\n')
lines.append('if __name__ == "__main__":\n')
lines.append('    asyncio.run(run())\n')

with open('playwright_test.py', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("Added 2 minute delay")
