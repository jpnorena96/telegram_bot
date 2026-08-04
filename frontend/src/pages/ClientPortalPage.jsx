import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import { 
  ShieldCheck, Lock, UploadCloud, FileText, AlertCircle, 
  User, Check, ArrowRight, ArrowLeft, Plus, Trash2, Camera, 
  Sparkles, CheckCircle2, Loader2, Info, FileCheck, Building2,
  Briefcase, Plane, Globe, MapPin, DollarSign, Users, HelpCircle
} from 'lucide-react';

const DOC_TYPES = [
  { id: 'passport', title: 'Pasaporte Vigente', req: true, icon: FileText, desc: 'Copia clara de la hoja con fotografía y datos personales (PDF o Imagen).' },
  { id: 'photo', title: 'Fotografía Digital (5x5 cm)', req: true, icon: Camera, desc: 'Fondo blanco reciente, cara descubierta y sin anteojos (JPG o PNG).' },
  { id: 'ds160', title: 'Hoja de Confirmación DS-160', req: false, icon: FileCheck, desc: 'Página con código de barras si ya completaste el formulario consular.' },
  { id: 'financial', title: 'Sustento Financiero / Laboral', req: false, icon: UploadCloud, desc: 'Extracto bancario, constancia de trabajo o certificado de estudio (Opcional).' }
];

