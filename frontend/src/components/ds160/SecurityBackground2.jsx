import React from 'react';
import './ds160.css';

const SecurityBackground2 = ({ data, updateData }) => {
  const handleChange = (e) => {
    updateData({ [e.target.name]: e.target.value });
  };

  return (
    <div className="ds160-container" style={{ fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#333' }}>
      <div className="section-header">
        <h2>Security and Background: Part 2</h2>
        <p className="note">NOTE: Provide the following security and background information. Provide complete and accurate answers to all questions that require an explanation. A visa may not be issued to persons who are within specific categories defined by law as inadmissible to the United States (except when a waiver is obtained in advance). Are any of the following applicable to you? While a YES answer does not automatically signify ineligibility for a visa, if you answer YES you may be required to personally appear before a consular officer.</p>
      </div>

      <div className="form-container">
        
        {/* ARRESTED */}
        <fieldset>
          <div className="field full" style={{ marginBottom: '15px' }}>
            <label style={{ fontWeight: 'bold' }}>Have you ever been arrested or convicted for any offense or crime, even though subject of a pardon, amnesty, or other similar action?</label><br/>
            <div style={{ display: 'flex', gap: '15px', marginTop: '5px' }}>
              <label><input type="radio" name="secArrested" value="Y" checked={data.secArrested === 'Y'} onChange={handleChange} /> Yes</label>
              <label><input type="radio" name="secArrested" value="N" checked={data.secArrested === 'N'} onChange={handleChange} /> No</label>
            </div>
          </div>
          {data.secArrested === 'Y' && (
            <div className="field-group callout" style={{ padding: '15px', backgroundColor: '#f9f9f9', border: '1px solid #ddd', marginBottom: '20px' }}>
              <label style={{ fontWeight: 'bold' }}>Explain</label><br/>
              <textarea name="secArrestedExplain" value={data.secArrestedExplain || ''} onChange={handleChange} rows="2" maxLength="4000" style={{ width: '300px', height: '65px', padding: '5px', marginTop: '5px', resize: 'none' }}></textarea>
            </div>
          )}
        </fieldset>
        <hr />

        {/* CONTROLLED SUBSTANCES */}
        <fieldset>
          <div className="field full" style={{ marginBottom: '15px' }}>
            <label style={{ fontWeight: 'bold' }}>Have you ever violated, or engaged in a conspiracy to violate, any law relating to controlled substances?</label><br/>
            <div style={{ display: 'flex', gap: '15px', marginTop: '5px' }}>
              <label><input type="radio" name="secControlledSubstances" value="Y" checked={data.secControlledSubstances === 'Y'} onChange={handleChange} /> Yes</label>
              <label><input type="radio" name="secControlledSubstances" value="N" checked={data.secControlledSubstances === 'N'} onChange={handleChange} /> No</label>
            </div>
          </div>
          {data.secControlledSubstances === 'Y' && (
            <div className="field-group callout" style={{ padding: '15px', backgroundColor: '#f9f9f9', border: '1px solid #ddd', marginBottom: '20px' }}>
              <label style={{ fontWeight: 'bold' }}>Explain</label><br/>
              <textarea name="secControlledSubstancesExplain" value={data.secControlledSubstancesExplain || ''} onChange={handleChange} rows="2" maxLength="4000" style={{ width: '300px', height: '65px', padding: '5px', marginTop: '5px', resize: 'none' }}></textarea>
            </div>
          )}
        </fieldset>
        <hr />

        {/* PROSTITUTION */}
        <fieldset>
          <div className="field full" style={{ marginBottom: '15px' }}>
            <label style={{ fontWeight: 'bold' }}>Are you coming to the United States to engage in prostitution or unlawful commercialized vice or have you been engaged in prostitution or procuring prostitutes within the past 10 years?</label><br/>
            <div style={{ display: 'flex', gap: '15px', marginTop: '5px' }}>
              <label><input type="radio" name="secProstitution" value="Y" checked={data.secProstitution === 'Y'} onChange={handleChange} /> Yes</label>
              <label><input type="radio" name="secProstitution" value="N" checked={data.secProstitution === 'N'} onChange={handleChange} /> No</label>
            </div>
          </div>
          {data.secProstitution === 'Y' && (
            <div className="field-group callout" style={{ padding: '15px', backgroundColor: '#f9f9f9', border: '1px solid #ddd', marginBottom: '20px' }}>
              <label style={{ fontWeight: 'bold' }}>Explain</label><br/>
              <textarea name="secProstitutionExplain" value={data.secProstitutionExplain || ''} onChange={handleChange} rows="2" maxLength="4000" style={{ width: '300px', height: '65px', padding: '5px', marginTop: '5px', resize: 'none' }}></textarea>
            </div>
          )}
        </fieldset>
        <hr />

        {/* MONEY LAUNDERING */}
        <fieldset>
          <div className="field full" style={{ marginBottom: '15px' }}>
            <label style={{ fontWeight: 'bold' }}>Have you ever been involved in, or do you seek to engage in, money laundering?</label><br/>
            <div style={{ display: 'flex', gap: '15px', marginTop: '5px' }}>
              <label><input type="radio" name="secMoneyLaundering" value="Y" checked={data.secMoneyLaundering === 'Y'} onChange={handleChange} /> Yes</label>
              <label><input type="radio" name="secMoneyLaundering" value="N" checked={data.secMoneyLaundering === 'N'} onChange={handleChange} /> No</label>
            </div>
          </div>
          {data.secMoneyLaundering === 'Y' && (
            <div className="field-group callout" style={{ padding: '15px', backgroundColor: '#f9f9f9', border: '1px solid #ddd', marginBottom: '20px' }}>
              <label style={{ fontWeight: 'bold' }}>Explain</label><br/>
              <textarea name="secMoneyLaunderingExplain" value={data.secMoneyLaunderingExplain || ''} onChange={handleChange} rows="2" maxLength="4000" style={{ width: '300px', height: '65px', padding: '5px', marginTop: '5px', resize: 'none' }}></textarea>
            </div>
          )}
        </fieldset>
        <hr />

        {/* HUMAN TRAFFICKING */}
        <fieldset>
          <div className="field full" style={{ marginBottom: '15px' }}>
            <label style={{ fontWeight: 'bold' }}>Have you ever committed or conspired to commit a human trafficking offense in the United States or outside the United States?</label><br/>
            <div style={{ display: 'flex', gap: '15px', marginTop: '5px' }}>
              <label><input type="radio" name="secHumanTrafficking" value="Y" checked={data.secHumanTrafficking === 'Y'} onChange={handleChange} /> Yes</label>
              <label><input type="radio" name="secHumanTrafficking" value="N" checked={data.secHumanTrafficking === 'N'} onChange={handleChange} /> No</label>
            </div>
          </div>
          {data.secHumanTrafficking === 'Y' && (
            <div className="field-group callout" style={{ padding: '15px', backgroundColor: '#f9f9f9', border: '1px solid #ddd', marginBottom: '20px' }}>
              <label style={{ fontWeight: 'bold' }}>Explain</label><br/>
              <textarea name="secHumanTraffickingExplain" value={data.secHumanTraffickingExplain || ''} onChange={handleChange} rows="2" maxLength="4000" style={{ width: '300px', height: '65px', padding: '5px', marginTop: '5px', resize: 'none' }}></textarea>
            </div>
          )}
        </fieldset>
        <hr />

        {/* ASSISTED SEVERE TRAFFICKING */}
        <fieldset>
          <div className="field full" style={{ marginBottom: '15px' }}>
            <label style={{ fontWeight: 'bold' }}>Have you ever knowingly aided, abetted, assisted or colluded with an individual who has committed, or conspired to commit a severe human trafficking offense in the United States or outside the United States?</label><br/>
            <div style={{ display: 'flex', gap: '15px', marginTop: '5px' }}>
              <label><input type="radio" name="secAssistedSevereTrafficking" value="Y" checked={data.secAssistedSevereTrafficking === 'Y'} onChange={handleChange} /> Yes</label>
              <label><input type="radio" name="secAssistedSevereTrafficking" value="N" checked={data.secAssistedSevereTrafficking === 'N'} onChange={handleChange} /> No</label>
            </div>
          </div>
          {data.secAssistedSevereTrafficking === 'Y' && (
            <div className="field-group callout" style={{ padding: '15px', backgroundColor: '#f9f9f9', border: '1px solid #ddd', marginBottom: '20px' }}>
              <label style={{ fontWeight: 'bold' }}>Explain</label><br/>
              <textarea name="secAssistedSevereTraffickingExplain" value={data.secAssistedSevereTraffickingExplain || ''} onChange={handleChange} rows="2" maxLength="4000" style={{ width: '300px', height: '65px', padding: '5px', marginTop: '5px', resize: 'none' }}></textarea>
            </div>
          )}
        </fieldset>
        <hr />

        {/* HUMAN TRAFFICKING RELATED */}
        <fieldset>
          <div className="field full" style={{ marginBottom: '15px' }}>
            <label style={{ fontWeight: 'bold' }}>Are you the spouse, son, or daughter of an individual who has committed or conspired to commit a human trafficking offense in the United States or outside the United States and have you within the last five years, knowingly benefited from the trafficking activities?</label><br/>
            <div style={{ display: 'flex', gap: '15px', marginTop: '5px' }}>
              <label><input type="radio" name="secHumanTraffickingRelated" value="Y" checked={data.secHumanTraffickingRelated === 'Y'} onChange={handleChange} /> Yes</label>
              <label><input type="radio" name="secHumanTraffickingRelated" value="N" checked={data.secHumanTraffickingRelated === 'N'} onChange={handleChange} /> No</label>
            </div>
          </div>
          {data.secHumanTraffickingRelated === 'Y' && (
            <div className="field-group callout" style={{ padding: '15px', backgroundColor: '#f9f9f9', border: '1px solid #ddd', marginBottom: '20px' }}>
              <label style={{ fontWeight: 'bold' }}>Explain</label><br/>
              <textarea name="secHumanTraffickingRelatedExplain" value={data.secHumanTraffickingRelatedExplain || ''} onChange={handleChange} rows="2" maxLength="4000" style={{ width: '300px', height: '65px', padding: '5px', marginTop: '5px', resize: 'none' }}></textarea>
            </div>
          )}
        </fieldset>

      </div>
    </div>
  );
};

export default SecurityBackground2;
