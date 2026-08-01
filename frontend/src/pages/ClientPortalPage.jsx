import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/api';
import toast from 'react-hot-toast';

const ClientPortalPage = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    full_name: '',
    passport_number: ''
  });
  const [passportFile, setPassportFile] = useState(null);
  const [ds160File, setDs160File] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${api.url}/visa-processes/public/${id}`);
        if (res.ok) {
          setData(await res.json());
        } else {
          toast.error('Expediente no válido o expirado');
        }
      } catch (e) {
        toast.error('Error cargando el portal');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!passportFile) {
      toast.error('Debe adjuntar su pasaporte');
      return;
    }
    setSubmitting(true);
    try {
      const payload = new FormData();
      payload.append('full_name', formData.full_name);
      payload.append('passport_number', formData.passport_number);
      payload.append('passport_file', passportFile);
      if (ds160File) payload.append('ds160_file', ds160File);

      const res = await fetch(`${api.url}/visa-processes/public/${id}/submit`, {
        method: 'POST',
        body: payload
      });

      if (res.ok) {
        setSuccess(true);
      } else {
        toast.error('Error al enviar documentos');
      }
    } catch (e) {
      toast.error('Error de conexión');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg)' }}>Cargando portal seguro...</div>;

  if (!data) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg)', color: 'var(--text-1)' }}><h2>Este enlace no es válido</h2></div>;

  if (success) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg)', color: 'var(--text-1)', textAlign: 'center', padding: '2rem' }}>
        <div style={{ width: '80px', height: '80px', background: 'var(--lime)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem' }}>¡Documentos Recibidos!</h1>
        <p style={{ color: 'var(--text-2)', maxWidth: '400px' }}>Su agencia ya ha sido notificada y procesará su solicitud de visa para {data.target_country}.</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '2rem 1rem', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
      <div style={{ maxWidth: '600px', width: '100%', background: 'var(--surface)', padding: '2rem', borderRadius: '24px', border: '1px solid var(--border)' }}>
        
        {/* Agency Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid var(--border)' }}>
          {data.agency_logo ? (
            <img src={`${api.API_URL.replace('/api', '')}${data.agency_logo}`} alt="Agency Logo" style={{ height: '80px', objectFit: 'contain', marginBottom: '1rem' }} />
          ) : (
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', fontSize: '2rem' }}>🏢</div>
          )}
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-1)' }}>{data.agency_name}</h2>
          <p style={{ color: 'var(--text-3)' }}>Portal Seguro de Trámite de Visa</p>
        </div>

        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <span className="tag tag-lime" style={{ marginBottom: '1rem' }}>Trámite: {data.target_country} - {data.visa_category}</span>
          <p style={{ color: 'var(--text-2)', fontSize: '0.9rem', marginTop: '1rem' }}>Por favor complete sus datos y adjunte los documentos requeridos para continuar con su trámite.</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-2)', fontSize: '0.9rem' }}>Nombre Completo</label>
            <input 
              type="text" 
              required 
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-1)' }}
              value={formData.full_name}
              onChange={e => setFormData({...formData, full_name: e.target.value})}
            />
          </div>

          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-2)', fontSize: '0.9rem' }}>Número de Pasaporte</label>
            <input 
              type="text" 
              required 
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-1)' }}
              value={formData.passport_number}
              onChange={e => setFormData({...formData, passport_number: e.target.value})}
            />
          </div>

          <div className="form-group" style={{ padding: '1rem', background: 'rgba(99,102,241,0.05)', borderRadius: '12px', border: '1px dashed var(--accent)' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-1)', fontWeight: 600 }}>Copia de Pasaporte (Requerido)</label>
            <input 
              type="file" 
              accept=".pdf,image/*" 
              required 
              onChange={e => setPassportFile(e.target.files[0])} 
              style={{ color: 'var(--text-2)' }}
            />
          </div>

          <div className="form-group" style={{ padding: '1rem', background: 'var(--surface-2)', borderRadius: '12px', border: '1px dashed var(--border)' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-1)', fontWeight: 600 }}>Formulario DS-160 (Opcional)</label>
            <input 
              type="file" 
              accept=".pdf" 
              onChange={e => setDs160File(e.target.files[0])} 
              style={{ color: 'var(--text-2)' }}
            />
          </div>

          <button type="submit" disabled={submitting} className="btn btn-lime" style={{ padding: '1rem', fontSize: '1rem', fontWeight: 600, marginTop: '1rem' }}>
            {submitting ? 'Enviando documentos...' : 'Enviar Documentos Seguros'}
          </button>
        </form>

      </div>
    </div>
  );
};

export default ClientPortalPage;
