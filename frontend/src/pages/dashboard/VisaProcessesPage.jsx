import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Plus, Link as LinkIcon, Eye, CheckCircle2, Search, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

const VisaProcessesPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [processes, setProcesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [newEmail, setNewEmail] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('Estados Unidos');
  const [selectedCategory, setSelectedCategory] = useState('B1/B2');
  const [searchQuery, setSearchQuery] = useState('');

  const load = async () => {
    try {
      const res = await fetch(`${api.url}/visa-processes/`, { 
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      if (res.ok) {
        setProcesses(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${api.url}/visa-processes/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ client_email: newEmail, target_country: selectedCountry, visa_category: selectedCategory })
      });
      if (res.ok) {
        toast.success('Expediente creado con éxito');
        setNewEmail('');
        setWizardStep(1);
        setCreating(false);
        load();
      } else {
        toast.error('Error al crear expediente');
      }
    } catch (e) {
      toast.error('Error de conexión');
    }
  };

  const copyLink = (id) => {
    const link = `${window.location.origin}/client-portal/${id}`;
    navigator.clipboard.writeText(link);
    toast.success('Link de cliente copiado al portapapeles');
  };

  const filteredProcesses = useMemo(() => {
    if (!searchQuery.trim()) return processes;
    const lowerQuery = searchQuery.toLowerCase();
    return processes.filter(p => 
      p.client_email?.toLowerCase().includes(lowerQuery) || 
      p.id.toString().includes(lowerQuery) ||
      p.status?.toLowerCase().includes(lowerQuery)
    );
  }, [processes, searchQuery]);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', color: 'var(--text-3)' }}>
      <div className="animate-spin" style={{ width: '32px', height: '32px', border: '3px solid var(--border)', borderTopColor: 'var(--lime)', borderRadius: '50%', marginRight: '1rem' }} />
      <span style={{ fontSize: '1.1rem', fontWeight: 500 }}>Cargando expedientes...</span>
    </div>
  );

  return (
    <div className="animate-in" style={{ padding: '0', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--text-1)', display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '0 0 0.5rem 0' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(163, 230, 53, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={22} style={{ color: 'var(--lime)' }} />
            </div>
            Gestión de Expedientes
          </h1>
          <p style={{ color: 'var(--text-3)', fontSize: '0.95rem', margin: 0 }}>
            Visualiza y administra todos los procesos documentales de tus clientes.
          </p>
        </div>
        <button onClick={() => setCreating(true)} className="btn btn-lime" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', padding: '0.75rem 1.25rem', fontSize: '0.95rem', fontWeight: 600 }}>
          <Plus size={18} /> Crear Nuevo Expediente
        </button>
      </div>

      {/* ── Creation Wizard Panel ── */}
      {creating && (
        <div className="panel animate-in" style={{ padding: '2rem', marginBottom: '2rem', border: '1px solid var(--lime)', boxShadow: '0 12px 40px rgba(163, 230, 53, 0.08)', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h3 style={{ margin: 0, fontWeight: 700, fontSize: '1.25rem', color: 'var(--text-1)' }}>Nuevo Expediente de Trámite</h3>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: wizardStep >= 1 ? 'var(--lime)' : 'var(--surface-2)' }}></div>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: wizardStep >= 2 ? 'var(--lime)' : 'var(--surface-2)' }}></div>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: wizardStep >= 3 ? 'var(--lime)' : 'var(--surface-2)' }}></div>
            </div>
          </div>

          {wizardStep === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4">
              <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--text-1)' }}>Paso 1: Selecciona el País Destino</h4>
              <p style={{ color: 'var(--text-3)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Elige el país para el cual el cliente desea solicitar el visado.</p>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.9rem', color: 'var(--text-2)', fontWeight: 500 }}>Países Frecuentes</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                  {['Estados Unidos', 'Canadá', 'Reino Unido', 'Schengen (Europa)', 'Australia'].map(country => (
                    <div 
                      key={country}
                      onClick={() => setSelectedCountry(country)}
                      style={{ 
                        padding: '1rem', borderRadius: '12px', border: `2px solid ${selectedCountry === country ? 'var(--lime)' : 'var(--border)'}`,
                        background: selectedCountry === country ? 'rgba(163, 230, 53, 0.05)' : 'var(--surface)', cursor: 'pointer',
                        textAlign: 'center', transition: 'all 0.2s', transform: selectedCountry === country ? 'translateY(-2px)' : 'none'
                      }}
                    >
                      <div style={{ fontSize: '0.95rem', fontWeight: 600, color: selectedCountry === country ? 'var(--lime)' : 'var(--text-1)' }}>
                        {country}
                      </div>
                    </div>
                  ))}
                </div>

                <label style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.9rem', color: 'var(--text-2)', fontWeight: 500 }}>O buscar cualquier otro país del mundo:</label>
                <select 
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-1)', fontSize: '1rem', outline: 'none', appearance: 'none', cursor: 'pointer' }}
                >
                  <option value="" disabled>Selecciona un país...</option>
                  {[
                    "Afganistán", "Albania", "Alemania", "Andorra", "Angola", "Antigua y Barbuda", "Arabia Saudita", "Argelia", "Argentina", "Armenia", "Australia", "Austria", "Azerbaiyán", "Bahamas", "Bangladés", "Barbados", "Baréin", "Bélgica", "Belice", "Benín", "Bielorrusia", "Birmania", "Bolivia", "Bosnia y Herzegovina", "Botsuana", "Brasil", "Brunéi", "Bulgaria", "Burkina Faso", "Burundi", "Bután", "Cabo Verde", "Camboya", "Camerún", "Canadá", "Catar", "Chad", "Chile", "China", "Chipre", "Ciudad del Vaticano", "Colombia", "Comoras", "Corea del Norte", "Corea del Sur", "Costa de Marfil", "Costa Rica", "Croacia", "Cuba", "Dinamarca", "Dominica", "Ecuador", "Egipto", "El Salvador", "Emiratos Árabes Unidos", "Eritrea", "Eslovaquia", "Eslovenia", "España", "Estados Unidos", "Estonia", "Etiopía", "Filipinas", "Finlandia", "Fiyi", "Francia", "Gabón", "Gambia", "Georgia", "Ghana", "Granada", "Grecia", "Guatemala", "Guyana", "Guinea", "Guinea ecuatorial", "Guinea-Bisáu", "Haití", "Honduras", "Hungría", "India", "Indonesia", "Irak", "Irán", "Irlanda", "Islandia", "Islas Marshall", "Islas Salomón", "Israel", "Italia", "Jamaica", "Japón", "Jordania", "Kazajistán", "Kenia", "Kirguistán", "Kiribati", "Kuwait", "Laos", "Lesoto", "Letonia", "Líbano", "Liberia", "Libia", "Liechtenstein", "Lituania", "Luxemburgo", "Madagascar", "Malasia", "Malaui", "Maldivas", "Malí", "Malta", "Marruecos", "Mauricio", "Mauritania", "México", "Micronesia", "Moldavia", "Mónaco", "Mongolia", "Montenegro", "Mozambique", "Namibia", "Nauru", "Nepal", "Nicaragua", "Níger", "Nigeria", "Noruega", "Nueva Zelanda", "Omán", "Países Bajos", "Pakistán", "Palaos", "Panamá", "Papúa Nueva Guinea", "Paraguay", "Perú", "Polonia", "Portugal", "Reino Unido", "República Centroafricana", "República Checa", "República de Macedonia", "República del Congo", "República Democrática del Congo", "República Dominicana", "República Sudafricana", "Ruanda", "Rumanía", "Rusia", "Samoa", "San Cristóbal y Nieves", "San Marino", "San Vicente y las Granadinas", "Santa Lucía", "Santo Tomé y Príncipe", "Senegal", "Serbia", "Seychelles", "Sierra Leona", "Singapur", "Siria", "Somalia", "Sri Lanka", "Suazilandia", "Sudán", "Sudán del Sur", "Suecia", "Suiza", "Surinam", "Tailandia", "Tanzania", "Tayikistán", "Timor Oriental", "Togo", "Tonga", "Trinidad y Tobago", "Túnez", "Turkmenistán", "Turquía", "Tuvalu", "Ucrania", "Uganda", "Uruguay", "Uzbekistán", "Vanuatu", "Venezuela", "Vietnam", "Yemen", "Yibuti", "Zambia", "Zimbabue"
                  ].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" onClick={() => setCreating(false)} className="btn btn-outline" style={{ padding: '0.85rem 1.5rem' }}>Cancelar</button>
                <button type="button" onClick={() => setWizardStep(2)} className="btn btn-lime" style={{ padding: '0.85rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>Siguiente <ArrowRight size={16} /></button>
              </div>
            </div>
          )}

          {wizardStep === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4">
              <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--text-1)' }}>Paso 2: Categoría de Visa</h4>
              <p style={{ color: 'var(--text-3)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Selecciona la categoría de visa para {selectedCountry}.</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                {(selectedCountry === 'Estados Unidos' ? ['B1/B2 (Turismo/Negocios)', 'F1 (Estudiante)', 'J1 (Intercambio)', 'H1B (Trabajo)'] : 
                  selectedCountry === 'Canadá' ? ['Visitor Visa', 'Study Permit', 'Work Permit'] :
                  ['Turismo', 'Estudio', 'Trabajo', 'Tránsito']).map(cat => (
                  <div 
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    style={{ 
                      padding: '1.25rem', borderRadius: '12px', border: `2px solid ${selectedCategory === cat ? 'var(--lime)' : 'var(--border)'}`,
                      background: selectedCategory === cat ? 'rgba(163, 230, 53, 0.05)' : 'var(--surface)', cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ fontSize: '1rem', fontWeight: 600, color: selectedCategory === cat ? 'var(--lime)' : 'var(--text-1)' }}>
                      {cat}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button type="button" onClick={() => setWizardStep(1)} className="btn btn-outline" style={{ padding: '0.85rem 1.5rem' }}>Volver</button>
                <button type="button" onClick={() => setWizardStep(3)} className="btn btn-lime" style={{ padding: '0.85rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>Siguiente <ArrowRight size={16} /></button>
              </div>
            </div>
          )}

          {wizardStep === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4">
              <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--text-1)' }}>Paso 3: Datos del Cliente</h4>
              <p style={{ color: 'var(--text-3)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                Ingresa el correo electrónico del cliente. Le proporcionaremos un portal seguro para que cargue los requisitos específicos para <strong>{selectedCountry} ({selectedCategory})</strong>.
              </p>
              
              <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-2)', fontWeight: 500 }}>Correo Electrónico</label>
                  <input 
                    type="email" 
                    required 
                    placeholder="ejemplo@cliente.com" 
                    value={newEmail} 
                    onChange={e => setNewEmail(e.target.value)}
                    style={{ width: '100%', maxWidth: '400px', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-1)', fontSize: '1rem', outline: 'none', transition: 'all 0.2s' }}
                    onFocus={e => e.target.style.borderColor = 'var(--lime)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                  <button type="button" onClick={() => setWizardStep(2)} className="btn btn-outline" style={{ padding: '0.85rem 1.5rem' }}>Volver</button>
                  <button type="submit" className="btn btn-lime" style={{ padding: '0.85rem 2rem', fontWeight: 600 }}>Generar Expediente</button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* ── Search Bar ── */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.5rem 1rem', width: '100%', maxWidth: '400px' }}>
        <Search size={18} color="var(--text-3)" style={{ marginRight: '0.75rem' }} />
        <input 
          type="text" 
          placeholder="Buscar por ID, correo o estado..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ border: 'none', background: 'transparent', outline: 'none', color: 'var(--text-1)', fontSize: '0.9rem', width: '100%' }}
        />
      </div>

      {/* ── Table ── */}
      <div className="table-responsive panel" style={{ borderRadius: '12px', overflow: 'hidden' }}>
        <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: 'var(--bg)' }}>
            <tr>
              <th style={{ padding: '1.25rem 1rem', fontSize: '0.85rem', color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>ID Expediente</th>
              <th style={{ padding: '1.25rem 1rem', fontSize: '0.85rem', color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cliente</th>
              <th style={{ padding: '1.25rem 1rem', fontSize: '0.85rem', color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Trámite</th>
              <th style={{ padding: '1.25rem 1rem', fontSize: '0.85rem', color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Estado Actual</th>
              <th style={{ padding: '1.25rem 1rem', fontSize: '0.85rem', color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredProcesses.map(p => (
              <tr key={p.id} style={{ borderTop: '1px solid var(--border)', transition: 'background 0.2s', cursor: 'default' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '1rem', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>#{p.id}</td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-2)', fontSize: '0.85rem', fontWeight: 600 }}>
                      {(p.client_email || 'U').charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontWeight: 500, color: 'var(--text-1)' }}>{p.client_email || 'Sin correo asignado'}</span>
                  </div>
                </td>
                <td style={{ padding: '1rem', color: 'var(--text-2)', fontSize: '0.95rem' }}>
                  {p.target_country} <span style={{ opacity: 0.5 }}>({p.visa_category})</span>
                </td>
                <td style={{ padding: '1rem' }}>
                  <span className={`tag ${p.status === 'Documentos Recibidos' ? 'tag-lime' : p.status === 'Listo para Alta' ? 'tag-gold' : 'tag-neutral'}`} style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}>
                    {p.status === 'Listo para Alta' && <CheckCircle2 size={14} style={{ marginRight: '0.25rem', display: 'inline-block', verticalAlign: 'text-bottom' }} />}
                    {p.status}
                  </span>
                </td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                    <button 
                      onClick={() => copyLink(p.id)} 
                      className="btn btn-sm" 
                      title="Copiar Link Seguro para Cliente" 
                      style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-1)', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.75rem', borderRadius: '6px', border: 'none', cursor: 'pointer', transition: 'background 0.2s' }}
                      onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                      onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    >
                      <LinkIcon size={14} /> Enlace
                    </button>
                    <button 
                      onClick={() => navigate(`/dashboard/visa-processes/${p.id}`)} 
                      className="btn btn-sm btn-lime" 
                      title="Abrir Expediente Completo" 
                      style={{ padding: '0.4rem 0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                    >
                      <Eye size={14} /> Revisar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredProcesses.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-3)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                    <Search size={32} style={{ opacity: 0.5 }} />
                    <span style={{ fontSize: '1rem' }}>
                      {searchQuery ? 'No se encontraron expedientes que coincidan con la búsqueda.' : 'No hay expedientes creados.'}
                    </span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default VisaProcessesPage;
