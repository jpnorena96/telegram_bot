import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import { ShieldCheck, Lock, UploadCloud, FileText, CheckCircle2, AlertCircle, Clock, File, User } from 'lucide-react';

const ClientPortalPage = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [applicants, setApplicants] = useState([
    { full_name: '', passport_number: '', passportFile: null }
  ]);
  const [extraFiles, setExtraFiles] = useState({});
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${api.url}/visa-processes/public/${id}`);
        if (res.ok) {
          setData(await res.json());
        } else {
          const err = await res.json().catch(() => ({}));
          const msg = err.detail || 'Enlace expirado o inválido';
          toast.error(msg);
          setErrorMsg(msg);
        }
      } catch (e) {
        toast.error('Error cargando el portal seguro');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    let hasAllPassports = true;
    applicants.forEach(app => {
      if (!app.passportFile) hasAllPassports = false;
    });

    if (!hasAllPassports) {
      toast.error('Debe adjuntar el pasaporte de todos los solicitantes');
      return;
    }

    setSubmitting(true);
    try {
      const payload = new FormData();
      applicants.forEach((app, index) => {
        payload.append(`full_name_${index}`, app.full_name);
        payload.append(`passport_number_${index}`, app.passport_number);
        payload.append(`passport_file_${index}`, app.passportFile);
      });
      
      payload.append('applicant_count', applicants.length);

      Object.keys(extraFiles).forEach(key => {
        if (extraFiles[key]) payload.append(key, extraFiles[key]);
      });

      const res = await fetch(`${api.url}/visa-processes/public/${id}/submit`, {
        method: 'POST',
        body: payload
      });

      if (res.ok) {
        setSuccess(true);
      } else {
        toast.error('Error al encriptar y enviar documentos');
      }
    } catch (e) {
      toast.error('Error de conexión segura');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (index, file) => {
    const newApps = [...applicants];
    newApps[index].passportFile = file;
    setApplicants(newApps);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg)', color: 'var(--text-3)' }}>
        <Lock size={48} style={{ marginBottom: '1rem', color: 'var(--lime)', opacity: 0.5 }} />
        <span style={{ fontSize: '1.25rem', fontWeight: 500 }}>Estableciendo conexión segura...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg)' }}>
        <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--surface)', borderRadius: '24px', border: '1px solid var(--border)', maxWidth: '450px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)' }}>
          <AlertCircle size={48} style={{ color: '#EF4444', marginBottom: '1.5rem', opacity: 0.8 }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-1)' }}>Acceso Denegado</h2>
          <p style={{ color: 'var(--text-2)', fontSize: '1.1rem' }}>{errorMsg || 'Este enlace no es válido o ya ha expirado por políticas de seguridad.'}</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'var(--bg)', color: 'var(--text-1)', textAlign: 'center', padding: '2rem' }}>
        <div style={{ width: '100px', height: '100px', background: 'rgba(16, 185, 129, 0.1)', border: '2px solid #10B981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem' }}>
          <ShieldCheck size={48} color="#10B981" />
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>Carga Exitosa y Encriptada</h1>
        <p style={{ color: 'var(--text-2)', fontSize: '1.2rem', maxWidth: '500px', lineHeight: 1.6 }}>
          Sus documentos han sido cifrados y transmitidos de manera segura a {data.agency_name}.
        </p>
        <div style={{ marginTop: '3rem', padding: '1rem 2rem', background: 'var(--surface-2)', borderRadius: '12px', fontSize: '0.9rem', color: 'var(--text-3)' }}>
          Puede cerrar esta ventana con seguridad.
        </div>
      </div>
    );
  }

  const brandColor = data.brand_color || 'var(--lime)';
  const fullLogoUrl = data.agency_logo ? (data.agency_logo.startsWith('http') ? data.agency_logo : `${api.API_URL.replace('/api', '')}${data.agency_logo}`) : null;

  return (
    <div className="secure-portal-layout animate-in">
      
      {/* ── SIDEBAR (Branding & Trust) ── */}
      <div className="secure-sidebar" style={{ '--lime': brandColor }}>
        
        <div style={{ marginBottom: '4rem' }}>
          {fullLogoUrl ? (
            <img src={fullLogoUrl} alt="Logo Agencia" style={{ height: '60px', objectFit: 'contain', marginBottom: '1.5rem' }} />
          ) : (
            <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', fontSize: '1.5rem' }}>🏢</div>
          )}
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-1)', margin: '0 0 0.5rem 0', lineHeight: 1.2 }}>
            {data.agency_name}
          </h2>
          <p style={{ color: 'var(--text-3)', fontSize: '1rem' }}>Data Room Legal & Consular</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }}>
          <div style={{ padding: '1.25rem', background: 'var(--surface-2)', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '0.85rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', fontWeight: 700 }}>Destino del Trámite</h3>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-1)' }}>{data.target_country}</div>
            <div style={{ fontSize: '0.95rem', color: brandColor, fontWeight: 600, marginTop: '0.25rem' }}>{data.visa_category}</div>
          </div>
          
          <div style={{ padding: '1.25rem', background: 'var(--surface-2)', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '0.85rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', fontWeight: 700 }}>Tipo de Expediente</h3>
            <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-1)' }}>{data.group_type}</div>
          </div>
        </div>

        <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-2)', marginBottom: '1rem' }}>
            <Lock size={16} /> <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>Cifrado SSL 256-bit</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-2)' }}>
            <ShieldCheck size={16} /> <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>Cumplimiento de Privacidad</span>
          </div>
        </div>
      </div>

      {/* ── MAIN WORKSPACE ── */}
      <div className="secure-main">
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-1)', margin: '0 0 0.5rem 0' }}>Expediente #{data.id.toString().padStart(4, '0')}</h1>
              <p style={{ fontSize: '1.1rem', color: 'var(--text-3)', margin: 0 }}>Portal seguro de recolección de documentos</p>
            </div>
            <div className="security-badge">
              <Clock size={14} /> ENLACE EXPIRA EN 7 DÍAS
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
            
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--text-1)', paddingBottom: '1rem', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {data.group_type !== 'Individual' ? 'I. Identificación de Solicitantes' : 'I. Identificación del Titular'}
                </h2>
                {data.group_type !== 'Individual' && (
                  <button 
                    type="button" 
                    onClick={() => setApplicants([...applicants, { full_name: '', passport_number: '', passportFile: null }])}
                    className="btn" 
                    style={{ background: brandColor, color: '#fff', border: 'none', borderRadius: '99px', padding: '0.5rem 1.25rem' }}
                  >
                    + Agregar Solicitante
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {applicants.map((app, index) => (
                  <div key={index} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
                    <div style={{ padding: '1rem 1.5rem', background: 'var(--surface-2)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-1)' }}>
                        <User size={18} color={brandColor} />
                        {index === 0 ? 'Titular Principal' : `Acompañante #${index}`}
                      </h3>
                      {index > 0 && (
                        <button 
                          type="button"
                          onClick={() => setApplicants(applicants.filter((_, i) => i !== index))}
                          style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
                        >
                          Eliminar
                        </button>
                      )}
                    </div>
                    
                    <div style={{ padding: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-2)', marginBottom: '0.5rem' }}>Nombres y Apellidos Completos *</label>
                          <input 
                            type="text"
                            required
                            placeholder="Como aparece en su pasaporte"
                            value={app.full_name}
                            onChange={e => {
                              const newApps = [...applicants];
                              newApps[index].full_name = e.target.value;
                              setApplicants(newApps);
                            }}
                            style={{ width: '100%', padding: '1rem', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '1rem', outlineColor: brandColor }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-2)', marginBottom: '0.5rem' }}>Número de Pasaporte *</label>
                          <input 
                            type="text"
                            required
                            placeholder="Ej. PA1234567"
                            value={app.passport_number}
                            onChange={e => {
                              const newApps = [...applicants];
                              newApps[index].passport_number = e.target.value;
                              setApplicants(newApps);
                            }}
                            style={{ width: '100%', padding: '1rem', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '1rem', fontFamily: 'var(--font-mono)', outlineColor: brandColor }}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-2)', marginBottom: '0.5rem' }}>Copia del Pasaporte (PDF/JPG) *</label>
                        <label className="secure-dropzone" style={{ flex: 1, '--lime': brandColor, '--lime-subtle': `${brandColor}15` }}>
                          {app.passportFile ? (
                            <>
                              <FileText size={40} color={brandColor} />
                              <div style={{ fontWeight: 600, color: 'var(--text-1)' }}>{app.passportFile.name}</div>
                              <div style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>Haz clic para reemplazar</div>
                            </>
                          ) : (
                            <>
                              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: `${brandColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.5rem' }}>
                                <UploadCloud size={28} color={brandColor} />
                              </div>
                              <div style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--text-1)' }}>Cargar Documento</div>
                              <div style={{ fontSize: '0.85rem', color: 'var(--text-3)', maxWidth: '200px', textAlign: 'center' }}>Arrastre y suelte el archivo aquí, o haga clic para buscar.</div>
                            </>
                          )}
                          <input 
                            type="file" 
                            accept=".pdf,image/*" 
                            style={{ display: 'none' }}
                            onChange={e => {
                              if (e.target.files[0]) handleFileChange(index, e.target.files[0]);
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: '2rem', padding: '2rem', background: 'var(--surface-2)', borderRadius: '16px', border: '1px solid var(--border)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-1)' }}>
                <ShieldCheck size={24} color={brandColor} /> Consentimiento y Envío
              </h2>
              <p style={{ color: 'var(--text-2)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                Al presionar el botón "Firmar y Enviar", usted confirma que los datos y documentos adjuntos son verdaderos y corresponden a los solicitantes. 
                Toda la información viaja cifrada y será accesible únicamente por {data.agency_name}.
              </p>
              
              <button 
                type="submit" 
                disabled={submitting}
                className="btn"
                style={{ 
                  width: '100%', 
                  padding: '1.25rem', 
                  fontSize: '1.1rem', 
                  fontWeight: 700, 
                  background: brandColor, 
                  color: '#fff', 
                  border: 'none', 
                  borderRadius: '12px',
                  boxShadow: `0 10px 25px -5px ${brandColor}60`
                }}
              >
                {submitting ? 'ENCRIPTANDO Y ENVIANDO...' : 'FIRMAR Y ENVIAR EXPEDIENTE'}
              </button>
            </div>

          </form>

        </div>
      </div>

    </div>
  );
};

export default ClientPortalPage;
