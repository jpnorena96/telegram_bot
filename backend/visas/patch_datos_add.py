import sys
import json

with open('datos.json', 'r', encoding='utf-8') as f:
    datos = json.load(f)

new_data = {
    "clanTribe": "N",
    "countriesVisited": "N",
    "organizations": "N",
    "specializedSkills": "N",
    "militaryService": "N",
    "insurgentOrg": "N"
}
datos.update(new_data)

with open('datos.json', 'w', encoding='utf-8') as f:
    json.dump(datos, f, indent=2)

print("Updated datos.json")
