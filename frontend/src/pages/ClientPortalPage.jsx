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

  const [applicants, setApplicants] = useState([
    { full_name: '', passport_number: '', passportFile: null }
  ]);
  const [extraFiles, setExtraFiles] = useState({});
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${api.url}/visa-processes/public/${id}`);
        if (res.ok) {
          setData(await res.json());
        } else {
          const err = await res.json().catch(() => ({}));
          const msg = err.detail || 'Expediente no válido o expirado';
          toast.error(msg);
          setErrorMsg(msg);
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
      applicants.forEach((app, index) => {
        payload.append(`full_name_${index}`, app.full_name);
        payload.append(`passport_number_${index}`, app.passport_number);
        payload.append(`passport_file_${index}`, app.passportFile);
      });
      
      payload.append('applicant_count', applicants.length);

      Object.keys(extraFiles).forEach(key => {
        if (extraFiles[key]) payload.append(key, extraFiles[key]);
      });

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

  if (!data) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg)' }}>
        <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--surface-2)', borderRadius: '16px', border: '1px solid var(--border)', maxWidth: '400px' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-1)' }}>{errorMsg || 'Este enlace no es válido'}</h2>
          <p style={{ color: 'var(--text-3)' }}>Contacte a su agencia para generar un nuevo enlace o reportar el inconveniente.</p>
        </div>
      </div>
    );
  }

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
          <p style={{ color: 'var(--text-2)', fontSize: '0.9rem', marginTop: '1rem' }}>Por favor complete sus datos y adjunte documentos requeridos.</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0, fontWeight: 700, color: 'var(--text-1)' }}>
              {data.group_type !== 'Individual' ? 'Solicitantes (Grupo / Familia)' : 'Datos del Solicitante'}
            </h3>
            {data.group_type !== 'Individual' && (
              <button 
                type="button" 
                onClick={() => setApplicants([...applicants, { full_name: '', passport_number: '', passportFile: null }])}
                className="btn btn-outline" 
                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
              >
                + Agregar Acompañante
              </button>
            )}
          </div>

          {applicants.map((applicant, index) => (
            <div key={index} style={{ padding: '1.5rem', background: 'var(--surface-2)', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '1.5rem', position: 'relative' }}>
              
              {data.group_type !== 'Individual' && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <h4 style={{ margin: 0, color: 'var(--lime)' }}>{index === 0 ? 'Titular Principal' : `Acompañante #${index}`}</h4>
                  {index > 0 && (
                    <button 
                      type="button"
                      onClick={() => setApplicants(applicants.filter((_, i) => i !== index))}
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}
                    >
                      Eliminar
                    </button>
                  )}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-2)', fontSize: '0.9rem' }}>Nombre Completo tal cual el pasaporte</label>
                  <input 
                    type="text" 
                    required 
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-1)' }}
                    value={applicant.full_name} 
                    onChange={e => {
                      const newApps = [...applicants];
                      newApps[index].full_name = e.target.value;
                      setApplicants(newApps);
                    }} 
                  />
                </div>
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-2)', fontSize: '0.9rem' }}>Número de Pasaporte</label>
                  <input 
                    type="text" 
                    required 
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-1)' }}
                    value={applicant.passport_number} 
                    onChange={e => {
                      const newApps = [...applicants];
                      newApps[index].passport_number = e.target.value;
                      setApplicants(newApps);
                    }} 
                  />
                </div>
              </div>

              <div className="form-group" style={{ padding: '1rem', background: 'var(--bg)', borderRadius: '8px', border: '1px dashed var(--border)' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-1)', fontWeight: 600 }}>Foto o PDF del Pasaporte</label>
                <input 
                  type="file" 
                  accept="image/*,.pdf" 
                  required 
                  onChange={e => {
                    const newApps = [...applicants];
                    newApps[index].passportFile = e.target.files[0];
                    setApplicants(newApps);
                  }} 
                  style={{ color: 'var(--text-2)' }}
                />
              </div>
            </div>
          ))}

          <div style={{ margin: '2rem 0', borderTop: '1px solid var(--border)' }}></div>

          <h3 style={{ marginBottom: '1.5rem', fontWeight: 700, color: 'var(--text-1)' }}>Documentos del Trámite</h3>

          {data.target_country === 'Estados Unidos' && (
            <div className="form-group" style={{ padding: '1rem', background: 'var(--surface-2)', borderRadius: '12px', border: '1px dashed var(--border)' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-2)' }}>
                Formulario DS-160 (Opcional si ya lo llenó)
              </label>
              <input 
                type="file" 
                accept=".pdf"
                onChange={e => setExtraFiles({...extraFiles, ds160_file: e.target.files[0]})}
                className="file-input"
                style={{ color: 'var(--text-2)' }}
              />
            </div>
          )}

          {(data.target_country === 'Canadá' || data.purpose === 'Estudio / Intercambio' || data.purpose === 'Trabajo / Empleo') && (
            <div className="form-group" style={{ padding: '1rem', background: 'var(--surface-2)', borderRadius: '12px', border: '1px dashed var(--border)' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-2)' }}>
                Carta de Aceptación Escolar / Oferta Laboral (Obligatorio)
              </label>
              <input 
                type="file" 
                accept=".pdf"
                required
                onChange={e => setExtraFiles({...extraFiles, support_doc: e.target.files[0]})}
                className="file-input"
                style={{ color: 'var(--text-2)' }}
              />
            </div>
          )}

          {data.target_country === 'Schengen (Europa)' && (
            <div className="form-group" style={{ padding: '1rem', background: 'var(--surface-2)', borderRadius: '12px', border: '1px dashed var(--border)' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-2)' }}>
                Itinerario de Vuelo y Reserva de Hotel (Obligatorio)
              </label>
              <input 
                type="file" 
                accept=".pdf"
                required
                onChange={e => setExtraFiles({...extraFiles, itinerary_doc: e.target.files[0]})}
                className="file-input"
                style={{ color: 'var(--text-2)' }}
              />
            </div>
          )}

          <button type="submit" disabled={submitting} className="btn btn-lime" style={{ padding: '1rem', fontSize: '1rem', fontWeight: 600, marginTop: '1rem' }}>
            {submitting ? 'Enviando documentos...' : 'Enviar Documentos Seguros'}
          </button>
        </form>

      </div>
    </div>
  );
};

export default ClientPortalPage;
