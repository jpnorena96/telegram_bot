import React, { useState, useEffect } from 'react';
import { Shield, Check, X, ShieldAlert, Activity, Cpu, Fingerprint, Lock, ShieldCheck, MailWarning } from 'lucide-react';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

const AdminAgenciesPage = () => {
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAgencies = async () => {
    try {
      const res = await api.getAdminAgencies();
      setAgencies(res.agencies || []);
    } catch (e) {
      toast.error('Error al cargar agencias');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgencies();
  }, []);

  const handleStatus = async (id, status) => {
    try {
      await api.updateAdminAgencyStatus(id, status);
      toast.success(`Red actualizada: Agencia ${status === 'approved' ? 'Aprovisionada' : 'Bloqueada'}`);
      fetchAgencies();
    } catch (e) {
      toast.error('Error al actualizar estado en la red');
    }
  };

  // ── Inteligencia Simulada ──
  const getIntelligence = (email, status) => {
    let score = 50;
    let tags = [];
    const domain = email.split('@')[1] || '';
    const isFree = ['gmail.com', 'hotmail.com', 'yahoo.com', 'outlook.com'].includes(domain.toLowerCase());

    if (!isFree) {
      score += 35;
      tags.push({ label: 'CORP_DOMAIN', type: 'tag-safe' });
    } else {
      score -= 10;
      tags.push({ label: 'FREE_EMAIL', type: 'tag-warn' });
    }

    if (status === 'approved') {
      score = 99;
      tags.push({ label: 'AUTHORIZED', type: 'tag-safe' });
    } else if (status === 'rejected') {
      score = 12;
      tags.push({ label: 'BLOCKED', type: 'tag-danger' });
    } else {
      tags.push({ label: 'PENDING_REVIEW', type: 'tag-warn' });
    }

    // Color computation for the ring
    const color = score >= 80 ? '#10B981' : score >= 50 ? '#F59E0B' : '#EF4444';

    return { score, tags, color, isFree };
  };

  if (loading) return <div className="spinner" style={{ margin: '3rem auto' }} />;

  return (
    <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* ── COMMAND CENTER HEADER ── */}
      <div style={{ padding: '2rem', background: '#09090B', borderRadius: 'var(--radius-lg)', color: '#FFFFFF', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: '-10%', top: '-50%', opacity: 0.05, transform: 'scale(2)' }}>
          <ShieldAlert size={400} />
        </div>
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}>
            <Activity size={32} color="#10B981" />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#A1A1AA', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>
              SECURE SYSTEM // ADMINISTRATION
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em', color: '#FFFFFF' }}>
              Network Onboarding
            </h1>
            <p style={{ color: '#A1A1AA', fontSize: '0.95rem', marginTop: '0.5rem', maxWidth: '600px' }}>
              Centro de Inteligencia y Cumplimiento (Due Diligence). Evalúe el riesgo de los nodos solicitantes antes de aprovisionarles acceso a la infraestructura de Marca Blanca.
            </p>
          </div>
        </div>
      </div>

      {/* ── INTELLIGENCE GRID ── */}
      {agencies.length === 0 ? (
        <div className="panel" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-3)' }}>
          <Cpu size={48} style={{ opacity: 0.3, margin: '0 auto 1rem auto' }} />
          <p>La red no reporta solicitudes entrantes de nuevas agencias.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {agencies.map(a => {
            const intel = getIntelligence(a.email, a.status);
            return (
              <div key={a.id} className="risk-card">
                
                {/* Header (Status & Trust Score) */}
                <div className="risk-card-header">
                  <div>
                    <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-1)' }}>
                      {a.company_name}
                    </h3>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
                      {a.email}
                    </div>
                  </div>
                  
                  {/* Circular Score */}
                  <div className="trust-score-wrapper" style={{ '--score-pct': `${intel.score}%`, '--score-color': intel.color }}>
                    <div className="trust-score-inner">
                      <span className="trust-score-val">{intel.score}</span>
                      <span className="trust-score-label">TRUST</span>
                    </div>
                  </div>
                </div>

                {/* Body (Fingerprint & Tags) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {intel.tags.map((t, i) => (
                      <span key={i} className={`security-tag ${t.type}`}>
                        {t.type === 'tag-warn' && <MailWarning size={10} />}
                        {t.type === 'tag-safe' && <ShieldCheck size={10} />}
                        {t.type === 'tag-danger' && <Lock size={10} />}
                        {t.label}
                      </span>
                    ))}
                  </div>

                  <div className="brand-fingerprint">
                    <div style={{ background: a.brand_color, width: 32, height: 32, borderRadius: '6px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}></div>
                    <div>
                      <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-3)', fontWeight: 700, letterSpacing: '0.05em' }}>Brand Fingerprint</div>
                      <div style={{ fontSize: '0.9rem', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-1)' }}>Alias: {a.alias}</div>
                    </div>
                    <Fingerprint size={24} style={{ marginLeft: 'auto', color: 'var(--text-3)', opacity: 0.5 }} />
                  </div>

                </div>

                {/* Actions Terminal */}
                <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.5rem' }}>
                  {a.status !== 'approved' && (
                    <button onClick={() => handleStatus(a.id, 'approved')} className="btn btn-primary btn-terminal" style={{ background: '#059669', color: '#fff' }}>
                      <Check size={14} /> Authorize
                    </button>
                  )}
                  {a.status !== 'rejected' && (
                    <button onClick={() => handleStatus(a.id, 'rejected')} className="btn btn-outline btn-terminal" style={{ color: '#DC2626', borderColor: 'rgba(220,38,38,0.3)', background: 'rgba(220,38,38,0.05)' }}>
                      <X size={14} /> Block
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminAgenciesPage;
