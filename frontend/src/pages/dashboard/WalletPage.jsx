import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { CreditCard, ShieldCheck, History, ArrowRight, Zap, CheckCircle, AlertCircle, Receipt, ArrowUpRight, ArrowDownRight, Wallet } from 'lucide-react';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

const PACKAGES = [
  { id: '15_usd', name: 'Plan Starter', price: 60000, value: '$15 USD', desc: 'Recarga básica', features: ['1 Cita garantizada', 'Soporte estándar'], highlight: false },
  { id: '50_usd', name: 'Plan Profesional', price: 200000, value: '$50 USD', desc: 'Recomendado para agencias pequeñas', features: ['4 Citas garantizadas', 'Prioridad de escaneo', 'Soporte prioritario'], highlight: true },
  { id: '100_usd', name: 'Plan Enterprise', price: 400000, value: '$100 USD', desc: 'Alto volumen y agencias', features: ['10 Citas garantizadas', 'Máxima prioridad en nodos', 'Asignación de proxy dedicado'], highlight: false }
];

const MOCK_TRANSACTIONS = [
  { id: 'TX-1092', date: '2023-11-15', amount: 200000, status: 'Completado', type: 'Recarga Wompi' },
  { id: 'TX-1085', date: '2023-11-02', amount: 60000, status: 'Completado', type: 'Recarga Wompi' },
  { id: 'TX-1077', date: '2023-10-18', amount: -15000, status: 'Descontado', type: 'Cobro por Cita Exitosa' },
];

