import React from 'react';
import './ds160.css';

const AdditionalWorkEducation = ({ data, updateData }) => {
  const handleChange = (e) => {
    updateData({ [e.target.name]: e.target.value });
  };

  const handleCheck = (e) => {
    updateData({ [e.target.name]: e.target.checked });
  };

  const months = [
    { val: '1', label: 'JAN' }, { val: '2', label: 'FEB' }, { val: '3', label: 'MAR' },
    { val: '4', label: 'APR' }, { val: '5', label: 'MAY' }, { val: '6', label: 'JUN' },
    { val: '7', label: 'JUL' }, { val: '8', label: 'AUG' }, { val: '9', label: 'SEP' },
    { val: '10', label: 'OCT' }, { val: '11', label: 'NOV' }, { val: '12', label: 'DEC' }
  ];
  const days = Array.from({ length: 31 }, (_, i) => ({ val: String(i + 1), label: String(i + 1).padStart(2, '0') }));

  const countries = [
    { val: 'ARG', label: 'ARGENTINA' },
    { val: 'BRZL', label: 'BRAZIL' },
    { val: 'CAN', label: 'CANADA' },
    { val: 'CHIL', label: 'CHILE' },
    { val: 'COL', label: 'COLOMBIA' },
    { val: 'MEX', label: 'MEXICO' },
    { val: 'PERU', label: 'PERU' },
    { val: 'USA', label: 'UNITED STATES OF AMERICA' },
    { val: 'OTHER', label: 'OTHER COUNTRY' }
  ];

  return (
    <div className="ds160-container" style={{ fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#333' }}>
      <div className="section-header">
        <h2>Additional Work/Education/Training Information</h2>
        <p className="note">NOTE: Provide the following work, education, or training related information. Provide complete and accurate information to all questions that require an explanation.</p>
      </div>

      <div className="form-container">
        
        {/* CLAN OR TRIBE */}
        <fieldset>
          <div className="field full" style={{ marginBottom: '15px' }}>
            <label style={{ fontWeight: 'bold' }}>Do you belong to a clan or tribe?</label><br/>
            <div style={{ display: 'flex', gap: '15px', marginTop: '5px' }}>
              <label><input type="radio" name="clanTribe" value="Y" checked={data.clanTribe === 'Y'} onChange={handleChange} /> Yes</label>
              <label><input type="radio" name="clanTribe" value="N" checked={data.clanTribe === 'N'} onChange={handleChange} /> No</label>
            </div>
          </div>
          {data.clanTribe === 'Y' && (
            <div className="field-group callout" style={{ padding: '15px', backgroundColor: '#f9f9f9', border: '1px solid #ddd', marginBottom: '20px' }}>
              <h4>Provide the following information:</h4>
              <div className="field full" style={{ marginBottom: '15px' }}>
                <label style={{ fontWeight: 'bold' }}>Clan or Tribe Name</label><br/>
                <input type="text" name="clanTribeName" value={data.clanTribeName || ''} onChange={handleChange} maxLength="80" style={{ width: '280px', padding: '5px', marginTop: '5px' }} />
              </div>
            </div>
          )}
        </fieldset>
        <hr />

        {/* LANGUAGES */}
        <fieldset>
          <h4>Provide a List of Languages You Speak</h4>
          <div className="field-group callout" style={{ padding: '15px', backgroundColor: '#f9f9f9', border: '1px solid #ddd', marginBottom: '20px' }}>
            <div className="field full" style={{ marginBottom: '15px' }}>
              <label style={{ fontWeight: 'bold' }}>Language Name 1</label><br/>
              <input type="text" name="language1" value={data.language1 || ''} onChange={handleChange} maxLength="66" style={{ width: '275px', padding: '5px', marginTop: '5px' }} />
            </div>
            <div className="field full" style={{ marginBottom: '15px' }}>
              <label style={{ fontWeight: 'bold' }}>Language Name 2 (Optional)</label><br/>
              <input type="text" name="language2" value={data.language2 || ''} onChange={handleChange} maxLength="66" style={{ width: '275px', padding: '5px', marginTop: '5px' }} />
            </div>
          </div>
        </fieldset>
        <hr />

        {/* COUNTRIES VISITED */}
        <fieldset>
          <div className="field full" style={{ marginBottom: '15px' }}>
            <label style={{ fontWeight: 'bold' }}>Have you traveled to any countries/regions within the last five years?</label><br/>
            <div style={{ display: 'flex', gap: '15px', marginTop: '5px' }}>
              <label><input type="radio" name="countriesVisited" value="Y" checked={data.countriesVisited === 'Y'} onChange={handleChange} /> Yes</label>
              <label><input type="radio" name="countriesVisited" value="N" checked={data.countriesVisited === 'N'} onChange={handleChange} /> No</label>
            </div>
          </div>
          {data.countriesVisited === 'Y' && (
            <div className="field-group callout" style={{ padding: '15px', backgroundColor: '#f9f9f9', border: '1px solid #ddd', marginBottom: '20px' }}>
              <h4>Provide a List of Countries/Regions Visited</h4>
              <div className="field full" style={{ marginBottom: '15px' }}>
                <label style={{ fontWeight: 'bold' }}>Country/Region 1</label><br/>
                <select name="countryVisited1" value={data.countryVisited1 || ''} onChange={handleChange} style={{ width: '95%', padding: '5px', marginTop: '5px' }}>
                  <option value="">- Select One -</option>
                  {countries.map(c => <option key={c.val} value={c.val}>{c.label}</option>)}
                </select>
              </div>
            </div>
          )}
        </fieldset>
        <hr />

        {/* ORGANIZATIONS */}
        <fieldset>
          <div className="field full" style={{ marginBottom: '15px' }}>
            <label style={{ fontWeight: 'bold' }}>Have you belonged to, contributed to, or worked for any professional, social, or charitable organization?</label><br/>
            <div style={{ display: 'flex', gap: '15px', marginTop: '5px' }}>
              <label><input type="radio" name="organizations" value="Y" checked={data.organizations === 'Y'} onChange={handleChange} /> Yes</label>
              <label><input type="radio" name="organizations" value="N" checked={data.organizations === 'N'} onChange={handleChange} /> No</label>
            </div>
          </div>
          {data.organizations === 'Y' && (
            <div className="field-group callout" style={{ padding: '15px', backgroundColor: '#f9f9f9', border: '1px solid #ddd', marginBottom: '20px' }}>
              <h4>Provide a List of Organizations</h4>
              <div className="field full" style={{ marginBottom: '15px' }}>
                <label style={{ fontWeight: 'bold' }}>Organization Name 1</label><br/>
                <input type="text" name="organization1" value={data.organization1 || ''} onChange={handleChange} maxLength="66" style={{ width: '275px', padding: '5px', marginTop: '5px' }} />
              </div>
            </div>
          )}
        </fieldset>
        <hr />

        {/* SPECIALIZED SKILLS */}
        <fieldset>
          <div className="field full" style={{ marginBottom: '15px' }}>
            <label style={{ fontWeight: 'bold' }}>Do you have any specialized skills or training, such as firearms, explosives, nuclear, biological, or chemical experience?</label><br/>
            <div style={{ display: 'flex', gap: '15px', marginTop: '5px' }}>
              <label><input type="radio" name="specializedSkills" value="Y" checked={data.specializedSkills === 'Y'} onChange={handleChange} /> Yes</label>
              <label><input type="radio" name="specializedSkills" value="N" checked={data.specializedSkills === 'N'} onChange={handleChange} /> No</label>
            </div>
          </div>
          {data.specializedSkills === 'Y' && (
            <div className="field-group callout" style={{ padding: '15px', backgroundColor: '#f9f9f9', border: '1px solid #ddd', marginBottom: '20px' }}>
              <label style={{ fontWeight: 'bold' }}>Explain</label><br/>
              <textarea name="specializedSkillsExplain" value={data.specializedSkillsExplain || ''} onChange={handleChange} rows="2" maxLength="4000" style={{ width: '300px', height: '65px', padding: '5px', marginTop: '5px', resize: 'none' }}></textarea>
            </div>
          )}
        </fieldset>
        <hr />

        {/* MILITARY SERVICE */}
        <fieldset>
          <div className="field full" style={{ marginBottom: '15px' }}>
            <label style={{ fontWeight: 'bold' }}>Have you ever served in the military?</label><br/>
            <div style={{ display: 'flex', gap: '15px', marginTop: '5px' }}>
              <label><input type="radio" name="militaryService" value="Y" checked={data.militaryService === 'Y'} onChange={handleChange} /> Yes</label>
              <label><input type="radio" name="militaryService" value="N" checked={data.militaryService === 'N'} onChange={handleChange} /> No</label>
            </div>
          </div>
          {data.militaryService === 'Y' && (
            <div className="field-group callout" style={{ padding: '15px', backgroundColor: '#f9f9f9', border: '1px solid #ddd', marginBottom: '20px' }}>
              <h4>Provide the following information:</h4>
              <div className="field full" style={{ marginBottom: '15px' }}>
                <label style={{ fontWeight: 'bold' }}>Name of Country/Region</label><br/>
                <select name="militaryCountry" value={data.militaryCountry || ''} onChange={handleChange} style={{ width: '95%', padding: '5px', marginTop: '5px' }}>
                  <option value="">- Select One -</option>
                  {countries.map(c => <option key={c.val} value={c.val}>{c.label}</option>)}
                </select>
              </div>
              <div className="field full" style={{ marginBottom: '15px' }}>
                <label style={{ fontWeight: 'bold' }}>Branch of Service</label><br/>
                <input type="text" name="militaryBranch" value={data.militaryBranch || ''} onChange={handleChange} maxLength="40" style={{ width: '280px', padding: '5px', marginTop: '5px' }} />
              </div>
              <div className="field full" style={{ marginBottom: '15px' }}>
                <label style={{ fontWeight: 'bold' }}>Rank/Position</label><br/>
                <input type="text" name="militaryRank" value={data.militaryRank || ''} onChange={handleChange} maxLength="40" style={{ width: '280px', padding: '5px', marginTop: '5px' }} />
              </div>
              <div className="field full" style={{ marginBottom: '15px' }}>
                <label style={{ fontWeight: 'bold' }}>Military Specialty</label><br/>
                <input type="text" name="militarySpecialty" value={data.militarySpecialty || ''} onChange={handleChange} maxLength="40" style={{ width: '280px', padding: '5px', marginTop: '5px' }} />
              </div>

              <div className="field full" style={{ marginBottom: '15px' }}>
                <label style={{ fontWeight: 'bold' }}>Date of Service From</label><br/>
                <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
                  <select name="militaryStartDateDay" value={data.militaryStartDateDay || ''} onChange={handleChange} style={{ padding: '5px', width: '60px' }}>
                    <option value=""></option>
                    {days.map(d => <option key={d.val} value={d.val}>{d.label}</option>)}
                  </select>
                  <select name="militaryStartDateMonth" value={data.militaryStartDateMonth || ''} onChange={handleChange} style={{ padding: '5px', width: '70px' }}>
                    <option value=""></option>
                    {months.map(m => <option key={m.val} value={m.label}>{m.label}</option>)}
                  </select>
                  <input type="text" name="militaryStartDateYear" value={data.militaryStartDateYear || ''} onChange={handleChange} maxLength="4" placeholder="YYYY" style={{ padding: '5px', width: '60px' }} />
                </div>
                <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>(Format: DD-MMM-YYYY)</div>
              </div>

              <div className="field full" style={{ marginBottom: '15px' }}>
                <label style={{ fontWeight: 'bold' }}>Date of Service To</label><br/>
                <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
                  <select name="militaryEndDateDay" value={data.militaryEndDateDay || ''} onChange={handleChange} style={{ padding: '5px', width: '60px' }}>
                    <option value=""></option>
                    {days.map(d => <option key={d.val} value={d.val}>{d.label}</option>)}
                  </select>
                  <select name="militaryEndDateMonth" value={data.militaryEndDateMonth || ''} onChange={handleChange} style={{ padding: '5px', width: '70px' }}>
                    <option value=""></option>
                    {months.map(m => <option key={m.val} value={m.label}>{m.label}</option>)}
                  </select>
                  <input type="text" name="militaryEndDateYear" value={data.militaryEndDateYear || ''} onChange={handleChange} maxLength="4" placeholder="YYYY" style={{ padding: '5px', width: '60px' }} />
                </div>
                <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>(Format: DD-MMM-YYYY)</div>
              </div>
            </div>
          )}
        </fieldset>
        <hr />

        {/* INSURGENT ORG */}
        <fieldset>
          <div className="field full" style={{ marginBottom: '15px' }}>
            <label style={{ fontWeight: 'bold' }}>Have you ever served in, been a member of, or been involved with a paramilitary unit, vigilante unit, rebel group, guerrilla group, or insurgent organization?</label><br/>
            <div style={{ display: 'flex', gap: '15px', marginTop: '5px' }}>
              <label><input type="radio" name="insurgentOrg" value="Y" checked={data.insurgentOrg === 'Y'} onChange={handleChange} /> Yes</label>
              <label><input type="radio" name="insurgentOrg" value="N" checked={data.insurgentOrg === 'N'} onChange={handleChange} /> No</label>
            </div>
          </div>
          {data.insurgentOrg === 'Y' && (
            <div className="field-group callout" style={{ padding: '15px', backgroundColor: '#f9f9f9', border: '1px solid #ddd', marginBottom: '20px' }}>
              <label style={{ fontWeight: 'bold' }}>Explain</label><br/>
              <textarea name="insurgentOrgExplain" value={data.insurgentOrgExplain || ''} onChange={handleChange} rows="2" maxLength="4000" style={{ width: '300px', height: '65px', padding: '5px', marginTop: '5px', resize: 'none' }}></textarea>
            </div>
          )}
        </fieldset>

      </div>
    </div>
  );
};

export default AdditionalWorkEducation;
