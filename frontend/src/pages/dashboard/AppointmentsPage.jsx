import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { createPortal } from 'react-dom';
import { useOutletContext } from 'react-router-dom';
import { Search, RefreshCw, Plus, X, ChevronUp, ChevronDown, Eye, ArrowLeft, ArrowRight, Lock, Globe, Calendar, CheckCircle2, AlertTriangle, User } from 'lucide-react';
import { api } from '../../services/api';

const STATUS_MAP = {
  'Adelantada': { tag: 'tag-lime', label: t ? t('dashboard.appointments.advanced') : 'ADELANTADA' },
  'Buscando': { tag: 'tag-gold', label: t ? t('dashboard.appointments.searching') : 'BUSCANDO' },
  'Pendiente': { tag: 'tag-cyan', label: t ? t('dashboard.appointments.pending') : 'PENDIENTE' },
};
const getTag = s => STATUS_MAP[s] || { tag: 'tag-cyan', label: s?.toUpperCase() || '—' };

const COUNTRIES = {
  "ar": "Argentina", "ec": "Ecuador", "bs": "The Bahamas", "gy": "Guyana", "bb": "Barbados",
  "jm": "Jamaica", "bz": "Belize", "mx": "Mexico", "br": "Brazil", "py": "Paraguay",
  "bo": "Bolivia", "pe": "Peru", "ca": "Canada", "sr": "Suriname", "cl": "Chile",
  "tt": "Trinidad and Tobago", "co": "Colombia", "uy": "Uruguay", "cw": "Curacao",
  "us": "United States (Domestic Visa Renewal)", "al": "Albania", "ie": "Ireland",
  "am": "Armenia", "kv": "Kosovo", "az": "Azerbaijan", "mk": "North Macedonia",
  "be": "Belgium", "nl": "The Netherlands", "ba": "Bosnia and Herzegovina", "pt": "Portugal",
  "hr": "Croatia", "rs": "Serbia", "cy": "Cyprus", "es": "Spain and Andorra", "fr": "France",
  "tr": "Turkiye", "gr": "Greece", "gb": "United Kingdom", "it": "Italy",
  "il": "Israel, Jerusalem, The West Bank, and Gaza", "ae": "United Arab Emirates",
  "ir": "Iran", "ao": "Angola", "rw": "Rwanda", "cm": "Cameroon", "sn": "Senegal",
  "cv": "Cabo Verde", "tz": "Tanzania", "cd": "The Democratic Republic of the Congo",
  "za": "South Africa", "et": "Ethiopia", "ug": "Uganda", "ke": "Kenya", "zm": "Zambia"
};

const COUNTRY_CONSULATES = {
  "co": [{ "name": "Bogotá", "facility_id": "25", "asc_facility_id": "26" }],
  "mx": [
    { "name": "Ciudad Juarez", "facility_id": "65", "asc_facility_id": "76" },
    { "name": "Guadalajara", "facility_id": "66", "asc_facility_id": "77" },
    { "name": "Hermosillo", "facility_id": "67", "asc_facility_id": "78" },
    { "name": "Matamoros", "facility_id": "68", "asc_facility_id": "79" },
    { "name": "Merida", "facility_id": "69", "asc_facility_id": "81" },
    { "name": "Mexico City", "facility_id": "70", "asc_facility_id": "82" },
    { "name": "Monterrey", "facility_id": "71", "asc_facility_id": "83" },
    { "name": "Nogales", "facility_id": "72", "asc_facility_id": "84" },
    { "name": "Nuevo Laredo", "facility_id": "73", "asc_facility_id": "85" },
    { "name": "Tijuana", "facility_id": "74", "asc_facility_id": "88" },
  ],
  "ar": [{ "name": "Buenos Aires", "facility_id": "Buenos Aires", "asc_facility_id": "Buenos Aires_cas" }],
  "br": [
    { "name": "Brasilia", "facility_id": "Brasilia", "asc_facility_id": "Brasilia_cas" },
    { "name": "São Paulo", "facility_id": "São Paulo", "asc_facility_id": "São Paulo_cas" },
    { "name": "Río de Janeiro", "facility_id": "Río", "asc_facility_id": "Río_cas" },
    { "name": "Recife", "facility_id": "Recife", "asc_facility_id": "Recife_cas" },
    { "name": "Porto Alegre", "facility_id": "Porto Alegre", "asc_facility_id": "Porto Alegre_cas" }
  ],
  "ec": [
    { "name": "Quito", "facility_id": "Quito", "asc_facility_id": "Quito_cas" },
    { "name": "Guayaquil", "facility_id": "Guayaquil", "asc_facility_id": "Guayaquil_cas" }
  ],
  "pe": [{ "name": "Lima", "facility_id": "Lima", "asc_facility_id": "Lima_cas" }],
  "cl": [{ "name": "Santiago", "facility_id": "Santiago", "asc_facility_id": "Santiago_cas" }],
  "uy": [{ "name": "Montevideo", "facility_id": "Montevideo", "asc_facility_id": "Montevideo_cas" }],
  "jm": [{ "name": "Kingston", "facility_id": "Kingston", "asc_facility_id": "Kingston_cas" }],
  "ca": [
    { "name": "Toronto", "facility_id": "Toronto", "asc_facility_id": "Toronto_cas" },
    { "name": "Vancouver", "facility_id": "Vancouver", "asc_facility_id": "Vancouver_cas" }
  ]
};

