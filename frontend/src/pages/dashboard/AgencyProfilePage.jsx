import React, { useState, useEffect } from 'react';
import { Store, Paintbrush, Link as LinkIcon, Save, Image as ImageIcon, CheckCircle2, AlertCircle, Loader2, Globe, ShieldCheck, Lock, UploadCloud, User } from 'lucide-react';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

const PREDEFINED_COLORS = ['#10B981', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#F43F5E', '#F59E0B', '#14B8A6'];

const AgencyProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    company_name: '',
    alias: '',
    brand_color: '#10B981'
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await api.getMyAgencyProfile();
      const profileData = res.profile || {};
      setProfile(profileData);
      setFormData({
        company_name: profileData.company_name || '',
        alias: profileData.alias || '',
        brand_color: profileData.brand_color || '#10B981'
      });
      if (profileData.logo_url) {
        const baseUrl = (api.url || api.API_URL || '').replace('/api', '');
        setLogoPreview(`${baseUrl}${profileData.logo_url}`);
      }
    } catch (e) {
      toast.error('Error cargando perfil de agencia');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.company_name || !formData.alias) {
      toast.error('Nombre de empresa y alias son obligatorios');
      return;
    }
    setSaving(true);
    try {
      let finalLogoUrl = profile?.logo_url;
      
      // Upload logo first if it's a new file
      if (logoFile) {
        const logoData = new FormData();
        logoData.append('file', logoFile);
        const uploadRes = await fetch(`${api.API_URL}/users/logo`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: logoData
        });
        if (!uploadRes.ok) throw new Error('Error al subir logo');
        const uploadJson = await uploadRes.json();
        finalLogoUrl = uploadJson.logo_url;
      }

      const payload = {
        company_name: formData.company_name,
        alias: formData.alias,
        brand_color: formData.brand_color,
        logo_url: finalLogoUrl,
      };
      await api.updateMyAgencyProfile(payload);
      toast.success('Perfil actualizado correctamente');
      loadProfile();
    } catch (e) {
      toast.error('Error al guardar configuración');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', color: 'var(--text-3)' }}>
        <Loader2 className="animate-spin" size={36} color="var(--lime)" />
      </div>
    );
  }

  const fullLogoUrl = logoPreview;

  return (
    <div className="animate-in" style={{ padding: '0', maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* HEADER: SaaS Style */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-1)', display: 'flex', alignItems: 'center', gap: '0.75rem', margin: 0, letterSpacing: '-0.02em' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
              <Paintbrush size={20} style={{ color: 'var(--text-1)' }} />
            </div>
            Marca Blanca
          </h1>
          <p style={{ color: 'var(--text-3)', fontSize: '1rem', marginTop: '0.5rem', maxWidth: '600px' }}>
            Personaliza el Portal Seguro de Documentos (Data Room) que verán tus clientes.
          </p>
        </div>
        <button 
          onClick={handleSubmit}
          className="btn" 
          disabled={saving}
          style={{ padding: '0.75rem 1.5rem', fontSize: '0.95rem', fontWeight: 600, background: 'var(--text-1)', color: 'var(--bg)', borderRadius: '8px', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>

      {profile?.status && profile.status !== 'pending' && (
        <div style={{ 
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', 
          background: profile.status === 'approved' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)', 
          border: `1px solid ${profile.status === 'approved' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`,
          borderRadius: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {profile.status === 'approved' ? <CheckCircle2 size={24} style={{ color: '#10B981' }} /> : <AlertCircle size={24} style={{ color: '#F59E0B' }} />}
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: profile.status === 'approved' ? '#10B981' : '#F59E0B' }}>
                {profile.status === 'approved' ? 'Marca Blanca Activa' : 'Pendiente de Aprobación'}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-2)', marginTop: '0.1rem' }}>
                {profile.status === 'approved' ? 'Tu portal público ya usa esta identidad visual.' : 'Un administrador revisará tus datos.'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MAIN LAYOUT */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '2rem' }}>
        
        {/* LEFT COLUMN: SETTINGS PANELS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div style={{ background: 'var(--surface)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-1)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ImageIcon size={18} style={{ color: 'var(--text-3)' }} /> Identidad de Empresa
            </h2>
            
            <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-2)', marginBottom: '0.5rem' }}>Nombre Comercial</label>
                <input 
                  type="text" 
                  placeholder="Ej. Viajes Globales SAS" 
                  value={formData.company_name}
                  onChange={e => setFormData({ ...formData, company_name: e.target.value })}
                  style={{ width: '100%', padding: '0.8rem 1rem', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-1)', outline: 'none', transition: 'border-color 0.2s' }}
                  onFocus={e => e.target.style.borderColor = formData.brand_color}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-2)', marginBottom: '0.5rem' }}>Logo Oficial</label>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', background: 'var(--bg)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '8px', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid var(--border-2)' }}>
                    {fullLogoUrl ? (
                      <img src={fullLogoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    ) : (
                      <ImageIcon size={24} style={{ color: 'var(--text-3)' }} />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.8rem', color: 'var(--text-3)' }}>PNG transparente, max 2MB.</p>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleLogoChange}
                      style={{ fontSize: '0.85rem', color: 'var(--text-2)' }}
                    />
                  </div>
                </div>
              </div>
            </form>
          </div>

          <div style={{ background: 'var(--surface)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-1)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Paintbrush size={18} style={{ color: 'var(--text-3)' }} /> Tema Visual
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-2)' }}>Color de Énfasis (Brand Color)</label>
              
              {/* Color Swatches */}
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {PREDEFINED_COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData({ ...formData, brand_color: color })}
                    style={{
                      width: '32px', height: '32px', borderRadius: '50%', background: color, border: 'none', cursor: 'pointer',
                      boxShadow: formData.brand_color === color ? `0 0 0 3px var(--bg), 0 0 0 5px ${color}` : 'none',
                      transition: 'transform 0.1s',
                      transform: formData.brand_color === color ? 'scale(1.1)' : 'scale(1)'
                    }}
                  />
                ))}
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                <input 
                  type="color" 
                  value={formData.brand_color}
                  onChange={e => setFormData({ ...formData, brand_color: e.target.value })}
                  style={{ width: '40px', height: '40px', border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
                />
                <span style={{ fontSize: '0.9rem', color: 'var(--text-2)', fontFamily: 'var(--font-mono)' }}>{formData.brand_color.toUpperCase()}</span>
              </div>
            </div>
          </div>

          <div style={{ background: 'var(--surface)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-1)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <LinkIcon size={18} style={{ color: 'var(--text-3)' }} /> Dominio y Enlaces
            </h2>
            
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-2)', marginBottom: '0.5rem' }}>Alias del Enlace (URL Amigable)</label>
              <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ padding: '0.8rem 1rem', background: 'rgba(255,255,255,0.02)', color: 'var(--text-3)', borderRight: '1px solid var(--border)', fontSize: '0.9rem' }}>
                  adelantavisa.com/
                </div>
                <input 
                  type="text" 
                  placeholder="mi-agencia" 
                  value={formData.alias}
                  onChange={e => setFormData({ ...formData, alias: e.target.value.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase() })}
                  style={{ flex: 1, padding: '0.8rem 1rem', background: 'transparent', border: 'none', color: 'var(--text-1)', outline: 'none' }}
                />
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-3)', display: 'block', marginTop: '0.5rem' }}>
                Tus clientes verán: adelantavisa.com/{formData.alias || 'tu-agencia'}/xyz
              </span>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: LIVE PREVIEW (Secure Data Room Mobile Mockup) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
          
          <div style={{ width: '100%', textAlign: 'center', color: 'var(--text-2)', fontSize: '0.9rem', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <Globe size={16} /> Previsualización: Secure Data Room (Móvil)
          </div>
          
          {/* Mockup Frame (Mobile) */}
          <div style={{ 
            width: '375px', // iPhone Width
            height: '812px',
            background: '#ffffff', // White bg for the preview
            borderRadius: '40px', 
            border: '12px solid #000000', 
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Mock iPhone Notch & Status Bar */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '44px', display: 'flex', justifyContent: 'space-between', padding: '0 1.5rem', alignItems: 'center', zIndex: 10, fontSize: '0.75rem', fontWeight: 600, color: '#0f172a' }}>
              <span>9:41</span>
              <div style={{ display: 'flex', gap: '0.3rem' }}>
                <div style={{ width: '16px', height: '10px', background: '#0f172a', borderRadius: '2px' }}></div>
              </div>
            </div>
            <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '120px', height: '25px', background: '#000000', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px', zIndex: 11 }}></div>

            {/* Premium Header */}
            <div style={{ paddingTop: '3.5rem', paddingBottom: '1.25rem', paddingLeft: '1.5rem', paddingRight: '1.5rem', background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)', borderBottom: '1px solid rgba(0,0,0,0.05)', position: 'relative' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: formData.brand_color }}></div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {fullLogoUrl ? (
                  <img src={fullLogoUrl} alt="Logo" style={{ height: '44px', width: '44px', objectFit: 'contain', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.08)' }} />
                ) : (
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', boxShadow: '0 4px 10px rgba(0,0,0,0.08)' }}>🏢</div>
                )}
                <div>
                  <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.15rem 0', letterSpacing: '-0.02em' }}>
                    {formData.company_name || 'Agencia Premium'}
                  </h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#64748b', fontSize: '0.75rem', fontWeight: 500 }}>
                    <ShieldCheck size={12} color={formData.brand_color} /> Portal Seguro
                  </div>
                </div>
              </div>
            </div>

            {/* Mock Workspace Content */}
            <div style={{ flex: 1, overflowY: 'auto', background: '#f8fafc', padding: '1.5rem' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div>
                  <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.35rem 0', letterSpacing: '-0.02em' }}>Expediente Visa</h1>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>ID: <span style={{ fontFamily: 'monospace' }}>#4920-B1</span></p>
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.35rem 0.6rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', borderRadius: '99px', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.05em' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }}></div>
                  ACTIVO
                </div>
              </div>

              {/* Progress Steps */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
                <div style={{ flex: 1, height: '4px', borderRadius: '2px', background: formData.brand_color }}></div>
                <div style={{ flex: 1, height: '4px', borderRadius: '2px', background: formData.brand_color, opacity: 0.2 }}></div>
                <div style={{ flex: 1, height: '4px', borderRadius: '2px', background: formData.brand_color, opacity: 0.2 }}></div>
              </div>

              {/* Sleek Form Card */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)', marginBottom: '1.5rem' }}>
                <div style={{ padding: '1.25rem', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: `${formData.brand_color}15`, color: formData.brand_color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={16} />
                  </div>
                  <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>Titular Principal</h3>
                </div>
                
                <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {/* Input Field */}
                  <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nombre Completo</label>
                    <div style={{ height: '44px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', display: 'flex', alignItems: 'center', padding: '0 1rem' }}>
                      <div style={{ width: '40%', height: '8px', background: '#e2e8f0', borderRadius: '4px' }}></div>
                    </div>
                  </div>
                  
                  {/* Modern Upload Zone */}
                  <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pasaporte</label>
                    <div style={{ 
                      border: `1.5px dashed #cbd5e1`, 
                      background: '#fafafa',
                      borderRadius: '12px', 
                      padding: '1.5rem 1rem', 
                      display: 'flex', 
                      flexDirection: 'column',
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      gap: '0.75rem'
                    }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: `${formData.brand_color}15`, color: formData.brand_color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <UploadCloud size={20} />
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0f172a', display: 'block', marginBottom: '0.15rem' }}>Subir PDF o JPG</span>
                        <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Máximo 5MB</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Submit Action */}
              <div style={{ 
                padding: '1rem', 
                background: `linear-gradient(135deg, ${formData.brand_color} 0%, ${formData.brand_color}dd 100%)`, 
                color: '#ffffff', 
                fontWeight: 600,
                fontSize: '0.9rem',
                textAlign: 'center',
                borderRadius: '14px',
                boxShadow: `0 10px 25px -5px ${formData.brand_color}60`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                letterSpacing: '0.02em'
              }}>
                <CheckCircle2 size={16} /> CONFIRMAR Y ENVIAR
              </div>

              {/* Footer safe area */}
              <div style={{ height: '2rem' }}></div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AgencyProfilePage;
