import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, FileText, CheckCircle2, Loader2, Download, 
  User, Globe, AlertCircle, Trash2, Calendar, File, Copy, 
  Code, Briefcase, Plane, MapPin, DollarSign, ExternalLink
} from 'lucide-react';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

const VisaProcessDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [showJsonModal, setShowJsonModal] = useState(false);

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
      toast.success('Expediente marcado como Listo para Alta. Script de automatización habilitado.');
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

  const handleCopyJson = (payload) => {
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    toast.success('Payload JSON copiado al portapapeles para Script de Automatización / IA');
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
                Expediente Consular N° {process.id.toString().padStart(4, '0')}
              </h1>
              <p style={{ color: '#6B7280', fontSize: '0.85rem', marginTop: '0.4rem', fontFamily: 'var(--font-mono)' }}>
                REGISTRO: {new Date(process.created_at).toLocaleDateString()} · PAÍS: {process.target_country.toUpperCase()} ({process.visa_category})
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                onClick={() => handleCopyJson({ process, applicants })} 
                className="btn btn-outline btn-sm" 
                style={{ borderColor: '#D1D5DB', color: '#111827', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                title="Copiar JSON de Automatización"
              >
                <Code size={14} /> Payload IA
              </button>
              <button onClick={() => window.open(`/client-portal/${process.id}`, '_blank')} className="btn btn-outline btn-sm" style={{ borderColor: '#E5E7EB', color: '#4B5563' }} title="Portal del Cliente">
                <Globe size={14} />
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
                <th>Cliente Titular</th>
                <td>{process.client_email}</td>
              </tr>
              <tr>
                <th>País & Categoría</th>
                <td>{process.target_country} — {process.visa_category}</td>
              </tr>
              <tr>
                <th>Modalidad</th>
                <td>{process.group_type} · {process.purpose}</td>
              </tr>
              <tr>
                <th>Total Solicitantes</th>
                <td>{applicants.length} integrante(s)</td>
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
                Aprobar Expediente para Automatización DS-160
              </button>
            </div>
          )}

          <hr className="official-divider" />

          {/* SECCIÓN DE SOLICITANTES Y RESPUESTAS DEL CUESTIONARIO */}
          <h2 style={{ fontFamily: 'Times New Roman, serif', fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#111827', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={18} /> Expediente Digital del Solicitante ({applicants.length})
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

                return (
                  <div key={app.id} style={{ padding: '1.5rem', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px' }}>
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
                              href={`${api.API_URL.replace('/api', '')}${doc.file_path || doc.file_url}`} 
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

                    {/* BOX PAYLOAD IA */}
                    <div style={{ marginTop: '1.25rem', background: '#1E1E1E', padding: '1rem', borderRadius: '6px', color: '#D4D4D4' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#10B981', fontWeight: 700 }}>
                          AI AUTOMATION PAYLOAD (JSON)
                        </span>
                        <button 
                          onClick={() => handleCopyJson(app.form_data || app)} 
                          className="btn btn-sm"
                          style={{ background: '#374151', color: '#FFF', border: 'none', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                        >
                          <Copy size={12} /> Copiar JSON
                        </button>
                      </div>
                      <pre style={{ margin: 0, fontSize: '0.72rem', fontFamily: 'var(--font-mono)', overflowX: 'auto', maxHeight: '120px', color: '#9CA3AF' }}>
                        {JSON.stringify(app.form_data || app, null, 2)}
                      </pre>
                    </div>

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
