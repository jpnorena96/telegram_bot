import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import { Download, Users, Calendar, DollarSign, ShieldAlert, CheckCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminPage = () => {
  const { t } = useTranslation();
  const [summary, setSummary] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sumData, usersData] = await Promise.all([
        api.getAdminSummary(),
        api.getAdminUsers()
      ]);
      setSummary(sumData);
      setUsers(usersData);
    } catch (err) {
      toast.error('Error al cargar datos de auditoría');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCsv = () => {
    const url = api.getExportCsvUrl();
    window.open(url, '_blank');
  };

  if (loading || !summary) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
            <span className="text-gradient">Auditoría Financiera</span>
          </h1>
          <p style={{ color: 'var(--text-2)', fontSize: '0.9375rem' }}>
            Control maestro de citas y cobros del sistema.
          </p>
        </div>
        <button onClick={handleExportCsv} className="btn btn-lime">
          <Download size={18} />
          Exportar CSV
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div className="panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ color: 'var(--text-2)', fontSize: '0.875rem', fontWeight: 500 }}>Ingresos Totales</span>
            <DollarSign size={20} color="var(--lime)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-1)' }}>
            ${summary.total_revenue_usd?.toFixed(2)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginTop: '0.5rem' }}>
            A razón de ${summary.price_per_appointment} por cita agendada
          </div>
        </div>

        <div className="panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ color: 'var(--text-2)', fontSize: '0.875rem', fontWeight: 500 }}>Total Citas</span>
            <Calendar size={20} color="var(--accent-2)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-1)' }}>
            {summary.total_appointments}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginTop: '0.5rem' }}>
            {summary.completed_appointments} completadas, {summary.searching_appointments} pendientes
          </div>
        </div>

        <div className="panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ color: 'var(--text-2)', fontSize: '0.875rem', fontWeight: 500 }}>Usuarios</span>
            <Users size={20} color="var(--orange)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-1)' }}>
            {summary.total_users}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginTop: '0.5rem' }}>
            {summary.active_users} activos, {summary.pending_users} por autorizar
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="panel" style={{ overflow: 'hidden' }}>
        <div className="panel-header">
          <h2 className="panel-title">Desglose por Usuario</h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Rol / Plan</th>
                <th>Estado</th>
                <th>Citas Agendadas</th>
                <th>Total Facturado</th>
                <th>Última Cita</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div style={{ fontWeight: 500, color: 'var(--text-1)' }}>{u.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{u.email}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.8125rem' }}>{u.role}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', textTransform: 'uppercase' }}>{u.plan}</div>
                  </td>
                  <td>
                    {u.is_authorized ? (
                      <span className="tag tag-green"><CheckCircle size={12} style={{ marginRight: '4px' }}/> Activo</span>
                    ) : (
                      <span className="tag tag-orange"><Clock size={12} style={{ marginRight: '4px' }}/> Pendiente</span>
                    )}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{u.appointment_count}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--lime)' }}>${u.revenue_usd?.toFixed(2)}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-2)' }}>
                      {u.last_appointment ? new Date(u.last_appointment).toLocaleDateString() : '-'}
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-3)' }}>
                    No hay usuarios registrados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default AdminPage;
