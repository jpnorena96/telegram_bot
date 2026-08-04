import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router-dom';
import { 
  TrendingUp, Users, CalendarCheck, Clock, 
  DollarSign, ArrowUpRight, ArrowDownRight, CreditCard,
  FileText, CheckCircle, Search
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import TopUpModal from '../../components/TopUpModal';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

// Dummy Data for charts
const REVENUE_DATA = [
  { name: 'Lun', ingresos: 400, gastos: 240 },
  { name: 'Mar', ingresos: 300, gastos: 139 },
  { name: 'Mie', ingresos: 200, gastos: 980 },
  { name: 'Jue', ingresos: 278, gastos: 390 },
  { name: 'Vie', ingresos: 189, gastos: 480 },
  { name: 'Sab', ingresos: 239, gastos: 380 },
  { name: 'Dom', ingresos: 349, gastos: 430 },
];

const STATUS_DATA = [
  { name: 'Aprobadas', value: 400, color: 'var(--lime)' },
  { name: 'Pendientes', value: 300, color: 'var(--cyan)' },
  { name: 'Rechazadas', value: 100, color: '#ef4444' },
];

const StatCard = ({ label, value, icon: Icon, delta, isCurrency }) => (
  <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative', overflow: 'hidden' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-3)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
        <h3 style={{ margin: 0, color: 'var(--text-1)', fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
          {isCurrency ? '$' : ''}{value}
        </h3>
      </div>
      <div style={{ width: 48, height: 48, borderRadius: '12px', background: 'var(--surface-2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-2)' }}>
        <Icon size={24} />
      </div>
    </div>
    {delta && (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>
        <span style={{ color: delta >= 0 ? 'var(--lime)' : '#ef4444', display: 'flex', alignItems: 'center' }}>
          {delta >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
          {Math.abs(delta)}%
        </span>
        <span style={{ color: 'var(--text-3)' }}>vs mes anterior</span>
      </div>
    )}
  </div>
);

const OverviewPage = () => {
  const { t } = useTranslation();
  const { role, userName } = useOutletContext();
  const [timeFilter, setTimeFilter] = useState('Semana');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [wompiKey, setWompiKey] = useState('');

  const isAdmin = role === 'ADMINISTRATOR' || role === 'AUDITOR';

  const [adminStats, setAdminStats] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!isAdmin) {
          const [data, meData, wompiData] = await Promise.all([
            api.getAppointments(),
            api.getMe(),
            api.getWompiPublicKey()
          ]);
          setAppointments(data);
          setProfile(meData);
          setWompiKey(wompiData.public_key);
        } else {
          const stats = await api.getAdminDashboardStats();
          setAdminStats(stats);
        }
      } catch (e) {
        toast.error('Error cargando datos');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [role, isAdmin]);

  if (loading) return <div className="spinner" style={{ margin: '3rem auto' }} />;

  // ── USER VIEW ──
  if (!isAdmin) {
    const total = appointments.length;
    const aprobadas = appointments.filter(a => ['Adelantada', 'agendado'].includes(a.status)).length;
    const buscando = appointments.filter(a => ['pending', 'Buscando'].includes(a.status)).length;
    
    // Get the most recent appointment for the timeline
    const latestApt = appointments.length > 0 ? appointments[0] : null;
    const isSearching = latestApt && ['pending', 'Buscando'].includes(latestApt.status);
    const isSecured = latestApt && ['Adelantada', 'agendado'].includes(latestApt.status);

    return (
      <div className="animate-in" style={{ paddingBottom: '3rem', maxWidth: '1000px', margin: '0 auto' }}>
        <style>{`
          .corp-card { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
          .corp-timeline { display: flex; flex-direction: column; margin-top: 1.5rem; }
          .corp-timeline-item { position: relative; padding-left: 2rem; padding-bottom: 2rem; border-left: 1px solid var(--border-2); }
          .corp-timeline-item:last-child { border-left-color: transparent; padding-bottom: 0; }
          .corp-timeline-item::before { content: ''; position: absolute; left: -5px; top: 2px; width: 9px; height: 9px; border-radius: 50%; background: var(--surface); border: 2px solid var(--border-2); }
          .corp-timeline-item.completed::before { background: var(--lime); border-color: var(--lime); }
          .corp-timeline-item.active::before { background: var(--surface); border-color: var(--lime); border-width: 3px; }
          .corp-timeline-item.completed { border-left-color: var(--lime); }
          .corp-timeline-title { font-size: 0.95rem; font-weight: 600; color: var(--text-1); line-height: 1.2; margin-bottom: 0.25rem; }
          .corp-timeline-desc { font-size: 0.85rem; color: var(--text-2); line-height: 1.5; }
        `}</style>

        {/* Global Status Banner */}
        {isSearching && (
          <div style={{ background: 'rgba(79, 70, 229, 0.05)', border: '1px solid var(--lime-glow)', borderRadius: '6px', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--lime)' }} />
            <span style={{ fontSize: '0.9rem', color: 'var(--text-1)', fontWeight: 500 }}>
              El sistema automatizado está operando activamente en la búsqueda de espacios consulares para su trámite.
            </span>
          </div>
        )}

        <div className="corp-header" style={{ marginBottom: '2.5rem' }}>
          <h1 className="corp-title" style={{ fontSize: '1.75rem', fontFamily: 'var(--font-heading)', fontWeight: 600, margin: '0 0 0.25rem 0', color: 'var(--text-1)' }}>Hola, {userName}</h1>
          <p className="corp-subtitle" style={{ margin: 0, color: 'var(--text-2)', fontSize: '0.95rem' }}>Aquí está el resumen de tus procesos de visado.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
          <StatCard label="Citas Creadas" value={total} icon={FileText} />
          <StatCard label="En Búsqueda Activa" value={buscando} icon={Search} />
          {role === 'NATURAL_PERSON' && (
            <div style={{ background: 'linear-gradient(135deg, var(--surface) 0%, rgba(163, 230, 53, 0.05) 100%)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative', overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-3)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Citas Disponibles</p>
                  <h3 style={{ margin: 0, color: 'var(--text-1)', fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
                    {profile?.balance || 0} <span style={{fontSize: '0.9rem', color: 'var(--text-3)', fontWeight: 400}}>Cita(s)</span>
                  </h3>
                </div>
                <button onClick={() => setIsTopUpOpen(true)} className="btn btn-lime" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                  Recargar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
          {/* Tracking Panel */}
          {latestApt ? (
            <div className="corp-card" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-1)', marginBottom: '0.5rem', fontFamily: 'var(--font-ui)' }}>
                Seguimiento de Trámite
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-2)', margin: 0 }}>
                Expediente: <span style={{ fontFamily: 'var(--font-mono)' }}>#{latestApt.id || '0000'}</span>
              </p>
              
              <div className="corp-timeline">
                <div className="corp-timeline-item completed">
                  <div className="corp-timeline-title">Apertura de Expediente</div>
                  <div className="corp-timeline-desc">Documentación inicial recibida y validada.</div>
                </div>
                <div className={`corp-timeline-item ${isSecured || isSearching ? 'completed' : 'active'}`}>
                  <div className="corp-timeline-title">Programación Consular Base</div>
                  <div className="corp-timeline-desc">Asignación de fecha original en el sistema.</div>
                </div>
                <div className={`corp-timeline-item ${isSecured ? 'completed' : (isSearching ? 'active' : '')}`}>
                  <div className="corp-timeline-title">Ejecución Automatizada</div>
                  <div className="corp-timeline-desc">
                    {isSecured ? 'Algoritmo finalizó la búsqueda exitosamente.' : 'Nuestros servidores monitorean la disponibilidad consular de manera ininterrumpida.'}
                  </div>
                </div>
                <div className={`corp-timeline-item ${isSecured ? 'completed' : ''}`}>
                  <div className="corp-timeline-title">Reprogramación Exitosa</div>
                  <div className="corp-timeline-desc">
                    {isSecured ? 'Cita adelantada y asegurada firmemente.' : 'Esperando asignación de espacio óptimo.'}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="corp-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
              <FileText size={32} color="var(--border-2)" style={{ marginBottom: '1rem' }} />
              <p style={{ color: 'var(--text-2)', fontSize: '0.95rem' }}>No hay trámites registrados en su cuenta.</p>
            </div>
          )}

          {/* Info Panel */}
          <div>
            <div className="corp-card" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-1)', marginBottom: '1rem', fontFamily: 'var(--font-ui)' }}>
                Directrices Operativas
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-2)', lineHeight: 1.6, margin: 0 }}>
                  La plataforma AdelantaVisa automatiza el monitoreo de citas consulares mediante infraestructura dedicada. 
                  Para consultar el desglose preciso de fechas y horas asignadas, diríjase al módulo de <strong>Citas</strong> en el panel de navegación izquierdo.
                </p>
                <div style={{ padding: '1rem', background: 'var(--surface-2)', borderRadius: '6px', borderLeft: '3px solid var(--border-2)' }}>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-2)', lineHeight: 1.5, margin: 0 }}>
                    <strong>Aviso de Notificaciones:</strong><br />
                    Toda actualización crítica respecto al estatus de su cita será notificada de inmediato a través del canal oficial de WhatsApp registrado en su expediente.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <TopUpModal 
          isOpen={isTopUpOpen} 
          onClose={() => setIsTopUpOpen(false)} 
          wompiPubKey={wompiKey} 
          email={profile?.email}
          onTopUpSuccess={() => {
             api.getMe().then(p => setProfile(p));
          }}
        />
      </div>
    );
  }

  // ── ADMIN VIEW (GOD MODE) ──
  const realStatusData = adminStats?.status_distribution?.map(s => {
    let color = '#3b82f6';
    if (s.status === 'Adelantada' || s.status === 'agendado') color = '#10B981';
    if (s.status === 'pending' || s.status === 'Buscando') color = '#F59E0B';
    if (s.status === 'canceled' || s.status === 'failed') color = '#EF4444';
    return { name: s.status, value: s.count, color };
  }) || [];

  return (
    <div className="animate-in" style={{ paddingBottom: '2rem', background: '#09090B', minHeight: 'calc(100vh - 80px)', margin: '-2rem', padding: '2rem', color: '#fff' }}>
      
      {/* Header & Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#10B981', letterSpacing: '0.2em', marginBottom: '0.5rem' }}>
            // GLOBAL COMMAND CENTER
          </div>
          <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-heading)', fontWeight: 800, margin: '0 0 0.25rem 0', color: '#FFFFFF', textShadow: '0 0 20px rgba(255,255,255,0.1)' }}>
            System Analytics
          </h1>
          <p style={{ margin: 0, color: '#A1A1AA', fontSize: '1rem' }}>Métricas en tiempo real extraídas del core de la base de datos.</p>
        </div>
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
          {['Día', 'Semana', 'Mes', 'Año'].map(f => (
            <button key={f} onClick={() => setTimeFilter(f)} style={{ padding: '0.5rem 1rem', background: timeFilter === f ? 'rgba(255,255,255,0.1)' : 'transparent', border: 'none', color: timeFilter === f ? '#fff' : '#A1A1AA', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '1.5rem', backdropFilter: 'blur(10px)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -50, right: -50, width: 150, height: 150, background: 'rgba(16, 185, 129, 0.1)', filter: 'blur(40px)', borderRadius: '50%' }} />
          <p style={{ margin: '0 0 0.5rem 0', color: '#A1A1AA', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Total Appointments (Bots)</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, color: '#fff', fontSize: '2.5rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
              {adminStats?.total_appointments || 0}
            </h3>
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '0.5rem', borderRadius: '8px', color: '#10B981' }}>
              <CalendarCheck size={24} />
            </div>
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '1.5rem', backdropFilter: 'blur(10px)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -50, right: -50, width: 150, height: 150, background: 'rgba(6, 182, 212, 0.1)', filter: 'blur(40px)', borderRadius: '50%' }} />
          <p style={{ margin: '0 0 0.5rem 0', color: '#A1A1AA', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Agencias Registradas</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, color: '#fff', fontSize: '2.5rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
              {adminStats?.total_agencies || 0}
            </h3>
            <div style={{ background: 'rgba(6, 182, 212, 0.1)', padding: '0.5rem', borderRadius: '8px', color: '#06b6d4' }}>
              <Users size={24} />
            </div>
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '1.5rem', backdropFilter: 'blur(10px)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -50, right: -50, width: 150, height: 150, background: 'rgba(139, 92, 246, 0.1)', filter: 'blur(40px)', borderRadius: '50%' }} />
          <p style={{ margin: '0 0 0.5rem 0', color: '#A1A1AA', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Procesos de Visa (Manuales)</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, color: '#fff', fontSize: '2.5rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
              {adminStats?.total_visa_processes || 0}
            </h3>
            <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '0.5rem', borderRadius: '8px', color: '#8b5cf6' }}>
              <FileText size={24} />
            </div>
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '1.5rem', backdropFilter: 'blur(10px)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -50, right: -50, width: 150, height: 150, background: 'rgba(239, 68, 68, 0.1)', filter: 'blur(40px)', borderRadius: '50%' }} />
          <p style={{ margin: '0 0 0.5rem 0', color: '#A1A1AA', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Eficiencia Bot (Adelantadas)</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, color: '#fff', fontSize: '2.5rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
              {
                adminStats?.status_distribution?.length ? 
                Math.round((adminStats.status_distribution.find(s => s.status === 'Adelantada' || s.status === 'agendado')?.count || 0) / adminStats.total_appointments * 100) : 0
              }%
            </h3>
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '0.5rem', borderRadius: '8px', color: '#ef4444' }}>
              <TrendingUp size={24} />
            </div>
          </div>
        </div>

      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        
        {/* Main Area Chart (Volume) */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '1.5rem', backdropFilter: 'blur(10px)' }}>
          <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.1rem', color: '#fff', fontWeight: 700, letterSpacing: '0.05em' }}>Volumen de Citas (Últimos 7 Días)</h3>
          <div style={{ width: '100%', height: 300, overflowX: 'auto' }}>
            <AreaChart width={650} height={300} data={adminStats?.timeline || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCitas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.5}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#A1A1AA', fontSize: 12, fontFamily: 'var(--font-mono)'}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#A1A1AA', fontSize: 12, fontFamily: 'var(--font-mono)'}} />
              <Tooltip 
                contentStyle={{ background: '#09090B', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', color: '#fff' }}
                itemStyle={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}
              />
              <Area type="monotone" dataKey="citas" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorCitas)" />
            </AreaChart>
          </div>
        </div>

        {/* Donut Chart (Status) */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '1.5rem', backdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.1rem', color: '#fff', fontWeight: 700, letterSpacing: '0.05em' }}>Estado del Pool de Citas</h3>
          
          <div style={{ width: '100%', height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {realStatusData.length > 0 ? (
              <PieChart width={220} height={220}>
                <Pie data={realStatusData} cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={5} dataKey="value" stroke="none">
                  {realStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#09090B', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', color: '#fff' }} />
              </PieChart>
            ) : (
              <div style={{ color: '#A1A1AA', fontSize: '0.9rem' }}>No hay datos suficientes</div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: 'auto' }}>
            {realStatusData.map(d => (
              <div key={d.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, boxShadow: `0 0 10px ${d.color}` }} />
                  <span style={{ fontSize: '0.85rem', color: '#A1A1AA', fontWeight: 600, textTransform: 'uppercase' }}>{d.name}</span>
                </div>
                <span style={{ fontSize: '1rem', color: '#fff', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{d.value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default OverviewPage;
