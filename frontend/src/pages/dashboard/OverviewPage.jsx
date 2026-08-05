import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { 
  TrendingUp, Users, CalendarCheck, Clock, 
  DollarSign, ArrowUpRight, ArrowDownRight, CreditCard,
  FileText, CheckCircle, Search, Server, ShieldCheck, 
  HelpCircle, Calculator, Zap, Building2, User, ChevronRight, Activity
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import TopUpModal from '../../components/TopUpModal';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

const StatCard = ({ label, value, icon: Icon, delta, isCurrency, color = '#3B82F6', badge }) => (
  <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <p style={{ margin: '0 0 0.5rem 0', color: '#64748B', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
        <h3 style={{ margin: 0, color: '#0F172A', fontSize: '2rem', fontWeight: 800 }}>
          {isCurrency ? '$' : ''}{value}
        </h3>
      </div>
      <div style={{ width: 44, height: 44, borderRadius: '12px', background: `${color}12`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: color }}>
        <Icon size={22} />
      </div>
    </div>
    {badge && (
      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: color, background: `${color}10`, padding: '0.2rem 0.5rem', borderRadius: '4px', alignSelf: 'flex-start' }}>
        {badge}
      </div>
    )}
  </div>
);

const OverviewPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { role, userName } = useOutletContext();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [wompiKey, setWompiKey] = useState('');
  const [adminStats, setAdminStats] = useState(null);

  // Interactive Pricing Calculator State for Agencies
  const [calcUserType, setCalcUserType] = useState('agency'); // 'agency' | 'natural'
  const [calcRange, setCalcRange] = useState('under_month'); // 'under_month' | 'over_month'
  const [calcPeople, setCalcPeople] = useState(1); // 1 = main, 2+ = extra

  const isAdmin = role === 'ADMINISTRATOR' || role === 'AUDITOR';

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!isAdmin) {
          const [data, meData, wompiData] = await Promise.all([
            api.getAppointments().catch(() => []),
            api.getMe().catch(() => ({})),
            api.getWompiPublicKey().catch(() => ({}))
          ]);
          setAppointments(data);
          setProfile(meData);
          setWompiKey(wompiData.public_key || '');
        } else {
          const stats = await api.getAdminDashboardStats().catch(() => ({}));
          setAdminStats(stats);
        }
      } catch (e) {
        toast.error('Error al cargar datos del resumen');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [role, isAdmin]);

  // Calculate dynamic tariff based on user prompt rules
  const calculatePrice = () => {
    const extras = Math.max(0, calcPeople - 1);
    if (calcRange === 'under_month') {
      // Rango a menos de un mes
      if (calcUserType === 'agency') {
        return 20 + (extras * 15);
      } else {
        return 60 + (extras * 10);
      }
    } else {
      // Rango superior al mes
      if (calcUserType === 'agency') {
        return 15 + (extras * 13);
      } else {
        return 45 + (extras * 15);
      }
    }
  };

  if (loading) return <div className="spinner" style={{ margin: '4rem auto' }} />;

  // ── USER / CLIENT VIEW ──
  if (!isAdmin) {
    const total = appointments.length;
    const aprobadas = appointments.filter(a => ['Adelantada', 'agendado'].includes(a.status)).length;
    const buscando = appointments.filter(a => ['pending', 'Buscando'].includes(a.status)).length;
    const latestApt = appointments.length > 0 ? appointments[0] : null;

    return (
      <div className="animate-in" style={{ paddingBottom: '3rem', maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 0.25rem 0', color: 'var(--text-1)' }}>Hola, {userName}</h1>
          <p style={{ margin: 0, color: 'var(--text-2)', fontSize: '0.95rem' }}>Resumen operativo de tus solicitudes de visado.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
          <StatCard label="Citas Registradas" value={total} icon={FileText} color="#3B82F6" />
          <StatCard label="Monitoreo Activo Bot" value={buscando} icon={Search} color="#F59E0B" />
          <StatCard label="Citas Logradas" value={aprobadas} icon={CheckCircle} color="#10B981" />
        </div>

        {/* Dynamic Pricing Calculator Card */}
        <div className="panel" style={{ padding: '1.75rem', borderRadius: '16px', marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Calculator size={20} color="#10B981" />
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-1)' }}>Calculador Didáctico de Tarifas Consulares</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', alignItems: 'center' }}>
            <div>
              <label className="input-label">Tipo de Cuenta</label>
              <select className="input-field" value={calcUserType} onChange={e => setCalcUserType(e.target.value)}>
                <option value="agency">Agencia de Viajes (Tarifa Preferencial B2B)</option>
                <option value="natural">Persona Natural (Individual / Familiar)</option>
              </select>
            </div>

            <div>
              <label className="input-label">Rango de Fecha Deseada</label>
              <select className="input-field" value={calcRange} onChange={e => setCalcRange(e.target.value)}>
                <option value="under_month">Dentro del mes actual (Menos de 30 días)</option>
                <option value="over_month">Rango mayor a un mes (&gt; 30 días)</option>
              </select>
            </div>

            <div>
              <label className="input-label">Integrantes en la Cita</label>
              <input 
                type="number" 
                min="1" 
                max="10"
                className="input-field"
                value={calcPeople}
                onChange={e => setCalcPeople(parseInt(e.target.value) || 1)}
              />
            </div>

            <div style={{ background: 'var(--surface-2)', padding: '1rem', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase' }}>Costo Estimado</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--lime)' }}>${calculatePrice()} USD</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── ADMIN & AGENCY EXECUTIVE DASHBOARD ──
  const { total_appointments = 0, total_agencies = 0, total_visa_processes = 0, timeline = [], recent_agencies = [], recent_appointments = [] } = adminStats || {};

  return (
    <div className="animate-in" style={{ paddingBottom: '3rem', background: '#F8FAFC', minHeight: 'calc(100vh - 80px)', margin: '-2rem', padding: '2rem', color: '#0F172A' }}>
      
      {/* ── HEADER Y STATUS EN VIVO ── */}
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontSize: '0.75rem', color: '#3B82F6', letterSpacing: '0.12em', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', animation: 'pulse 2s infinite' }} />
            Centro de Operaciones Global · Nodo Central VPS
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, color: '#0F172A', letterSpacing: '-0.02em' }}>
            Panel de Control Ejecutivo
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => navigate('/dashboard/appointments')} className="btn btn-primary" style={{ background: '#3B82F6', borderRadius: '10px', fontSize: '0.85rem' }}>
            <Zap size={16} /> Crear Agendamiento
          </button>
          <button onClick={() => navigate('/dashboard/documents')} className="btn btn-outline" style={{ borderRadius: '10px', fontSize: '0.85rem', borderColor: '#CBD5E1' }}>
            <FileText size={16} /> Ver Expedientes
          </button>
        </div>
      </div>

      {/* ── KPIS EXECUTIVE CARDS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <StatCard label="Citas en Búsqueda Bot" value={total_appointments} icon={CalendarCheck} color="#3B82F6" badge="Demonio PM2 24/7" />
        <StatCard label="Red de Agencias Activas" value={total_agencies} icon={Users} color="#10B981" badge="Socios B2B" />
        <StatCard label="Expedientes de Visas" value={total_visa_processes} icon={FileText} color="#8B5CF6" badge="Data Room" />
        <StatCard label="Ingresos Estimados" value={total_appointments * 20} isCurrency icon={DollarSign} color="#F59E0B" badge="Facturación B2B" />
      </div>

      {/* ── SECCIÓN 1: CALCULADOR DE TARIFAS DIDÁCTICO PARA AGENCIAS ── */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '1.75rem', marginBottom: '2rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: '10px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calculator size={20} color="#3B82F6" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>Esquema Didáctico de Tarifas & Calculador B2B</h3>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748B' }}>Consulta los precios diferenciados según el rango de fecha del agendamiento y tipo de cuenta.</p>
            </div>
          </div>
        </div>

        {/* Matriz de Precios Explicativa */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
          {/* Card Rango < 1 Mes */}
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1.25rem' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#2563EB', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Zap size={16} /> Agendamientos dentro del mes (&lt; 30 días)
            </div>
            <div style={{ fontSize: '0.82rem', color: '#334155', lineHeight: 1.6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px dashed #E2E8F0' }}>
                <span><strong>Agencias de Viajes:</strong></span>
                <span style={{ color: '#059669', fontWeight: 700 }}>$20 USD + $15/pers extra</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0' }}>
                <span>Persona Natural:</span>
                <span style={{ fontWeight: 600 }}>$60 USD + $10/pers extra</span>
              </div>
            </div>
          </div>

          {/* Card Rango > 1 Mes */}
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1.25rem' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#7C3AED', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Clock size={16} /> Agendamientos a más de un mes (&gt; 30 días)
            </div>
            <div style={{ fontSize: '0.82rem', color: '#334155', lineHeight: 1.6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px dashed #E2E8F0' }}>
                <span><strong>Agencias de Viajes:</strong></span>
                <span style={{ color: '#059669', fontWeight: 700 }}>$15 USD + $13/pers extra</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0' }}>
                <span>Persona Natural:</span>
                <span style={{ fontWeight: 600 }}>$45 USD + $15/pers extra</span>
              </div>
            </div>
          </div>
        </div>

        {/* Simulación en Vivo del Calculador */}
        <div style={{ background: '#F1F5F9', padding: '1.25rem', borderRadius: '12px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'center' }}>
          <div>
            <label className="input-label" style={{ fontSize: '0.75rem', color: '#475569' }}>Tipo de Cliente</label>
            <select className="input-field" value={calcUserType} onChange={e => setCalcUserType(e.target.value)} style={{ background: '#FFF' }}>
              <option value="agency">Agencia de Viajes (B2B)</option>
              <option value="natural">Persona Natural</option>
            </select>
          </div>

          <div>
            <label className="input-label" style={{ fontSize: '0.75rem', color: '#475569' }}>Rango de Cita</label>
            <select className="input-field" value={calcRange} onChange={e => setCalcRange(e.target.value)} style={{ background: '#FFF' }}>
              <option value="under_month">Dentro del mes (&lt; 30 días)</option>
              <option value="over_month">Superior a 1 mes (&gt; 30 días)</option>
            </select>
          </div>

          <div>
            <label className="input-label" style={{ fontSize: '0.75rem', color: '#475569' }}>Personas en la Cita</label>
            <input 
              type="number" 
              min="1" 
              max="10"
              className="input-field"
              value={calcPeople}
              onChange={e => setCalcPeople(parseInt(e.target.value) || 1)}
              style={{ background: '#FFF' }}
            />
          </div>

          <div style={{ background: '#FFFFFF', padding: '0.85rem', borderRadius: '10px', textAlign: 'center', border: '1px solid #CBD5E1' }}>
            <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Costo Total Calculado</span>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#059669' }}>${calculatePrice()} USD</div>
          </div>
        </div>
      </div>

      {/* ── SECCIÓN 2: TENDENCIAS Y ACTIVIDAD DE AGENCIAS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        
        {/* Gráfico Recharts de Tendencia */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '1.5rem' }}>
          <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>Volumen Consular Semanal</h3>
          <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.78rem', color: '#64748B' }}>Flujo de citas procesadas diariamente por los servidores.</p>

          <div style={{ width: '100%', height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeline}>
                <defs>
                  <linearGradient id="colorCitas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ background: '#0F172A', border: 'none', borderRadius: '8px', color: '#FFF', fontSize: '0.8rem' }} />
                <Area type="monotone" dataKey="citas" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorCitas)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lista de Agencias Recientes */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>Agencias Recientes</h3>
            <button onClick={() => navigate('/dashboard/users')} className="btn btn-outline btn-sm" style={{ fontSize: '0.75rem', borderColor: '#E2E8F0' }}>
              Ver Todas
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {recent_agencies.length === 0 ? (
              <div style={{ fontSize: '0.8rem', color: '#94A3B8', fontStyle: 'italic', textAlign: 'center', padding: '2rem' }}>
                No hay agencias registradas aún.
              </div>
            ) : (
              recent_agencies.map(agency => (
                <div key={agency.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: 34, height: 34, borderRadius: '8px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3B82F6', fontWeight: 700, fontSize: '0.85rem' }}>
                      {agency.full_name?.charAt(0) || 'A'}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>{agency.full_name || 'Agencia'}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{agency.email}</div>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.72rem', background: agency.is_authorized ? '#DCFCE7' : '#FEF3C7', color: agency.is_authorized ? '#166534' : '#92400E', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>
                    {agency.is_authorized ? 'AUTORIZADA' : 'PENDIENTE'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* ── TABLA DE ÚLTIMOS AGENDAMIENTOS ── */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>Monitoreo Consular en Vivo</h3>
          <button onClick={() => navigate('/dashboard/appointments')} className="btn btn-outline btn-sm" style={{ fontSize: '0.75rem', borderColor: '#E2E8F0' }}>
            Gestionar Citas
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ width: '100%', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', textAlign: 'left', color: '#64748B' }}>
                <th style={{ padding: '0.75rem' }}>ID</th>
                <th style={{ padding: '0.75rem' }}>Agencia / Usuario</th>
                <th style={{ padding: '0.75rem' }}>Email Portal</th>
                <th style={{ padding: '0.75rem' }}>Consulado</th>
                <th style={{ padding: '0.75rem' }}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {recent_appointments.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#94A3B8', fontStyle: 'italic' }}>
                    No hay agendamientos activos en este momento.
                  </td>
                </tr>
              ) : (
                recent_appointments.map(apt => (
                  <tr key={apt.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>#{apt.id}</td>
                    <td style={{ padding: '0.75rem', fontWeight: 600 }}>{apt.agency_name || 'Agencia'}</td>
                    <td style={{ padding: '0.75rem', color: '#475569' }}>{apt.email}</td>
                    <td style={{ padding: '0.75rem' }}>{apt.consulate || 'Bogotá'}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{ 
                        fontSize: '0.7rem', 
                        padding: '0.2rem 0.5rem', 
                        borderRadius: '4px', 
                        fontWeight: 700,
                        background: ['Adelantada', 'agendado'].includes(apt.status) ? '#DCFCE7' : '#FEF3C7',
                        color: ['Adelantada', 'agendado'].includes(apt.status) ? '#166534' : '#92400E'
                      }}>
                        {apt.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default OverviewPage;
