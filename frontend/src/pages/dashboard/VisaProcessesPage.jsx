import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Plus, Link as LinkIcon, Eye, CheckCircle2, Search, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

const VisaProcessesPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [processes, setProcesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

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
        body: JSON.stringify({ client_email: newEmail, target_country: 'Estados Unidos', visa_category: 'B1/B2' })
      });
      if (res.ok) {
        toast.success('Expediente creado con éxito');
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

  const filteredProcesses = useMemo(() => {
    if (!searchQuery.trim()) return processes;
    const lowerQuery = searchQuery.toLowerCase();
    return processes.filter(p => 
      p.client_email?.toLowerCase().includes(lowerQuery) || 
      p.id.toString().includes(lowerQuery) ||
      p.status?.toLowerCase().includes(lowerQuery)
    );
  }, [processes, searchQuery]);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', color: 'var(--text-3)' }}>
      <div className="animate-spin" style={{ width: '32px', height: '32px', border: '3px solid var(--border)', borderTopColor: 'var(--lime)', borderRadius: '50%', marginRight: '1rem' }} />
      <span style={{ fontSize: '1.1rem', fontWeight: 500 }}>Cargando expedientes...</span>
    </div>
  );

  return (
    <div className="animate-in" style={{ padding: '0', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--text-1)', display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '0 0 0.5rem 0' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(163, 230, 53, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={22} style={{ color: 'var(--lime)' }} />
            </div>
            Gestión de Expedientes
          </h1>
          <p style={{ color: 'var(--text-3)', fontSize: '0.95rem', margin: 0 }}>
            Visualiza y administra todos los procesos documentales de tus clientes.
          </p>
        </div>
        <button onClick={() => setCreating(true)} className="btn btn-lime" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', padding: '0.75rem 1.25rem', fontSize: '0.95rem', fontWeight: 600 }}>
          <Plus size={18} /> Crear Nuevo Expediente
        </button>
      </div>

      {/* ── Creation Panel ── */}
      {creating && (
        <div className="panel animate-in" style={{ padding: '1.5rem', marginBottom: '2rem', border: '1px solid var(--lime)', boxShadow: '0 8px 32px rgba(163, 230, 53, 0.05)' }}>
          <h3 style={{ marginBottom: '1rem', fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-1)' }}>Nuevo Expediente (Marca Blanca)</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-3)', marginBottom: '1.25rem' }}>
            Ingresa el correo electrónico del cliente. Le proporcionaremos un portal dedicado para que cargue sus documentos (DS-160 y Pasaporte).
          </p>
          <form onSubmit={handleCreate} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 300px', position: 'relative' }}>
              <input 
                type="email" 
                required 
                placeholder="ejemplo@cliente.com" 
                value={newEmail} 
                onChange={e => setNewEmail(e.target.value)}
                style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-1)', fontSize: '0.95rem', outline: 'none', transition: 'all 0.2s' }}
                onFocus={e => e.target.style.borderColor = 'var(--lime)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
            <button type="submit" className="btn btn-lime" style={{ padding: '0.85rem 1.5rem', fontWeight: 600 }}>Generar Expediente</button>
            <button type="button" onClick={() => setCreating(false)} className="btn btn-outline" style={{ padding: '0.85rem 1.5rem' }}>Cancelar</button>
          </form>
        </div>
      )}

      {/* ── Search Bar ── */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.5rem 1rem', width: '100%', maxWidth: '400px' }}>
        <Search size={18} color="var(--text-3)" style={{ marginRight: '0.75rem' }} />
        <input 
          type="text" 
          placeholder="Buscar por ID, correo o estado..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ border: 'none', background: 'transparent', outline: 'none', color: 'var(--text-1)', fontSize: '0.9rem', width: '100%' }}
        />
      </div>

      {/* ── Table ── */}
      <div className="table-responsive panel" style={{ borderRadius: '12px', overflow: 'hidden' }}>
        <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: 'var(--bg)' }}>
            <tr>
              <th style={{ padding: '1.25rem 1rem', fontSize: '0.85rem', color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>ID Expediente</th>
              <th style={{ padding: '1.25rem 1rem', fontSize: '0.85rem', color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cliente</th>
              <th style={{ padding: '1.25rem 1rem', fontSize: '0.85rem', color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Trámite</th>
              <th style={{ padding: '1.25rem 1rem', fontSize: '0.85rem', color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Estado Actual</th>
              <th style={{ padding: '1.25rem 1rem', fontSize: '0.85rem', color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredProcesses.map(p => (
              <tr key={p.id} style={{ borderTop: '1px solid var(--border)', transition: 'background 0.2s', cursor: 'default' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '1rem', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>#{p.id}</td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-2)', fontSize: '0.85rem', fontWeight: 600 }}>
                      {(p.client_email || 'U').charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontWeight: 500, color: 'var(--text-1)' }}>{p.client_email || 'Sin correo asignado'}</span>
                  </div>
                </td>
                <td style={{ padding: '1rem', color: 'var(--text-2)', fontSize: '0.95rem' }}>
                  {p.target_country} <span style={{ opacity: 0.5 }}>({p.visa_category})</span>
                </td>
                <td style={{ padding: '1rem' }}>
                  <span className={`tag ${p.status === 'Documentos Recibidos' ? 'tag-lime' : p.status === 'Listo para Alta' ? 'tag-gold' : 'tag-neutral'}`} style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}>
                    {p.status === 'Listo para Alta' && <CheckCircle2 size={14} style={{ marginRight: '0.25rem', display: 'inline-block', verticalAlign: 'text-bottom' }} />}
                    {p.status}
                  </span>
                </td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                    <button 
                      onClick={() => copyLink(p.id)} 
                      className="btn btn-sm" 
                      title="Copiar Link Seguro para Cliente" 
                      style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-1)', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.75rem', borderRadius: '6px', border: 'none', cursor: 'pointer', transition: 'background 0.2s' }}
                      onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                      onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    >
                      <LinkIcon size={14} /> Enlace
                    </button>
                    <button 
                      onClick={() => navigate(`/dashboard/visa-processes/${p.id}`)} 
                      className="btn btn-sm btn-lime" 
                      title="Abrir Expediente Completo" 
                      style={{ padding: '0.4rem 0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                    >
                      <Eye size={14} /> Revisar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredProcesses.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-3)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                    <Search size={32} style={{ opacity: 0.5 }} />
                    <span style={{ fontSize: '1rem' }}>
                      {searchQuery ? 'No se encontraron expedientes que coincidan con la búsqueda.' : 'No hay expedientes creados.'}
                    </span>
                  </div>
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
