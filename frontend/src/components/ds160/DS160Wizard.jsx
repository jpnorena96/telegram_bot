import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import toast from 'react-hot-toast';
import './ds160-modern.css';
import { ShieldCheck, User, Plane, Users, MapPin, FileText, Phone, Briefcase, GraduationCap, AlertTriangle, Camera, CheckCircle2, Save, ChevronRight, ChevronLeft } from 'lucide-react';

import PersonalInformation1 from './PersonalInformation1';
import PersonalInformation2 from './PersonalInformation2';
import TravelInformation from './TravelInformation';
import TravelCompanions from './TravelCompanions';
import AddressPhoneInformation from './AddressPhoneInformation';
import PassportInformation from './PassportInformation';
import USContactInformation from './USContactInformation';
import FamilyInformation from './FamilyInformation';
import WorkEducationInformation from './WorkEducationInformation';
import PreviousWorkEducation from './PreviousWorkEducation';
import AdditionalWorkEducation from './AdditionalWorkEducation';
import SecurityBackground1 from './SecurityBackground1';
import SecurityBackground2 from './SecurityBackground2';
import SecurityBackground3 from './SecurityBackground3';
import SecurityBackground4 from './SecurityBackground4';
import SecurityBackground5 from './SecurityBackground5';
import PhotoUpload from './PhotoUpload';
import PhotoUploadSubmit from './PhotoUploadSubmit';