const ClientPortalPage = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Flow mode: 'choice' | 'express' (has DS-160) | 'full' (agency fills DS-160)
  const [mode, setMode] = useState('full');
  const [currentStep, setCurrentStep] = useState(1);
  const [activeApplicantTab, setActiveApplicantTab] = useState(0);

  const [applicants, setApplicants] = useState([
    { 
      full_name: '', 
      given_names: '',
      surname: '',
      native_name: '',
      other_names: '',
      national_id: '',
      tax_id: '',
      gender: 'Masculino',
      marital_status: 'Soltero/a',
      birth_date: '',
      birth_city: '',
      birth_country: 'Colombia',
      
      passport_number: '',
      passport_country: 'Colombia',
      passport_issue_date: '',
      passport_expiry_date: '',
      lost_passport: 'No',
      
      address: '',
      phone: '',
      email: '',
      
      occupation: 'Empleado/a',
      employer_name: '',
      job_title: '',
      monthly_income: '',
      trip_payer: 'El mismo solicitante',
      
      travel_purpose: 'Turismo / Negocios',
      intended_arrival_date: '',
      stay_duration: '15 días',
      us_address: '',
      prev_us_travel: 'No',
      prev_visa: 'No',

      ds160_confirmation: '', 
      relationship: 'primary',
      files: {}
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
            setApplicants(json.applicants.map((a, idx) => {
              const fd = a.form_data || {};
              return {
                full_name: a.full_name || fd.full_name || '',
                given_names: fd.given_names || a.full_name || '',
                surname: fd.surname || '',
                native_name: fd.native_name || '',
                other_names: fd.other_names || '',
                national_id: fd.national_id || '',
                tax_id: fd.tax_id || '',
                gender: fd.gender || 'Masculino',
                marital_status: fd.marital_status || 'Soltero/a',
                birth_date: fd.birth_date || '',
                birth_city: fd.birth_city || '',
                birth_country: fd.birth_country || 'Colombia',
                
                passport_number: a.passport_number || fd.passport_number || '',
                passport_country: fd.passport_country || 'Colombia',
                passport_issue_date: fd.passport_issue_date || '',
                passport_expiry_date: fd.passport_expiry_date || '',
                lost_passport: fd.lost_passport || 'No',
                
                address: fd.address || '',
                phone: fd.phone || '',
                email: fd.email || json.client_email || '',
                
                occupation: fd.occupation || 'Empleado/a',
                employer_name: fd.employer_name || '',
                job_title: fd.job_title || '',
                monthly_income: fd.monthly_income || '',
                trip_payer: fd.trip_payer || 'El mismo solicitante',
                
                travel_purpose: fd.travel_purpose || json.purpose || 'Turismo / Negocios',
                intended_arrival_date: fd.intended_arrival_date || '',
                stay_duration: fd.stay_duration || '15 días',
                us_address: fd.us_address || '',
                prev_us_travel: fd.prev_us_travel || 'No',
                prev_visa: fd.prev_visa || 'No',

                ds160_confirmation: a.ds160_confirmation || fd.ds160_confirmation || '',
                relationship: idx === 0 ? 'primary' : (a.relationship || 'dependent'),
                files: {}
              };
            }));
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
      { 
        full_name: '', 
        given_names: '',
        surname: '',
        native_name: '',
        other_names: '',
        national_id: '',
        tax_id: '',
        gender: 'Masculino',
        marital_status: 'Soltero/a',
        birth_date: '',
        birth_city: '',
        birth_country: 'Colombia',
        
        passport_number: '',
        passport_country: 'Colombia',
        passport_issue_date: '',
        passport_expiry_date: '',
        lost_passport: 'No',
        
        address: '',
        phone: '',
        email: '',
        
        occupation: 'Empleado/a',
        employer_name: '',
        job_title: '',
        monthly_income: '',
        trip_payer: 'El mismo solicitante',
        
        travel_purpose: data?.purpose || 'Turismo / Negocios',
        intended_arrival_date: '',
        stay_duration: '15 días',
        us_address: '',
        prev_us_travel: 'No',
        prev_visa: 'No',

        ds160_confirmation: '',
        relationship: 'Acompañante', 
        files: {} 
      }
    ]);
  };

  const handleRemoveApplicant = (idx) => {
    if (applicants.length === 1) return;
    const next = applicants.filter((_, i) => i !== idx);
    setApplicants(next);
    if (activeApplicantTab >= next.length) setActiveApplicantTab(Math.max(0, next.length - 1));
  };

  const updateApplicantField = (idx, field, val) => {
    const next = [...applicants];
    next[idx][field] = val;
    // Auto-update full_name if given_names and surname are edited
    if (field === 'given_names' || field === 'surname') {
      const g = field === 'given_names' ? val : next[idx].given_names;
      const s = field === 'surname' ? val : next[idx].surname;
      next[idx].full_name = `${g} ${s}`.trim();
    }
    setApplicants(next);
  };

  const handleFileDrop = (applicantIdx, docTypeId, file) => {
    if (!file) return;
    const next = [...applicants];
    next[applicantIdx].files[docTypeId] = file;
    setApplicants(next);
    toast.success(`Adjuntado: ${DOC_TYPES.find(d => d.id === docTypeId)?.title || 'Archivo'}`);
  };

  const validateStep = (step) => {
    if (step === 1) {
      for (let i = 0; i < applicants.length; i++) {
        if (!applicants[i].full_name.trim()) {
          toast.error(`Ingresa el nombre del Solicitante #${i + 1}`);
          return false;
        }
      }
    }
    if (step === 2) {
      for (let i = 0; i < applicants.length; i++) {
        if (!applicants[i].passport_number.trim()) {
          toast.error(`Ingresa el número de pasaporte del Solicitante #${i + 1}`);
          return false;
        }
      }
    }
    if (step === 5) {
      // Require passport and photo
      for (let i = 0; i < applicants.length; i++) {
        const p = applicants[i];
        if (!p.files.passport) {
          toast.error(`Adjunta el Pasaporte de ${p.full_name || `Solicitante #${i + 1}`}`);
          setActiveApplicantTab(i);
          return false;
        }
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
        const fullName = app.full_name || `${app.given_names} ${app.surname}`.trim();
        payload.append(`full_name_${idx}`, fullName);
        payload.append(`passport_number_${idx}`, app.passport_number);
        payload.append(`ds160_confirmation_${idx}`, app.ds160_confirmation || '');
        payload.append(`relationship_${idx}`, app.relationship || 'primary');

        // Compile complete questionnaire response object for automation script / AI payload
        const formDataObj = {
          full_name: fullName,
          given_names: app.given_names,
          surname: app.surname,
          native_name: app.native_name,
          other_names: app.other_names,
          national_id: app.national_id,
          tax_id: app.tax_id,
          gender: app.gender,
          marital_status: app.marital_status,
          birth_date: app.birth_date,
          birth_city: app.birth_city,
          birth_country: app.birth_country,
          passport_number: app.passport_number,
          passport_country: app.passport_country,
          passport_issue_date: app.passport_issue_date,
          passport_expiry_date: app.passport_expiry_date,
          lost_passport: app.lost_passport,
          address: app.address,
          phone: app.phone,
          email: app.email,
          occupation: app.occupation,
          employer_name: app.employer_name,
          job_title: app.job_title,
          monthly_income: app.monthly_income,
          trip_payer: app.trip_payer,
          travel_purpose: app.travel_purpose,
          intended_arrival_date: app.intended_arrival_date,
          stay_duration: app.stay_duration,
          us_address: app.us_address,
          prev_us_travel: app.prev_us_travel,
          prev_visa: app.prev_visa,
          ds160_confirmation: app.ds160_confirmation
        };

        payload.append(`form_data_${idx}`, JSON.stringify(formDataObj));

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
        <div className="panel" style={{ maxWidth: '540px', width: '100%', padding: '3rem 2rem', textAlign: 'center', borderRadius: '24px', boxShadow: 'var(--shadow-lg)' }}>
          <div style={{ width: '72px', height: '72px', background: `${brandColor}15`, border: `2px solid ${brandColor}`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
            <Check size={36} color={brandColor} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--text-1)' }}>
            ¡Expediente Recibido!
          </h1>
          <p style={{ color: 'var(--text-2)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem' }}>
            Tus respuestas y documentos fueron encriptados con seguridad SSL 256-bit y transmitidos exitosamente a <strong style={{ color: 'var(--text-1)' }}>{data.agency_name}</strong> para la preparación del formulario consular.
          </p>
          <div style={{ background: 'var(--surface-2)', padding: '1rem 1.5rem', borderRadius: '12px', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-3)' }}>Nº Expediente</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: brandColor, fontSize: '1.1rem' }}>#{data.id.toString().padStart(4, '0')}</span>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-3)' }}>
            Puedes cerrar esta pestaña con total tranquilidad. Su asesor de viajes revisará el expediente.
          </p>
        </div>
      </div>
    );
  }

  const stepsList = [
    { step: 1, title: 'Identidad', icon: User },
    { step: 2, title: 'Pasaporte', icon: FileText },
    { step: 3, title: 'Laboral', icon: Briefcase },
    { step: 4, title: 'Viaje', icon: Plane },
    { step: 5, title: 'Documentos', icon: UploadCloud },
    { step: 6, title: 'Confirmar', icon: ShieldCheck }
  ];

  return (
    <div className="animate-in" style={{ minHeight: '100vh', background: 'var(--bg)', padding: '1.5rem 1rem 4rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      
      {/* ── HEADER MARCA BLANCA DE AGENCIA ── */}
      <header style={{ width: '100%', maxWidth: '740px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
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
            <div style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>Portal Oficial de Preparación de Expedientes</div>
          </div>
        </div>
        <div className="badge" style={{ color: brandColor, background: `${brandColor}12`, borderColor: `${brandColor}30`, padding: '0.35rem 0.7rem', fontSize: '0.72rem' }}>
          <Lock size={12} style={{ marginRight: '4px' }} /> SSL 256-Bit
        </div>
      </header>

      {/* ── CONTENEDOR PRINCIPAL ── */}
      <div style={{ width: '100%', maxWidth: '740px' }}>
        
        {/* TITULO */}
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-1)', marginBottom: '0.4rem', letterSpacing: '-0.02em' }}>
            Expediente de Visa - {data.target_country}
          </h1>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-2)', margin: 0 }}>
            Categoría: <strong style={{ color: brandColor }}>{data.visa_category}</strong> · Cuestionario Consular Oficial · Nº <span style={{ fontFamily: 'var(--font-mono)' }}>#{data.id.toString().padStart(4, '0')}</span>
          </p>
        </div>

        {/* ── STEPPER DIDÁCTICO EN BARRA INTERACTIVA ── */}
        <div style={{ marginBottom: '2.5rem', background: 'var(--surface-2)', padding: '0.75rem 1rem', borderRadius: '16px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', overflowX: 'auto', gap: '0.5rem' }}>
          {stepsList.map(s => {
            const active = currentStep === s.step;
            const completed = currentStep > s.step;
            const Icon = s.icon;
            return (
              <div 
                key={s.step} 
                onClick={() => {
                  if (s.step > currentStep && !validateStep(currentStep)) return;
                  setCurrentStep(s.step);
                }}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.4rem', 
                  cursor: completed || active ? 'pointer' : 'default',
                  opacity: active || completed ? 1 : 0.4,
                  padding: '0.3rem 0.6rem',
                  borderRadius: '99px',
                  background: active ? `${brandColor}15` : 'transparent'
                }}
              >
                <div style={{ 
                  width: '24px', 
                  height: '24px', 
                  borderRadius: '50%', 
                  background: completed ? brandColor : active ? brandColor : 'var(--border)', 
                  color: completed || active ? '#FFF' : 'var(--text-3)',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontSize: '0.75rem', 
                  fontWeight: 700 
                }}>
                  {completed ? <Check size={12} /> : s.step}
                </div>
                <span style={{ fontSize: '0.8rem', fontWeight: active ? 700 : 500, color: active ? 'var(--text-1)' : 'var(--text-2)', whiteSpace: 'nowrap' }}>
                  {s.title}
                </span>
              </div>
            );
          })}
        </div>

        {/* ────────────────── PASO 1: DATOS DE IDENTIDAD ────────────────── */}
        {currentStep === 1 && (
          <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-1)', margin: 0 }}>
                  Paso 1: Identidad y Datos Personales
                </h2>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-3)', margin: '0.2rem 0 0 0' }}>
                  Proporciona los datos del solicitante exactamente como figuran en sus documentos oficiales.
                </p>
              </div>
              <button 
                type="button" 
                onClick={handleAddApplicant}
                className="btn btn-outline btn-sm"
                style={{ borderRadius: '99px', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem' }}
              >
                <Plus size={14} /> + Añadir Acompañante
              </button>
            </div>

            {applicants.map((app, idx) => (
              <div key={idx} className="panel" style={{ padding: '1.5rem', borderRadius: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: `${brandColor}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <User size={15} color={brandColor} />
                    </div>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-1)' }}>
                      {idx === 0 ? 'Solicitante Principal' : `Acompañante #${idx}`}
                    </span>
                  </div>
                  {idx > 0 && (
                    <button type="button" onClick={() => handleRemoveApplicant(idx)} style={{ background: 'none', border: 'none', color: '#F87171', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.78rem' }}>
                      <Trash2 size={14} /> Eliminar
                    </button>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
                  <div>
                    <label className="input-label">Nombres de Pila *</label>
                    <input 
                      type="text"
                      className="input-field"
                      placeholder="Ej: Juan Carlos"
                      value={app.given_names}
                      onChange={e => updateApplicantField(idx, 'given_names', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="input-label">Apellidos Completos *</label>
                    <input 
                      type="text"
                      className="input-field"
                      placeholder="Ej: Pérez Gómez"
                      value={app.surname}
                      onChange={e => updateApplicantField(idx, 'surname', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="input-label">Documento Nacional de Identidad / Cédula</label>
                    <input 
                      type="text"
                      className="input-field"
                      placeholder="Nº de Cédula o DNI"
                      value={app.national_id}
                      onChange={e => updateApplicantField(idx, 'national_id', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="input-label">Género</label>
                    <select className="input-field" value={app.gender} onChange={e => updateApplicantField(idx, 'gender', e.target.value)}>
                      <option value="Masculino">Masculino</option>
                      <option value="Femenino">Femenino</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>

                  <div>
                    <label className="input-label">Estado Civil</label>
                    <select className="input-field" value={app.marital_status} onChange={e => updateApplicantField(idx, 'marital_status', e.target.value)}>
                      <option value="Soltero/a">Soltero / Soltera</option>
                      <option value="Casado/a">Casado / Casada</option>
                      <option value="Unión Libre">Unión Libre / De Hecho</option>
                      <option value="Divorciado/a">Divorciado / Divorciada</option>
                      <option value="Viudo/a">Viudo / Viuda</option>
                    </select>
                  </div>

                  <div>
                    <label className="input-label">Fecha de Nacimiento</label>
                    <input 
                      type="date"
                      className="input-field"
                      value={app.birth_date}
                      onChange={e => updateApplicantField(idx, 'birth_date', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="input-label">Ciudad de Nacimiento</label>
                    <input 
                      type="text"
                      className="input-field"
                      placeholder="Ej: Bogotá"
                      value={app.birth_city}
                      onChange={e => updateApplicantField(idx, 'birth_city', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="input-label">País de Nacimiento</label>
                    <input 
                      type="text"
                      className="input-field"
                      placeholder="Ej: Colombia"
                      value={app.birth_country}
                      onChange={e => updateApplicantField(idx, 'birth_country', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}

            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                type="button" 
                onClick={() => { if (validateStep(1)) setCurrentStep(2); }}
                className="btn btn-primary"
                style={{ background: brandColor, padding: '0.85rem 2rem', fontSize: '0.95rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                Siguiente: Datos de Pasaporte <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ────────────────── PASO 2: PASAPORTE Y CONTACTO ────────────────── */}
        {currentStep === 2 && (
          <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-1)', margin: 0 }}>
                Paso 2: Pasaporte y Datos de Contacto
              </h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-3)', margin: '0.2rem 0 0 0' }}>
                Verifica que el pasaporte tenga una vigencia mínima de 6 meses.
              </p>
            </div>

            {applicants.map((app, idx) => (
              <div key={idx} className="panel" style={{ padding: '1.5rem', borderRadius: '16px' }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-1)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileText size={16} color={brandColor} />
                  Pasaporte de: <span style={{ color: brandColor }}>{app.full_name || `Solicitante #${idx + 1}`}</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
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
                    <label className="input-label">País de Emisión</label>
                    <input 
                      type="text"
                      className="input-field"
                      placeholder="Ej: Colombia"
                      value={app.passport_country}
                      onChange={e => updateApplicantField(idx, 'passport_country', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="input-label">Fecha de Emisión del Pasaporte</label>
                    <input 
                      type="date"
                      className="input-field"
                      value={app.passport_issue_date}
                      onChange={e => updateApplicantField(idx, 'passport_issue_date', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="input-label">Fecha de Expiración del Pasaporte</label>
                    <input 
                      type="date"
                      className="input-field"
                      value={app.passport_expiry_date}
                      onChange={e => updateApplicantField(idx, 'passport_expiry_date', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="input-label">Teléfono Móvil / WhatsApp</label>
                    <input 
                      type="text"
                      className="input-field"
                      placeholder="+57 300 1234567"
                      value={app.phone}
                      onChange={e => updateApplicantField(idx, 'phone', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="input-label">Correo Electrónico</label>
                    <input 
                      type="email"
                      className="input-field"
                      placeholder="ejemplo@correo.com"
                      value={app.email}
                      onChange={e => updateApplicantField(idx, 'email', e.target.value)}
                    />
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label className="input-label">Dirección de Residencia Actual</label>
                    <input 
                      type="text"
                      className="input-field"
                      placeholder="Dirección, Barrio, Ciudad, País"
                      value={app.address}
                      onChange={e => updateApplicantField(idx, 'address', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
              <button type="button" onClick={() => setCurrentStep(1)} className="btn btn-outline" style={{ padding: '0.85rem 1.5rem', borderRadius: '12px' }}>
                <ArrowLeft size={16} /> Volver
              </button>
              <button 
                type="button" 
                onClick={() => { if (validateStep(2)) setCurrentStep(3); }}
                className="btn btn-primary"
                style={{ background: brandColor, padding: '0.85rem 2rem', fontSize: '0.95rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                Siguiente: Información Laboral <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ────────────────── PASO 3: INFORMACIÓN LABORAL ────────────────── */}
        {currentStep === 3 && (
          <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-1)', margin: 0 }}>
                Paso 3: Información Laboral y Financiera
              </h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-3)', margin: '0.2rem 0 0 0' }}>
                Esta información demuestra tus arraigos con tu país de origen ante el consulado.
              </p>
            </div>

            {applicants.map((app, idx) => (
              <div key={idx} className="panel" style={{ padding: '1.5rem', borderRadius: '16px' }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-1)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Briefcase size={16} color={brandColor} />
                  Ocupación de: <span style={{ color: brandColor }}>{app.full_name || `Solicitante #${idx + 1}`}</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
                  <div>
                    <label className="input-label">Ocupación / Situación Actual</label>
                    <select className="input-field" value={app.occupation} onChange={e => updateApplicantField(idx, 'occupation', e.target.value)}>
                      <option value="Empleado/a">Empleado / Trabajador Dependiente</option>
                      <option value="Independiente">Trabajador Independiente / Empresario</option>
                      <option value="Estudiante">Estudiante Universitario / Escolar</option>
                      <option value="Jubilado/a">Pensionado / Jubilado</option>
                      <option value="Hogar">Labores del Hogar / Desempleado</option>
                    </select>
                  </div>

                  <div>
                    <label className="input-label">Nombre de Empresa o Institución</label>
                    <input 
                      type="text"
                      className="input-field"
                      placeholder="Ej: Banco de Bogotá S.A."
                      value={app.employer_name}
                      onChange={e => updateApplicantField(idx, 'employer_name', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="input-label">Cargo / Puesto de Trabajo</label>
                    <input 
                      type="text"
                      className="input-field"
                      placeholder="Ej: Analista de Sistemas"
                      value={app.job_title}
                      onChange={e => updateApplicantField(idx, 'job_title', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="input-label">Ingreso Mensual Aprox. (USD / COP)</label>
                    <input 
                      type="text"
                      className="input-field"
                      placeholder="Ej: 1,200 USD o $4,500,000 COP"
                      value={app.monthly_income}
                      onChange={e => updateApplicantField(idx, 'monthly_income', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
              <button type="button" onClick={() => setCurrentStep(2)} className="btn btn-outline" style={{ padding: '0.85rem 1.5rem', borderRadius: '12px' }}>
                <ArrowLeft size={16} /> Volver
              </button>
              <button 
                type="button" 
                onClick={() => setCurrentStep(4)}
                className="btn btn-primary"
                style={{ background: brandColor, padding: '0.85rem 2rem', fontSize: '0.95rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                Siguiente: Planes de Viaje <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ────────────────── PASO 4: PLANES DE VIAJE ────────────────── */}
        {currentStep === 4 && (
          <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-1)', margin: 0 }}>
                Paso 4: Detalles del Viaje a EE. UU.
              </h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-3)', margin: '0.2rem 0 0 0' }}>
                Proporciona información sobre tu itinerario previsto o estimado.
              </p>
            </div>

            {applicants.map((app, idx) => (
              <div key={idx} className="panel" style={{ padding: '1.5rem', borderRadius: '16px' }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-1)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Plane size={16} color={brandColor} />
                  Itinerario de: <span style={{ color: brandColor }}>{app.full_name || `Solicitante #${idx + 1}`}</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
                  <div>
                    <label className="input-label">Propósito Principal del Viaje</label>
                    <input 
                      type="text"
                      className="input-field"
                      placeholder="Ej: Turismo, Compras, Negocios"
                      value={app.travel_purpose}
                      onChange={e => updateApplicantField(idx, 'travel_purpose', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="input-label">Fecha Estimada de Llegada</label>
                    <input 
                      type="date"
                      className="input-field"
                      value={app.intended_arrival_date}
                      onChange={e => updateApplicantField(idx, 'intended_arrival_date', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="input-label">Duración Estimada de la Estancia</label>
                    <input 
                      type="text"
                      className="input-field"
                      placeholder="Ej: 10 días / 2 semanas"
                      value={app.stay_duration}
                      onChange={e => updateApplicantField(idx, 'stay_duration', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="input-label">¿Quién paga los gastos del viaje?</label>
                    <select className="input-field" value={app.trip_payer} onChange={e => updateApplicantField(idx, 'trip_payer', e.target.value)}>
                      <option value="El mismo solicitante">El mismo solicitante</option>
                      <option value="Empresa / Patrocinador">Empresa / Empleador</option>
                      <option value="Familiar en EE. UU.">Familiar en EE. UU.</option>
                      <option value="Familiar en país de origen">Familiar en país de origen</option>
                    </select>
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label className="input-label">Dirección de Hospedaje en EE. UU.</label>
                    <input 
                      type="text"
                      className="input-field"
                      placeholder="Nombre de Hotel o Dirección de familiar/amigo (Ciudad, Estado)"
                      value={app.us_address}
                      onChange={e => updateApplicantField(idx, 'us_address', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
              <button type="button" onClick={() => setCurrentStep(3)} className="btn btn-outline" style={{ padding: '0.85rem 1.5rem', borderRadius: '12px' }}>
                <ArrowLeft size={16} /> Volver
              </button>
              <button 
                type="button" 
                onClick={() => setCurrentStep(5)}
                className="btn btn-primary"
                style={{ background: brandColor, padding: '0.85rem 2rem', fontSize: '0.95rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                Siguiente: Carga de Documentos <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ────────────────── PASO 5: DOCUMENTOS ────────────────── */}
        {currentStep === 5 && (
          <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-1)', margin: 0 }}>
                Paso 5: Expediente Digital de Archivos Cifrados
              </h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-3)', margin: '0.2rem 0 0 0' }}>
                Adjunta copia de tu pasaporte y foto digital en alta resolución.
              </p>
            </div>

            {applicants.length > 1 && (
              <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                {applicants.map((a, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveApplicantTab(i)}
                    className={`btn btn-sm ${activeApplicantTab === i ? 'btn-primary' : 'btn-outline'}`}
                    style={{ borderRadius: '99px', background: activeApplicantTab === i ? brandColor : 'transparent', borderColor: activeApplicantTab === i ? brandColor : 'var(--border)' }}
                  >
                    {a.full_name || `Solicitante #${i + 1}`}
                  </button>
                ))}
              </div>
            )}

            <div className="panel" style={{ padding: '1.5rem', borderRadius: '16px' }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-1)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UploadCloud size={16} color={brandColor} />
                Adjuntar archivos para: <span style={{ color: brandColor }}>{applicants[activeApplicantTab]?.full_name || `Solicitante #${activeApplicantTab + 1}`}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                {DOC_TYPES.map(doc => {
                  const currentFile = applicants[activeApplicantTab]?.files?.[doc.id];
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
                              handleFileDrop(activeApplicantTab, doc.id, e.target.files[0]);
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
              <button type="button" onClick={() => setCurrentStep(4)} className="btn btn-outline" style={{ padding: '0.85rem 1.5rem', borderRadius: '12px' }}>
                <ArrowLeft size={16} /> Volver
              </button>
              <button 
                type="button" 
                onClick={() => { if (validateStep(5)) setCurrentStep(6); }}
                className="btn btn-primary"
                style={{ background: brandColor, padding: '0.85rem 2rem', fontSize: '0.95rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                Revisar Expediente Completo <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ────────────────── PASO 6: CONFIRMACIÓN Y ENVÍO ────────────────── */}
        {currentStep === 6 && (
          <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-1)', margin: 0 }}>
                Paso 6: Verificación y Envío Cifrado
              </h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-3)', margin: '0.2rem 0 0 0' }}>
                Verifica el resumen de respuestas antes de enviar el expediente a tu asesor de viajes.
              </p>
            </div>

            <div className="panel" style={{ padding: '1.5rem', borderRadius: '16px' }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-1)', marginBottom: '1rem' }}>
                Resumen de Integrantes ({applicants.length})
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {applicants.map((a, idx) => (
                  <div key={idx} style={{ padding: '1rem', background: 'var(--surface-2)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--text-1)', fontSize: '0.92rem' }}>
                        {a.full_name} <span style={{ fontSize: '0.75rem', color: brandColor, fontWeight: 500 }}>({idx === 0 ? 'Titular Principal' : a.relationship})</span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
                        Pasaporte: {a.passport_number} · Ocupación: {a.occupation}
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

            <div style={{ padding: '1.25rem', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '16px', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <input 
                type="checkbox" 
                id="decl"
                checked={declaration}
                onChange={e => setDeclaration(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: brandColor, marginTop: '2px', cursor: 'pointer' }}
              />
              <label htmlFor="decl" style={{ fontSize: '0.82rem', color: 'var(--text-2)', cursor: 'pointer', lineHeight: 1.5 }}>
                Declaro bajo mi responsabilidad que la información y documentos suministrados son legítimos y verídicos para la preparación de mi solicitud de visa.
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
              <button type="button" onClick={() => setCurrentStep(5)} className="btn btn-outline" style={{ padding: '0.85rem 1.5rem', borderRadius: '12px' }}>
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
