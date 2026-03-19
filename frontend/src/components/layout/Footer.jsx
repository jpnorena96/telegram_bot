import React from 'react';

const Footer = () => {
  return (
    <footer style={{
      background: 'var(--surface-color)',
      padding: '4rem 0 2rem',
      marginTop: 'auto',
      borderTop: '1px solid var(--border-color, #e2e8f0)'
    }}>
      <div className="container" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '2rem',
        marginBottom: '3rem'
      }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--primary-color)' }}>GlobalVisas</h3>
          <p style={{ color: 'var(--text-secondary)' }}>
            Expertos en asesoría migratoria y gestión de visas americanas. Hacemos tu proceso más rápido y seguro.
          </p>
        </div>
        <div>
          <h4 style={{ fontWeight: 600, marginBottom: '1rem' }}>Enlaces Rápidos</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li><a href="/" style={{ color: 'var(--text-secondary)' }}>Inicio</a></li>
            <li><a href="#servicios" style={{ color: 'var(--text-secondary)' }}>Servicios</a></li>
            <li><a href="/login" style={{ color: 'var(--text-secondary)' }}>Iniciar Sesión</a></li>
            <li><a href="/register" style={{ color: 'var(--text-secondary)' }}>Registrarse</a></li>
          </ul>
        </div>
        <div>
          <h4 style={{ fontWeight: 600, marginBottom: '1rem' }}>Contacto</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--text-secondary)' }}>
            <li>📞 +57 300 000 0000</li>
            <li>✉️ contacto@globalvisas.com</li>
            <li>🏢 Bogotá, Colombia</li>
          </ul>
        </div>
      </div>
      <div className="container" style={{
        textAlign: 'center',
        paddingTop: '2rem',
        borderTop: '1px solid var(--border-color, #e2e8f0)',
        color: 'var(--text-secondary)',
        fontSize: '0.875rem'
      }}>
        © {new Date().getFullYear()} GlobalVisas. Todos los derechos reservados.
      </div>
    </footer>
  );
};

export default Footer;
