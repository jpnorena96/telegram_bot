import React, { useState } from 'react';
import { CreditCard, X, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import toast from 'react-hot-toast';

const PACKAGES = [
  { id: '15_usd', name: '$15 USD', price: 60000, desc: 'Recarga mínima', highlight: false },
  { id: '50_usd', name: '$50 USD', price: 200000, desc: 'Recomendado', highlight: true },
  { id: '100_usd', name: '$100 USD', price: 400000, desc: 'Ideal agencias', highlight: false }
];

const TopUpModal = ({ isOpen, onClose, wompiPubKey, email, onTopUpSuccess }) => {
  const [selectedPkg, setSelectedPkg] = useState(PACKAGES[0]);
  const [loading, setLoading] = useState(false);
  const [customAmount, setCustomAmount] = useState('');

  React.useEffect(() => {
    if (isOpen) {
      if (!document.getElementById('wompi-script')) {
        const script = document.createElement('script');
        script.id = 'wompi-script';
        script.src = 'https://checkout.wompi.co/widget.js';
        script.type = 'text/javascript';
        script.async = true;
        document.body.appendChild(script);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePayment = async () => {
    let finalAmount = selectedPkg ? selectedPkg.price : parseInt(customAmount.replace(/\D/g, ''));
    if (!finalAmount || finalAmount < 10000) {
      toast.error('El monto mínimo de recarga es $10.000 COP');
      return;
    }

    if (!window.WidgetCheckout) {
      toast.error('El widget de Wompi no está cargado');
      return;
    }

    setLoading(true);

    try {
      const isSandbox = wompiPubKey?.includes('test');
      
      if (isSandbox) {
        // Fake payment for sandbox if Wompi is not fully setup
        setTimeout(async () => {
          try {
            await api.verifyTopUpPayment({
              transaction_id: `sandbox_${Date.now()}`,
              amount: finalAmount
            });
            toast.success('Recarga completada con éxito');
            onTopUpSuccess();
            onClose();
          } catch (e) {
            toast.error(e.message || 'Error al procesar la recarga');
          }
          setLoading(false);
        }, 1500);
        return;
      }

      const ref = `topup_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const amountInCents = Math.floor(finalAmount * 100);
      
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
        customerData: { email }
      };
      
      if (signatureData) {
        config.signature = signatureData;
      }
      
      const checkout = new window.WidgetCheckout(config);

      checkout.open((result) => {
        const tx = result.transaction;
        if (tx.status === 'APPROVED') {
          api.verifyTopUpPayment({
            transaction_id: tx.id,
            amount: finalAmount
          }).then(() => {
            toast.success('Recarga exitosa');
            onTopUpSuccess();
            onClose();
          }).catch(e => {
            toast.error(e.message || 'Error validando recarga');
          });
        } else {
          toast.error(`Pago no aprobado. Estado: ${tx.status}`);
        }
        setLoading(false);
      });

    } catch (e) {
      toast.error('Error al iniciar el pago');
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div className="animate-in" style={{ background: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--border)', width: '100%', maxWidth: '500px', padding: '2rem', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'var(--text-3)', cursor: 'pointer' }}>
          <X size={20} />
        </button>
        
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          Recargar Balance
        </h2>
        <p style={{ color: 'var(--text-2)', fontSize: '0.95rem', marginBottom: '2rem' }}>
          Adquiere saldo para poder adelantar tus citas. Selecciona un paquete o ingresa un monto.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          {PACKAGES.map(pkg => (
            <div 
              key={pkg.id} 
              onClick={() => { setSelectedPkg(pkg); setCustomAmount(''); }}
              style={{ 
                padding: '1.25rem', 
                border: `2px solid ${selectedPkg?.id === pkg.id ? 'var(--lime)' : 'var(--border)'}`,
                borderRadius: '12px',
                cursor: 'pointer',
                background: selectedPkg?.id === pkg.id ? 'rgba(163, 230, 53, 0.05)' : 'var(--bg)',
                transition: 'all 0.2s',
                position: 'relative'
              }}
            >
              {pkg.highlight && (
                <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', background: 'var(--lime)', color: '#fff', fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '12px' }}>
                  RECOMENDADO
                </div>
              )}
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-1)', marginBottom: '0.25rem' }}>{pkg.name}</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-1)', marginBottom: '0.25rem' }}>${(pkg.price/1000).toFixed(0)}k <span style={{fontSize: '0.8rem', color: 'var(--text-3)', fontWeight: 400}}>COP</span></div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-2)' }}>{pkg.desc}</div>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-2)', marginBottom: '0.5rem' }}>Otro monto (opcional)</label>
          <input 
            type="number"
            className="input"
            placeholder="Ej: 80000"
            value={customAmount}
            onChange={(e) => {
              setCustomAmount(e.target.value);
              setSelectedPkg(null);
            }}
          />
        </div>

        <button 
          className="btn btn-lime" 
          style={{ width: '100%', padding: '1rem', display: 'flex', justifyContent: 'center', fontSize: '1rem' }}
          onClick={handlePayment}
          disabled={loading || (!selectedPkg && !customAmount)}
        >
          {loading ? 'Procesando...' : <><CreditCard size={18} /> Pagar con Wompi</>}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', justifyContent: 'center', color: 'var(--text-3)', fontSize: '0.85rem' }}>
          <AlertCircle size={14} /> Los pagos son procesados de forma segura por Wompi
        </div>
      </div>
    </div>
  );
};

export default TopUpModal;
