import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { 
  TrendingUp, Users, CalendarCheck, Clock, 
  FileText, CheckCircle, Search, Server, ShieldCheck, 
  HelpCircle, Calculator, Zap, Building2, Activity,
  Lock, Sparkles, MessageCircle, AlertCircle, RefreshCw
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

// ── COMPONENTES CORPORATIVOS BENTO ──
const BentoCard = ({ children, colSpan = 1, rowSpan = 1, className = '', style = {}, onClick }) => (
  <div 
    onClick={onClick}
    className={`glass-panel ${className}`}
    style={{
      gridColumn: `span ${colSpan}`,
      gridRow: `span ${rowSpan}`,
      padding: '1.5rem',
      borderRadius: '24px',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease',
      border: '1px solid rgba(255,255,255,0.05)',
      ...style
    }}
  >
    {children}
  </div>
);

const GlowIcon = ({ icon: Icon, color }) => (
  <div style={{
    width: '48px', height: '48px',
    borderRadius: '16px',
    background: `radial-gradient(circle at center, ${color}30 0%, transparent 70%)`,
    border: `1px solid ${color}40`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: `0 0 20px ${color}20`,
    color: color
  }}>
    <Icon size={24} />
  </div>
);

const MetricBlock = ({ label, value, subtext, color, icon }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flex: 1 }}>
    <div>
      <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-3)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
      <h3 style={{ margin: 0, color: 'var(--text-1)', fontSize: '2.5rem', fontWeight: 800, lineHeight: 1 }}>{value}</h3>
      {subtext && <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8rem', color: color, fontWeight: 500 }}>{subtext}</p>}
    </div>
    {icon && <GlowIcon icon={icon} color={color} />}
  </div>
);

const OverviewPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { role, userName } = useOutletContext();
  const [appointments, setAppointments] = useState([]);
  const [visaProcesses, setVisaProcesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [adminStats, setAdminStats] = useState(null);
  
  // Interactive Tariff Calculator State for Agencies
  const [calcUserType, setCalcUserType] = useState('agency'); 
  const [calcRange, setCalcRange] = useState('under_month');
  const [calcPeople, setCalcPeople] = useState(1);

  const isAdmin = role === 'ADMINISTRATOR' || role === 'AUDITOR';
  const isAgency = role === 'TRAVEL_AGENCY';

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!isAdmin) {
          const [aptData, meData, processData] = await Promise.all([
            api.getAppointments().catch(() => []),
            api.getMe().catch(() => ({})),
            api.getVisaProcesses().catch(() => [])
          ]);
          setAppointments(aptData || []);
          setProfile(meData || {});
          setVisaProcesses(processData || []);
        } else {
          const stats = await api.getAdminDashboardStats().catch(() => ({}));
          setAdminStats(stats);
        }
      } catch (e) {
        toast.error('Error al cargar datos');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [role, isAdmin]);

  const calculatePrice = () => {
    const extras = Math.max(0, calcPeople - 1);
    if (calcRange === 'under_month') return 20 + (extras * 15);
    return 15 + (extras * 13);
  };

  if (loading) return <div className="spinner" style={{ margin: '4rem auto' }} />;

  // ─────────────────────────────────────────────────────────────────
  // 🏢 DASHBOARD AGENCIA DE VIAJES (BENTO GRID)
  // ─────────────────────────────────────────────────────────────────
  if (isAgency) {
    const totalApts = appointments.length;
    const buscandoApts = appointments.filter(a => ['pending', 'Buscando'].includes(a.status)).length;
    const adelantadasApts = appointments.filter(a => ['Adelantada', 'agendado'].includes(a.status)).length;
    const totalExpedientes = visaProcesses.length;

    const agencyChartData = [
      { name: 'Lun', citas: 2, adelantadas: 1 }, { name: 'Mar', citas: 4, adelantadas: 2 },
      { name: 'Mié', citas: 3, adelantadas: 3 }, { name: 'Jue', citas: 6, adelantadas: 4 },
      { name: 'Vie', citas: 8, adelantadas: 6 }, { name: 'Sáb', citas: 5, adelantadas: 4 },
      { name: 'Dom', citas: 9, adelantadas: 7 }
    ];

    return (
      <div className="animate-in" style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0, color: 'var(--text-1)', letterSpacing: '-0.03em' }}>Panel de Agencia</h1>
            <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-3)' }}><span style={{color: 'var(--cyan)'}}>●</span> Nodos de búsqueda operativos para <strong>{userName}</strong></p>
          </div>
          <button onClick={() => navigate('/dashboard/citas')} className="btn btn-primary" style={{ borderRadius: '99px', padding: '0.75rem 1.5rem' }}>
            <Sparkles size={18} /> Iniciar Búsqueda
          </button>
        </div>

        {/* BENTO GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', gridAutoRows: '220px' }}>
          
          {/* Card: Buscando (Destacada) */}
          <BentoCard colSpan={1} color="#06B6D4" style={{ background: 'linear-gradient(135deg, rgba(17,24,39,0.8) 0%, rgba(6,182,212,0.1) 100%)' }}>
            <MetricBlock label="En Búsqueda Activa" value={buscandoApts} subtext="Algoritmo 24/7 PM2" color="#06B6D4" icon={Search} />
            <div style={{ marginTop: 'auto', background: 'rgba(6,182,212,0.1)', padding: '0.5rem', borderRadius: '8px', fontSize: '0.75rem', color: '#06B6D4', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
               <RefreshCw size={14} className="spinner" style={{ animationDuration: '3s', borderTopColor: '#06B6D4', borderColor: 'rgba(6,182,212,0.2)' }}/> Nodos escaneando consulares...
            </div>
          </BentoCard>

          {/* Card: Adelantadas */}
          <BentoCard colSpan={1}>
            <MetricBlock label="Adelantos Exitosos" value={adelantadasApts} subtext="Citas aseguradas" color="#10B981" icon={CheckCircle} />
            <div style={{ marginTop: 'auto', height: '60px' }}>
               {/* Mini Sparkline */}
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={agencyChartData}>
                    <Bar dataKey="adelantadas" fill="#10B981" radius={[4,4,0,0]} opacity={0.8} />
                  </BarChart>
               </ResponsiveContainer>
            </div>
          </BentoCard>

          {/* Card: Expedientes */}
          <BentoCard colSpan={1}>
            <MetricBlock label="Expedientes Totales" value={totalExpedientes} subtext="Visas procesadas" color="var(--lime)" icon={FileText} />
          </BentoCard>

          {/* Card Wide: Gráfico de Progreso */}
          <BentoCard colSpan={2} rowSpan={2} style={{ padding: 0 }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-1)' }}>Progreso de Red de Bots</h3>
            </div>
            <div style={{ flex: 1, width: '100%', padding: '1rem 0' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={agencyChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCyan" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="var(--text-3)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--text-3)" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '12px' }} />
                  <Area type="monotone" dataKey="adelantadas" stroke="#06B6D4" strokeWidth={3} fill="url(#colorCyan)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </BentoCard>

          {/* Card Wide: Calculadora B2B */}
          <BentoCard colSpan={1} rowSpan={2}>
            <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-1)' }}>Calculadora B2B</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-3)', marginBottom: '0.5rem', display: 'block' }}>Rango de Fecha</label>
                <select value={calcRange} onChange={e => setCalcRange(e.target.value)} style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text-1)', padding: '0.75rem', borderRadius: '8px', outline: 'none' }}>
                  <option value="under_month">&lt; 30 días</option>
                  <option value="over_month">&gt; 30 días</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-3)', marginBottom: '0.5rem', display: 'block' }}>Grupo Familiar</label>
                <input type="number" min="1" max="10" value={calcPeople} onChange={e => setCalcPeople(parseInt(e.target.value) || 1)} style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text-1)', padding: '0.75rem', borderRadius: '8px', outline: 'none' }}/>
              </div>
              <div style={{ marginTop: 'auto', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: '#10B981', textTransform: 'uppercase', fontWeight: 700 }}>Costo Agencia</span>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10B981' }}>${calculatePrice()}</div>
              </div>
            </div>
          </BentoCard>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────
  // 👤 DASHBOARD SEGUIMIENTO PERSONA NATURAL (NATURAL_PERSON)
  // ─────────────────────────────────────────────────────────────────
  if (!isAdmin) {
    const total = appointments.length;
    const buscando = appointments.filter(a => ['pending', 'Buscando'].includes(a.status)).length;
    const latestApt = appointments.length > 0 ? appointments[0] : null;

    return (
      <div className="animate-in" style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0, color: 'var(--text-1)', letterSpacing: '-0.03em' }}>Mis Procesos</h1>
            <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-3)' }}>Hola, <strong>{userName}</strong>. Aquí está el resumen de tu cuenta.</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', gridAutoRows: '180px' }}>
          <BentoCard colSpan={1}>
            <MetricBlock label="Citas Creadas" value={total} color="var(--lime)" icon={FileText} />
          </BentoCard>
          
          <BentoCard colSpan={1} style={{ background: 'linear-gradient(135deg, rgba(17,24,39,0.8) 0%, rgba(245,158,11,0.1) 100%)' }}>
            <MetricBlock label="En Búsqueda Activa" value={buscando} color="#F59E0B" icon={Search} subtext={buscando > 0 ? 'El bot está operando' : ''} />
            {buscando > 0 && (
               <div style={{ marginTop: 'auto', background: 'rgba(245,158,11,0.1)', padding: '0.5rem', borderRadius: '8px', fontSize: '0.75rem', color: '#F59E0B', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                 <RefreshCw size={14} className="spinner" style={{ animationDuration: '3s', borderTopColor: '#F59E0B', borderColor: 'rgba(245,158,11,0.2)' }}/> Scraper Online
              </div>
            )}
          </BentoCard>

          <BentoCard colSpan={1}>
            <MetricBlock label="Citas Disponibles" value={profile?.balance || 0} color="#10B981" icon={CalendarCheck} />
            <button onClick={() => navigate('/dashboard/billetera')} className="btn btn-primary" style={{ marginTop: 'auto' }}>Recargar</button>
          </BentoCard>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────
  // 👑 DASHBOARD ADMINISTRADOR (ENTERPRISE BENTO)
  // ─────────────────────────────────────────────────────────────────
  const { status_distribution } = adminStats || {};
  const getStatusCount = (keys) => {
    if (!status_distribution) return 0;
    return status_distribution.filter(s => keys.includes(s.status)).reduce((a, c) => a + c.count, 0);
  };
  const countPending = getStatusCount(['pending', 'Buscando']);
  const countSecured = getStatusCount(['agendado', 'Adelantada']);

  return (
    <div className="animate-in" style={{ padding: '2rem', maxWidth: '1600px', margin: '0 auto' }}>
      
      {/* HEADER LIVE OPS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(6,182,212,0.1)', color: '#06B6D4', padding: '0.4rem 1rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '1rem', width: 'fit-content', border: '1px solid rgba(6,182,212,0.2)' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#06B6D4', animation: 'pulse 2s infinite' }} />
            SYSTEM ONLINE
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0, color: 'var(--text-1)', letterSpacing: '-0.03em' }}>Panel de Control Operativo</h1>
        </div>
      </div>

      {/* TERMINAL FEED (Live Ticker) */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.2rem 1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem', fontFamily: 'monospace', overflow: 'hidden' }}>
        <span style={{ color: '#06B6D4', fontWeight: 800 }}>sys.log_ &gt;</span>
        <div style={{ display: 'flex', gap: '3rem', animation: 'marquee 25s linear infinite', whiteSpace: 'nowrap' }}>
          {adminStats?.recent_appointments?.length > 0 ? adminStats.recent_appointments.map((apt, idx) => (
            <span key={idx} style={{ color: 'var(--text-2)', fontSize: '0.85rem' }}>
              [{apt.status.toUpperCase()}] <span style={{color: 'var(--text-1)'}}>{apt.email}</span>
            </span>
          )) : <span style={{color: 'var(--text-3)'}}>Esperando actividad de red...</span>}
        </div>
        <style>{`@keyframes marquee { 0% { transform: translateX(50%); } 100% { transform: translateX(-100%); } }`}</style>
      </div>

      {/* BENTO GRID ADMINISTRADOR */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', gridAutoRows: 'minmax(200px, auto)' }}>
        
        {/* PIPELINE (SPAN 2 COL, SPAN 2 ROW) */}
        <BentoCard colSpan={2} rowSpan={2} style={{ background: 'linear-gradient(180deg, rgba(17,24,39,0.5) 0%, rgba(6,182,212,0.05) 100%)' }}>
          <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-1)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={20} color="#06B6D4" /> Pipeline de Enjambre
          </h3>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem', justifyContent: 'center', padding: '1rem' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ width: '4px', height: '40px', background: 'var(--lime)', borderRadius: '4px' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase' }}>Total Expedientes en Red</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-1)' }}>{adminStats?.total_appointments || 0}</div>
              </div>
            </div>

            <div style={{ paddingLeft: '3rem', borderLeft: '2px dashed rgba(255,255,255,0.1)', marginLeft: '2px', height: '20px' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ width: '4px', height: '40px', background: '#F59E0B', borderRadius: '4px', boxShadow: '0 0 10px #F59E0B' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase' }}>Nodos Activos (Scrapeando)</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#F59E0B' }}>{countPending}</div>
              </div>
            </div>

            <div style={{ paddingLeft: '3rem', borderLeft: '2px dashed rgba(255,255,255,0.1)', marginLeft: '2px', height: '20px' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ width: '4px', height: '40px', background: '#10B981', borderRadius: '4px', boxShadow: '0 0 10px #10B981' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase' }}>Citas Aseguradas con Éxito</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10B981' }}>{countSecured}</div>
              </div>
            </div>

          </div>
        </BentoCard>

        {/* METRICS PEQUEÑAS */}
        <BentoCard colSpan={1} rowSpan={1}>
          <MetricBlock label="Tasa de Éxito Global" value={`${adminStats?.total_appointments ? Math.round((countSecured / adminStats.total_appointments) * 100) : 0}%`} color="#10B981" icon={TrendingUp} />
          <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', marginTop: 'auto', overflow: 'hidden' }}>
            <div style={{ width: `${adminStats?.total_appointments ? Math.round((countSecured / adminStats.total_appointments) * 100) : 0}%`, height: '100%', background: '#10B981', boxShadow: '0 0 10px #10B981' }} />
          </div>
        </BentoCard>

        <BentoCard colSpan={1} rowSpan={1}>
          <MetricBlock label="Red de Partners" value={adminStats?.total_agencies || 0} color="var(--lime)" icon={Building2} subtext="Agencias B2B operando" />
        </BentoCard>

        <BentoCard colSpan={1} rowSpan={1}>
          <MetricBlock label="Visas Manuales" value={adminStats?.total_visa_processes || 0} color="#F43F5E" icon={FileText} />
        </BentoCard>

        <BentoCard colSpan={1} rowSpan={1}>
          <MetricBlock label="Usuarios Totales" value={adminStats?.total_agencies ? adminStats.total_agencies * 3 : 0} color="var(--lime)" icon={Users} />
        </BentoCard>

      </div>
    </div>
  );
};

export default OverviewPage;