/* ── MODAL ── */
const Modal = ({ apt, onClose, t }) => {
  if (!apt) return null;
  const { tag, label } = getTag(apt.status);

  const modalRows = [
    [t('dashboard.appointments.client'), apt.client],
    ['SCHEDULE_ID', apt.schedule_id || '—'],
    ['SOLICITANTES', apt.schedule_names || '—'],
    [t('dashboard.appointments.type'), apt.type],
    [t('dashboard.appointments.orig_date'), apt.originalDate || '—'],
    [t('dashboard.appointments.new_date'), apt.newDate || '—'],
  ];

  if (apt.system_user_name) {
    modalRows.push(['USUARIO_SISTEMA', `${apt.system_user_name} (${apt.system_user_email})`]);
  }

  if (apt.date_created) {
    modalRows.push(['FECHA_REGISTRO', apt.date_created]);
  }
  if (apt.date_booked) {
    modalRows.push(['FECHA_AGENDADO', apt.date_booked]);
  }

  return createPortal(
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div onClick={e => e.stopPropagation()} className="animate-in" style={{ width: '100%', maxWidth: '480px', background: 'var(--surface)', border: '1px solid var(--border-2)' }}>
        {/* header */}
        <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-2)' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--lime)' }}>CITA #{apt.id}</span>
          <button className="btn btn-icon" onClick={onClose} style={{ border: 'none', width: '24px', height: '24px' }}><X size={13} /></button>
        </div>
        {/* body */}
        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0' }}>
          {modalRows.map(([k, v]) => (
            <div key={k} style={{ display: 'flex', borderBottom: '1px solid var(--border)', padding: '0.625rem 0' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', fontWeight: 700, color: 'var(--text-3)', letterSpacing: '0.1em', minWidth: '140px' }}>{k}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--text-1)' }}>{v}</div>
            </div>
          ))}
          <div style={{ display: 'flex', padding: '0.625rem 0' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', fontWeight: 700, color: 'var(--text-3)', letterSpacing: '0.1em', minWidth: '140px' }}>{t('dashboard.appointments.status')}</div>
            <span className={`tag ${tag}`}>{label}</span>
          </div>
        </div>
        <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--border)' }}>
          <button className="btn btn-lime" style={{ width: '100%' }} onClick={onClose}>{t('dashboard.appointments.btn_close')}</button>
        </div>
      </div>
    </div>,
    document.body
  );
};

