import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, CheckCircle2, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import logoImg from '../assets/Logo.jpeg';

const PLANS_CLIENT = [
  {
    name: "Plan Básico (B2C)", price: "$19", priceCOP: 7600000, desc: "Análisis experto y guía documental.", highlight: false, badge: "50% OFF",
    features: ["Análisis de perfil DS-160", "Revisión experta de respuestas", "Guía de entrevista consular", "Soporte vía chat"]
  },
  {
    name: "Plan Estándar (B2C)", price: "$44", priceCOP: 17800000, desc: "Nuestro plan más popular para adelantar tu cita.", highlight: true, badge: "50% OFF",
    features: ["Todo del plan Básico", "Cita en menos de 3 meses", "Bot rastreador 24/7", "Alertas SMS / Email en vivo", "Prioridad en agendamiento"]
  },
  {
    name: "Plan Pro (B2C)", price: "$74", priceCOP: 29600000, desc: "Máxima prioridad y preparación.", highlight: false, badge: "50% OFF",
    features: ["Todo del plan Estándar", "Cita garantizada < 30 días", "Motor de rastreo VIP", "Simulacro de entrevista (1h)", "Atención telefónica dedicada"]
  }
];

const PLANS_AGENCY = [
  {
    name: "Plan Start (B2B)", price: "$34", priceCOP: 13800000, desc: "Ideal para agencias empezando.", highlight: true, badge: "50% OFF 3 MESES",
    features: ["Portal Marca Blanca (White-label)", "Hasta 50 clientes simultáneos", "Dashboard de monitoreo global", "Notificaciones B2C automáticas", "Soporte técnico estándar"]
  },
  {
    name: "Plan Pro (B2B)", price: "$74", priceCOP: 29600000, desc: "Para agencias establecidas.", highlight: false, badge: "50% OFF 3 MESES",
    features: ["Todo en Agencia Starter", "Clientes y perfiles ilimitados", "Adelanto VIP (máxima prioridad)", "Dominio personalizado (CNAME)", "Ejecutivo de cuenta exclusivo"]
  }
];

const CheckoutPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const userId = searchParams.get('user_id');
  const role = searchParams.get('role');
  const email = searchParams.get('email');
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [wompiPubKey, setWompiPubKey] = useState(null);
  
  const availablePlans = role === 'TRAVEL_AGENCY' ? PLANS_AGENCY : PLANS_CLIENT;
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(role === 'TRAVEL_AGENCY' ? 0 : 1);

  useEffect(() => {
    if (!userId || !role) {
      navigate('/login');
      return;
    }
    
    // Dynamically load Wompi script
    if (!document.getElementById('wompi-script')) {
      const script = document.createElement('script');
      script.id = 'wompi-script';
      script.src = 'https://checkout.wompi.co/widget.js';
      script.type = 'text/javascript';
      script.async = true;
      document.body.appendChild(script);
    }

    api.getWompiPublicKey().then(res => {
      setWompiPubKey(res.public_key);
    }).catch(() => {
      setWompiPubKey('pub_test_Q5yDA9xoKdePzhSGeZaQS1mNNqAMxcgw');
    });
  }, [userId, role, navigate]);

  const handleWompiPayment = async () => {
    if (!window.WidgetCheckout) {
      toast.error('Cargando pasarela de pagos. Por favor, intenta de nuevo en unos segundos.');
      return;
    }
    if (!wompiPubKey) {
      toast.error('Obteniendo llave de seguridad...');
      return;
    }

    const plan = availablePlans[selectedPlanIndex];
    const ref = `ADELANTAVISA_${userId}_${Date.now()}`;
    const amountInCents = plan.priceCOP;

    let signatureData = null;
    try {
      const sigRes = await api.getWompiSignature({
        reference: ref,
        amountInCents: amountInCents,
        currency: 'COP'
      });
      if (sigRes && sigRes.signature) {
        signatureData = { integrity: sigRes.signature };
      }
    } catch (e) {
      console.error("Signature fetch failed", e);
    }

    const config = {
      currency: 'COP',
      amountInCents: amountInCents,
      reference: ref,
      publicKey: wompiPubKey,
      redirectUrl: `${window.location.origin}/checkout?user_id=${userId}&role=${role}&email=${email}`,
      customerData: { email: email, fullName: 'Cliente AdelantaVisa' }
    };

    if (signatureData) {
      config.signature = signatureData;
    }

    const checkout = new window.WidgetCheckout(config);

    checkout.open((result) => {
      const transaction = result.transaction;
      if (transaction.status === 'APPROVED') {
        handleRealPaymentVerify(transaction.id, plan.name);
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
        body: JSON.stringify({
          user_id: userId,
          transaction_id: transactionId,
          plan_name: planName
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Error verificando pago');
      
      toast.success('Pago completado con éxito. Redirigiendo...');
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      toast.error(err.message || 'Error en la verificación del pago');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', color: 'var(--text-1)' }}>
        <div className="panel animate-in" style={{ padding: '3rem', textAlign: 'center', maxWidth: '400px' }}>
          <CheckCircle2 size={64} style={{ color: 'var(--lime)', margin: '0 auto 1.5rem' }} />
          <h2 style={{ marginBottom: '1rem', fontWeight: 800 }}>¡Pago Exitoso!</h2>
          <p style={{ color: 'var(--text-3)', marginBottom: '2rem' }}>Tu suscripción ha sido activada correctamente.</p>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-2)' }}>Redirigiendo al inicio de sesión...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text-1)', padding: '2rem' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.2rem', fontWeight: 800 }}>
            <img src={logoImg} alt="AdelantaVisa" style={{ height: '32px', width: 'auto', borderRadius: '4px' }} />
          </div>
          <Link to="/login" style={{ color: 'var(--text-3)', textDecoration: 'none', fontSize: '0.9rem' }}>Volver al login</Link>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.5rem)', fontWeight: 800, marginBottom: '1rem' }}>Selecciona tu Plan</h1>
          <p style={{ color: 'var(--text-3)', fontSize: '1.1rem' }}>Elige el plan que mejor se adapte a tus necesidades para activar tu cuenta.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
          {availablePlans.map((plan, i) => (
            <div 
              key={i} 
              onClick={() => setSelectedPlanIndex(i)}
              className="panel" 
              style={{ 
                padding: '2.5rem', 
                cursor: 'pointer',
                border: selectedPlanIndex === i ? '2px solid var(--lime)' : '1px solid var(--border)', 
                transform: selectedPlanIndex === i ? 'scale(1.02)' : 'none', 
                boxShadow: selectedPlanIndex === i ? '0 20px 40px rgba(79, 70, 229, 0.15)' : 'none',
                position: 'relative',
                transition: 'all 0.3s ease'
              }}
            >
              {plan.badge && (
                <div style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", padding: "4px 16px", borderRadius: 99, fontSize: "0.75rem", fontWeight: 800, letterSpacing: "0.06em", background: "var(--lime)", color: "#000", whiteSpace: "nowrap" }}>
                  {plan.badge}
                </div>
              )}
              <div style={{ marginBottom: "0.5rem", fontSize: "0.9rem", fontWeight: 700, color: selectedPlanIndex === i ? "var(--lime)" : "var(--text-1)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{plan.name}</div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "1.1rem", color: "var(--text-3)", textDecoration: "line-through", fontWeight: 600 }}>
                  ${parseInt(plan.price.replace('$', '')) * 2}
                </span>
                <div style={{ display: "flex", alignItems: "flex-end", gap: "0.3rem" }}>
                  <div style={{ fontSize: "2.5rem", fontWeight: 800, color: "var(--text-1)", lineHeight: 1 }}>{plan.price}</div>
                  <div style={{ fontSize: "0.875rem", color: "var(--text-3)", marginBottom: "0.4rem", fontWeight: 500, textTransform: "uppercase" }}>/ {role === 'TRAVEL_AGENCY' ? 'mes' : 'persona'}</div>
                </div>
              </div>
              <p style={{ fontSize: "0.95rem", color: "var(--text-2)", marginBottom: "2rem", minHeight: 48 }}>{plan.desc}</p>
              
              <ul style={{ listStyle: "none", padding: 0, margin: 0, flex: 1 }}>
                {plan.features.map((f, j) => (
                  <li key={j} style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem", alignItems: "flex-start" }}>
                    <CheckCircle2 size={18} color={selectedPlanIndex === i ? "var(--lime)" : "var(--text-3)"} style={{ flexShrink: 0, marginTop: 2 }} />
                    <span style={{ color: "var(--text-2)", fontSize: "0.9rem" }}>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', padding: '2rem', background: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--border)', maxWidth: '600px', margin: '0 auto' }}>
          <ShieldCheck size={32} style={{ color: 'var(--lime)', margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Pago Seguro con Wompi</h3>
          <p style={{ color: 'var(--text-3)', fontSize: '0.9rem', marginBottom: '2rem' }}>
            Tu pago será procesado de forma 100% segura. Total a pagar hoy: 
            <span style={{ marginLeft: '0.5rem', fontSize: '1rem', color: 'var(--text-3)', textDecoration: 'line-through' }}>
              ${(availablePlans[selectedPlanIndex].priceCOP * 2 / 100).toLocaleString()} COP
            </span>
            <strong style={{ color: 'var(--text-1)', marginLeft: '0.5rem', fontSize: '1.2rem' }}>
              ${(availablePlans[selectedPlanIndex].priceCOP / 100).toLocaleString()} COP
            </strong>
          </p>
          <button 
            onClick={handleWompiPayment} 
            disabled={loading}
            className="btn btn-lime" 
            style={{ width: '100%', padding: '1.25rem', fontSize: '1.1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem' }}
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <ArrowRight size={20} />}
            {loading ? 'Verificando pago...' : 'Pagar Suscripción Ahora'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
