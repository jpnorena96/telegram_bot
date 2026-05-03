import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Search, RefreshCw, Plus, X, ChevronUp, ChevronDown, Eye } from 'lucide-react';
import { api } from '../../services/api';

const STATUS_MAP = {
  'Adelantada': { tag: 'tag-lime',   label: 'ADELANTADA' },
  'Buscando':   { tag: 'tag-gold',   label: 'BUSCANDO'   },
  'Pendiente':  { tag: 'tag-cyan',   label: 'PENDIENTE'  },
};
const getTag = s => STATUS_MAP[s] || { tag: 'tag-cyan', label: s?.toUpperCase() || '—' };

/* ── MODAL ── */
const Modal = ({ apt, onClose }) => {
  if (!apt) return null;
  const { tag, label } = getTag(apt.status);
  return (
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
    </div>
  );
};

/* ── CREATE MODAL ── */
const CreateModal = ({ onClose, onCreated }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    country: 'co',
    consulate: 'Lima',
    schedule_id: '',
    ivr: 'null',
    min_consulate_date: '',
    max_consulate_date: '',
  });
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
      await api.createAppointment(payload);
      onCreated();
    } catch (err) {
      setError(err.message || 'Error al crear cita');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div onClick={e => e.stopPropagation()} className="animate-in" style={{ width: '100%', maxWidth: '480px', background: 'var(--black-2)', border: '1px solid var(--border-2)' }}>
        <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--black-3)' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--lime)' }}>NUEVO AGENDAMIENTO</span>
          <button type="button" className="btn btn-icon" onClick={onClose} style={{ border: 'none', width: '24px', height: '24px' }}><X size={13} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {error && <div style={{ color: 'var(--red)', fontSize: '0.8rem' }}>{error}</div>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            <label style={{ fontSize: '0.7rem', color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>EMAIL PORTAL</label>
            <input className="input-field" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            <label style={{ fontSize: '0.7rem', color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>CONTRASEÑA PORTAL</label>
            <input className="input-field" type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            <label style={{ fontSize: '0.7rem', color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>SCHEDULE ID</label>
            <input className="input-field" type="text" value={formData.schedule_id} onChange={e => setFormData({...formData, schedule_id: e.target.value})} required />
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', flex: 1 }}>
              <label style={{ fontSize: '0.7rem', color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>FECHA MIN</label>
              <input className="input-field" type="date" value={formData.min_consulate_date} onChange={e => setFormData({...formData, min_consulate_date: e.target.value})} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', flex: 1 }}>
              <label style={{ fontSize: '0.7rem', color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>FECHA MAX</label>
              <input className="input-field" type="date" value={formData.max_consulate_date} onChange={e => setFormData({...formData, max_consulate_date: e.target.value})} />
            </div>
          </div>
          <div style={{ marginTop: '0.5rem' }}>
            <button type="submit" className="btn btn-lime" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'GUARDANDO...' : 'CREAR AGENDAMIENTO'}
            </button>
          </div>
        </form>
      </div>
    </div>
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
