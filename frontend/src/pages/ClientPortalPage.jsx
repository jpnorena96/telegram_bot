import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import { ShieldCheck, Lock, UploadCloud, FileText, AlertCircle, File, User, Check } from 'lucide-react';

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
        toast.error('Error cargando el portal');
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
      toast.error('Se requiere adjuntar el pasaporte de todos los solicitantes');
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
        toast.error('Error al enviar documentos');
      }
    } catch (e) {
      toast.error('Error de conexión');
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
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg)', color: 'var(--text-2)' }}>
        <div className="spinner" style={{ marginBottom: '1rem', width: '24px', height: '24px' }}></div>
        <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Inicializando entorno seguro...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg)' }}>
        <div className="panel" style={{ textAlign: 'center', padding: '3rem', maxWidth: '400px' }}>
          <AlertCircle size={40} style={{ color: 'var(--text-3)', marginBottom: '1.5rem', opacity: 0.5 }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text-1)' }}>Acceso Restringido</h2>
          <p style={{ color: 'var(--text-2)', fontSize: '0.95rem' }}>{errorMsg || 'Este enlace no es válido o ha expirado.'}</p>
        </div>
      </div>
    );
  }

  const brandColor = data.brand_color || '#09090B';
  const fullLogoUrl = data.agency_logo ? (data.agency_logo.startsWith('http') ? data.agency_logo : `${api.API_URL.replace('/api', '')}${data.agency_logo}`) : null;

  if (success) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'var(--bg)', textAlign: 'center', padding: '2rem' }}>
        <div style={{ width: '64px', height: '64px', background: brandColor, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem', boxShadow: `0 10px 25px -5px ${brandColor}40` }}>
          <Check size={32} color="#FFFFFF" />
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-1)' }}>Carga Completada</h1>
        <p style={{ color: 'var(--text-2)', fontSize: '1rem', maxWidth: '400px', lineHeight: 1.6 }}>
          Sus documentos han sido cifrados y enviados exitosamente a {data.agency_name}.
        </p>
        <div style={{ marginTop: '3rem', fontSize: '0.85rem', color: 'var(--text-3)' }}>
          Ya puede cerrar esta pestaña de forma segura.
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in" style={{ minHeight: '100vh', background: 'var(--bg)', padding: '2rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      
      {/* ── HEADER ── */}
      <header style={{ width: '100%', maxWidth: '640px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {fullLogoUrl ? (
            <img src={fullLogoUrl} alt="Logo" style={{ height: '32px', objectFit: 'contain' }} />
          ) : (
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>🏢</div>
          )}
          <span style={{ fontWeight: 600, color: 'var(--text-1)' }}>{data.agency_name}</span>
        </div>
        <div className="badge badge-neutral" style={{ color: brandColor, background: `${brandColor}10`, borderColor: 'transparent' }}>
          <Lock size={12} /> Cifrado 256-bit
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <div style={{ width: '100%', maxWidth: '640px' }}>
        
        <div style={{ marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-1)', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
            Expediente #{data.id.toString().padStart(4, '0')}
          </h1>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-2)', margin: 0 }}>
            Proporcione los datos requeridos para su trámite hacia {data.target_country} ({data.visa_category}).
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-1)', margin: 0 }}>
              {data.group_type !== 'Individual' ? 'Solicitantes' : 'Datos Personales'}
            </h2>
            {data.group_type !== 'Individual' && (
              <button 
                type="button" 
                onClick={() => setApplicants([...applicants, { full_name: '', passport_number: '', passportFile: null }])}
                className="btn btn-outline" 
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', borderRadius: '99px' }}
              >
                + Añadir Acompañante
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {applicants.map((app, index) => (
              <div key={index} className="panel" style={{ overflow: 'hidden' }}>
                <div style={{ padding: '1rem 1.5rem', background: 'var(--surface-2)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-1)' }}>
                    <User size={16} color={brandColor} />
                    {index === 0 ? 'Titular Principal' : `Acompañante #${index}`}
                  </h3>
                  {index > 0 && (
                    <button 
                      type="button"
                      onClick={() => setApplicants(applicants.filter((_, i) => i !== index))}
                      style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500 }}
                    >
                      Remover
                    </button>
                  )}
                </div>
                
                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <div>
                      <label className="input-label">Nombre Completo</label>
                      <input 
                        type="text"
                        required
                        placeholder="Como aparece en el pasaporte"
                        value={app.full_name}
                        onChange={e => {
                          const newApps = [...applicants];
                          newApps[index].full_name = e.target.value;
                          setApplicants(newApps);
                        }}
                        className="input-field"
                        style={{ outlineColor: brandColor }}
                      />
                    </div>
                    <div>
                      <label className="input-label">No. de Pasaporte</label>
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
                        className="input-field"
                        style={{ fontFamily: 'var(--font-mono)', outlineColor: brandColor }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="input-label">Copia del Pasaporte (PDF/JPG)</label>
                    <label className="premium-dropzone">
                      {app.passportFile ? (
                        <>
                          <FileText size={32} color={brandColor} />
                          <div style={{ fontWeight: 500, color: 'var(--text-1)', fontSize: '0.95rem' }}>{app.passportFile.name}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>Clic para reemplazar</div>
                        </>
                      ) : (
                        <>
                          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.25rem' }}>
                            <UploadCloud size={20} color="var(--text-2)" />
                          </div>
                          <div style={{ fontWeight: 500, fontSize: '0.95rem', color: 'var(--text-1)' }}>Cargar Documento</div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-3)' }}>Arrastra el archivo o haz clic</div>
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

          <div style={{ marginTop: '1rem' }}>
            <button 
              type="submit" 
              disabled={submitting}
              className="btn btn-primary"
              style={{ 
                width: '100%', 
                padding: '1rem', 
                fontSize: '1rem', 
                background: brandColor,
                boxShadow: `0 4px 15px ${brandColor}40`
              }}
            >
              {submitting ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
              {submitting ? 'Cifrando datos...' : 'Confirmar y Enviar'}
            </button>
            <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-3)', marginTop: '1rem' }}>
              Al enviar, confirmas que la información ingresada es verídica.
            </p>
          </div>

        </form>
      </div>
    </div>
  );
};

export default ClientPortalPage;
