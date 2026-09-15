import React from 'react';

const NationalitySection = ({ data, updateData }) => {
  return (
    <div style={{ border: '1px solid #999', padding: '15px', marginBottom: '20px', backgroundColor: '#f9f9f9' }}>
      <div style={{ marginBottom: '15px' }}>
        <span className="tooltip_text" title="Nacionalidad">
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '3px' }}>Country/Region of Origin (Nationality)</label>
        </span>
        <select 
          value={data?.nationality || ''} 
          onChange={(e) => updateData({ nationality: e.target.value })} 
          style={{ width: '340px', padding: '2px', border: '1px solid #7f9db9' }}
        >
          <option value="">- Select One -</option>
          <option value="MEX">MEXICO</option>
          <option value="COL">COLOMBIA</option>
          <option value="ARG">ARGENTINA</option>
          <option value="USA">UNITED STATES OF AMERICA</option>
        </select>
      </div>
    </div>
  );
};

export default NationalitySection;