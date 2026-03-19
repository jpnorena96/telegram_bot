import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { Settings, Save, Shield } from 'lucide-react';

const SettingsPage = () => {
  const { role } = useOutletContext();

  if (role !== 'ADMINISTRATOR') {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in" style={{ padding: '4rem 2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--danger-color)', marginBottom: '1rem' }}>
          Acceso Denegado
        </h2>
        <p style={{ color: 'var(--text-secondary)' }}>No tienes permisos para acceder a la configuración del sistema.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          Configuración del Sistema
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Ajustes generales, notificaciones y políticas de seguridad.
        </p>
      </div>

      <div style={{ display: 'grid', gap: '2rem', maxWidth: '800px' }}>
        <div className="glass" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <Settings size={24} style={{ color: 'var(--primary-color)' }} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>General</h2>
          </div>
          
          <div className="input-group">
            <label className="input-label">Nombre de la Aplicación</label>
            <input type="text" className="input-field" defaultValue="GlobalVisas Portal" />
          </div>
          <div className="input-group">
            <label className="input-label">Correo de Soporte Técnico</label>
            <input type="email" className="input-field" defaultValue="soporte@globalvisas.com" />
          </div>
        </div>

        <div className="glass" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <Shield size={24} style={{ color: 'var(--primary-color)' }} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>Seguridad</h2>
          </div>
          
          <div className="input-group" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <input type="checkbox" id="2fa" defaultChecked style={{ width: '20px', height: '20px' }} />
            <label htmlFor="2fa" style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
              Requerir Autenticación de Dos Factores (2FA) para Administradores
            </label>
          </div>
          
          <div className="input-group" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
            <input type="checkbox" id="audit" defaultChecked style={{ width: '20px', height: '20px' }} />
            <label htmlFor="audit" style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
              Registrar logs detallados para Auditoría
            </label>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button className="btn btn-secondary">Cancelar</button>
          <button className="btn btn-primary" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Save size={20} /> Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
