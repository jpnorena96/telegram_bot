import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, CheckCircle2, AlertCircle, Info, ShieldAlert, Check } from 'lucide-react';
import { api } from '../../services/api';

const NotificationsHistory = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef();

  const fetchNotifications = async (pageNumber) => {
    try {
      setLoading(true);
      // Simulate pagination since API might not have it yet
      const res = await api.getNotifications(); 
      // For demonstration, slice the array to simulate pagination
      const perPage = 10;
      const start = (pageNumber - 1) * perPage;
      const end = start + perPage;
      const slice = res.slice(start, end);
      
      setNotifications(prev => pageNumber === 1 ? slice : [...prev, ...slice]);
      setHasMore(end < res.length);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(1);
  }, []);

  const lastElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prev => {
          const next = prev + 1;
          fetchNotifications(next);
          return next;
        });
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  const markAllRead = async () => {
    try {
      await api.markNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
    } catch (e) {
      console.error(e);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckCircle2 size={18} color="var(--green)" />;
      case 'warning': return <AlertCircle size={18} color="var(--orange)" />;
      case 'error': return <ShieldAlert size={18} color="#ef4444" />;
      case 'info': default: return <Info size={18} color="var(--lime)" />;
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

  const formatFullDate = (dateStr) => {
    if (!dateStr || typeof dateStr !== 'string') return '';
    try {
      const date = new Date(dateStr.replace(' ', 'T'));
      return date.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="animate-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: 48, height: 48, borderRadius: '12px', background: 'var(--surface)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-1)' }}>
            <Bell size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-heading)', fontWeight: 700, margin: '0 0 0.25rem 0', color: 'var(--text-1)' }}>Historial de Notificaciones</h1>
            <p style={{ margin: 0, color: 'var(--text-2)', fontSize: '0.9rem' }}>Centro de eventos y auditoría del sistema.</p>
          </div>
        </div>
        <button onClick={markAllRead} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-1)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e=>e.currentTarget.style.background='var(--surface-2)'} onMouseOut={e=>e.currentTarget.style.background='var(--surface)'}>
          <Check size={14} /> Marcar todas leídas
        </button>
      </div>

      <div style={{ background: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--border)', overflow: 'hidden' }}>
        {notifications.length === 0 && !loading ? (
          <div style={{ padding: '6rem 2rem', textAlign: 'center' }}>
            <Bell size={48} color="var(--border)" style={{ marginBottom: '1rem' }} />
            <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-1)', fontSize: '1.25rem' }}>No hay notificaciones</h3>
            <p style={{ margin: 0, color: 'var(--text-3)' }}>No tienes eventos registrados en el sistema aún.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {notifications.map((n, i) => {
              const isLast = i === notifications.length - 1;
              return (
                <div 
                  key={n.id} 
                  ref={isLast ? lastElementRef : null}
                  style={{ 
                    padding: '1.5rem', 
                    borderBottom: !isLast ? '1px solid var(--border)' : 'none',
                    display: 'flex', gap: '1.5rem', alignItems: 'flex-start',
                    background: !n.is_read ? 'var(--lime-glow)' : 'transparent',
                    position: 'relative'
                  }}
                >
                  {!n.is_read && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: 'var(--lime)' }} />}
                  
                  <div style={{ width: 48, height: 48, borderRadius: '12px', background: getStatusBg(n.status), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {getStatusIcon(n.status)}
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '1rem', color: 'var(--text-1)', margin: '0 0 0.5rem 0', lineHeight: 1.5, fontWeight: !n.is_read ? 600 : 400 }}>
                      {n.message}
                    </p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-3)', margin: 0, fontWeight: 500 }}>
                      {formatFullDate(n.created_at)}
                    </p>
                  </div>
                </div>
              );
            })}
            
            {loading && (
              <div style={{ padding: '2rem', display: 'flex', justifyContent: 'center' }}>
                <div className="spinner" style={{ width: 24, height: 24, border: '2px solid var(--border)', borderTopColor: 'var(--lime)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              </div>
            )}
            
            {!hasMore && notifications.length > 0 && (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-3)', fontSize: '0.85rem', fontWeight: 500 }}>
                Has llegado al final del historial.
              </div>
            )}
          </div>
        )}
      </div>
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default NotificationsHistory;
