import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Calendar, Users, Settings, LogOut } from 'lucide-react';
import { api } from '../../services/api';

const Sidebar = ({ role }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    api.logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/dashboard', label: 'Resumen', icon: LayoutDashboard, roles: ['ADMINISTRATOR', 'AUDITOR', 'VISA_MANAGER', 'TRAVEL_AGENCY', 'NATURAL_PERSON'] },
    { to: '/dashboard/citas', label: 'Gestión de Citas', icon: Calendar, roles: ['ADMINISTRATOR', 'AUDITOR', 'VISA_MANAGER', 'TRAVEL_AGENCY', 'NATURAL_PERSON'] },
    { to: '/dashboard/usuarios', label: 'Usuarios', icon: Users, roles: ['ADMINISTRATOR', 'AUDITOR'] },
    { to: '/dashboard/configuracion', label: 'Ajustes', icon: Settings, roles: ['ADMINISTRATOR'] },
  ];

  const allowedLinks = navLinks.filter(link => link.roles.includes(role));

  return (
    <aside style={{
      width: '280px',
      background: 'var(--surface-color)',
      borderRight: '1px solid var(--border-color, #e2e8f0)',
      display: 'flex',
      flexDirection: 'column',
      padding: '1.5rem',
      height: '100vh',
      position: 'sticky',
      top: 0
    }}>
      <div style={{ marginBottom: '2rem', padding: '0 0.5rem' }}>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          background: 'linear-gradient(135deg, var(--primary-dark), var(--primary-light))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '0.5rem'
        }}>
          Portal {role === 'ADMINISTRATOR' ? 'Admin' : role === 'AUDITOR' ? 'Auditor' : 'Cliente'}
        </h2>
        <span style={{
          fontSize: '0.75rem',
          fontWeight: 600,
          padding: '0.25rem 0.75rem',
          borderRadius: 'var(--radius-full)',
          background: 'rgba(59, 130, 246, 0.1)',
          color: 'var(--primary-dark)'
        }}>
          {role.replace('_', ' ')}
        </span>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
        {allowedLinks.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/dashboard'}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              color: isActive ? 'var(--primary-color)' : 'var(--text-secondary)',
              background: isActive ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
              fontWeight: isActive ? 600 : 500,
              textDecoration: 'none',
              transition: 'all var(--transition-fast)'
            })}
          >
            <link.icon size={20} />
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div style={{ borderTop: '1px solid var(--border-color, #e2e8f0)', paddingTop: '1.5rem', marginTop: 'auto' }}>
        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            color: 'var(--danger-color)',
            background: 'transparent',
            border: 'none',
            fontWeight: 500,
            cursor: 'pointer',
            width: '100%',
            textAlign: 'left',
            transition: 'background var(--transition-fast)'
          }}
          onMouseOver={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
          onMouseOut={e => e.currentTarget.style.background = 'transparent'}
        >
          <LogOut size={20} />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
