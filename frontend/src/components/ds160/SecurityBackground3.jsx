import React from 'react';
import './ds160.css';

const SecurityBackground3 = ({ data, updateData }) => {
  const handleChange = (e) => {
    updateData({ [e.target.name]: e.target.value });
  };

  return (
    <div className="ds160-container" style={{ fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#333' }}>
      <div className="section-header">
        <h2>Security and Background: Part 3</h2>
        <p className="note">NOTE: Provide the following security and background information. Provide complete and accurate information to all questions that require an explanation. A visa may not be issued to persons who are within specific categories defined by law as inadmissible to the United States (except when a waiver is obtained in advance). Are any of the following applicable to you? While a YES answer does not automatically signify ineligibility for a visa, if you answer YES you may be required to personally appear before a consular officer.</p>
      </div>

      <div className="form-container">
        
        {/* ILLEGAL ACTIVITY */}
        <fieldset>
          <div className="field full" style={{ marginBottom: '15px' }}>
            <label style={{ fontWeight: 'bold' }}>Do you seek to engage in espionage, sabotage, export control violations, or any other illegal activity while in the United States?</label><br/>
            <div style={{ display: 'flex', gap: '15px', marginTop: '5px' }}>
              <label><input type="radio" name="secIllegalActivity" value="Y" checked={data.secIllegalActivity === 'Y'} onChange={handleChange} /> Yes</label>
              <label><input type="radio" name="secIllegalActivity" value="N" checked={data.secIllegalActivity === 'N'} onChange={handleChange} /> No</label>
            </div>
          </div>
          {data.secIllegalActivity === 'Y' && (
            <div className="field-group callout" style={{ padding: '15px', backgroundColor: '#f9f9f9', border: '1px solid #ddd', marginBottom: '20px' }}>
              <label style={{ fontWeight: 'bold' }}>Explain</label><br/>
              <textarea name="secIllegalActivityExplain" value={data.secIllegalActivityExplain || ''} onChange={handleChange} rows="2" maxLength="4000" style={{ width: '300px', height: '65px', padding: '5px', marginTop: '5px', resize: 'none' }}></textarea>
            </div>
          )}
        </fieldset>
        <hr />

        {/* TERRORIST ACTIVITY */}
        <fieldset>
          <div className="field full" style={{ marginBottom: '15px' }}>
            <label style={{ fontWeight: 'bold' }}>Do you seek to engage in terrorist activities while in the United States or have you ever engaged in terrorist activities?</label><br/>
            <div style={{ display: 'flex', gap: '15px', marginTop: '5px' }}>
              <label><input type="radio" name="secTerroristActivity" value="Y" checked={data.secTerroristActivity === 'Y'} onChange={handleChange} /> Yes</label>
              <label><input type="radio" name="secTerroristActivity" value="N" checked={data.secTerroristActivity === 'N'} onChange={handleChange} /> No</label>
            </div>
          </div>
          {data.secTerroristActivity === 'Y' && (
            <div className="field-group callout" style={{ padding: '15px', backgroundColor: '#f9f9f9', border: '1px solid #ddd', marginBottom: '20px' }}>
              <label style={{ fontWeight: 'bold' }}>Explain</label><br/>
              <textarea name="secTerroristActivityExplain" value={data.secTerroristActivityExplain || ''} onChange={handleChange} rows="2" maxLength="4000" style={{ width: '300px', height: '65px', padding: '5px', marginTop: '5px', resize: 'none' }}></textarea>
            </div>
          )}
        </fieldset>
        <hr />

        {/* TERRORIST SUPPORT */}
        <fieldset>
          <div className="field full" style={{ marginBottom: '15px' }}>
            <label style={{ fontWeight: 'bold' }}>Have you ever or do you intend to provide financial assistance or other support to terrorists or terrorist organizations?</label><br/>
            <div style={{ display: 'flex', gap: '15px', marginTop: '5px' }}>
              <label><input type="radio" name="secTerroristSupport" value="Y" checked={data.secTerroristSupport === 'Y'} onChange={handleChange} /> Yes</label>
              <label><input type="radio" name="secTerroristSupport" value="N" checked={data.secTerroristSupport === 'N'} onChange={handleChange} /> No</label>
            </div>
          </div>
          {data.secTerroristSupport === 'Y' && (
            <div className="field-group callout" style={{ padding: '15px', backgroundColor: '#f9f9f9', border: '1px solid #ddd', marginBottom: '20px' }}>
              <label style={{ fontWeight: 'bold' }}>Explain</label><br/>
              <textarea name="secTerroristSupportExplain" value={data.secTerroristSupportExplain || ''} onChange={handleChange} rows="2" maxLength="4000" style={{ width: '300px', height: '65px', padding: '5px', marginTop: '5px', resize: 'none' }}></textarea>
            </div>
          )}
        </fieldset>
        <hr />

        {/* TERRORIST ORG */}
        <fieldset>
          <div className="field full" style={{ marginBottom: '15px' }}>
            <label style={{ fontWeight: 'bold' }}>Are you a member or representative of a terrorist organization?</label><br/>
            <div style={{ display: 'flex', gap: '15px', marginTop: '5px' }}>
              <label><input type="radio" name="secTerroristOrg" value="Y" checked={data.secTerroristOrg === 'Y'} onChange={handleChange} /> Yes</label>
              <label><input type="radio" name="secTerroristOrg" value="N" checked={data.secTerroristOrg === 'N'} onChange={handleChange} /> No</label>
            </div>
          </div>
          {data.secTerroristOrg === 'Y' && (
            <div className="field-group callout" style={{ padding: '15px', backgroundColor: '#f9f9f9', border: '1px solid #ddd', marginBottom: '20px' }}>
              <label style={{ fontWeight: 'bold' }}>Explain</label><br/>
              <textarea name="secTerroristOrgExplain" value={data.secTerroristOrgExplain || ''} onChange={handleChange} rows="2" maxLength="4000" style={{ width: '300px', height: '65px', padding: '5px', marginTop: '5px', resize: 'none' }}></textarea>
            </div>
          )}
        </fieldset>
        <hr />

        {/* TERRORIST REL */}
        <fieldset>
          <div className="field full" style={{ marginBottom: '15px' }}>
            <label style={{ fontWeight: 'bold' }}>Are you the spouse, son, or daughter of an individual who has engaged in terrorist activity, including providing financial assistance or other support to terrorists or terrorist organizations, in the last five years?</label><br/>
            <div style={{ display: 'flex', gap: '15px', marginTop: '5px' }}>
              <label><input type="radio" name="secTerroristRel" value="Y" checked={data.secTerroristRel === 'Y'} onChange={handleChange} /> Yes</label>
              <label><input type="radio" name="secTerroristRel" value="N" checked={data.secTerroristRel === 'N'} onChange={handleChange} /> No</label>
            </div>
          </div>
          {data.secTerroristRel === 'Y' && (
            <div className="field-group callout" style={{ padding: '15px', backgroundColor: '#f9f9f9', border: '1px solid #ddd', marginBottom: '20px' }}>
              <label style={{ fontWeight: 'bold' }}>Explain</label><br/>
              <textarea name="secTerroristRelExplain" value={data.secTerroristRelExplain || ''} onChange={handleChange} rows="2" maxLength="4000" style={{ width: '300px', height: '65px', padding: '5px', marginTop: '5px', resize: 'none' }}></textarea>
            </div>
          )}
        </fieldset>
        <hr />

        {/* GENOCIDE */}
        <fieldset>
          <div className="field full" style={{ marginBottom: '15px' }}>
            <label style={{ fontWeight: 'bold' }}>Have you ever ordered, incited, committed, assisted, or otherwise participated in genocide?</label><br/>
            <div style={{ display: 'flex', gap: '15px', marginTop: '5px' }}>
              <label><input type="radio" name="secGenocide" value="Y" checked={data.secGenocide === 'Y'} onChange={handleChange} /> Yes</label>
              <label><input type="radio" name="secGenocide" value="N" checked={data.secGenocide === 'N'} onChange={handleChange} /> No</label>
            </div>
          </div>
          {data.secGenocide === 'Y' && (
            <div className="field-group callout" style={{ padding: '15px', backgroundColor: '#f9f9f9', border: '1px solid #ddd', marginBottom: '20px' }}>
              <label style={{ fontWeight: 'bold' }}>Explain</label><br/>
              <textarea name="secGenocideExplain" value={data.secGenocideExplain || ''} onChange={handleChange} rows="2" maxLength="4000" style={{ width: '300px', height: '65px', padding: '5px', marginTop: '5px', resize: 'none' }}></textarea>
            </div>
          )}
        </fieldset>
        <hr />

        {/* TORTURE */}
        <fieldset>
          <div className="field full" style={{ marginBottom: '15px' }}>
            <label style={{ fontWeight: 'bold' }}>Have you ever committed, ordered, incited, assisted, or otherwise participated in torture?</label><br/>
            <div style={{ display: 'flex', gap: '15px', marginTop: '5px' }}>
              <label><input type="radio" name="secTorture" value="Y" checked={data.secTorture === 'Y'} onChange={handleChange} /> Yes</label>
              <label><input type="radio" name="secTorture" value="N" checked={data.secTorture === 'N'} onChange={handleChange} /> No</label>
            </div>
          </div>
          {data.secTorture === 'Y' && (
            <div className="field-group callout" style={{ padding: '15px', backgroundColor: '#f9f9f9', border: '1px solid #ddd', marginBottom: '20px' }}>
              <label style={{ fontWeight: 'bold' }}>Explain</label><br/>
              <textarea name="secTortureExplain" value={data.secTortureExplain || ''} onChange={handleChange} rows="2" maxLength="4000" style={{ width: '300px', height: '65px', padding: '5px', marginTop: '5px', resize: 'none' }}></textarea>
            </div>
          )}
        </fieldset>
        <hr />

        {/* EXTRAJUDICIAL VIOLENCE */}
        <fieldset>
          <div className="field full" style={{ marginBottom: '15px' }}>
            <label style={{ fontWeight: 'bold' }}>Have you committed, ordered, incited, assisted, or otherwise participated in extrajudicial killings, political killings, or other acts of violence?</label><br/>
            <div style={{ display: 'flex', gap: '15px', marginTop: '5px' }}>
              <label><input type="radio" name="secExViolence" value="Y" checked={data.secExViolence === 'Y'} onChange={handleChange} /> Yes</label>
              <label><input type="radio" name="secExViolence" value="N" checked={data.secExViolence === 'N'} onChange={handleChange} /> No</label>
            </div>
          </div>
          {data.secExViolence === 'Y' && (
            <div className="field-group callout" style={{ padding: '15px', backgroundColor: '#f9f9f9', border: '1px solid #ddd', marginBottom: '20px' }}>
              <label style={{ fontWeight: 'bold' }}>Explain</label><br/>
              <textarea name="secExViolenceExplain" value={data.secExViolenceExplain || ''} onChange={handleChange} rows="2" maxLength="4000" style={{ width: '300px', height: '65px', padding: '5px', marginTop: '5px', resize: 'none' }}></textarea>
            </div>
          )}
        </fieldset>
        <hr />

        {/* CHILD SOLDIER */}
        <fieldset>
          <div className="field full" style={{ marginBottom: '15px' }}>
            <label style={{ fontWeight: 'bold' }}>Have you ever engaged in the recruitment or the use of child soldiers?</label><br/>
            <div style={{ display: 'flex', gap: '15px', marginTop: '5px' }}>
              <label><input type="radio" name="secChildSoldier" value="Y" checked={data.secChildSoldier === 'Y'} onChange={handleChange} /> Yes</label>
              <label><input type="radio" name="secChildSoldier" value="N" checked={data.secChildSoldier === 'N'} onChange={handleChange} /> No</label>
            </div>
          </div>
          {data.secChildSoldier === 'Y' && (
            <div className="field-group callout" style={{ padding: '15px', backgroundColor: '#f9f9f9', border: '1px solid #ddd', marginBottom: '20px' }}>
              <label style={{ fontWeight: 'bold' }}>Explain</label><br/>
              <textarea name="secChildSoldierExplain" value={data.secChildSoldierExplain || ''} onChange={handleChange} rows="2" maxLength="4000" style={{ width: '300px', height: '65px', padding: '5px', marginTop: '5px', resize: 'none' }}></textarea>
            </div>
          )}
        </fieldset>
        <hr />

        {/* RELIGIOUS FREEDOM */}
        <fieldset>
          <div className="field full" style={{ marginBottom: '15px' }}>
            <label style={{ fontWeight: 'bold' }}>Have you, while serving as a government official, been responsible for or directly carried out, at any time, particularly severe violations of religious freedom?</label><br/>
            <div style={{ display: 'flex', gap: '15px', marginTop: '5px' }}>
              <label><input type="radio" name="secReligiousFreedom" value="Y" checked={data.secReligiousFreedom === 'Y'} onChange={handleChange} /> Yes</label>
              <label><input type="radio" name="secReligiousFreedom" value="N" checked={data.secReligiousFreedom === 'N'} onChange={handleChange} /> No</label>
            </div>
          </div>
          {data.secReligiousFreedom === 'Y' && (
            <div className="field-group callout" style={{ padding: '15px', backgroundColor: '#f9f9f9', border: '1px solid #ddd', marginBottom: '20px' }}>
              <label style={{ fontWeight: 'bold' }}>Explain</label><br/>
              <textarea name="secReligiousFreedomExplain" value={data.secReligiousFreedomExplain || ''} onChange={handleChange} rows="2" maxLength="4000" style={{ width: '300px', height: '65px', padding: '5px', marginTop: '5px', resize: 'none' }}></textarea>
            </div>
          )}
        </fieldset>
        <hr />

        {/* POPULATION CONTROLS */}
        <fieldset>
          <div className="field full" style={{ marginBottom: '15px' }}>
            <label style={{ fontWeight: 'bold' }}>Have you ever been directly involved in the establishment or enforcement of population controls forcing a woman to undergo an abortion against her free choice or a man or a woman to undergo sterilization against his or her free will?</label><br/>
            <div style={{ display: 'flex', gap: '15px', marginTop: '5px' }}>
              <label><input type="radio" name="secPopulationControls" value="Y" checked={data.secPopulationControls === 'Y'} onChange={handleChange} /> Yes</label>
              <label><input type="radio" name="secPopulationControls" value="N" checked={data.secPopulationControls === 'N'} onChange={handleChange} /> No</label>
            </div>
          </div>
          {data.secPopulationControls === 'Y' && (
            <div className="field-group callout" style={{ padding: '15px', backgroundColor: '#f9f9f9', border: '1px solid #ddd', marginBottom: '20px' }}>
              <label style={{ fontWeight: 'bold' }}>Explain</label><br/>
              <textarea name="secPopulationControlsExplain" value={data.secPopulationControlsExplain || ''} onChange={handleChange} rows="2" maxLength="4000" style={{ width: '300px', height: '65px', padding: '5px', marginTop: '5px', resize: 'none' }}></textarea>
            </div>
          )}
        </fieldset>
        <hr />

        {/* TRANSPLANT */}
        <fieldset>
          <div className="field full" style={{ marginBottom: '15px' }}>
            <label style={{ fontWeight: 'bold' }}>Have you ever been directly involved in the coercive transplantation of human organs or bodily tissue?</label><br/>
            <div style={{ display: 'flex', gap: '15px', marginTop: '5px' }}>
              <label><input type="radio" name="secTransplant" value="Y" checked={data.secTransplant === 'Y'} onChange={handleChange} /> Yes</label>
              <label><input type="radio" name="secTransplant" value="N" checked={data.secTransplant === 'N'} onChange={handleChange} /> No</label>
            </div>
          </div>
          {data.secTransplant === 'Y' && (
            <div className="field-group callout" style={{ padding: '15px', backgroundColor: '#f9f9f9', border: '1px solid #ddd', marginBottom: '20px' }}>
              <label style={{ fontWeight: 'bold' }}>Explain</label><br/>
              <textarea name="secTransplantExplain" value={data.secTransplantExplain || ''} onChange={handleChange} rows="2" maxLength="4000" style={{ width: '300px', height: '65px', padding: '5px', marginTop: '5px', resize: 'none' }}></textarea>
            </div>
          )}
        </fieldset>

      </div>
    </div>
  );
};

export default SecurityBackground3;
