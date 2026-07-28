import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Plus, Link as LinkIcon, Eye, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

const VisaProcessesPage = () => {
  const { t } = useTranslation();
  const [processes, setProcesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newEmail, setNewEmail] = useState('');

  const load = async () => {
    try {
      const res = await fetch(`${api.API_URL}/visa-processes`, { headers: api.getHeaders() });
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
      const res = await fetch(`${api.API_URL}/visa-processes`, {
        method: 'POST',
        headers: api.getHeaders(),
        body: JSON.stringify({ client_email: newEmail, target_country: 'Estados Unidos', visa_category: 'B1/B2' })
      });
      if (res.ok) {
        toast.success('Expediente creado');
        setNewEmail('');
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

  if (loading) return <div style={{ padding: '2rem' }}>Cargando...</div>;

  return (
    <div className="animate-in" style={{ padding: '1rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-1)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={24} style={{ color: 'var(--lime)' }} />
            Módulo de Trámite de Visa
          </h1>
          <p style={{ color: 'var(--text-3)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Gestiona los expedientes y genera links de marca blanca para tus clientes.
          </p>
        </div>
        <button onClick={() => setCreating(true)} className="btn btn-primary" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Plus size={16} /> Crear Expediente
        </button>
      </div>

      {creating && (
        <div className="panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem', fontWeight: 600 }}>Nuevo Expediente de Cliente</h3>
          <form onSubmit={handleCreate} style={{ display: 'flex', gap: '1rem' }}>
            <input 
              type="email" 
              required 
              placeholder="Correo electrónico del cliente" 
              value={newEmail} 
              onChange={e => setNewEmail(e.target.value)}
              style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-1)' }}
            />
            <button type="submit" className="btn btn-lime">Guardar</button>
            <button type="button" onClick={() => setCreating(false)} className="btn btn-outline">Cancelar</button>
          </form>
        </div>
      )}

      <div className="table-responsive panel">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Cliente (Email)</th>
              <th>Destino</th>
              <th>Estado</th>
              <th style={{ textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {processes.map(p => (
              <tr key={p.id}>
                <td>#{p.id}</td>
                <td>{p.client_email}</td>
                <td>{p.target_country} ({p.visa_category})</td>
                <td>
                  <span className={`tag ${p.status === 'Documentos Recibidos' ? 'tag-lime' : 'tag-gold'}`}>
                    {p.status}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button onClick={() => copyLink(p.id)} className="btn btn-icon btn-sm" title="Copiar Link para Cliente" style={{ marginRight: '0.5rem' }}>
                    <LinkIcon size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {processes.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-3)' }}>
                  No hay expedientes creados.
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
