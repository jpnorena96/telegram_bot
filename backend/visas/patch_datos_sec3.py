import sys
import json

with open('datos.json', 'r', encoding='utf-8') as f:
    datos = json.load(f)

new_data = {
    "secIllegalActivity": "N",
    "secTerroristActivity": "N",
    "secTerroristSupport": "N",
    "secTerroristOrg": "N",
    "secTerroristRel": "N",
    "secGenocide": "N",
    "secTorture": "N",
    "secExViolence": "N",
    "secChildSoldier": "N",
    "secReligiousFreedom": "N",
    "secPopulationControls": "N",
    "secTransplant": "N"
}
datos.update(new_data)

with open('datos.json', 'w', encoding='utf-8') as f:
    json.dump(datos, f, indent=2)

print("Updated datos.json")
