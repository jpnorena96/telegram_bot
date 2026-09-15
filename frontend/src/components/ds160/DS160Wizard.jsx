import React, { useState } from 'react';
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

const DS160Wizard = () => {
  const [formData, setFormData] = useState({});
  const [currentStep, setCurrentStep] = useState(1);

  const updateData = (newData) => {
    setFormData(prev => ({ ...prev, ...newData }));
  };

  const handleGenerateJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(formData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "datos.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const nextStep = () => setCurrentStep(prev => prev + 1);
  const prevStep = () => setCurrentStep(prev => prev - 1);

  return (
    <div style={{ backgroundColor: '#fff', minHeight: '100vh', padding: '20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', border: '1px solid #ccc', backgroundColor: '#fff', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
        <div style={{ backgroundColor: '#003366', color: 'white', padding: '10px 20px', fontSize: '18px', fontWeight: 'bold' }}>
          Nonimmigrant Visa Application
        </div>
        
        <div style={{ padding: '20px' }}>
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
          
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #ccc', paddingTop: '20px' }}>
            <button 
              onClick={prevStep}
              disabled={currentStep === 1}
              style={{ padding: '10px 20px', backgroundColor: currentStep === 1 ? '#ccc' : '#0055a5', color: 'white', border: 'none', cursor: currentStep === 1 ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: 'bold' }}
            >
              Anterior
            </button>
            
            <button 
              onClick={handleGenerateJSON}
              style={{ padding: '10px 20px', backgroundColor: '#10b981', color: 'white', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}
            >
              Generar JSON (Prueba)
            </button>
            
            <button 
              onClick={nextStep}
                                          disabled={currentStep === 18}
              style={{ padding: '10px 20px', backgroundColor: currentStep === 18 ? '#ccc' : '#0055a5', color: 'white', border: 'none', cursor: currentStep === 18 ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: 'bold' }}
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DS160Wizard;