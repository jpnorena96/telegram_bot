import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router-dom';
import { Save, Check, ShieldOff, CreditCard } from 'lucide-react';
import PlanUpgradeModal from '../../components/PlanUpgradeModal';
import { api } from '../../services/api';

/* ── TOGGLE ── */
const Toggle = ({ id, checked, onChange }) => (
  <button id={id} onClick={() => onChange(!checked)} role="switch" aria-checked={checked}
    style={{ width: '40px', height: '22px', background: checked ? 'var(--lime)' : 'var(--black-5)', border: '1px solid var(--border-2)', padding: 0, cursor: 'pointer', position: 'relative', flexShrink: 0, transition: 'background 0.15s' }}>
    <span style={{ position: 'absolute', width: '14px', height: '14px', background: checked ? 'var(--black)' : 'var(--text-3)', top: '3px', left: checked ? '22px' : '3px', transition: 'left 0.15s' }} />
  </button>
);

/* ── CONFIG ROW ── */
const ConfigRow = ({ k, desc, children }) => (
  <div style={{ display: 'flex', alignItems: 'center', padding: '0.875rem 0', borderBottom: '1px solid var(--border)', gap: '1rem' }}>
    <div style={{ flex: 1 }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-1)', letterSpacing: '0.04em' }}>{k}</div>
      {desc && <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-3)', marginTop: '2px' }}>{desc}</div>}
    </div>
    {children}
  </div>
);

/* ── SECTION ── */
const Section = ({ label, children }) => (
  <div style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
    <div style={{ padding: '0.625rem 1.25rem', borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--lime)' }}>&gt;_ {label}</span>
    </div>
    <div style={{ padding: '0 1.25rem 0.5rem' }}>{children}</div>
  </div>
);

const SettingsPage = () => {
  const { t } = useTranslation();
  const { role, userName } = useOutletContext();
  const isAdmin = role === 'ADMINISTRATOR';

  const [cfg, setCfg] = useState({
    twoFA: true, auditLogs: true,
    emailNotifs: true, telegramNotifs: true,
    appName: 'AdelantaVisa Portal', supportEmail: 'soporte@adelantavisa.com',
  });
  const [saved, setSaved] = useState(false);

  const set = (k, v) => setCfg(c => ({ ...c, [k]: v }));

  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 3000); };

  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [currentPlan, setCurrentPlan] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userId, setUserId] = useState('');

  React.useEffect(() => {
    // Fetch user details to get current plan
    api.getMe().then(res => {
      setCurrentPlan(res.user.subscription_plan || 'Plan Básico (B2C)');
      setUserEmail(res.user.email);
      setUserId(res.user.id);
    }).catch(console.error);
  }, []);

  if (!isAdmin && role !== 'NATURAL_PERSON' && role !== 'VISA_MANAGER' && role !== 'TRAVEL_AGENCY') {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
        <ShieldOff size={32} style={{ color: 'var(--orange)', marginBottom: '1rem' }} />
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--orange)' }}>ACCESO_DENEGADO</div>
      </div>
    );
  }

  return (
    <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '720px' }}>

      {/* ── HEADER ── */}
      <div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-3)', letterSpacing: '0.1em', marginBottom: '4px' }}>
          MÓDULO: {isAdmin ? 'CONFIGURACIÓN_SISTEMA' : 'PERFIL_USUARIO'}
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-1)' }}>
          OPERADOR: <span style={{ color: 'var(--lime)' }}>{userName}</span>
        </div>
      </div>

      {/* Warning for admin */}
      {isAdmin && (
        <div style={{ padding: '0.75rem 1rem', background: 'var(--orange-dim)', border: '1px solid var(--orange)', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--orange)', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <span style={{ fontWeight: 700 }}>⚠ ATENCIÓN:</span>
          Los cambios afectan a TODOS los usuarios del sistema.
        </div>
      )}

      {/* Subscription */}
      {!isAdmin && (
        <Section label="SUSCRIPCIÓN Y PLANES">
          <div style={{ padding: '1rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-1)' }}>PLAN ACTUAL</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--lime)', marginTop: '0.25rem' }}>{currentPlan}</div>
            </div>
            <button onClick={() => setUpgradeModalOpen(true)} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CreditCard size={16} /> Cambiar Plan
            </button>
          </div>
        </Section>
      )}

      {/* Profile */}
      <Section label="PERFIL_OPERADOR">
        <div className="input-group" style={{ marginTop: '0.875rem' }}>
          <label className="input-label">NOMBRE_COMPLETO</label>
          <input className="input-field" defaultValue={userName} />
        </div>
        <div className="input-group">
          <label className="input-label">CORREO_ELECTRÓNICO</label>
          <input className="input-field" type="email" placeholder="tu@correo.com" />
        </div>
      </Section>

      {/* Notifications */}
      <Section label="SISTEMA_NOTIFICACIONES">
        <ConfigRow k="EMAIL_ALERTS" desc="Alertas de citas y actualizaciones por email">
          <Toggle id="emailN" checked={cfg.emailNotifs} onChange={v => set('emailNotifs', v)} />
        </ConfigRow>
        <ConfigRow k="TELEGRAM_ALERTS" desc="Envío de alertas al canal de Telegram">
          <Toggle id="tgN" checked={cfg.telegramNotifs} onChange={v => set('telegramNotifs', v)} />
        </ConfigRow>
      </Section>

      {/* Security — admin only */}
      {isAdmin && (
        <Section label="SEGURIDAD_SISTEMA">
          <ConfigRow k="2FA_ADMINISTRATORS" desc="Requiere autenticación de dos factores">
            <Toggle id="2fa" checked={cfg.twoFA} onChange={v => set('twoFA', v)} />
          </ConfigRow>
          <ConfigRow k="AUDIT_LOGS_DETALLADOS" desc="Registrar todas las acciones de usuarios en logs">
            <Toggle id="audit" checked={cfg.auditLogs} onChange={v => set('auditLogs', v)} />
          </ConfigRow>
          <div style={{ marginTop: '0.5rem' }}>
            <div className="input-group">
              <label className="input-label">APP_NAME</label>
              <input className="input-field" value={cfg.appName} onChange={e => set('appName', e.target.value)} />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">SUPPORT_EMAIL</label>
              <input className="input-field" type="email" value={cfg.supportEmail} onChange={e => set('supportEmail', e.target.value)} />
            </div>
          </div>
        </Section>
      )}

      {/* Action */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
        <button onClick={save} className="btn btn-lime" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: saved ? 0.8 : 1 }}>
          {saved ? <Check size={18} /> : <Save size={18} />}
          {saved ? 'GUARDADO' : 'GUARDAR_CAMBIOS'}
        </button>
      </div>

      <PlanUpgradeModal 
        isOpen={upgradeModalOpen} 
        onClose={() => setUpgradeModalOpen(false)} 
        role={role} 
        userId={userId} 
        email={userEmail} 
        currentPlanName={currentPlan} 
      />
    </div>
  );
};

export default SettingsPage;
