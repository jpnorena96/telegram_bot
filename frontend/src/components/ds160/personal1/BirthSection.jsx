import React from 'react';

const BirthSection = ({ data, updateData }) => {
  return (
    <div style={{ border: '1px solid #999', padding: '15px', marginBottom: '20px', backgroundColor: '#f9f9f9' }}>
      <h4 style={{ color: '#003366', marginTop: '0', marginBottom: '15px' }}>Date and Place of Birth</h4>
      
      <div style={{ marginBottom: '15px' }}>
        <span className="tooltip_text" title="Fecha de nacimiento">
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '3px' }}>Date</label>
        </span>
        <select 
          value={data?.dobDay || ''} 
          onChange={(e) => updateData({ dobDay: e.target.value })} 
          style={{ padding: '2px', marginRight: '5px', width: '50px' }}
        >
          <option value=""></option>
          {[...Array(31)].map((_, i) => <option key={i+1} value={i+1}>{(i+1).toString().padStart(2, '0')}</option>)}
        </select>
        <select 
          value={data?.dobMonth || ''} 
          onChange={(e) => updateData({ dobMonth: e.target.value })} 
          style={{ padding: '2px', marginRight: '5px', width: '60px' }}
        >
          <option value=""></option>
          <option value="JAN">JAN</option>
          <option value="FEB">FEB</option>
          <option value="MAR">MAR</option>
          <option value="APR">APR</option>
          <option value="MAY">MAY</option>
          <option value="JUN">JUN</option>
          <option value="JUL">JUL</option>
          <option value="AUG">AUG</option>
          <option value="SEP">SEP</option>
          <option value="OCT">OCT</option>
          <option value="NOV">NOV</option>
          <option value="DEC">DEC</option>
        </select>
        <input 
          type="text" 
          maxLength="4" 
          value={data?.dobYear || ''} 
          onChange={(e) => updateData({ dobYear: e.target.value })} 
          style={{ padding: '2px', width: '50px' }} 
        />
        <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>(Format: DD-MMM-YYYY)</div>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <span className="tooltip_text" title="Ciudad">
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '3px' }}>City</label>
        </span>
        <input 
          type="text" 
          maxLength="20" 
          value={data?.pobCity || ''} 
          onChange={(e) => updateData({ pobCity: e.target.value })} 
          style={{ width: '300px', padding: '3px', border: '1px solid #7f9db9' }} 
        />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <span className="tooltip_text" title="Estado/Provincia">
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '3px' }}>State/Province</label>
        </span>
        <input 
          type="text" 
          maxLength="20" 
          disabled={data?.pobStateNA} 
          value={data?.pobStateNA ? '' : (data?.pobState || '')} 
          onChange={(e) => updateData({ pobState: e.target.value })} 
          style={{ width: '300px', padding: '3px', border: '1px solid #7f9db9', backgroundColor: data?.pobStateNA ? '#ebebe4' : 'white' }} 
        />
        <div style={{ marginTop: '5px' }}>
          <span className="tooltip_text" title="No aplica">
            <input 
              type="checkbox" 
              id="pobStateNA" 
              checked={data?.pobStateNA || false} 
              onChange={(e) => updateData({ pobStateNA: e.target.checked })} 
            />
            <label htmlFor="pobStateNA" style={{ marginLeft: '5px', fontSize: '12px' }}>Does Not Apply</label>
          </span>
        </div>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <span className="tooltip_text" title="PaA-s/RegiA3n">
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '3px' }}>Country/Region</label>
        </span>
        <select 
          value={data?.pobCountry || ''} 
          onChange={(e) => updateData({ pobCountry: e.target.value })} 
          style={{ padding: '2px', width: '300px', border: '1px solid #7f9db9' }}
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

export default BirthSection;
