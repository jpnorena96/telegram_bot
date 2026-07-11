import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { 
  RefreshCw, TrendingUp, Users, CalendarCheck, Clock, 
  FileText, CheckCircle2, AlertTriangle, ArrowRight, 
  ShieldAlert, Play, Activity, CheckCircle, XCircle, 
  UserCheck, Shield, ChevronRight, UserPlus, Info,
  Search, Lock, Globe
} from 'lucide-react';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

/* ── STAT CARD ── */
const StatCard = ({ label, value, icon: Icon, color = 'var(--lime)', delta, loading }) => (
  <div 
    style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      padding: '1.25rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.borderColor = color;
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = `0 8px 32px ${color}15`;
    }}
    onMouseLeave={e => {
      e.currentTarget.style.borderColor = 'var(--border)';
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)';
    }}
  >
    <div style={{
      position: 'absolute',
      right: '-20px',
      bottom: '-20px',
      width: '100px',
      height: '100px',
      borderRadius: '50%',
      background: color,
      opacity: 0.03,
      filter: 'blur(30px)',
      pointerEvents: 'none'
    }} />

    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', zIndex: 1 }}>
      <span style={{ fontSize: '0.62rem', fontFamily: 'var(--font-mono)', color: 'var(--text-3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
        {label}
      </span>
      {loading ? (
        <div className="skeleton" style={{ height: '32px', width: '80px', marginTop: '4px' }} />
      ) : (
        <span style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-1)', fontFamily: 'var(--font-mono)', lineHeight: 1.1 }}>
          {value}
        </span>
      )}
      {delta && !loading && (
        <span style={{ fontSize: '0.68rem', color: delta.includes('+') || delta.includes('ONLINE') ? 'var(--lime)' : 'var(--orange)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
          <TrendingUp size={10} /> {delta}
        </span>
      )}
    </div>
    
    {Icon && (
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        background: `${color}08`,
        border: `1px solid ${color}20`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: color,
        zIndex: 1
      }}>
        <Icon size={18} />
      </div>
    )}
  </div>
);

