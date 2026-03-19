import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Plane, Mail, Lock } from 'lucide-react';
import { api } from '../services/api';

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { access_token, role, user_name } = await api.login(formData.email, formData.password);
      localStorage.setItem('token', access_token);
      localStorage.setItem('userRole', role);
      localStorage.setItem('userName', user_name);
      navigate('/dashboard');
    } catch (err) {
      alert(err.message || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen" style={{ padding: '2rem' }}>
      <div 
        className="glass animate-fade-in" 
        style={{ 
          width: '100%', 
          maxWidth: '450px', 
          padding: '3rem 2.5rem',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Decorative background glow */}
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '150px',
          height: '150px',
          background: 'var(--primary-light)',
          filter: 'blur(80px)',
          opacity: 0.2,
          zIndex: -1
        }} />

        <div className="text-center mb-8">
          <Link to="/" style={{ display: 'inline-block', marginBottom: '1.5rem' }}>
             <div style={{
              background: 'linear-gradient(135deg, var(--primary-light), var(--primary-color))',
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              color: 'white',
              display: 'inline-block'
            }}>
              <Plane size={32} />
            </div>
          </Link>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
            Bienvenido de nuevo
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Ingresa a tu portal de gestión de visas
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label" htmlFor="email">Correo Electrónico</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input 
                id="email"
                type="email" 
                className="input-field" 
                placeholder="ejemplo@correo.com"
                style={{ paddingLeft: '3rem' }}
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
            <p style={{fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem'}}>
              Tip: Usa admin@ para probar rol Administrador
            </p>
          </div>

          <div className="input-group" style={{ marginBottom: '2rem' }}>
            <div className="flex justify-between items-center" style={{ marginBottom: '0.5rem' }}>
               <label className="input-label" style={{ marginBottom: 0 }} htmlFor="password">Contraseña</label>
               <a href="#" style={{ fontSize: '0.875rem' }}>¿Olvidaste tu contraseña?</a>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input 
                id="password"
                type="password" 
                className="input-field" 
                placeholder="••••••••"
                style={{ paddingLeft: '3rem' }}
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary w-full"
            disabled={isLoading}
            style={{ padding: '0.875rem', fontSize: '1rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}
          >
            {isLoading ? (
              <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⟳</span>
            ) : (
              <><LogIn size={20} /> Iniciar Sesión</>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-secondary)' }}>
          ¿No tienes una cuenta? <Link to="/register" style={{ fontWeight: 600 }}>Regístrate aquí</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
