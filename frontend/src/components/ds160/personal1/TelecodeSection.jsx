import React from 'react';

const TelecodeSection = ({ data, updateData }) => {
  return (
    <div style={{ padding: '15px', marginBottom: '20px' }}>
      <label style={{ display: 'block', marginBottom: '12px' }}>
        Do you have a telecode that represents your name?
        <br />
        <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 400, textTransform: 'none' }}>¿Tiene un código telefónico (telecode) que represente su nombre? (Común en Asia)</span>
      </label>
      
      <div style={{ display: 'inline-flex', gap: '8px', marginBottom: '20px', backgroundColor: '#F1F5F9', padding: '4px', borderRadius: '10px' }}>
        <button 
          type="button"
          onClick={() => updateData({ telecode: 'Y' })} 
          style={{ width: '100px', padding: '8px 16px', borderRadius: '6px', border: 'none', backgroundColor: data?.telecode === 'Y' ? '#FFFFFF' : 'transparent', color: data?.telecode === 'Y' ? '#2563EB' : '#475569', fontWeight: data?.telecode === 'Y' ? 700 : 500, cursor: 'pointer', transition: 'all 0.2s', boxShadow: data?.telecode === 'Y' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
        >
          Sí (Yes)
        </button>
        <button 
          type="button"
          onClick={() => updateData({ telecode: 'N' })} 
          style={{ width: '100px', padding: '8px 16px', borderRadius: '6px', border: 'none', backgroundColor: data?.telecode === 'N' ? '#FFFFFF' : 'transparent', color: data?.telecode === 'N' ? '#2563EB' : '#475569', fontWeight: data?.telecode === 'N' ? 700 : 500, cursor: 'pointer', transition: 'all 0.2s', boxShadow: data?.telecode === 'N' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
        >
          No
        </button>
      </div>

      {data?.telecode === 'Y' && (
        <div style={{ border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', padding: '20px', borderRadius: '12px' }}>
          <h4 style={{ margin: '0 0 15px 0', fontSize: '14px', color: '#1E293B' }}>Proporcione los siguientes códigos:</h4>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={{ fontSize: '12px' }}>Telecode Surnames (Código de Apellidos)</label>
              <input 
                type="text" 
                placeholder="Ej: 1234 5678"
                title="Must only contain sets of four numbers separated by spaces"
                value={data?.telecodeSurnames || ''} 
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9 ]/g, '');
                  updateData({ telecodeSurnames: val });
                }}
              />
            </div>
            
            <div>
              <label style={{ fontSize: '12px' }}>Telecode Given Names (Código de Nombres)</label>
              <input 
                type="text" 
                placeholder="Ej: 1234 5678"
                title="Must only contain sets of four numbers separated by spaces"
                value={data?.telecodeGivenNames || ''} 
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9 ]/g, '');
                  updateData({ telecodeGivenNames: val });
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TelecodeSection;
