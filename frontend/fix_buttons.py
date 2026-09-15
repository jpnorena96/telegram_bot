import io
import re

with open('src/pages/dashboard/VisaProcessesPage.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Normalize line endings
content = content.replace('\r\n', '\n')

old_buttons = """                          {/* BOTA"N VER EXPEDIENTE */}
                          <button 
                            onClick={() => navigate(/dashboard/visa-processes/)} 
                            className="btn btn-sm btn-primary" 
                            style={{ background: 'var(--lime)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }} 
                            title="Ver DiagnA3stico IA y Datos"
                          >
                            <Eye size={13} /> Ver Expediente
                          </button>"""

new_buttons = """                          {/* BOTA"N VER FORMULARIO */}
                          <button 
                            onClick={() => navigate(/ds160)} 
                            className="btn btn-sm btn-outline" 
                            style={{ borderColor: '#2563EB', color: '#2563EB', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', fontWeight: 600 }} 
                            title="Llenar Formulario DS-160"
                          >
                            <FileText size={13} /> DS-160
                          </button>

                          {/* BOTA"N IMPRIMIR PDF */}
                          <button 
                            onClick={() => window.open(/ds160/print/, '_blank')} 
                            className="btn btn-sm btn-outline" 
                            style={{ borderColor: '#6B7280', color: '#374151', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', fontWeight: 600 }} 
                            title="Exportar PDF Replica"
                          >
                            <Printer size={13} /> PDF
                          </button>

                          {/* BOTA"N VER EXPEDIENTE */}
                          <button 
                            onClick={() => navigate(/dashboard/visa-processes/)} 
                            className="btn btn-sm btn-primary" 
                            style={{ background: 'var(--lime)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }} 
                            title="Ver DiagnA3stico IA y Datos"
                          >
                            <Eye size={13} /> Ver Expediente
                          </button>"""

# Using regex to ignore formatting differences
import re
match = re.search(r'\{\/\* BOTA"N VER EXPEDIENTE \*\/}.*?Ver Expediente\s*</button>', content, re.DOTALL)

if match:
    content = content[:match.start()] + new_buttons + content[match.end():]
    with open('src/pages/dashboard/VisaProcessesPage.jsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Success: Replaced buttons using regex.")
else:
    print("Error: Could not find the target string with regex.")
