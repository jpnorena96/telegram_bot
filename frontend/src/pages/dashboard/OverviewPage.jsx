import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { RefreshCw, TrendingUp, Users, CalendarCheck, Clock } from 'lucide-react';
import { api } from '../../services/api';

/* ── STAT BLOCK ── */
const Stat = ({ label, value, accent = false, colorClass = '', delta, loading }) => (
  <div className="stat-block">
    <div className="stat-label">{label}</div>
    {loading
      ? <div className="skeleton" style={{ height: '40px', width: '80px', marginTop: '4px' }} />
      : <div className={`stat-value ${colorClass}`}>{value}</div>
    }
    {delta && !loading && (
      <div className={`stat-delta ${delta.startsWith('+') ? 'up' : 'down'}`}>{delta}</div>
    )}
  </div>
);

/* ── LOG LINE ── */
const LogLine = ({ index, type, msg, time }) => {
  const colors = { ok: 'var(--lime)', err: 'var(--orange)', warn: 'var(--gold)', info: 'var(--cyan)' };
  const codes   = { ok: 'OK  ', err: 'ERR ', warn: 'WARN', info: 'INFO' };
  return (
    <div style={{
      display: 'flex', gap: '1rem', alignItems: 'flex-start',
      padding: '0.5rem 0',
      borderBottom: '1px solid var(--border)',
      fontFamily: 'var(--font-mono)',
      fontSize: '0.75rem',
    }}>
      <span style={{ color: 'var(--text-3)', minWidth: '24px' }}>
        {String(index).padStart(3, '0')}
      </span>
      <span style={{ color: colors[type] || 'var(--text-2)', minWidth: '36px', fontWeight: 700 }}>
        [{codes[type] || 'LOG '}]
      </span>
      <span style={{ color: 'var(--text-1)', flex: 1 }}>{msg}</span>
      <span style={{ color: 'var(--text-3)', whiteSpace: 'nowrap' }}>{time}</span>
    </div>
  );
};

/* ── TIMELINE ── */
const Steps = ['SOLICITUD', 'VERIFICACIÓN', 'BUSCANDO', 'CONFIRMADA'];
const Timeline = ({ current }) => (
  <div style={{ display: 'flex', gap: 0 }}>
    {Steps.map((s, i) => {
      const done   = i < current;
      const active = i === current;
      return (
        <div key={s} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* connector */}
          <div style={{ width: '100%', height: '2px', background: done ? 'var(--lime)' : 'var(--border-2)', position: 'relative' }}>
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '10px', height: '10px',
              background: done ? 'var(--lime)' : active ? 'var(--black)' : 'var(--black-4)',
              border: `2px solid ${done ? 'var(--lime)' : active ? 'var(--lime)' : 'var(--border-2)'}`,
              zIndex: 1,
            }} />
          </div>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.58rem',
            letterSpacing: '0.08em',
            color: done ? 'var(--lime)' : active ? 'var(--text-1)' : 'var(--text-3)',
            marginTop: '0.5rem',
            fontWeight: active || done ? 700 : 400,
            textAlign: 'center',
          }}>
            {s}
          </div>
        </div>
      );
    })}
  </div>
);

