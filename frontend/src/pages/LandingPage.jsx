import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Clock, Globe2, ArrowRight, UserCheck } from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description, delay }) => (
  <div 
    className="glass hover-scale animate-fade-in" 
    style={{ 
      padding: '2rem', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      textAlign: 'center',
      animationDelay: `${delay}s`
    }}
  >
    <div style={{
      background: 'rgba(59, 130, 246, 0.1)',
      padding: '1rem',
      borderRadius: '50%',
      marginBottom: '1.5rem',
      color: 'var(--primary-color)'
    }}>
      <Icon size={32} />
    </div>
    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>{title}</h3>
    <p style={{ color: 'var(--text-secondary)' }}>{description}</p>
  </div>
);

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{ width: '100%' }}>
      {/* Hero Section */}
      <section style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        padding: '4rem 1rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background Decorative Elements */}
        <div style={{
          position: 'absolute',
          top: '-10%',
          right: '-5%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(255,255,255,0) 70%)',
          borderRadius: '50%',
          zIndex: -1
        }} />
        <div style={{
          position: 'absolute',
          bottom: '10%',
          left: '-10%',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(217,119,6,0.1) 0%, rgba(255,255,255,0) 70%)',
          borderRadius: '50%',
          zIndex: -1
        }} />

        <div className="container" style={{ textAlign: 'center', maxWidth: '800px' }}>
          <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <span style={{
              display: 'inline-block',
              padding: '0.5rem 1rem',
              background: 'rgba(59, 130, 246, 0.1)',
              color: 'var(--primary-dark)',
              borderRadius: 'var(--radius-full)',
              fontWeight: 600,
              fontSize: '0.875rem',
              marginBottom: '1.5rem',
              border: '1px solid rgba(59, 130, 246, 0.2)'
            }}>
              Tu Pasaporte a Nuevas Oportunidades
            </span>
          </div>
          
          <h1 className="animate-fade-in" style={{ 
            fontSize: 'clamp(2.5rem, 5vw, 4rem)', 
            fontWeight: 800, 
            lineHeight: 1.2, 
            marginBottom: '1.5rem',
            animationDelay: '0.2s',
            color: 'var(--text-primary)'
          }}>
            Gestión Inteligente de <br/>
            <span style={{ 
              background: 'linear-gradient(135deg, var(--primary-light), var(--primary-color))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>Visas Americanas</span>
          </h1>
          
          <p className="animate-fade-in" style={{ 
            fontSize: '1.25rem', 
            color: 'var(--text-secondary)', 
            marginBottom: '2.5rem',
            animationDelay: '0.3s',
            maxWidth: '600px',
            margin: '0 auto 2.5rem'
          }}>
            Ofrecemos asesoría migratoria experta y gestionamos el adelanto de tus citas para la visa americana de manera rápida, segura y profesional.
          </p>
          
          <div className="flex justify-center gap-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <button 
              className="btn btn-primary" 
              style={{ fontSize: '1.125rem', padding: '0.75rem 2rem' }}
              onClick={() => navigate('/register')}
            >
              Comenzar Ahora <ArrowRight size={20} style={{ marginLeft: '0.5rem' }} />
            </button>
            <button 
              className="btn btn-secondary"
              style={{ fontSize: '1.125rem', padding: '0.75rem 2rem', background: 'var(--surface-color)' }}
              onClick={() => document.getElementById('servicios').scrollIntoView({ behavior: 'smooth' })}
            >
              Conocer Más
            </button>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="servicios" style={{ padding: '6rem 1rem', background: 'var(--surface-color)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>
              Nuestros Servicios
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem', maxWidth: '600px', margin: '0 auto' }}>
              Nos adaptamos a las necesidades de personas, agencias de viajes y gestores independientes.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem'
          }}>
            <FeatureCard 
              delay={0.1}
              icon={Globe2}
              title="Asesoría Migratoria"
              description="Análisis personalizado de tu perfil para maximizar las probabilidades de aprobación de tu visa. Te preparamos para tu entrevista."
            />
            <FeatureCard 
              delay={0.2}
              icon={Clock}
              title="Adelanto de Citas"
              description="Aceleramos tu proceso consiguiendo citas más cercanas gracias a nuestro sistema de monitoreo constante 24/7."
            />
            <FeatureCard 
              delay={0.3}
              icon={UserCheck}
              title="Perfiles Especializados"
              description="Plataformas dedicadas para Gestores de Visas, Agencias de Viaje y Personas Naturales para una gestión eficiente."
            />
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section style={{ padding: '6rem 1rem' }}>
        <div className="container glass" style={{
          padding: '4rem 2rem',
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.05), rgba(59, 130, 246, 0.05))'
        }}>
          <ShieldCheck size={48} style={{ color: 'var(--primary-color)', margin: '0 auto 1.5rem' }} />
          <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
            Seguridad y Confidencialidad
          </h2>
          <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', maxWidth: '700px', margin: '0 auto 2rem' }}>
            Tus datos están protegidos bajo los más altos estándares de seguridad. Nuestro sistema multi-rol asegura que cada usuario (Auditor, Gestor, Administrador) interactúe en un entorno controlado y auditable.
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/register')}>
            Crea tu Cuenta Segura
          </button>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
