import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, X, Search } from 'lucide-react';
import { api } from '../../services/api';

const PAGE_LABELS = {
  '/dashboard':               'Resumen',
  '/dashboard/citas':         'Citas',
  '/dashboard/usuarios':      'Usuarios',
  '/dashboard/configuracion': 'Configuración',
};

const Header = () => {
  const location = useLocation();
  const [showN, setShowN] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const ref = useRef(null);
  const label = PAGE_LABELS[location.pathname] || 'Panel';

  // Fetch notifications from API
  const fetchNotifications = async () => {
    try {
      if (api.isAuthenticated()) {
        const notifs = await api.getNotifications();
        setNotifications(notifs);
        const unread = notifs.filter(n => !n.is_read).length;
        setUnreadCount(unread);
      }
    } catch (e) {
      console.error('Error fetching notifications:', e);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Polling every 15 seconds to check for new notifications
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const close = (e) => { 
      if (ref.current && !ref.current.contains(e.target)) setShowN(false); 
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const handleToggleNotifications = async () => {
    const newShow = !showN;
    setShowN(newShow);
    
    if (newShow && unreadCount > 0) {
      try {
        await api.markNotificationsRead();
        setUnreadCount(0);
        // Refresh local items as read
        setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
      } catch (e) {
        console.error('Error marking notifications as read:', e);
      }
    }
  };

  // Helper function to format dates nicely
  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr.replace(' ', 'T'));
      const diffMs = new Date() - date;
      const diffMin = Math.floor(diffMs / 1000 / 60);
      if (diffMin < 1) return 'Hace un momento';
      if (diffMin < 60) return `Hace ${diffMin} min`;
      const diffHours = Math.floor(diffMin / 60);
      if (diffHours < 24) return `Hace ${diffHours} h`;
      return date.toLocaleDateString();
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <header style={{ background: 'rgba(10,10,10,0.8)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(20px)' }}>
      <style>{`
        @keyframes ringing {
          0% { transform: rotate(0); }
          1% { transform: rotate(20deg); }
          3% { transform: rotate(-18deg); }
          5% { transform: rotate(22deg); }
          7% { transform: rotate(-20deg); }
          9% { transform: rotate(18deg); }
          11% { transform: rotate(-16deg); }
          13% { transform: rotate(14deg); }
          15% { transform: rotate(-12deg); }
          17% { transform: rotate(10deg); }
          19% { transform: rotate(-8deg); }
          21% { transform: rotate(6deg); }
          23% { transform: rotate(-4deg); }
          25% { transform: rotate(2deg); }
          27% { transform: rotate(-1deg); }
          29% { transform: rotate(0); }
          100% { transform: rotate(0); }
        }
        @keyframes pulse {
          0% { transform: scale(0.9); box-shadow: 0 0 6px var(--lime); }
          100% { transform: scale(1.15); box-shadow: 0 0 12px var(--lime); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-10px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
      
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
            <button onClick={handleToggleNotifications} style={{ background: 'none', border: 'none', cursor: 'pointer', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', color: unreadCount > 0 ? 'var(--text-1)' : 'var(--text-2)', transition: 'all 0.3s ease', borderRadius: '8px' }}
              onMouseOver={e => { e.currentTarget.style.color = 'var(--text-1)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
              onMouseOut={e => { e.currentTarget.style.color = unreadCount > 0 ? 'var(--text-1)' : 'var(--text-2)'; e.currentTarget.style.background = 'none' }}
            >
              <Bell size={16} style={{ animation: unreadCount > 0 ? 'ringing 2.5s ease infinite' : 'none' }} />
              {unreadCount > 0 && (
                <span style={{ position: 'absolute', top: '5px', right: '5px', minWidth: '14px', height: '14px', borderRadius: '7px', background: 'var(--lime)', color: '#000', fontSize: '8px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px', boxShadow: '0 0 10px var(--lime)', animation: 'pulse 1.5s infinite alternate' }} >
                  {unreadCount}
                </span>
              )}
            </button>

            {showN && (
              <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: '340px', background: 'rgba(15,15,15,0.92)', border: '1px solid var(--border)', borderRadius: '12px', backdropFilter: 'blur(25px)', boxShadow: '0 15px 40px rgba(0,0,0,0.6)', zIndex: 200, overflow: 'hidden', animation: 'slideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>
                <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-1)' }}>Centro de Notificaciones</span>
                  <button onClick={() => setShowN(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)' }}><X size={14} /></button>
                </div>
                
                <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-3)' }}>
                      <p style={{ fontSize: '0.8125rem', margin: 0 }}>No tienes notificaciones por el momento.</p>
                    </div>
                  ) : (
                    notifications.map(n => {
                      const colorMap = {
                        success: '#10b981', // green
                        info: '#06b6d4',    // cyan
                        warning: '#f97316', // orange
                        error: '#ef4444'     // red
                      };
                      const color = colorMap[n.status] || '#a3a3a3';
                      return (
                        <div key={n.id} style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.03)', display: 'flex', gap: '0.75rem', alignItems: 'flex-start', background: !n.is_read ? 'rgba(255,255,255,0.01)' : 'transparent', transition: 'background-color 0.2s' }}
                          onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                          onMouseOut={e => e.currentTarget.style.background = !n.is_read ? 'rgba(255,255,255,0.01)' : 'transparent'}
                        >
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, marginTop: '5px', flexShrink: 0, boxShadow: `0 0 10px ${color}` }} />
                          <div style={{ flex: 1 }}>
                            <p style={{ fontSize: '0.8125rem', color: !n.is_read ? 'var(--text-1)' : 'var(--text-2)', margin: 0, lineHeight: 1.4, fontWeight: !n.is_read ? 500 : 400 }}>{n.message}</p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginTop: '0.375rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span>{formatTime(n.created_at)}</span>
                              {!n.is_read && (
                                <span style={{ color: 'var(--lime)', fontSize: '9px', fontWeight: 'bold' }}>NUEVA</span>
                              )}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
