import io

with open('src/pages/dashboard/VisaProcessesPage.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix import
content = content.replace(
    "} from 'lucide-react';",
    ", Printer } from 'lucide-react';"
)

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
                            style={{ borderColor: 'var(--primary)', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem' }} 
                            title="Llenar Formulario DS-160"
                          >
                            <FileText size={13} /> Formulario DS-160
                          </button>

                          {/* BOTA"N IMPRIMIR PDF */}
                          <button 
                            onClick={() => window.open(/ds160/print/, '_blank')} 
                            className="btn btn-sm btn-outline" 
                            style={{ borderColor: '#6B7280', color: '#374151', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem' }} 
                            title="Exportar PDF Replica"
                          >
                            <Printer size={13} /> Exportar PDF
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

content = content.replace(old_buttons, new_buttons)

with open('src/pages/dashboard/VisaProcessesPage.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated VisaProcessesPage.jsx")
