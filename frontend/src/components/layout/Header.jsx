import React from 'react';
import { Bell, User } from 'lucide-react';

const Header = ({ role, userName }) => {
  return (
    <header style={{
      background: 'var(--surface-color)',
      padding: '1rem 2rem',
      borderBottom: '1px solid var(--border-color, #e2e8f0)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 40
    }}>
      <div>
        {/* Mobile menu toggle would go here */}
        <h1 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          Panel de Control
        </h1>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <button style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--text-secondary)',
          position: 'relative'
        }}>
          <Bell size={24} />
          <span style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '10px',
            height: '10px',
            background: 'var(--danger-color)',
            borderRadius: '50%',
            border: '2px solid var(--surface-color)'
          }}></span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '0.875rem', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>{userName || "Usuario Actual"}</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>{role.replace('_', ' ')}</p>
          </div>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary-light), var(--primary-color))',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <User size={20} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
