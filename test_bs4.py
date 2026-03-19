from bs4 import BeautifulSoup
import re
import json

with open("debug_page.html", "r", encoding="utf-8") as f:
    text = f.read()
    
applications = BeautifulSoup(text, 'html.parser').find_all('div', {'class': 'application'})

schedule_ids = {}
for application in applications:
    a_tag = application.find('a')
    schedule_id = re.search(r'\d+', str(a_tag))
    if schedule_id:
        schedule_id = schedule_id.group(0)
        tds = application.find_all('td')
        description = ' '.join([x.get_text() for x in filter(None, tds)][0:4])
        description = description.replace("\n", " ").strip()
        schedule_ids[schedule_id] = description
        
with open("output.json", "w", encoding="utf-8") as f:
    json.dump({"total": len(applications), "schedules": schedule_ids}, f, indent=2)
