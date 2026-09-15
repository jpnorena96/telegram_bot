import React from 'react';
import './ds160.css';

import NameSection from './personal1/NameSection';
import OtherNamesSection from './personal1/OtherNamesSection';
import TelecodeSection from './personal1/TelecodeSection';
import DemographicsSection from './personal1/DemographicsSection';
import BirthSection from './personal1/BirthSection';

const PersonalInformation1 = ({ data, updateData }) => {
  return (
    <div className="ds160-container" style={{ fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#333' }}>
      <table border="0" cellPadding="0" cellSpacing="0" style={{ textAlign: 'center', width: '100%', maxWidth: '600px', margin: '0' }}>
        <tbody>
          <tr>
            <td style={{ textAlign: 'left', verticalAlign: 'top' }}>
              <h2 style={{ color: '#003366', borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>
                <span className="tooltip_text" title="InformaciA3n personal 1">
                  Personal Information 1
                </span>
              </h2>
            </td>
            <td style={{ textAlign: 'right', width: 'auto', paddingLeft: '20px' }}>
              <br />
              <div className="burden" style={{ border: '1px solid #ccc', padding: '5px', display: 'inline-block' }}>
                <table style={{ fontSize: '11px', textAlign: 'left' }}>
                  <tbody>
                    <tr>
                      <td style={{ whiteSpace: 'nowrap', fontWeight: 'bold' }}>OMB CONTROL NUMBER:</td>
                      <td style={{ whiteSpace: 'nowrap', paddingLeft: '5px' }}>1405-0182</td>
                    </tr>
                    <tr>
                      <td style={{ whiteSpace: 'nowrap', fontWeight: 'bold' }}>FORM NUMBER:</td>
                      <td style={{ whiteSpace: 'nowrap', paddingLeft: '5px' }}>DS-160</td>
                    </tr>
                    <tr>
                      <td style={{ whiteSpace: 'nowrap', fontWeight: 'bold' }}>EXPIRATION DATE:</td>
                      <td style={{ whiteSpace: 'nowrap', paddingLeft: '5px' }}>09/30/2023</td>
                    </tr>
                    <tr>
                      <td style={{ whiteSpace: 'nowrap', fontWeight: 'bold' }}>ESTIMATED BURDEN:</td>
                      <td style={{ whiteSpace: 'nowrap', paddingLeft: '5px' }}>90 MIN</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      
      <br />
      


      <div className="note" style={{ marginBottom: '20px', fontWeight: 'bold', fontSize: '12px' }}>
        NOTE: Data on this page must match the information as it is written in your passport.
      </div>

      <NameSection data={data} updateData={updateData} />
      <OtherNamesSection data={data} updateData={updateData} />
      <TelecodeSection data={data} updateData={updateData} />
      <DemographicsSection data={data} updateData={updateData} />
      <BirthSection data={data} updateData={updateData} />

    </div>
  );
};

export default PersonalInformation1;
