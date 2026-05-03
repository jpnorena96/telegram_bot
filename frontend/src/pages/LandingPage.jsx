import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, Shield, Clock, Zap } from 'lucide-react';

/* ─── animated counter ─── */
const useCount = (target, dur = 2000) => {
  const [v, setV] = useState(0);
  useEffect(() => {
    let s = 0;
    const step = target / (dur / 16);
    const t = setInterval(() => { s += step; if (s >= target) { setV(target); clearInterval(t); } else setV(Math.floor(s)); }, 16);
    return () => clearInterval(t);
  }, [target]);
  return v;
};

const FEATURES = [
  { icon: Clock, title: 'Monitoreo 24/7 Global', desc: 'Nuestro motor vigila la disponibilidad en embajadas y consulados americanos en todo el mundo, sin interrupciones.' },
  { icon: Zap, title: 'Adelanto Transfronterizo', desc: 'Al detectar cancelaciones en cualquier delegación, el sistema asegura tu nueva cita en milisegundos.' },
  { icon: Shield, title: 'Cobertura Multi-País', desc: 'Gestiona aplicaciones desde múltiples ubicaciones geográficas bajo una sola interfaz centralizada y segura.' }
];

const LandingPage = () => {
  const navigate = useNavigate();
  const c1 = useCount(5800);
  const c2 = useCount(147);

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>

      {/* ─── Background Orbs (Spatial Feel) ─── */}
      <div style={{ position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)', width: '80vw', height: '600px', background: 'radial-gradient(ellipse at top, rgba(99, 102, 241, 0.15) 0%, transparent 70%)', filter: 'blur(60px)', zIndex: 0, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '20%', right: '-10%', width: '40vw', height: '400px', background: 'radial-gradient(circle, rgba(6, 182, 212, 0.1) 0%, transparent 60%)', filter: 'blur(50px)', zIndex: 0, pointerEvents: 'none' }} />

      {/* ════════ HERO ════════ */}
      <section style={{ position: 'relative', zIndex: 1, padding: '10rem 2rem 6rem', textAlign: 'center', maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        {/* Pill badge */}
        <div className="animate-in" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-2)', marginBottom: '2.5rem', backdropFilter: 'blur(10px)' }}>
          <Sparkles size={14} color="var(--accent-2)" />
          <span>Gestión Global de Visas Americanas B1/B2</span>
        </div>

        {/* Main headline */}
        <h1 className="animate-in" style={{ fontSize: 'clamp(3rem, 6vw, 5.5rem)', fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: '2rem', animationDelay: '0.1s' }}>
          Adelanta tu visa americana <br />
          <span className="text-gradient-accent">desde cualquier país.</span>
        </h1>

        {/* Subhead */}
        <p className="animate-in" style={{ fontSize: '1.25rem', color: 'var(--text-2)', maxWidth: '650px', margin: '0 auto 3.5rem', lineHeight: 1.6, animationDelay: '0.2s' }}>
          La infraestructura más avanzada a nivel mundial para gestionar, monitorear y adelantar citas consulares de visa americana. Sin fricción, sin fronteras.
        </p>

        {/* CTAs */}
        <div className="animate-in" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', animationDelay: '0.3s' }}>
          <button onClick={() => navigate('/register')} className="btn btn-lime" style={{ padding: '0.875rem 2rem', fontSize: '1rem' }}>
            Gestionar Mi Visa <ArrowRight size={18} />
          </button>
          <button onClick={() => navigate('/login')} className="btn btn-outline" style={{ padding: '0.875rem 2rem', fontSize: '1rem' }}>
            Acceso Global
          </button>
        </div>

      </section>

      {/* ════════ GLOWING STATS DASHBOARD ════════ */}
      <section style={{ position: 'relative', zIndex: 1, padding: '0 2rem 8rem' }}>
        <div className="panel animate-in" style={{ maxWidth: '1000px', margin: '0 auto', padding: '1px', background: 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)', borderRadius: '24px', animationDelay: '0.4s' }}>
          <div style={{ background: 'var(--surface-2)', borderRadius: '23px', padding: '4rem 2rem', display: 'flex', justifyContent: 'space-around', alignItems: 'center', flexWrap: 'wrap', gap: '3rem' }}>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '4rem', fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1, marginBottom: '0.5rem' }} className="text-gradient">{c1.toLocaleString()}+</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-3)', fontWeight: 500 }}>Citas Adelantadas</div>
            </div>

            <div style={{ width: '1px', height: '80px', background: 'var(--border)' }} />

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '4rem', fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1, marginBottom: '0.5rem' }} className="text-gradient">{c2}</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-3)', fontWeight: 500 }}>Días ahorrados promedio</div>
            </div>

          </div>
        </div>
      </section>

      {/* ════════ FEATURES GRID ════════ */}
      <section id="features" style={{ position: 'relative', zIndex: 1, padding: '6rem 2rem', background: 'var(--surface)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.03em', marginBottom: '1rem' }} className="text-gradient">Infraestructura Premium</h2>
            <p style={{ color: 'var(--text-2)', fontSize: '1.125rem' }}>Diseñado para la máxima eficiencia y velocidad.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            {FEATURES.map((f, i) => (
              <div key={i} className="panel" style={{ padding: '2.5rem', transition: 'transform 0.3s ease', cursor: 'default' }} onMouseOver={e => e.currentTarget.style.transform='translateY(-4px)'} onMouseOut={e => e.currentTarget.style.transform='translateY(0)'}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: 'var(--text-1)' }}>
                  <f.icon size={24} strokeWidth={1.5} />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem' }}>{f.title}</h3>
                <p style={{ color: 'var(--text-2)', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ FOOTER ════════ */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '3rem 2rem', position: 'relative', zIndex: 1, background: 'var(--bg)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-3)', fontSize: '0.875rem' }}>
          <div>© 2026 GlobalVisas.</div>
          <div style={{ display: 'flex', gap: '2rem' }}>
            <a href="#">Privacidad</a>
            <a href="#">Términos</a>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
