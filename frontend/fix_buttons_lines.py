import io

with open('src/pages/dashboard/VisaProcessesPage.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

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
                            title="Exportar PDF"
                          >
                            <Printer size={13} /> PDF
                          </button>

                          {/* BOTA"N VER EXPEDIENTE */}
                          <button 
                            onClick={() => navigate(/dashboard/visa-processes/)} 
                            className="btn btn-sm btn-primary" 
                            style={{ background: 'var(--lime)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }} 
                            title="Ver Diagnostico IA y Datos"
                          >
                            <Eye size={13} /> Ver Expediente
                          </button>\n"""

# Replace lines 499 to 508 (0-indexed 499 is line 500)
lines = lines[:499] + [new_buttons] + lines[508:]

with open('src/pages/dashboard/VisaProcessesPage.jsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)
print("Success: Replaced buttons using line numbers.")
