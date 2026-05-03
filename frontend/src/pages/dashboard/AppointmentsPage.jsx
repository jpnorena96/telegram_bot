import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useOutletContext } from 'react-router-dom';
import { Search, RefreshCw, Plus, X, ChevronUp, ChevronDown, Eye } from 'lucide-react';
import { api } from '../../services/api';

const STATUS_MAP = {
  'Adelantada': { tag: 'tag-lime',   label: 'ADELANTADA' },
  'Buscando':   { tag: 'tag-gold',   label: 'BUSCANDO'   },
  'Pendiente':  { tag: 'tag-cyan',   label: 'PENDIENTE'  },
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
  "co": [{"name": "Bogotá", "facility_id": "25", "asc_facility_id": "26"}],
  "mx": [
    {"name": "Ciudad Juarez", "facility_id": "65", "asc_facility_id": "76"},
    {"name": "Guadalajara", "facility_id": "66", "asc_facility_id": "77"},
    {"name": "Hermosillo", "facility_id": "67", "asc_facility_id": "78"},
    {"name": "Matamoros", "facility_id": "68", "asc_facility_id": "79"},
    {"name": "Merida", "facility_id": "69", "asc_facility_id": "81"},
    {"name": "Mexico City", "facility_id": "70", "asc_facility_id": "82"},
    {"name": "Monterrey", "facility_id": "71", "asc_facility_id": "83"},
    {"name": "Nogales", "facility_id": "72", "asc_facility_id": "84"},
    {"name": "Nuevo Laredo", "facility_id": "73", "asc_facility_id": "85"},
    {"name": "Tijuana", "facility_id": "74", "asc_facility_id": "88"},
  ],
  "ar": [{"name": "Buenos Aires", "facility_id": "Buenos Aires", "asc_facility_id": "Buenos Aires_cas"}],
  "br": [
    {"name": "Brasilia", "facility_id": "Brasilia", "asc_facility_id": "Brasilia_cas"},
    {"name": "São Paulo", "facility_id": "São Paulo", "asc_facility_id": "São Paulo_cas"},
    {"name": "Río de Janeiro", "facility_id": "Río", "asc_facility_id": "Río_cas"},
    {"name": "Recife", "facility_id": "Recife", "asc_facility_id": "Recife_cas"},
    {"name": "Porto Alegre", "facility_id": "Porto Alegre", "asc_facility_id": "Porto Alegre_cas"}
  ],
  "ec": [
    {"name": "Quito", "facility_id": "Quito", "asc_facility_id": "Quito_cas"},
    {"name": "Guayaquil", "facility_id": "Guayaquil", "asc_facility_id": "Guayaquil_cas"}
  ],
  "pe": [{"name": "Lima", "facility_id": "Lima", "asc_facility_id": "Lima_cas"}],
  "cl": [{"name": "Santiago", "facility_id": "Santiago", "asc_facility_id": "Santiago_cas"}],
  "uy": [{"name": "Montevideo", "facility_id": "Montevideo", "asc_facility_id": "Montevideo_cas"}],
  "jm": [{"name": "Kingston", "facility_id": "Kingston", "asc_facility_id": "Kingston_cas"}],
  "ca": [
    {"name": "Toronto", "facility_id": "Toronto", "asc_facility_id": "Toronto_cas"},
    {"name": "Vancouver", "facility_id": "Vancouver", "asc_facility_id": "Vancouver_cas"}
  ]
};

