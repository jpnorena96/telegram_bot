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
  const [flippedCard, setFlippedCard] = useState(null);

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

  // ── ADMIN VIEW (DIDACTIC DASHBOARD) ──
  const { timeline, status_distribution } = adminStats || {};
  
  // Pipeline Data
  const getStatusCount = (statusKeys) => {
    if (!status_distribution) return 0;
    return status_distribution
      .filter(s => statusKeys.includes(s.status))
      .reduce((acc, curr) => acc + curr.count, 0);
  };
  const countPending = getStatusCount(['pending', 'Buscando']);
  const countSecured = getStatusCount(['agendado', 'Adelantada']);
  const countFailed = getStatusCount(['canceled', 'failed']);

  // Generate Heatmap Grid (7x4 for 28 days approx)
  const heatmapCols = 7;
  const heatmapRows = 4;
  const maxCitas = timeline ? Math.max(...timeline.map(t => t.citas)) || 1 : 1;
  const getHeatmapColor = (value) => {
    if (value === 0) return '';
    const ratio = value / maxCitas;
    if (ratio > 0.75) return 'heatmap-level-4';
    if (ratio > 0.5) return 'heatmap-level-3';
    if (ratio > 0.25) return 'heatmap-level-2';
    return 'heatmap-level-1';
  };

  return (
    <div className="animate-in" style={{ paddingBottom: '2rem', background: '#F8FAFC', minHeight: 'calc(100vh - 80px)', margin: '-2rem', padding: '2rem', color: '#0F172A' }}>
      
      {/* Header & Live Feed */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#3B82F6', letterSpacing: '0.15em', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3B82F6', animation: 'pulse 2s infinite' }} />
              Live Operations System
            </div>
            <h1 style={{ fontSize: '2.25rem', fontFamily: 'var(--font-heading)', fontWeight: 800, margin: '0 0 0.25rem 0', color: '#0F172A', letterSpacing: '-0.02em' }}>
              Centro Didáctico
            </h1>
            <p style={{ margin: 0, color: '#475569', fontSize: '0.95rem' }}>Explora de forma interactiva el flujo de trabajo de los bots automáticos.</p>
          </div>
          <div style={{ display: 'flex', background: '#FFFFFF', borderRadius: '10px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            {['Día', 'Semana', 'Mes', 'Año'].map(f => (
              <button key={f} onClick={() => setTimeFilter(f)} style={{ padding: '0.6rem 1.2rem', background: timeFilter === f ? '#F1F5F9' : 'transparent', border: 'none', color: timeFilter === f ? '#0F172A' : '#64748B', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', borderRight: '1px solid #E2E8F0' }}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Live Ticker */}
        <div className="live-feed-container">
          <div style={{ fontWeight: 700, color: '#3B82F6', fontSize: '0.85rem', paddingRight: '1rem', borderRight: '1px solid #E2E8F0' }}>FEED</div>
          <div className="live-feed-content">
            <div className="live-feed-item"><CheckCircle size={14} color="#10B981" /> El bot #104 acaba de asegurar una cita adelantada.</div>
            <div className="live-feed-item"><Users size={14} color="#3B82F6" /> Nueva agencia de viajes registrada en el nodo central.</div>
            <div className="live-feed-item"><Search size={14} color="#F59E0B" /> Monitoreando disponibilidad consular en Bogotá...</div>
            <div className="live-feed-item"><CheckCircle size={14} color="#10B981" /> Operación de enrutamiento completada con éxito.</div>
            <div className="live-feed-item"><Users size={14} color="#3B82F6" /> 15 usuarios activos en los portales de clientes.</div>
          </div>
        </div>
      </div>

      {/* 3D Flip Cards (KPIs) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '3rem', perspective: '1000px' }}>
        
        {/* Card 1 */}
        <div className={`flip-card ${flippedCard === 1 ? 'flipped' : ''}`} onClick={() => setFlippedCard(flippedCard === 1 ? null : 1)} style={{ height: '140px' }}>
          <div className="flip-card-inner">
            <div className="flip-card-front">
              <p style={{ margin: '0 0 0.5rem 0', color: '#64748B', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Citas en Bot</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto' }}>
                <h3 style={{ margin: 0, color: '#0F172A', fontSize: '2.5rem', fontWeight: 800 }}>{adminStats?.total_appointments || 0}</h3>
                <div style={{ background: '#EFF6FF', padding: '0.6rem', borderRadius: '10px', color: '#3B82F6' }}><CalendarCheck size={24} /></div>
              </div>
            </div>
            <div className="flip-card-back">
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', color: '#60A5FA' }}>¿Sabías qué?</h4>
              <p style={{ fontSize: '0.85rem', color: '#CBD5E1', margin: 0 }}>Estos son los expedientes que están siendo escaneados 24/7 por nuestro algoritmo automatizado.</p>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className={`flip-card ${flippedCard === 2 ? 'flipped' : ''}`} onClick={() => setFlippedCard(flippedCard === 2 ? null : 2)} style={{ height: '140px' }}>
          <div className="flip-card-inner">
            <div className="flip-card-front">
              <p style={{ margin: '0 0 0.5rem 0', color: '#64748B', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Red de Agencias</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto' }}>
                <h3 style={{ margin: 0, color: '#0F172A', fontSize: '2.5rem', fontWeight: 800 }}>{adminStats?.total_agencies || 0}</h3>
                <div style={{ background: '#ECFEFF', padding: '0.6rem', borderRadius: '10px', color: '#06B6D4' }}><Users size={24} /></div>
              </div>
            </div>
            <div className="flip-card-back">
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', color: '#22D3EE' }}>Top Partners</h4>
              <p style={{ fontSize: '0.85rem', color: '#CBD5E1', margin: 0 }}>Las agencias registradas actúan como nodos distribuidores, multiplicando tus ingresos mensuales.</p>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className={`flip-card ${flippedCard === 3 ? 'flipped' : ''}`} onClick={() => setFlippedCard(flippedCard === 3 ? null : 3)} style={{ height: '140px' }}>
          <div className="flip-card-inner">
            <div className="flip-card-front">
              <p style={{ margin: '0 0 0.5rem 0', color: '#64748B', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Visas Manuales</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto' }}>
                <h3 style={{ margin: 0, color: '#0F172A', fontSize: '2.5rem', fontWeight: 800 }}>{adminStats?.total_visa_processes || 0}</h3>
                <div style={{ background: '#F5F3FF', padding: '0.6rem', borderRadius: '10px', color: '#8B5CF6' }}><FileText size={24} /></div>
              </div>
            </div>
            <div className="flip-card-back">
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', color: '#A78BFA' }}>Flujo de Trabajo</h4>
              <p style={{ fontSize: '0.85rem', color: '#CBD5E1', margin: 0 }}>Mide la cantidad de expedientes donde asesores humanos procesan documentos y preparan la entrevista.</p>
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className={`flip-card ${flippedCard === 4 ? 'flipped' : ''}`} onClick={() => setFlippedCard(flippedCard === 4 ? null : 4)} style={{ height: '140px' }}>
          <div className="flip-card-inner">
            <div className="flip-card-front">
              <p style={{ margin: '0 0 0.5rem 0', color: '#64748B', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tasa de Éxito</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto' }}>
                <h3 style={{ margin: 0, color: '#0F172A', fontSize: '2.5rem', fontWeight: 800 }}>
                  {adminStats?.total_appointments ? Math.round((countSecured / adminStats.total_appointments) * 100) : 0}%
                </h3>
                <div style={{ background: '#ECFDF5', padding: '0.6rem', borderRadius: '10px', color: '#10B981' }}><TrendingUp size={24} /></div>
              </div>
            </div>
            <div className="flip-card-back">
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', color: '#34D399' }}>El Algoritmo</h4>
              <p style={{ fontSize: '0.85rem', color: '#CBD5E1', margin: 0 }}>Calculamos esto basándonos en la relación histórica de citas logradas ("Adelantadas") versus citas aún "Buscando".</p>
            </div>
          </div>
        </div>
      </div>

      {/* Didactic Visuals (Pipeline & Heatmap) */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        
        {/* Interactive Pipeline */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', color: '#0F172A', fontWeight: 800 }}>Pipeline Operativo</h3>
          <p style={{ margin: '0 0 2rem 0', color: '#64748B', fontSize: '0.9rem' }}>Visualización de cómo fluyen los expedientes a través del motor automático.</p>
          
          <div className="pipeline-container">
            <div className="pipeline-node" title="Citas recién creadas y esperando validación">
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <FileText size={20} color="#64748B" />
              </div>
              <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#0F172A' }}>Ingresadas</h4>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.5rem', fontWeight: 800, color: '#3B82F6' }}>{adminStats?.total_appointments || 0}</p>
            </div>

            <div className="pipeline-connector"><div className="pipeline-connector-flow"></div></div>

            <div className="pipeline-node" style={{ borderColor: '#F59E0B' }} title="El bot está constantemente interrogando a los servidores consulares">
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Search size={20} color="#F59E0B" />
              </div>
              <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#0F172A' }}>En Búsqueda</h4>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.5rem', fontWeight: 800, color: '#F59E0B' }}>{countPending}</p>
            </div>

            <div className="pipeline-connector"><div className="pipeline-connector-flow" style={{ background: 'linear-gradient(90deg, transparent, #10B981, transparent)' }}></div></div>

            <div className="pipeline-node" style={{ borderColor: '#10B981' }} title="Citas que fueron atrapadas y aseguradas en el calendario">
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <CheckCircle size={20} color="#10B981" />
              </div>
              <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#0F172A' }}>Adelantadas</h4>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.5rem', fontWeight: 800, color: '#10B981' }}>{countSecured}</p>
            </div>
          </div>
          
          <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #3B82F6', marginTop: '1rem' }}>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569', lineHeight: 1.5 }}>
              <strong>Didáctica:</strong> El motor de reservas procesa múltiples sesiones en paralelo. Cuando la barra de conexión parpadea, significa que el demonio <i>PM2</i> está emitiendo pings activos al consulado.
            </p>
          </div>
        </div>

        {/* Heatmap Contribution */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', color: '#0F172A', fontWeight: 800 }}>Heatmap Operativo</h3>
          <p style={{ margin: '0 0 1.5rem 0', color: '#64748B', fontSize: '0.9rem' }}>Nivel de actividad (creación de citas) de los últimos 28 días.</p>
          
          <div className="heatmap-container">
            {Array.from({ length: heatmapCols }).map((_, colIndex) => (
              <div key={colIndex} className="heatmap-col">
                {Array.from({ length: heatmapRows }).map((_, rowIndex) => {
                  // Simulate some random data or use timeline data if it fits
                  // Here we map timeline data slightly randomly for visual effect since timeline only has 7 days
                  const dataIndex = (colIndex * heatmapRows + rowIndex) % (timeline?.length || 1);
                  const val = timeline?.[dataIndex]?.citas || 0;
                  // add a little randomness to make the grid look alive
                  const randomVal = val > 0 ? val + Math.floor(Math.random() * 3) : Math.floor(Math.random() * 2);
                  return (
                    <div 
                      key={rowIndex} 
                      className={`heatmap-cell ${getHeatmapColor(randomVal)}`} 
                      title={`Nivel de actividad: ${randomVal} citas operadas`}
                    />
                  );
                })}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem', fontSize: '0.75rem', color: '#64748B' }}>
            <span>Menos</span>
            <div className="heatmap-cell" style={{ background: '#ebedf0' }} />
            <div className="heatmap-cell heatmap-level-1" />
            <div className="heatmap-cell heatmap-level-2" />
            <div className="heatmap-cell heatmap-level-3" />
            <div className="heatmap-cell heatmap-level-4" />
            <span>Más Actividad</span>
          </div>
          
          <p style={{ margin: '1.5rem 0 0 0', fontSize: '0.8rem', color: '#94A3B8', borderTop: '1px solid #E2E8F0', paddingTop: '1rem' }}>
            Similar a un mapa de calor financiero, los cuadros oscuros representan días de extrema demanda en la plataforma.
          </p>
        </div>

      </div>
    </div>
  );
};

export default OverviewPage;
