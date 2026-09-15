import React from 'react';

const TelecodeSection = ({ data, updateData }) => {
  return (
    <div style={{ border: '1px solid #999', padding: '15px', marginBottom: '20px', backgroundColor: '#f9f9f9' }}>
      <div style={{ marginBottom: '15px' }}>
        <span className="tooltip_text" title="Telecode">
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>
            Do you have a telecode that represents your name?
          </label>
        </span>
        <div>
          <label style={{ marginRight: '15px' }}>
            <input 
              type="radio" 
              name="telecode" 
              value="Y" 
              checked={data?.telecode === 'Y'} 
              onChange={() => updateData({ telecode: 'Y' })} 
            /> Yes
          </label>
          <label>
            <input 
              type="radio" 
              name="telecode" 
              value="N" 
              checked={data?.telecode === 'N'} 
              onChange={() => updateData({ telecode: 'N' })} 
            /> No
          </label>
        </div>
      </div>

      {data?.telecode === 'Y' && (
        <div style={{ borderTop: '1px solid #ccc', paddingTop: '15px', marginTop: '15px' }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '13px' }}>Provide the following information:</h4>
          
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '3px' }}>Telecode Surnames</label>
            <input 
              type="text" 
              placeholder="Ej: 1234 5678"
              title="Must only contain sets of four numbers separated by spaces"
              value={data?.telecodeSurnames || ''} 
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9 ]/g, '');
                updateData({ telecodeSurnames: val });
              }}
              style={{ width: '400px', padding: '3px', border: '1px solid #7f9db9' }} 
            />
          </div>
          
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '3px' }}>Telecode Given Names</label>
            <input 
              type="text" 
              placeholder="Ej: 1234 5678"
              title="Must only contain sets of four numbers separated by spaces"
              value={data?.telecodeGivenNames || ''} 
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9 ]/g, '');
                updateData({ telecodeGivenNames: val });
              }}
              style={{ width: '400px', padding: '3px', border: '1px solid #7f9db9' }} 
            />
          </div>
        </div>
      )}

      <div style={{ fontSize: '11px', color: '#666', marginTop: '5px' }}>
        <strong>Help: Telecode</strong><br/>
        Telecodes are 4 digit code numbers that represent characters in some non-Roman alphabet names.
      </div>
    </div>
  );
};

export default TelecodeSection;
