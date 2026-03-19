import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plane, User, LogIn } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="glass" style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      margin: '1rem',
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem 2rem'
      }}>
        {/* Logo */}
        <Link 
          to="/" 
          className="hover-scale"
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem', 
            textDecoration: 'none' 
          }}
        >
          <div style={{
            background: 'linear-gradient(135deg, var(--primary-light), var(--primary-color))',
            padding: '0.5rem',
            borderRadius: 'var(--radius-md)',
            color: 'white'
          }}>
            <Plane size={24} />
          </div>
          <span style={{ 
            fontSize: '1.25rem', 
            fontWeight: 700,
            background: 'linear-gradient(135deg, var(--primary-dark), var(--primary-light))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            GlobalVisas
          </span>
        </Link>

        {/* Navigation Links */}
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <a href="#servicios" style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>Servicios</a>
          <a href="#beneficios" style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>Beneficios</a>
          <a href="#contacto" style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>Contacto</a>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            className="btn btn-secondary hover-scale"
            onClick={() => navigate('/login')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <LogIn size={18} />
            Iniciar Sesión
          </button>
          <button 
            className="btn btn-primary hover-scale"
            onClick={() => navigate('/register')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <User size={18} />
            Registrarse
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