/* ── MODAL ── */
const Modal = ({ apt, onClose }) => {
  if (!apt) return null;
  const { tag, label } = getTag(apt.status);
  return createPortal(
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div onClick={e => e.stopPropagation()} className="animate-in" style={{ width: '100%', maxWidth: '480px', background: 'var(--black-2)', border: '1px solid var(--border-2)' }}>
        {/* header */}
        <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--black-3)' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--lime)' }}>CITA #{apt.id}</span>
          <button className="btn btn-icon" onClick={onClose} style={{ border: 'none', width: '24px', height: '24px' }}><X size={13} /></button>
        </div>
        {/* body */}
        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0' }}>
          {[
            ['CLIENTE',        apt.client],
            ['TIPO_VISA',      apt.type],
            ['FECHA_OBJETIVO',  apt.originalDate || '—'],
            ['FECHA_ADELANTO',  apt.newDate || '—'],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', borderBottom: '1px solid var(--border)', padding: '0.625rem 0' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', fontWeight: 700, color: 'var(--text-3)', letterSpacing: '0.1em', minWidth: '140px' }}>{k}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--text-1)' }}>{v}</div>
            </div>
          ))}
          <div style={{ display: 'flex', padding: '0.625rem 0' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', fontWeight: 700, color: 'var(--text-3)', letterSpacing: '0.1em', minWidth: '140px' }}>ESTADO</div>
            <span className={`tag ${tag}`}>{label}</span>
          </div>
        </div>
        <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--border)' }}>
          <button className="btn btn-lime" style={{ width: '100%' }} onClick={onClose}>CERRAR</button>
        </div>
      </div>
    </div>,
    document.body
  );
};

