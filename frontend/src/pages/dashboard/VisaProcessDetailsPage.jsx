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
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-1)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem', letterSpacing: '-0.02em' }}>
              Expediente #{process.id.toString().padStart(4, '0')}
              <span className={`badge ${isReady ? 'badge-success' : process.status === 'En Progreso' ? 'badge-warning' : 'badge-neutral'}`} style={{ fontSize: '0.75rem' }}>
                {isReady ? 'Listo' : process.status}
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

      {/* ── ANALYTICAL LAYOUT ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '2rem', alignItems: 'start' }} className="grid-2-tablet">
        
        {/* LEFT COLUMN: METADATA PANEL */}
        <div className="panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-1)', margin: 0, paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
            Detalles del Trámite
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Cliente Principal</label>
              <div style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-1)' }}>{process.client_email}</div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>País Destino</label>
              <div style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-1)' }}>{process.target_country}</div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Tipo de Grupo</label>
              <div style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-1)' }}>{process.group_type}</div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Propósito</label>
              <div style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-1)' }}>{process.purpose}</div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Fecha de Creación</label>
              <div style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-1)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={14} color="var(--text-3)" />
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
            <div className="panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-3)' }}>
              <File size={32} style={{ opacity: 0.3, margin: '0 auto 1rem auto' }} />
              <p>El cliente aún no ha proporcionado la información de los solicitantes.</p>
            </div>
          ) : (
            applicants.map((app, index) => (
              <div key={app.id} className="panel" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                  <div>
                    <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-1)' }}>
                      {app.full_name}
                    </h3>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-3)', fontWeight: 500 }}>
                      {index === 0 ? 'Titular Principal' : `Acompañante #${index}`}
                    </div>
                  </div>
                  <div className="badge badge-neutral">
                    Pasaporte: {app.passport_number}
                  </div>
                </div>

                {/* Documents Grid */}
                <div>
                  <h4 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Documentos Adjuntos</h4>
                  
                  {app.documents && app.documents.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                      {app.documents.map(doc => (
                        <div key={doc.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
                            <div style={{ background: 'var(--surface)', padding: '0.4rem', borderRadius: '6px', border: '1px solid var(--border)' }}>
                              <FileText size={16} color="var(--text-2)" />
                            </div>
                            <div style={{ overflow: 'hidden' }}>
                              <div style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {doc.document_type}
                              </div>
                            </div>
                          </div>
                          <a 
                            href={`${api.API_URL.replace('/api', '')}${doc.file_url}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="btn btn-icon btn-outline"
                            title="Descargar archivo"
                            style={{ padding: '0.4rem' }}
                          >
                            <Download size={14} />
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ padding: '1rem', background: 'var(--surface-2)', borderRadius: '8px', border: '1px dashed var(--border-2)', color: 'var(--text-3)', fontSize: '0.85rem', textAlign: 'center' }}>
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
