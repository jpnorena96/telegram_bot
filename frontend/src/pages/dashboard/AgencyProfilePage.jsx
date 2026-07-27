import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Store, Paintbrush, Link as LinkIcon, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

const AgencyProfilePage = () => {
  const { t } = useTranslation();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    alias: '',
    company_name: '',
    logo_url: '',
    brand_color: '#4F46E5'
  });

  const loadProfile = useCallback(async () => {
    try {
      const res = await api.getMyAgencyProfile();
      if (res.profile) {
        setProfile(res.profile);
        setFormData({
          alias: res.profile.alias,
          company_name: res.profile.company_name,
          logo_url: res.profile.logo_url || '',
          brand_color: res.profile.brand_color || '#4F46E5'
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...formData,
        alias: formData.alias.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase() // sanitize
      };
      const res = await api.updateMyAgencyProfile(payload);
      toast.success(res.message || 'Perfil actualizado con éxito');
      loadProfile();
    } catch (e) {
      toast.error(e.message || 'Error al actualizar perfil');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', display: 'flex', justifyContent: 'center' }}>
        <div className="skeleton" style={{ width: '400px', height: '300px', borderRadius: 'var(--radius-lg)' }} />
      </div>
    );
  }

  const publicLink = profile ? `${window.location.origin}/agencia/${profile.alias}` : '';

  return (
    <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px', margin: '0 auto' }}>
      
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-1)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Store size={24} style={{ color: 'var(--lime)' }} />
          Perfil de Agencia (Marca Blanca)
        </h1>
        <p style={{ color: 'var(--text-3)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          Configura la identidad de tu agencia. Esta información se usará para generar un enlace público y anónimo para que tus clientes suban sus documentos sin ver la marca "AdelantaVisa".
        </p>
      </div>

      {profile && (
        <div className="panel" style={{ display: 'flex', alignItems: 'center', justify-content: 'space-between', padding: '1.25rem', background: profile.status === 'approved' ? 'rgba(16, 185, 129, 0.05)' : 'rgba(245, 158, 11, 0.05)', border: `1px solid ${profile.status === 'approved' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)'}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {profile.status === 'approved' ? <CheckCircle2 size={24} style={{ color: '#10B981' }} /> : <AlertCircle size={24} style={{ color: '#F59E0B' }} />}
            <div>
              <div style={{ fontWeight: 600, color: profile.status === 'approved' ? '#10B981' : '#F59E0B' }}>
                ESTADO: {profile.status === 'approved' ? 'APROBADO Y ACTIVO' : 'PENDIENTE DE REVISIÓN'}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>
                {profile.status === 'approved' ? 'Tu enlace público está habilitado para ser usado por tus clientes.' : 'Un administrador está revisando tu perfil. El enlace público no estará disponible hasta la aprobación.'}
              </div>
            </div>
          </div>
        </div>
      )}

      {profile && profile.status === 'approved' && (
        <div className="panel" style={{ background: 'var(--surface)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <LinkIcon size={16} /> Tu Enlace Público
          </h3>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input type="text" readOnly value={publicLink} className="input-field" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }} />
            <button type="button" className="btn btn-outline" onClick={() => { navigator.clipboard.writeText(publicLink); toast.success('Enlace copiado'); }}>
              COPIAR
            </button>
            <a href={publicLink} target="_blank" rel="noopener noreferrer" className="btn btn-lime">
              VISITAR
            </a>
          </div>
        </div>
      )}

      <div className="panel" style={{ background: 'var(--surface)' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            <div className="input-group">
              <label className="input-label">Nombre Comercial de la Agencia</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="Ej. Viajes Globales SAS" 
                value={formData.company_name}
                onChange={e => setFormData({ ...formData, company_name: e.target.value })}
                required 
              />
            </div>
            
            <div className="input-group">
              <label className="input-label">Alias del Enlace (URL)</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="ej. viajes-globales" 
                value={formData.alias}
                onChange={e => setFormData({ ...formData, alias: e.target.value.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase() })}
                required 
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginTop: '0.25rem' }}>Solo letras minúsculas, números y guiones.</span>
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">URL del Logotipo (Opcional)</label>
            <input 
              type="url" 
              className="input-field" 
              placeholder="https://tudominio.com/logo.png" 
              value={formData.logo_url}
              onChange={e => setFormData({ ...formData, logo_url: e.target.value })}
            />
          </div>

          <div className="input-group">
            <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Paintbrush size={14} /> Color de Marca (Brand Color)
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <input 
                type="color" 
                value={formData.brand_color}
                onChange={e => setFormData({ ...formData, brand_color: e.target.value })}
                style={{ width: '50px', height: '40px', padding: '0', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>{formData.brand_color}</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
            <button type="submit" className="btn btn-lime" disabled={saving}>
              {saving ? 'GUARDANDO...' : (profile ? 'ACTUALIZAR PERFIL' : 'CREAR PERFIL')}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
};

export default AgencyProfilePage;
