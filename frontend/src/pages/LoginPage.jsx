import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Globe, ArrowRight, ShieldCheck } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { access_token, role, user_name } = await api.login(form.email, form.password);
      localStorage.setItem('token', access_token);
      localStorage.setItem('userRole', role);
      localStorage.setItem('userName', user_name);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Credenciales inválidas. Por favor, intente de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--surface)' }}>
      
      {/* ── LEFT: Form Section ── */}
      <div style={{ flex: '1 1 50%', display: 'flex', flexDirection: 'column', padding: '2rem' }}>
        
        {/* Header / Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <Globe size={28} color="var(--lime)" strokeWidth={2.5} />
          <span style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--text-1)' }}>
            AdelantaVisa
          </span>
        </div>

        {/* Form Container */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ width: '100%', maxWidth: '400px' }}>
            
            <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
              <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--text-1)', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
                Bienvenido de vuelta
              </h1>
              <p style={{ color: 'var(--text-2)', fontSize: '0.95rem' }}>
                Ingresa tus credenciales para acceder a tu panel.
              </p>
            </div>

            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-1)', marginBottom: '0.5rem' }}>
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  placeholder="ejemplo@empresa.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  required
                  style={{
                    width: '100%', padding: '0.85rem 1rem', borderRadius: '10px',
                    border: '1px solid var(--border-2)', background: 'var(--bg)',
                    color: 'var(--text-1)', fontSize: '0.95rem', transition: 'all 0.2s',
                    outline: 'none', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.01)'
                  }}
                  onFocus={e => { e.target.style.borderColor = 'var(--lime)'; e.target.style.boxShadow = '0 0 0 3px var(--lime-subtle)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--border-2)'; e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.01)'; }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-1)' }}>
                    Contraseña
                  </label>
                  <a href="#" style={{ fontSize: '0.8rem', color: 'var(--lime)', fontWeight: 600, textDecoration: 'none' }}>
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required
                  style={{
                    width: '100%', padding: '0.85rem 1rem', borderRadius: '10px',
                    border: '1px solid var(--border-2)', background: 'var(--bg)',
                    color: 'var(--text-1)', fontSize: '0.95rem', transition: 'all 0.2s',
                    outline: 'none', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.01)'
                  }}
                  onFocus={e => { e.target.style.borderColor = 'var(--lime)'; e.target.style.boxShadow = '0 0 0 3px var(--lime-subtle)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--border-2)'; e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.01)'; }}
                />
              </div>

              {error && (
                <div style={{ padding: '0.85rem', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', fontSize: '0.85rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShieldCheck size={16} /> {error}
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading} 
                style={{
                  width: '100%', padding: '0.9rem', borderRadius: '10px',
                  background: 'var(--lime)', color: '#fff', fontSize: '1rem',
                  fontWeight: 600, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  marginTop: '0.5rem', transition: 'all 0.2s',
                  boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)'
                }}
                onMouseOver={e => !loading && (e.currentTarget.style.background = 'var(--lime-dim)')}
                onMouseOut={e => !loading && (e.currentTarget.style.background = 'var(--lime)')}
              >
                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>

            <div style={{ marginTop: '2.5rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-2)' }}>
              ¿Aún no tienes una cuenta?{' '}
              <Link to="/register" style={{ color: 'var(--lime)', fontWeight: 700, textDecoration: 'none' }}>
                Regístrate aquí
              </Link>
            </div>

          </div>
        </div>
      </div>

      {/* ── RIGHT: Visual / Branding Section ── */}
      <div style={{ flex: '1 1 50%', display: 'none', '@media (min-width: 900px)': { display: 'block' }, position: 'relative', background: 'var(--lime)', overflow: 'hidden' }} className="hide-mobile">
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, var(--lime) 0%, #312E81 100%)' }} />
        
        {/* Decorative elements */}
        <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '600px', height: '600px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', bottom: '-20%', left: '-10%', width: '500px', height: '500px', borderRadius: '50%', background: 'rgba(139, 92, 246, 0.15)', filter: 'blur(80px)' }} />

        <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '4rem', color: '#fff' }}>
          <ShieldCheck size={48} color="rgba(255,255,255,0.8)" style={{ marginBottom: '2rem' }} />
          <h2 style={{ fontSize: '3.5rem', fontFamily: 'var(--font-heading)', fontWeight: 700, lineHeight: 1.1, marginBottom: '1.5rem', letterSpacing: '-0.03em' }}>
            Acelera tu movilidad global.
          </h2>
          <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.7)', maxWidth: '400px', lineHeight: 1.7 }}>
            Infraestructura tecnológica corporativa para asegurar y adelantar trámites consulares B1/B2 con la máxima eficiencia.
          </p>
          
          <div style={{ display: 'flex', gap: '2rem', marginTop: '4rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem' }}>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>98%</div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tasa de Éxito</div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>24/7</div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Monitoreo Constante</div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default LoginPage;
