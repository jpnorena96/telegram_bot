import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import '../../components/ds160/ds160.css';

// Import all sections
import PersonalInformation1 from '../../components/ds160/PersonalInformation1';
import PersonalInformation2 from '../../components/ds160/PersonalInformation2';
import TravelInformation from '../../components/ds160/TravelInformation';
import TravelCompanions from '../../components/ds160/TravelCompanions';
import AddressPhoneInformation from '../../components/ds160/AddressPhoneInformation';
import PassportInformation from '../../components/ds160/PassportInformation';
import USContactInformation from '../../components/ds160/USContactInformation';
import FamilyInformation from '../../components/ds160/FamilyInformation';
import WorkEducationInformation from '../../components/ds160/WorkEducationInformation';
import PreviousWorkEducation from '../../components/ds160/PreviousWorkEducation';
import AdditionalWorkEducation from '../../components/ds160/AdditionalWorkEducation';
import SecurityBackground1 from '../../components/ds160/SecurityBackground1';
import SecurityBackground2 from '../../components/ds160/SecurityBackground2';
import SecurityBackground3 from '../../components/ds160/SecurityBackground3';
import SecurityBackground4 from '../../components/ds160/SecurityBackground4';
import SecurityBackground5 from '../../components/ds160/SecurityBackground5';
import PhotoUpload from '../../components/ds160/PhotoUpload';
import PhotoUploadSubmit from '../../components/ds160/PhotoUploadSubmit';

import datosBase from '../../../../backend/visas/datos.json'; // using local for now

const DS160PrintView = () => {
  const { id } = useParams();
  const [data, setData] = useState(datosBase); // In reality, fetch from API using 'id'

  useEffect(() => {
    const timer = setTimeout(() => {
      window.print();
    }, 1500);
    return () => clearTimeout(timer);
  }, [id]);

  const updateData = () => {};

  return (
    <div style={{ backgroundColor: '#fff', padding: '20px', minHeight: '100vh' }}>
      
      <div className="no-print" style={{ textAlign: 'center', marginBottom: '20px' }}>
        <button 
          onClick={() => window.print()} 
          style={{ padding: '10px 20px', background: '#0B3B60', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px' }}
        >
          Imprimir / Guardar PDF Manualmente
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        <PersonalInformation1 data={data} updateData={updateData} />
        <PersonalInformation2 data={data} updateData={updateData} />
        <AddressPhoneInformation data={data} updateData={updateData} />
        <PassportInformation data={data} updateData={updateData} />
        <TravelInformation data={data} updateData={updateData} />
        <TravelCompanions data={data} updateData={updateData} />
        <USContactInformation data={data} updateData={updateData} />
        <FamilyInformation data={data} updateData={updateData} />
        <WorkEducationInformation data={data} updateData={updateData} />
        <PreviousWorkEducation data={data} updateData={updateData} />
        <AdditionalWorkEducation data={data} updateData={updateData} />
        <SecurityBackground1 data={data} updateData={updateData} />
        <SecurityBackground2 data={data} updateData={updateData} />
        <SecurityBackground3 data={data} updateData={updateData} />
        <SecurityBackground4 data={data} updateData={updateData} />
        <SecurityBackground5 data={data} updateData={updateData} />
      </div>
    </div>
  );
};

export default DS160PrintView;
