import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, CheckCircle2, Loader2, Download, User, Globe, AlertCircle, Trash2, Paperclip } from 'lucide-react';
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
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', color: 'var(--text-3)', gap: '1rem' }}>
        <Loader2 className="animate-spin" size={36} color="var(--lime)" />
        <span className="typewriter-text" style={{ fontSize: '1.1rem', fontWeight: 500 }}>Buscando expediente en archivo...</span>
      </div>
    );
  }

  if (!data || !data.process) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-3)' }}>
        <AlertCircle size={48} style={{ margin: '0 auto 1rem auto', opacity: 0.5 }} />
        <h2 style={{ fontSize: '1.25rem' }}>Expediente no encontrado</h2>
        <button onClick={() => navigate('/dashboard/visa-processes')} className="btn btn-outline" style={{ marginTop: '1rem' }}>Volver al archivador</button>
      </div>
    );
  }

  const { process, applicants } = data;
  const isReady = process.status === 'Listo para Alta';

  let stampClass = 'stamp-blue';
  if (isReady) stampClass = 'stamp-green';
  if (process.status === 'En Progreso') stampClass = 'stamp-red';

  return (
    <div className="animate-in" style={{ padding: '0', maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
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
            <h1 className="typewriter-text" style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-1)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              EXP-{process.id.toString().padStart(4, '0')}
            </h1>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button 
            onClick={() => window.open(`/client-portal/${process.id}`, '_blank')}
            className="btn btn-outline"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--surface)' }}
            title="Abrir Portal Público"
          >
            <Globe size={18} /> Ver Enlace
          </button>
          <button 
            onClick={handleDelete}
            className="btn btn-outline"
            style={{ color: '#ef4444', borderColor: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--surface)' }}
            title="Eliminar Expediente"
          >
            <Trash2 size={18} /> Eliminar
          </button>
        </div>
      </div>

      {/* ── OPEN FOLDER LAYOUT ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', alignItems: 'start' }}>
        
        {/* LEFT COLUMN: FOLDER FLAP / CLIPBOARD */}
        <div style={{ 
          background: 'var(--surface)', 
          border: '1px solid var(--border)', 
          borderRadius: '12px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.05), inset -20px 0 20px rgba(0,0,0,0.01)',
          padding: '2rem',
          position: 'relative',
          minHeight: '600px'
        }}>
          {/* Metal Clip graphic */}
          <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', width: '100px', height: '25px', background: 'linear-gradient(to bottom, #d4d4d8, #a1a1aa)', borderRadius: '4px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}></div>
          
          <div style={{ marginTop: '2rem' }}>
            <div style={{ borderBottom: '2px solid var(--text-1)', paddingBottom: '1rem', marginBottom: '2rem' }}>
              <h2 className="typewriter-text" style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>HOJA DE RUTA</h2>
              <p className="typewriter-text" style={{ fontSize: '0.85rem', color: 'var(--text-3)', margin: '0.25rem 0 0 0' }}>Uso exclusivo interno</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <p className="typewriter-text" style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-3)', letterSpacing: '0.1em' }}>CLIENTE ASIGNADO</p>
                <p style={{ margin: 0, fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-1)', wordBreak: 'break-all' }}>{process.client_email}</p>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.02)', border: '1px solid var(--border)', padding: '1rem', borderRadius: '4px' }}>
                <div style={{ marginBottom: '1rem' }}>
                  <p className="typewriter-text" style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-3)', letterSpacing: '0.1em' }}>PAÍS DESTINO</p>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-1)' }}>{process.target_country}</p>
                </div>
                
                <div style={{ marginBottom: '1rem' }}>
                  <p className="typewriter-text" style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-3)', letterSpacing: '0.1em' }}>CLASE DE VISA</p>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-1)' }}>{process.visa_category}</p>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <p className="typewriter-text" style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-3)', letterSpacing: '0.1em' }}>PROPÓSITO</p>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-1)' }}>{process.purpose || 'No especificado'}</p>
                </div>

                <div>
                  <p className="typewriter-text" style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-3)', letterSpacing: '0.1em' }}>GRUPO</p>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-1)' }}>{process.group_type || 'Individual'}</p>
                </div>
              </div>

              {/* Stamp Area */}
              <div style={{ marginTop: '3rem', textAlign: 'center', height: '120px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px dashed var(--border)', borderRadius: '8px' }}>
                <p className="typewriter-text" style={{ fontSize: '0.7rem', color: 'var(--text-3)', marginBottom: '1rem', opacity: 0.5 }}>ESPACIO PARA SELLO OFICIAL</p>
                <div className={`rubber-stamp ${stampClass}`} style={{ transform: 'rotate(-10deg)', opacity: 0.9, fontSize: '1.5rem', padding: '0.5rem 1rem' }}>
                  {process.status}
                </div>
              </div>

              <div style={{ marginTop: '1rem' }}>
                <button 
                  onClick={handleMarkReady} 
                  disabled={marking || isReady}
                  className="btn btn-lime"
                  style={{ width: '100%', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1rem', boxShadow: 'none' }}
                >
                  {marking ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={20} />}
                  {isReady ? 'ALTA CONFIRMADA' : 'SELLAR COMO LISTO'}
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: STACKED PAPERS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
          
          {applicants.length === 0 ? (
             <div className="dossier-paper" style={{ textAlign: 'center', color: 'var(--text-3)', padding: '4rem 2rem' }}>
                <div className="typewriter-text">El cliente aún no ha adjuntado documentos al expediente.</div>
             </div>
          ) : (
            applicants.map((app, index) => (
              <div key={app.id} className="dossier-paper" style={{ transform: `rotate(${index % 2 === 0 ? '-1deg' : '1.5deg'})` }}>
                <div className="paper-clip"></div>
                
                <div style={{ borderBottom: '1px solid var(--border-2)', paddingBottom: '1rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 className="typewriter-text" style={{ fontSize: '1.5rem', margin: '0 0 0.25rem 0', fontWeight: 800, color: '#18181b', textTransform: 'uppercase' }}>
                      {app.full_name || 'SIN NOMBRE'}
                    </h3>
                    <div className="typewriter-text" style={{ fontSize: '0.85rem', color: '#52525b' }}>
                      {app.relationship === 'primary' ? 'TITULAR PRINCIPAL' : 'DEPENDIENTE / FAMILIAR'}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="typewriter-text" style={{ fontSize: '0.75rem', color: '#71717a' }}>Nº PASAPORTE</div>
                    <div className="typewriter-text" style={{ fontSize: '1.25rem', fontWeight: 700, color: '#18181b' }}>{app.passport_number || 'N/A'}</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="typewriter-text" style={{ fontSize: '0.9rem', fontWeight: 700, color: '#27272a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Paperclip size={16} /> ADJUNTOS
                  </h4>
                  
                  {app.documents && app.documents.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                      {app.documents.map(doc => (
                        <div key={doc.id} style={{ border: '1px solid var(--border-2)', borderRadius: '4px', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.02)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '4px', background: '#e4e4e7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <FileText size={16} color="#52525b" />
                            </div>
                            <div style={{ overflow: 'hidden' }}>
                              <p className="typewriter-text" style={{ margin: 0, fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                                {doc.doc_type}
                              </p>
                              <p className="typewriter-text" style={{ margin: 0, fontSize: '0.7rem', color: '#71717a' }}>{doc.file_url.split('.').pop().toUpperCase()}</p>
                            </div>
                          </div>
                          
                          <a 
                            href={doc.file_url.startsWith('http') ? doc.file_url : `${api.API_URL.replace('/api', '')}${doc.file_url}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="btn btn-sm" 
                            style={{ background: '#fff', border: '1px solid #d4d4d8', padding: '0.4rem', color: '#27272a', borderRadius: '4px' }}
                            title="Descargar Documento"
                          >
                            <Download size={14} />
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="typewriter-text" style={{ fontSize: '0.85rem', color: '#71717a', fontStyle: 'italic' }}>
                      -- Sin documentos adjuntos --
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
