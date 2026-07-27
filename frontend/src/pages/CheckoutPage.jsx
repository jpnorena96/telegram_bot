import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Globe, ArrowRight, ShieldCheck, CreditCard, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import toast from 'react-hot-toast';

const CheckoutPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const userId = searchParams.get('user_id');
  const role = searchParams.get('role');
  const email = searchParams.get('email');
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Use Production Key from env if available, otherwise sandbox
  const WOMPI_PUB_KEY = import.meta.env.VITE_WOMPI_PUB_KEY || 'pub_test_Q5yDA9xoKdePzhSGeZaQS1mNNqAMxcgw';

  useEffect(() => {
    if (!userId || !role) {
      navigate('/login');
    }
  }, [userId, role, navigate]);

  const planName = role === 'TRAVEL_AGENCY' ? 'Plan Start (B2B)' : 'Plan Estándar (B2C)';
  const planPrice = role === 'TRAVEL_AGENCY' ? 6900 : 8900; 
  const priceCOP = role === 'TRAVEL_AGENCY' ? 27600000 : 35600000; // in cents (COP) -> 276,000 COP

  const handleWompiPayment = () => {
    // Wompi Widget Integration
    const checkout = new window.WidgetCheckout({
      currency: 'COP',
      amountInCents: priceCOP,
      reference: `ADELANTAVISA_${userId}_${Date.now()}`,
      publicKey: WOMPI_PUB_KEY,
      redirectUrl: `${window.location.origin}/checkout?user_id=${userId}&role=${role}&email=${email}`,
      customerData: {
        email: email,
        fullName: 'Cliente AdelantaVisa'
      }
    });

    checkout.open((result) => {
      const transaction = result.transaction;
      if (transaction.status === 'APPROVED') {
        // Send to backend
        handleRealPaymentVerify(transaction.id);
      } else {
        toast.error('El pago no fue aprobado.');
      }
    });
  };

  const handleRealPaymentVerify = async (transactionId) => {
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
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFakePayment = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${api.url}/payments/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          transaction_id: 'sandbox_' + Math.random().toString(36).substring(7),
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
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-2)' }}>
        <div className="panel" style={{ textAlign: 'center', padding: '3rem', maxWidth: '400px' }}>
          <CheckCircle2 size={48} style={{ color: 'var(--green)', margin: '0 auto 1.5rem' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>¡Pago Exitoso!</h2>
          <p style={{ color: 'var(--text-2)' }}>Tu cuenta ha sido activada. Redirigiendo al inicio de sesión...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--surface-2)' }}>
      {/* ── Add Wompi Script ── */}
      <script src="https://checkout.wompi.co/widget.js" type="text/javascript"></script>
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', marginBottom: '2rem' }} onClick={() => navigate('/')}>
          <Globe size={28} color="var(--lime)" strokeWidth={2.5} />
          <span style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--text-1)' }}>
            AdelantaVisa
          </span>
        </div>

        <div className="panel" style={{ width: '100%', maxWidth: '450px', padding: '2.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--text-1)', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
              Finalizar Suscripción
            </h1>
            <p style={{ color: 'var(--text-2)', fontSize: '0.95rem' }}>
              Para acceder a tu panel y crear expedientes, necesitas activar tu plan.
            </p>
          </div>

          <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <span className="tag tag-lime">{planName}</span>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-3)', marginTop: '0.5rem', fontFamily: 'var(--font-mono)' }}>
                  Usuario: {email}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-1)' }}>
                  ${priceCOP / 100000} <span style={{ fontSize: '0.9rem', color: 'var(--text-3)', fontWeight: 500 }}>k COP</span>
                </div>
              </div>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-2)' }}>
                <ShieldCheck size={16} color="var(--lime)" /> Acceso completo al Dashboard
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-2)' }}>
                <ShieldCheck size={16} color="var(--lime)" /> Gestión de documentos
              </li>
            </ul>
          </div>

          <button 
            onClick={WOMPI_PUB_KEY.includes('test') ? handleFakePayment : handleWompiPayment} 
            disabled={loading}
            className="btn btn-lime" 
            style={{ width: '100%', padding: '1rem', fontSize: '1rem', display: 'flex', justifyContent: 'center' }}
          >
            {loading ? 'Procesando...' : (
              <>
                <CreditCard size={18} /> Pagar con Wompi {WOMPI_PUB_KEY.includes('test') && '(Simulación)'}
              </>
            )}
          </button>
          
          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <Link to="/login" style={{ fontSize: '0.85rem', color: 'var(--text-3)', fontWeight: 500 }}>
              ← Volver al Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