/* ── MAIN ── */
const OverviewPage = () => {
  const { role, userName } = useOutletContext();
  const [apts, setApts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = role === 'ADMINISTRATOR' || role === 'AUDITOR';
  const isMgr   = role === 'VISA_MANAGER'  || role === 'TRAVEL_AGENCY';

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const [a, u] = await Promise.all([
        api.getAppointments(),
        isAdmin ? api.getUsers() : Promise.resolve([]),
      ]);
      setApts(a); setUsers(u);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [isAdmin]);

  useEffect(() => { fetch(); }, [fetch]);

  const total     = apts.length;
  const adelant   = apts.filter(a => a.status === 'Adelantada').length;
  const buscando  = apts.filter(a => a.status === 'Buscando').length;
  const totalU    = users.length;
  const activeU   = users.filter(u => u.status === 'Activo').length;

  const myApt     = apts[0];
  const step      = myApt?.status === 'Adelantada' ? 3 : 2;

  const logs = [
    { type: 'ok',   msg: 'Conexión con API establecida',               time: '17:00' },
    { type: 'ok',   msg: `Sesión iniciada — ${userName}`,              time: '17:01' },
    { type: 'info', msg: `${total} citas cargadas desde DB`,           time: '17:01' },
    { type: isAdmin ? 'info' : 'ok', msg: isAdmin ? `${totalU} usuarios en sistema` : 'Bot de búsqueda activo 24/7', time: '17:01' },
    { type: buscando > 0 ? 'warn' : 'ok', msg: `${buscando} citas en estado BUSCANDO`, time: '17:02' },
  ];

  return (
    <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* ── TOP ROW: section label + refresh ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-3)', letterSpacing: '0.12em' }}>
          MÓDULO: DASHBOARD &nbsp;·&nbsp; ROL: {role}
        </div>
        <button className="btn btn-sm btn-outline" onClick={fetch} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <RefreshCw size={11} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          REFRESH
        </button>
      </div>

      {/* ── STATS GRID ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1px', background: 'var(--border)' }}>
        {isAdmin ? (
          <>
            <Stat label="USUARIOS_TOTAL"   value={loading ? '—' : totalU}    colorClass="normal"  delta={`+12% MES`} loading={loading} />
            <Stat label="CITAS_SISTEMA"    value={loading ? '—' : total}     colorClass=""        loading={loading} />
            <Stat label="CITAS_ADELANT"    value={loading ? '—' : adelant}   colorClass=""        delta={`+${adelant} SEMANA`} loading={loading} />
            <Stat label="EN_BÚSQUEDA"      value={loading ? '—' : buscando}  colorClass="warning" loading={loading} />
            <Stat label="USUARIOS_ACTIVOS" value={loading ? '—' : activeU}   colorClass="normal"  loading={loading} />
          </>
        ) : isMgr ? (
          <>
            <Stat label="CLIENTES"         value={loading ? '—' : total}     colorClass=""        loading={loading} />
            <Stat label="CITAS_ADELANT"    value={loading ? '—' : adelant}   colorClass=""        loading={loading} />
            <Stat label="EN_BÚSQUEDA"      value={loading ? '—' : buscando}  colorClass="warning" loading={loading} />
          </>
        ) : (
          <>
            <Stat label="CITAS_ASIGNADAS"  value={loading ? '—' : total}     colorClass=""        loading={loading} />
            <Stat label="ESTADO_ACTUAL"    value={loading ? '—' : (myApt?.status || 'N/A')} colorClass={myApt?.status === 'Adelantada' ? '' : 'warning'} loading={loading} />
            <Stat label="BOT_UPTIME"       value="∞"                          colorClass="normal"  delta="ONLINE 24/7" loading={false} />
          </>
        )}
      </div>

      {/* ── MAIN CONTENT ROW ── */}
      <div style={{ display: 'grid', gridTemplateColumns: isAdmin ? '1fr 1fr' : '1fr', gap: '1.25rem' }}>

        {/* System log */}
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">SYSTEM_LOG</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-3)' }}>
              {new Date().toLocaleDateString('es-CO')}
            </span>
          </div>
          <div className="panel-body" style={{ padding: '0 1.25rem' }}>
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border)', display: 'flex', gap: '1rem' }}>
                    <div className="skeleton" style={{ width: '30px', height: '12px' }} />
                    <div className="skeleton" style={{ flex: 1, height: '12px' }} />
                  </div>
                ))
              : logs.map((l, i) => <LogLine key={i} index={i + 1} {...l} />)
            }
          </div>
        </div>

        {/* Admin: distribution / Client: status timeline */}
        {isAdmin ? (
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">DISTRIBUCIÓN_CITAS</span>
            </div>
            <div className="panel-body">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} style={{ marginBottom: '1rem' }}>
                    <div className="skeleton" style={{ height: '11px', width: '60%', marginBottom: '6px' }} />
                    <div className="skeleton" style={{ height: '4px' }} />
                  </div>
                ))
              ) : [
                { label: 'ADELANTADAS', val: adelant, max: total, color: 'var(--lime)' },
                { label: 'BUSCANDO',    val: buscando, max: total, color: 'var(--gold)' },
                { label: 'ACT/TOTAL',   val: activeU,  max: totalU, color: 'var(--cyan)' },
              ].map(r => (
                <div key={r.label} style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-2)', letterSpacing: '0.08em' }}>{r.label}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-1)', fontWeight: 700 }}>
                      {r.val}/{r.max}
                    </span>
                  </div>
                  <div className="progress">
                    <div className="progress-fill" style={{ width: `${r.max ? Math.round((r.val / r.max) * 100) : 0}%`, background: r.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">ESTADO_TRÁMITE</span>
              {myApt && <span className="tag tag-lime">{myApt.status || 'BUSCANDO'}</span>}
            </div>
            <div className="panel-body">
              <Timeline current={step} />
              {myApt && (
                <div style={{
                  marginTop: '1.5rem',
                  padding: '1rem',
                  background: 'var(--lime-subtle)',
                  border: '1px solid var(--lime-dim)',
                }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-3)', letterSpacing: '0.1em', marginBottom: '4px' }}>
                    FECHA_OBJETIVO
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--lime)' }}>
                    {myApt.originalDate || 'POR_ASIGNAR'}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-2)', marginTop: '6px' }}>
                    BOT ACTIVO · MONITOREO CONTINUO
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OverviewPage;
