import React from 'react';
import './ds160.css';

import NationalitySection from './personal2/NationalitySection';
import OtherNationalitiesSection from './personal2/OtherNationalitiesSection';
import PermanentResidentSection from './personal2/PermanentResidentSection';
import IdentificationNumbersSection from './personal2/IdentificationNumbersSection';

const PersonalInformation2 = ({ data, updateData }) => {
  return (
    <div className="ds160-container" style={{ fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#333' }}>
      <table border="0" cellPadding="0" cellSpacing="0" style={{ textAlign: 'center', width: '100%', maxWidth: '600px', margin: '0' }}>
        <tbody>
          <tr>
            <td style={{ textAlign: 'left', verticalAlign: 'top' }}>
              <h2 style={{ color: '#003366', borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>
                <span className="tooltip_text" title="Información personal 2">
                  Personal Information 2
                </span>
              </h2>
            </td>
          </tr>
        </tbody>
      </table>
      
      <br />
      
      <div className="note" style={{ marginBottom: '20px', fontWeight: 'bold', fontSize: '12px' }}>
        NOTE: Data on this page must match the information as it is written in your passport.
      </div>

      <NationalitySection data={data} updateData={updateData} />
      <OtherNationalitiesSection data={data} updateData={updateData} />
      <PermanentResidentSection data={data} updateData={updateData} />
      <IdentificationNumbersSection data={data} updateData={updateData} />

    </div>
  );
};

export default PersonalInformation2;