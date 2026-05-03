import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';

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
      setError(err.message || 'ERROR_AUTH: Credenciales inválidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex' }}>
      {/* ── LEFT: Graphic panel ── */}
      <div style={{ width: '45%', borderRight: '4px solid var(--black)', padding: '4rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: 'var(--black)', color: 'var(--bg)' }}>
        
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--lime)', marginBottom: '4rem' }}>
            GLOBALVISAS ///
          </div>

          <div style={{ fontSize: '10rem', fontWeight: 900, lineHeight: 0.8, letterSpacing: '-0.05em', color: 'var(--bg)', marginBottom: '2rem' }}>
            GV
          </div>

          <div style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-0.02em' }}>
            ACCESO RESTRINGIDO
          </div>
          <div style={{ fontSize: '1rem', color: 'var(--text-3)', lineHeight: 1.6, maxWidth: '360px', fontWeight: 500 }}>
            Plataforma estructural de monitoreo y gestión consular. Exclusivo para operadores registrados.
          </div>
        </div>

        <div style={{ borderTop: '2px solid var(--text-3)', paddingTop: '2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            {[
              { label: 'UPTIME',  val: '99.9%' },
              { label: 'BOT',     val: 'ONLINE' },
              { label: 'API',     val: 'v2.0' },
            ].map(s => (
              <div key={s.label}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-3)', fontWeight: 700 }}>{s.label}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--lime)' }}>{s.val}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT: Login form ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem' }}>
        <div style={{ width: '100%', maxWidth: '460px' }}>

          <div style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '3rem', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1, marginBottom: '0.5rem' }}>IDENTIFICACIÓN</h2>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', color: 'var(--lime)', fontWeight: 700 }}>INGRESE CREDENCIALES</div>
          </div>

          <form onSubmit={submit}>
            {/* Email */}
            <div className="input-group">
              <label className="input-label">EMAIL_ADDRESS</label>
              <input
                id="login-email"
                type="email"
                className="input-field"
                placeholder="usuario@dominio.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div className="input-group" style={{ marginBottom: '2rem' }}>
              <label className="input-label">PASSWORD_HASH</label>
              <input
                id="login-password"
                type="password"
                className="input-field"
                placeholder="••••••••••••"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
                autoComplete="current-password"
              />
            </div>

            {/* Error */}
            {error && (
              <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--orange)', color: 'var(--bg)', fontFamily: 'var(--font-mono)', fontSize: '0.875rem', fontWeight: 700, border: '2px solid var(--black)' }}>
                {error}
              </div>
            )}

            {/* Submit */}
            <button id="login-submit" type="submit" disabled={loading} className="btn btn-lime" style={{ width: '100%', padding: '1rem', fontSize: '1rem' }}>
              {loading ? (
                <><div className="spinner" style={{ borderTopColor: 'var(--bg)', borderColor: 'rgba(255,255,255,0.2)', width: '16px', height: '16px' }} />&nbsp;AUTENTICANDO...</>
              ) : (
                <>INICIAR SESIÓN</>
              )}
            </button>
          </form>

          {/* Footer links */}
          <div style={{ marginTop: '2rem', borderTop: '2px solid var(--black)', paddingTop: '2rem', display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '0.875rem', fontWeight: 700 }}>
            <Link to="/register" style={{ color: 'var(--lime)' }}>CREAR CUENTA</Link>
            <a href="#" style={{ color: 'var(--text-3)' }}>RECUPERAR ACCESO</a>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LoginPage;
