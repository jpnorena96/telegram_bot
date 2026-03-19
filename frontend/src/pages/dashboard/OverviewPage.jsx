import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { Users, CalendarCheck, TrendingUp, Clock } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
  <div className="glass" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
    <div style={{
      width: '60px',
      height: '60px',
      borderRadius: 'var(--radius-md)',
      background: `var(--${color}-color)`,
      opacity: 0.1,
      position: 'absolute'
    }} />
    <div style={{
      width: '60px',
      height: '60px',
      borderRadius: 'var(--radius-md)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: `var(--${color}-color)`,
      zIndex: 1
    }}>
      <Icon size={30} />
    </div>
    <div style={{ zIndex: 1 }}>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>{title}</p>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
        <h3 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>{value}</h3>
        {trend && <span style={{ fontSize: '0.875rem', color: 'var(--success-color)' }}>{trend}</span>}
      </div>
    </div>
  </div>
);

const OverviewPage = () => {
  const { role } = useOutletContext();

  const getStatsForRole = () => {
    switch (role) {
      case 'ADMINISTRATOR':
      case 'AUDITOR':
        return (
          <>
            <StatCard title="Total Usuarios" value="1,248" icon={Users} color="primary" trend="+12% mes" />
            <StatCard title="Citas Adelantadas" value="5,890" icon={CalendarCheck} color="success" trend="+24% mes" />
            <StatCard title="Gestores Activos" value="132" icon={TrendingUp} color="warning" />
            <StatCard title="Citas Pendientes" value="45" icon={Clock} color="danger" />
          </>
        );
      case 'TRAVEL_AGENCY':
      case 'VISA_MANAGER':
        return (
          <>
            <StatCard title="Mis Clientes" value="48" icon={Users} color="primary" />
            <StatCard title="Citas Aprobadas (Mes)" value="12" icon={CalendarCheck} color="success" trend="+2 esta sem" />
            <StatCard title="Citas en Proceso" value="8" icon={Clock} color="warning" />
          </>
        );
      case 'NATURAL_PERSON':
      default:
        return (
          <>
            <StatCard title="Citas Asignadas" value="1" icon={CalendarCheck} color="primary" />
            <StatCard title="Días Ahorrados" value="145" icon={TrendingUp} color="success" />
            <StatCard title="Estado de Trámite" value="En Proceso" icon={Clock} color="warning" />
          </>
        );
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          Resumen General
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Bienvenido a tu panel de control {role.replace('_', ' ')}
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {getStatsForRole()}
      </div>

      <div className="glass" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
          Actividad Reciente
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{
              padding: '1rem',
              borderLeft: '4px solid var(--primary-light)',
              background: 'var(--surface-color)',
              borderRadius: '0 var(--radius-md) var(--radius-md) 0',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <p style={{ fontWeight: 600, marginBottom: '0.25rem', color: 'var(--text-primary)' }}>Actualización de Cita B1/B2</p>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>La cita programada previamente para Oct 2026 ha sido adelantada a Ago 2026.</p>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginTop: '0.5rem' }}>Hace 2 horas</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OverviewPage;