const WalletPage = () => {
  const { role, userName } = useOutletContext();
  const [profile, setProfile] = useState(null);
  const [wompiKey, setWompiKey] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedPkg, setSelectedPkg] = useState(PACKAGES[1]);
  const [customAmount, setCustomAmount] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [meData, wompiData] = await Promise.all([
          api.getMe().catch(() => ({})),
          api.getWompiPublicKey().catch(() => ({}))
        ]);
        setProfile(meData || {});
        setWompiKey(wompiData.public_key || '');
        
        // Cargar script de Wompi
        if (!document.getElementById('wompi-script')) {
          const script = document.createElement('script');
          script.id = 'wompi-script';
          script.src = 'https://checkout.wompi.co/widget.js';
          script.type = 'text/javascript';
          script.async = true;
          document.body.appendChild(script);
        }
      } catch (error) {
        console.error("Error loading wallet data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handlePayment = async () => {
    let finalAmount = selectedPkg ? selectedPkg.price : parseInt(customAmount.replace(/\D/g, ''));
    if (!finalAmount || finalAmount < 10000) {
      toast.error('El monto mínimo de recarga es $10.000 COP');
      return;
    }

    if (!window.WidgetCheckout) {
      toast.error('El widget de Wompi no está cargado. Verifique su conexión.');
      return;
    }

    setProcessing(true);

    try {
      const isSandbox = wompiKey?.includes('test');
      
      if (isSandbox) {
        setTimeout(async () => {
          try {
            await api.verifyTopUpPayment({
              transaction_id: `sandbox_${Date.now()}`,
              amount: finalAmount
            });
            toast.success('Recarga completada con éxito');
            const updatedMe = await api.getMe();
            setProfile(updatedMe);
          } catch (e) {
            toast.error(e.message || 'Error al procesar la recarga');
          }
          setProcessing(false);
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
        publicKey: wompiKey,
        customerData: { email: profile?.email }
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
          }).then(async () => {
            toast.success('Recarga exitosa');
            const updatedMe = await api.getMe();
            setProfile(updatedMe);
          }).catch(e => {
            toast.error(e.message || 'Error validando recarga');
          });
        } else {
          toast.error(`Pago no aprobado. Estado: ${tx.status}`);
        }
        setProcessing(false);
      });

    } catch (e) {
      toast.error('Error al iniciar el pago');
      setProcessing(false);
    }
  };

  if (loading) return <div className="spinner" style={{ margin: '4rem auto' }} />;

  return (
    <div className="animate-in" style={{ paddingBottom: '3rem', maxWidth: '1200px', margin: '0 auto' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', fontWeight: 800, margin: '0 0 0.5rem 0', color: 'var(--text-1)' }}>
            Billetera & Facturación
          </h1>
          <p style={{ margin: 0, color: 'var(--text-2)', fontSize: '0.95rem' }}>
            Gestiona tu saldo, recargas y revisa el historial financiero de tu cuenta.
          </p>
        </div>
        <div style={{ background: 'var(--surface)', padding: '0.75rem 1.25rem', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981' }}>
            <Wallet size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase' }}>Saldo Disponible</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-1)', fontFamily: 'var(--font-heading)' }}>
              {profile?.balance || 0} <span style={{ fontSize: '0.85rem', fontWeight: 400, color: 'var(--text-2)' }}>Crédito(s)</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', alignItems: 'start' }}>
        
        {/* Lado Izquierdo: Planes de Recarga */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 1.5rem 0', color: 'var(--text-1)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Zap size={20} color="var(--lime)" /> Adquirir Créditos (Recarga Rápida)
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
              {PACKAGES.map(pkg => (
                <div 
                  key={pkg.id} 
                  onClick={() => { setSelectedPkg(pkg); setCustomAmount(''); }}
                  style={{ 
                    padding: '1.5rem', 
                    border: `2px solid ${selectedPkg?.id === pkg.id ? 'var(--lime)' : 'var(--border)'}`,
                    borderRadius: '12px',
                    cursor: 'pointer',
                    background: selectedPkg?.id === pkg.id ? 'var(--bg)' : 'var(--surface)',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    boxShadow: selectedPkg?.id === pkg.id ? '0 10px 25px -5px rgba(0,0,0,0.1)' : 'none'
                  }}
                >
                  {pkg.highlight && (
                    <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'var(--lime)', color: '#000', fontSize: '0.7rem', fontWeight: 800, padding: '4px 12px', borderRadius: '20px', letterSpacing: '0.05em' }}>
                      MÁS POPULAR
                    </div>
                  )}
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-1)', margin: '0 0 0.5rem 0' }}>{pkg.name}</h3>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-1)', margin: '0 0 0.5rem 0', fontFamily: 'var(--font-heading)' }}>
                    ${(pkg.price/1000).toFixed(0)}k <span style={{fontSize: '0.9rem', color: 'var(--text-3)', fontWeight: 500}}>COP</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-2)', marginBottom: '1.25rem' }}>{pkg.desc}</div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                    {pkg.features.map((feature, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-2)' }}>
                        <CheckCircle size={14} color="var(--lime)" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', gap: '1.5rem', alignItems: 'flex-end', padding: '1.5rem', background: 'var(--bg)', borderRadius: '12px', border: '1px dashed var(--border-2)' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-2)', marginBottom: '0.5rem' }}>Personalizado (Monto en COP)</label>
                <input 
                  type="number"
                  className="input-field"
                  placeholder="Ej: 150000"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    setSelectedPkg(null);
                  }}
                  style={{ background: 'var(--surface)', fontSize: '1.1rem', fontWeight: 600 }}
                />
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-3)', paddingBottom: '0.6rem' }}>
                Mínimo $10,000 COP
              </div>
            </div>
          </div>
        </div>

        {/* Lado Derecho: Resumen y Pagar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 1.25rem 0', color: 'var(--text-1)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Receipt size={18} color="var(--text-2)" /> Resumen de Transacción
            </h3>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.9rem', color: 'var(--text-2)' }}>
              <span>Subtotal</span>
              <span>{selectedPkg ? `$${(selectedPkg.price).toLocaleString()} COP` : (customAmount ? `$${parseInt(customAmount).toLocaleString()} COP` : '$0 COP')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem', fontSize: '0.9rem', color: 'var(--text-2)' }}>
              <span>Cargos por Servicio Wompi</span>
              <span>$0 COP</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderTop: '1px dashed var(--border-2)', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-1)' }}>Total a Pagar</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-1)', fontFamily: 'var(--font-heading)' }}>
                {selectedPkg ? `$${(selectedPkg.price).toLocaleString()} COP` : (customAmount ? `$${parseInt(customAmount).toLocaleString()} COP` : '$0 COP')}
              </span>
            </div>

            <button 
              className="btn btn-lime" 
              style={{ width: '100%', padding: '1.1rem', fontSize: '1.05rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', fontWeight: 700, borderRadius: '10px' }}
              onClick={handlePayment}
              disabled={processing || (!selectedPkg && !customAmount)}
            >
              {processing ? 'Procesando...' : <><CreditCard size={20} /> Proceder al Pago Seguro</>}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem', color: 'var(--text-3)', fontSize: '0.75rem' }}>
              <ShieldCheck size={14} /> Transacción encriptada por Wompi Bancolombia
            </div>
          </div>

          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 1.25rem 0', color: 'var(--text-1)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <History size={18} color="var(--text-2)" /> Actividad Reciente
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {MOCK_TRANSACTIONS.map(tx => (
                <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid var(--border-2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '8px', background: tx.amount > 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: tx.amount > 0 ? '#10B981' : '#EF4444' }}>
                      {tx.amount > 0 ? <ArrowDownRight size={16} /> : <ArrowUpRight size={16} />}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-1)' }}>{tx.type}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{tx.date} · {tx.id}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: tx.amount > 0 ? '#10B981' : '#0F172A' }}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
            <button style={{ background: 'transparent', border: 'none', color: 'var(--lime)', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', padding: '0', marginTop: '1rem' }}>
              Ver todo el historial <ArrowRight size={14} />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default WalletPage;
