import React from 'react';

const PermanentResidentSection = ({ data, updateData }) => {
  return (
    <div style={{ border: '1px solid #999', padding: '15px', marginBottom: '20px', backgroundColor: '#f9f9f9' }}>
      <div style={{ marginBottom: '15px' }}>
        <span className="tooltip_text" title="Es usted residente permanente de algún país/región que no sea su país/región de origen (nacionalidad) arriba indicadas?">
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>
            Are you a permanent resident of a country/region other than your country/region of origin (nationality) indicated above?
          </label>
        </span>
        <div>
          <label style={{ marginRight: '15px' }}>
            <input 
              type="radio" 
              name="permResidentOther" 
              value="Y" 
              checked={data?.permResidentOther === 'Y'} 
              onChange={() => updateData({ permResidentOther: 'Y' })} 
            /> Yes
          </label>
          <label>
            <input 
              type="radio" 
              name="permResidentOther" 
              value="N" 
              checked={data?.permResidentOther === 'N'} 
              onChange={() => updateData({ permResidentOther: 'N' })} 
            /> No
          </label>
        </div>
      </div>
      {data?.permResidentOther === 'Y' && (
        <div style={{ borderTop: '1px solid #ccc', paddingTop: '15px', marginTop: '15px' }}>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '3px' }}>Other Permanent Resident Country/Region</label>
            <select 
              value={data?.permResidentOtherCountry || ''} 
              onChange={(e) => updateData({ permResidentOtherCountry: e.target.value })} 
              style={{ width: '340px', padding: '2px', border: '1px solid #7f9db9' }}
            >
              <option value="">- Select One -</option>
              <option value="MEX">MEXICO</option>
              <option value="COL">COLOMBIA</option>
            </select>
          </div>
        </div>
      )}
      <div style={{ fontSize: '11px', color: '#666', marginTop: '5px' }}>
        <strong>Help: Permanent Resident</strong><br/>
        Permanent resident means any individual who has been legally granted by a country/region permission to live and work without time limitation in that country/region.
      </div>
    </div>
  );
};

export default PermanentResidentSection;