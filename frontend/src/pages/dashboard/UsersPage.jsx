import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Search, RefreshCw, UserPlus, X, ChevronUp, ChevronDown, ShieldOff, Trash2, CheckCircle, Edit } from 'lucide-react';
import { api } from '../../services/api';

const ROLE_TAG = {
  ADMINISTRATOR: { cls: 'tag-orange', short: 'ADM' },
  AUDITOR:       { cls: 'tag-gold',   short: 'AUD' },
  VISA_MANAGER:  { cls: 'tag-cyan',   short: 'MGR' },
  TRAVEL_AGENCY: { cls: 'tag-cyan',   short: 'AGC' },
  NATURAL_PERSON:{ cls: 'tag-lime',   short: 'CLI' },
};

const UsersPage = () => {
  const { role } = useOutletContext();
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleF, setRoleF] = useState('ALL');
  const [statusF, setStatusF] = useState('ALL');
  const [sortF, setSortF] = useState('id');
  const [sortD, setSortD] = useState('desc');

  const isAdmin = role === 'ADMINISTRATOR';

  if (role !== 'ADMINISTRATOR' && role !== 'AUDITOR') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '6rem 2rem', textAlign: 'center', gap: '1rem' }}>
        <ShieldOff size={40} style={{ color: 'var(--orange)' }} />
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--orange)', letterSpacing: '0.1em' }}>
          ACCESO_DENEGADO: PRIVILEGIOS_INSUFICIENTES
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-3)' }}>
          Esta sección requiere rol ADMINISTRATOR o AUDITOR
        </div>
      </div>
    );
  }

  const load = useCallback(async () => {
    setLoading(true);
    try { setUsers(await api.getUsers()); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  const handleAuthorize = async (id) => {
    if (!window.confirm('¿Aprobar el acceso para este usuario?')) return;
    try {
      await api.updateUser(id, { is_authorized: true });
      load();
    } catch (e) { alert(e.message); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿ELIMINAR este usuario y todos sus datos? Esta acción no se puede deshacer.')) return;
    try {
      await api.deleteUser(id);
      load();
    } catch (e) { alert(e.message); }
  };

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    let r = [...users];
    if (search) { const q = search.toLowerCase(); r = r.filter(u => u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)); }
    if (roleF !== 'ALL') r = r.filter(u => u.role === roleF);
    if (statusF !== 'ALL') r = r.filter(u => u.status === statusF);
    r.sort((a, b) => sortD === 'asc' ? String(a[sortF] ?? '').localeCompare(String(b[sortF] ?? '')) : String(b[sortF] ?? '').localeCompare(String(a[sortF] ?? '')));
    setFiltered(r);
  }, [users, search, roleF, statusF, sortF, sortD]);

  const toggleSort = f => { if (sortF === f) setSortD(d => d === 'asc' ? 'desc' : 'asc'); else { setSortF(f); setSortD('asc'); } };
  const SortIco = ({ f }) => sortF === f ? (sortD === 'asc' ? <ChevronUp size={10} /> : <ChevronDown size={10} />) : null;

  const roles = ['ALL', ...new Set(users.map(u => u.role).filter(Boolean))];
  const total = users.length;
  const active = users.filter(u => u.status === 'Activo').length;
  const pending = users.filter(u => u.status === 'Pendiente').length;

  return (
    <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* ── HEADER ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-3)', letterSpacing: '0.1em', marginBottom: '4px' }}>
            MÓDULO: ADMIN_USUARIOS
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-1)' }}>
            {filtered.length} <span style={{ color: 'var(--text-3)' }}>/ {total} USUARIOS</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-sm" onClick={load} style={{ gap: '0.4rem' }}>
            <RefreshCw size={11} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />SYNC
          </button>
          {isAdmin && <button className="btn btn-sm btn-lime"><UserPlus size={11} /> NUEVO</button>}
        </div>
      </div>

      {/* ── MINI STATS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: 'var(--border)' }}>
        {[
          { label: 'TOTAL_USUARIOS', val: total,   cls: 'normal' },
          { label: 'USUARIOS_ACTIVOS', val: active,  cls: '' },
          { label: 'PENDIENTES_APROB', val: pending, cls: 'warning' },
        ].map(s => (
          <div key={s.label} className="stat-block" style={{ borderTopWidth: '2px', borderTopColor: 'var(--border-2)' }}>
            <div className="stat-label">{s.label}</div>
            <div className={`stat-value ${s.cls}`} style={{ fontSize: '1.5rem' }}>{loading ? '—' : s.val}</div>
          </div>
        ))}
      </div>

      {/* ── FILTERS ── */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', padding: '0.875rem', background: 'var(--black-3)', border: '1px solid var(--border)' }}>
        <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
          <Search size={13} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
          <input
            type="text" placeholder="BUSCAR: nombre / email..."
            className="input-field"
            style={{ paddingLeft: '2.25rem', height: '36px', fontSize: '0.78rem' }}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && <button onClick={() => setSearch('')} className="btn btn-icon" style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', border: 'none' }}><X size={11} /></button>}
        </div>
        <div style={{ display: 'flex', gap: '0', border: '1px solid var(--border)' }}>
          {['ALL', 'Activo', 'Pendiente'].map(s => (
            <button key={s} onClick={() => setStatusF(s)} className="btn btn-sm" style={{ border: 'none', borderRight: '1px solid var(--border)', background: statusF === s ? 'var(--lime)' : 'transparent', color: statusF === s ? 'var(--black)' : 'var(--text-3)', fontWeight: statusF === s ? 700 : 400 }}>
              {s === 'ALL' ? 'TODO' : s.toUpperCase()}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '0', border: '1px solid var(--border)' }}>
          {roles.map(r => (
            <button key={r} onClick={() => setRoleF(r)} className="btn btn-sm" style={{ border: 'none', borderRight: '1px solid var(--border)', background: roleF === r ? 'var(--black-5)' : 'transparent', color: roleF === r ? 'var(--lime)' : 'var(--text-3)', fontWeight: roleF === r ? 700 : 400 }}>
              {r === 'ALL' ? 'ALL' : (ROLE_TAG[r]?.short || r)}
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
                <th onClick={() => toggleSort('id')} style={{ cursor: 'pointer' }}>ID <SortIco f="id" /></th>
                <th onClick={() => toggleSort('name')} style={{ cursor: 'pointer' }}>OPERADOR <SortIco f="name" /></th>
                <th>ROL</th>
                <th>ESTADO</th>
                {isAdmin && <th>OPS</th>}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 7 }).map((_, i) => (
                    <tr key={i}>
                      {[40, 180, 70, 70, isAdmin && 80].filter(Boolean).map((w, j) => (
                        <td key={j}><div className="skeleton" style={{ height: '13px', width: `${w}px` }} /></td>
                      ))}
                    </tr>
                  ))
                : filtered.length === 0
                  ? (
                    <tr>
                      <td colSpan={isAdmin ? 5 : 4} style={{ textAlign: 'center', padding: '3rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-3)' }}>
                        &gt; NO_RECORDS_FOUND
                      </td>
                    </tr>
                  )
                  : filtered.map(u => {
                    const rt = ROLE_TAG[u.role] || { cls: 'tag-cyan', short: '???' };
                    const isActive = u.status === 'Activo';
                    return (
                      <tr key={u.id}>
                        <td className="mono" style={{ color: 'var(--text-3)', fontSize: '0.72rem' }}>#{String(u.id).padStart(4, '0')}</td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{u.name}</span>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-3)' }}>{u.email}</span>
                          </div>
                        </td>
                        <td><span className={`tag ${rt.cls}`}>{rt.short}</span></td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div className={`status-dot${isActive ? ' pulse' : ''} ${isActive ? '' : 'warning'}`} />
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: isActive ? 'var(--green)' : 'var(--gold)', fontWeight: 700 }}>
                              {isActive ? 'ACTIVO' : 'PENDIENTE'}
                            </span>
                          </div>
                        </td>
                        {isAdmin && (
                          <td>
                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                              {!isActive && (
                                <button className="btn btn-sm btn-lime" onClick={() => handleAuthorize(u.id)} title="Aprobar">
                                  <CheckCircle size={11} />
                                </button>
                              )}
                              <button className="btn btn-sm" onClick={() => handleDelete(u.id)} style={{ color: '#F87171' }} title="Eliminar">
                                <Trash2 size={11} />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })
              }
            </tbody>
          </table>
        </div>
        {!loading && filtered.length > 0 && (
          <div style={{ padding: '0.5rem 1rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-3)' }}>
              {filtered.length} RECORDS · SORTED BY {sortF.toUpperCase()}
            </span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <span className="tag tag-lime">{active} ACTIVOS</span>
              <span className="tag tag-gold">{pending} PENDIENTES</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersPage;
