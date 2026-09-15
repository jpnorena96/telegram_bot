import React from 'react';

const IdentificationNumbersSection = ({ data, updateData }) => {
  return (
    <div style={{ border: '1px solid #999', padding: '15px', marginBottom: '20px', backgroundColor: '#f9f9f9' }}>
      <div style={{ marginBottom: '15px' }}>
        <span className="tooltip_text" title="Número de Identificación Nacional">
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '3px' }}>National Identification Number</label>
        </span>
        <input 
          type="text" 
          maxLength="20" 
          disabled={data?.nationalIdNA}
          value={data?.nationalIdNA ? '' : (data?.nationalId || '')} 
          onChange={(e) => updateData({ nationalId: e.target.value })}
          style={{ width: '400px', padding: '3px', border: '1px solid #7f9db9', backgroundColor: data?.nationalIdNA ? '#ebebe4' : 'white' }} 
        />
        <div style={{ marginTop: '5px' }}>
          <span className="tooltip_text" title="No aplica">
            <input 
              type="checkbox" 
              id="nationalIdNA" 
              checked={data?.nationalIdNA || false} 
              onChange={(e) => updateData({ nationalIdNA: e.target.checked })} 
            />
            <label htmlFor="nationalIdNA" style={{ marginLeft: '5px', fontSize: '12px' }}>Does Not Apply</label>
          </span>
        </div>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <span className="tooltip_text" title="Número de Seguridad Social de los Estados Unidos de Norteamérica">
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '3px' }}>U.S. Social Security Number</label>
        </span>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <input 
            type="text" 
            maxLength="3" 
            disabled={data?.ssnNA}
            value={data?.ssnNA ? '' : (data?.ssn1 || '')} 
            onChange={(e) => updateData({ ssn1: e.target.value })}
            style={{ width: '35px', padding: '3px', border: '1px solid #7f9db9', backgroundColor: data?.ssnNA ? '#ebebe4' : 'white' }} 
          /> - 
          <input 
            type="text" 
            maxLength="2" 
            disabled={data?.ssnNA}
            value={data?.ssnNA ? '' : (data?.ssn2 || '')} 
            onChange={(e) => updateData({ ssn2: e.target.value })}
            style={{ width: '30px', padding: '3px', border: '1px solid #7f9db9', backgroundColor: data?.ssnNA ? '#ebebe4' : 'white', margin: '0 5px' }} 
          /> - 
          <input 
            type="text" 
            maxLength="4" 
            disabled={data?.ssnNA}
            value={data?.ssnNA ? '' : (data?.ssn3 || '')} 
            onChange={(e) => updateData({ ssn3: e.target.value })}
            style={{ width: '45px', padding: '3px', border: '1px solid #7f9db9', backgroundColor: data?.ssnNA ? '#ebebe4' : 'white', margin: '0 5px' }} 
          />
          <span style={{ marginLeft: '15px' }} className="tooltip_text" title="No aplica">
            <input 
              type="checkbox" 
              id="ssnNA" 
              checked={data?.ssnNA || false} 
              onChange={(e) => updateData({ ssnNA: e.target.checked })} 
            />
            <label htmlFor="ssnNA" style={{ marginLeft: '5px', fontSize: '12px' }}>Does Not Apply</label>
          </span>
        </div>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <span className="tooltip_text" title="Número de Identificación de Contribuyente en los Estados Unidos de Norteamérica">
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '3px' }}>U.S. Taxpayer ID Number</label>
        </span>
        <input 
          type="text" 
          maxLength="20" 
          disabled={data?.taxIdNA}
          value={data?.taxIdNA ? '' : (data?.taxId || '')} 
          onChange={(e) => updateData({ taxId: e.target.value })}
          style={{ width: '400px', padding: '3px', border: '1px solid #7f9db9', backgroundColor: data?.taxIdNA ? '#ebebe4' : 'white' }} 
        />
        <div style={{ marginTop: '5px' }}>
          <span className="tooltip_text" title="No aplica">
            <input 
              type="checkbox" 
              id="taxIdNA" 
              checked={data?.taxIdNA || false} 
              onChange={(e) => updateData({ taxIdNA: e.target.checked })} 
            />
            <label htmlFor="taxIdNA" style={{ marginLeft: '5px', fontSize: '12px' }}>Does Not Apply</label>
          </span>
        </div>
      </div>

      <div style={{ fontSize: '11px', color: '#666', marginTop: '5px' }}>
        <strong>Help: Identification Numbers</strong><br/>
        Your National ID Number is a unique number that your government provides. The U.S. Government provides unique numbers to those who seek employment (Social Security Number) or pay taxes (Taxpayer ID).
      </div>
    </div>
  );
};

export default IdentificationNumbersSection;