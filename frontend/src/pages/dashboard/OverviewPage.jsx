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
import Modal from '../../components/Modal';
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

  useEffect(() => {
    if (!isAdmin) {
      const fetchApts = async () => {
        try {
          const [data, meData, wompiData] = await Promise.all([
            api.getAppointments(),
            api.getMe(),
            api.getWompiPublicKey()
          ]);
          setAppointments(data);
          setProfile(meData);
          setWompiKey(wompiData.public_key);
        } catch (e) {
          toast.error('Error cargando datos');
        } finally {
          setLoading(false);
        }
      };
      fetchApts();
    } else {
      setLoading(false);
    }
  }, [role]);

  if (!isAdmin) {
    if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-3)' }}>Cargando panel...</div>;
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
          .corp-card {
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          }
          .corp-stat {
            padding: 1.5rem;
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }
          .corp-stat-label {
            font-size: 0.85rem;
            color: var(--text-2);
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          .corp-stat-value {
            font-size: 2rem;
            color: var(--text-1);
            font-weight: 600;
            font-family: var(--font-heading);
            line-height: 1;
          }
          
          /* Formal Timeline */
          .corp-timeline {
            display: flex;
            flex-direction: column;
            margin-top: 1.5rem;
          }
          .corp-timeline-item {
            position: relative;
            padding-left: 2rem;
            padding-bottom: 2rem;
            border-left: 1px solid var(--border-2);
          }
          .corp-timeline-item:last-child {
            border-left-color: transparent;
            padding-bottom: 0;
          }
          .corp-timeline-item::before {
            content: '';
            position: absolute;
            left: -5px;
            top: 2px;
            width: 9px;
            height: 9px;
            border-radius: 50%;
            background: var(--surface);
            border: 2px solid var(--border-2);
          }
          .corp-timeline-item.completed::before {
            background: var(--lime);
            border-color: var(--lime);
          }
          .corp-timeline-item.active::before {
            background: var(--surface);
            border-color: var(--lime);
            border-width: 3px;
          }
          .corp-timeline-item.completed {
            border-left-color: var(--lime);
          }
          .corp-timeline-title {
            font-size: 0.95rem;
            font-weight: 600;
            color: var(--text-1);
            line-height: 1.2;
            margin-bottom: 0.25rem;
          }
          .corp-timeline-desc {
            font-size: 0.85rem;
            color: var(--text-2);
            line-height: 1.5;
          }
        `}</style>

        {/* Global Status Banner (Minimalist) */}
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
          <StatCard 
            label="Citas Creadas" 
            value={total} 
            icon={FileText} 
          />
          <StatCard 
            label="En Búsqueda Activa" 
            value={buscando} 
            icon={Search} 
          />
          {role === 'NATURAL_PERSON' && (
            <div style={{ background: 'linear-gradient(135deg, var(--surface) 0%, rgba(163, 230, 53, 0.05) 100%)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative', overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-3)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Balance de Citas</p>
                  <h3 style={{ margin: 0, color: 'var(--text-1)', fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
                    ${((profile?.balance || 0) / 1000).toFixed(0)}k <span style={{fontSize: '0.9rem', color: 'var(--text-3)', fontWeight: 400}}>COP</span>
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
                    {isSecured 
                      ? 'Algoritmo finalizó la búsqueda exitosamente.' 
                      : 'Nuestros servidores monitorean la disponibilidad consular de manera ininterrumpida.'}
                  </div>
                </div>
                
                <div className={`corp-timeline-item ${isSecured ? 'completed' : ''}`}>
                  <div className="corp-timeline-title">Reprogramación Exitosa</div>
                  <div className="corp-timeline-desc">
                    {isSecured 
                      ? 'Cita adelantada y asegurada firmemente.' 
                      : 'Esperando asignación de espacio óptimo.'}
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

  return (
    <div className="animate-in" style={{ paddingBottom: '2rem' }}>
      
      {/* Header & Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-heading)', fontWeight: 700, margin: '0 0 0.25rem 0', color: 'var(--text-1)' }}>Dashboard Analítico</h1>
          <p style={{ margin: 0, color: 'var(--text-2)', fontSize: '0.95rem' }}>Vista general de rendimiento y control financiero.</p>
        </div>
        <div style={{ display: 'flex', background: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)', overflow: 'hidden' }}>
          {['Día', 'Semana', 'Mes', 'Año'].map(f => (
            <button key={f} onClick={() => setTimeFilter(f)} style={{ padding: '0.5rem 1rem', background: timeFilter === f ? 'var(--surface-2)' : 'transparent', border: 'none', color: timeFilter === f ? 'var(--text-1)' : 'var(--text-3)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <StatCard label="Ingresos Totales" value="24,500" icon={DollarSign} delta={12.5} isCurrency />
        <StatCard label="Gastos Plataforma" value="3,200" icon={CreditCard} delta={-2.4} isCurrency />
        <StatCard label="Citas Tramitadas" value="842" icon={CalendarCheck} delta={18.2} />
        <StatCard label="Tasa de Aprobación" value="94.5%" icon={TrendingUp} delta={1.2} />
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        
        {/* Main Area Chart */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.1rem', color: 'var(--text-1)', fontWeight: 700 }}>Flujo Financiero ({timeFilter})</h3>
          <div style={{ width: '100%', height: 300, overflowX: 'auto' }}>
            <AreaChart width={600} height={300} data={REVENUE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--lime)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--lime)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--text-3)', fontSize: 12}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-3)', fontSize: 12}} />
              <Tooltip 
                contentStyle={{ background: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)' }}
                itemStyle={{ fontWeight: 600 }}
              />
              <Area type="monotone" dataKey="ingresos" stroke="var(--lime)" strokeWidth={3} fillOpacity={1} fill="url(#colorIngresos)" />
              <Area type="monotone" dataKey="gastos" stroke="#ef4444" strokeWidth={2} fillOpacity={0.1} fill="#ef4444" />
            </AreaChart>
          </div>
        </div>

        {/* Donut Chart */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.1rem', color: 'var(--text-1)', fontWeight: 700 }}>Estado de Trámites</h3>
          <div style={{ width: '100%', height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <PieChart width={220} height={220}>
              <Pie data={STATUS_DATA} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                {STATUS_DATA.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)' }} />
            </PieChart>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: 'auto' }}>
            {STATUS_DATA.map(d => (
              <div key={d.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: d.color }} />
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-2)', fontWeight: 500 }}>{d.name}</span>
                </div>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-1)', fontWeight: 700 }}>{d.value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default OverviewPage;
