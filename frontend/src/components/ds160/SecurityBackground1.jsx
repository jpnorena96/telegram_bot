import React from 'react';
import './ds160.css';

const SecurityBackground1 = ({ data, updateData }) => {
  const handleChange = (e) => {
    updateData({ [e.target.name]: e.target.value });
  };

  return (
    <div className="ds160-container" style={{ fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#333' }}>
      <div className="section-header">
        <h2>Security and Background: Part 1</h2>
        <p className="note">NOTE: Provide the following security and background information. Provide complete and accurate information to all questions that require an explanation. A visa may not be issued to persons who are within specific categories defined by law as inadmissible to the United States (except when a waiver is obtained in advance). Are any of the following applicable to you? While a YES answer does not automatically signify ineligibility for a visa, if you answer YES you may be required to personally appear before a consular officer.</p>
      </div>

      <div className="form-container">
        
        {/* DISEASE */}
        <fieldset>
          <div className="field full" style={{ marginBottom: '15px' }}>
            <label style={{ fontWeight: 'bold' }}>Do you have a communicable disease of public health significance? (Communicable diseases of public significance include chancroid, gonorrhea, granuloma inguinale, infectious leprosy, lymphogranuloma venereum, infectious stage syphilis, active tuberculosis, and other diseases as determined by the Department of Health and Human Services.)</label><br/>
            <div style={{ display: 'flex', gap: '15px', marginTop: '5px' }}>
              <label><input type="radio" name="secDisease" value="Y" checked={data.secDisease === 'Y'} onChange={handleChange} /> Yes</label>
              <label><input type="radio" name="secDisease" value="N" checked={data.secDisease === 'N'} onChange={handleChange} /> No</label>
            </div>
          </div>
          {data.secDisease === 'Y' && (
            <div className="field-group callout" style={{ padding: '15px', backgroundColor: '#f9f9f9', border: '1px solid #ddd', marginBottom: '20px' }}>
              <label style={{ fontWeight: 'bold' }}>Explain</label><br/>
              <textarea name="secDiseaseExplain" value={data.secDiseaseExplain || ''} onChange={handleChange} rows="2" maxLength="4000" style={{ width: '300px', height: '65px', padding: '5px', marginTop: '5px', resize: 'none' }}></textarea>
            </div>
          )}
        </fieldset>
        <hr />

        {/* DISORDER */}
        <fieldset>
          <div className="field full" style={{ marginBottom: '15px' }}>
            <label style={{ fontWeight: 'bold' }}>Do you have a mental or physical disorder that poses or is likely to pose a threat to the safety or welfare of yourself or others?</label><br/>
            <div style={{ display: 'flex', gap: '15px', marginTop: '5px' }}>
              <label><input type="radio" name="secDisorder" value="Y" checked={data.secDisorder === 'Y'} onChange={handleChange} /> Yes</label>
              <label><input type="radio" name="secDisorder" value="N" checked={data.secDisorder === 'N'} onChange={handleChange} /> No</label>
            </div>
          </div>
          {data.secDisorder === 'Y' && (
            <div className="field-group callout" style={{ padding: '15px', backgroundColor: '#f9f9f9', border: '1px solid #ddd', marginBottom: '20px' }}>
              <label style={{ fontWeight: 'bold' }}>Explain</label><br/>
              <textarea name="secDisorderExplain" value={data.secDisorderExplain || ''} onChange={handleChange} rows="2" maxLength="4000" style={{ width: '300px', height: '65px', padding: '5px', marginTop: '5px', resize: 'none' }}></textarea>
            </div>
          )}
        </fieldset>
        <hr />

        {/* DRUG USER */}
        <fieldset>
          <div className="field full" style={{ marginBottom: '15px' }}>
            <label style={{ fontWeight: 'bold' }}>Are you or have you ever been a drug abuser or addict?</label><br/>
            <div style={{ display: 'flex', gap: '15px', marginTop: '5px' }}>
              <label><input type="radio" name="secDruguser" value="Y" checked={data.secDruguser === 'Y'} onChange={handleChange} /> Yes</label>
              <label><input type="radio" name="secDruguser" value="N" checked={data.secDruguser === 'N'} onChange={handleChange} /> No</label>
            </div>
          </div>
          {data.secDruguser === 'Y' && (
            <div className="field-group callout" style={{ padding: '15px', backgroundColor: '#f9f9f9', border: '1px solid #ddd', marginBottom: '20px' }}>
              <label style={{ fontWeight: 'bold' }}>Explain</label><br/>
              <textarea name="secDruguserExplain" value={data.secDruguserExplain || ''} onChange={handleChange} rows="2" maxLength="4000" style={{ width: '300px', height: '65px', padding: '5px', marginTop: '5px', resize: 'none' }}></textarea>
            </div>
          )}
        </fieldset>

      </div>
    </div>
  );
};

export default SecurityBackground1;
