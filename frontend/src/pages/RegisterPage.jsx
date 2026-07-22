import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Globe, ArrowRight, ShieldCheck, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: '', email: '', password: '', role: 'NATURAL_PERSON', whatsapp_number: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.register(form);
      toast.success('Cuenta creada. Inicia sesión.');
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Error en el registro. Verifique sus datos e intente de nuevo.');
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
          <div style={{ width: '100%', maxWidth: '440px', margin: '2rem 0' }}>
            
            <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
              <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--text-1)', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
                Crea tu cuenta
              </h1>
              <p style={{ color: 'var(--text-2)', fontSize: '0.95rem' }}>
                Únete a la plataforma líder en gestión de visas B1/B2.
              </p>
            </div>

            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
                {/* Tipo de Cuenta */}
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-1)', marginBottom: '0.5rem' }}>
                    Tipo de Cuenta
                  </label>
                  <select
                    value={form.role}
                    onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                    style={{
                      width: '100%', padding: '0.85rem 1rem', borderRadius: '10px',
                      border: '1px solid var(--border-2)', background: 'var(--bg)',
                      color: 'var(--text-1)', fontSize: '0.95rem', transition: 'all 0.2s',
                      outline: 'none', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.01)',
                      appearance: 'none', cursor: 'pointer'
                    }}
                    onFocus={e => { e.target.style.borderColor = 'var(--lime)'; e.target.style.boxShadow = '0 0 0 3px var(--lime-subtle)'; }}
                    onBlur={e => { e.target.style.borderColor = 'var(--border-2)'; e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.01)'; }}
                  >
                    <option value="NATURAL_PERSON">Solicitante Individual (B2C)</option>
                    <option value="TRAVEL_AGENCY">Agencia / Gestor (B2B)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-1)', marginBottom: '0.5rem' }}>
                  Nombre Completo / Razón Social
                </label>
                <input
                  type="text"
                  placeholder="Tu nombre o el de tu agencia"
                  value={form.full_name}
                  onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
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
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-1)', marginBottom: '0.5rem' }}>
                  Número de WhatsApp (con indicativo, ej. +5731...)
                </label>
                <input
                  type="tel"
                  placeholder="+573161234567"
                  value={form.whatsapp_number}
                  onChange={e => setForm(f => ({ ...f, whatsapp_number: e.target.value }))}
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
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-1)', marginBottom: '0.5rem' }}>
                  Correo Electrónico Corporativo o Personal
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
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-1)', marginBottom: '0.5rem' }}>
                  Contraseña Segura
                </label>
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
                {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
                {!loading && <UserPlus size={18} />}
              </button>
            </form>

            <div style={{ marginTop: '2.5rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-2)' }}>
              ¿Ya estás registrado?{' '}
              <Link to="/login" style={{ color: 'var(--lime)', fontWeight: 700, textDecoration: 'none' }}>
                Inicia sesión aquí
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
          <Globe size={48} color="rgba(255,255,255,0.8)" style={{ marginBottom: '2rem' }} />
          <h2 style={{ fontSize: '3.5rem', fontFamily: 'var(--font-heading)', fontWeight: 700, lineHeight: 1.1, marginBottom: '1.5rem', letterSpacing: '-0.03em' }}>
            Tu pasaporte al mundo.
          </h2>
          <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.7)', maxWidth: '400px', lineHeight: 1.7 }}>
            Únete a cientos de agencias y clientes particulares que ya gestionan sus trámites con tecnología de vanguardia.
          </p>
          
          <div style={{ display: 'flex', gap: '2rem', marginTop: '4rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem' }}>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>+5k</div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Perfiles Gestionados</div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>B2B/C</div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Soluciones Integrales</div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default RegisterPage;
