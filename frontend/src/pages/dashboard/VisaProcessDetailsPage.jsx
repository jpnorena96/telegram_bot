import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, CheckCircle2, Loader2, Download, User, Globe, AlertCircle, Trash2, Calendar, File } from 'lucide-react';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

const VisaProcessDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

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
      toast.success('Expediente marcado como Listo para Alta');
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
        <span style={{ fontSize: '1rem', fontWeight: 500, marginLeft: '0.75rem' }}>Cargando expediente...</span>
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
  const isReady = process.status === 'Listo para Alta';

  return (
    <div className="animate-in" style={{ padding: '0', maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <button 
            onClick={() => navigate('/dashboard/visa-processes')}
            className="btn btn-icon btn-outline"
            title="Volver"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="dossier-title" style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '1rem' }}>
              Expediente #{process.id.toString().padStart(4, '0')}
              <span className={`dossier-stamp ${isReady ? 'stamp-success' : process.status === 'En Progreso' ? 'stamp-warning' : 'stamp-neutral'}`} style={{ fontSize: '0.7rem' }}>
                {isReady ? 'LISTO' : process.status}
              </span>
            </h1>
            <p style={{ color: 'var(--text-3)', fontSize: '0.9rem', margin: '0.25rem 0 0 0' }}>
              Última actualización: {new Date(process.updated_at).toLocaleString()}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button 
            onClick={() => window.open(`/client-portal/${process.id}`, '_blank')}
            className="btn btn-outline"
            title="Abrir Portal Público"
          >
            <Globe size={16} /> Enlace del Cliente
          </button>
          <button 
            onClick={handleDelete}
            className="btn btn-outline"
            style={{ color: 'var(--red)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
            title="Eliminar Expediente"
          >
            <Trash2 size={16} /> Eliminar
          </button>
        </div>
      </div>

      {/* ── DOSSIER LAYOUT ── */}
      <div className="grid-2-tablet dossier-desk">
        
        {/* LEFT COLUMN: FOLDER TAB / CLIPBOARD */}
        <div className="dossier-folder-tab" style={{ padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h2 className="dossier-title" style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, paddingBottom: '1rem', borderBottom: '2px solid rgba(0,0,0,0.1)' }}>
            Detalles del Trámite
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.1rem' }}>Cliente Principal</label>
              <div style={{ fontSize: '0.95rem', fontWeight: 500, color: '#111827', borderBottom: '1px dotted #D1D5DB', paddingBottom: '0.25rem' }}>{process.client_email}</div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.1rem' }}>País Destino</label>
              <div style={{ fontSize: '0.95rem', fontWeight: 500, color: '#111827', borderBottom: '1px dotted #D1D5DB', paddingBottom: '0.25rem' }}>{process.target_country}</div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.1rem' }}>Tipo de Grupo</label>
              <div style={{ fontSize: '0.95rem', fontWeight: 500, color: '#111827', borderBottom: '1px dotted #D1D5DB', paddingBottom: '0.25rem' }}>{process.group_type}</div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.1rem' }}>Propósito</label>
              <div style={{ fontSize: '0.95rem', fontWeight: 500, color: '#111827', borderBottom: '1px dotted #D1D5DB', paddingBottom: '0.25rem' }}>{process.purpose}</div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.1rem' }}>Fecha de Creación</label>
              <div style={{ fontSize: '0.95rem', fontWeight: 500, color: '#111827', borderBottom: '1px dotted #D1D5DB', paddingBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={14} color="#6B7280" />
                {new Date(process.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>

          {!isReady && (
            <div style={{ marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
              <button 
                onClick={handleMarkReady} 
                disabled={marking}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.75rem' }}
              >
                {marking ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                Marcar Listo para Alta
              </button>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: APPLICANTS & DOCUMENTS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-1)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={20} color="var(--text-2)" /> Solicitantes ({applicants.length})
            </h2>
          </div>

          {applicants.length === 0 ? (
            <div className="dossier-paper" style={{ textAlign: 'center', color: '#9CA3AF' }}>
              <File size={32} style={{ opacity: 0.3, margin: '0 auto 1rem auto' }} />
              <p>El cliente aún no ha proporcionado la información de los solicitantes.</p>
            </div>
          ) : (
            applicants.map((app, index) => (
              <div key={app.id} className="dossier-paper">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', borderBottom: '1px solid #E5E7EB', paddingBottom: '1rem' }}>
                  <div>
                    <h3 className="dossier-title" style={{ margin: '0 0 0.25rem 0', fontSize: '1.25rem', fontWeight: 700 }}>
                      {app.full_name}
                    </h3>
                    <div style={{ fontSize: '0.75rem', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                      {index === 0 ? 'Titular Principal' : `Acompañante #${index}`}
                    </div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', background: '#F3F4F6', padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid #E5E7EB', color: '#374151' }}>
                    Pasaporte: {app.passport_number}
                  </div>
                </div>

                {/* Documents Grid */}
                <div>
                  <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>Documentos Adjuntos</h4>
                  
                  {app.documents && app.documents.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.25rem' }}>
                      {app.documents.map(doc => (
                        <div key={doc.id} className="dossier-attachment">
                          <div className="dossier-clip"></div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
                              <div style={{ color: '#64748B' }}>
                                <FileText size={18} />
                              </div>
                              <div style={{ overflow: 'hidden' }}>
                                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {doc.document_type}
                                </div>
                              </div>
                            </div>
                            <a 
                              href={`${api.API_URL.replace('/api', '')}${doc.file_url}`} 
                              target="_blank" 
                              rel="noreferrer"
                              className="btn btn-icon btn-sm"
                              style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '0.3rem', color: '#0F172A' }}
                              title="Descargar archivo"
                            >
                              <Download size={14} />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ padding: '1.5rem', background: '#F9FAFB', border: '1px dashed #D1D5DB', borderRadius: '4px', color: '#9CA3AF', fontSize: '0.85rem', textAlign: 'center', fontStyle: 'italic' }}>
                      Sin documentos cargados.
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default VisaProcessDetailsPage;
