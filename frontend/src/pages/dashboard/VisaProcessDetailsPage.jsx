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
    <div className="letterhead-wrapper animate-in">
      <div className="official-paper-sheet">
        <div className="official-paper-content">
          
          {/* Header & Title */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3rem' }}>
            <div>
              <button onClick={() => navigate('/dashboard/visa-processes')} className="btn btn-outline btn-sm" style={{ marginBottom: '1.5rem', color: '#4B5563', borderColor: '#D1D5DB' }}>
                <ArrowLeft size={14} /> Volver
              </button>
              <h1 className="official-title" style={{ margin: 0, textAlign: 'left', borderBottom: 'none', paddingBottom: 0 }}>
                Expediente N° {process.id.toString().padStart(4, '0')}
              </h1>
              <p style={{ color: '#6B7280', fontSize: '0.9rem', marginTop: '0.5rem', fontFamily: 'var(--font-mono)' }}>
                FECHA DE CREACIÓN: {new Date(process.created_at).toLocaleDateString()}
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => window.open(`/client-portal/${process.id}`, '_blank')} className="btn btn-outline btn-sm" style={{ borderColor: '#E5E7EB', color: '#4B5563' }} title="Portal Público">
                <Globe size={14} />
              </button>
              <button onClick={handleDelete} className="btn btn-outline btn-sm" style={{ color: '#DC2626', borderColor: '#FCA5A5' }} title="Eliminar Expediente">
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          {/* THE REALISTIC STAMP */}
          <div className={`realistic-stamp ${isReady ? 'stamp-success' : process.status === 'En Progreso' ? 'stamp-warning' : 'stamp-neutral'}`}>
            {isReady ? 'LISTO' : process.status}
          </div>

          {/* Meta Data Table */}
          <table className="official-table">
            <tbody>
              <tr>
                <th>Cliente Titular</th>
                <td>{process.client_email}</td>
              </tr>
              <tr>
                <th>País de Destino</th>
                <td>{process.target_country}</td>
              </tr>
              <tr>
                <th>Tipo de Trámite</th>
                <td>{process.group_type} - {process.purpose}</td>
              </tr>
              <tr>
                <th>Última Actualización</th>
                <td>{new Date(process.updated_at).toLocaleString()}</td>
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
                Imponer Sello de "Listo"
              </button>
            </div>
          )}

          <hr className="official-divider" />

          {/* APPLICANTS SECTION */}
          <h2 style={{ fontFamily: 'Times New Roman, serif', fontSize: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#111827', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={18} /> Relación de Solicitantes ({applicants.length})
          </h2>

          {applicants.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#9CA3AF', fontStyle: 'italic', border: '1px dashed #D1D5DB' }}>
              No se han anexado solicitantes a este expediente.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {applicants.map((app, index) => (
                <div key={app.id} style={{ padding: '1.5rem', background: '#F9FAFB', border: '1px solid #E5E7EB', position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', borderBottom: '1px solid #D1D5DB', paddingBottom: '0.75rem' }}>
                    <div>
                      <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.1rem', fontWeight: 700, color: '#111827', textTransform: 'uppercase' }}>
                        {app.full_name}
                      </h3>
                      <div style={{ fontSize: '0.75rem', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {index === 0 ? 'Titular Principal' : `Acompañante #${index}`}
                      </div>
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', background: '#F3F4F6', padding: '0.25rem 0.5rem', border: '1px solid #D1D5DB', color: '#111827' }}>
                      PST: {app.passport_number}
                    </div>
                  </div>

                  {/* Documents List */}
                  <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>Anexos Documentales</h4>
                  
                  {app.documents && app.documents.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
                      {app.documents.map(doc => (
                        <div key={doc.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: '#FFFFFF', border: '1px solid #D1D5DB' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
                            <FileText size={16} color="#6B7280" />
                            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {doc.document_type}
                            </div>
                          </div>
                          <a 
                            href={`${api.API_URL.replace('/api', '')}${doc.file_url}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="btn btn-icon btn-sm"
                            style={{ background: '#F3F4F6', border: 'none', color: '#111827' }}
                            title="Descargar"
                          >
                            <Download size={12} />
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ padding: '1rem', background: '#FFFFFF', border: '1px dotted #D1D5DB', color: '#9CA3AF', fontSize: '0.8rem', fontStyle: 'italic' }}>
                      Sin anexos presentados.
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default VisaProcessDetailsPage;
