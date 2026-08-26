import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { ShieldCheck, UserPlus, FileText, CalendarClock, Globe } from 'lucide-react';
import logoImg from '../assets/Logo.jpeg';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'NATURAL_PERSON',
    whatsapp_number: '',
    module_visa_enabled: true,
    module_appointments_enabled: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!termsAccepted) {
      setError('Debes aceptar los Términos y Condiciones para crear tu cuenta.');
      return;
    }
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

  const setModulePreference = (visa, apt) => {
    setForm(f => ({ ...f, module_visa_enabled: visa, module_appointments_enabled: apt }));
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--surface)' }}>

      {/* ── LEFT: Form Section ── */}
      <div style={{ flex: '1 1 50%', display: 'flex', flexDirection: 'column', padding: '2rem' }}>

        {/* Header / Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <img src={logoImg} alt="AdelantaVisa" style={{ height: 32, width: 'auto', borderRadius: '4px' }} />
        </div>

        {/* Form Container */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '1rem 0' }}>
          <div style={{ width: '100%', maxWidth: '480px', margin: '2rem 0' }}>

            <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
              <h1 style={{ fontSize: '2.2rem', fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--text-1)', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
                Crea tu cuenta
              </h1>
              <p style={{ color: 'var(--text-2)', fontSize: '0.95rem' }}>
                Únete a la plataforma líder en gestión de visas.
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

              {/* Module Interest Selection */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-1)', marginBottom: '0.5rem' }}>
                  ¿Qué servicio necesitas principalmente?
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                  <div
                    onClick={() => setModulePreference(true, false)}
                    style={{
                      padding: '1rem 0.5rem', borderRadius: '10px', textAlign: 'center', cursor: 'pointer',
                      border: form.module_visa_enabled && !form.module_appointments_enabled ? '2px solid var(--lime)' : '1px solid var(--border-2)',
                      background: form.module_visa_enabled && !form.module_appointments_enabled ? 'var(--lime-subtle)' : 'var(--bg)',
                      transition: 'all 0.2s'
                    }}>
                    <FileText size={24} color={form.module_visa_enabled && !form.module_appointments_enabled ? 'var(--lime)' : 'var(--text-3)'} style={{ margin: '0 auto 0.5rem auto' }} />
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-1)' }}>Solo Trámite de formulario</div>
                  </div>

                  <div
                    onClick={() => setModulePreference(false, true)}
                    style={{
                      padding: '1rem 0.5rem', borderRadius: '10px', textAlign: 'center', cursor: 'pointer',
                      border: !form.module_visa_enabled && form.module_appointments_enabled ? '2px solid var(--lime)' : '1px solid var(--border-2)',
                      background: !form.module_visa_enabled && form.module_appointments_enabled ? 'var(--lime-subtle)' : 'var(--bg)',
                      transition: 'all 0.2s'
                    }}>
                    <CalendarClock size={24} color={!form.module_visa_enabled && form.module_appointments_enabled ? 'var(--lime)' : 'var(--text-3)'} style={{ margin: '0 auto 0.5rem auto' }} />
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-1)' }}>Solo Adelantar Cita</div>
                  </div>

                  <div
                    onClick={() => setModulePreference(true, true)}
                    style={{
                      padding: '1rem 0.5rem', borderRadius: '10px', textAlign: 'center', cursor: 'pointer',
                      border: form.module_visa_enabled && form.module_appointments_enabled ? '2px solid var(--lime)' : '1px solid var(--border-2)',
                      background: form.module_visa_enabled && form.module_appointments_enabled ? 'var(--lime-subtle)' : 'var(--bg)',
                      transition: 'all 0.2s'
                    }}>
                    <Globe size={24} color={form.module_visa_enabled && form.module_appointments_enabled ? 'var(--lime)' : 'var(--text-3)'} style={{ margin: '0 auto 0.5rem auto' }} />
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-1)' }}>Ambos Servicios</div>
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-1)', marginBottom: '0.5rem' }}>
                  Nombre Completo / Razón Social
                </label>
                <input
                  type="text"
                  name="name"
                  autoComplete="name"
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
                  name="tel"
                  autoComplete="tel"
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
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  name="email"
                  autoComplete="username"
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
                  name="password"
                  autoComplete="new-password"
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

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginTop: '0.5rem' }}>
                <input
                  type="checkbox"
                  id="terms"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  style={{ marginTop: '0.2rem', cursor: 'pointer', accentColor: 'var(--lime)', width: '1.2rem', height: '1.2rem' }}
                />
                <label htmlFor="terms" style={{ fontSize: '0.85rem', color: 'var(--text-2)', lineHeight: '1.5' }}>
                  He leído y acepto los <Link to="/terms" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-1)', fontWeight: 600, textDecoration: 'underline' }}>Términos, Condiciones y Políticas de Privacidad</Link>. Autorizo el tratamiento de mis datos personales según la Ley 1581 de 2012.
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', padding: '1rem', borderRadius: '10px',
                  background: 'var(--lime)', color: '#000', fontSize: '1.05rem',
                  fontWeight: 700, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  marginTop: '0.5rem', transition: 'all 0.2s',
                  boxShadow: '0 4px 12px rgba(189, 255, 0, 0.25)'
                }}
                onMouseOver={e => !loading && (e.currentTarget.style.transform = 'translateY(-2px)')}
                onMouseOut={e => !loading && (e.currentTarget.style.transform = 'translateY(0)')}
              >
                {loading ? 'Creando cuenta...' : 'Comenzar Ahora'}
                {!loading && <UserPlus size={18} />}
              </button>
            </form>

            <div style={{ marginTop: '2.5rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-2)' }}>
              ¿Ya tienes una cuenta?{' '}
              <Link to="/login" style={{ color: 'var(--text-1)', fontWeight: 700, textDecoration: 'none' }}>
                Inicia sesión aquí
              </Link>
            </div>

          </div>
        </div>
      </div>

      {/* ── RIGHT: Visual / Trust Section ── */}
      <div style={{ flex: '1 1 50%', position: 'relative', background: 'var(--lime)', overflow: 'hidden' }} className="hide-on-mobile">

        {/* Modern glowing background blobs */}
        <div style={{ position: 'absolute', top: '10%', left: '20%', width: '400px', height: '400px', borderRadius: '50%', background: 'var(--lime)', filter: 'blur(120px)', opacity: 0.15, animation: 'pulse 8s infinite alternate' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: '500px', height: '500px', borderRadius: '50%', background: '#3B82F6', filter: 'blur(120px)', opacity: 0.15, animation: 'pulse 10s infinite alternate-reverse' }} />

        {/* Floating cards / UI abstract elements */}
        <div style={{ position: 'absolute', right: '-5%', top: '25%', width: '300px', height: '150px', background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', transform: 'rotate(-5deg)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--lime)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CalendarClock size={20} color="#000" />
          </div>
          <div>
            <div style={{ height: '8px', width: '60%', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', marginBottom: '8px' }} />
            <div style={{ height: '8px', width: '40%', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }} />
          </div>
        </div>

        <div style={{ position: 'absolute', left: '10%', bottom: '20%', width: '250px', height: '120px', background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', transform: 'rotate(5deg)', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText size={20} color="#fff" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ height: '8px', width: '80%', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', marginBottom: '8px' }} />
            <div style={{ height: '8px', width: '50%', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }} />
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '4rem', color: '#fff' }}>
          <Globe size={48} color="var(--lime)" style={{ marginBottom: '2rem' }} />
          <h2 style={{ fontSize: '4rem', fontFamily: 'var(--font-heading)', fontWeight: 800, lineHeight: 1.1, marginBottom: '1.5rem', letterSpacing: '-0.03em' }}>
            Acelera<br /><span style={{ color: 'var(--lime)' }}>tu futuro.</span>
          </h2>
          <p style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.7)', maxWidth: '420px', lineHeight: 1.7, fontWeight: 300 }}>
            Plataforma premium para agencias y particulares. Automatiza tus citas B1/B2 y gestiona trámites en un solo lugar.
          </p>

          <div style={{ display: 'flex', gap: '3rem', marginTop: '4rem' }}>
            <div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: '#fff' }}>+5k</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--lime)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Citas Adelantadas</div>
            </div>
            <div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: '#fff' }}>100%</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--lime)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Garantizado</div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default RegisterPage;
