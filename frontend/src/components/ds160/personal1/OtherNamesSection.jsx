import React from 'react';

const OtherNamesSection = ({ data, updateData }) => {
  // Ensure we have an array for multiple names
  const otherNamesList = data?.otherNamesList || [{ surname: '', givenName: '' }];

  const handleAdd = () => {
    updateData({ otherNamesList: [...otherNamesList, { surname: '', givenName: '' }] });
  };

  const handleRemove = (index) => {
    const newList = otherNamesList.filter((_, i) => i !== index);
    updateData({ otherNamesList: newList.length ? newList : [{ surname: '', givenName: '' }] });
  };

  const handleChange = (index, field, value) => {
    const newList = [...otherNamesList];
    newList[index][field] = value;
    updateData({ otherNamesList: newList });
  };

  return (
    <div style={{ padding: '15px', marginBottom: '20px' }}>
      <label style={{ display: 'block', marginBottom: '12px' }}>
        Have you ever used other names (i.e., maiden, religious, professional, alias, etc.)?
        <br />
        <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 400, textTransform: 'none' }}>¿Ha utilizado alguna vez otros nombres (de soltera, religiosos, profesionales, alias, etc.)?</span>
      </label>
      
      <div style={{ display: 'inline-flex', gap: '8px', marginBottom: '20px', backgroundColor: '#F1F5F9', padding: '4px', borderRadius: '10px' }}>
        <button 
          type="button"
          onClick={() => updateData({ otherNames: 'Y' })} 
          style={{ width: '100px', padding: '8px 16px', borderRadius: '6px', border: 'none', backgroundColor: data?.otherNames === 'Y' ? '#FFFFFF' : 'transparent', color: data?.otherNames === 'Y' ? '#2563EB' : '#475569', fontWeight: data?.otherNames === 'Y' ? 700 : 500, cursor: 'pointer', transition: 'all 0.2s', boxShadow: data?.otherNames === 'Y' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
        >
          Sí (Yes)
        </button>
        <button 
          type="button"
          onClick={() => updateData({ otherNames: 'N' })} 
          style={{ width: '100px', padding: '8px 16px', borderRadius: '6px', border: 'none', backgroundColor: data?.otherNames === 'N' ? '#FFFFFF' : 'transparent', color: data?.otherNames === 'N' ? '#2563EB' : '#475569', fontWeight: data?.otherNames === 'N' ? 700 : 500, cursor: 'pointer', transition: 'all 0.2s', boxShadow: data?.otherNames === 'N' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
        >
          No
        </button>
      </div>

      {data?.otherNames === 'Y' && (
        <div style={{ border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', padding: '20px', borderRadius: '12px' }}>
          <h4 style={{ margin: '0 0 15px 0', fontSize: '14px', color: '#1E293B' }}>Proporcione los siguientes nombres adicionales:</h4>
          
          {otherNamesList.map((item, index) => (
            <div key={index} style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: index < otherNamesList.length - 1 ? '1px dashed #CBD5E1' : 'none', position: 'relative' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ fontSize: '12px' }}>Other Surnames (Otros Apellidos)</label>
                  <input 
                    type="text" 
                    maxLength="33" 
                    value={item.surname} 
                    onChange={(e) => handleChange(index, 'surname', e.target.value)} 
                    placeholder="Ej. GARCIA PEREZ"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px' }}>Other Given Names (Otros Nombres)</label>
                  <input 
                    type="text" 
                    maxLength="33" 
                    value={item.givenName} 
                    onChange={(e) => handleChange(index, 'givenName', e.target.value)} 
                    placeholder="Ej. MARIA"
                  />
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button 
                  type="button"
                  onClick={() => handleRemove(index)} 
                  style={{ backgroundColor: 'transparent', color: '#EF4444', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
                >
                  Eliminar este nombre
                </button>
              </div>
            </div>
          ))}

          <button 
            type="button"
            onClick={handleAdd}
            style={{ backgroundColor: '#F1F5F9', color: '#334155', border: '1px solid #CBD5E1', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            + Añadir Otro Nombre
          </button>
        </div>
      )}
    </div>
  );
};

export default OtherNamesSection;
