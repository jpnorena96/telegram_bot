import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { 
  TrendingUp, Users, CalendarCheck, Clock, 
  DollarSign, ArrowUpRight, ArrowDownRight, CreditCard,
  FileText, CheckCircle, Search, Server, ShieldCheck, 
  HelpCircle, Calculator, Zap, Building2, User, ChevronRight, Activity,
  Lock, Sparkles, MessageCircle, AlertCircle
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

const StatCard = ({ label, value, icon: Icon, color = '#3B82F6', badge, onClick }) => (
  <div 
    onClick={onClick}
    style={{ 
      background: '#FFFFFF', 
      border: '1px solid #E2E8F0', 
      borderRadius: '16px', 
      padding: '1.5rem', 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '1rem', 
      position: 'relative', 
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'transform 0.2s, box-shadow 0.2s'
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <p style={{ margin: '0 0 0.5rem 0', color: '#64748B', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
        <h3 style={{ margin: 0, color: '#0F172A', fontSize: '2rem', fontWeight: 800 }}>
          {value}
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
  const [visaProcesses, setVisaProcesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [wompiKey, setWompiKey] = useState('');
  const [adminStats, setAdminStats] = useState(null);
  const [timeFilter, setTimeFilter] = useState('Semana');
  const [flippedCard, setFlippedCard] = useState(null);

  // Interactive Tariff Calculator State for Agencies
  const [calcUserType, setCalcUserType] = useState('agency'); // 'agency' | 'natural'
  const [calcRange, setCalcRange] = useState('under_month'); // 'under_month' | 'over_month'
  const [calcPeople, setCalcPeople] = useState(1);

  const isAdmin = role === 'ADMINISTRATOR' || role === 'AUDITOR';
  const isAgency = role === 'TRAVEL_AGENCY';

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!isAdmin) {
          const [aptData, meData, wompiData, processData] = await Promise.all([
            api.getAppointments().catch(() => []),
            api.getMe().catch(() => ({})),
            api.getWompiPublicKey().catch(() => ({})),
            api.getVisaProcesses().catch(() => [])
          ]);
          setAppointments(aptData || []);
          setProfile(meData || {});
          setWompiKey(wompiData.public_key || '');
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

  // ─────────────────────────────────────────────────────────────────
  // 🏢 1. DASHBOARD PROFESIONAL PARA AGENCIA DE VIAJES (TRAVEL_AGENCY)
  // ─────────────────────────────────────────────────────────────────
  if (isAgency) {
    const totalApts = appointments.length;
    const buscandoApts = appointments.filter(a => ['pending', 'Buscando'].includes(a.status)).length;
    const adelantadasApts = appointments.filter(a => ['Adelantada', 'agendado'].includes(a.status)).length;
    const totalExpedientes = visaProcesses.length;

    // Timeline chart for Agency
    const agencyChartData = [
      { name: 'Lun', citas: 2, adelantadas: 1 },
      { name: 'Mar', citas: 4, adelantadas: 2 },
      { name: 'Mié', citas: 3, adelantadas: 3 },
      { name: 'Jue', citas: 6, adelantadas: 4 },
      { name: 'Vie', citas: 8, adelantadas: 6 },
      { name: 'Sáb', citas: 5, adelantadas: 4 },
      { name: 'Dom', citas: 9, adelantadas: 7 }
    ];

    return (
      <div className="animate-in" style={{ paddingBottom: '3rem', background: '#F8FAFC', minHeight: 'calc(100vh - 80px)', margin: '-2rem', padding: '2rem', color: '#0F172A' }}>
        
        {/* HEADER DE AGENCIA */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem', marginBottom: '2rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#10B981', letterSpacing: '0.12em', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Building2 size={16} /> Portal de Agencia Partner · Marca Blanca
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, color: '#0F172A', letterSpacing: '-0.02em' }}>
              Panel Operativo de Agencia
            </h1>
            <p style={{ margin: '0.2rem 0 0 0', color: '#64748B', fontSize: '0.9rem' }}>
              Hola, <strong style={{ color: '#0F172A' }}>{userName}</strong>. Gestión de citas consulares y expedientes digitales en tiempo real.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={() => navigate('/dashboard/citas')} className="btn btn-primary" style={{ background: '#10B981', borderRadius: '10px', fontSize: '0.85rem' }}>
              <Zap size={16} /> Nuevo Agendamiento
            </button>
            <button onClick={() => navigate('/dashboard/visa-processes')} className="btn btn-outline" style={{ borderRadius: '10px', fontSize: '0.85rem', borderColor: '#CBD5E1' }}>
              <FileText size={16} /> Expedientes Digitales
            </button>
          </div>
        </div>

        {/* METRICS CARDS FOR AGENCY */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
          <StatCard label="Citas en Búsqueda Bot" value={buscandoApts} icon={Search} color="#F59E0B" badge="Scraper 24/7 PM2" onClick={() => navigate('/dashboard/citas')} />
          <StatCard label="Citas Adelantadas Exitosas" value={adelantadasApts} icon={CheckCircle} color="#10B981" badge="Adelantadas" onClick={() => navigate('/dashboard/citas')} />
          <StatCard label="Expedientes de Visas" value={totalExpedientes} icon={FileText} color="#8B5CF6" badge="Data Room" onClick={() => navigate('/dashboard/visa-processes')} />
          <StatCard label="Total Citas Gestionadas" value={totalApts} icon={CalendarCheck} color="#3B82F6" badge="Consular" onClick={() => navigate('/dashboard/citas')} />
        </div>

        {/* ── CALCULADOR Y ESQUEMA DE PRECIOS PARA AGENCIA ── */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '1.75rem', marginBottom: '2rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ width: 36, height: 36, borderRadius: '10px', background: '#ECFEFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Calculator size={20} color="#06B6D4" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>Esquema de Precios y Calculador de Tarifas B2B</h3>
                <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748B' }}>Tarifas preferenciales para tu agencia según el rango de fecha de la cita.</p>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1.25rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#2563EB', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Zap size={16} /> Rango dentro del mes (&lt; 30 días)
              </div>
              <div style={{ fontSize: '0.82rem', color: '#334155', lineHeight: 1.6 }}>
                <div><strong>Tarifa Agencia:</strong> <span style={{ color: '#059669', fontWeight: 700 }}>$20 USD</span> cita base + <span style={{ color: '#059669', fontWeight: 700 }}>$15 USD</span> por persona extra en grupo.</div>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '0.3rem' }}>(Persona Natural paga $60 USD individual + $10 USD por extra).</div>
              </div>
            </div>

            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1.25rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#7C3AED', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Clock size={16} /> Rango mayor a un mes (&gt; 30 días)
              </div>
              <div style={{ fontSize: '0.82rem', color: '#334155', lineHeight: 1.6 }}>
                <div><strong>Tarifa Agencia:</strong> <span style={{ color: '#059669', fontWeight: 700 }}>$15 USD</span> cita base + <span style={{ color: '#059669', fontWeight: 700 }}>$13 USD</span> por persona extra en grupo.</div>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '0.3rem' }}>(Persona Natural paga $45 USD individual + $15 USD en grupo familiar).</div>
              </div>
            </div>
          </div>

          {/* SIMULADOR EN VIVO PARA LA AGENCIA */}
          <div style={{ background: '#F1F5F9', padding: '1.25rem', borderRadius: '12px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'center' }}>
            <div>
              <label className="input-label" style={{ fontSize: '0.75rem', color: '#475569' }}>Rango de Fecha Cita</label>
              <select className="input-field" value={calcRange} onChange={e => setCalcRange(e.target.value)} style={{ background: '#FFF' }}>
                <option value="under_month">Dentro del mes (&lt; 30 días)</option>
                <option value="over_month">Mayor a 1 mes (&gt; 30 días)</option>
              </select>
            </div>

            <div>
              <label className="input-label" style={{ fontSize: '0.75rem', color: '#475569' }}>Integrantes en Grupo</label>
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
              <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Costo para la Agencia</span>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#059669' }}>${calculatePrice()} USD</div>
            </div>
          </div>
        </div>

        {/* TENDENCIAS Y EXPEDIENTES DE AGENCIA */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          
          {/* Gráfico Recharts */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>Progreso de Citas Adelantadas</h3>
            <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.78rem', color: '#64748B' }}>Rendimiento semanal del bot de búsqueda para tus clientes.</p>

            <div style={{ width: '100%', height: 210 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={agencyChartData}>
                  <defs>
                    <linearGradient id="colorAgency" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#0F172A', border: 'none', borderRadius: '8px', color: '#FFF', fontSize: '0.8rem' }} />
                  <Area type="monotone" dataKey="adelantadas" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorAgency)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Expedientes Recientes de la Agencia */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>Expedientes de Visas</h3>
              <button onClick={() => navigate('/dashboard/visa-processes')} className="btn btn-outline btn-sm" style={{ fontSize: '0.75rem', borderColor: '#E2E8F0' }}>
                Ver Todos
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {visaProcesses.length === 0 ? (
                <div style={{ fontSize: '0.8rem', color: '#94A3B8', fontStyle: 'italic', textAlign: 'center', padding: '2rem' }}>
                  No has registrado expedientes de visas aún.
                </div>
              ) : (
                visaProcesses.slice(0, 4).map(proc => (
                  <div key={proc.id} onClick={() => navigate(`/dashboard/visa-processes/${proc.id}`)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: 34, height: 34, borderRadius: '8px', background: '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8B5CF6' }}>
                        <FileText size={18} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>{proc.client_email}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{proc.target_country} ({proc.visa_category})</div>
                      </div>
                    </div>
                    <span style={{ fontSize: '0.7rem', background: proc.status === 'Listo para Revisar' ? '#DCFCE7' : '#FEF3C7', color: proc.status === 'Listo para Revisar' ? '#166534' : '#92400E', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>
                      {proc.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────
  // 👤 2. DASHBOARD SEGUIMIENTO PERSONA NATURAL (NATURAL_PERSON)
  // ─────────────────────────────────────────────────────────────────
  if (!isAdmin) {
    const total = appointments.length;
    const aprobadas = appointments.filter(a => ['Adelantada', 'agendado'].includes(a.status)).length;
    const buscando = appointments.filter(a => ['pending', 'Buscando'].includes(a.status)).length;
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
                <button onClick={() => navigate('/dashboard/billetera')} className="btn btn-lime" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                  Recargar
                </button>
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
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
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────
  // 👑 3. DASHBOARD ADMINISTRADOR RESTAURADO (CENTRO DIDÁCTICO)
  // ─────────────────────────────────────────────────────────────────
  const { timeline, status_distribution } = adminStats || {};
  
  const getStatusCount = (statusKeys) => {
    if (!status_distribution) return 0;
    return status_distribution
      .filter(s => statusKeys.includes(s.status))
      .reduce((acc, curr) => acc + curr.count, 0);
  };
  const countPending = getStatusCount(['pending', 'Buscando']);
  const countSecured = getStatusCount(['agendado', 'Adelantada']);

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
              Dashboard Operativo
            </h1>
            <p style={{ margin: 0, color: '#475569', fontSize: '0.95rem' }}>Métricas en tiempo real del sistema central de reservas.</p>
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
          <div style={{ fontWeight: 700, color: '#3B82F6', fontSize: '0.85rem', paddingRight: '1rem', borderRight: '1px solid #E2E8F0' }}>ACTIVIDAD RECIENTE</div>
          <div className="live-feed-content">
            {adminStats?.recent_appointments?.length > 0 ? (
              adminStats.recent_appointments.map((apt, idx) => (
                <div key={idx} className="live-feed-item">
                  {apt.status === 'agendado' || apt.status === 'Adelantada' ? (
                    <CheckCircle size={14} color="#10B981" />
                  ) : apt.status === 'pending' || apt.status === 'Buscando' ? (
                    <Search size={14} color="#F59E0B" />
                  ) : (
                    <Activity size={14} color="#3B82F6" />
                  )}
                  {apt.status === 'agendado' || apt.status === 'Adelantada' 
                    ? `Cita asegurada para ${apt.email} en ${apt.consulate}`
                    : apt.status === 'pending' || apt.status === 'Buscando'
                    ? `Buscando adelanto para ${apt.email} en ${apt.consulate}`
                    : `Trámite de ${apt.email} actualizado (${apt.status})`}
                </div>
              ))
            ) : (
              <div className="live-feed-item"><Server size={14} color="#94A3B8" /> Esperando actividad del sistema...</div>
            )}
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
              <strong>Operativo:</strong> El motor de reservas procesa múltiples expedientes en paralelo. Los nodos centrales interrogan a los servidores de manera ininterrumpida.
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
                  const dataIndex = (colIndex * heatmapRows + rowIndex) % (timeline?.length || 1);
                  const val = timeline?.[dataIndex]?.citas || 0;
                  return (
                    <div 
                      key={rowIndex} 
                      className={`heatmap-cell ${getHeatmapColor(val)}`} 
                      title={`Nivel de actividad: ${val} citas operadas`}
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
