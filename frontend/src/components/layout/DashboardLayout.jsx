import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { api } from '../../services/api';

const DashboardLayout = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState(null);
  const [userName, setUserName] = useState(null);

  useEffect(() => {
    if (!api.isAuthenticated()) { navigate('/login'); return; }
    setRole(localStorage.getItem('userRole') || 'NATURAL_PERSON');
    setUserName(localStorage.getItem('userName') || 'Usuario');
  }, [navigate]);

  if (!role) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', flexDirection: 'column', gap: '1rem', background: 'var(--bg)' }}>
      <div style={{ width: '24px', height: '24px', border: '2px solid var(--border)', borderTopColor: 'var(--text-1)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <Sidebar role={role} userName={userName} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0, background: 'var(--bg)', position: 'relative' }}>
        
        {/* Subtle background glow */}
        <div style={{ position: 'absolute', top: 0, left: '20%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(99,102,241,0.03) 0%, transparent 60%)', pointerEvents: 'none', zIndex: 0 }} />

        <Header role={role} userName={userName} />
        
        <main style={{ flex: 1, overflowY: 'auto', padding: '2rem', position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <Outlet context={{ role, userName }} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
