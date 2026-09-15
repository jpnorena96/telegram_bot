content = '''import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import '../components/ds160/ds160.css';

// Import all sections
import PersonalInformation1 from '../components/ds160/PersonalInformation1';
import PersonalInformation2 from '../components/ds160/PersonalInformation2';
import AddressAndPhone from '../components/ds160/AddressAndPhone';
import PassportInformation from '../components/ds160/PassportInformation';
import TravelInformation from '../components/ds160/TravelInformation';
import TravelCompanions from '../components/ds160/TravelCompanions';
import PreviousUSATravel from '../components/ds160/PreviousUSATravel';
import USContact from '../components/ds160/USContact';
import FamilyInformation from '../components/ds160/FamilyInformation';
import WorkEducation1 from '../components/ds160/WorkEducation1';
import WorkEducation2 from '../components/ds160/WorkEducation2';
import WorkEducation3 from '../components/ds160/WorkEducation3';
import SecurityBackground1 from '../components/ds160/SecurityBackground1';
import SecurityBackground2 from '../components/ds160/SecurityBackground2';
import SecurityBackground3 from '../components/ds160/SecurityBackground3';
import SecurityBackground4 from '../components/ds160/SecurityBackground4';
import SecurityBackground5 from '../components/ds160/SecurityBackground5';

import datosBase from '../../../backend/visas/datos.json'; // using local for now

const DS160PrintView = () => {
  const { id } = useParams();
  const [data, setData] = useState(datosBase); // In reality, fetch from API using 'id'

  useEffect(() => {
    // We delay the print dialogue slightly to allow images and styles to load
    const timer = setTimeout(() => {
      window.print();
    }, 1500);
    return () => clearTimeout(timer);
  }, [id]);

  // A dummy updateData function so child components don't crash when rendering
  const updateData = () => {};

  return (
    <div style={{ backgroundColor: '#fff', padding: '20px', minHeight: '100vh' }}>
      <style dangerouslySetInnerHTML={{__html: 
        @media print {
          body { background: white !important; -webkit-print-color-adjust: exact; }
          .no-print { display: none !important; }
          .ds160-container { box-shadow: none !important; margin: 0 !important; width: 100% !important; max-width: none !important; }
          button { display: none !important; }
        }
      }} />
      
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
        <AddressAndPhone data={data} updateData={updateData} />
        <PassportInformation data={data} updateData={updateData} />
        <TravelInformation data={data} updateData={updateData} />
        <TravelCompanions data={data} updateData={updateData} />
        <PreviousUSATravel data={data} updateData={updateData} />
        <USContact data={data} updateData={updateData} />
        <FamilyInformation data={data} updateData={updateData} />
        <WorkEducation1 data={data} updateData={updateData} />
        <WorkEducation2 data={data} updateData={updateData} />
        <WorkEducation3 data={data} updateData={updateData} />
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
'''

with open('src/pages/dashboard/DS160PrintView.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("File completely rewritten with correct syntax.")
