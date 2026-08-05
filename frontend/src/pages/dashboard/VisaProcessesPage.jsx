import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  FileText, Plus, Search, ArrowRight, Trash2, Link as LinkIcon, 
  Eye, CheckCircle2, ChevronRight, Filter, Globe, Users, 
  FolderOpen, Sparkles, Copy, ExternalLink, ShieldCheck, Check, Clock, UserCheck
} from 'lucide-react';
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
  const [selectedGroup, setSelectedGroup] = useState('Individual');
  const [selectedPurpose, setSelectedPurpose] = useState('Turismo / Negocios');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'in_progress' | 'ready'

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
        body: JSON.stringify({ 
          client_email: newEmail, 
          target_country: selectedCountry, 
          group_type: selectedGroup,
          purpose: selectedPurpose 
        })
      });
      if (res.ok) {
        toast.success('Expediente creado con éxito');
        setNewEmail('');
        setWizardStep(1);
        setCreating(false);
        load();
      } else {
        const error = await res.json();
        toast.error(error.detail || 'Error al crear expediente');
      }
    } catch (e) {
      toast.error('Error de red');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este expediente? Esta acción no se puede deshacer.')) return;
    try {
      const res = await fetch(`${api.url}/visa-processes/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (res.ok) {
        toast.success('Expediente eliminado');
        load();
      } else {
        const error = await res.json();
        toast.error(error.detail || 'Error al eliminar');
      }
    } catch (e) {
      toast.error('Error de red');
    }
  };

  const copyLink = (id) => {
    const link = `${window.location.origin}/client-portal/${id}`;
    navigator.clipboard.writeText(link);
    toast.success('Link copiado al portapapeles. ¡Listo para compartir por WhatsApp!');
  };

  const filteredProcesses = useMemo(() => {
    return processes.filter(p => {
      const matchesSearch = !searchQuery.trim() || (
        p.client_email?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.id.toString().includes(searchQuery) ||
        p.target_country?.toLowerCase().includes(searchQuery.toLowerCase())
      );

      const matchesStatus = 
        statusFilter === 'all' ? true :
        statusFilter === 'ready' ? (p.status === 'Listo para Alta' || p.status === 'Listo para Revisar') :
        statusFilter === 'in_progress' ? (p.status === 'En_Progreso' || p.status === 'En Progreso') : true;

      return matchesSearch && matchesStatus;
    });
  }, [processes, searchQuery, statusFilter]);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', color: 'var(--text-3)' }}>
      <div className="spinner"></div>
      <span style={{ fontSize: '1rem', fontWeight: 500, marginLeft: '0.75rem' }}>Cargando expedientes digitales...</span>
    </div>
  );

  const totalCount = processes.length;
  const readyCount = processes.filter(p => p.status === 'Listo para Alta' || p.status === 'Listo para Revisar').length;
  const inProgressCount = processes.filter(p => p.status === 'En_Progreso' || p.status === 'En Progreso').length;

  return (
    <div className="animate-in" style={{ padding: '0', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* ── HEADER DE EXPEDIENTES Y TRÁMITES ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.25rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ fontSize: '0.75rem', color: '#8B5CF6', letterSpacing: '0.12em', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FolderOpen size={16} /> Data Room · Formularios & Expedientes Consulares
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, color: 'var(--text-1)', letterSpacing: '-0.02em' }}>
            Mis Trámites y Expedientes
          </h1>
          <p style={{ margin: '0.2rem 0 0 0', color: 'var(--text-2)', fontSize: '0.9rem' }}>
            Administra la recolección de documentos y cuestionarios DS-160 de tus clientes.
          </p>
        </div>

        <button 
          onClick={() => { setCreating(true); setWizardStep(1); }} 
          className="btn btn-primary"
          style={{ background: '#8B5CF6', borderRadius: '10px', padding: '0.65rem 1.25rem', fontWeight: 700 }}
        >
          <Plus size={18} /> Nuevo Expediente de Trámite
        </button>
      </div>

      {/* ── KPI METRICS DE TRÁMITES ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ width: 44, height: 44, borderRadius: '10px', background: '#F5F3FF', color: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FolderOpen size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Total Expedientes</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A' }}>{totalCount}</div>
          </div>
        </div>

        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ width: 44, height: 44, borderRadius: '10px', background: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>En Recolección Cliente</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#D97706' }}>{inProgressCount}</div>
          </div>
        </div>

        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ width: 44, height: 44, borderRadius: '10px', background: '#DCFCE7', color: '#15803D', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <UserCheck size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Listos para DS-160</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#15803D' }}>{readyCount}</div>
          </div>
        </div>

      </div>

      {/* ── WIZARD DE CREACIÓN MODERNIZADO ── */}
      {creating && (
        <div className="panel animate-in" style={{ padding: '2rem', borderRadius: '16px', marginBottom: '2rem', border: '1px solid #8B5CF6', background: '#FFFFFF', boxShadow: '0 4px 12px rgba(139, 92, 246, 0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ width: 36, height: 36, borderRadius: '10px', background: '#F5F3FF', color: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={18} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.1rem', color: '#0F172A' }}>Apertura de Nuevo Expediente</h3>
                <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748B' }}>Paso {wizardStep} de 4 · Configuración del formulario y cliente</p>
              </div>
            </div>

            <button onClick={() => setCreating(false)} className="btn btn-outline btn-sm" style={{ borderColor: '#E2E8F0', color: '#64748B' }}>
              ✕ Cancelar
            </button>
          </div>

          {/* STEP 1: PAÍS DESTINO */}
          {wizardStep === 1 && (
            <div className="animate-in">
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '1rem', color: '#0F172A' }}>1. Selecciona el País de Destino del Trámite</h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                {[
                  { name: 'Estados Unidos', flag: '🇺🇸', code: 'US' },
                  { name: 'Canadá', flag: '🇨🇦', code: 'CA' },
                  { name: 'Schengen (Europa)', flag: '🇪🇺', code: 'EU' },
                  { name: 'Reino Unido', flag: '🇬🇧', code: 'UK' },
                  { name: 'Australia', flag: '🇦🇺', code: 'AU' }
                ].map(item => (
                  <div 
                    key={item.name}
                    onClick={() => setSelectedCountry(item.name)}
                    style={{
                      padding: '1.25rem',
                      borderRadius: '12px',
                      border: selectedCountry === item.name ? '2px solid #8B5CF6' : '1px solid #E2E8F0',
                      background: selectedCountry === item.name ? '#F5F3FF' : '#FFFFFF',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      transition: 'all 0.2s'
                    }}
                  >
                    <span style={{ fontSize: '1.75rem' }}>{item.flag}</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: selectedCountry === item.name ? '#7C3AED' : '#0F172A' }}>{item.name}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" onClick={() => setWizardStep(2)} className="btn btn-primary" style={{ background: '#8B5CF6' }}>
                  Siguiente paso <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: AGRUPACIÓN */}
          {wizardStep === 2 && (
            <div className="animate-in">
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '1rem', color: '#0F172A' }}>2. Modalidad de Integrantes</h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                {[
                  { name: 'Individual', desc: '1 Solicitante principal' },
                  { name: 'Familiar', desc: 'Titular + Pareja o Hijos' },
                  { name: 'Grupal / Amigos', desc: 'Grupo de viajes o acompañantes' },
                  { name: 'Corporativo', desc: 'Empresarial / Empleados' }
                ].map(g => (
                  <div 
                    key={g.name}
                    onClick={() => setSelectedGroup(g.name)}
                    style={{
                      padding: '1.25rem',
                      borderRadius: '12px',
                      border: selectedGroup === g.name ? '2px solid #8B5CF6' : '1px solid #E2E8F0',
                      background: selectedGroup === g.name ? '#F5F3FF' : '#FFFFFF',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: selectedGroup === g.name ? '#7C3AED' : '#0F172A' }}>{g.name}</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '0.2rem' }}>{g.desc}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" onClick={() => setWizardStep(1)} className="btn btn-outline">Atrás</button>
                <button type="button" onClick={() => setWizardStep(3)} className="btn btn-primary" style={{ background: '#8B5CF6' }}>
                  Siguiente paso <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: PROPÓSITO */}
          {wizardStep === 3 && (
            <div className="animate-in">
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '1rem', color: '#0F172A' }}>3. Categoría y Propósito del Visado</h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                {[
                  { name: 'Turismo / Negocios', cat: 'Visa B1/B2 (Negocios y Turismo)' },
                  { name: 'Estudiante', cat: 'Visa F1/M1 (Académico)' },
                  { name: 'Trabajo Temporal', cat: 'Visa H/L/O/P (Empleo)' },
                  { name: 'Intercambio', cat: 'Visa J1 (Exchange Program)' }
                ].map(p => (
                  <div 
                    key={p.name}
                    onClick={() => setSelectedPurpose(p.name)}
                    style={{
                      padding: '1.25rem',
                      borderRadius: '12px',
                      border: selectedPurpose === p.name ? '2px solid #8B5CF6' : '1px solid #E2E8F0',
                      background: selectedPurpose === p.name ? '#F5F3FF' : '#FFFFFF',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: selectedPurpose === p.name ? '#7C3AED' : '#0F172A' }}>{p.name}</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '0.2rem' }}>{p.cat}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" onClick={() => setWizardStep(2)} className="btn btn-outline">Atrás</button>
                <button type="button" onClick={() => setWizardStep(4)} className="btn btn-primary" style={{ background: '#8B5CF6' }}>
                  Siguiente paso <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: EMAIL DEL CLIENTE */}
          {wizardStep === 4 && (
            <form onSubmit={handleCreate} className="animate-in">
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '1rem', color: '#0F172A' }}>4. Email del Cliente para el Enlace Seguro del Formulario</h4>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="input-label">Correo Electrónico del Cliente / Titular</label>
                <input 
                  type="email" 
                  required 
                  placeholder="ejemplo@cliente.com" 
                  value={newEmail} 
                  onChange={(e) => setNewEmail(e.target.value)} 
                  className="input-field"
                  style={{ background: '#FFF' }}
                />
                <p style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '0.4rem' }}>
                  Se creará un portal interactivo para que tu cliente responda las preguntas y suba su pasaporte.
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" onClick={() => setWizardStep(3)} className="btn btn-outline">Atrás</button>
                <button type="submit" className="btn btn-primary" style={{ background: '#10B981', border: 'none' }}>
                  <CheckCircle2 size={16} /> Crear Expediente y Generar Enlace
                </button>
              </div>
            </form>
          )}

        </div>
      )}

      {/* ── BARRA DE BÚSQUEDA Y FILTROS DE ESTADO ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        
        {/* Buscador */}
        <div style={{ position: 'relative', minWidth: '300px', flex: 1, maxWidth: '450px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
          <input 
            type="text" 
            placeholder="Buscar por cliente, email o número de expediente..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field"
            style={{ paddingLeft: '2.75rem', background: '#FFFFFF', borderRadius: '10px', borderColor: '#CBD5E1' }}
          />
        </div>

        {/* Filtros Tab */}
        <div style={{ display: 'flex', background: '#FFFFFF', borderRadius: '10px', border: '1px solid #E2E8F0', padding: '0.2rem', gap: '0.2rem' }}>
          {[
            { id: 'all', label: 'Todos' },
            { id: 'in_progress', label: 'En Recolección' },
            { id: 'ready', label: 'Listos DS-160' }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: 'none',
                background: statusFilter === tab.id ? '#F1F5F9' : 'transparent',
                color: statusFilter === tab.id ? '#0F172A' : '#64748B',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── TABLA EJECUTIVA DE TRÁMITES Y EXPEDIENTES ── */}
      <div className="panel" style={{ borderRadius: '16px', overflow: 'hidden', background: '#FFFFFF', border: '1px solid #E2E8F0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ width: '100%', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', textAlign: 'left', color: '#64748B' }}>
                <th style={{ padding: '1rem' }}>Expediente N°</th>
                <th style={{ padding: '1rem' }}>Cliente / Email Portal</th>
                <th style={{ padding: '1rem' }}>Destino & Modalidad</th>
                <th style={{ padding: '1rem' }}>Estado del Trámite</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>Acciones Rápidas</th>
              </tr>
            </thead>
            <tbody>
              {filteredProcesses.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '4rem', color: '#94A3B8', fontStyle: 'italic' }}>
                    <FolderOpen size={36} style={{ margin: '0 auto 0.75rem auto', opacity: 0.4 }} />
                    <div>No se encontraron expedientes registrados.</div>
                  </td>
                </tr>
              ) : (
                filteredProcesses.map(p => {
                  const isReady = p.status === 'Listo para Alta' || p.status === 'Listo para Revisar';

                  return (
                    <tr key={p.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      
                      {/* ID EXPEDIENTE */}
                      <td style={{ padding: '1rem', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#8B5CF6' }}>
                        #{p.id.toString().padStart(4, '0')}
                      </td>

                      {/* CLIENTE / EMAIL */}
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: 700, color: '#0F172A' }}>{p.client_email}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.2rem' }}>
                          Creado: {new Date(p.created_at).toLocaleDateString()}
                        </div>
                      </td>

                      {/* DESTINO Y TIPO */}
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span>{p.target_country === 'Estados Unidos' ? '🇺🇸' : '🌎'}</span> {p.target_country}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.2rem' }}>
                          {p.group_type} · {p.purpose}
                        </div>
                      </td>

                      {/* ESTADO DE TRÁMITE */}
                      <td style={{ padding: '1rem' }}>
                        <span style={{ 
                          fontSize: '0.72rem', 
                          padding: '0.25rem 0.6rem', 
                          borderRadius: '6px', 
                          fontWeight: 800,
                          background: isReady ? '#DCFCE7' : '#FEF3C7',
                          color: isReady ? '#15803D' : '#D97706',
                          border: `1px solid ${isReady ? '#86EFAC' : '#FDE68A'}`
                        }}>
                          {isReady ? 'LISTO PARA DS-160' : 'EN RECOLECCIÓN'}
                        </span>
                      </td>

                      {/* ACCIONES RÁPIDAS */}
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          
                          {/* BOTÓN COPIAR ENLACE PORTAL */}
                          <button 
                            onClick={() => copyLink(p.id)} 
                            className="btn btn-sm btn-outline" 
                            style={{ borderColor: '#CBD5E1', color: '#059669', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem' }} 
                            title="Copiar Enlace del Portal del Cliente"
                          >
                            <Copy size={13} /> Link Cliente
                          </button>

                          {/* BOTÓN VER EXPEDIENTE */}
                          <button 
                            onClick={() => navigate(`/dashboard/visa-processes/${p.id}`)} 
                            className="btn btn-sm btn-primary" 
                            style={{ background: '#8B5CF6', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }} 
                            title="Ver Diagnóstico IA y Datos"
                          >
                            <Eye size={13} /> Ver Expediente
                          </button>

                          {/* BOTÓN ELIMINAR */}
                          <button 
                            onClick={() => handleDelete(p.id)} 
                            className="btn btn-icon btn-sm btn-outline" 
                            style={{ color: '#EF4444', borderColor: '#FCA5A5' }} 
                            title="Eliminar Expediente"
                          >
                            <Trash2 size={14} />
                          </button>

                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default VisaProcessesPage;