/* ── CREATE WIZARD ── */
const CreateWizard = ({ onClose, onCreated }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    country: 'co',
    consulate: '25',
    consulate_asc: '26',
    needs_cas: true,
    schedule_id: '',
    ivr: 'null',
    min_consulate_date: '',
    max_consulate_date: '',
  });

  const [mode, setMode] = useState('discover'); // 'discover' | 'manual'
  const [discovering, setDiscovering] = useState(false);
  const [discoveredSchedules, setDiscoveredSchedules] = useState(null);
  const [tempAppointmentId, setTempAppointmentId] = useState(null);
  const [selectedScheduleId, setSelectedScheduleId] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleCountryChange = (e) => {
    const newCountry = e.target.value;
    const consulates = COUNTRY_CONSULATES[newCountry];
    setFormData({
      ...formData,
      country: newCountry,
      consulate: consulates ? consulates[0].facility_id : '',
      consulate_asc: consulates ? consulates[0].asc_facility_id : '',
      needs_cas: !!consulates,
    });
  };

  const handleConsulateChange = (e) => {
    const facility_id = e.target.value;
    const consulates = COUNTRY_CONSULATES[formData.country];
    if (consulates) {
      const selected = consulates.find(c => c.facility_id === facility_id);
      if (selected) {
        setFormData({
          ...formData,
          consulate: selected.facility_id,
          consulate_asc: selected.asc_facility_id,
        });
        return;
      }
    }
    setFormData({ ...formData, consulate: facility_id });
  };

  const handleDiscoverSchedules = async () => {
    if (!formData.email || !formData.password) {
      setError('Por favor regresa al Paso 1 e ingresa el email y la contraseña.');
      return;
    }
    if (!formData.country || !formData.consulate) {
      setError('Por favor regresa al Paso 2 e ingresa el país y la sede del consulado.');
      return;
    }
    setDiscovering(true);
    setError('');
    setDiscoveredSchedules(null);
    try {
      const payload = { ...formData };
      if (!payload.min_consulate_date) delete payload.min_consulate_date;
      if (!payload.max_consulate_date) delete payload.max_consulate_date;
      if (!payload.needs_cas) payload.consulate_asc = null;
      delete payload.needs_cas;
      delete payload.schedule_id;

      const res = await api.discoverDirect(payload);
      if (res.status === 'ok') {
        setDiscoveredSchedules(res.schedules);
        setTempAppointmentId(res.appointment_id);
        const keys = Object.keys(res.schedules);
        if (keys.length > 0) {
          setSelectedScheduleId(keys[0]);
        }
      } else {
        setError(res.detail || 'No se encontraron Schedule IDs en el portal.');
      }
    } catch (err) {
      setError(err.message || 'Error al conectar con el portal de visas.');
    } finally {
      setDiscovering(false);
    }
  };

  const handleNextStep = () => {
    setError('');
    if (currentStep === 1) {
      if (!formData.email || !formData.password) {
        setError('Debes ingresar el correo y la contraseña del portal.');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!formData.country || !formData.consulate) {
        setError('Debes configurar el país y la sede del consulado.');
        return;
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      setCurrentStep(4);
    } else if (currentStep === 4) {
      if (mode === 'manual' && !formData.schedule_id) {
        setError('Debes ingresar el Schedule ID manualmente.');
        return;
      }
      if (mode === 'discover' && !selectedScheduleId) {
        setError('Debes descubrir y seleccionar un Schedule ID del portal.');
        return;
      }
      setCurrentStep(5);
    }
  };

  const handlePrevStep = () => {
    setError('');
    setCurrentStep(prev => prev - 1);
  };

  const handleFinish = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (mode === 'manual') {
        const payload = { ...formData };
        if (!payload.min_consulate_date) delete payload.min_consulate_date;
        if (!payload.max_consulate_date) delete payload.max_consulate_date;
        if (!payload.needs_cas) payload.consulate_asc = null;
        delete payload.needs_cas;

        await api.createAppointment(payload);
      } else {
        const selectedName = discoveredSchedules[selectedScheduleId] || '';
        await api.selectSchedule(tempAppointmentId, selectedScheduleId, selectedName);
      }
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Error al guardar o iniciar la búsqueda');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { num: 1, label: 'ACCESO', desc: 'Credenciales' },
    { num: 2, label: 'CONSULAR', desc: 'País y Sede' },
    { num: 3, label: 'FECHAS', desc: 'Límites' },
    { num: 4, label: 'VÍNCULO', desc: 'Schedule ID' },
    { num: 5, label: 'DESPLIEGUE', desc: 'Resumen' }
  ];

  return (
    <div className="panel animate-in" style={{ width: '100%', maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', border: '1px solid var(--border-2)', background: 'var(--surface)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>

      {/* Cabecera del Asistente */}
      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.01)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.15em', color: 'var(--lime)' }}>MÓDULO: CREACIÓN_DE_AGENDAMIENTOS</span>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-1)', marginTop: '0.25rem' }}>Asistente de Configuración Experto</h3>
        </div>
        <button type="button" className="btn btn-icon" onClick={onClose} style={{ border: 'none', width: '32px', height: '32px', background: 'var(--surface-2)', borderRadius: '50%' }}><X size={14} /></button>
      </div>

      <div style={{ padding: '1.5rem' }}>
        {/* Indicador de pasos (Stepper) */}
        {!success && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', background: 'rgba(255,255,255,0.01)', padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
            {steps.map((s, idx) => {
              const isActive = currentStep === s.num;
              const isCompleted = currentStep > s.num;
              return (
                <React.Fragment key={s.num}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: idx === 4 ? 'initial' : 1 }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      background: isActive ? 'var(--lime)' : isCompleted ? 'rgba(163, 230, 53, 0.1)' : 'rgba(255,255,255,0.03)',
                      color: isActive ? 'var(--black)' : isCompleted ? 'var(--lime)' : 'var(--text-3)',
                      border: '1px solid ' + (isActive || isCompleted ? 'var(--lime)' : 'var(--border)'),
                      boxShadow: isActive ? '0 0 10px rgba(163, 230, 53, 0.3)' : 'none',
                      transition: 'all 0.3s ease'
                    }}>
                      {isCompleted ? '✓' : s.num}
                    </div>
                    <div style={{ display: 'block' }}>
                      <span style={{ display: 'block', fontSize: '0.65rem', fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.05em', color: isActive ? 'var(--lime)' : isCompleted ? 'var(--text-2)' : 'var(--text-3)' }}>{s.label}</span>
                      <span style={{ display: 'block', fontSize: '0.55rem', color: 'var(--text-3)' }}>{s.desc}</span>
                    </div>
                  </div>
                  {idx < 4 && (
                    <div style={{
                      flex: 1,
                      height: '1px',
                      background: isCompleted ? 'var(--lime)' : 'var(--border)',
                      margin: '0 0.5rem',
                      transition: 'all 0.3s ease'
                    }} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        )}

        {/* Mensaje de Error global del Wizard */}
        {error && (
          <div style={{ marginBottom: '1.25rem', padding: '0.75rem 1rem', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 'var(--radius-md)', color: '#F87171', fontSize: '0.85rem', whiteSpace: 'pre-line', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
            <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
            <div>{error}</div>
          </div>
        )}

        {/* Cuerpo del paso actual */}
        <div style={{ minHeight: '260px' }}>

          {/* PASO 1: ACCESO */}
          {currentStep === 1 && (
            <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ borderLeft: '3px solid var(--lime)', paddingLeft: '0.75rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-1)' }}>Credenciales del Portal</h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-3)', marginTop: '0.25rem' }}>Proporciona el correo y la contraseña con la que inicias sesión en el portal oficial de agendamiento de visas.</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem', marginTop: '0.5rem' }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><User size={11} /> EMAIL PORTAL</label>
                  <input className="input-field" type="email" placeholder="cliente@email.com" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Lock size={11} /> CONTRASEÑA PORTAL</label>
                  <input className="input-field" type="password" placeholder="••••••••" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} required />
                </div>
              </div>
            </div>
          )}

          {/* PASO 2: CONFIGURACIÓN CONSULAR */}
          {currentStep === 2 && (
            <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ borderLeft: '3px solid var(--lime)', paddingLeft: '0.75rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-1)' }}>Configuración Consular y Sede</h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-3)', marginTop: '0.25rem' }}>Selecciona el país y el consulado correspondiente a la cita que deseas adelantar.</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginTop: '0.5rem' }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Globe size={11} /> PAÍS (CONSULADO)</label>
                  <select className="input-field" style={{ appearance: 'none', background: 'rgba(255,255,255,0.02) url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' fill=\'%23A1A1AA\' viewBox=\'0 0 16 16\'%3E%3Cpath d=\'M8 11L3 6h10l-5 5z\'/%3E%3C/svg%3E") no-repeat calc(100% - 1rem) center' }} value={formData.country} onChange={handleCountryChange} required>
                    {Object.entries(COUNTRIES).map(([code, name]) => (
                      <option key={code} value={code} style={{ background: 'var(--surface-2)', color: 'var(--text-1)' }}>{name}</option>
                    ))}
                  </select>
                </div>

                {COUNTRY_CONSULATES[formData.country] ? (
                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Globe size={11} /> SEDE CONSULADO</label>
                    <select className="input-field" style={{ appearance: 'none', background: 'rgba(255,255,255,0.02) url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' fill=\'%23A1A1AA\' viewBox=\'0 0 16 16\'%3E%3Cpath d=\'M8 11L3 6h10l-5 5z\'/%3E%3C/svg%3E") no-repeat calc(100% - 1rem) center' }} value={formData.consulate} onChange={handleConsulateChange} required>
                      {COUNTRY_CONSULATES[formData.country].map(c => (
                        <option key={c.facility_id} value={c.facility_id} style={{ background: 'var(--surface-2)', color: 'var(--text-1)' }}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Globe size={11} /> CIUDAD DE EMBAJADA</label>
                    <input className="input-field" type="text" placeholder="Ej. Madrid" value={formData.consulate} onChange={handleConsulateChange} required />
                  </div>
                )}
              </div>

              {COUNTRY_CONSULATES[formData.country] && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--bg)', padding: '0.875rem 1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', marginTop: '0.5rem' }}>
                  <input type="checkbox" id="needs_cas" checked={formData.needs_cas} onChange={e => setFormData({ ...formData, needs_cas: e.target.checked })} style={{ width: '16px', height: '16px', accentColor: 'var(--lime)', cursor: 'pointer' }} />
                  <div>
                    <label htmlFor="needs_cas" style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-1)', cursor: 'pointer' }}>Requiere cita en Centro Externo (CAS/ASC)</label>
                    {formData.needs_cas && (
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', fontFamily: 'var(--font-mono)', marginTop: '0.1rem' }}>
                        Sede CAS asignada: {formData.consulate_asc}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PASO 3: PARÁMETROS Y FECHAS */}
          {currentStep === 3 && (
            <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ borderLeft: '3px solid var(--lime)', paddingLeft: '0.75rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-1)' }}>Rango de Fechas Objetivo</h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-3)', marginTop: '0.25rem' }}>Opcional. Especifica el rango de fechas en el cual el bot buscará reprogramar la cita. Si no se indica, reprogramará la más cercana disponible.</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginTop: '0.5rem' }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Calendar size={11} /> FECHA MÍNIMA</label>
                  <input className="input-field" type="date" value={formData.min_consulate_date} onChange={e => setFormData({ ...formData, min_consulate_date: e.target.value })} style={{ colorScheme: 'dark' }} />
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Calendar size={11} /> FECHA MÁXIMA</label>
                  <input className="input-field" type="date" value={formData.max_consulate_date} onChange={e => setFormData({ ...formData, max_consulate_date: e.target.value })} style={{ colorScheme: 'dark' }} />
                </div>
              </div>
            </div>
          )}

          {/* PASO 4: VÍNCULO (SCHEDULE ID) */}
          {currentStep === 4 && (
            <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ borderLeft: '3px solid var(--lime)', paddingLeft: '0.75rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-1)' }}>Vinculación del Identificador</h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-3)', marginTop: '0.25rem' }}>Vincula el Schedule ID de la cita. Puedes buscarlo automáticamente conectando con el portal o escribirlo manualmente.</p>
              </div>

              {/* Selector de modo interactivo */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
                <div
                  onClick={() => { setMode('discover'); setError(''); }}
                  style={{
                    padding: '1.25rem',
                    background: mode === 'discover' ? 'rgba(163, 230, 53, 0.03)' : 'rgba(255,255,255,0.01)',
                    border: '1px solid ' + (mode === 'discover' ? 'var(--lime)' : 'var(--border)'),
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: mode === 'discover' ? '0 0 15px rgba(163, 230, 53, 0.05)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, color: mode === 'discover' ? 'var(--lime)' : 'var(--text-1)' }}>
                    <Search size={14} /> AUTO-DESCUBRIR (RECOMENDADO)
                  </div>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-3)', marginTop: '0.5rem', lineHeight: '1.3' }}>El bot se conectará de manera segura al portal y extraerá las citas y nombres asociados a la cuenta.</p>
                </div>

                <div
                  onClick={() => { setMode('manual'); setError(''); }}
                  style={{
                    padding: '1.25rem',
                    background: mode === 'manual' ? 'rgba(163, 230, 53, 0.03)' : 'rgba(255,255,255,0.01)',
                    border: '1px solid ' + (mode === 'manual' ? 'var(--lime)' : 'var(--border)'),
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: mode === 'manual' ? '0 0 15px rgba(163, 230, 53, 0.05)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, color: mode === 'manual' ? 'var(--lime)' : 'var(--text-1)' }}>
                    <User size={14} /> INGRESO MANUAL DIRECTO
                  </div>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-3)', marginTop: '0.5rem', lineHeight: '1.3' }}>Escribe directamente el número de 8 dígitos de tu Schedule ID si ya lo conoces de antemano.</p>
                </div>
              </div>

              {/* Panel de contenido según el modo */}
              <div style={{ marginTop: '0.5rem' }}>
                {mode === 'manual' ? (
                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.05em' }}>SCHEDULE ID (8 DÍGITOS)</label>
                    <input className="input-field" type="text" placeholder="Ej. 12345678" value={formData.schedule_id} onChange={e => setFormData({ ...formData, schedule_id: e.target.value })} required={mode === 'manual'} />
                  </div>
                ) : (
                  <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px dashed var(--border)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
                    {discovering ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', gap: '0.75rem', textAlign: 'center' }}>
                        <RefreshCw size={28} style={{ animation: 'spin 1.5s linear infinite', color: 'var(--lime)' }} />
                        <div>
                          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-1)', display: 'block' }}>Buscando Schedule ID en el servidor...</span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-3)', display: 'block', marginTop: '0.25rem' }}>Iniciando sesión remota de forma segura. Este proceso en la VPS suele tardar entre 1 y 2 minutos.</span>
                        </div>
                      </div>
                    ) : discoveredSchedules && Object.keys(discoveredSchedules).length > 0 ? (
                      <div className="input-group" style={{ marginBottom: 0 }}>
                        <label className="input-label" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.05em', color: 'var(--lime)' }}>SELECCIONAR SOLICITANTE / IDENTIFICADOR DETECTADO</label>
                        <select
                          className="input-field"
                          style={{ appearance: 'none', background: 'rgba(255,255,255,0.02) url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' fill=\'%23A1A1AA\' viewBox=\'0 0 16 16\'%3E%3Cpath d=\'M8 11L3 6h10l-5 5z\'/%3E%3C/svg%3E") no-repeat calc(100% - 1rem) center' }}
                          value={selectedScheduleId}
                          onChange={e => setSelectedScheduleId(e.target.value)}
                        >
                          {Object.entries(discoveredSchedules).map(([id, name]) => (
                            <option key={id} value={id} style={{ background: 'var(--surface-2)', color: 'var(--text-1)' }}>
                              {name} (ID: {id})
                            </option>
                          ))}
                        </select>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.625rem' }}>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>VÍNCULOS ENCONTRADOS: {Object.keys(discoveredSchedules).length} CITA(S)</span>
                          <button type="button" onClick={handleDiscoverSchedules} style={{ background: 'none', border: 'none', color: 'var(--lime)', fontSize: '0.7rem', textDecoration: 'underline', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}>REALIZAR NUEVA BÚSQUEDA</button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', textAlign: 'center', padding: '0.5rem 0' }}>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-2)', maxWidth: '480px' }}>
                          Conectaremos de forma remota a la VPS para iniciar sesión en la plataforma y extraer tus Schedule IDs automáticamente.
                        </span>
                        <button
                          type="button"
                          className="btn btn-lime btn-sm"
                          onClick={handleDiscoverSchedules}
                          style={{ minWidth: '240px', gap: '0.5rem' }}
                        >
                          <Search size={13} /> CONECTAR Y BUSCAR EN PORTAL
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PASO 5: RESUMEN Y DESPLIEGUE */}
          {currentStep === 5 && (
            <div className="animate-in">
              {success ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem 1rem', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', background: 'rgba(163,230,53,0.1)', border: '1px solid var(--lime)', borderRadius: '50%', color: 'var(--lime)', boxShadow: '0 0 20px rgba(163,230,53,0.2)' }}>
                    <CheckCircle2 size={32} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-1)' }}>¡Agente Desplegado con Éxito!</h4>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-3)', marginTop: '0.35rem', maxWidth: '460px', margin: '0.35rem auto 0' }}>El script del agendamiento ha sido creado e inicializado correctamente en el servidor mediante el gestor de procesos PM2.</p>
                  </div>

                  <div style={{ width: '100%', maxWidth: '420px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '0.875rem', marginTop: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>PROCESO PM2:</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--lime)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>ACTIVO (ONLINE)</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>CLIENTE ASIGNADO:</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-1)', fontFamily: 'var(--font-mono)' }}>{formData.email}</span>
                    </div>
                  </div>

                  <button type="button" className="btn btn-lime" style={{ marginTop: '1rem', width: '100%', maxWidth: '200px' }} onClick={onCreated}>FINALIZAR</button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div style={{ borderLeft: '3px solid var(--lime)', paddingLeft: '0.75rem' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-1)' }}>Confirmación y Lanzamiento</h4>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-3)', marginTop: '0.25rem' }}>Revisa la configuración completa del agendamiento antes de lanzar el agente automático en el servidor VPS.</p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <span style={{ fontSize: '0.62rem', color: 'var(--text-3)', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>EMAIL DEL PORTAL</span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-1)', fontWeight: 600 }}>{formData.email}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <span style={{ fontSize: '0.62rem', color: 'var(--text-3)', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>SCHEDULE ID VINCULADO</span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--lime)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                        {mode === 'discover' ? selectedScheduleId : formData.schedule_id}
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <span style={{ fontSize: '0.62rem', color: 'var(--text-3)', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>PAÍS Y SEDE CONSULAR</span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-1)' }}>
                        {COUNTRIES[formData.country]} ({formData.consulate})
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <span style={{ fontSize: '0.62rem', color: 'var(--text-3)', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>RANGO DE FECHAS LIMITADO</span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-1)' }}>
                        {formData.min_consulate_date || 'Sin límite'} → {formData.max_consulate_date || 'Sin límite'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Botones de Navegación del Wizard */}
        {!success && (
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '1.25rem', marginTop: '1.5rem', gap: '1rem' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={currentStep === 1 ? onClose : handlePrevStep}
              disabled={loading}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <ArrowLeft size={12} /> {currentStep === 1 ? 'CANCELAR' : 'ATRÁS'}
            </button>

            <button
              type="button"
              className="btn btn-lime"
              onClick={currentStep === 5 ? handleFinish : handleNextStep}
              disabled={loading || discovering || (currentStep === 4 && mode === 'discover' && !selectedScheduleId)}
              style={{
                minWidth: '160px',
                background: currentStep === 5 ? 'linear-gradient(135deg, var(--lime), var(--accent-2))' : 'var(--surface-3)',
                color: currentStep === 5 ? '#fff' : 'var(--text-1)',
                border: currentStep === 5 ? 'none' : '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem'
              }}
            >
              {loading ? (
                'DESPLEGANDO...'
              ) : currentStep === 5 ? (
                <>INICIAR AGENTE PM2 <CheckCircle2 size={12} /></>
              ) : (
                <>CONTINUAR <ArrowRight size={12} /></>
              )}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

/* ── MAIN ── */
const AppointmentsPage = () => {
  const { t } = useTranslation();
  const { role } = useOutletContext();
  const [apts, setApts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusF, setStatusF] = useState('ALL');
  const [sortF, setSortF] = useState('id');
  const [sortD, setSortD] = useState('desc');
  const [selected, setSelected] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  // Filtros de fecha para administrador
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dateFilterType, setDateFilterType] = useState('originalDate'); // originalDate, date_booked, date_created

  const isAdmin = role === 'ADMINISTRATOR' || role === 'AUDITOR';
  const canEdit = role !== 'AUDITOR';

  const load = useCallback(async () => {
    setLoading(true);
    try { setApts(await api.getAppointments()); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    let r = [...apts];
    if (search) { const q = search.toLowerCase(); r = r.filter(a => a.client?.toLowerCase().includes(q) || a.type?.toLowerCase().includes(q) || String(a.id).includes(q)); }
    if (statusF !== 'ALL') r = r.filter(a => a.status === statusF);

    // Filtrado por fecha para administrador
    if (isAdmin) {
      if (startDate) {
        r = r.filter(a => {
          const val = a[dateFilterType];
          return val ? val.substring(0, 10) >= startDate : false;
        });
      }
      if (endDate) {
        r = r.filter(a => {
          const val = a[dateFilterType];
          return val ? val.substring(0, 10) <= endDate : false;
        });
      }
    }

    // Filtrar duplicados por schedule_id (mantener el primero, que es el más reciente)
    const seenSchedules = new Set();
    r = r.filter(a => {
      if (a.schedule_id) {
        const sid = String(a.schedule_id).trim();
        if (sid) {
          if (seenSchedules.has(sid)) {
            return false;
          }
          seenSchedules.add(sid);
        }
      }
      return true;
    });

    r.sort((a, b) => sortD === 'asc' ? String(a[sortF] ?? '').localeCompare(String(b[sortF] ?? '')) : String(b[sortF] ?? '').localeCompare(String(a[sortF] ?? '')));
    setFiltered(r);
  }, [apts, search, statusF, sortF, sortD, startDate, endDate, dateFilterType, isAdmin]);

  const toggleSort = f => { if (sortF === f) setSortD(d => d === 'asc' ? 'desc' : 'asc'); else { setSortF(f); setSortD('asc'); } };
  const SortIco = ({ f }) => sortF === f ? (sortD === 'asc' ? <ChevronUp size={10} /> : <ChevronDown size={10} />) : null;

  const statuses = ['ALL', ...new Set(apts.map(a => a.status).filter(Boolean))];

  if (isCreating) {
    return (
      <CreateWizard
        onClose={() => setIsCreating(false)}
        onCreated={() => { setIsCreating(false); load(); }}
      />
    );
  }

  return (
    <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* ── HEADER ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-3)', letterSpacing: '0.1em', marginBottom: '4px' }}>
            MÓDULO: GESTIÓN_DE_CITAS
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-1)' }}>
            {filtered.length} <span style={{ color: 'var(--text-3)' }}>/ {apts.length} REGISTROS</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-sm" onClick={load} style={{ gap: '0.4rem' }}>
            <RefreshCw size={11} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />SYNC
          </button>
          {canEdit && <button className="btn btn-sm btn-lime" onClick={() => setIsCreating(true)}><Plus size={11} /> NUEVA</button>}
        </div>
      </div>

      {/* ── FILTERS ── */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', padding: '0.875rem', background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
        <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
          <Search size={13} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
          <input
            type="text"
            placeholder="BUSCAR: cliente / tipo / ID..."
            className="input-field"
            style={{ paddingLeft: '2.25rem', height: '36px', fontSize: '0.78rem' }}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch('')} className="btn btn-icon" style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', border: 'none' }}>
              <X size={11} />
            </button>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0', border: '1px solid var(--border)' }}>
          {statuses.map(s => (
            <button key={s} onClick={() => setStatusF(s)} className="btn btn-sm" style={{
              border: 'none', borderRight: '1px solid var(--border)',
              background: statusF === s ? 'var(--lime)' : 'transparent',
              color: statusF === s ? 'var(--black)' : 'var(--text-3)',
              fontWeight: statusF === s ? 700 : 400,
            }}>
              {s === 'ALL' ? 'TODO' : s.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* ── DATE FILTERS (ADMIN ONLY) ── */}
      {isAdmin && (
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', padding: '0.875rem', background: 'var(--surface-2)', border: '1px solid var(--border)', borderTop: 'none', marginTop: '-1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-3)', letterSpacing: '0.05em' }}>FILTRAR POR:</span>
            <select
              value={dateFilterType}
              onChange={e => setDateFilterType(e.target.value)}
              className="input-field"
              style={{ height: '32px', fontSize: '0.75rem', padding: '0 0.5rem', width: 'auto', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}
            >
              <option value="originalDate" style={{ background: 'var(--surface)' }}>Fecha Objetivo</option>
              <option value="date_booked" style={{ background: 'var(--surface)' }}>Fecha de Agendado</option>
              <option value="date_created" style={{ background: 'var(--surface)' }}>Fecha de Registro</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-3)' }}>DESDE:</span>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="input-field"
              style={{ height: '32px', fontSize: '0.75rem', width: '135px', colorScheme: 'dark', background: 'var(--surface)', border: '1px solid var(--border)', padding: '0 0.5rem', borderRadius: 'var(--radius-sm)' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-3)' }}>HASTA:</span>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="input-field"
              style={{ height: '32px', fontSize: '0.75rem', width: '135px', colorScheme: 'dark', background: 'var(--surface)', border: '1px solid var(--border)', padding: '0 0.5rem', borderRadius: 'var(--radius-sm)' }}
            />
          </div>

          {(startDate || endDate) && (
            <button
              onClick={() => { setStartDate(''); setEndDate(''); }}
              className="btn btn-sm btn-outline"
              style={{ height: '32px', padding: '0 0.75rem', fontSize: '0.7rem' }}
            >
              LIMPIAR FECHAS
            </button>
          )}
        </div>
      )}

      {/* ── TABLE ── */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                {isAdmin && <th onClick={() => toggleSort('id')} style={{ cursor: 'pointer' }}>ID <SortIco f="id" /></th>}
                {isAdmin && <th onClick={() => toggleSort('system_user_name')} style={{ cursor: 'pointer' }}>USUARIO_SISTEMA <SortIco f="system_user_name" /></th>}
                <th onClick={() => toggleSort('client')} style={{ cursor: 'pointer' }}>CLIENTE <SortIco f="client" /></th>
                <th onClick={() => toggleSort('schedule_id')} style={{ cursor: 'pointer' }}>SCHEDULE_ID <SortIco f="schedule_id" /></th>
                <th>TIPO_VISA</th>
                <th onClick={() => toggleSort('originalDate')} style={{ cursor: 'pointer' }}>FECHA_OBJ <SortIco f="originalDate" /></th>
                <th>{t('dashboard.appointments.status')}</th>
                {canEdit && <th>OPS</th>}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    {[isAdmin && 1, isAdmin && 1, 1, 1, 1, 1, 1, canEdit && 1].filter(Boolean).map((__, j) => (
                      <td key={j}><div className="skeleton" style={{ height: '13px', width: `${50 + Math.random() * 40}%` }} /></td>
                    ))}
                  </tr>
                ))
                : filtered.length === 0
                  ? (
                    <tr>
                      <td colSpan={[isAdmin && 1, isAdmin && 1, 1, 1, 1, 1, 1, canEdit && 1].filter(Boolean).length} style={{ textAlign: 'center', padding: '3rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-3)' }}>
                        &gt; NO_RECORDS_FOUND
                      </td>
                    </tr>
                  )
                  : filtered.map(apt => {
                    const { tag, label } = getTag(apt.status);
                    return (
                      <tr key={apt.id}>
                        {isAdmin && (
                          <td className="mono" style={{ color: 'var(--text-3)', fontSize: '0.72rem' }}>#{String(apt.id).padStart(4, '0')}</td>
                        )}
                        {isAdmin && (
                          <td style={{ fontSize: '0.75rem', color: 'var(--text-1)' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontWeight: 600 }}>{apt.system_user_name || '—'}</span>
                              <span style={{ fontSize: '0.65rem', color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>{apt.system_user_email || ''}</span>
                            </div>
                          </td>
                        )}
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: '6px', height: '6px', background: 'var(--lime)', flexShrink: 0 }} />
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontWeight: 600 }}>{apt.client}</span>
                              {apt.schedule_names && (
                                <span style={{ fontSize: '0.68rem', color: 'var(--text-3)' }}>
                                  👥 {apt.schedule_names}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-2)' }}>{apt.schedule_id || '—'}</td>
                        <td className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-2)' }}>{apt.type}</td>
                        <td className="mono" style={{ fontSize: '0.78rem', color: 'var(--text-2)' }}>{apt.originalDate || '—'}</td>
                        <td><span className={`tag ${tag}`}>{label}</span></td>
                        {canEdit && (
                          <td>
                            <button className="btn btn-sm" onClick={() => setSelected(apt)} style={{ gap: '0.3rem' }}>
                              <Eye size={11} /> VER
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })
              }
            </tbody>
          </table>
        </div>

        {/* footer */}
        {!loading && filtered.length > 0 && (
          <div style={{ padding: '0.5rem 1rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-3)' }}>
              {filtered.length} RECORDS · SORTED BY {sortF.toUpperCase()} {sortD.toUpperCase()}
            </span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <span className="tag tag-lime">{apts.filter(a => a.status === 'Adelantada').length} ADELANT</span>
              <span className="tag tag-gold">{apts.filter(a => a.status === 'Buscando').length} BUSCANDO</span>
            </div>
          </div>
        )}
      </div>

      <Modal apt={selected} onClose={() => setSelected(null)} />
    </div>
  );
};

export default AppointmentsPage;
