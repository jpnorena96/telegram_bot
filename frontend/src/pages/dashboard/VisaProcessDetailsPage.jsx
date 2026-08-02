import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, CheckCircle2, Loader2, Download, User, Globe, AlertCircle } from 'lucide-react';
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
      loadData(); // Reload to reflect changes
    } catch (e) {
      toast.error('Error al actualizar estado');
    } finally {
      setMarking(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', color: 'var(--text-3)', gap: '1rem' }}>
        <Loader2 className="animate-spin" size={36} color="var(--lime)" />
        <span style={{ fontSize: '1.1rem', fontWeight: 500 }}>Cargando expediente #{id}...</span>
      </div>
    );
  }

  if (!data || !data.process) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-3)' }}>
        <AlertCircle size={48} style={{ margin: '0 auto 1rem auto', opacity: 0.5 }} />
        <h2 style={{ fontSize: '1.25rem' }}>Expediente no encontrado</h2>
        <button onClick={() => navigate('/dashboard/visa-processes')} className="btn btn-outline" style={{ marginTop: '1rem' }}>Volver al listado</button>
      </div>
    );
  }

  const { process, applicants } = data;
  const isReady = process.status === 'Listo para Alta';

  return (
    <div className="animate-in" style={{ padding: '0', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            onClick={() => navigate('/dashboard/visa-processes')}
            className="btn btn-icon"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            title="Volver"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-1)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Expediente #{process.id}
            </h1>
            <p style={{ color: 'var(--text-3)', margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>
              Cliente: <span style={{ color: 'var(--text-1)', fontWeight: 500 }}>{process.client_email}</span>
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span className={`tag ${isReady ? 'tag-gold' : 'tag-lime'}`} style={{ fontSize: '0.95rem', padding: '0.5rem 1rem' }}>
            {process.status}
          </span>
          <button 
            onClick={handleMarkReady} 
            disabled={marking || isReady}
            className={`btn ${isReady ? 'btn-outline' : 'btn-lime'}`}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            {marking ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={18} />}
            {isReady ? 'Alta Realizada' : 'Marcar Listo para Alta'}
          </button>
        </div>
      </div>

      {/* ── Process Details Card ── */}
      <div className="panel" style={{ padding: '1.5rem', background: 'var(--surface-2)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Globe size={20} color="#3B82F6" />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-3)' }}>País Destino</p>
              <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-1)' }}>{process.target_country}</p>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-3)' }}>Propósito del Viaje</p>
              <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-1)' }}>{process.purpose || process.visa_category}</p>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-3)' }}>Tipo de Agrupación</p>
              <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-1)' }}>{process.group_type || 'Individual'}</p>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(163, 230, 53, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={20} color="var(--lime)" />
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-3)', fontWeight: 500 }}>Categoría de Visa</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-1)' }}>{process.visa_category}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Applicants Section ── */}
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-1)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <User size={20} style={{ color: 'var(--lime)' }} />
          Solicitantes y Documentos
        </h2>

        {applicants.length === 0 ? (
           <div className="panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-3)' }}>
              Aún no se han registrado solicitantes en este expediente.
           </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {applicants.map(app => (
              <div key={app.id} className="panel" style={{ overflow: 'hidden' }}>
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', margin: '0 0 0.25rem 0', fontWeight: 600, color: 'var(--text-1)' }}>
                      {app.full_name || 'Sin nombre'}
                    </h3>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-3)' }}>
                      {app.relationship === 'primary' ? 'Solicitante Principal' : 'Familiar / Acompañante'} • Pasaporte: {app.passport_number || 'N/A'}
                    </div>
                  </div>
                </div>
                
                <div style={{ padding: '1.5rem' }}>
                  {app.documents && app.documents.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                      {app.documents.map(doc => (
                        <div key={doc.id} style={{ 
                          padding: '1rem', background: 'var(--bg)', border: '1px solid var(--border)', 
                          borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          transition: 'border-color 0.2s'
                        }}
                        onMouseOver={e => e.currentTarget.style.borderColor = 'var(--lime-subtle)'}
                        onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border)'}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <FileText size={18} color="var(--text-2)" />
                            </div>
                            <div>
                              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-1)' }}>{doc.document_type}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {doc.file_name}
                              </div>
                            </div>
                          </div>
                          <a 
                            href={`${api.url}/documents/download/${doc.id}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            style={{ 
                              width: '36px', height: '36px', borderRadius: '8px', background: 'var(--lime-subtle)', 
                              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--lime)',
                              textDecoration: 'none', transition: 'all 0.2s'
                            }}
                            onMouseOver={e => { e.currentTarget.style.background = 'var(--lime)'; e.currentTarget.style.color = '#000'; }}
                            onMouseOut={e => { e.currentTarget.style.background = 'var(--lime-subtle)'; e.currentTarget.style.color = 'var(--lime)'; }}
                            title="Descargar Documento"
                          >
                            <Download size={18} />
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.95rem', color: 'var(--text-3)', padding: '1rem 0' }}>
                      El solicitante aún no ha cargado sus documentos.
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default VisaProcessDetailsPage;
