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
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)', position: 'relative', overflow: 'hidden' }}>
      {/* EXOTIC ANIMATED BACKGROUND */}
      <div style={{ position: 'fixed', top: '-10%', left: '-10%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 70%)', filter: 'blur(80px)', animation: 'float 20s infinite alternate', zIndex: 0, pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '-20%', right: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)', filter: 'blur(100px)', animation: 'float 25s infinite alternate-reverse', zIndex: 0, pointerEvents: 'none' }} />
      <style>{`
        @keyframes float {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(50px, 50px) scale(1.1); }
        }
      `}</style>
      {/* Mobile Overlay */}
      <div 
        className={`sidebar-overlay ${mobileMenuOpen ? 'open' : ''}`}
        onClick={() => setMobileMenuOpen(false)}
      />
      
      <Sidebar role={role} userName={userName} isMobileOpen={mobileMenuOpen} closeMobile={() => setMobileMenuOpen(false)} />
      
      <div className={`layout-main-wrapper ${mobileMenuOpen ? 'shifted' : ''}`} style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0, position: 'relative', zIndex: 1, padding: '1rem', paddingLeft: 0, transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
        
        {/* Floating Glass Container for the main content area */}
        <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRadius: 'var(--radius-xl)', overflow: 'hidden', position: 'relative' }}>
          
          <Header role={role} userName={userName} onMenuClick={() => setMobileMenuOpen(true)} />
          
          <main className="main-content" style={{ flex: 1, overflowY: 'auto', position: 'relative', zIndex: 1, padding: '1.5rem' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <Outlet context={{ role, userName }} />
          </div>
        </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
