import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutGrid, CalendarCheck, Users, Settings, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../../services/api';

const ROLE_LABELS = {
  ADMINISTRATOR: 'Administrador', AUDITOR: 'Auditor',
  VISA_MANAGER: 'Gestor', TRAVEL_AGENCY: 'Agencia',
  NATURAL_PERSON: 'Cliente',
};

const NAV = [
  { to: '/dashboard',               label: 'Resumen',       icon: LayoutGrid,    roles: ['ADMINISTRATOR','AUDITOR','VISA_MANAGER','TRAVEL_AGENCY','NATURAL_PERSON'] },
  { to: '/dashboard/citas',         label: 'Citas',         icon: CalendarCheck, roles: ['ADMINISTRATOR','AUDITOR','VISA_MANAGER','TRAVEL_AGENCY','NATURAL_PERSON'] },
  { to: '/dashboard/usuarios',      label: 'Usuarios',      icon: Users,         roles: ['ADMINISTRATOR','AUDITOR'] },
  { to: '/dashboard/configuracion', label: 'Configuración', icon: Settings,  roles: ['ADMINISTRATOR'] },
];

const Sidebar = ({ role, userName }) => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const links = NAV.filter(n => n.roles.includes(role));

  return (
    <aside style={{
      width: collapsed ? '80px' : 'var(--sidebar-w)',
      background: 'var(--bg)',
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      height: '100vh', position: 'sticky', top: 0,
      flexShrink: 0, transition: 'width 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      overflow: 'hidden', zIndex: 100,
    }}>

      {/* Brand */}
      <div style={{ padding: collapsed ? '1.5rem 0' : '1.5rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start', minHeight: '80px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '28px', height: '28px', background: 'var(--text-1)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <div style={{ width: '12px', height: '12px', background: 'var(--bg)', borderRadius: '3px' }} />
          </div>
          {!collapsed && (
            <span style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-1)', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
              GlobalVisas
            </span>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/dashboard'}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.875rem', 
              padding: '0.625rem 0.875rem', textDecoration: 'none', color: 'var(--text-2)', 
              fontSize: '0.875rem', fontWeight: 500, borderRadius: '8px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              transition: 'all 0.2s'
            }}
          >
            {({ isActive }) => (
              <>
                <link.icon size={18} strokeWidth={isActive ? 2 : 1.5} color={isActive ? 'var(--text-1)' : 'currentColor'} />
                {!collapsed && <span style={{ color: isActive ? 'var(--text-1)' : 'currentColor' }}>{link.label}</span>}
              </>
            )}
          </NavLink>
        ))}
        <style>{`
          .nav-link:hover { background: rgba(255,255,255,0.03); color: var(--text-1) !important; }
          .nav-link.active { background: rgba(255,255,255,0.06); }
        `}</style>
      </nav>

      {/* Bottom User Area */}
      <div style={{ padding: '1rem', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {!collapsed && (
          <div style={{ padding: '0.5rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--lime), var(--accent-2))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.875rem', fontWeight: 600 }}>
              {(userName || 'U').charAt(0)}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-1)', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{userName}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{ROLE_LABELS[role]}</div>
            </div>
          </div>
        )}
        
        <div style={{ display: 'flex', gap: '0.5rem', flexDirection: collapsed ? 'column' : 'row' }}>
          <button
            onClick={() => setCollapsed(c => !c)}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem', background: 'none', border: '1px solid transparent', borderRadius: '8px', cursor: 'pointer', color: 'var(--text-2)', transition: 'all 0.2s' }}
            onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = 'var(--text-1)'}}
            onMouseOut={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-2)'}}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
          <button
            onClick={() => { api.logout(); navigate('/login'); }}
            style={{ flex: collapsed ? 'none' : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem', background: 'none', border: '1px solid transparent', borderRadius: '8px', cursor: 'pointer', color: 'var(--text-2)', transition: 'all 0.2s' }}
            onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = 'var(--text-1)'}}
            onMouseOut={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-2)'}}
            title="Cerrar sesión"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
