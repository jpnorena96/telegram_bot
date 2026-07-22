import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../../../services/api';

const UserModal = ({ isOpen, onClose, user, onSuccess }) => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    whatsapp_number: '',
    password: '',
    role: 'NATURAL_PERSON',
    plan: 'platino',
    is_authorized: true
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.name || '',
        email: user.email || '',
        whatsapp_number: user.whatsapp_number || '',
        password: '',
        role: user.role || 'NATURAL_PERSON',
        plan: user.plan || 'platino',
        is_authorized: user.status === 'Activo'
      });
    } else {
      setFormData({
        full_name: '',
        email: '',
        whatsapp_number: '',
        password: '',
        role: 'NATURAL_PERSON',
        plan: 'platino',
        is_authorized: true
      });
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (user) {
        // Edit mode (remove empty password)
        const payload = { ...formData };
        if (!payload.password) delete payload.password;
        await api.updateUser(user.id, payload);
        toast.success('Usuario actualizado correctamente');
      } else {
        // Create mode
        if (!formData.password) {
          toast.error('La contraseña es requerida para un nuevo usuario');
          setSubmitting(false);
          return;
        }
        await api.createUser(formData);
        toast.success('Usuario creado correctamente');
      }
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Error al guardar el usuario');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div className="animate-in" style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        width: '90%', maxWidth: '500px',
        padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0 }}>{user ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
          <button onClick={onClose} className="btn btn-icon" style={{ border: 'none', background: 'transparent' }}><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>Nombre Completo</label>
              <input name="full_name" className="input-field" value={formData.full_name} onChange={handleChange} required />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>Correo Electrónico</label>
              <input type="email" name="email" className="input-field" value={formData.email} onChange={handleChange} required />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>WhatsApp (con indicativo)</label>
              <input type="tel" name="whatsapp_number" className="input-field" value={formData.whatsapp_number} onChange={handleChange} placeholder="+57300..." />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>
                Contraseña {user && <span style={{ fontSize: '0.65rem' }}>(Opcional)</span>}
              </label>
              <input type="password" name="password" className="input-field" value={formData.password} onChange={handleChange} placeholder={user ? "Dejar en blanco para no cambiar" : "Contraseña..."} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>Rol</label>
              <select name="role" className="input-field" value={formData.role} onChange={handleChange}>
                <option value="NATURAL_PERSON">Persona Natural</option>
                <option value="TRAVEL_AGENCY">Agencia de Viajes</option>
                <option value="VISA_MANAGER">Visa Manager</option>
                <option value="AUDITOR">Auditor</option>
                <option value="ADMINISTRATOR">Administrador</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>Plan</label>
              <select name="plan" className="input-field" value={formData.plan} onChange={handleChange}>
                <option value="platino">Platino (Sin límite)</option>
                <option value="oro">Oro (12 agendamientos)</option>
                <option value="diamante">Diamante</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
            <input type="checkbox" name="is_authorized" id="is_authorized" checked={formData.is_authorized} onChange={handleChange} />
            <label htmlFor="is_authorized" style={{ fontSize: '0.85rem' }}>Usuario Autorizado (Activo)</label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
            <button type="button" className="btn btn-sm" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-sm btn-lime" disabled={submitting}>
              {submitting ? 'Guardando...' : 'Guardar Usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;
