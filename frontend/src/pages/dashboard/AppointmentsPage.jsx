import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Search, Filter, CalendarDays, Plus, CalendarIcon } from 'lucide-react';
import { api } from '../../services/api';

const AppointmentsPage = () => {
  const { role } = useOutletContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const canManageAll = role === 'ADMINISTRATOR' || role === 'AUDITOR';

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const data = await api.getAppointments();
        setAppointments(data);
      } catch (err) {
        console.error("Failed to load appointments:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAppointments();
  }, [role]);

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Gestión de Citas
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Supervisa y gestiona el adelanto de citas consulares.
          </p>
        </div>
        
        {role !== 'AUDITOR' && (
          <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={20} />
            Nueva Solicitud
          </button>
        )}
      </div>

      <div className="glass" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '300px', position: 'relative' }}>
            <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              placeholder="Buscar por cliente o tipo de visa..." 
              className="input-field"
              style={{ paddingLeft: '3rem' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={20} /> Filtros
          </button>
        </div>
      </div>

      <div className="glass" style={{ overflow: 'x-auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(59, 130, 246, 0.05)', borderBottom: '1px solid var(--border-color, #e2e8f0)' }}>
              {canManageAll && <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 600 }}>ID Sistema</th>}
              <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Cliente</th>
              <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Tipo Visa</th>
              <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Cita Original</th>
              <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Cita Adelantada</th>
              <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Estado</th>
              {role !== 'AUDITOR' && <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
               <tr><td colSpan={canManageAll && role !== 'AUDITOR' ? "7" : "6"} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Cargando citas...</td></tr>
            ) : appointments.length === 0 ? (
               <tr><td colSpan={canManageAll && role !== 'AUDITOR' ? "7" : "6"} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No hay citas registradas.</td></tr>
            ) : appointments.map((apt) => (
              <tr key={apt.id} style={{ borderBottom: '1px solid var(--border-color, #e2e8f0)', transition: 'background var(--transition-fast)' }} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                {canManageAll && <td style={{ padding: '1rem 1.5rem', color: 'var(--text-primary)' }}>#{apt.id}</td>}
                <td style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'var(--text-primary)' }}>{apt.client}</td>
                <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)' }}>{apt.type}</td>
                <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CalendarIcon size={16} /> {apt.originalDate}
                  </div>
                </td>
                <td style={{ padding: '1rem 1.5rem', fontWeight: 600, color: apt.status === 'Adelantada' ? 'var(--success-color)' : 'var(--warning-color)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CalendarDays size={16} /> {apt.newDate}
                  </div>
                </td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    background: apt.status === 'Adelantada' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                    color: apt.status === 'Adelantada' ? 'var(--success-color)' : 'var(--warning-color)'
                  }}>
                    {apt.status}
                  </span>
                </td>
                {role !== 'AUDITOR' && (
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <button style={{
                      padding: '0.5rem 1rem',
                      background: 'var(--primary-light)',
                      color: 'white',
                      border: 'none',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: 500
                    }}>
                      Gestionar
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AppointmentsPage;
