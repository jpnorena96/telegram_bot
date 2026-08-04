import os
import sys
import asyncio

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.whatsapp_service import notify_appointment_scheduled

async def test_notification():
    # Puedes probar poniendo tu numero aqui con el codigo de pais, ej: 573001234567
    test_number = input("Ingresa el numero de WhatsApp de prueba (con codigo de pais, ej. 573100000000): ")
    test_name = "Usuario de Prueba"
    test_date = "15 de Diciembre 2024, 10:00 AM"
    
    print(f"\nEnviando notificacion de prueba a {test_number}...")
    result = await notify_appointment_scheduled(test_number, test_name, test_date)
    
    if result:
        print("\n¡Exito! La notificacion se envio correctamente por la Evolution API.")
    else:
        print("\nFallo el envio de la notificacion. Revisa los logs.")

if __name__ == "__main__":
    asyncio.run(test_notification())
