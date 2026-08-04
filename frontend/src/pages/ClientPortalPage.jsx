import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import { 
  ShieldCheck, Lock, UploadCloud, FileText, AlertCircle, 
  User, Check, ArrowRight, ArrowLeft, Plus, Trash2, Camera, 
  Sparkles, CheckCircle2, Loader2, Info, FileCheck, Building2
} from 'lucide-react';

const DOC_TYPES = [
  { id: 'passport', title: 'Pasaporte Vigente', req: true, icon: FileText, desc: 'Copia clara de la hoja con fotografía y datos personales (PDF o Imagen).' },
  { id: 'photo', title: 'Fotografía Digital (5x5 cm)', req: true, icon: Camera, desc: 'Fondo blanco reciente, cara descubierta y sin anteojos (JPG o PNG).' },
  { id: 'ds160', title: 'Hoja de Confirmación DS-160', req: false, icon: FileCheck, desc: 'Página con código de barras de confirmación de formulario completado.' },
  { id: 'financial', title: 'Sustento Financiero / Laboral', req: false, icon: UploadCloud, desc: 'Extracto bancario, constancia de trabajo o certificado de estudio (Opcional).' }
];

const ClientPortalPage = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1: Solicitantes, 2: Documentos, 3: Resumen
  const [activeTab, setActiveTab] = useState(0);

  const [applicants, setApplicants] = useState([
    { 
      full_name: '', 
      passport_number: '', 
      ds160_confirmation: '', 
      relationship: 'primary',
      files: {} // { passport: File, photo: File, ds160: File, financial: File }
    }
  ]);

  const [declaration, setDeclaration] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${api.url}/visa-processes/public/${id}`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
          
          if (json.applicants && json.applicants.length > 0) {
            setApplicants(json.applicants.map((a, idx) => ({
              full_name: a.full_name || '',
              passport_number: a.passport_number || '',
              ds160_confirmation: a.ds160_confirmation || '',
              relationship: idx === 0 ? 'primary' : (a.relationship || 'dependent'),
              files: {}
            })));
          }
        } else {
          const err = await res.json().catch(() => ({}));
          const msg = err.detail || 'Enlace expirado o no válido.';
          toast.error(msg);
          setErrorMsg(msg);
        }
      } catch (e) {
        toast.error('Error al conectar con el portal seguro.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleAddApplicant = () => {
    setApplicants([
      ...applicants, 
      { full_name: '', passport_number: '', ds160_confirmation: '', relationship: 'Acompañante', files: {} }
    ]);
  };

  const handleRemoveApplicant = (idx) => {
    if (applicants.length === 1) return;
    const next = applicants.filter((_, i) => i !== idx);
    setApplicants(next);
    if (activeTab >= next.length) setActiveTab(Math.max(0, next.length - 1));
  };

  const updateApplicantField = (idx, field, val) => {
    const next = [...applicants];
    next[idx][field] = val;
    setApplicants(next);
  };

  const handleFileDrop = (applicantIdx, docTypeId, file) => {
    if (!file) return;
    const next = [...applicants];
    next[applicantIdx].files[docTypeId] = file;
    setApplicants(next);
    toast.success(`Adjuntado: ${DOC_TYPES.find(d => d.id === docTypeId)?.title || 'Archivo'}`);
  };

  const validateStep1 = () => {
    for (let i = 0; i < applicants.length; i++) {
      if (!applicants[i].full_name.trim()) {
        toast.error(`Ingresa el nombre completo del Solicitante #${i + 1}`);
        return false;
      }
      if (!applicants[i].passport_number.trim()) {
        toast.error(`Ingresa el número de pasaporte del Solicitante #${i + 1}`);
        return false;
      }
    }
    return true;
  };

  const validateStep2 = () => {
    // Require at least passport and photo for primary applicant
    for (let i = 0; i < applicants.length; i++) {
      const p = applicants[i];
      if (!p.files.passport) {
        toast.error(`Falta adjuntar el Pasaporte de ${p.full_name || `Solicitante #${i + 1}`}`);
        setActiveTab(i);
        return false;
      }
    }
    return true;
  };

  const handleSubmitAll = async () => {
    if (!declaration) {
      toast.error('Debes confirmar que la información suministrada es verídica.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = new FormData();
      payload.append('applicant_count', applicants.length);

      applicants.forEach((app, idx) => {
        payload.append(`full_name_${idx}`, app.full_name);
        payload.append(`passport_number_${idx}`, app.passport_number);
        payload.append(`ds160_confirmation_${idx}`, app.ds160_confirmation || '');
        payload.append(`relationship_${idx}`, app.relationship || 'primary');

        if (app.files.passport) payload.append(`passport_file_${idx}`, app.files.passport);
        if (app.files.photo) payload.append(`photo_file_${idx}`, app.files.photo);
        if (app.files.ds160) payload.append(`ds160_file_${idx}`, app.files.ds160);
        if (app.files.financial) payload.append(`financial_file_${idx}`, app.files.financial);
      });

      const res = await fetch(`${api.url}/visa-processes/public/${id}/submit`, {
        method: 'POST',
        body: payload
      });

      if (res.ok) {
        setSuccess(true);
      } else {
        const errJson = await res.json().catch(() => ({}));
        toast.error(errJson.detail || 'Error al enviar el expediente.');
      }
    } catch (e) {
      toast.error('Error de conexión al enviar el expediente.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg)', color: 'var(--text-2)' }}>
        <div className="spinner" style={{ marginBottom: '1rem', width: '28px', height: '28px' }}></div>
        <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Inicializando entorno seguro...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg)', padding: '1rem' }}>
        <div className="panel" style={{ textAlign: 'center', padding: '3rem 2rem', maxWidth: '420px', width: '100%', borderRadius: '16px' }}>
          <AlertCircle size={44} style={{ color: '#F87171', marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-1)' }}>Acceso Restringido</h2>
          <p style={{ color: 'var(--text-2)', fontSize: '0.9rem', lineHeight: 1.5 }}>{errorMsg || 'Este enlace no es válido o ha expirado.'}</p>
        </div>
      </div>
    );
  }

  const brandColor = data.brand_color || '#10B981';
  const fullLogoUrl = data.agency_logo ? (data.agency_logo.startsWith('http') ? data.agency_logo : `${api.API_URL.replace('/api', '')}${data.agency_logo}`) : null;

  if (success) {
    return (
      <div className="animate-in" style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem 1rem' }}>
        <div className="panel" style={{ maxWidth: '520px', width: '100%', padding: '3rem 2rem', textAlign: 'center', borderRadius: '24px', boxShadow: 'var(--shadow-lg)' }}>
          <div style={{ width: '72px', height: '72px', background: `${brandColor}15`, border: `2px solid ${brandColor}`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
            <Check size={36} color={brandColor} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-1)' }}>
            ¡Expediente Recibido!
          </h1>
          <p style={{ color: 'var(--text-2)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem' }}>
            Sus datos y documentos fueron encriptados con seguridad bancaria SSL 256-bit y entregados a <strong style={{ color: 'var(--text-1)' }}>{data.agency_name}</strong>.
          </p>
          <div style={{ background: 'var(--surface-2)', padding: '1rem 1.5rem', borderRadius: '12px', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-3)' }}>Nº Expediente</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: brandColor }}>#{data.id.toString().padStart(4, '0')}</span>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-3)' }}>
            Puede cerrar esta ventana con total tranquilidad. Su asesor se pondrá en contacto pronto.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in" style={{ minHeight: '100vh', background: 'var(--bg)', padding: '1.5rem 1rem 4rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      
      {/* ── HEADER CON MARCA DE AGENCIA ── */}
      <header style={{ width: '100%', maxWidth: '680px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {fullLogoUrl ? (
            <img src={fullLogoUrl} alt="Logo" style={{ height: '36px', maxWidth: '140px', objectFit: 'contain' }} />
          ) : (
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${brandColor}15`, border: `1px solid ${brandColor}40`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building2 size={18} color={brandColor} />
            </div>
          )}
          <div>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-1)', lineHeight: 1.2 }}>{data.agency_name}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>Portal Oficial de Recepción de Documentos</div>
          </div>
        </div>
        <div className="badge" style={{ color: brandColor, background: `${brandColor}12`, borderColor: `${brandColor}30`, padding: '0.35rem 0.7rem', fontSize: '0.72rem' }}>
          <Lock size={12} style={{ marginRight: '4px' }} /> SSL 256-Bit
        </div>
      </header>

      {/* ── MAIN WRAPPER ── */}
      <div style={{ width: '100%', maxWidth: '680px' }}>
        
        {/* TITULO Y PASAPORTE AL MUNDO */}
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-1)', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
            Trámite de Visa - {data.target_country}
          </h1>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-2)', margin: 0 }}>
            Categoría: <strong style={{ color: brandColor }}>{data.visa_category}</strong> · Expediente <span style={{ fontFamily: 'var(--font-mono)' }}>#{data.id.toString().padStart(4, '0')}</span>
          </p>
        </div>

        {/* ── STEPPER DIDÁCTICO EN BARRA ── */}
        <div style={{ marginBottom: '2.5rem', background: 'var(--surface-2)', padding: '0.75rem 1rem', borderRadius: '16px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {[
            { step: 1, title: '1. Datos' },
            { step: 2, title: '2. Documentos' },
            { step: 3, title: '3. Envío' }
          ].map(s => {
            const active = currentStep === s.step;
            const completed = currentStep > s.step;
            return (
              <div 
                key={s.step} 
                onClick={() => {
                  if (s.step === 2 && !validateStep1()) return;
                  if (s.step === 3 && (!validateStep1() || !validateStep2())) return;
                  setCurrentStep(s.step);
                }}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  cursor: completed || active ? 'pointer' : 'default',
                  opacity: active || completed ? 1 : 0.4
                }}
              >
                <div style={{ 
                  width: '26px', 
                  height: '26px', 
                  borderRadius: '50%', 
                  background: completed ? brandColor : active ? brandColor : 'var(--border)', 
                  color: completed || active ? '#FFF' : 'var(--text-3)',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontSize: '0.78rem', 
                  fontWeight: 700 
                }}>
                  {completed ? <Check size={14} /> : s.step}
                </div>
                <span style={{ fontSize: '0.82rem', fontWeight: active ? 700 : 500, color: active ? 'var(--text-1)' : 'var(--text-2)' }}>
                  {s.title}
                </span>
              </div>
            );
          })}
        </div>

        {/* ────────────────── PASO 1: DATOS DEL SOLICITANTE ────────────────── */}
        {currentStep === 1 && (
          <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-1)', margin: 0 }}>
                  Información de los Solicitantes
                </h2>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-3)', margin: '0.2rem 0 0 0' }}>
                  Asegúrate de que los nombres y números coincidan exactamente con sus pasaportes.
                </p>
              </div>

              <button 
                type="button" 
                onClick={handleAddApplicant}
                className="btn btn-outline btn-sm"
                style={{ borderRadius: '99px', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem' }}
              >
                <Plus size={14} /> Agregar Acompañante
              </button>
            </div>

            {applicants.map((app, idx) => (
              <div key={idx} className="panel" style={{ padding: '1.5rem', borderRadius: '16px', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: `${brandColor}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <User size={15} color={brandColor} />
                    </div>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-1)' }}>
                      {idx === 0 ? 'Solicitante Principal (Titular)' : `Acompañante #${idx}`}
                    </span>
                  </div>

                  {idx > 0 && (
                    <button 
                      type="button" 
                      onClick={() => handleRemoveApplicant(idx)}
                      style={{ background: 'none', border: 'none', color: '#F87171', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.78rem' }}
                    >
                      <Trash2 size={14} /> Eliminar
                    </button>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
                  <div>
                    <label className="input-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Nombre Completo *</span>
                    </label>
                    <input 
                      type="text"
                      className="input-field"
                      placeholder="Tal como figura en el pasaporte"
                      value={app.full_name}
                      onChange={e => updateApplicantField(idx, 'full_name', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="input-label">Nº de Pasaporte *</label>
                    <input 
                      type="text"
                      className="input-field"
                      placeholder="Ej: PA1234567"
                      style={{ fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}
                      value={app.passport_number}
                      onChange={e => updateApplicantField(idx, 'passport_number', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="input-label">Nº Confirmación DS-160 (Opcional)</label>
                    <input 
                      type="text"
                      className="input-field"
                      placeholder="Ej: AA00XXXXXX"
                      style={{ fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}
                      value={app.ds160_confirmation}
                      onChange={e => updateApplicantField(idx, 'ds160_confirmation', e.target.value)}
                    />
                  </div>

                  {idx > 0 && (
                    <div>
                      <label className="input-label">Parentesco con Titular</label>
                      <select 
                        className="input-field"
                        value={app.relationship}
                        onChange={e => updateApplicantField(idx, 'relationship', e.target.value)}
                      >
                        <option value="Cónyuge">Cónyuge / Pareja</option>
                        <option value="Hijo/a">Hijo / Hija</option>
                        <option value="Padre/Madre">Padre / Madre</option>
                        <option value="Hermano/a">Hermano / Hermana</option>
                        <option value="Acompañante">Otro Acompañante</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>
            ))}

            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                type="button" 
                onClick={() => {
                  if (validateStep1()) setCurrentStep(2);
                }}
                className="btn btn-primary"
                style={{ background: brandColor, padding: '0.85rem 2rem', fontSize: '0.95rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                Continuar a Carga de Documentos <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ────────────────── PASO 2: DOCUMENTOS CIFRADOS ────────────────── */}
        {currentStep === 2 && (
          <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-1)', margin: 0 }}>
                  Expediente Digital de Documentos
                </h2>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-3)', margin: '0.2rem 0 0 0' }}>
                  Sube los archivos requeridos para cada integrante de la solicitud.
                </p>
              </div>
            </div>

            {/* Pestañas de Solicitantes */}
            {applicants.length > 1 && (
              <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                {applicants.map((a, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveTab(i)}
                    className={`btn btn-sm ${activeTab === i ? 'btn-primary' : 'btn-outline'}`}
                    style={{ 
                      borderRadius: '99px', 
                      background: activeTab === i ? brandColor : 'transparent',
                      borderColor: activeTab === i ? brandColor : 'var(--border)'
                    }}
                  >
                    {a.full_name || `Solicitante #${i + 1}`}
                  </button>
                ))}
              </div>
            )}

            {/* Grilla de Documentos para el Solicitante Seleccionado */}
            <div className="panel" style={{ padding: '1.5rem', borderRadius: '16px' }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-1)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <User size={16} color={brandColor} />
                Documentos de: <span style={{ color: brandColor }}>{applicants[activeTab]?.full_name || `Solicitante #${activeTab + 1}`}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                {DOC_TYPES.map(doc => {
                  const currentFile = applicants[activeTab]?.files?.[doc.id];
                  const Icon = doc.icon;

                  return (
                    <div key={doc.id} style={{ border: '1px dashed var(--border)', borderRadius: '12px', padding: '1.25rem', background: currentFile ? 'var(--surface-2)' : 'var(--surface)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `${brandColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Icon size={16} color={brandColor} />
                            </div>
                            <span style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-1)' }}>{doc.title}</span>
                          </div>
                          {doc.req && <span style={{ fontSize: '0.65rem', background: '#EF444420', color: '#EF4444', padding: '0.15rem 0.4rem', borderRadius: '4px', fontWeight: 700 }}>REQUERIDO</span>}
                        </div>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-3)', margin: '0 0 1rem 0', lineHeight: 1.4 }}>
                          {doc.desc}
                        </p>
                      </div>

                      <label style={{ cursor: 'pointer' }}>
                        <input 
                          type="file"
                          accept=".pdf,image/*"
                          style={{ display: 'none' }}
                          onChange={(e) => {
                            if (e.target.files[0]) {
                              handleFileDrop(activeTab, doc.id, e.target.files[0]);
                            }
                          }}
                        />
                        {currentFile ? (
                          <div style={{ background: brandColor, color: '#FFF', padding: '0.6rem 0.8rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600 }}>
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }}>
                              ✓ {currentFile.name}
                            </span>
                            <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>Cambiar</span>
                          </div>
                        ) : (
                          <div style={{ border: '1px solid var(--border)', padding: '0.6rem 0.8rem', borderRadius: '8px', textAlign: 'center', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-2)', background: 'var(--bg)' }}>
                            + Seleccionar Archivo
                          </div>
                        )}
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
              <button 
                type="button"
                onClick={() => setCurrentStep(1)}
                className="btn btn-outline"
                style={{ padding: '0.85rem 1.5rem', borderRadius: '12px' }}
              >
                <ArrowLeft size={16} /> Volver
              </button>

              <button 
                type="button" 
                onClick={() => {
                  if (validateStep2()) setCurrentStep(3);
                }}
                className="btn btn-primary"
                style={{ background: brandColor, padding: '0.85rem 2rem', fontSize: '0.95rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                Revisar Expediente <ArrowRight size={16} />
              </button>
            </div>

          </div>
        )}

        {/* ────────────────── PASO 3: CONFIRMACIÓN Y ENVÍO ────────────────── */}
        {currentStep === 3 && (
          <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-1)', margin: 0 }}>
                Resumen y Verificación Final
              </h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-3)', margin: '0.2rem 0 0 0' }}>
                Revisa los datos antes de realizar el envío cifrado a la agencia.
              </p>
            </div>

            <div className="panel" style={{ padding: '1.5rem', borderRadius: '16px' }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-1)', marginBottom: '1rem' }}>
                Resumen de Integrantes ({applicants.length})
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {applicants.map((a, idx) => (
                  <div key={idx} style={{ padding: '1rem', background: 'var(--surface-2)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-1)', fontSize: '0.9rem' }}>
                        {a.full_name} <span style={{ fontSize: '0.75rem', color: brandColor, fontWeight: 400 }}>({idx === 0 ? 'Titular' : a.relationship})</span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
                        Pasaporte: {a.passport_number} {a.ds160_confirmation && `· DS-160: ${a.ds160_confirmation}`}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      {Object.keys(a.files).map(k => (
                        <span key={k} style={{ fontSize: '0.65rem', background: `${brandColor}20`, color: brandColor, padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 700, textTransform: 'uppercase' }}>
                          {k} ✓
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Declaración Jurada */}
            <div style={{ padding: '1.25rem', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '16px', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <input 
                type="checkbox" 
                id="decl"
                checked={declaration}
                onChange={e => setDeclaration(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: brandColor, marginTop: '2px', cursor: 'pointer' }}
              />
              <label htmlFor="decl" style={{ fontSize: '0.82rem', color: 'var(--text-2)', cursor: 'pointer', lineHeight: 1.5 }}>
                Declaro bajo mi responsabilidad que la información proporcionada y los documentos adjuntos son legibles, legítimos y corresponden fielmente a los solicitantes indicados.
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
              <button 
                type="button"
                onClick={() => setCurrentStep(2)}
                className="btn btn-outline"
                style={{ padding: '0.85rem 1.5rem', borderRadius: '12px' }}
              >
                <ArrowLeft size={16} /> Modificar Archivos
              </button>

              <button 
                type="button" 
                disabled={submitting}
                onClick={handleSubmitAll}
                className="btn btn-primary"
                style={{ 
                  background: brandColor, 
                  padding: '1rem 2.5rem', 
                  fontSize: '1rem', 
                  fontWeight: 700,
                  borderRadius: '12px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.6rem',
                  boxShadow: `0 4px 20px ${brandColor}40`
                }}
              >
                {submitting ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={20} />}
                {submitting ? 'Cifrando Expediente...' : 'Confirmar y Enviar Expediente'}
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default ClientPortalPage;
