import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, FileText, Calendar, User, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const { t } = useTranslation();
  
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query) {
      setLoading(true);
      // Simulate API search across users, appointments, and docs
      setTimeout(() => {
        setResults([
          { id: 1, type: 'appointment', title: 'Cita Consular - Juan Perez', desc: 'B1/B2 - Programada para Octubre 15', date: '2026-10-15', status: 'Pendiente' },
          { id: 2, type: 'user', title: 'Maria Lopez', desc: 'maria@example.com - Cliente', date: 'Registrada hace 2 días', status: 'Activo' },
          { id: 3, type: 'document', title: 'Pasaporte_Juan.pdf', desc: 'Cargado para revisión', date: 'Ayer', status: 'Verificado' },
        ].filter(r => r.title.toLowerCase().includes(query.toLowerCase()) || r.desc.toLowerCase().includes(query.toLowerCase())));
        setLoading(false);
      }, 800);
    } else {
      setResults([]);
    }
  }, [query]);

  const getIcon = (type) => {
    switch(type) {
      case 'appointment': return <Calendar size={18} color="var(--lime)" />;
      case 'user': return <User size={18} color="var(--cyan)" />;
      case 'document': return <FileText size={18} color="var(--gold)" />;
      default: return <FileText size={18} color="var(--text-3)" />;
    }
  };

  return (
    <div className="animate-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ width: 48, height: 48, borderRadius: '12px', background: 'var(--surface)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-1)' }}>
          <SearchIcon size={24} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-heading)', fontWeight: 700, margin: '0 0 0.25rem 0', color: 'var(--text-1)' }}>Resultados de búsqueda</h1>
          <p style={{ margin: 0, color: 'var(--text-2)', fontSize: '0.9rem' }}>Mostrando resultados para: <strong style={{ color: 'var(--text-1)' }}>"{query}"</strong></p>
        </div>
      </div>

      <div style={{ background: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--border)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', display: 'flex', justifyContent: 'center' }}>
            <div className="spinner" style={{ width: 24, height: 24, border: '2px solid var(--border)', borderTopColor: 'var(--lime)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : results.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {results.map((res, i) => (
              <div key={res.id} style={{ 
                padding: '1.25rem 1.5rem', 
                borderBottom: i !== results.length - 1 ? '1px solid var(--border)' : 'none',
                display: 'flex', gap: '1.25rem', alignItems: 'center',
                transition: 'background 0.2s', cursor: 'pointer'
              }} onMouseOver={e=>e.currentTarget.style.background='var(--surface-2)'} onMouseOut={e=>e.currentTarget.style.background='transparent'}>
                <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'var(--surface-2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {getIcon(res.type)}
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem', color: 'var(--text-1)', fontWeight: 600 }}>{res.title}</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-2)' }}>{res.desc}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ display: 'inline-block', padding: '0.25rem 0.75rem', background: 'var(--surface-2)', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-1)' }}>
                    {res.status}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.5rem', color: 'var(--text-3)', fontSize: '0.75rem', justifyContent: 'flex-end' }}>
                    <Clock size={12} /> {res.date}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <SearchIcon size={48} color="var(--border)" style={{ marginBottom: '1rem' }} />
            <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-1)', fontSize: '1.25rem' }}>No se encontraron resultados</h3>
            <p style={{ margin: 0, color: 'var(--text-3)' }}>Intenta con otros términos o palabras clave.</p>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default SearchPage;
