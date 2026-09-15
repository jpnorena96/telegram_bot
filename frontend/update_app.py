import io

with open('src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add import
import_str = "import DS160PrintView from './pages/dashboard/DS160PrintView';\n"
content = content.replace("import DS160FormPage from './pages/dashboard/DS160FormPage';", "import DS160FormPage from './pages/dashboard/DS160FormPage';\n" + import_str)

# Add route
route_str = "        <Route path=\"/ds160/print/:id\" element={<DS160PrintView />} />\n"
content = content.replace("        <Route path=\"/client-portal/:id\" element={<ClientPortalPage />} />", "        <Route path=\"/client-portal/:id\" element={<ClientPortalPage />} />\n" + route_str)

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated App.jsx")
