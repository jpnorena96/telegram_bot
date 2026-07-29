import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Terminal, Activity, CheckCircle2, AlertCircle, Clock, Calendar, Shield, X, RefreshCw } from 'lucide-react';

const parseLogs = (rawLogs) => {
  if (!rawLogs || typeof rawLogs !== 'string') return [];
  
  const lines = rawLogs.split('\n').filter(l => l.trim() !== '');
  const parsed = [];
  
  for (const line of lines) {
    if (line.includes('[TAILING]')) continue; // Skip PM2 tailing header
    
    // Default values
    let type = 'info';
    let icon = Activity;
    let color = 'var(--text-2)';
    let message = line;
    let time = '';

    // Extract time if it exists at the start (e.g., "2024-05-12 10:20:15 - ...")
    const timeMatch = line.match(/^(\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2})\s*[-:]?\s*(.*)/);
    if (timeMatch) {
      time = timeMatch[1].split(' ')[1]; // Just keep HH:MM:SS
      message = timeMatch[2];
    } else {
      // Try just HH:MM:SS
      const timeMatch2 = line.match(/^(\d{2}:\d{2}:\d{2})\s*[-:]?\s*(.*)/);
      if (timeMatch2) {
        time = timeMatch2[1];
        message = timeMatch2[2];
      }
    }

    // Determine type and icon based on keywords
    const lower = message.toLowerCase();
    
    if (lower.includes('error') || lower.includes('falló') || lower.includes('failed') || lower.includes('exception')) {
      type = 'error';
      icon = AlertCircle;
      color = '#ef4444';
    } else if (lower.includes('success') || lower.includes('éxito') || lower.includes('completado') || lower.includes('rescheduled')) {
      type = 'success';
      icon = CheckCircle2;
      color = 'var(--lime)';
    } else if (lower.includes('login') || lower.includes('autenticando') || lower.includes('sesión') || lower.includes('session')) {
      type = 'auth';
      icon = Shield;
      color = '#8b5cf6';
    } else if (lower.includes('date') || lower.includes('fecha') || lower.includes('appointment') || lower.includes('cita')) {
      type = 'calendar';
      icon = Calendar;
      color = '#3b82f6';
    } else if (lower.includes('wait') || lower.includes('esperando') || lower.includes('sleep') || lower.includes('pausa')) {
      type = 'wait';
      icon = Clock;
      color = '#f59e0b';
    }

    parsed.push({ id: Math.random().toString(), time, message, type, icon, color, raw: line });
  }
  
  return parsed;
};

const BotStatusViewer = ({ aptId, rawLogs, loading, onClose, onRefresh }) => {
  const [viewMode, setViewMode] = useState('visual'); // 'visual' | 'terminal'
  const scrollRef = useRef(null);

  const parsedLogs = useMemo(() => parseLogs(rawLogs), [rawLogs]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [parsedLogs, viewMode]);

  // Determine current status state for the header indicator
  const lastLog = parsedLogs[parsedLogs.length - 1];
  const isError = parsedLogs.some(l => l.type === 'error');
  
  let statusColor = 'var(--lime)';
  let statusText = 'Bot Activo';
  
  if (isError && (!lastLog || lastLog.type === 'error')) {
    statusColor = '#ef4444';
    statusText = 'Bot Detenido (Error)';
  } else if (lastLog?.type === 'wait') {
    statusColor = '#f59e0b';
    statusText = 'En Espera / Pausado';
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem', backdropFilter: 'blur(4px)' }}>
      <div className="animate-in" style={{ background: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--border)', width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column', maxHeight: '90vh', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
        
        {/* Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-1)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={20} color="var(--lime)" /> Estado del Bot (ID: {aptId})
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--bg)', padding: '0.3rem 0.75rem', borderRadius: '99px', border: '1px solid var(--border)', fontSize: '0.75rem', fontWeight: 600 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: statusColor, boxShadow: `0 0 8px ${statusColor}` }} />
              <span style={{ color: 'var(--text-2)' }}>{statusText}</span>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ background: 'var(--bg)', borderRadius: '8px', padding: '0.2rem', display: 'flex', border: '1px solid var(--border)' }}>
              <button 
                onClick={() => setViewMode('visual')}
                style={{ padding: '0.4rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, border: 'none', background: viewMode === 'visual' ? 'var(--surface-2)' : 'transparent', color: viewMode === 'visual' ? 'var(--text-1)' : 'var(--text-3)', cursor: 'pointer', transition: 'all 0.2s' }}
              >
                Visual
              </button>
              <button 
                onClick={() => setViewMode('terminal')}
                style={{ padding: '0.4rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, border: 'none', background: viewMode === 'terminal' ? 'var(--surface-2)' : 'transparent', color: viewMode === 'terminal' ? 'var(--text-1)' : 'var(--text-3)', cursor: 'pointer', transition: 'all 0.2s' }}
              >
                Consola
              </button>
            </div>
            <button onClick={onClose} className="btn btn-icon btn-sm" style={{ marginLeft: '0.5rem' }}><X size={18} /></button>
          </div>
        </div>

        {/* Content Area */}
        <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: viewMode === 'visual' ? '2rem' : '1rem', background: viewMode === 'visual' ? 'var(--bg)' : '#1e1e1e', minHeight: '400px' }}>
          
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-3)', gap: '1rem' }}>
              <RefreshCw size={24} className="spin" color="var(--lime)" />
              <span>Conectando con el bot...</span>
            </div>
          ) : parsedLogs.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-3)', padding: '3rem' }}>
              No hay eventos registrados para este usuario aún.
            </div>
          ) : viewMode === 'terminal' ? (
            <div style={{ color: '#00ff00', fontFamily: 'monospace', fontSize: '0.85rem', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
              {rawLogs}
            </div>
          ) : (
            <div style={{ position: 'relative' }}>
              {/* Timeline Line */}
              <div style={{ position: 'absolute', top: 0, bottom: 0, left: '20px', width: '2px', background: 'var(--border)', zIndex: 0 }} />
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative', zIndex: 1 }}>
                {parsedLogs.map((log, index) => {
                  const Icon = log.icon;
                  const isLast = index === parsedLogs.length - 1;
                  return (
                    <div key={log.id} style={{ display: 'flex', gap: '1.5rem', opacity: isLast ? 1 : 0.7, transition: 'opacity 0.2s' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--surface)', border: `2px solid ${log.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 2, boxShadow: `0 0 15px ${log.color}20` }}>
                        <Icon size={18} color={log.color} />
                      </div>
                      <div style={{ flex: 1, background: 'var(--surface)', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid var(--border)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                          <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-1)' }}>
                            {log.type === 'error' ? 'Problema Detectado' : 
                             log.type === 'auth' ? 'Autenticación' : 
                             log.type === 'calendar' ? 'Búsqueda de Citas' : 
                             log.type === 'success' ? 'Éxito' : 'Progreso del Sistema'}
                          </span>
                          {log.time && <span style={{ fontSize: '0.75rem', color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>{log.time}</span>}
                        </div>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-2)', margin: 0, lineHeight: 1.5 }}>
                          {log.message}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface)' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>
            Se actualiza automáticamente cada vez que solicitas los logs
          </span>
          <button onClick={() => onRefresh(aptId)} disabled={loading} className="btn btn-lime" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <RefreshCw size={16} className={loading ? 'spin' : ''} /> Actualizar Estado
          </button>
        </div>

      </div>
    </div>
  );
};

export default BotStatusViewer;