/* ── LIVE NOTIFICATION LOG LINE ── */
const LogLine = ({ index, type, msg, time }) => {
  const colors = { 
    success: 'var(--lime)', 
    error: 'var(--orange)', 
    warning: 'var(--gold)', 
    info: 'var(--cyan)',
    ok: 'var(--lime)',
    err: 'var(--orange)',
    warn: 'var(--gold)'
  };
  const codes = { 
    success: 'OK  ', 
    error: 'ERR ', 
    warning: 'WARN', 
    info: 'INFO',
    ok: 'OK  ',
    err: 'ERR ',
    warn: 'WARN'
  };
  
  return (
    <div 
      style={{
        display: 'flex', 
        gap: '1rem', 
        alignItems: 'flex-start',
        padding: '0.625rem 0',
        borderBottom: '1px solid var(--border)',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.75rem',
      }}
    >
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

/* ── INTERACTIVE TIMELINE ── */
const Steps = ['CARGA DOCS', 'VERIFICACIÓN', 'EXP. APROBADO', 'CARGADO EN PORTAL'];
const Timeline = ({ current }) => (
  <div style={{ display: 'flex', width: '100%', padding: '1rem 0' }}>
    {Steps.map((s, i) => {
      const done = i < current;
      const active = i === current;
      return (
        <div key={s} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
          {/* Connector Line */}
          <div 
            style={{ 
              width: '100%', 
              height: '2px', 
              background: done ? 'var(--lime)' : 'var(--border-2)', 
              position: 'absolute',
              top: '12px',
              left: '-50%',
              zIndex: 0,
              display: i === 0 ? 'none' : 'block'
            }} 
          />
          {/* Circle indicator */}
          <div 
            style={{
              width: '24px', 
              height: '24px',
              borderRadius: '50%',
              background: done ? 'var(--lime)' : active ? 'var(--black)' : 'var(--surface-3)',
              border: `2px solid ${done ? 'var(--lime)' : active ? 'var(--lime)' : 'var(--border-2)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.65rem',
              fontWeight: 700,
              color: done ? 'var(--black)' : active ? 'var(--lime)' : 'var(--text-3)',
              boxShadow: active ? '0 0 12px var(--lime-glow)' : 'none',
              zIndex: 1,
              transition: 'all 0.3s ease'
            }}
          >
            {done ? '✓' : i + 1}
          </div>
          <div 
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.62rem',
              letterSpacing: '0.05em',
              color: done ? 'var(--lime)' : active ? 'var(--text-1)' : 'var(--text-3)',
              marginTop: '0.625rem',
              fontWeight: active || done ? 700 : 400,
              textAlign: 'center',
              zIndex: 1
            }}
          >
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
  const navigate = useNavigate();
  
  // Data States
  const [apts, setApts] = useState([]);
  const [users, setUsers] = useState([]);
  const [summary, setSummary] = useState(null);
  const [processes, setProcesses] = useState([]);
  const [clientProcessDetails, setClientProcessDetails] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = role === 'ADMINISTRATOR' || role === 'AUDITOR';
  const isAgency = role === 'TRAVEL_AGENCY';
  const isClient = role === 'NATURAL_PERSON';

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const promises = [
        api.getAppointments(),
        api.getVisaProcesses(),
        api.getNotifications()
      ];
      
      if (isAdmin) {
        promises.push(api.getUsers());
        promises.push(api.getAdminSummary());
      }
      
      const results = await Promise.all(promises);
      const appointmentsData = results[0];
      const processesData = 		results[1];
      const notificationsData = results[2];
      
      setApts(appointmentsData);
      setProcesses(processesData);
      setNotifications(notificationsData);
      
      if (isAdmin) {
        setUsers(results[3] || []);
        setSummary(results[4] || null);
      }
      
      // For Client, pull process details if there is a process
      if (isClient && processesData && processesData.length > 0) {
        const details = await api.getVisaProcessDetails(processesData[0].id);
        setClientProcessDetails(details);
      }
    } catch (e) {
      console.error('Error fetching dashboard data:', e);
      toast.error('Error al sincronizar datos del panel');
    } finally {
      setLoading(false);
    }
  }, [role, isAdmin, isClient]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Calculations for Admin / Agency / Client
  const totalApts = summary ? summary.total_appointments : apts.length;
  const completedApts = summary ? summary.completed_appointments : apts.filter(a => a.status === 'Adelantada' || a.status === 'agendado').length;
  const searchingApts = summary ? summary.searching_appointments : apts.filter(a => a.status === 'Buscando' || a.status === 'pending').length;
  const totalUsers = summary ? summary.total_users : users.length;
  const activeUsers = summary ? summary.active_users : users.filter(u => u.is_authorized || u.status === 'Activo').length;
  
  // Visa process checks
  const pendingReviews = processes.filter(p => p.status === 'Listo para Revisar');
  const inProgressProcesses = processes.filter(p => p.status === 'En Progreso');
  const approvedProcesses = processes.filter(p => p.status === 'Aprobado' || p.status === 'Cargado');

  // Client calculations
  const clientProcess = processes[0];
  let clientStep = 0;
  if (clientProcess) {
    if (clientProcess.status === 'En Progreso') clientStep = 0;
    else if (clientProcess.status === 'Listo para Revisar') clientStep = 1;
    else if (clientProcess.status === 'Aprobado') clientStep = 2;
    else if (clientProcess.status === 'Cargado') clientStep = 3;
  }

  // Calculate Client Doc Completion %
  let totalMandatoryDocs = 0;
  let approvedMandatoryDocs = 0;
  let uploadedMandatoryDocs = 0;
  const rejectedDocs = [];
  
  if (clientProcessDetails) {
    clientProcessDetails.applicants.forEach(app => {
      ['passport', 'photo', 'ds160'].forEach(type => {
        totalMandatoryDocs++;
        const doc = app.documents.find(d => d.document_type === type);
        if (doc) {
          if (doc.status === 'approved') {
            approvedMandatoryDocs++;
          } else if (doc.status === 'uploaded') {
            uploadedMandatoryDocs++;
          } else if (doc.status === 'rejected') {
            const labels = { passport: 'Pasaporte', photo: 'Foto', ds160: 'DS-160' };
            rejectedDocs.push({
              applicantName: app.full_name,
              docLabel: labels[type] || type,
              notes: doc.notes || 'Sin comentarios'
            });
          }
        }
      });
    });
  }

  const docProgressPercent = totalMandatoryDocs > 0 
    ? Math.round(((approvedMandatoryDocs) / totalMandatoryDocs) * 100) 
    : 0;

  // Formatting recent logs from DB or falling back to defaults
  const getFormattedLogs = () => {
    if (notifications.length > 0) {
      return notifications.slice(0, 5).map((notif, idx) => {
        let logTime = 'Reciente';
        if (notif.created_at) {
          try {
            logTime = notif.created_at.substring(11, 16);
          } catch(e) {}
        }
        return {
          type: notif.status || 'info',
          msg: notif.message,
          time: logTime
        };
      });
    }
    
    // Fallback Mock System Logs
    return [
      { type: 'ok', msg: 'Conexión segura establecida con la VPS.', time: '12:00' },
      { type: 'ok', msg: `Sesión activa del operador: ${userName}.`, time: '12:01' },
      { type: 'info', msg: `${totalApts} agendamientos cargados desde la base de datos.`, time: '12:01' },
      { type: isAdmin ? 'info' : 'ok', msg: isAdmin ? `${totalUsers} usuarios del sistema monitorizados.` : 'Servicios de bot en espera.', time: '12:01' },
      { type: 'info', msg: `${processes.length} expedientes de visa B1/B2 listados.`, time: '12:02' }
    ];
  };

  const logs = getFormattedLogs();

  return (
    <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* ── SECCIÓN SUPERIOR / TÍTULO ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-3)', letterSpacing: '0.15em', marginBottom: '4px' }}>
            MÓDULO: RESUMEN_GLOBAL &nbsp;·&nbsp; ROL: {role.toUpperCase()}
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Resumen del Sistema</h2>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-sm btn-outline" onClick={fetchDashboardData}>
            <RefreshCw size={11} style={{ animation: loading ? 'spin 1.5s linear infinite' : 'none' }} /> ACTUALIZAR
          </button>
        </div>
      </div>

      {/* ── GRILLA DE ESTADÍSTICAS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        {isAdmin && (
          <>
            <StatCard label="Usuarios Totales" value={loading ? '—' : totalUsers} icon={Users} color="var(--cyan)" delta={`Activos: ${activeUsers}`} loading={loading} />
            <StatCard label="Citas Monitoreadas" value={loading ? '—' : totalApts} icon={CalendarCheck} color="var(--lime)" loading={loading} />
            <StatCard label="Búsquedas Activas" value={loading ? '—' : searchingApts} icon={Activity} color="var(--gold)" delta="PM2 ONLINE" loading={loading} />
            <StatCard label="Expedientes Visa" value={loading ? '—' : processes.length} icon={FileText} color="var(--green)" delta={`Pendientes: ${pendingReviews.length}`} loading={loading} />
          </>
        )}

        {isAgency && (
          <>
            <StatCard label="Clientes Administrados" value={loading ? '—' : processes.length} icon={Users} color="var(--cyan)" loading={loading} />
            <StatCard label="Citas de Clientes" value={loading ? '—' : totalApts} icon={CalendarCheck} color="var(--lime)" delta={`Buscando: ${searchingApts}`} loading={loading} />
            <StatCard label="Pendientes de Revisar" value={loading ? '—' : pendingReviews.length} icon={ShieldAlert} color="var(--gold)" loading={loading} />
            <StatCard label="Expedientes Aprobados" value={loading ? '—' : approvedProcesses.length} icon={CheckCircle2} color="var(--green)" delta={`De ${processes.length} total`} loading={loading} />
          </>
        )}

        {isClient && (
          <>
            <StatCard label="Citas Activas" value={loading ? '—' : totalApts} icon={CalendarCheck} color="var(--lime)" delta={searchingApts > 0 ? "Buscando en VPS" : "En espera"} loading={loading} />
            <StatCard label="Expediente Visa B1/B2" value={loading ? '—' : (clientProcess ? clientProcess.status.toUpperCase() : 'NO INICIADO')} icon={FileText} color="var(--cyan)" delta={clientProcess ? `Miembros: ${clientProcess.applicants_count}` : "Sin expediente"} loading={loading} />
            <StatCard label="Documentación Aprobada" value={loading ? '—' : `${approvedMandatoryDocs}/${totalMandatoryDocs}`} icon={CheckCircle2} color="var(--green)" delta={`${docProgressPercent}% Completado`} loading={loading} />
          </>
        )}
      </div>

      {/* ── DISEÑO DE DASHBOARDS PERSONALIZADOS SEGÚN ROL ── */}
      <div style={{ display: 'grid', gridTemplateColumns: isAdmin || isAgency ? '1fr 1fr' : '1fr', gap: '1.25rem' }}>
        
        {/* ── PANEL IZQUIERDO: ACCIONES ADMINISTRADOR / AGENCIA ── */}
        {(isAdmin || isAgency) && (
          <div className="panel" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <ShieldAlert size={14} color="var(--gold)" /> Expedientes por Verificar
              </span>
              <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--text-3)' }}>
                {pendingReviews.length} POR REVISAR
              </span>
            </div>
            <div className="panel-body" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="skeleton" style={{ height: '54px', borderRadius: 'var(--radius-sm)' }} />
                  ))
                ) : pendingReviews.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle size={28} color="var(--green)" />
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-1)' }}>¡Expedientes al Día!</div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-3)', maxWidth: '280px', margin: '0 auto' }}>
                      No hay carpetas de documentos de clientes en espera de validación en este momento.
                    </p>
                  </div>
                ) : (
                  pendingReviews.slice(0, 4).map(p => (
                    <div 
                      key={p.id}
                      style={{
                        padding: '0.75rem 1rem',
                        background: 'rgba(255,255,255,0.01)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-1)' }}>{p.primary_applicant_name}</span>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
                          {p.client_email} · {p.type === 'familiar' ? `Familia (${p.applicants_count})` : 'Individual'}
                        </span>
                      </div>
                      
                      <button 
                        className="btn btn-xs btn-lime"
                        onClick={() => navigate('/dashboard/documentos')}
                        style={{ padding: '4px 10px', fontSize: '0.7rem', gap: '0.2rem' }}
                      >
                        REVISAR <ChevronRight size={12} />
                      </button>
                    </div>
                  ))
                )}
              </div>
              
              <button 
                className="btn btn-sm btn-outline" 
                onClick={() => navigate('/dashboard/documentos')}
                style={{ width: '100%', marginTop: 'auto', gap: '0.4rem' }}
              >
                IR A CARPETA DE EXPEDIENTES <ArrowRight size={12} />
              </button>
            </div>
          </div>
        )}

        {/* ── PANEL DERECHO: MONITOREO DE CITAS (ADMIN / AGENCIA) ── */}
        {(isAdmin || isAgency) && (
          <div className="panel" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Activity size={14} color="var(--lime)" /> Estado de Citas (Monitoreo)
              </span>
              <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--text-3)' }}>
                {searchingApts} ACTIVAS
              </span>
            </div>
            <div className="panel-body" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="skeleton" style={{ height: '54px', borderRadius: 'var(--radius-sm)' }} />
                  ))
                ) : apts.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <CalendarCheck size={28} color="var(--text-3)" />
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-2)' }}>Sin Citas Registradas</div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-3)', maxWidth: '280px', margin: '0 auto' }}>
                      Aún no has registrado agendamientos en el bot para monitorear citas más cercanas.
                    </p>
                  </div>
                ) : (
                  apts.slice(0, 4).map(apt => (
                    <div 
                      key={apt.id}
                      style={{
                        padding: '0.75rem 1rem',
                        background: 'rgba(255,255,255,0.01)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-1)' }}>{apt.client}</span>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
                          ID Agenda: {apt.schedule_id || 'Por vincular'} · Cita: {apt.originalDate || 'Por asignar'}
                        </span>
                      </div>
                      
                      <span className={`tag ${apt.status === 'Adelantada' ? 'tag-lime' : 'tag-gold'}`}>
                        {apt.status === 'Adelantada' ? 'ADELANTADA' : 'BUSCANDO'}
                      </span>
                    </div>
                  ))
                )}
              </div>
              
              <button 
                className="btn btn-sm btn-outline" 
                onClick={() => navigate('/dashboard/citas')}
                style={{ width: '100%', marginTop: 'auto', gap: '0.4rem' }}
              >
                GESTIONAR AGENDAMIENTOS <ArrowRight size={12} />
              </button>
            </div>
          </div>
        )}

        {/* ── CLIENT VIEW (NATURAL_PERSON): DETALLE COMPLETO DEL EXPEDIENTE ── */}
        {isClient && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Si no tiene expediente iniciado */}
            {!clientProcess ? (
              <div className="panel" style={{ padding: '2rem', textAlign: 'center', background: 'var(--black-2)', border: '1px solid var(--border)', borderLeft: '4px solid var(--lime)' }}>
                <div style={{ display: 'inline-flex', padding: '0.75rem', borderRadius: '50%', background: 'var(--lime-subtle)', color: 'var(--lime)', marginBottom: '1rem' }}>
                  <FileText size={32} />
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-1)' }}>
                  ¡Bienvenido a GlobalVisas, {userName}!
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-2)', maxWidth: '520px', margin: '0 auto 1.5rem', lineHeight: '1.5' }}>
                  Aún no has iniciado tu expediente para la recopilación de documentos de tu Visa B1/B2. Inicia tu proceso individual o familiar ahora para preparar tu checklist paso a paso y agendar tu cita de la forma más sencilla.
                </p>
                <button 
                  className="btn btn-lime"
                  onClick={() => navigate('/dashboard/documentos')}
                  style={{ minWidth: '240px', gap: '0.5rem' }}
                >
                  <UserPlus size={14} /> INICIAR EXPEDIENTE DE VISA
                </button>
              </div>
            ) : (
              // Si tiene expediente
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
                
                {/* Panel de Control de Expediente y Timeline */}
                <div className="panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div>
                    <span style={{ fontSize: '0.62rem', fontFamily: 'var(--font-mono)', color: 'var(--text-3)', letterSpacing: '0.05em' }}>SEGUIMIENTO DEL EXPEDIENTE</span>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '0.25rem', color: 'var(--text-1)' }}>
                      Progreso de tu Trámite
                    </h3>
                  </div>

                  <Timeline current={clientStep} />

                  <div style={{ 
                    padding: '1rem', 
                    background: 'var(--lime-subtle)', 
                    border: '1px solid var(--lime-dim)', 
                    borderRadius: 'var(--radius-md)', 
                    marginTop: '0.5rem',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem'
                  }}>
                    <Info size={18} color="var(--lime)" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-1)' }}>
                        {clientProcess.status === 'En Progreso' && 'Fase: Carga de Documentación'}
                        {clientProcess.status === 'Listo para Revisar' && 'Fase: Validación en Curso'}
                        {clientProcess.status === 'Aprobado' && 'Fase: Expediente Aprobado'}
                        {clientProcess.status === 'Cargado' && 'Fase: Carga y Monitoreo Activo'}
                      </span>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-2)', lineHeight: '1.4' }}>
                        {clientProcess.status === 'En Progreso' && 'Sube tu Pasaporte, Foto y DS-160 obligatorios para habilitar el envío del expediente al gestor.'}
                        {clientProcess.status === 'Listo para Revisar' && 'El gestor de la agencia está auditando tus documentos cargados. Te notificaremos pronto.'}
                        {clientProcess.status === 'Aprobado' && 'Todos tus documentos son válidos. Procederemos a la programación de la cita de forma oficial.'}
                        {clientProcess.status === 'Cargado' && '¡Tus documentos se encuentran cargados en el sistema! El bot se encuentra monitorizando adelantos de cita.'}
                      </p>
                    </div>
                  </div>

                  {/* Alertas de Rechazo */}
                  {rejectedDocs.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
                      <span style={{ fontSize: '0.62rem', fontFamily: 'var(--font-mono)', color: '#EF4444', letterSpacing: '0.05em', fontWeight: 700 }}>DOCUMENTOS RECHAZADOS QUE REQUIEREN ACCIÓN</span>
                      {rejectedDocs.map((doc, idx) => (
                        <div key={idx} style={{ padding: '0.75rem 1rem', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 'var(--radius-md)', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                          <AlertTriangle size={15} color="#EF4444" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-1)' }}>{doc.docLabel} — {doc.applicantName}</span>
                            <span style={{ fontSize: '0.72rem', color: '#F87171' }}>"{doc.notes}"</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <button 
                    className="btn btn-lime"
                    onClick={() => navigate('/dashboard/documentos')}
                    style={{ width: '100%', marginTop: '0.5rem', gap: '0.4rem' }}
                  >
                    GESTIONAR MIS DOCUMENTOS <ArrowRight size={12} />
                  </button>
                </div>

                {/* Panel de Monitoreo de Citas del Cliente */}
                <div className="panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1.25rem' }}>
                  <div>
                    <span style={{ fontSize: '0.62rem', fontFamily: 'var(--font-mono)', color: 'var(--text-3)', letterSpacing: '0.05em' }}>BOT DE BÚSQUEDA AUTOMÁTICA</span>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '0.25rem', color: 'var(--text-1)' }}>
                      Estado del Agendamiento
                    </h3>
                  </div>

                  {apts.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '1.5rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', flex: 1, justifyContent: 'center' }}>
                      <CalendarCheck size={28} color="var(--text-3)" />
                      <div>
                        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-2)', display: 'block' }}>Sin Cita Configurada</span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-3)', display: 'block', marginTop: '0.25rem', maxWidth: '280px', lineHeight: '1.4' }}>
                          Para que nuestro bot busque fechas de citas más cercanas en el consulado, debes configurar tus credenciales de acceso al portal.
                        </span>
                      </div>
                      <button className="btn btn-sm btn-outline" onClick={() => navigate('/dashboard/citas')} style={{ gap: '0.3rem', width: '100%', maxWidth: '220px' }}>
                        CONFIGURAR AHORA <ChevronRight size={12} />
                      </button>
                    </div>
                  ) : (
                    // Si tiene citas
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem', justifyContent: 'center' }}>
                      <div style={{
                        padding: '1.25rem',
                        background: 'rgba(255,255,255,0.01)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-lg)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.875rem'
                      }}>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.625rem' }}>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>BOT SERVICE STATUS:</span>
                          {apts[0].status === 'Buscando' || apts[0].status === 'pending' ? (
                            <span style={{ fontSize: '0.72rem', color: 'var(--gold)', fontFamily: 'var(--font-mono)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                              <RefreshCw size={11} style={{ animation: 'spin 1.5s linear infinite' }} /> BUSCANDO CITAS
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.72rem', color: 'var(--lime)', fontFamily: 'var(--font-mono)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                              ✓ CITA ADELANTADA
                            </span>
                          )}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                            <span style={{ fontSize: '0.58rem', color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>CORREO PORTAL</span>
                            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-1)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{apts[0].client}</span>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                            <span style={{ fontSize: '0.58rem', color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>SCHEDULE ID</span>
                            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--lime)', fontFamily: 'var(--font-mono)' }}>{apts[0].schedule_id || 'No asignado'}</span>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                            <span style={{ fontSize: '0.58rem', color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>FECHA ACTUAL CITA</span>
                            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-2)' }}>{apts[0].originalDate || 'Por configurar'}</span>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                            <span style={{ fontSize: '0.58rem', color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>CIUDAD EMBAJADA</span>
                            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-2)' }}>{apts[0].consulate || 'Bogotá'}</span>
                          </div>
                        </div>

                      </div>
                      
                      <button 
                        className="btn btn-sm btn-outline" 
                        onClick={() => navigate('/dashboard/citas')}
                        style={{ width: '100%', gap: '0.4rem' }}
                      >
                        VER MI CONFIGURACIÓN DE CITA <ArrowRight size={12} />
                      </button>
                    </div>
                  )}

                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* ── NOTIFICACIONES / REGISTRO DEL SISTEMA (COMPARTIDO ABAJO EN ADMIN/AGENCIA O SIEMPRE EN LA PARTE INFERIOR) ── */}
      {(isAdmin || isAgency) && (
        <div className="panel">
          <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Clock size={14} color="var(--text-2)" /> Registro de Actividad y Alertas
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-3)' }}>
              HISTORIAL RECIENTE
            </span>
          </div>
          <div className="panel-body" style={{ padding: '0 1.25rem' }}>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={{ padding: '0.625rem 0', borderBottom: '1px solid var(--border)', display: 'flex', gap: '1rem' }}>
                  <div className="skeleton" style={{ width: '30px', height: '12px' }} />
                  <div className="skeleton" style={{ flex: 1, height: '12px' }} />
                </div>
              ))
            ) : logs.map((l, i) => (
              <LogLine key={i} index={i + 1} type={l.type} msg={l.msg} time={l.time} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default OverviewPage;
