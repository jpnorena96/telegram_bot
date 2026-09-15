import sys
import json

with open('datos.json', 'r', encoding='utf-8') as f:
    datos = json.load(f)

if 'photoPath' not in datos:
    datos['photoPath'] = 'foto_ejemplo.jpg'

with open('datos.json', 'w', encoding='utf-8') as f:
    json.dump(datos, f, indent=2)

print("Updated datos.json")
