import React from 'react';
import { Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

const linkStyle = { color: 'var(--text-2)', textDecoration: 'none' };

const Footer = () => {
  return (
    <footer style={{
      background: 'var(--surface-color)',
      padding: '4rem 0 2rem',
      marginTop: 'auto',
      borderTop: '1px solid var(--border-color, #e2e8f0)'
    }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '3rem', marginBottom: '3rem' }}>
          
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Globe size={24} color="var(--lime)" strokeWidth={2.5} />
              <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--text-1)' }}>AdelantaVisa</h3>
            </div>
            <p style={{ color: 'var(--text-3)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Especialistas en procesos migratorios. Facilitamos tu camino hacia nuevas oportunidades globales con tecnología y experiencia.
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-1)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Navegación</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li><Link to="/#inicio" style={linkStyle}>Inicio</Link></li>
              <li><Link to="/#servicios" style={linkStyle}>Servicios</Link></li>
              <li><Link to="/#proceso" style={linkStyle}>Proceso</Link></li>
              <li><Link to="/#contacto" style={linkStyle}>Contacto</Link></li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-1)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contacto</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--text-3)', fontSize: '0.9rem' }}>
              <li>📍 Business Center, Bogotá</li>
              <li>✉️ contacto@adelantavisa.com</li>
              <li>📞 +57 (300) 123-4567</li>
            </ul>
          </div>
        </div>

        <div style={{ paddingTop: '2rem', borderTop: '1px solid var(--border)', textAlign: 'center', color: 'var(--text-3)', fontSize: '0.85rem' }}>
          © {new Date().getFullYear()} AdelantaVisa. Todos los derechos reservados.
        </div>
    </footer>
  );
};

export default Footer;
