import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, X, Search } from 'lucide-react';

const PAGE_LABELS = {
  '/dashboard':               'Resumen',
  '/dashboard/citas':         'Citas',
  '/dashboard/usuarios':      'Usuarios',
  '/dashboard/configuracion': 'Configuración',
};

const NOTIFS = [
  { id: 1, msg: 'Cita adelantada exitosamente', time: 'Hace 2 horas', status: 'success' },
  { id: 2, msg: 'Nuevo inicio de sesión',       time: 'Hoy',          status: 'info' },
];

const Header = () => {
  const location = useLocation();
  const [showN, setShowN] = useState(false);
  const ref = useRef(null);
  const label = PAGE_LABELS[location.pathname] || 'Panel';

  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setShowN(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  return (
    <header style={{ background: 'rgba(10,10,10,0.8)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(20px)' }}>
      <div style={{ padding: '0 2rem', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

        {/* Title */}
        <h1 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-1)' }}>
          {label}
        </h1>

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>

          {/* Search (fake) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.375rem 0.75rem', color: 'var(--text-3)' }}>
            <Search size={14} />
            <span style={{ fontSize: '0.8125rem' }}>Buscar...</span>
            <div style={{ marginLeft: '1rem', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', padding: '0.125rem 0.375rem', fontSize: '0.625rem', color: 'var(--text-2)' }}>⌘K</div>
          </div>

          <div style={{ width: '1px', height: '24px', background: 'var(--border)' }} />

          {/* Notifications */}
          <div ref={ref} style={{ position: 'relative' }}>
            <button onClick={() => setShowN(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', color: 'var(--text-2)', transition: 'color 0.2s', borderRadius: '8px' }}
              onMouseOver={e => { e.currentTarget.style.color = 'var(--text-1)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
              onMouseOut={e => { e.currentTarget.style.color = 'var(--text-2)'; e.currentTarget.style.background = 'none' }}
            >
              <Bell size={16} />
              <span style={{ position: 'absolute', top: '8px', right: '8px', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--lime)', display: 'block', boxShadow: '0 0 8px var(--lime)' }} />
            </button>

            {showN && (
              <div className="animate-in" style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: '320px', background: 'rgba(18,18,18,0.9)', border: '1px solid var(--border)', borderRadius: '12px', backdropFilter: 'blur(20px)', boxShadow: '0 10px 40px rgba(0,0,0,0.5)', zIndex: 200, overflow: 'hidden' }}>
                <div style={{ padding: '0.875rem 1rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-1)' }}>Notificaciones</span>
                  <button onClick={() => setShowN(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)' }}><X size={14} /></button>
                </div>
                {NOTIFS.map(n => (
                  <div key={n.id} style={{ padding: '0.875rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.03)', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}
                    onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: n.status === 'success' ? 'var(--green)' : 'var(--cyan)', marginTop: '6px', flexShrink: 0, boxShadow: `0 0 8px ${n.status === 'success' ? 'var(--green)' : 'var(--cyan)'}` }} />
                    <div>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-1)', margin: 0 }}>{n.msg}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginTop: '0.25rem' }}>{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
