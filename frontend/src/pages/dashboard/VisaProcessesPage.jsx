import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Plus, Search, ArrowRight, Trash2, Link as LinkIcon, Eye, CheckCircle2, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

const VisaProcessesPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [processes, setProcesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [newEmail, setNewEmail] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('Estados Unidos');
  const [selectedGroup, setSelectedGroup] = useState('Individual');
  const [selectedPurpose, setSelectedPurpose] = useState('Turismo / Negocios');
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
        body: JSON.stringify({ 
          client_email: newEmail, 
          target_country: selectedCountry, 
          group_type: selectedGroup,
          purpose: selectedPurpose 
        })
      });
      if (res.ok) {
        toast.success('Expediente creado con éxito');
        setNewEmail('');
        setWizardStep(1);
        setCreating(false);
        load();
      } else {
        const error = await res.json();
        toast.error(error.detail || 'Error al crear expediente');
      }
    } catch (e) {
      toast.error('Error de red');
    }
  };

  const handleDelete = async (id) => {
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
        load();
      } else {
        const error = await res.json();
        toast.error(error.detail || 'Error al eliminar');
      }
    } catch (e) {
      toast.error('Error de red');
    }
  };

  const copyLink = (id) => {
    const link = `${window.location.origin}/client-portal/${id}`;
    navigator.clipboard.writeText(link);
    toast.success('Link copiado al portapapeles');
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
      <div className="spinner"></div>
      <span style={{ fontSize: '1rem', fontWeight: 500, marginLeft: '0.75rem' }}>Cargando expedientes...</span>
    </div>
  );

  return (
    <div className="animate-in" style={{ padding: '0', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-1)', display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '0 0 0.5rem 0', letterSpacing: '-0.02em' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={20} style={{ color: 'var(--text-1)' }} />
            </div>
            Gestión de Expedientes
          </h1>
          <p style={{ color: 'var(--text-3)', fontSize: '0.95rem', margin: 0 }}>
            Visualiza y administra todos los procesos documentales de tus clientes.
          </p>
        </div>
        <button onClick={() => setCreating(true)} className="btn btn-primary">
          <Plus size={18} /> Nuevo Expediente
        </button>
      </div>

      {/* ── Creation Wizard Panel ── */}
      {creating && (
        <div className="panel animate-in" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h3 style={{ margin: 0, fontWeight: 600, fontSize: '1.1rem', color: 'var(--text-1)' }}>Nuevo Expediente de Trámite</h3>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: wizardStep >= 1 ? 'var(--text-1)' : 'var(--border)' }}></div>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: wizardStep >= 2 ? 'var(--text-1)' : 'var(--border)' }}></div>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: wizardStep >= 3 ? 'var(--text-1)' : 'var(--border)' }}></div>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: wizardStep >= 4 ? 'var(--text-1)' : 'var(--border)' }}></div>
            </div>
          </div>

          {/* (Wizard content simplified for brevity but functional) */}
          {wizardStep === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4">
              <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-1)' }}>Paso 1: Destino</h4>
              <select 
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="input-field"
                style={{ marginBottom: '1.5rem' }}
              >
                <option value="Estados Unidos">Estados Unidos</option>
                <option value="Canadá">Canadá</option>
                <option value="Reino Unido">Reino Unido</option>
                <option value="Schengen (Europa)">Schengen (Europa)</option>
                <option value="Australia">Australia</option>
              </select>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" onClick={() => setCreating(false)} className="btn btn-outline">Cancelar</button>
                <button type="button" onClick={() => setWizardStep(2)} className="btn btn-primary">Siguiente <ArrowRight size={16} /></button>
              </div>
            </div>
          )}

          {wizardStep === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4">
              <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-1)' }}>Paso 2: Agrupación</h4>
              <select value={selectedGroup} onChange={(e) => setSelectedGroup(e.target.value)} className="input-field" style={{ marginBottom: '1.5rem' }}>
                <option value="Individual">Individual</option>
                <option value="Familiar">Familiar</option>
                <option value="Grupal">Grupal</option>
                <option value="Corporativa / De Trabajo">Corporativa / De Trabajo</option>
              </select>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" onClick={() => setWizardStep(1)} className="btn btn-outline">Atrás</button>
                <button type="button" onClick={() => setWizardStep(3)} className="btn btn-primary">Siguiente <ArrowRight size={16} /></button>
              </div>
            </div>
          )}

          {wizardStep === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4">
              <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-1)' }}>Paso 3: Propósito</h4>
              <select value={selectedPurpose} onChange={(e) => setSelectedPurpose(e.target.value)} className="input-field" style={{ marginBottom: '1.5rem' }}>
                <option value="Turismo / Negocios">Turismo / Negocios (B1/B2)</option>
                <option value="Estudiante">Estudiante (F, M)</option>
                <option value="Trabajo Temporal">Trabajo Temporal (H, L, O, P, Q)</option>
                <option value="Visitante de Intercambio">Visitante de Intercambio (J)</option>
                <option value="Tránsito / Tripulación">Tránsito / Tripulación (C, D)</option>
              </select>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" onClick={() => setWizardStep(2)} className="btn btn-outline">Atrás</button>
                <button type="button" onClick={() => setWizardStep(4)} className="btn btn-primary">Siguiente <ArrowRight size={16} /></button>
              </div>
            </div>
          )}

          {wizardStep === 4 && (
            <form onSubmit={handleCreate} className="animate-in fade-in slide-in-from-right-4">
              <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-1)' }}>Paso 4: Contacto del Cliente</h4>
              <input 
                type="email" 
                required 
                placeholder="correo@cliente.com" 
                value={newEmail} 
                onChange={(e) => setNewEmail(e.target.value)} 
                className="input-field"
                style={{ marginBottom: '1.5rem' }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" onClick={() => setWizardStep(3)} className="btn btn-outline">Atrás</button>
                <button type="submit" className="btn btn-primary"><CheckCircle2 size={16} /> Crear Expediente</button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* ── Search Bar ── */}
      <div style={{ marginBottom: '1.5rem', position: 'relative', maxWidth: '400px' }}>
        <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
        <input 
          type="text" 
          placeholder="Buscar por email o ID..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input-field"
          style={{ paddingLeft: '2.75rem' }}
        />
      </div>

      {/* ── Data Table ── */}
      <div className="panel" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Cliente / Email</th>
                <th>Destino & Tipo</th>
                <th>Estado</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredProcesses.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-3)' }}>
                    No se encontraron expedientes.
                  </td>
                </tr>
              ) : (
                filteredProcesses.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 500 }}>#{p.id.toString().padStart(4, '0')}</td>
                    <td>
                      <div style={{ fontWeight: 500, color: 'var(--text-1)' }}>{p.client_email}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginTop: '0.25rem' }}>Creado: {new Date(p.created_at).toLocaleDateString()}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 500 }}>{p.target_country}</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginTop: '0.25rem' }}>{p.group_type} • {p.purpose}</div>
                    </td>
                    <td>
                      <span className={`badge ${
                        p.status === 'En_Progreso' ? 'badge-warning' : 
                        p.status === 'Completado' ? 'badge-success' : 'badge-neutral'
                      }`}>
                        {p.status === 'En_Progreso' ? 'En Progreso' : p.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button onClick={() => copyLink(p.id)} className="btn btn-icon btn-outline" title="Copiar enlace seguro">
                          <LinkIcon size={16} />
                        </button>
                        <button onClick={() => navigate(`/dashboard/visa-processes/${p.id}`)} className="btn btn-icon btn-outline" title="Ver detalles">
                          <ChevronRight size={16} />
                        </button>
                        <button onClick={() => handleDelete(p.id)} className="btn btn-icon btn-outline" style={{ color: 'var(--red)' }} title="Eliminar">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default VisaProcessesPage;
