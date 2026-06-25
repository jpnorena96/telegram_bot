import React, { useEffect, useState, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  FileText, CheckCircle2, AlertTriangle, UploadCloud, Download, 
  Trash2, UserPlus, FolderOpen, Clock, CheckCircle, 
  Plus, X, Eye, ShieldAlert, ArrowRight, User, Users, RefreshCw
} from 'lucide-react';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

const STATUS_MAP = {
  'En Progreso':       { tag: 'tag-cyan',   label: 'EN PROGRESO' },
  'Listo para Revisar': { tag: 'tag-gold',   label: 'POR REVISAR' },
  'Aprobado':          { tag: 'tag-lime',   label: 'APROBADO' },
  'Cargado':           { tag: 'tag-green',  label: 'CARGADO' }
};

const DOC_TYPE_LABELS = {
  'passport':               { name: 'Pasaporte Vigente', desc: 'Copia legible de la hoja de datos en formato PDF o imagen.' },
  'photo':                  { name: 'Fotografía Digital', desc: 'Foto de 5x5 cm, fondo blanco, tomada en los últimos 6 meses.' },
  'ds160':                  { name: 'Hoja de Confirmación DS-160', desc: 'Página de confirmación del formulario DS-160 con el código de barras.' },
  'financial_support':      { name: 'Sustento Financiero (Opcional)', desc: 'Extractos bancarios, cartas de ingresos o propiedades del solicitante.' },
  'employment_support':     { name: 'Certificado Laboral / Académico (Opcional)', desc: 'Carta de trabajo actual o constancia de estudios vigentes.' },
};

