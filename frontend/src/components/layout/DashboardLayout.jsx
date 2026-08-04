import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Sidebar from './Sidebar';
import Header from './Header';
import { api } from '../../services/api';

const DashboardLayout = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState(null);
  const [userName, setUserName] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!api.isAuthenticated()) { navigate('/login'); return; }
    const currentRole = localStorage.getItem('userRole') || 'NATURAL_PERSON';
    setRole(currentRole);
    setUserName(localStorage.getItem('userName') || 'Usuario');
    
    let userId = null;
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        userId = payload.id;
      }
    } catch(e) {}

    // Real-time SSE Connection
    const baseUrl = (api.url || api.API_URL || '').replace('/api', '');
    const sseUrl = `${baseUrl}/api/webhooks/stream`;
    
    let sse;
    try {
      sse = new EventSource(sseUrl);
      
      sse.onerror = () => {
        // Silently swallow network drops (e.g. net::ERR_HTTP2_PING_FAILED)
      };

      sse.addEventListener('session_revoked', (e) => {
        try {
          const data = JSON.parse(e.data);
          if (userId && data.user_id === parseInt(userId)) {
            toast.error('Sesión revocada por el Administrador.');
            api.logout();
            navigate('/login');
          }
        } catch (err) {}
      });

      sse.addEventListener('schedule_discovered', (e) => {
        try {
          const data = JSON.parse(e.data);
          if (currentRole === 'AGENCY' || currentRole === 'ADMINISTRATOR') {
            toast.success(`Nuevo Schedule: ${data.schedule_id} para ${data.client_name}`);
          }
        } catch (err) {}
      });
    } catch (e) {}

    return () => {
      if (sse && typeof sse.close === 'function') sse.close();
    };
  }, [navigate]);

  if (!role) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', flexDirection: 'column', gap: '1rem', background: 'var(--bg)' }}>
      <div style={{ width: '24px', height: '24px', border: '2px solid var(--border)', borderTopColor: 'var(--text-1)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Mobile Overlay */}
      <div 
        className={`sidebar-overlay ${mobileMenuOpen ? 'open' : ''}`}
        onClick={() => setMobileMenuOpen(false)}
      />
      
      <Sidebar role={role} userName={userName} isMobileOpen={mobileMenuOpen} closeMobile={() => setMobileMenuOpen(false)} />
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0, background: 'var(--surface-2)', position: 'relative' }}>
        
        {/* Subtle background glow */}
        <div style={{ position: 'absolute', top: 0, left: '20%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(99,102,241,0.03) 0%, transparent 60%)', pointerEvents: 'none', zIndex: 0 }} />

        <Header role={role} userName={userName} onMenuClick={() => setMobileMenuOpen(true)} />
        
        <main className="mobile-main-content" style={{ flex: 1, overflowY: 'auto', padding: '2rem', position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <Outlet context={{ role, userName }} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
