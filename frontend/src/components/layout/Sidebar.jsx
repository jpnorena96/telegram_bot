import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutGrid, CalendarCheck, Users, Settings, LogOut, ChevronLeft, ChevronRight, Shield, FolderOpen, Globe } from 'lucide-react';
import { api } from '../../services/api';

const ROLE_LABELS = {
  ADMINISTRATOR: 'Administrador', AUDITOR: 'Auditor',
  VISA_MANAGER: 'Gestor', TRAVEL_AGENCY: 'Agencia',
  NATURAL_PERSON: 'Cliente',
};

const NAV = [
  { to: '/dashboard', label: 'Resumen', icon: LayoutGrid, roles: ['ADMINISTRATOR', 'AUDITOR', 'VISA_MANAGER', 'TRAVEL_AGENCY', 'NATURAL_PERSON'] },
  { to: '/dashboard/citas', label: 'Citas', icon: CalendarCheck, roles: ['ADMINISTRATOR', 'AUDITOR', 'VISA_MANAGER', 'TRAVEL_AGENCY', 'NATURAL_PERSON'] },
  { to: '/dashboard/documentos', label: 'Documentos', icon: FolderOpen, roles: ['ADMINISTRATOR', 'AUDITOR', 'VISA_MANAGER', 'TRAVEL_AGENCY', 'NATURAL_PERSON'] },
  { to: '/dashboard/usuarios', label: 'Usuarios', icon: Users, roles: ['ADMINISTRATOR', 'AUDITOR'] },
  { to: '/dashboard/auditoria', label: 'Auditoría', icon: Shield, roles: ['ADMINISTRATOR', 'AUDITOR'] },
  { to: '/dashboard/configuracion', label: 'Configuración', icon: Settings, roles: ['ADMINISTRATOR'] },
];

const Sidebar = ({ role, userName }) => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const links = NAV.filter(n => n.roles.includes(role));

  return (
    <aside style={{
      width: collapsed ? '80px' : 'var(--sidebar-w)',
      background: '#FFFFFF', // Pure White for high-end SaaS feel
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      height: '100vh', position: 'sticky', top: 0,
      flexShrink: 0, transition: 'width 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      overflow: 'hidden', zIndex: 100,
    }}>

      {/* Brand */}
      <div style={{ padding: collapsed ? '1.5rem 0' : '1.5rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start', minHeight: '80px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }} onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Globe size={28} color="var(--lime)" strokeWidth={2.5} />
            {!collapsed && (
              <span style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
                GlobalVisas
              </span>
            )}
          </div>
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
              padding: '0.75rem 0.875rem', textDecoration: 'none', color: 'var(--text-2)',
              fontSize: '0.9rem', fontWeight: 600, borderRadius: '10px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              transition: 'all 0.2s', position: 'relative'
            }}
          >
            {({ isActive }) => (
              <>
                <link.icon size={20} strokeWidth={isActive ? 2.5 : 2} color={isActive ? 'var(--lime)' : 'currentColor'} />
                {!collapsed && <span style={{ color: isActive ? 'var(--lime-dim)' : 'currentColor' }}>{link.label}</span>}
                {isActive && !collapsed && (
                  <div style={{ position: 'absolute', right: '10px', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--lime)' }} />
                )}
              </>
            )}
          </NavLink>
        ))}
        <style>{`
          .nav-link:hover { background: var(--surface-2); color: var(--text-1) !important; }
          .nav-link.active { background: var(--lime-glow); color: var(--lime-dim) !important; }
        `}</style>
      </nav>

      {/* Bottom User Area */}
      <div style={{ padding: '1rem', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.5rem', background: '#FFFFFF' }}>
        {!collapsed && (
          <div style={{ padding: '0.75rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--surface-2)', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--lime)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1rem', fontFamily: 'var(--font-heading)', fontWeight: 700, boxShadow: '0 4px 10px rgba(79, 70, 229, 0.2)' }}>
              {(userName || 'U').charAt(0)}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-1)', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{userName}</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-3)' }}>{ROLE_LABELS[role]}</div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.5rem', flexDirection: collapsed ? 'column' : 'row' }}>
          <button
            onClick={() => setCollapsed(c => !c)}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.6rem', background: 'none', border: '1px solid var(--border)', borderRadius: '10px', cursor: 'pointer', color: 'var(--text-2)', transition: 'all 0.2s' }}
            onMouseOver={e => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--text-1)'; e.currentTarget.style.borderColor = 'var(--border-2)' }}
            onMouseOut={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-2)'; e.currentTarget.style.borderColor = 'var(--border)' }}
            title={collapsed ? "Expandir" : "Contraer"}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
          <button
            onClick={() => { api.logout(); navigate('/login'); }}
            style={{ flex: collapsed ? 'none' : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.6rem', background: 'none', border: '1px solid var(--border)', borderRadius: '10px', cursor: 'pointer', color: '#ef4444', transition: 'all 0.2s' }}
            onMouseOver={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.2)' }}
            onMouseOut={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.borderColor = 'var(--border)' }}
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
