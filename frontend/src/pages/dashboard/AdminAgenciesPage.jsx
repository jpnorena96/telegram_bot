import React, { useState, useEffect } from 'react';
import { Shield, Check, X } from 'lucide-react';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

const AdminAgenciesPage = () => {
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAgencies = async () => {
    try {
      const res = await api.getAdminAgencies();
      setAgencies(res.agencies || []);
    } catch (e) {
      toast.error('Error al cargar agencias');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgencies();
  }, []);

  const handleStatus = async (id, status) => {
    try {
      await api.updateAdminAgencyStatus(id, status);
      toast.success(`Agencia ${status === 'approved' ? 'aprobada' : 'rechazada'}`);
      fetchAgencies();
    } catch (e) {
      toast.error('Error al actualizar estado');
    }
  };

  if (loading) return <div className="spinner" style={{ margin: '3rem auto' }} />;

  return (
    <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Shield size={24} style={{ color: 'var(--lime)' }} />
          Aprobación de Agencias
        </h1>
        <p style={{ color: 'var(--text-3)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          Administra las solicitudes de Marca Blanca de las Agencias de Viaje.
        </p>
      </div>

      <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>USUARIO (EMAIL)</th>
                <th>EMPRESA</th>
                <th>ALIAS</th>
                <th>COLOR</th>
                <th>ESTADO</th>
                <th>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {agencies.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-3)' }}>No hay agencias registradas</td></tr>
              ) : (
                agencies.map(a => (
                  <tr key={a.id}>
                    <td style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>{a.email}</td>
                    <td style={{ fontWeight: 600 }}>{a.company_name}</td>
                    <td style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>{a.alias}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: 16, height: 16, borderRadius: 4, background: a.brand_color }} />
                        <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>{a.brand_color}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`tag ${a.status === 'approved' ? 'success' : a.status === 'pending' ? 'warning' : 'danger'}`}>
                        {a.status.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      {a.status !== 'approved' && (
                        <button onClick={() => handleStatus(a.id, 'approved')} className="btn btn-icon btn-sm" style={{ color: '#10B981', marginRight: '0.5rem' }} title="Aprobar">
                          <Check size={14} />
                        </button>
                      )}
                      {a.status !== 'rejected' && (
                        <button onClick={() => handleStatus(a.id, 'rejected')} className="btn btn-icon btn-sm" style={{ color: '#F87171' }} title="Rechazar">
                          <X size={14} />
                        </button>
                      )}
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

export default AdminAgenciesPage;
