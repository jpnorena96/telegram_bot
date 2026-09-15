with open('playwright_test.py', 'r', encoding='utf-8') as f:
    content = f.read()

helpers = '''
async def safe_fill(page, selector, value):
    try:
        if value:
            await page.fill(selector, str(value))
    except Exception as e:
        print(f"Warning: Could not fill {selector} - {e}")

async def safe_select(page, selector, value):
    try:
        if value:
            await page.select_option(selector, str(value))
    except Exception as e:
        print(f"Warning: Could not select {selector} - {e}")

async def safe_check(page, selector):
    try:
        await page.check(selector)
    except Exception as e:
        print(f"Warning: Could not check {selector} - {e}")

async def run():'''

content = content.replace("async def run():", helpers)

with open('playwright_test.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("Added safe helpers")