/* ── CREATE MODAL ── */
const CreateModal = ({ onClose, onCreated }) => {
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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = { ...formData };
      if (!payload.min_consulate_date) delete payload.min_consulate_date;
      if (!payload.max_consulate_date) delete payload.max_consulate_date;
      if (!payload.needs_cas) payload.consulate_asc = null;
      delete payload.needs_cas;
      
      await api.createAppointment(payload);
      onCreated();
    } catch (err) {
      setError(err.message || 'Error al crear cita');
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(4px)' }}>
      <div onClick={e => e.stopPropagation()} className="animate-in panel" style={{ width: '100%', maxWidth: '520px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div className="panel-header" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.15em', color: 'var(--lime)' }}>NUEVO_AGENDAMIENTO</span>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-1)', marginTop: '0.25rem' }}>Agregar Cliente al Portal</h3>
          </div>
          <button type="button" className="btn btn-icon" onClick={onClose} style={{ border: 'none', width: '32px', height: '32px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}><X size={14} /></button>
        </div>
        <form onSubmit={handleSubmit} className="panel-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {error && <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 'var(--radius-sm)', color: '#F87171', fontSize: '0.85rem' }}>{error}</div>}
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.05em' }}>EMAIL PORTAL</label>
              <input className="input-field" type="email" placeholder="cliente@email.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.05em' }}>CONTRASEÑA PORTAL</label>
              <input className="input-field" type="password" placeholder="••••••••" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.05em' }}>SCHEDULE ID</label>
              <input className="input-field" type="text" placeholder="Ej. 12345678" value={formData.schedule_id} onChange={e => setFormData({...formData, schedule_id: e.target.value})} required />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.05em' }}>PAÍS (CONSULADO)</label>
              <select className="input-field" style={{ appearance: 'none', background: 'rgba(255,255,255,0.02) url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' fill=\'%23A1A1AA\' viewBox=\'0 0 16 16\'%3E%3Cpath d=\'M8 11L3 6h10l-5 5z\'/%3E%3C/svg%3E") no-repeat calc(100% - 1rem) center' }} value={formData.country} onChange={handleCountryChange} required>
                {Object.entries(COUNTRIES).map(([code, name]) => (
                  <option key={code} value={code} style={{ background: 'var(--surface-2)', color: 'var(--text-1)' }}>{name}</option>
                ))}
              </select>
            </div>
            
            {COUNTRY_CONSULATES[formData.country] ? (
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.05em' }}>SEDE CONSULADO</label>
                <select className="input-field" style={{ appearance: 'none', background: 'rgba(255,255,255,0.02) url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' fill=\'%23A1A1AA\' viewBox=\'0 0 16 16\'%3E%3Cpath d=\'M8 11L3 6h10l-5 5z\'/%3E%3C/svg%3E") no-repeat calc(100% - 1rem) center' }} value={formData.consulate} onChange={handleConsulateChange} required>
                  {COUNTRY_CONSULATES[formData.country].map(c => (
                    <option key={c.facility_id} value={c.facility_id} style={{ background: 'var(--surface-2)', color: 'var(--text-1)' }}>{c.name}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.05em' }}>CIUDAD DE EMBAJADA</label>
                <input className="input-field" type="text" placeholder="Ej. Madrid" value={formData.consulate} onChange={handleConsulateChange} required />
              </div>
            )}
          </div>

          {COUNTRY_CONSULATES[formData.country] && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(255,255,255,0.02)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <input type="checkbox" id="needs_cas" checked={formData.needs_cas} onChange={e => setFormData({...formData, needs_cas: e.target.checked})} style={{ width: '16px', height: '16px', accentColor: 'var(--lime)' }} />
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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.05em' }}>FECHA MÍNIMA (OPCIONAL)</label>
              <input className="input-field" type="date" value={formData.min_consulate_date} onChange={e => setFormData({...formData, min_consulate_date: e.target.value})} style={{ colorScheme: 'dark' }} />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.05em' }}>FECHA MÁXIMA (OPCIONAL)</label>
              <input className="input-field" type="date" value={formData.max_consulate_date} onChange={e => setFormData({...formData, max_consulate_date: e.target.value})} style={{ colorScheme: 'dark' }} />
            </div>
          </div>

          <div style={{ marginTop: '0.75rem', display: 'flex', gap: '1rem' }}>
            <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={onClose}>CANCELAR</button>
            <button type="submit" className="btn btn-lime" style={{ flex: 2, background: 'linear-gradient(135deg, var(--lime), var(--accent-2))', color: '#fff', border: 'none' }} disabled={loading}>
              {loading ? 'GUARDANDO...' : 'CREAR AGENDAMIENTO'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

/* ── MAIN ── */
const AppointmentsPage = () => {
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
    r.sort((a, b) => sortD === 'asc' ? String(a[sortF] ?? '').localeCompare(String(b[sortF] ?? '')) : String(b[sortF] ?? '').localeCompare(String(a[sortF] ?? '')));
    setFiltered(r);
  }, [apts, search, statusF, sortF, sortD]);

  const toggleSort = f => { if (sortF === f) setSortD(d => d === 'asc' ? 'desc' : 'asc'); else { setSortF(f); setSortD('asc'); } };
  const SortIco = ({ f }) => sortF === f ? (sortD === 'asc' ? <ChevronUp size={10} /> : <ChevronDown size={10} />) : null;

  const statuses = ['ALL', ...new Set(apts.map(a => a.status).filter(Boolean))];

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
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', padding: '0.875rem', background: 'var(--black-3)', border: '1px solid var(--border)' }}>
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

      {/* ── TABLE ── */}
      <div style={{ background: 'var(--black-2)', border: '1px solid var(--border)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                {isAdmin && <th onClick={() => toggleSort('id')} style={{ cursor: 'pointer' }}>ID <SortIco f="id" /></th>}
                <th onClick={() => toggleSort('client')} style={{ cursor: 'pointer' }}>CLIENTE <SortIco f="client" /></th>
                <th>TIPO_VISA</th>
                <th onClick={() => toggleSort('originalDate')} style={{ cursor: 'pointer' }}>FECHA_OBJ <SortIco f="originalDate" /></th>
                <th>ESTADO</th>
                {canEdit && <th>OPS</th>}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>
                      {[isAdmin && 1, 1, 1, 1, 1, canEdit && 1].filter(Boolean).map((__, j) => (
                        <td key={j}><div className="skeleton" style={{ height: '13px', width: `${50 + Math.random() * 40}%` }} /></td>
                      ))}
                    </tr>
                  ))
                : filtered.length === 0
                  ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-3)' }}>
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
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: '6px', height: '6px', background: 'var(--lime)', flexShrink: 0 }} />
                            <span style={{ fontWeight: 600 }}>{apt.client}</span>
                          </div>
                        </td>
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
      {isCreating && (
        <CreateModal 
          onClose={() => setIsCreating(false)} 
          onCreated={() => { setIsCreating(false); load(); }} 
        />
      )}
    </div>
  );
};

export default AppointmentsPage;
