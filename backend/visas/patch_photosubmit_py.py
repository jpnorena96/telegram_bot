with open('playwright_test.py', 'r', encoding='utf-8') as f:
    content = f.read()

old_end_block = """        print("-> Llegamos al sistema de subir foto")

        print("-> Esperando 2 minutos antes de cerrar el navegador...")
        await page.wait_for_timeout(120000)"""

new_end_block = """        print("-> Llegamos al sistema de subir foto")

        # ========== 35. PHOTO UPLOAD (SUBMIT) ==========
        print("-> Seleccionando archivo de foto...")
        await page.wait_for_selector('#ctl00_cphMain_imageFileUpload', state='visible', timeout=15000)
        
        photo_path = datos.get('photoPath', '')
        if photo_path:
            import os
            # Resolve to absolute path to avoid issues
            abs_photo_path = os.path.abspath(photo_path)
            if os.path.exists(abs_photo_path):
                print(f"-> Subiendo foto desde: {abs_photo_path}")
                await page.set_input_files('#ctl00_cphMain_imageFileUpload', abs_photo_path)
            else:
                print(f"-> [ADVERTENCIA] La foto {abs_photo_path} no existe. Crea el archivo si quieres pasar de aqui.")
        else:
            print("-> [ADVERTENCIA] No hay photoPath en datos.json")

        print("-> Click en Upload Selected Photo...")
        async with page.expect_navigation(wait_until='networkidle', timeout=30000):
            # The submit button acts as a form submit, sometimes it takes a while to upload
            await page.evaluate("document.getElementById('ctl00_cphButtons_btnUpload').click()")
        print("-> Foto enviada a validacion")

        print("-> Esperando 2 minutos antes de cerrar el navegador...")
        await page.wait_for_timeout(120000)"""

content = content.replace(old_end_block, new_end_block)

with open('playwright_test.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated script with PHOTO UPLOAD block")
