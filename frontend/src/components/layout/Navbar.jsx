import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? 'rgba(0,0,0,0.7)' : 'transparent',
      borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
      backdropFilter: scrolled ? 'blur(20px)' : 'none',
      transition: 'all 0.3s ease',
    }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '72px' }}>

        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', zIndex: 100 }}>
          <Globe size={24} color="var(--lime)" strokeWidth={2.5} />
          <span style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--text-1)' }}>
            AdelantaVisa
          </span>
        </Link>

        {/* Links */}
        <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
          {[['Características', 'features']].map(([label, id]) => (
            <button key={id} onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-2)', fontWeight: 500, padding: 0, transition: 'color 0.2s' }}
              onMouseOver={e => e.currentTarget.style.color = 'var(--text-1)'}
              onMouseOut={e => e.currentTarget.style.color = 'var(--text-2)'}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-2)', fontWeight: 500, padding: '0.5rem 1rem', transition: 'color 0.2s' }}
            onMouseOver={e => e.currentTarget.style.color = 'var(--text-1)'}
            onMouseOut={e => e.currentTarget.style.color = 'var(--text-2)'}
          >
            Iniciar Sesión
          </button>
          <button onClick={() => navigate('/register')} className="btn btn-lime" style={{ fontSize: '0.875rem', padding: '0.5rem 1.25rem' }}>
            Registrarse
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
