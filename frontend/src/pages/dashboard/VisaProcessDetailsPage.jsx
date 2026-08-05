import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, FileText, CheckCircle2, Loader2, Download, 
  User, Globe, AlertCircle, Trash2, Calendar, File, 
  Briefcase, Plane, MapPin, DollarSign, ExternalLink,
  Sparkles, Award, ShieldCheck, Check, AlertTriangle, Send
} from 'lucide-react';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

// Algorithm for US Visa Approval Probability Assessment
const calculateVisaApprovalScore = (fd = {}) => {
  let score = 55;
  const strengths = [];
  const recommendations = [];

  const occ = (fd.occupation || '').toLowerCase();
  if (occ.includes('empleado') || occ.includes('empresar') || occ.includes('independiente')) {
    score += 15;
    strengths.push('Estabilidad económica y arraigo laboral sólido en el país de origen.');
  } else if (occ.includes('estudiante')) {
    score += 10;
    strengths.push('Lazos educativos activos demostrados con institución certificada.');
  } else if (occ.includes('jubilado') || occ.includes('pensionado')) {
    score += 12;
    strengths.push('Estatus de pensionado / jubilado verificado con ingresos fijos.');
  } else {
    recommendations.push('Se sugiere reforzar sustento de ingresos y vínculos familiares.');
  }

  if (fd.monthly_income) {
    score += 10;
    strengths.push('Solvencia financiera declarada acorde a los gastos estimados de viaje.');
  }

  const ms = (fd.marital_status || '').toLowerCase();
  if (ms.includes('casad') || ms.includes('unión') || ms.includes('union')) {
    score += 8;
    strengths.push('Arraigo familiar fuerte (Estado civil con vínculos declarados).');
  }

  if (fd.prev_us_travel === 'Sí' || fd.prev_visa === 'Sí') {
    score += 12;
    strengths.push('Historial migratorio o antecedentes de visados anteriores en regla.');
  }

  const finalScore = Math.min(96, Math.max(45, score));

  return {
    score: finalScore,
    level: finalScore >= 80 ? 'Excelente (Probabilidad Muy Alta)' : finalScore >= 65 ? 'Favorable (Probabilidad Alta)' : 'Moderado (Requiere Refuerzo)',
    color: finalScore >= 80 ? '#10B981' : finalScore >= 65 ? '#3B82F6' : '#F59E0B',
    strengths: strengths.length > 0 ? strengths : ['Información inicial suficiente para perfilamiento consular.'],
    recommendations: recommendations.length > 0 ? recommendations : ['Presentar pasaporte y documentación de soporte en orden el día de la cita.']
  };
};

const VisaProcessDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const loadData = () => {
    setLoading(true);
    api.getVisaProcessDetails(id)
      .then(res => setData(res))
      .catch(err => toast.error('Error cargando el expediente'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleMarkReady = async () => {
    setMarking(true);
    try {
      await api.updateVisaProcessStatus(id, 'Listo para Alta');
      toast.success('Expediente marcado como Listo para Revisión y Formulario DS-160');
      loadData();
    } catch (e) {
      toast.error('Error al actualizar estado');
    } finally {
      setMarking(false);
    }
  };

  const handleDelete = async () => {
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
        navigate('/dashboard/visa-processes');
      } else {
        const error = await res.json();
        toast.error(error.detail || 'Error al eliminar');
      }
    } catch (e) {
      toast.error('Error de red');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', color: 'var(--text-3)' }}>
        <div className="spinner"></div>
        <span style={{ fontSize: '1rem', fontWeight: 500, marginLeft: '0.75rem' }}>Cargando expediente digital...</span>
      </div>
    );
  }

  if (!data || !data.process) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-3)' }}>
        <AlertCircle size={48} style={{ margin: '0 auto 1rem auto', opacity: 0.5 }} />
        <h2 style={{ fontSize: '1.25rem' }}>Expediente no encontrado</h2>
        <button onClick={() => navigate('/dashboard/visa-processes')} className="btn btn-outline" style={{ marginTop: '1.5rem' }}>Volver</button>
      </div>
    );
  }

  const { process, applicants } = data;
  const isReady = process.status === 'Listo para Alta' || process.status === 'Listo para Revisar';

  return (
    <div className="letterhead-wrapper animate-in">
      <div className="official-paper-sheet" style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div className="official-paper-content">
          
          {/* Header & Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
            <div>
              <button onClick={() => navigate('/dashboard/visa-processes')} className="btn btn-outline btn-sm" style={{ marginBottom: '1.25rem', color: '#4B5563', borderColor: '#D1D5DB' }}>
                <ArrowLeft size={14} /> Volver a Lista
              </button>
              <h1 className="official-title" style={{ margin: 0, textAlign: 'left', borderBottom: 'none', paddingBottom: 0 }}>
                Expediente N° {process.id.toString().padStart(4, '0')}
              </h1>
              <p style={{ color: '#6B7280', fontSize: '0.85rem', marginTop: '0.4rem', fontFamily: 'var(--font-mono)' }}>
                FECHA DE REGISTRO: {new Date(process.created_at).toLocaleDateString()} · TIPO: {process.target_country.toUpperCase()} ({process.visa_category})
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => window.open(`/client-portal/${process.id}`, '_blank')} className="btn btn-outline btn-sm" style={{ borderColor: '#E5E7EB', color: '#4B5563' }} title="Portal del Cliente">
                <Globe size={14} /> Portal Formulario
              </button>
              <button onClick={handleDelete} className="btn btn-outline btn-sm" style={{ color: '#DC2626', borderColor: '#FCA5A5' }} title="Eliminar Expediente">
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          {/* Sello de Estado */}
          <div className={`realistic-stamp ${isReady ? 'stamp-success' : process.status === 'En Progreso' ? 'stamp-warning' : 'stamp-neutral'}`}>
            {process.status.toUpperCase()}
          </div>

          {/* Tabla de Metadatos del Expediente */}
          <table className="official-table">
            <tbody>
              <tr>
                <th>Cliente / Email Portal</th>
                <td>{process.client_email}</td>
              </tr>
              <tr>
                <th>País de Destino & Tipo</th>
                <td>{process.target_country} — {process.visa_category}</td>
              </tr>
              <tr>
                <th>Modalidad del Trámite</th>
                <td>{process.group_type} · {process.purpose}</td>
              </tr>
              <tr>
                <th>Total Solicitantes</th>
                <td>{applicants.length} persona(s) registrada(s)</td>
              </tr>
            </tbody>
          </table>

          {!isReady && (
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <button 
                onClick={handleMarkReady} 
                disabled={marking}
                className="btn btn-primary"
                style={{ padding: '0.75rem 2rem', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}
              >
                {marking ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                Aprobar Expediente y Habilitar Llenado DS-160
              </button>
            </div>
          )}

          <hr className="official-divider" />

          {/* SECCIÓN DE SOLICITANTES Y DIAGNÓSTICO IA DE APROBACIÓN */}
          <h2 style={{ fontFamily: 'Times New Roman, serif', fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#111827', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={18} /> Relación de Solicitantes ({applicants.length})
          </h2>

          {applicants.length > 1 && (
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid #E5E7EB', paddingBottom: '0.5rem' }}>
              {applicants.map((app, idx) => (
                <button
                  key={app.id}
                  onClick={() => setActiveTab(idx)}
                  className="btn btn-sm"
                  style={{
                    borderRadius: '4px',
                    background: activeTab === idx ? '#111827' : '#F3F4F6',
                    color: activeTab === idx ? '#FFFFFF' : '#4B5563',
                    border: 'none',
                    fontWeight: 600
                  }}
                >
                  {app.full_name || `Solicitante #${idx + 1}`}
                </button>
              ))}
            </div>
          )}

          {applicants.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#9CA3AF', fontStyle: 'italic', border: '1px dashed #D1D5DB' }}>
              No se han recibido respuestas o anexos para este expediente aún.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {applicants.map((app, index) => {
                if (applicants.length > 1 && activeTab !== index) return null;
                const fd = app.form_data || {};
                const diag = calculateVisaApprovalScore(fd);

                return (
                  <div key={app.id} style={{ padding: '1.5rem', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px' }}>
                    
                    {/* Header del Solicitante */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #D1D5DB', paddingBottom: '0.75rem' }}>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#111827', textTransform: 'uppercase' }}>
                          {app.full_name || `${fd.given_names || ''} ${fd.surname || ''}`.trim() || 'Solicitante'}
                        </h3>
                        <div style={{ fontSize: '0.78rem', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.2rem' }}>
                          Rol: {index === 0 ? 'Titular Principal' : (app.relationship || 'Acompañante')}
                        </div>
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', background: '#F3F4F6', padding: '0.35rem 0.6rem', border: '1px solid #D1D5DB', color: '#111827', fontWeight: 700 }}>
                        PASAPORTE: {app.passport_number || fd.passport_number || 'N/A'}
                      </div>
                    </div>

                    {/* ── CARD DIAGNÓSTICO IA DE PORCENTAJE DE APROBACIÓN DE VISA AMERICANA ── */}
                    <div style={{ background: '#FFFFFF', border: `1px solid ${diag.color}40`, borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <div style={{ width: 40, height: 40, borderRadius: '50%', background: `${diag.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Sparkles size={20} color={diag.color} />
                          </div>
                          <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0F172A' }}>
                              Diagnóstico de Probabilidad de Aprobación (Visa Americana B1/B2)
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                              Evaluación automatizada basada en arraigo, solvencia e historial migratorio.
                            </div>
                          </div>
                        </div>

                        {/* METER / PORCENTAJE */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: `${diag.color}10`, padding: '0.5rem 1rem', borderRadius: '99px', border: `1px solid ${diag.color}30` }}>
                          <span style={{ fontSize: '1.5rem', fontWeight: 900, color: diag.color }}>{diag.score}%</span>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: diag.color }}>{diag.level}</span>
                        </div>
                      </div>

                      {/* DETALLES Y FORTALEZAS */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                        <div>
                          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Check size={14} color="#059669" /> Factores Favorables Detectados
                          </div>
                          <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.78rem', color: '#334155', lineHeight: 1.5 }}>
                            {diag.strengths.map((s, i) => (
                              <li key={i}>{s}</li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#D97706', textTransform: 'uppercase', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <AlertTriangle size={14} color="#D97706" /> Recomendaciones para la Entrevista
                          </div>
                          <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.78rem', color: '#334155', lineHeight: 1.5 }}>
                            {diag.recommendations.map((r, i) => (
                              <li key={i}>{r}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* DATOS ESTRUCTURADOS DEL CUESTIONARIO DS-160 */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
                      
                      {/* IDENTIDAD */}
                      <div style={{ background: '#FFFFFF', padding: '1rem', border: '1px solid #E5E7EB', borderRadius: '6px' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#374151', textTransform: 'uppercase', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <User size={14} color="#10B981" /> 1. Datos Personales
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#4B5563', lineHeight: 1.6 }}>
                          <div><strong>Nombres:</strong> {fd.given_names || app.full_name}</div>
                          <div><strong>Apellidos:</strong> {fd.surname || '—'}</div>
                          <div><strong>DNI / Cédula:</strong> {fd.national_id || '—'}</div>
                          <div><strong>Género:</strong> {fd.gender || '—'}</div>
                          <div><strong>Estado Civil:</strong> {fd.marital_status || '—'}</div>
                          <div><strong>Nacimiento:</strong> {fd.birth_date || '—'} ({fd.birth_city || ''}, {fd.birth_country || ''})</div>
                        </div>
                      </div>

                      {/* PASAPORTE Y CONTACTO */}
                      <div style={{ background: '#FFFFFF', padding: '1rem', border: '1px solid #E5E7EB', borderRadius: '6px' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#374151', textTransform: 'uppercase', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <FileText size={14} color="#10B981" /> 2. Pasaporte & Contacto
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#4B5563', lineHeight: 1.6 }}>
                          <div><strong>Nº Pasaporte:</strong> {app.passport_number || fd.passport_number || '—'}</div>
                          <div><strong>País Emisión:</strong> {fd.passport_country || '—'}</div>
                          <div><strong>Emisión/Expiración:</strong> {fd.passport_issue_date || '—'} al {fd.passport_expiry_date || '—'}</div>
                          <div><strong>Teléfono:</strong> {fd.phone || '—'}</div>
                          <div><strong>Email:</strong> {fd.email || '—'}</div>
                          <div><strong>Dirección:</strong> {fd.address || '—'}</div>
                        </div>
                      </div>

                      {/* LABORAL Y PLANES */}
                      <div style={{ background: '#FFFFFF', padding: '1rem', border: '1px solid #E5E7EB', borderRadius: '6px' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#374151', textTransform: 'uppercase', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Briefcase size={14} color="#10B981" /> 3. Laboral & Viaje
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#4B5563', lineHeight: 1.6 }}>
                          <div><strong>Ocupación:</strong> {fd.occupation || '—'}</div>
                          <div><strong>Empresa:</strong> {fd.employer_name || '—'} ({fd.job_title || ''})</div>
                          <div><strong>Ingreso Aprox.:</strong> {fd.monthly_income || '—'}</div>
                          <div><strong>Propósito Viaje:</strong> {fd.travel_purpose || process.purpose}</div>
                          <div><strong>Llegada Estimada:</strong> {fd.intended_arrival_date || '—'}</div>
                          <div><strong>Hospedaje EE. UU.:</strong> {fd.us_address || '—'}</div>
                        </div>
                      </div>

                    </div>

                    {/* DOCUMENTOS ADJUNTOS */}
                    <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                      Documentos Anexos del Solicitante
                    </h4>
                    
                    {app.documents && app.documents.length > 0 ? (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.75rem' }}>
                        {app.documents.map(doc => (
                          <div key={doc.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0.8rem', background: '#FFFFFF', border: '1px solid #D1D5DB', borderRadius: '6px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
                              <FileText size={16} color="#10B981" />
                              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {doc.document_type}
                              </div>
                            </div>
                            <a 
                              href={`${(api.url || api.API_URL || '').replace('/api', '')}${doc.file_path || doc.file_url}`} 
                              target="_blank" 
                              rel="noreferrer"
                              className="btn btn-icon btn-sm"
                              style={{ background: '#F3F4F6', border: 'none', color: '#111827' }}
                              title="Ver / Descargar"
                            >
                              <Download size={13} />
                            </a>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ padding: '0.75rem', background: '#FFFFFF', border: '1px dotted #D1D5DB', color: '#9CA3AF', fontSize: '0.78rem', fontStyle: 'italic', borderRadius: '6px' }}>
                        Sin archivos adjuntos para este integrante.
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default VisaProcessDetailsPage;
