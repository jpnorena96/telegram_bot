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
    <div style={{ border: '1px solid #999', padding: '15px', marginBottom: '20px', backgroundColor: '#f9f9f9' }}>
      <div style={{ marginBottom: '15px' }}>
        <span className="tooltip_text" title="Otros nombres">
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>
            Have you ever used other names (i.e., maiden, religious, professional, alias, etc.)?
          </label>
        </span>
        <div>
          <label style={{ marginRight: '15px' }}>
            <input 
              type="radio" 
              name="otherNames" 
              value="Y" 
              checked={data?.otherNames === 'Y'} 
              onChange={() => updateData({ otherNames: 'Y' })} 
            /> Yes
          </label>
          <label>
            <input 
              type="radio" 
              name="otherNames" 
              value="N" 
              checked={data?.otherNames === 'N'} 
              onChange={() => updateData({ otherNames: 'N' })} 
            /> No
          </label>
        </div>
        
        <div style={{ fontSize: '11px', color: '#666', marginTop: '5px' }}>
          <strong>Help: Other Names</strong><br/>
          Other names used include your maiden name, religious name, professional name, or any other names which you are known by or have been known by in the past.
        </div>
      </div>

      {data?.otherNames === 'Y' && (
        <div style={{ borderTop: '1px solid #ccc', paddingTop: '15px', marginTop: '15px' }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '13px' }}>Provide the following information:</h4>
          
          {otherNamesList.map((item, index) => (
            <div key={index} style={{ marginBottom: '15px', paddingBottom: '15px', borderBottom: index < otherNamesList.length - 1 ? '1px dashed #ccc' : 'none' }}>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '3px' }}>Other Surnames Used (maiden, religious, professional, aliases, etc.)</label>
                <input 
                  type="text" 
                  value={item.surname} 
                  onChange={(e) => handleChange(index, 'surname', e.target.value)}
                  style={{ width: '400px', padding: '3px', border: '1px solid #7f9db9' }} 
                />
              </div>
              
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '3px' }}>Other Given Names Used</label>
                <input 
                  type="text" 
                  value={item.givenName} 
                  onChange={(e) => handleChange(index, 'givenName', e.target.value)}
                  style={{ width: '400px', padding: '3px', border: '1px solid #7f9db9' }} 
                />
              </div>

              <div style={{ marginTop: '10px' }}>
                <button 
                  onClick={handleAdd} 
                  style={{ marginRight: '10px', padding: '3px 10px', cursor: 'pointer' }}
                >
                  Add Another
                </button>
                {otherNamesList.length > 1 && (
                  <button 
                    onClick={() => handleRemove(index)} 
                    style={{ padding: '3px 10px', cursor: 'pointer', color: 'red' }}
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}

          <div style={{ fontSize: '11px', color: '#666', marginTop: '10px', fontStyle: 'italic' }}>
            <strong>Help: Other Names</strong><br/>
            If you only have other surnames to enter, enter the same given names as above. Conversely, if you only have other given names to enter, enter the same surname as above.
          </div>
        </div>
      )}
    </div>
  );
};

export default OtherNamesSection;
