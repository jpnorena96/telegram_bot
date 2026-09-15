import React from 'react';
import './ds160.css';

const SecurityBackground4 = ({ data, updateData }) => {
  const handleChange = (e) => {
    updateData({ [e.target.name]: e.target.value });
  };

  return (
    <div className="ds160-container" style={{ fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#333' }}>
      <div className="section-header">
        <h2>Security and Background: Part 4</h2>
        <p className="note">NOTE: Provide the following security and background information. Provide complete and accurate information to all questions that require an explanation. A visa may not be issued to persons who are within specific categories defined by law as inadmissible to the United States (except when a waiver is obtained in advance). Are any of the following applicable to you? While a YES answer does not automatically signify ineligibility for a visa, if you answer YES you may be required to personally appear before a consular officer.</p>
      </div>

      <div className="form-container">
        
        {/* IMMIGRATION FRAUD */}
        <fieldset>
          <div className="field full" style={{ marginBottom: '15px' }}>
            <label style={{ fontWeight: 'bold' }}>Have you ever sought to obtain or assist others to obtain a visa, entry into the United States, or any other United States immigration benefit by fraud or willful misrepresentation or other unlawful means?</label><br/>
            <div style={{ display: 'flex', gap: '15px', marginTop: '5px' }}>
              <label><input type="radio" name="secImmigrationFraud" value="Y" checked={data.secImmigrationFraud === 'Y'} onChange={handleChange} /> Yes</label>
              <label><input type="radio" name="secImmigrationFraud" value="N" checked={data.secImmigrationFraud === 'N'} onChange={handleChange} /> No</label>
            </div>
          </div>
          {data.secImmigrationFraud === 'Y' && (
            <div className="field-group callout" style={{ padding: '15px', backgroundColor: '#f9f9f9', border: '1px solid #ddd', marginBottom: '20px' }}>
              <label style={{ fontWeight: 'bold' }}>Explain</label><br/>
              <textarea name="secImmigrationFraudExplain" value={data.secImmigrationFraudExplain || ''} onChange={handleChange} rows="2" maxLength="4000" style={{ width: '300px', height: '65px', padding: '5px', marginTop: '5px', resize: 'none' }}></textarea>
            </div>
          )}
        </fieldset>
        <hr />

        {/* DEPORT */}
        <fieldset>
          <div className="field full" style={{ marginBottom: '15px' }}>
            <label style={{ fontWeight: 'bold' }}>Have you ever been removed or deported from any country?</label><br/>
            <div style={{ display: 'flex', gap: '15px', marginTop: '5px' }}>
              <label><input type="radio" name="secDeport" value="Y" checked={data.secDeport === 'Y'} onChange={handleChange} /> Yes</label>
              <label><input type="radio" name="secDeport" value="N" checked={data.secDeport === 'N'} onChange={handleChange} /> No</label>
            </div>
          </div>
          {data.secDeport === 'Y' && (
            <div className="field-group callout" style={{ padding: '15px', backgroundColor: '#f9f9f9', border: '1px solid #ddd', marginBottom: '20px' }}>
              <label style={{ fontWeight: 'bold' }}>Explain</label><br/>
              <textarea name="secDeportExplain" value={data.secDeportExplain || ''} onChange={handleChange} rows="2" maxLength="4000" style={{ width: '300px', height: '65px', padding: '5px', marginTop: '5px', resize: 'none' }}></textarea>
            </div>
          )}
        </fieldset>

      </div>
    </div>
  );
};

export default SecurityBackground4;
