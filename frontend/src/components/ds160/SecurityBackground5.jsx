import React from 'react';
import './ds160.css';

const SecurityBackground5 = ({ data, updateData }) => {
  const handleChange = (e) => {
    updateData({ [e.target.name]: e.target.value });
  };

  return (
    <div className="ds160-container" style={{ fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#333' }}>
      <div className="section-header">
        <h2>Security and Background: Part 5</h2>
        <p className="note">NOTE: Provide the following security and background information. Provide complete and accurate information to all questions that require an explanation. A visa may not be issued to persons who are within specific categories defined by law as inadmissible to the United States (except when a waiver is obtained in advance). Are any of the following applicable to you? While a YES answer does not automatically signify ineligibility for a visa, if you answer YES you may be required to personally appear before a consular officer.</p>
      </div>

      <div className="form-container">
        
        {/* CHILD CUSTODY */}
        <fieldset>
          <div className="field full" style={{ marginBottom: '15px' }}>
            <label style={{ fontWeight: 'bold' }}>Have you ever withheld custody of a U.S. citizen child outside the United States from a person granted legal custody by a U.S. court?</label><br/>
            <div style={{ display: 'flex', gap: '15px', marginTop: '5px' }}>
              <label><input type="radio" name="secChildCustody" value="Y" checked={data.secChildCustody === 'Y'} onChange={handleChange} /> Yes</label>
              <label><input type="radio" name="secChildCustody" value="N" checked={data.secChildCustody === 'N'} onChange={handleChange} /> No</label>
            </div>
          </div>
          {data.secChildCustody === 'Y' && (
            <div className="field-group callout" style={{ padding: '15px', backgroundColor: '#f9f9f9', border: '1px solid #ddd', marginBottom: '20px' }}>
              <label style={{ fontWeight: 'bold' }}>Explain</label><br/>
              <textarea name="secChildCustodyExplain" value={data.secChildCustodyExplain || ''} onChange={handleChange} rows="2" maxLength="4000" style={{ width: '300px', height: '65px', padding: '5px', marginTop: '5px', resize: 'none' }}></textarea>
            </div>
          )}
        </fieldset>
        <hr />

        {/* VOTING VIOLATION */}
        <fieldset>
          <div className="field full" style={{ marginBottom: '15px' }}>
            <label style={{ fontWeight: 'bold' }}>Have you voted in the United States in violation of any law or regulation?</label><br/>
            <div style={{ display: 'flex', gap: '15px', marginTop: '5px' }}>
              <label><input type="radio" name="secVotingViolation" value="Y" checked={data.secVotingViolation === 'Y'} onChange={handleChange} /> Yes</label>
              <label><input type="radio" name="secVotingViolation" value="N" checked={data.secVotingViolation === 'N'} onChange={handleChange} /> No</label>
            </div>
          </div>
          {data.secVotingViolation === 'Y' && (
            <div className="field-group callout" style={{ padding: '15px', backgroundColor: '#f9f9f9', border: '1px solid #ddd', marginBottom: '20px' }}>
              <label style={{ fontWeight: 'bold' }}>Explain</label><br/>
              <textarea name="secVotingViolationExplain" value={data.secVotingViolationExplain || ''} onChange={handleChange} rows="2" maxLength="4000" style={{ width: '300px', height: '65px', padding: '5px', marginTop: '5px', resize: 'none' }}></textarea>
            </div>
          )}
        </fieldset>
        <hr />

        {/* RENOUNCE CITIZENSHIP */}
        <fieldset>
          <div className="field full" style={{ marginBottom: '15px' }}>
            <label style={{ fontWeight: 'bold' }}>Have you ever renounced United States citizenship for the purposes of avoiding taxation?</label><br/>
            <div style={{ display: 'flex', gap: '15px', marginTop: '5px' }}>
              <label><input type="radio" name="secRenounceExp" value="Y" checked={data.secRenounceExp === 'Y'} onChange={handleChange} /> Yes</label>
              <label><input type="radio" name="secRenounceExp" value="N" checked={data.secRenounceExp === 'N'} onChange={handleChange} /> No</label>
            </div>
          </div>
          {data.secRenounceExp === 'Y' && (
            <div className="field-group callout" style={{ padding: '15px', backgroundColor: '#f9f9f9', border: '1px solid #ddd', marginBottom: '20px' }}>
              <label style={{ fontWeight: 'bold' }}>Explain</label><br/>
              <textarea name="secRenounceExpExplain" value={data.secRenounceExpExplain || ''} onChange={handleChange} rows="2" maxLength="4000" style={{ width: '300px', height: '65px', padding: '5px', marginTop: '5px', resize: 'none' }}></textarea>
            </div>
          )}
        </fieldset>

      </div>
    </div>
  );
};

export default SecurityBackground5;
