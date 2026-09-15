import React from 'react';

const NameSection = ({ data, updateData }) => {
  return (
    <div style={{ border: '1px solid #999', padding: '15px', marginBottom: '20px', backgroundColor: '#f9f9f9' }}>
      <div style={{ marginBottom: '15px' }}>
        <span className="tooltip_text" title="Apellidos">
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '3px' }}>Surnames</label>
        </span>
        <input 
          type="text" 
          maxLength="33" 
          value={data?.surname || ''}
          onChange={(e) => updateData({ surname: e.target.value })}
          style={{ width: '400px', padding: '3px', border: '1px solid #7f9db9' }} 
        />
        <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
          <span className="tooltip_text" title="(Por ejemplo:FERNANDEZ GARCIA)">(e.g., FERNANDEZ GARCIA)</span>
        </div>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <span className="tooltip_text" title="Nombres de pila">
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '3px' }}>Given Names</label>
        </span>
        <input 
          type="text" 
          maxLength="33" 
          value={data?.givenName || ''}
          onChange={(e) => updateData({ givenName: e.target.value })}
          style={{ width: '400px', padding: '3px', border: '1px solid #7f9db9' }} 
        />
        <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
          <span className="tooltip_text" title="(por ejemplo: Juan Miguel)">(e.g., JUAN MIGUEL)</span>
        </div>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <span className="tooltip_text" title="Nombre completo en su alfabeto nativo">
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '3px' }}>Full Name in Native Alphabet</label>
        </span>
        <input 
          type="text" 
          maxLength="100" 
          disabled={data?.nativeName === 'NA'}
          value={data?.nativeName === 'NA' ? '' : (data?.nativeNameText || '')}
          onChange={(e) => updateData({ nativeNameText: e.target.value })}
          style={{ width: '400px', padding: '3px', border: '1px solid #7f9db9', backgroundColor: data?.nativeName === 'NA' ? '#ebebe4' : 'white' }} 
        />
        <div style={{ marginTop: '5px' }}>
          <span className="tooltip_text" title="No aplica/TecnologA-a no disponible">
            <input 
              type="checkbox" 
              id="nativeNameNA"
              checked={data?.nativeName === 'NA'}
              onChange={(e) => { 
                updateData({ nativeName: e.target.checked ? 'NA' : '' }); 
              }}
            />
            <label htmlFor="nativeNameNA" style={{ marginLeft: '5px', fontSize: '12px' }}>Does Not Apply/Technology Not Available</label>
          </span>
        </div>
      </div>
    </div>
  );
};

export default NameSection;