const DocumentsPage = () => {
  const { role } = useOutletContext();
  
  // Auth roles flags
  const isAdmin = role === 'ADMINISTRATOR' || role === 'AUDITOR';
  const isAgency = role === 'TRAVEL_AGENCY';
  const isClient = role === 'NATURAL_PERSON';
  const canEdit = role !== 'AUDITOR';

  // State variables
  const [processes, setProcesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [activeApplicantId, setActiveApplicantId] = useState(null);
  
  // Creator states
  const [showCreator, setShowCreator] = useState(false);
  const [newProcessType, setNewProcessType] = useState('individual'); // 'individual' | 'familiar'
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newApplicants, setNewApplicants] = useState([{ full_name: '', relationship: 'primary', passport_number: '', ds160_confirmation: '' }]);
  const [creating, setCreating] = useState(false);
  
  // Rejection states
  const [rejectionDocId, setRejectionDocId] = useState(null);
  const [rejectionNotes, setRejectionNotes] = useState('');

  // Fetch all processes
  const loadProcesses = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getVisaProcesses();
      setProcesses(data);
    } catch (err) {
      toast.error('Error al cargar expedientes de visa');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProcesses();
  }, [loadProcesses]);

  // Handle process click
  const handleViewProcess = async (processId) => {
    try {
      const details = await api.getVisaProcessDetails(processId);
      setSelectedProcess(details);
      
      // Auto-set the active applicant to the primary one
      const primary = details.applicants.find(a => a.relationship === 'primary');
      if (primary) {
        setActiveApplicantId(primary.id);
      } else if (details.applicants.length > 0) {
        setActiveApplicantId(details.applicants[0].id);
      }
    } catch (err) {
      toast.error('Error al cargar detalles del expediente');
      console.error(err);
    }
  };

  // Add family member dynamically during creation
  const addFamilyMemberField = () => {
    setNewApplicants([...newApplicants, { full_name: '', relationship: 'spouse', passport_number: '', ds160_confirmation: '' }]);
  };

  // Remove family member field during creation
  const removeFamilyMemberField = (idx) => {
    setNewApplicants(newApplicants.filter((_, i) => i !== idx));
  };

  // Handle input change for creation applicants
  const handleApplicantFieldChange = (idx, field, value) => {
    const updated = [...newApplicants];
    updated[idx][field] = value;
    setNewApplicants(updated);
  };

  // Submit visa process creation
  const handleCreateProcess = async (e) => {
    if (e) e.preventDefault();
    
    // Validations
    if ((isAgency || isAdmin) && !newClientEmail) {
      toast.error('Por favor escribe el email del cliente');
      return;
    }
    
    const primaryName = newApplicants[0].full_name;
    if (!primaryName) {
      toast.error('Por favor ingresa el nombre del solicitante principal');
      return;
    }

    setCreating(true);
    try {
      const payload = {
        client_email: newClientEmail,
        type: newProcessType,
        applicants: newApplicants.map(a => ({
          ...a,
          relationship: a.relationship || 'primary'
        }))
      };
      
      const res = await api.createVisaProcess(payload);
      if (res.status === 'ok') {
        toast.success(res.message || 'Expediente creado correctamente');
        setShowCreator(false);
        // Reset state
        setNewClientEmail('');
        setNewProcessType('individual');
        setNewApplicants([{ full_name: '', relationship: 'primary', passport_number: '', ds160_confirmation: '' }]);
        // Reload list
        await loadProcesses();
        
        // Auto open the created process
        if (res.process_id) {
          handleViewProcess(res.process_id);
        }
      }
    } catch (err) {
      toast.error(err.message || 'Error al crear expediente');
    } finally {
      setCreating(false);
    }
  };

  // Handle dynamic applicant addition inside selected process
  const [newFamilyMember, setNewFamilyMember] = useState({ full_name: '', relationship: 'child', passport_number: '', ds160_confirmation: '' });
  const [addingMember, setAddingMember] = useState(false);
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);

  const handleAddFamilyMember = async (e) => {
    if (e) e.preventDefault();
    if (!newFamilyMember.full_name) {
      toast.error('Por favor ingresa el nombre completo del familiar');
      return;
    }
    setAddingMember(true);
    try {
      const res = await api.addVisaApplicant(selectedProcess.process.id, newFamilyMember);
      if (res.status === 'ok') {
        toast.success(res.message || 'Familiar agregado correctamente');
        setShowAddMemberForm(false);
        setNewFamilyMember({ full_name: '', relationship: 'child', passport_number: '', ds160_confirmation: '' });
        // Refresh details
        await handleViewProcess(selectedProcess.process.id);
      }
    } catch (err) {
      toast.error(err.message || 'Error al agregar familiar');
    } finally {
      setAddingMember(false);
    }
  };

  // Delete family applicant
  const handleDeleteApplicant = async (applicantId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este familiar y todos sus documentos cargados?')) return;
    try {
      const res = await api.deleteVisaApplicant(selectedProcess.process.id, applicantId);
      if (res.status === 'ok') {
        toast.success(res.message || 'Familiar eliminado');
        // Refresh details
        await handleViewProcess(selectedProcess.process.id);
      }
    } catch (err) {
      toast.error(err.message || 'Error al eliminar familiar');
    }
  };

  // Document upload handler
  const [uploadingDocType, setUploadingDocType] = useState(null);

  const handleFileUpload = async (e, applicantId, documentType) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check size limit: 10MB
    if (file.size > 10 * 1024 * 1024) {
      toast.error('El tamaño máximo permitido es 10MB');
      return;
    }

    setUploadingDocType(documentType);
    const loadingToast = toast.loading('Cargando archivo a la VPS...');
    try {
      const res = await api.uploadVisaDocument(applicantId, documentType, file);
      if (res.status === 'ok') {
        toast.success(res.message || 'Documento cargado correctamente');
        // Refresh details
        await handleViewProcess(selectedProcess.process.id);
      }
    } catch (err) {
      toast.error(err.message || 'Error al cargar documento');
    } finally {
      toast.dismiss(loadingToast);
      setUploadingDocType(null);
    }
  };

  // Download document
  const handleDownloadFile = async (docId, originalName) => {
    try {
      const blob = await api.downloadVisaDocument(docId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = originalName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error('Error al descargar el documento');
    }
  };

  // Document approval/rejection
  const handleApproveDocument = async (docId) => {
    try {
      const res = await api.updateVisaDocumentStatus(docId, 'approved');
      if (res.status === 'ok') {
        toast.success('Documento aprobado');
        await handleViewProcess(selectedProcess.process.id);
      }
    } catch (err) {
      toast.error(err.message || 'Error al aprobar documento');
    }
  };

  const handleRejectDocumentSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!rejectionNotes.trim()) {
      toast.error('Debes ingresar la razón del rechazo');
      return;
    }
    try {
      const res = await api.updateVisaDocumentStatus(rejectionDocId, 'rejected', rejectionNotes);
      if (res.status === 'ok') {
        toast.success('Documento rechazado. Se guardaron los comentarios.');
        setRejectionDocId(null);
        setRejectionNotes('');
        await handleViewProcess(selectedProcess.process.id);
      }
    } catch (err) {
      toast.error(err.message || 'Error al rechazar documento');
    }
  };

  // Process status updates
  const handleUpdateProcessStatus = async (statusVal) => {
    try {
      const res = await api.updateVisaProcessStatus(selectedProcess.process.id, statusVal);
      if (res.status === 'ok') {
        toast.success(res.message || `Estado actualizado a ${statusVal}`);
        // Refresh detail and list
        await handleViewProcess(selectedProcess.process.id);
        await loadProcesses();
      }
    } catch (err) {
      toast.error(err.message || 'Error al cambiar estado del trámite');
    }
  };

  // Validation helper: check if core files uploaded for all applicants
  const checkCoreFilesUploaded = () => {
    if (!selectedProcess) return false;
    for (const app of selectedProcess.applicants) {
      const passport = app.documents.find(d => d.document_type === 'passport');
      const photo = app.documents.find(d => d.document_type === 'photo');
      const ds160 = app.documents.find(d => d.document_type === 'ds160');
      
      if (!passport || !photo || !ds160) {
        return false;
      }
    }
    return true;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="animate-in">
      
      {/* ── SECCIÓN SUPERIOR / CABECERA ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-3)', letterSpacing: '0.15em', marginBottom: '4px' }}>MÓDULO: DOCUMENTOS_Y_CHECKLIST_B1B2</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Gestión de Expedientes B1/B2</h2>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-sm" onClick={loadProcesses}>
            <RefreshCw size={11} style={{ animation: loading ? 'spin 1.5s linear infinite' : 'none' }} /> SYNC
          </button>
          {canEdit && !showCreator && !selectedProcess && (
            <button className="btn btn-sm btn-lime" onClick={() => setShowCreator(true)}>
              <Plus size={11} /> NUEVO TRÁMITE
            </button>
          )}
        </div>
      </div>

      {/* ── FORMULARIO DE CREACIÓN DE EXPEDIENTE ── */}
      {showCreator && (
        <div className="panel" style={{ padding: '1.5rem', background: 'var(--black-2)', border: '1px solid var(--border-2)', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--lime)' }}>Crear Nuevo Expediente de Visa B1/B2</h3>
            <button className="btn btn-icon btn-sm" onClick={() => setShowCreator(false)} style={{ border: 'none' }}><X size={14} /></button>
          </div>

          <form onSubmit={handleCreateProcess} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
              
              {/* Tipo de Trámite */}
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">TIPO DE TRÁMITE</label>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                    <input type="radio" name="process_type" value="individual" checked={newProcessType === 'individual'} onChange={() => { setNewProcessType('individual'); setNewApplicants([newApplicants[0]]); }} style={{ accentColor: 'var(--lime)' }} />
                    Individual (Titular)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                    <input type="radio" name="process_type" value="familiar" checked={newProcessType === 'familiar'} onChange={() => setNewProcessType('familiar')} style={{ accentColor: 'var(--lime)' }} />
                    Familiar (Titular + Parientes)
                  </label>
                </div>
              </div>

              {/* Email del Cliente (Solo Agencias / Admin) */}
              {(isAgency || isAdmin) && (
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">EMAIL DEL CLIENTE</label>
                  <input className="input-field" type="email" placeholder="cliente@correo.com" value={newClientEmail} onChange={e => setNewClientEmail(e.target.value)} required />
                </div>
              )}
            </div>

            {/* Solicitante Principal */}
            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--lime)', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>SOLICITANTE PRINCIPAL (TITULAR DE LA CITA)</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Nombre Completo</label>
                  <input className="input-field" type="text" placeholder="Ej. Alexis Alcedo" value={newApplicants[0].full_name} onChange={e => handleApplicantFieldChange(0, 'full_name', e.target.value)} required />
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Nro de Pasaporte (Opcional)</label>
                  <input className="input-field" type="text" placeholder="Ej. AP123456" value={newApplicants[0].passport_number} onChange={e => handleApplicantFieldChange(0, 'passport_number', e.target.value)} />
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">ID Confirmación DS-160 (Opcional)</label>
                  <input className="input-field" type="text" placeholder="Ej. AA00AA00AA" value={newApplicants[0].ds160_confirmation} onChange={e => handleApplicantFieldChange(0, 'ds160_confirmation', e.target.value)} />
                </div>
              </div>
            </div>

            {/* Integrantes Familiares Adicionales */}
            {newProcessType === 'familiar' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-2)' }}>Miembros de Cita Familiar</span>
                  <button type="button" className="btn btn-xs btn-outline" onClick={addFamilyMemberField} style={{ gap: '0.25rem' }}>
                    <Plus size={11} /> AGREGAR FAMILIAR
                  </button>
                </div>

                {newApplicants.slice(1).map((app, idx) => {
                  const actualIdx = idx + 1;
                  return (
                    <div key={actualIdx} style={{ padding: '1rem', background: 'rgba(255,255,255,0.005)', border: '1px dashed var(--border)', borderRadius: 'var(--radius-md)', position: 'relative' }}>
                      <button type="button" className="btn btn-icon btn-xs" onClick={() => removeFamilyMemberField(actualIdx)} style={{ position: 'absolute', top: '10px', right: '10px', border: 'none', background: 'rgba(239,68,68,0.1)', color: '#F87171' }}>
                        <X size={12} />
                      </button>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', paddingRight: '20px' }}>
                        <div className="input-group" style={{ marginBottom: 0 }}>
                          <label className="input-label">Nombre Completo</label>
                          <input className="input-field" type="text" placeholder="Familiar" value={app.full_name} onChange={e => handleApplicantFieldChange(actualIdx, 'full_name', e.target.value)} required />
                        </div>
                        <div className="input-group" style={{ marginBottom: 0 }}>
                          <label className="input-label">Parentesco</label>
                          <select className="input-field" value={app.relationship} onChange={e => handleApplicantFieldChange(actualIdx, 'relationship', e.target.value)}>
                            <option value="spouse">Cónyuge</option>
                            <option value="child">Hijo(a)</option>
                            <option value="parent">Padre/Madre</option>
                            <option value="sibling">Hermano(a)</option>
                            <option value="other">Otro</option>
                          </select>
                        </div>
                        <div className="input-group" style={{ marginBottom: 0 }}>
                          <label className="input-label">Nro de Pasaporte</label>
                          <input className="input-field" type="text" placeholder="AP000000" value={app.passport_number} onChange={e => handleApplicantFieldChange(actualIdx, 'passport_number', e.target.value)} />
                        </div>
                        <div className="input-group" style={{ marginBottom: 0 }}>
                          <label className="input-label">ID DS-160</label>
                          <input className="input-field" type="text" placeholder="AA000000" value={app.ds160_confirmation} onChange={e => handleApplicantFieldChange(actualIdx, 'ds160_confirmation', e.target.value)} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
              <button type="button" className="btn btn-outline" onClick={() => setShowCreator(false)}>CANCELAR</button>
              <button type="submit" className="btn btn-lime" disabled={creating} style={{ minWidth: '150px' }}>
                {creating ? 'CREANDO...' : 'CREAR EXPEDIENTE'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── EXPEDIENTES GENERALES LISTA (Para admin / agencias) ── */}
      {!selectedProcess && (
        <div className="panel" style={{ background: 'var(--black-2)', border: '1px solid var(--border)' }}>
          <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className="panel-title">Expedientes de Carga de Documentos</h2>
            <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--text-3)' }}>{processes.length} EXPEDIENTES TOTALES</span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  {isAdmin && <th>ID</th>}
                  <th>TITULAR / CLIENTE</th>
                  <th>EMAIL ASOCIADO</th>
                  <th>TIPO</th>
                  <th>INTEGRANTES</th>
                  <th>ESTADO</th>
                  <th>OPCIONES</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i}>
                      {[isAdmin && 1, 1, 1, 1, 1, 1, 1].filter(Boolean).map((__, j) => (
                        <td key={j}><div className="skeleton" style={{ height: '13px', width: '60%' }} /></td>
                      ))}
                    </tr>
                  ))
                ) : processes.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? 7 : 6} style={{ textAlign: 'center', padding: '3rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-3)' }}>
                      &gt; NO_VISA_PROCESSES_FOUND. Crea un nuevo trámite para comenzar.
                    </td>
                  </tr>
                ) : (
                  processes.map(p => {
                    const { tag, label } = STATUS_MAP[p.status] || { tag: 'tag-cyan', label: p.status };
                    return (
                      <tr key={p.id}>
                        {isAdmin && <td className="mono" style={{ color: 'var(--text-3)', fontSize: '0.72rem' }}>#{String(p.id).padStart(4, '0')}</td>}
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {p.type === 'familiar' ? <Users size={14} color="var(--lime)" /> : <User size={14} color="var(--text-2)" />}
                            <span style={{ fontWeight: 600 }}>{p.primary_applicant_name}</span>
                          </div>
                        </td>
                        <td className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-2)' }}>{p.client_email}</td>
                        <td>
                          <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: p.type === 'familiar' ? 'var(--lime)' : 'var(--text-2)' }}>
                            {p.type === 'familiar' ? 'Familiar' : 'Individual'}
                          </span>
                        </td>
                        <td className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-2)' }}>{p.applicants_count} Pers.</td>
                        <td><span className={`tag ${tag}`}>{label}</span></td>
                        <td>
                          <button className="btn btn-sm btn-outline" onClick={() => handleViewProcess(p.id)} style={{ gap: '0.25rem' }}>
                            <Eye size={12} /> GESTIONAR
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── EXPEDIENTE ABIERTO / CHECKLIST DE DOCUMENTOS ── */}
      {selectedProcess && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Header del Expediente */}
          <div className="panel" style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderLeft: '4px solid var(--lime)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <span className={`tag ${STATUS_MAP[selectedProcess.process.status]?.tag || 'tag-cyan'}`}>
                  {STATUS_MAP[selectedProcess.process.status]?.label || selectedProcess.process.status}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-3)' }}>
                  EXPEDIENTE #{String(selectedProcess.process.id).padStart(4, '0')} · {selectedProcess.process.type === 'familiar' ? 'GRUPO FAMILIAR' : 'INDIVIDUAL'}
                </span>
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: '0.5rem', color: 'var(--text-1)' }}>
                Documentos de {selectedProcess.process.client_email}
              </h3>
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              {/* Acciones del Cliente (Dar de Alta) */}
              {isClient && selectedProcess.process.status === 'En Progreso' && (
                <button 
                  className="btn btn-lime"
                  onClick={() => handleUpdateProcessStatus('Listo para Revisar')}
                  disabled={!checkCoreFilesUploaded()}
                  style={{ gap: '0.4rem', opacity: checkCoreFilesUploaded() ? 1 : 0.5 }}
                  title={!checkCoreFilesUploaded() ? "Debes cargar al menos Pasaporte, Foto y DS-160 para todos los miembros antes de dar de alta" : ""}
                >
                  DAR DE ALTA DOCUMENTOS <ArrowRight size={13} />
                </button>
              )}

              {/* Acciones de la Agencia / Admin (Verificación de Trámite) */}
              {(isAgency || isAdmin) && canEdit && (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {selectedProcess.process.status === 'Listo para Revisar' && (
                    <button className="btn btn-sm btn-lime" onClick={() => handleUpdateProcessStatus('Aprobado')} style={{ gap: '0.3rem' }}>
                      <CheckCircle2 size={12} /> APROBAR EXPEDIENTE
                    </button>
                  )}
                  {selectedProcess.process.status === 'Aprobado' && (
                    <button className="btn btn-sm btn-green" onClick={() => handleUpdateProcessStatus('Cargado')} style={{ gap: '0.3rem' }}>
                      <CheckCircle2 size={12} /> MARCAR COMO CARGADO
                    </button>
                  )}
                  {selectedProcess.process.status !== 'En Progreso' && (
                    <button className="btn btn-sm btn-outline" onClick={() => handleUpdateProcessStatus('En Progreso')} style={{ borderColor: 'rgba(239,68,68,0.3)', color: '#F87171' }}>
                      REVERTIR A EN PROGRESO
                    </button>
                  )}
                </div>
              )}

              <button className="btn btn-sm btn-outline" onClick={() => { setSelectedProcess(null); loadProcesses(); }}>
                VOLVER A LA LISTA
              </button>
            </div>
          </div>

          {/* Advertencia para clientes si no han subido documentos base */}
          {isClient && selectedProcess.process.status === 'En Progreso' && !checkCoreFilesUploaded() && (
            <div style={{ padding: '0.875rem 1.25rem', background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: 'var(--radius-md)', color: '#FDBA74', fontSize: '0.8125rem', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
              <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
              <div>
                <strong>Requerido:</strong> Carga al menos los 3 documentos obligatorios (Pasaporte, Foto y DS-160) de todos los integrantes para habilitar la opción de <strong>Dar de Alta</strong> para revisión.
              </div>
            </div>
          )}

          {/* Layout Principal: Tabs a la izquierda (Miembros), Checklist a la derecha */}
          <div style={{ display: 'grid', gridTemplateColumns: selectedProcess.process.type === 'familiar' ? '240px 1fr' : '1fr', gap: '1.25rem' }}>
            
            {/* TABS DE FAMILIARES (Solo si es Familiar) */}
            {selectedProcess.process.type === 'familiar' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.62rem', fontFamily: 'var(--font-mono)', color: 'var(--text-3)', letterSpacing: '0.05em' }}>INTEGRANTES DE LA CITA</span>
                
                {selectedProcess.applicants.map(app => {
                  const isActive = activeApplicantId === app.id;
                  const missingCount = ['passport', 'photo', 'ds160'].filter(type => !app.documents.some(d => d.document_type === type)).length;
                  return (
                    <div 
                      key={app.id}
                      onClick={() => setActiveApplicantId(app.id)}
                      style={{
                        padding: '0.875rem 1rem',
                        background: isActive ? 'rgba(163,230,53,0.03)' : 'var(--black-2)',
                        border: '1px solid ' + (isActive ? 'var(--lime)' : 'var(--border)'),
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.25rem',
                        transition: 'all 0.2s',
                        boxShadow: isActive ? '0 0 10px rgba(163,230,53,0.05)' : 'none'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: isActive ? 600 : 500, color: isActive ? 'var(--text-1)' : 'var(--text-2)' }}>{app.full_name}</span>
                        {app.relationship === 'primary' && <span style={{ fontSize: '0.55rem', fontFamily: 'var(--font-mono)', background: 'var(--border)', padding: '1px 4px', color: 'var(--text-3)' }}>TITULAR</span>}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-3)' }}>
                          {app.relationship === 'spouse' ? 'Cónyuge' : app.relationship === 'child' ? 'Hijo(a)' : app.relationship === 'primary' ? 'Solicitante Principal' : 'Pariente'}
                        </span>
                        {missingCount > 0 ? (
                          <span style={{ fontSize: '0.62rem', color: '#FDA4AF', fontFamily: 'var(--font-mono)' }}>Falta {missingCount}</span>
                        ) : (
                          <span style={{ fontSize: '0.62rem', color: 'var(--lime)', fontFamily: 'var(--font-mono)' }}>Completo ✓</span>
                        )}
                      </div>
                      
                      {/* Delete familiar button for owner/admin in draft */}
                      {canEdit && app.relationship !== 'primary' && selectedProcess.process.status === 'En Progreso' && (
                        <button 
                          type="button" 
                          onClick={(e) => { e.stopPropagation(); handleDeleteApplicant(app.id); }}
                          style={{ background: 'none', border: 'none', color: '#F87171', fontSize: '0.65rem', textDecoration: 'underline', padding: 0, marginTop: '0.5rem', textAlign: 'left', cursor: 'pointer' }}
                        >
                          Eliminar familiar
                        </button>
                      )}
                    </div>
                  );
                })}

                {/* Formulario rápido para añadir familiar en el proceso */}
                {selectedProcess.process.status === 'En Progreso' && canEdit && (
                  <div style={{ marginTop: '0.5rem' }}>
                    {!showAddMemberForm ? (
                      <button className="btn btn-sm btn-outline" style={{ width: '100%', gap: '0.25rem' }} onClick={() => setShowAddMemberForm(true)}>
                        <Plus size={12} /> AÑADIR FAMILIAR
                      </button>
                    ) : (
                      <form onSubmit={handleAddFamilyMember} className="panel" style={{ padding: '0.875rem', background: 'var(--black-2)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--lime)' }}>Nuevo Integrante</span>
                          <button type="button" style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer' }} onClick={() => setShowAddMemberForm(false)}><X size={12} /></button>
                        </div>
                        <input className="input-field" type="text" placeholder="Nombre completo" value={newFamilyMember.full_name} onChange={e => setNewFamilyMember({...newFamilyMember, full_name: e.target.value})} required style={{ height: '30px', fontSize: '0.78rem' }} />
                        <select className="input-field" value={newFamilyMember.relationship} onChange={e => setNewFamilyMember({...newFamilyMember, relationship: e.target.value})} style={{ height: '30px', fontSize: '0.78rem' }}>
                          <option value="spouse">Cónyuge</option>
                          <option value="child">Hijo(a)</option>
                          <option value="parent">Padre/Madre</option>
                        </select>
                        <input className="input-field" type="text" placeholder="Nro Pasaporte" value={newFamilyMember.passport_number} onChange={e => setNewFamilyMember({...newFamilyMember, passport_number: e.target.value})} style={{ height: '30px', fontSize: '0.78rem' }} />
                        <input className="input-field" type="text" placeholder="ID DS-160" value={newFamilyMember.ds160_confirmation} onChange={e => setNewFamilyMember({...newFamilyMember, ds160_confirmation: e.target.value})} style={{ height: '30px', fontSize: '0.78rem' }} />
                        
                        <button type="submit" className="btn btn-lime btn-xs" disabled={addingMember} style={{ width: '100%' }}>
                          {addingMember ? 'Agregando...' : 'Guardar Familiar'}
                        </button>
                      </form>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* CHECKLIST DE DOCUMENTOS DEL INTEGRANTE SELECCIONADO */}
            {activeApplicantId && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--lime)', letterSpacing: '0.05em' }}>
                    CHECKLIST DE REQUISITOS: {selectedProcess.applicants.find(a => a.id === activeApplicantId)?.full_name.toUpperCase()}
                  </span>
                </div>

                {/* Grid de Requisitos */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {Object.entries(DOC_TYPE_LABELS).map(([type, docInfo]) => {
                    const applicant = selectedProcess.applicants.find(a => a.id === activeApplicantId);
                    const uploadedDoc = applicant?.documents.find(d => d.document_type === type);
                    
                    // Style by status
                    const docStatus = uploadedDoc ? uploadedDoc.status : 'pending';
                    const stylesByStatus = {
                      pending:  { border: 'var(--border)',       badge: 'rgba(255,255,255,0.05)', color: 'var(--text-3)', text: 'Pendiente de Carga' },
                      uploaded: { border: 'rgba(249,115,22,0.3)', badge: 'rgba(249,115,22,0.1)', color: '#FDBA74',     text: 'Por Verificar' },
                      approved: { border: 'rgba(163,230,53,0.3)', badge: 'rgba(163,230,53,0.1)', color: 'var(--lime)',  text: 'Aprobado ✓' },
                      rejected: { border: 'rgba(239,68,68,0.3)',  badge: 'rgba(239,68,68,0.1)',  color: '#F87171',     text: 'Rechazado ✕' }
                    };
                    const statusConfig = stylesByStatus[docStatus];

                    return (
                      <div 
                        key={type} 
                        style={{
                          background: 'var(--black-2)',
                          border: '1px solid ' + statusConfig.border,
                          borderRadius: 'var(--radius-lg)',
                          padding: '1.25rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: '1rem',
                          transition: 'all 0.2s'
                        }}
                      >
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flex: 1, minWidth: '280px' }}>
                          <div style={{ marginTop: '0.2rem', color: statusConfig.color }}>
                            {docStatus === 'approved' ? (
                              <CheckCircle size={20} />
                            ) : docStatus === 'rejected' ? (
                              <AlertTriangle size={20} />
                            ) : (
                              <FileText size={20} />
                            )}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ fontWeight: 600, color: 'var(--text-1)', fontSize: '0.9rem' }}>{docInfo.name}</span>
                              <span style={{ fontSize: '0.62rem', fontFamily: 'var(--font-mono)', background: statusConfig.badge, color: statusConfig.color, padding: '2px 6px', border: `1px solid ${statusConfig.color}` }}>
                                {statusConfig.text.toUpperCase()}
                              </span>
                            </div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{docInfo.desc}</span>
                            
                            {/* Rejection comments display */}
                            {docStatus === 'rejected' && uploadedDoc?.notes && (
                              <div style={{ marginTop: '0.5rem', padding: '0.5rem 0.75rem', background: 'rgba(239,68,68,0.03)', borderLeft: '2px solid #EF4444', fontSize: '0.72rem', color: '#F87171' }}>
                                <strong>Motivo de rechazo:</strong> "{uploadedDoc.notes}"
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Actions Control */}
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          
                          {/* File download / preview */}
                          {uploadedDoc && (
                            <button 
                              type="button" 
                              className="btn btn-sm btn-outline" 
                              onClick={() => handleDownloadFile(uploadedDoc.id, uploadedDoc.file_name)}
                              style={{ gap: '0.3rem' }}
                            >
                              <Download size={11} /> DESCARGAR
                            </button>
                          )}

                          {/* Client upload trigger */}
                          {canEdit && (selectedProcess.process.status === 'En Progreso' || docStatus === 'rejected') && (
                            <div style={{ position: 'relative' }}>
                              <input 
                                type="file" 
                                id={`file-input-${type}`}
                                style={{ display: 'none' }}
                                onChange={(e) => handleFileUpload(e, activeApplicantId, type)}
                                disabled={uploadingDocType === type}
                                accept=".pdf,image/*"
                              />
                              <label 
                                htmlFor={`file-input-${type}`} 
                                className="btn btn-sm btn-lime"
                                style={{ gap: '0.3rem', cursor: 'pointer', margin: 0 }}
                              >
                                <UploadCloud size={11} />
                                {uploadingDocType === type ? 'CARGANDO...' : uploadedDoc ? 'REEMPLAZAR' : 'SUBIR'}
                              </label>
                            </div>
                          )}

                          {/* Agency / Admin Document Approvals */}
                          {(isAgency || isAdmin) && canEdit && uploadedDoc && docStatus === 'uploaded' && (
                            <div style={{ display: 'flex', gap: '0.3rem' }}>
                              <button 
                                className="btn btn-sm btn-outline"
                                onClick={() => handleApproveDocument(uploadedDoc.id)}
                                style={{ borderColor: 'rgba(163,230,53,0.3)', color: 'var(--lime)', gap: '0.25rem' }}
                              >
                                APROBAR
                              </button>
                              <button 
                                className="btn btn-sm btn-outline"
                                onClick={() => { setRejectionDocId(uploadedDoc.id); setRejectionNotes(''); }}
                                style={{ borderColor: 'rgba(239,68,68,0.3)', color: '#F87171', gap: '0.25rem' }}
                              >
                                RECHAZAR
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── MODAL PARA RECHAZO DE DOCUMENTO (Comentarios) ── */}
      {rejectionDocId && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ width: '100%', maxWidth: '420px', background: 'var(--black-2)', border: '1px solid var(--border-2)', padding: '1.25rem', borderRadius: 'var(--radius-lg)' }} className="animate-in">
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#F87171', marginBottom: '0.5rem', display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
              <ShieldAlert size={16} /> Rechazar Documentación
            </h4>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-3)', marginBottom: '1rem' }}>
              Por favor indica la razón detallada del rechazo. El cliente la verá reflejada en su panel para poder realizar la corrección oportuna.
            </p>
            
            <form onSubmit={handleRejectDocumentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <textarea 
                className="input-field" 
                rows={4} 
                placeholder="Ej. El pasaporte está recortado o tiene reflejos que impiden leer el número. Por favor sube una foto plana y completa." 
                value={rejectionNotes}
                onChange={e => setRejectionNotes(e.target.value)}
                required
                style={{ resize: 'none', fontSize: '0.8rem', padding: '0.5rem' }}
              />
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setRejectionDocId(null)}>CANCELAR</button>
                <button type="submit" className="btn btn-sm btn-lime" style={{ background: '#EF4444', borderColor: '#EF4444', color: '#fff' }}>RECHAZAR DOCUMENTO</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default DocumentsPage;
