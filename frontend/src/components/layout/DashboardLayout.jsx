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
    if (!api.isAuthenticated()) {
      navigate('/login');
    } else {
      setRole(localStorage.getItem('userRole') || 'NATURAL_PERSON');
      setUserName(localStorage.getItem('userName') || 'Usuario');
    }
  }, [navigate]);

  if (!role) return null; // Or a loading spinner

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-color)' }}>
      <Sidebar role={role} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Header role={role} userName={userName} />
        <main style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
          <Outlet context={{ role, userName }} />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
