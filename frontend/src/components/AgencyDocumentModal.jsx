import React, { useState, useEffect } from 'react';
import { X, FileText, CheckCircle2, Loader2, Download } from 'lucide-react';
import { api } from '../services/api';
import toast from 'react-hot-toast';

const AgencyDocumentModal = ({ isOpen, onClose, processId, onStatusUpdate }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    if (isOpen && processId) {
      setLoading(true);
      api.getProcessDetails(processId)
        .then(res => setData(res))
        .catch(err => toast.error('Error cargando documentos'))
        .finally(() => setLoading(false));
    }
  }, [isOpen, processId]);

  if (!isOpen) return null;

  const handleMarkReady = async () => {
    setMarking(true);
    try {
      await api.markProcessReady(processId);
      toast.success('Expediente marcado como Listo para Alta');
      if (onStatusUpdate) onStatusUpdate();
      onClose();
    } catch (e) {
      toast.error('Error al actualizar estado');
    } finally {
      setMarking(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div className="animate-in" style={{ background: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--border)', width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'var(--text-3)', cursor: 'pointer' }}>
          <X size={20} />
        </button>
        
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileText style={{ color: 'var(--lime)' }} />
          Documentos del Cliente
        </h2>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-3)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <Loader2 className="animate-spin" size={32} />
            Cargando documentos...
          </div>
        ) : data ? (
          <div>
            <div style={{ marginBottom: '2rem', padding: '1rem', background: 'var(--bg)', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <span style={{ color: 'var(--text-3)', fontSize: '0.85rem' }}>Destino</span>
                  <div style={{ fontWeight: 600 }}>{data.process.target_country}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-3)', fontSize: '0.85rem' }}>Tipo de Visa</span>
                  <div style={{ fontWeight: 600 }}>{data.process.visa_category}</div>
                </div>
              </div>
            </div>

            {data.applicants.map((app) => (
              <div key={app.id} style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: '1.1rem', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {app.relationship === 'primary' ? 'Solicitante Principal' : 'Familiar'}
                  <span style={{ color: 'var(--text-3)', fontSize: '0.9rem', fontWeight: 400 }}>- {app.full_name || 'Sin nombre'}</span>
                </h3>
                
                {app.documents && app.documents.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                    {app.documents.map(doc => (
                      <div key={doc.id} style={{ padding: '0.75rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-2)' }}>{doc.document_type}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{doc.file_name}</div>
                        </div>
                        <a href={`${api.API_URL}/documents/download/${doc.id}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--lime)' }} title="Descargar">
                          <Download size={16} />
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-3)', fontStyle: 'italic' }}>No hay documentos cargados.</div>
                )}
              </div>
            ))}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
              <button onClick={onClose} className="btn btn-outline">Cerrar</button>
              <button 
                onClick={handleMarkReady} 
                disabled={marking || data.process.status === 'Listo para Alta'}
                className="btn btn-lime" 
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                {marking ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
                {data.process.status === 'Listo para Alta' ? 'Ya dado de alta' : 'Dar de Alta'}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#ef4444' }}>No se pudo cargar la información.</div>
        )}
      </div>
    </div>
  );
};

export default AgencyDocumentModal;
