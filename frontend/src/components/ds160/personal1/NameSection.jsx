import React from 'react';

const NameSection = ({ data, updateData }) => {
  return (
    <div style={{ padding: '15px', marginBottom: '20px' }}>
      <h3 style={{ fontSize: '1.1rem', color: '#1E293B', marginBottom: '16px', fontWeight: 700, borderBottom: '1px solid #E2E8F0', paddingBottom: '8px' }}>
        Identidad Principal
      </h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div>
          <label>Surnames (Apellidos)</label>
          <input 
            type="text" 
            maxLength="33" 
            value={data?.surname || ''}
            onChange={(e) => updateData({ surname: e.target.value })}
            placeholder="Ej. FERNANDEZ GARCIA"
          />
        </div>

        <div>
          <label>Given Names (Nombres)</label>
          <input 
            type="text" 
            maxLength="33" 
            value={data?.givenName || ''}
            onChange={(e) => updateData({ givenName: e.target.value })}
            placeholder="Ej. JUAN MIGUEL"
          />
        </div>
      </div>

      <div style={{ marginTop: '20px' }}>
        <label>Full Name in Native Alphabet (Nombre en alfabeto nativo)</label>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px' }}>
          <input 
            type="text" 
            maxLength="100" 
            disabled={data?.nativeName === 'NA'}
            value={data?.nativeName === 'NA' ? '' : (data?.nativeNameText || '')}
            onChange={(e) => updateData({ nativeNameText: e.target.value })}
            style={{ flex: 1 }}
          />
          <div style={{ display: 'flex', alignItems: 'center', backgroundColor: data?.nativeName === 'NA' ? '#EFF6FF' : '#F1F5F9', padding: '12px 16px', borderRadius: '8px', border: data?.nativeName === 'NA' ? '1px solid #BFDBFE' : '1px solid #E2E8F0', cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => updateData({ nativeName: data?.nativeName === 'NA' ? '' : 'NA' })}>
            <input 
              type="checkbox" 
              checked={data?.nativeName === 'NA'}
              onChange={() => {}} // Handled by div click
              style={{ margin: 0, pointerEvents: 'none' }}
            />
            <span style={{ fontSize: '13px', fontWeight: 600, color: data?.nativeName === 'NA' ? '#1D4ED8' : '#475569' }}>
              Does Not Apply (No Aplica)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NameSection;
