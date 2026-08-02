import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Store, Paintbrush, Link as LinkIcon, CheckCircle2, AlertCircle, Eye, Globe, Image as ImageIcon } from 'lucide-react';
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
        alias: formData.alias.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase()
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
        <div className="skeleton" style={{ width: '100%', height: '500px', borderRadius: 'var(--radius-lg)' }} />
      </div>
    );
  }

  const publicLink = profile ? `${window.location.origin}/client-portal/DEMO` : '';
  const fullLogoUrl = formData.logo_url ? (formData.logo_url.startsWith('http') ? formData.logo_url : `${api.API_URL.replace('/api', '')}${formData.logo_url}`) : null;

  return (
    <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="typewriter-text" style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-1)', display: 'flex', alignItems: 'center', gap: '0.75rem', margin: 0 }}>
            REGISTRO OFICIAL DE AGENCIA
          </h1>
          <p className="typewriter-text" style={{ color: 'var(--text-3)', fontSize: '1rem', marginTop: '0.5rem', maxWidth: '600px' }}>
            Documento vinculante de identidad visual para marca blanca.
          </p>
        </div>
        <button 
          onClick={handleSubmit}
          className="btn btn-lime" 
          disabled={saving}
          style={{ padding: '0.75rem 1.5rem', fontSize: '1rem', fontWeight: 600, boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)' }}
        >
          {saving ? 'GUARDANDO...' : 'FIRMAR Y GUARDAR'}
        </button>
      </div>

      {/* STATUS BANNER */}
      {profile && (
        <div style={{ 
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', 
          background: profile.status === 'approved' ? 'linear-gradient(to right, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.02))' : 'linear-gradient(to right, rgba(245, 158, 11, 0.1), rgba(245, 158, 11, 0.02))', 
          border: `1px solid ${profile.status === 'approved' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
          borderRadius: '16px',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {profile.status === 'approved' ? <CheckCircle2 size={28} style={{ color: '#10B981' }} /> : <AlertCircle size={28} style={{ color: '#F59E0B' }} />}
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.1rem', color: profile.status === 'approved' ? '#10B981' : '#F59E0B' }}>
                {profile.status === 'approved' ? 'MARCA BLANCA ACTIVA' : 'PENDIENTE DE APROBACIÓN'}
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-2)', marginTop: '0.2rem' }}>
                {profile.status === 'approved' ? 'Tus clientes ya pueden ver tu marca al abrir los expedientes.' : 'Un administrador revisará tus datos. Mientras tanto, se mostrará el diseño por defecto.'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MAIN LAYOUT */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '2rem' }}>
        
        {/* LEFT COLUMN: FORM */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div className="dossier-paper" style={{ padding: '3rem 2rem' }}>
            <div style={{ borderBottom: '2px solid var(--text-1)', paddingBottom: '1rem', marginBottom: '2rem' }}>
              <h2 className="typewriter-text" style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                SECCIÓN I: IDENTIDAD VISUAL
              </h2>
            </div>
            
            <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="input-group">
                <label className="input-label">Nombre Comercial de la Agencia</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Ej. Viajes Globales SAS" 
                  value={formData.company_name}
                  onChange={e => setFormData({ ...formData, company_name: e.target.value })}
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Logo de la Agencia</label>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', background: 'var(--surface)', padding: '1.5rem', borderRadius: '12px', border: '1px dashed var(--border)' }}>
                  <div style={{ width: '80px', height: '80px', borderRadius: '12px', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid var(--border)' }}>
                    {fullLogoUrl ? (
                      <img src={fullLogoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    ) : (
                      <ImageIcon size={32} style={{ color: 'var(--text-3)' }} />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: 'var(--text-2)' }}>Recomendado: PNG transparente, 400x150px.</p>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        const payload = new FormData();
                        payload.append('file', file);
                        const toastId = toast.loading('Subiendo logo...');
                        try {
                          const res = await fetch(`${api.API_URL}/users/logo`, {
                            method: 'POST',
                            headers: api.getHeaders(true),
                            body: payload
                          });
                          if (res.ok) {
                            const data = await res.json();
                            setFormData({ ...formData, logo_url: data.logo_url });
                            toast.success('Logo actualizado', { id: toastId });
                          } else {
                            toast.error('Error al subir', { id: toastId });
                          }
                        } catch (err) {
                          toast.error('Error de red', { id: toastId });
                        }
                      }}
                      style={{ fontSize: '0.85rem' }}
                    />
                  </div>
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Color de Marca (Acento)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--surface)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <div style={{ position: 'relative', width: '40px', height: '40px', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
                    <input 
                      type="color" 
                      value={formData.brand_color}
                      onChange={e => setFormData({ ...formData, brand_color: e.target.value })}
                      style={{ position: 'absolute', top: '-10px', left: '-10px', width: '60px', height: '60px', cursor: 'pointer', border: 'none' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-1)' }}>{formData.brand_color.toUpperCase()}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>Haz clic en el recuadro para cambiar</span>
                  </div>
                </div>
              </div>
            </form>
          </div>

          <div className="dossier-paper" style={{ padding: '3rem 2rem' }}>
            <div style={{ borderBottom: '2px solid var(--text-1)', paddingBottom: '1rem', marginBottom: '2rem' }}>
              <h2 className="typewriter-text" style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                SECCIÓN II: DOMINIO Y ENLACES
              </h2>
            </div>
            
            <div className="input-group">
              <label className="typewriter-text" style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', display: 'block' }}>ALIAS DEL ENLACE (URL AMIGABLE)</label>
              <div style={{ display: 'flex', alignItems: 'center', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.02)', color: 'var(--text-3)', borderRight: '1px solid var(--border)', fontSize: '0.9rem' }}>
                  adelantavisa.com/
                </div>
                <input 
                  type="text" 
                  placeholder="mi-agencia" 
                  value={formData.alias}
                  onChange={e => setFormData({ ...formData, alias: e.target.value.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase() })}
                  style={{ flex: 1, padding: '0.75rem 1rem', background: 'transparent', border: 'none', color: 'var(--text-1)', outline: 'none' }}
                />
              </div>
              <span className="typewriter-text" style={{ fontSize: '0.8rem', color: 'var(--text-3)', marginTop: '0.5rem' }}>
                *Esta es la terminación que verán sus clientes. Ej: adelantavisa.com/{formData.alias || 'tu-agencia'}/xyz
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: LIVE PREVIEW */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: '0.5rem', paddingLeft: '0.5rem' }}>
            <Eye size={18} /> Vista Previa del Portal Público
          </h2>
          
          {/* Mockup Frame */}
          <div style={{ 
            background: 'var(--bg)', 
            borderRadius: '24px', 
            border: '8px solid var(--surface-2)', 
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            position: 'relative',
            height: '600px',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Mock Browser Header */}
            <div style={{ background: 'var(--surface-2)', padding: '0.75rem 1rem', display: 'flex', gap: '0.5rem', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#EF4444' }}></div>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#F59E0B' }}></div>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10B981' }}></div>
              <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: '6px', padding: '0.25rem', textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-3)' }}>
                <Globe size={10} style={{ display: 'inline', marginRight: '4px' }}/> adelantavisa.com/{formData.alias || 'agencia'}/...
              </div>
            </div>

            {/* Mock Portal Content */}
            <div style={{ padding: '2rem 1.5rem', flex: 1, overflowY: 'auto' }}>
              <div style={{ maxWidth: '400px', margin: '0 auto', background: 'var(--surface)', padding: '2rem 1.5rem', borderRadius: '24px', border: '1px solid var(--border)', textAlign: 'center' }}>
                
                {/* Agency Logo */}
                {fullLogoUrl ? (
                  <img src={fullLogoUrl} alt="Logo" style={{ height: '60px', objectFit: 'contain', margin: '0 auto 1.5rem auto' }} />
                ) : (
                  <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', fontSize: '1.5rem' }}>🏢</div>
                )}
                
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: 'var(--text-1)' }}>
                  {formData.company_name || 'Nombre de tu Agencia'}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-3)', margin: '0 0 1.5rem 0' }}>Portal Seguro de Trámite de Visa</p>
                
                <div style={{ padding: '1rem', background: 'var(--bg)', borderRadius: '12px', marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginBottom: '0.5rem' }}>ESTADO DEL TRÁMITE</div>
                  <div style={{ color: formData.brand_color, fontWeight: 600, fontSize: '1.1rem' }}>En Progreso</div>
                </div>

                <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-2)', display: 'block', marginBottom: '0.5rem' }}>Nombre Completo</label>
                    <div style={{ height: '40px', background: 'var(--bg)', borderRadius: '8px', border: '1px solid var(--border)' }}></div>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-2)', display: 'block', marginBottom: '0.5rem' }}>Pasaporte (PDF)</label>
                    <div style={{ height: '80px', background: 'var(--bg)', borderRadius: '8px', border: '1px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)', fontSize: '0.8rem' }}>Subir archivo</div>
                  </div>
                </div>

                <div 
                  style={{ 
                    marginTop: '2rem', 
                    padding: '0.8rem', 
                    borderRadius: '8px', 
                    background: formData.brand_color, 
                    color: '#fff', 
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: `0 4px 15px ${formData.brand_color}40`
                  }}
                >
                  ENVIAR DOCUMENTOS
                </div>

              </div>
            </div>
            
            {/* Mock Gradient Overlay for realism */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40px', background: 'linear-gradient(transparent, var(--bg))' }}></div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default AgencyProfilePage;
