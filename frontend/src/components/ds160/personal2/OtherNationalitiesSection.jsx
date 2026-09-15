import React from 'react';

const OtherNationalitiesSection = ({ data, updateData }) => {
  // Ensure we have an array for multiple other nationalities
  const otherNationalitiesList = data?.otherNationalitiesList || [{ country: '', hasPassport: 'N', passportNumber: '' }];

  const handleAdd = () => {
    updateData({ otherNationalitiesList: [...otherNationalitiesList, { country: '', hasPassport: 'N', passportNumber: '' }] });
  };

  const handleRemove = (index) => {
    const newList = otherNationalitiesList.filter((_, i) => i !== index);
    updateData({ otherNationalitiesList: newList.length ? newList : [{ country: '', hasPassport: 'N', passportNumber: '' }] });
  };

  const handleChange = (index, field, value) => {
    const newList = [...otherNationalitiesList];
    newList[index][field] = value;
    updateData({ otherNationalitiesList: newList });
  };

  return (
    <div style={{ border: '1px solid #999', padding: '15px', marginBottom: '20px', backgroundColor: '#f9f9f9' }}>
      <div style={{ marginBottom: '15px' }}>
        <span className="tooltip_text" title="¿Usted cuenta o ha contado con alguna otra nacionalidad diferente a la indicada arriba en el rubro de 'Nacionalidad'?">
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>
            Do you hold or have you held any nationality other than the one indicated above on nationality?
          </label>
        </span>
        <div>
          <label style={{ marginRight: '15px' }}>
            <input 
              type="radio" 
              name="otherNationality" 
              value="Y" 
              checked={data?.otherNationality === 'Y'} 
              onChange={() => updateData({ otherNationality: 'Y' })} 
            /> Yes
          </label>
          <label>
            <input 
              type="radio" 
              name="otherNationality" 
              value="N" 
              checked={data?.otherNationality === 'N'} 
              onChange={() => updateData({ otherNationality: 'N' })} 
            /> No
          </label>
        </div>
      </div>
      
      {data?.otherNationality === 'Y' && (
        <div style={{ borderTop: '1px solid #ccc', paddingTop: '15px', marginTop: '15px' }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '13px' }}>Provide the following information:</h4>
          
          {otherNationalitiesList.map((item, index) => (
            <div key={index} style={{ marginBottom: '15px', paddingBottom: '15px', borderBottom: index < otherNationalitiesList.length - 1 ? '1px dashed #ccc' : 'none' }}>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '3px' }}>Other Country/Region of Origin (Nationality)</label>
                <select 
                  value={item.country} 
                  onChange={(e) => handleChange(index, 'country', e.target.value)} 
                  style={{ width: '340px', padding: '2px', border: '1px solid #7f9db9' }}
                >
                  <option value="">- Select One -</option>
                  <option value="MEX">MEXICO</option>
                  <option value="COL">COLOMBIA</option>
                  <option value="ARG">ARGENTINA</option>
                  <option value="USA">UNITED STATES OF AMERICA</option>
                </select>
              </div>

              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '3px' }}>Do you hold a passport for the other country/region of origin (nationality) above?</label>
                <div>
                  <label style={{ marginRight: '15px' }}>
                    <input type="radio" name={"otherPassport_" + index} value="Y" checked={item.hasPassport === 'Y'} onChange={() => handleChange(index, 'hasPassport', 'Y')} /> Yes
                  </label>
                  <label>
                    <input type="radio" name={"otherPassport_" + index} value="N" checked={item.hasPassport === 'N'} onChange={() => handleChange(index, 'hasPassport', 'N')} /> No
                  </label>
                </div>
              </div>

              {item.hasPassport === 'Y' && (
                <div style={{ marginTop: '10px', marginLeft: '15px', padding: '10px', borderLeft: '3px solid #ccc' }}>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '13px' }}>Provide the following information:</h4>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '3px' }}>Passport Number</label>
                  <input 
                    type="text" 
                    maxLength="20"
                    value={item.passportNumber} 
                    onChange={(e) => handleChange(index, 'passportNumber', e.target.value)}
                    style={{ width: '300px', padding: '3px', border: '1px solid #7f9db9' }} 
                  />
                </div>
              )}

              <div style={{ marginTop: '15px' }}>
                <button 
                  onClick={handleAdd} 
                  style={{ marginRight: '10px', padding: '3px 10px', cursor: 'pointer' }}
                >
                  Add Another
                </button>
                {otherNationalitiesList.length > 1 && (
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
        </div>
      )}
    </div>
  );
};

export default OtherNationalitiesSection;