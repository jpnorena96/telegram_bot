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

  useEffect(() => {
    if (role === 'NATURAL_PERSON' || role === 'TRAVEL_AGENCY') {
      const fetchApts = async () => {
        try {
          const data = await api.getAppointments();
          setAppointments(data);
        } catch (e) {
          toast.error('Error cargando citas');
        } finally {
          setLoading(false);
        }
      };
      fetchApts();
    } else {
      setLoading(false);
    }
  }, [role]);

  if (role === 'NATURAL_PERSON' || role === 'TRAVEL_AGENCY') {
    if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-3)' }}>Cargando resumen...</div>;
    const total = appointments.length;
    const aprobadas = appointments.filter(a => ['Adelantada', 'agendado'].includes(a.status)).length;
    const buscando = appointments.filter(a => ['pending', 'Buscando'].includes(a.status)).length;

    return (
      <div className="animate-in" style={{ paddingBottom: '2rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-heading)', fontWeight: 700, margin: '0 0 0.25rem 0', color: 'var(--text-1)' }}>Hola, {userName || 'Cliente'} 👋</h1>
          <p style={{ margin: 0, color: 'var(--text-2)', fontSize: '0.95rem' }}>Bienvenido a tu panel de control de GlobalVisas.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <StatCard label="Total de Trámites" value={total} icon={FileText} />
          <StatCard label="Citas Aseguradas" value={aprobadas} icon={CheckCircle} />
          <StatCard label="En Búsqueda Continua" value={buscando} icon={Search} />
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', color: 'var(--text-1)', fontWeight: 700 }}>Información Importante</h3>
          <p style={{ color: 'var(--text-2)', fontSize: '0.9rem', lineHeight: '1.6', margin: '0 0 1rem 0' }}>
            Puedes ver el progreso detallado y fechas de tus trámites en la pestaña de <strong>Citas</strong> en el menú lateral.
          </p>
          <div style={{ padding: '1rem', background: 'var(--surface-2)', borderRadius: '8px', borderLeft: '3px solid var(--lime)' }}>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-1)', lineHeight: '1.5' }}>
              ℹ️ Si el estado de tu trámite es <strong>En Búsqueda Continua</strong>, nuestro sistema automatizado está intentando adelantar tu cita 24/7 en el consulado. Recibirás una notificación por WhatsApp cuando logremos reprogramarla con éxito hacia la fecha deseada.
            </p>
          </div>
        </div>
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
