import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, ShieldCheck, CreditCard, ArrowRight, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import toast from 'react-hot-toast';

const PLANS_CLIENT = [
  { name: "Plan Básico (B2C)", price: "$19", priceCOP: 7600000, desc: "Análisis experto y guía documental.", highlight: false, badge: "50% OFF" },
  { name: "Plan Estándar (B2C)", price: "$44", priceCOP: 17800000, desc: "Nuestro plan más popular para adelantar tu cita.", highlight: true, badge: "50% OFF" },
  { name: "Plan Pro (B2C)", price: "$74", priceCOP: 29600000, desc: "Máxima prioridad y preparación.", highlight: false, badge: "50% OFF" }
];

const PLANS_AGENCY = [
  { name: "Plan Start (B2B)", price: "$34", priceCOP: 13800000, desc: "Ideal para agencias empezando.", highlight: true, badge: "50% OFF 3 MESES" },
  { name: "Plan Pro (B2B)", price: "$74", priceCOP: 29600000, desc: "Para agencias establecidas.", highlight: false, badge: "50% OFF 3 MESES" }
];

const PlanUpgradeModal = ({ isOpen, onClose, role, userId, email, currentPlanName }) => {
  const [wompiPubKey, setWompiPubKey] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const availablePlans = role === 'TRAVEL_AGENCY' ? PLANS_AGENCY : PLANS_CLIENT;
  const initialIndex = availablePlans.findIndex(p => p.name === currentPlanName) >= 0 
                       ? availablePlans.findIndex(p => p.name === currentPlanName) 
                       : (role === 'TRAVEL_AGENCY' ? 0 : 1);
                       
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(initialIndex);

  useEffect(() => {
    if (isOpen) {
      if (!document.getElementById('wompi-script')) {
        const script = document.createElement('script');
        script.id = 'wompi-script';
        script.src = 'https://checkout.wompi.co/widget.js';
        script.type = 'text/javascript';
        script.async = true;
        document.body.appendChild(script);
      }
      api.getWompiPublicKey().then(res => setWompiPubKey(res.public_key)).catch(() => setWompiPubKey('pub_test_Q5yDA9xoKdePzhSGeZaQS1mNNqAMxcgw'));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleWompiPayment = () => {
    if (!window.WidgetCheckout) return toast.error('Cargando pasarela de pagos...');
    if (!wompiPubKey) return toast.error('Obteniendo llave de seguridad...');

    const plan = availablePlans[selectedPlanIndex];
    if (plan.name === currentPlanName) return toast.error('Ya posees este plan activo.');

    const checkout = new window.WidgetCheckout({
      currency: 'COP',
      amountInCents: plan.priceCOP,
      reference: `UPGRADE_${userId}_${Date.now()}`,
      publicKey: wompiPubKey,
      redirectUrl: `${window.location.origin}/dashboard/configuracion`,
      customerData: { email: email, fullName: 'Upgrade AdelantaVisa' }
    });

    checkout.open((result) => {
      if (result.transaction.status === 'APPROVED') {
        handleRealPaymentVerify(result.transaction.id, plan.name);
      } else {
        toast.error('El pago no fue aprobado.');
      }
    });
  };

  const handleRealPaymentVerify = async (transactionId, planName) => {
    setLoading(true);
    try {
      const res = await fetch(`${api.url}/payments/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, transaction_id: transactionId, plan_name: planName })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Error verificando pago');
      
      toast.success('¡Plan actualizado con éxito!');
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      toast.error(err.message || 'Error en la verificación del pago');
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyItems: 'center', padding: '1rem', overflowY: 'auto' }}>
      <div className="animate-in" style={{ background: 'var(--surface)', borderRadius: '24px', border: '1px solid var(--border)', width: '100%', maxWidth: '900px', padding: '2.5rem', position: 'relative', margin: 'auto' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', color: 'var(--text-3)', cursor: 'pointer', padding: '0.5rem' }}>
          <X size={24} />
        </button>
        
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-1)' }}>Mejorar Plan</h2>
          <p style={{ color: 'var(--text-3)' }}>Elige el nuevo plan para tu cuenta. Tu plan actual es <strong>{currentPlanName || 'Ninguno'}</strong>.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
          {availablePlans.map((plan, i) => (
            <div 
              key={i} 
              onClick={() => setSelectedPlanIndex(i)}
              style={{ 
                padding: '1.5rem', 
                cursor: 'pointer',
                background: 'var(--bg)',
                borderRadius: '16px',
                border: selectedPlanIndex === i ? '2px solid var(--lime)' : '1px solid var(--border)', 
                transform: selectedPlanIndex === i ? 'scale(1.02)' : 'none', 
                boxShadow: selectedPlanIndex === i ? '0 10px 30px rgba(79, 70, 229, 0.1)' : 'none',
                position: 'relative',
                transition: 'all 0.2s ease',
                opacity: plan.name === currentPlanName ? 0.6 : 1
              }}
            >
              {plan.name === currentPlanName && (
                <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", padding: "4px 12px", borderRadius: 99, fontSize: "0.7rem", fontWeight: 800, background: "var(--text-3)", color: "#fff" }}>
                  PLAN ACTUAL
                </div>
              )}
              {plan.badge && plan.name !== currentPlanName && (
                <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", padding: "4px 12px", borderRadius: 99, fontSize: "0.7rem", fontWeight: 800, background: "var(--lime)", color: "#000" }}>
                  {plan.badge}
                </div>
              )}
              <div style={{ marginBottom: "0.25rem", fontSize: "0.85rem", fontWeight: 700, color: selectedPlanIndex === i ? "var(--lime)" : "var(--text-1)", textTransform: "uppercase" }}>{plan.name}</div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "1rem", color: "var(--text-3)", textDecoration: "line-through", fontWeight: 600 }}>
                  ${parseInt(plan.price.replace('$', '')) * 2}
                </span>
                <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text-1)", lineHeight: 1 }}>{plan.price}</div>
              </div>
              <p style={{ fontSize: "0.8rem", color: "var(--text-3)", minHeight: 40 }}>{plan.desc}</p>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={onClose} className="btn btn-outline" style={{ flex: 1, padding: '1rem' }}>Cancelar</button>
          <button 
            onClick={handleWompiPayment} 
            disabled={loading || availablePlans[selectedPlanIndex].name === currentPlanName}
            className="btn btn-lime" 
            style={{ flex: 2, padding: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <CreditCard size={20} />}
            {availablePlans[selectedPlanIndex].name === currentPlanName ? 'Este es tu plan actual' : `Pagar Upgrade a ${availablePlans[selectedPlanIndex].name}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlanUpgradeModal;
