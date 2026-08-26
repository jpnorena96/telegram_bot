import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Bell, X, Search, CheckCircle2, AlertCircle, Info, ShieldAlert, Menu } from 'lucide-react';
import { api } from '../../services/api';

const PAGE_LABELS = {
  '/dashboard':               'Resumen',
  '/dashboard/citas':         'Citas',
  '/dashboard/documentos':    'Documentos de Visa',
  '/dashboard/usuarios':      'Usuarios',
  '/dashboard/configuracion': 'Configuración',
  '/dashboard/agencia-perfil': 'Mi Agencia',
  '/dashboard/admin-agencias': 'Aprobación de Agencias',
};

const Header = ({ role, userName, onMenuClick }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [showN, setShowN] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const ref = useRef(null);
  const label = PAGE_LABELS[location.pathname] || 'Panel';

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
        setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
      } catch (e) {
        console.error('Error marking notifications as read:', e);
      }
    }
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const formatTime = (dateStr) => {
    if (!dateStr || typeof dateStr !== 'string') return '';
    try {
      const date = new Date(dateStr.replace(' ', 'T'));
      const diffMs = new Date() - date;
      const diffMin = Math.floor(diffMs / 1000 / 60);
      if (diffMin < 1) return 'Ahora';
      if (diffMin < 60) return `${diffMin} min`;
      const diffHours = Math.floor(diffMin / 60);
      if (diffHours < 24) return `${diffHours} h`;
      return date.toLocaleDateString();
    } catch (e) {
      return dateStr;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckCircle2 size={16} color="var(--green)" />;
      case 'warning': return <AlertCircle size={16} color="var(--orange)" />;
      case 'error': return <ShieldAlert size={16} color="#ef4444" />;
      case 'info': default: return <Info size={16} color="var(--lime)" />;
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'success': return 'rgba(16, 185, 129, 0.1)';
      case 'warning': return 'rgba(245, 158, 11, 0.1)';
      case 'error': return 'rgba(239, 68, 68, 0.1)';
      case 'info': default: return 'var(--lime-glow)';
    }
  };

  return (
    <header style={{ 
      background: 'rgba(255, 255, 255, 0.9)', 
      borderBottom: '1px solid var(--border)', 
      position: 'sticky', 
      top: 0, 
      zIndex: 50, 
      backdropFilter: 'blur(12px)',
      boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
    }}>
      <style>{`
        @keyframes ringing {
          0% { transform: rotate(0); }
          10% { transform: rotate(15deg); }
          20% { transform: rotate(-10deg); }
          30% { transform: rotate(15deg); }
          40% { transform: rotate(-10deg); }
          50% { transform: rotate(0); }
          100% { transform: rotate(0); }
        }
        @keyframes slideDownFade {
          from { opacity: 0; transform: translateY(-8px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .notif-item { transition: all 0.2s ease; }
        .notif-item:hover { background: var(--surface-2); }
      `}</style>
      
      <div style={{ padding: '0 2rem', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

        {/* Title & Mobile Menu Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            className="btn btn-icon btn-sm hide-on-desktop" 
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
            onClick={onMenuClick}
            type="button"
          >
            <Menu size={18} />
          </button>
          <h1 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)', fontWeight: 600, color: 'var(--text-1)', letterSpacing: '-0.02em', margin: 0 }}>
            {label}
          </h1>
        </div>

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>

          {/* Search */}
          <form className="hide-on-mobile" onSubmit={(e) => { e.preventDefault(); if (searchQuery.trim()) navigate(`/dashboard/buscar?q=${encodeURIComponent(searchQuery)}`); }} 
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '99px', padding: '0.4rem 1rem', color: 'var(--text-3)', transition: 'all 0.2s', cursor: 'text' }}
                onMouseOver={e => e.currentTarget.style.borderColor = 'var(--border-2)'}
                onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border)'}>
            <Search size={14} />
            <input 
              type="text" 
              placeholder="Buscar..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-1)', width: '120px' }}
            />
            <div style={{ marginLeft: '1rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', padding: '0.125rem 0.375rem', fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-2)' }}>↵ Enter</div>
          </form>

          <div style={{ width: '1px', height: '24px', background: 'var(--border)' }} />

          {/* Language Switcher */}
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }} className="hide-on-mobile">
            <button onClick={() => changeLanguage('en')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: i18n.language === 'en' ? 'bold' : 'normal', color: i18n.language === 'en' ? 'var(--lime)' : 'var(--text-3)' }}>EN</button>
            <span style={{ color: 'var(--border)' }}>|</span>
            <button onClick={() => changeLanguage('es')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: i18n.language === 'es' ? 'bold' : 'normal', color: i18n.language === 'es' ? 'var(--lime)' : 'var(--text-3)' }}>ES</button>
            <span style={{ color: 'var(--border)' }}>|</span>
            <button onClick={() => changeLanguage('pt')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: i18n.language === 'pt' ? 'bold' : 'normal', color: i18n.language === 'pt' ? 'var(--lime)' : 'var(--text-3)' }}>PT</button>
          </div>
          <div style={{ width: '1px', height: '24px', background: 'var(--border)' }} className="hide-on-mobile" />

          {/* Notifications */}
          <div ref={ref} style={{ position: 'relative' }}>
            <button onClick={handleToggleNotifications} 
              style={{ 
                background: unreadCount > 0 ? 'var(--lime-glow)' : 'transparent', 
                border: '1px solid ' + (unreadCount > 0 ? 'var(--lime-subtle)' : 'transparent'), 
                cursor: 'pointer', 
                width: '36px', height: '36px', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                position: 'relative', 
                color: unreadCount > 0 ? 'var(--lime)' : 'var(--text-2)', 
                transition: 'all 0.2s ease', 
                borderRadius: '50%' 
              }}
              onMouseOver={e => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--text-1)'; }}
              onMouseOut={e => { e.currentTarget.style.background = unreadCount > 0 ? 'var(--lime-glow)' : 'transparent'; e.currentTarget.style.color = unreadCount > 0 ? 'var(--lime)' : 'var(--text-2)'; }}
            >
              <Bell size={18} style={{ animation: unreadCount > 0 ? 'ringing 3s ease infinite' : 'none' }} />
              {unreadCount > 0 && (
                <span style={{ 
                  position: 'absolute', top: '0px', right: '0px', 
                  minWidth: '16px', height: '16px', borderRadius: '8px', 
                  background: 'var(--lime)', color: '#fff', 
                  fontSize: '9px', fontWeight: 800, 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  border: '2px solid #fff'
                }} >
                  {unreadCount}
                </span>
              )}
            </button>

            {showN && (
              <div style={{ 
                position: 'absolute', right: 0, top: 'calc(100% + 12px)', 
                width: '380px', background: '#fff', 
                border: '1px solid var(--border)', borderRadius: '16px', 
                boxShadow: '0 10px 40px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.02)', 
                zIndex: 200, overflow: 'hidden', 
                animation: 'slideDownFade 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards' 
              }}>
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface)' }}>
                  <span style={{ fontSize: '1rem', fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--text-1)' }}>Notificaciones</span>
                  <button onClick={() => setShowN(false)} style={{ background: 'var(--surface-2)', border: 'none', cursor: 'pointer', color: 'var(--text-2)', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }} onMouseOver={e=>e.currentTarget.style.background='var(--border)'} onMouseOut={e=>e.currentTarget.style.background='var(--surface-2)'}>
                    <X size={14} />
                  </button>
                </div>
                
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '3rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Bell size={20} color="var(--text-3)" />
                      </div>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-3)', margin: 0, fontWeight: 500 }}>No hay notificaciones nuevas.</p>
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} className="notif-item" style={{ 
                        padding: '1.25rem 1.5rem', 
                        borderBottom: '1px solid var(--border)', 
                        display: 'flex', gap: '1rem', alignItems: 'flex-start', 
                        background: !n.is_read ? 'var(--lime-glow)' : 'transparent',
                        position: 'relative'
                      }}>
                        {!n.is_read && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px', background: 'var(--lime)' }} />}
                        
                        <div style={{ 
                          width: '36px', height: '36px', borderRadius: '10px', 
                          background: getStatusBg(n.status), 
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 
                        }}>
                          {getStatusIcon(n.status)}
                        </div>
                        
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: '0.875rem', color: 'var(--text-1)', margin: '0 0 0.25rem 0', lineHeight: 1.4, fontWeight: !n.is_read ? 600 : 400 }}>
                            {n.message}
                          </p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-3)', margin: 0, fontWeight: 500 }}>
                            {formatTime(n.created_at)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                {notifications.length > 0 && (
                  <div style={{ padding: '0.75rem', borderTop: '1px solid var(--border)', textAlign: 'center', background: 'var(--surface)' }}>
                    <button onClick={() => { setShowN(false); navigate('/dashboard/notificaciones'); }} style={{ background: 'none', border: 'none', color: 'var(--lime)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
                      Ver todo el historial
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
