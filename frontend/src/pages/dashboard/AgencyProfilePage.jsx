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
      const res = await api.getAgencyProfile();
      setProfile(res);
      setFormData({
        company_name: res.company_name || '',
        alias: res.alias || '',
        brand_color: res.brand_color || '#10B981'
      });
      if (res.logo_url) {
        setLogoPreview(`${api.API_URL.replace('/api', '')}${res.logo_url}`);
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
      toast.error('Nombre y Alias son obligatorios');
      return;
    }
    setSaving(true);
    try {
      const payload = new FormData();
      payload.append('company_name', formData.company_name);
      payload.append('alias', formData.alias);
      payload.append('brand_color', formData.brand_color);
      if (logoFile) {
        payload.append('logo_file', logoFile);
      }
      await api.updateAgencyProfile(payload);
      toast.success('Configuración guardada exitosamente');
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
            background: '#ffffff', // Light bg for the secure main
            borderRadius: '40px', 
            border: '12px solid #18181b', 
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Mock iPhone Notch */}
            <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '120px', height: '25px', background: '#18181b', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px', zIndex: 10 }}></div>

            {/* Mock Secure Sidebar (Collapses to Header on mobile) */}
            <div style={{ padding: '2.5rem 1.5rem 1.5rem 1.5rem', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', borderTop: `4px solid ${formData.brand_color}` }}>
              {fullLogoUrl ? (
                <img src={fullLogoUrl} alt="Logo" style={{ height: '40px', objectFit: 'contain', marginBottom: '1rem' }} />
              ) : (
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', fontSize: '1.2rem' }}>🏢</div>
              )}
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem 0' }}>
                {formData.company_name || 'Nombre de tu Agencia'}
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0 }}>Data Room Legal & Consular</p>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.75rem', fontWeight: 500 }}>
                  <Lock size={12} /> Cifrado SSL
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.75rem', fontWeight: 500 }}>
                  <ShieldCheck size={12} /> Privacidad
                </div>
              </div>
            </div>

            {/* Mock Workspace Content */}
            <div style={{ padding: '1.5rem', flex: 1, overflowY: 'auto' }}>
              
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem 0' }}>Expediente #0001</h1>
              
              {/* Security Badge */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.5rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 700, marginBottom: '1.5rem' }}>
                ENLACE EXPIRA EN 7 DÍAS
              </div>

              {/* Mock Applicant Card */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', marginBottom: '1.5rem' }}>
                <div style={{ padding: '0.75rem 1rem', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <h3 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0f172a' }}>
                    <User size={14} color={formData.brand_color} /> Titular Principal
                  </h3>
                </div>
                
                <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '0.25rem' }}>Nombre Completo *</label>
                    <div style={{ height: '36px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '6px' }}></div>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '0.25rem' }}>Pasaporte (PDF/JPG) *</label>
                    <div style={{ 
                      border: `2px dashed ${formData.brand_color}40`, 
                      background: `${formData.brand_color}10`,
                      borderRadius: '8px', 
                      padding: '1.5rem 1rem', 
                      display: 'flex', 
                      flexDirection: 'column',
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      color: formData.brand_color,
                      gap: '0.5rem'
                    }}>
                      <UploadCloud size={20} />
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0f172a' }}>Cargar Documento</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mock Submit Button */}
              <div style={{ 
                padding: '1rem', 
                background: formData.brand_color, 
                color: '#fff', 
                fontWeight: 700,
                fontSize: '0.9rem',
                textAlign: 'center',
                borderRadius: '8px',
                boxShadow: `0 8px 20px -5px ${formData.brand_color}60`
              }}>
                FIRMAR Y ENVIAR EXPEDIENTE
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AgencyProfilePage;