const DS160Wizard = ({ applicantId, isPublic = false, processId = null }) => {
  const [formData, setFormData] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isPublic && processId) {
      setLoading(true);
      fetch(`${api.url}/visa-processes/public/processes/${processId}/ds160`)
      .then(res => res.ok ? res.json() : {})
      .then(data => {
        if (data && Object.keys(data).length > 0) {
          setFormData(data);
        }
      })
      .catch(err => console.error("Error loading DS160 data:", err))
      .finally(() => setLoading(false));
    } else if (applicantId) {
      setLoading(true);
      fetch(`${api.url}/visa-processes/applicants/${applicantId}/ds160`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      .then(res => res.ok ? res.json() : {})
      .then(data => {
        if (data && Object.keys(data).length > 0) {
          setFormData(data);
        }
      })
      .catch(err => console.error("Error loading DS160 data:", err))
      .finally(() => setLoading(false));
    }
  }, [applicantId, isPublic, processId]);

  const updateData = (newData) => {
    setFormData(prev => ({ ...prev, ...newData }));
  };

  const initialLoadRef = useRef(true);

  // Debounced auto-save on formData change
  useEffect(() => {
    // Prevent saving on the first render or when data is empty
    if (initialLoadRef.current) {
      if (Object.keys(formData).length > 0) {
        initialLoadRef.current = false;
      }
      return;
    }

    const timer = setTimeout(() => {
      // Quiet save in the background
      handleSaveJSON(true);
    }, 2000); // 2-second debounce

    return () => clearTimeout(timer);
  }, [formData]);

  const handleSaveJSON = async (quiet = false) => {
    if (!applicantId && !isPublic) {
      if (!quiet) toast.error('No se ha especificado el solicitante');
      return;
    }
    
    try {
      let endpoint = '';
      let options = {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      };

      if (isPublic && processId) {
        endpoint = `${api.url}/visa-processes/public/processes/${processId}/ds160`;
      } else {
        endpoint = `${api.url}/visa-processes/applicants/${applicantId}/ds160`;
        options.headers['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
      }

      const res = await fetch(endpoint, options);
      if (res.ok) {
        if (!quiet) toast.success('Formulario guardado exitosamente.');
      } else {
        if (!quiet) toast.error('Error al guardar el formulario.');
      }
    } catch (e) {
      if (!quiet) toast.error('Error de red al guardar.');
    }
  };

  const handleNavigate = async (newStep) => {
    await handleSaveJSON(true); // Save silently in the background
    setCurrentStep(newStep);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top for better UX
  };

  const nextStep = () => handleNavigate(currentStep + 1);
  const prevStep = () => handleNavigate(currentStep - 1);

  const STEPS_CONFIG = [
    { id: 1, title: 'Personal 1', icon: <User size={18} />, group: 'Personal' },
    { id: 2, title: 'Personal 2', icon: <User size={18} />, group: 'Personal' },
    { id: 3, title: 'Viaje', icon: <Plane size={18} />, group: 'Viaje' },
    { id: 4, title: 'Acompañantes', icon: <Users size={18} />, group: 'Viaje' },
    { id: 5, title: 'Dirección y Teléfono', icon: <Phone size={18} />, group: 'Contacto' },
    { id: 6, title: 'Pasaporte', icon: <FileText size={18} />, group: 'Documentos' },
    { id: 7, title: 'Contacto en EE.UU.', icon: <MapPin size={18} />, group: 'Contacto' },
    { id: 8, title: 'Familiares', icon: <Users size={18} />, group: 'Familia' },
    { id: 9, title: 'Trabajo / Estudio', icon: <Briefcase size={18} />, group: 'Ocupación' },
    { id: 10, title: 'Trabajo Anterior', icon: <Briefcase size={18} />, group: 'Ocupación' },
    { id: 11, title: 'Info. Adicional', icon: <GraduationCap size={18} />, group: 'Ocupación' },
    { id: 12, title: 'Seguridad 1', icon: <AlertTriangle size={18} />, group: 'Seguridad' },
    { id: 13, title: 'Seguridad 2', icon: <AlertTriangle size={18} />, group: 'Seguridad' },
    { id: 14, title: 'Seguridad 3', icon: <AlertTriangle size={18} />, group: 'Seguridad' },
    { id: 15, title: 'Seguridad 4', icon: <AlertTriangle size={18} />, group: 'Seguridad' },
    { id: 16, title: 'Seguridad 5', icon: <AlertTriangle size={18} />, group: 'Seguridad' },
    { id: 17, title: 'Foto', icon: <Camera size={18} />, group: 'Finalización' },
    { id: 18, title: 'Revisión Final', icon: <CheckCircle2 size={18} />, group: 'Finalización' }
  ];

  return (
    <div className="ds160-modern-wrapper" style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      
      {/* SIDEBAR WIZARD STEPPER */}
      <div style={{ width: '280px', backgroundColor: '#FFFFFF', borderRight: '1px solid #E2E8F0', padding: '24px 0', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '0 24px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', border: 'none', padding: 0 }}>
            <ShieldCheck size={24} color="#2563EB" /> Configuración
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#64748B' }}>DS-160 Setup Assistant</p>
        </div>

        <div style={{ overflowY: 'auto', flex: 1, padding: '0 12px' }}>
          {STEPS_CONFIG.map((step, index) => {
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            // Only show group header if it's the first item in the group
            const isFirstInGroup = index === 0 || STEPS_CONFIG[index - 1].group !== step.group;

            return (
              <React.Fragment key={step.id}>
                {isFirstInGroup && (
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '16px 0 8px 12px' }}>
                    {step.group}
                  </div>
                )}
                <button
                  onClick={() => handleNavigate(step.id)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 12px',
                    backgroundColor: isActive ? '#EFF6FF' : 'transparent',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    color: isActive ? '#2563EB' : isCompleted ? '#10B981' : '#64748B',
                    fontWeight: isActive ? 700 : 500,
                    textAlign: 'left',
                    transition: 'all 0.2s',
                    marginBottom: '2px'
                  }}
                >
                  <div style={{ 
                    width: '28px', height: '28px', borderRadius: '50%', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backgroundColor: isActive ? '#2563EB' : isCompleted ? '#10B981' : '#F1F5F9',
                    color: isActive || isCompleted ? '#FFF' : '#94A3B8'
                  }}>
                    {isCompleted && !isActive ? <CheckCircle2 size={14} /> : step.icon}
                  </div>
                  <span style={{ fontSize: '0.85rem' }}>{step.title}</span>
                </button>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        
        {/* TOP HEADER */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '16px 32px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
          <div>
            <div style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600 }}>Paso {currentStep} de 18</div>
            <div style={{ width: '200px', height: '6px', backgroundColor: '#E2E8F0', borderRadius: '3px', marginTop: '6px', overflow: 'hidden' }}>
              <div style={{ width: `${(currentStep / 18) * 100}%`, height: '100%', backgroundColor: '#2563EB', transition: 'width 0.3s' }}></div>
            </div>
          </div>
          
          <button 
            onClick={handleSaveJSON}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: '#ECFDF5', color: '#10B981', border: '1px solid #34D399', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700, transition: 'all 0.2s' }}
          >
            <Save size={16} /> Guardar Progreso
          </button>
        </div>

        {/* SCROLLABLE FORM CONTENT */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            
            <div className="ds160-container-wrapper">
              {currentStep === 1 && <PersonalInformation1 data={formData} updateData={updateData} />}
              {currentStep === 2 && <PersonalInformation2 data={formData} updateData={updateData} />}
              {currentStep === 3 && <TravelInformation data={formData} updateData={updateData} />}
              {currentStep === 4 && <TravelCompanions data={formData} updateData={updateData} />}
              {currentStep === 5 && <AddressPhoneInformation data={formData} updateData={updateData} />}
              {currentStep === 6 && <PassportInformation data={formData} updateData={updateData} />}
              {currentStep === 7 && <USContactInformation data={formData} updateData={updateData} />}
              {currentStep === 8 && <FamilyInformation data={formData} updateData={updateData} />}
              {currentStep === 9 && <WorkEducationInformation data={formData} updateData={updateData} />}
              {currentStep === 10 && <PreviousWorkEducation data={formData} updateData={updateData} />}
              {currentStep === 11 && <AdditionalWorkEducation data={formData} updateData={updateData} />}
              {currentStep === 12 && <SecurityBackground1 data={formData} updateData={updateData} />}
              {currentStep === 13 && <SecurityBackground2 data={formData} updateData={updateData} />}
              {currentStep === 14 && <SecurityBackground3 data={formData} updateData={updateData} />}
              {currentStep === 15 && <SecurityBackground4 data={formData} updateData={updateData} />}
              {currentStep === 16 && <SecurityBackground5 data={formData} updateData={updateData} />}
              {currentStep === 17 && <PhotoUpload data={formData} updateData={updateData} />}
              {currentStep === 18 && <PhotoUploadSubmit data={formData} updateData={updateData} />}
            </div>
            
            {/* BOTTOM NAVIGATION */}
            <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button 
                onClick={prevStep}
                disabled={currentStep === 1}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', backgroundColor: '#FFFFFF', color: currentStep === 1 ? '#CBD5E1' : '#475569', border: '1px solid #E2E8F0', borderRadius: '10px', cursor: currentStep === 1 ? 'not-allowed' : 'pointer', fontSize: '0.9rem', fontWeight: 600, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
              >
                <ChevronLeft size={18} /> Anterior
              </button>
              
              <button 
                onClick={currentStep === 18 ? handleSaveJSON : nextStep}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 32px', backgroundColor: '#2563EB', color: '#FFFFFF', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 700, boxShadow: '0 4px 12px rgba(37,99,235,0.3)', transition: 'all 0.2s' }}
              >
                {currentStep === 18 ? 'Finalizar y Guardar' : 'Siguiente Paso'} {currentStep !== 18 && <ChevronRight size={18} />}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default DS160Wizard;