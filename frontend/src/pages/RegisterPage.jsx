import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Plane, Mail, Lock, User, Briefcase } from 'lucide-react';
import { api } from '../services/api';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ 
    full_name: '',
    email: '', 
    password: '',
    role: 'NATURAL_PERSON'
  });
  const [isLoading, setIsLoading] = useState(false);

  const roles = [
    { id: 'NATURAL_PERSON', label: 'Persona Natural', desc: 'Para trámites personales o familiares' },
    { id: 'VISA_MANAGER', label: 'Gestor de Visa', desc: 'Independiente que gestiona visas para otros' },
    { id: 'TRAVEL_AGENCY', label: 'Agencia de Viajes', desc: 'Empresa especializada en turismo y visados' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { access_token, role, user_name } = await api.register(formData);
      localStorage.setItem('token', access_token);
      localStorage.setItem('userRole', role);
      localStorage.setItem('userName', user_name);
      navigate('/dashboard');
    } catch (err) {
      alert(err.message || 'Error al registrarte');
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
          maxWidth: '550px', 
          padding: '3rem 2.5rem',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{
          position: 'absolute',
          bottom: '-50px',
          left: '-50px',
          width: '200px',
          height: '200px',
          background: 'var(--secondary-light)',
          filter: 'blur(100px)',
          opacity: 0.15,
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
            Crea tu Cuenta
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Únete a la mejor plataforma de gestión de visas
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label" htmlFor="fullName">Nombre Completo / Razón Social</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input 
                id="fullName"
                type="text" 
                className="input-field" 
                placeholder="Juan Pérez"
                style={{ paddingLeft: '3rem' }}
                value={formData.full_name}
                onChange={e => setFormData({...formData, full_name: e.target.value})}
                required
              />
            </div>
          </div>

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
          </div>

          <div className="input-group">
             <label className="input-label" htmlFor="password">Contraseña</label>
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

          <div className="input-group" style={{ marginBottom: '2rem' }}>
            <label className="input-label">Tipo de Cuenta</label>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {roles.map((role) => (
                <div 
                  key={role.id}
                  onClick={() => setFormData({...formData, role: role.id})}
                  style={{
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    border: `2px solid ${formData.role === role.id ? 'var(--primary-color)' : 'var(--border-color, #e2e8f0)'}`,
                    background: formData.role === role.id ? 'rgba(59, 130, 246, 0.05)' : 'var(--surface-color)',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                  }}
                >
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    border: `2px solid ${formData.role === role.id ? 'var(--primary-color)' : '#cbd5e1'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {formData.role === role.id && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--primary-color)' }} />}
                  </div>
                  <div>
                    <h4 style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{role.label}</h4>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{role.desc}</p>
                  </div>
                </div>
              ))}
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
              <><UserPlus size={20} /> Registrarse</>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-secondary)' }}>
          ¿Ya tienes una cuenta? <Link to="/login" style={{ fontWeight: 600 }}>Inicia Sesión</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
