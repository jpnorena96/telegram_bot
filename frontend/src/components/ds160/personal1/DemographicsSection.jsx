import React from 'react';

const DemographicsSection = ({ data, updateData }) => {
  return (
    <div style={{ border: '1px solid #999', padding: '15px', marginBottom: '20px', backgroundColor: '#f9f9f9' }}>
      <div style={{ marginBottom: '15px' }}>
        <span className="tooltip_text" title="Sexo">
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '3px' }}>Sex</label>
        </span>
        <select 
          value={data?.gender || ''} 
          onChange={(e) => updateData({ gender: e.target.value })} 
          style={{ padding: '2px', border: '1px solid #7f9db9' }}
        >
          <option value="">- Select One -</option>
          <option value="M">MALE</option>
          <option value="F">FEMALE</option>
        </select>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <span className="tooltip_text" title="Estado civil">
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '3px' }}>Marital Status</label>
        </span>
        <select 
          value={data?.marital || ''} 
          onChange={(e) => updateData({ marital: e.target.value })} 
          style={{ padding: '2px', border: '1px solid #7f9db9' }}
        >
          <option value="">-Select One-</option>
          <option value="M">MARRIED</option>
          <option value="C">COMMON LAW MARRIAGE</option>
          <option value="P">CIVIL UNION/DOMESTIC PARTNERSHIP</option>
          <option value="S">SINGLE</option>
          <option value="W">WIDOWED</option>
          <option value="D">DIVORCED</option>
          <option value="L">LEGALLY SEPARATED</option>
          <option value="O">OTHER</option>
        </select>
      </div>
    </div>
  );
};

export default DemographicsSection;
