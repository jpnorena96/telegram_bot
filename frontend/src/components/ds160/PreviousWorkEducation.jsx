import React from 'react';
import './ds160.css';

const PreviousWorkEducation = ({ data, updateData }) => {
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
    { val: 'ECUA', label: 'ECUADOR' },
    { val: 'MEX', label: 'MEXICO' },
    { val: 'PERU', label: 'PERU' },
    { val: 'USA', label: 'UNITED STATES OF AMERICA' },
    { val: 'VENZ', label: 'VENEZUELA' },
    { val: 'OTHER', label: 'OTHER COUNTRY' }
  ];

  return (
    <div className="ds160-container" style={{ fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#333' }}>
      <div className="section-header">
        <h2>Previous Work/Education/Training Information</h2>
        <p className="note">NOTE: Provide your employment information for the last five years that you were employed, if applicable.</p>
      </div>

      <div className="form-container">
        <fieldset>
          
          {/* PREVIOUSLY EMPLOYED */}
          <div className="field full" style={{ marginBottom: '15px' }}>
            <label style={{ fontWeight: 'bold' }}>Were you previously employed?</label><br/>
            <div style={{ display: 'flex', gap: '15px', marginTop: '5px' }}>
              <label>
                <input type="radio" name="prevEmployed" value="Y" checked={data.prevEmployed === 'Y'} onChange={handleChange} /> Yes
              </label>
              <label>
                <input type="radio" name="prevEmployed" value="N" checked={data.prevEmployed === 'N'} onChange={handleChange} /> No
              </label>
            </div>
          </div>

          {data.prevEmployed === 'Y' && (
            <div className="field-group callout" style={{ padding: '15px', backgroundColor: '#f9f9f9', border: '1px solid #ddd', marginBottom: '20px' }}>
              <h4>Employer/Employment Information:</h4>
              
              <div className="field full" style={{ marginBottom: '15px' }}>
                <label style={{ fontWeight: 'bold' }}>Employer Name</label><br/>
                <input type="text" name="prevEmpName" value={data.prevEmpName || ''} onChange={handleChange} maxLength="75" style={{ width: '95%', padding: '5px', marginTop: '5px' }} />
              </div>

              <div className="field full" style={{ marginBottom: '15px' }}>
                <label style={{ fontWeight: 'bold' }}>Employer Street Address (Line 1)</label><br/>
                <input type="text" name="prevEmpAddr1" value={data.prevEmpAddr1 || ''} onChange={handleChange} maxLength="40" style={{ width: '95%', padding: '5px', marginTop: '5px' }} />
              </div>

              <div className="field full" style={{ marginBottom: '15px' }}>
                <label style={{ fontWeight: 'bold' }}>Employer Street Address (Line 2) <span style={{color: '#891300', fontStyle: 'italic', fontWeight: 'normal'}}>*Optional</span></label><br/>
                <input type="text" name="prevEmpAddr2" value={data.prevEmpAddr2 || ''} onChange={handleChange} maxLength="40" style={{ width: '95%', padding: '5px', marginTop: '5px' }} />
              </div>

              <div className="field full" style={{ marginBottom: '15px' }}>
                <label style={{ fontWeight: 'bold' }}>City</label><br/>
                <input type="text" name="prevEmpCity" value={data.prevEmpCity || ''} onChange={handleChange} maxLength="20" style={{ width: '95%', padding: '5px', marginTop: '5px' }} />
              </div>

              <div className="field full" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ fontWeight: 'bold' }}>State/Province</label><br/>
                  <input type="text" name="prevEmpState" value={data.prevEmpState || ''} onChange={handleChange} maxLength="20" disabled={data.prevEmpStateNA} style={{ padding: '5px', width: '200px', backgroundColor: data.prevEmpStateNA ? '#eee' : 'white', marginTop: '5px' }} />
                </div>
                <div style={{ marginTop: '20px' }}>
                  <input type="checkbox" name="prevEmpStateNA" checked={data.prevEmpStateNA || false} onChange={handleCheck} id="prevEmpStateNA" />
                  <label htmlFor="prevEmpStateNA" style={{ marginLeft: '5px' }}>Does Not Apply</label>
                </div>
              </div>

              <div className="field full" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ fontWeight: 'bold' }}>Postal Zone/ZIP Code</label><br/>
                  <input type="text" name="prevEmpZipCode" value={data.prevEmpZipCode || ''} onChange={handleChange} maxLength="10" disabled={data.prevEmpZipCodeNA} style={{ padding: '5px', width: '150px', backgroundColor: data.prevEmpZipCodeNA ? '#eee' : 'white', marginTop: '5px' }} />
                </div>
                <div style={{ marginTop: '20px' }}>
                  <input type="checkbox" name="prevEmpZipCodeNA" checked={data.prevEmpZipCodeNA || false} onChange={handleCheck} id="prevEmpZipCodeNA" />
                  <label htmlFor="prevEmpZipCodeNA" style={{ marginLeft: '5px' }}>Does Not Apply</label>
                </div>
              </div>

              <div className="field full" style={{ marginBottom: '15px' }}>
                <label style={{ fontWeight: 'bold' }}>Country/Region</label><br/>
                <select name="prevEmpCountry" value={data.prevEmpCountry || ''} onChange={handleChange} style={{ width: '95%', padding: '5px', marginTop: '5px' }}>
                  <option value="">- Select One -</option>
                  {countries.map(c => <option key={c.val} value={c.val}>{c.label}</option>)}
                </select>
              </div>

              <div className="field full" style={{ marginBottom: '15px' }}>
                <label style={{ fontWeight: 'bold' }}>Telephone Number</label><br/>
                <input type="text" name="prevEmpPhone" value={data.prevEmpPhone || ''} onChange={handleChange} maxLength="15" style={{ width: '65%', padding: '5px', marginTop: '5px' }} />
              </div>

              <div className="field full" style={{ marginBottom: '15px' }}>
                <label style={{ fontWeight: 'bold' }}>Job Title</label><br/>
                <input type="text" name="prevEmpJobTitle" value={data.prevEmpJobTitle || ''} onChange={handleChange} maxLength="75" style={{ width: '95%', padding: '5px', marginTop: '5px' }} />
              </div>

              <div className="field full" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ fontWeight: 'bold' }}>Supervisor's Surname</label><br/>
                  <input type="text" name="prevEmpSupervisorSurname" value={data.prevEmpSupervisorSurname || ''} onChange={handleChange} maxLength="33" disabled={data.prevEmpSupervisorSurnameNA} style={{ padding: '5px', width: '250px', backgroundColor: data.prevEmpSupervisorSurnameNA ? '#eee' : 'white', marginTop: '5px' }} />
                </div>
                <div style={{ marginTop: '20px' }}>
                  <input type="checkbox" name="prevEmpSupervisorSurnameNA" checked={data.prevEmpSupervisorSurnameNA || false} onChange={handleCheck} id="prevEmpSupervisorSurnameNA" />
                  <label htmlFor="prevEmpSupervisorSurnameNA" style={{ marginLeft: '5px' }}>Do Not Know</label>
                </div>
              </div>

              <div className="field full" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ fontWeight: 'bold' }}>Supervisor's Given Names</label><br/>
                  <input type="text" name="prevEmpSupervisorGivenName" value={data.prevEmpSupervisorGivenName || ''} onChange={handleChange} maxLength="33" disabled={data.prevEmpSupervisorGivenNameNA} style={{ padding: '5px', width: '250px', backgroundColor: data.prevEmpSupervisorGivenNameNA ? '#eee' : 'white', marginTop: '5px' }} />
                </div>
                <div style={{ marginTop: '20px' }}>
                  <input type="checkbox" name="prevEmpSupervisorGivenNameNA" checked={data.prevEmpSupervisorGivenNameNA || false} onChange={handleCheck} id="prevEmpSupervisorGivenNameNA" />
                  <label htmlFor="prevEmpSupervisorGivenNameNA" style={{ marginLeft: '5px' }}>Do Not Know</label>
                </div>
              </div>

              <div className="field full" style={{ marginBottom: '15px' }}>
                <label style={{ fontWeight: 'bold' }}>Employment Date From</label><br/>
                <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
                  <select name="prevEmpStartDateDay" value={data.prevEmpStartDateDay || ''} onChange={handleChange} style={{ padding: '5px', width: '60px' }}>
                    <option value=""></option>
                    {days.map(d => <option key={d.val} value={d.val}>{d.label}</option>)}
                  </select>
                  <select name="prevEmpStartDateMonth" value={data.prevEmpStartDateMonth || ''} onChange={handleChange} style={{ padding: '5px', width: '70px' }}>
                    <option value=""></option>
                    {months.map(m => <option key={m.val} value={m.label}>{m.label}</option>)}
                  </select>
                  <input type="text" name="prevEmpStartDateYear" value={data.prevEmpStartDateYear || ''} onChange={handleChange} maxLength="4" placeholder="YYYY" style={{ padding: '5px', width: '60px' }} />
                </div>
                <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>(Format: DD-MMM-YYYY)</div>
              </div>

              <div className="field full" style={{ marginBottom: '15px' }}>
                <label style={{ fontWeight: 'bold' }}>Employment Date To</label><br/>
                <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
                  <select name="prevEmpEndDateDay" value={data.prevEmpEndDateDay || ''} onChange={handleChange} style={{ padding: '5px', width: '60px' }}>
                    <option value=""></option>
                    {days.map(d => <option key={d.val} value={d.val}>{d.label}</option>)}
                  </select>
                  <select name="prevEmpEndDateMonth" value={data.prevEmpEndDateMonth || ''} onChange={handleChange} style={{ padding: '5px', width: '70px' }}>
                    <option value=""></option>
                    {months.map(m => <option key={m.val} value={m.label}>{m.label}</option>)}
                  </select>
                  <input type="text" name="prevEmpEndDateYear" value={data.prevEmpEndDateYear || ''} onChange={handleChange} maxLength="4" placeholder="YYYY" style={{ padding: '5px', width: '60px' }} />
                </div>
                <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>(Format: DD-MMM-YYYY)</div>
              </div>

              <div className="field full" style={{ marginBottom: '15px' }}>
                <label style={{ fontWeight: 'bold' }}>Briefly describe your duties:</label><br/>
                <textarea name="prevEmpDuties" value={data.prevEmpDuties || ''} onChange={handleChange} rows="3" maxLength="4000" style={{ width: '98%', height: '65px', padding: '5px', marginTop: '5px', resize: 'none' }}></textarea>
              </div>
            </div>
          )}

        </fieldset>
        
        <hr />

        <fieldset>
          {/* PREVIOUS EDUCATION */}
          <div className="field full" style={{ marginBottom: '15px' }}>
            <label style={{ fontWeight: 'bold' }}>Have you attended any educational institutions at a secondary level or above?</label><br/>
            <div style={{ display: 'flex', gap: '15px', marginTop: '5px' }}>
              <label>
                <input type="radio" name="prevEduc" value="Y" checked={data.prevEduc === 'Y'} onChange={handleChange} /> Yes
              </label>
              <label>
                <input type="radio" name="prevEduc" value="N" checked={data.prevEduc === 'N'} onChange={handleChange} /> No
              </label>
            </div>
          </div>

          {data.prevEduc === 'Y' && (
            <div className="field-group callout" style={{ padding: '15px', backgroundColor: '#f9f9f9', border: '1px solid #ddd', marginBottom: '20px' }}>
              <h4>Provide the following information on the educational institution(s) you have attended.</h4>
              
              <div className="field full" style={{ marginBottom: '15px' }}>
                <label style={{ fontWeight: 'bold' }}>Name of Institution</label><br/>
                <input type="text" name="prevEducName" value={data.prevEducName || ''} onChange={handleChange} maxLength="75" style={{ width: '95%', padding: '5px', marginTop: '5px' }} />
              </div>

              <div className="field full" style={{ marginBottom: '15px' }}>
                <label style={{ fontWeight: 'bold' }}>Street Address (Line 1)</label><br/>
                <input type="text" name="prevEducAddr1" value={data.prevEducAddr1 || ''} onChange={handleChange} maxLength="40" style={{ width: '95%', padding: '5px', marginTop: '5px' }} />
              </div>

              <div className="field full" style={{ marginBottom: '15px' }}>
                <label style={{ fontWeight: 'bold' }}>Street Address (Line 2) <span style={{color: '#891300', fontStyle: 'italic', fontWeight: 'normal'}}>*Optional</span></label><br/>
                <input type="text" name="prevEducAddr2" value={data.prevEducAddr2 || ''} onChange={handleChange} maxLength="40" style={{ width: '95%', padding: '5px', marginTop: '5px' }} />
              </div>

              <div className="field full" style={{ marginBottom: '15px' }}>
                <label style={{ fontWeight: 'bold' }}>City</label><br/>
                <input type="text" name="prevEducCity" value={data.prevEducCity || ''} onChange={handleChange} maxLength="20" style={{ width: '95%', padding: '5px', marginTop: '5px' }} />
              </div>

              <div className="field full" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ fontWeight: 'bold' }}>State/Province</label><br/>
                  <input type="text" name="prevEducState" value={data.prevEducState || ''} onChange={handleChange} maxLength="20" disabled={data.prevEducStateNA} style={{ padding: '5px', width: '200px', backgroundColor: data.prevEducStateNA ? '#eee' : 'white', marginTop: '5px' }} />
                </div>
                <div style={{ marginTop: '20px' }}>
                  <input type="checkbox" name="prevEducStateNA" checked={data.prevEducStateNA || false} onChange={handleCheck} id="prevEducStateNA" />
                  <label htmlFor="prevEducStateNA" style={{ marginLeft: '5px' }}>Does Not Apply</label>
                </div>
              </div>

              <div className="field full" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ fontWeight: 'bold' }}>Postal Zone/ZIP Code</label><br/>
                  <input type="text" name="prevEducZipCode" value={data.prevEducZipCode || ''} onChange={handleChange} maxLength="10" disabled={data.prevEducZipCodeNA} style={{ padding: '5px', width: '150px', backgroundColor: data.prevEducZipCodeNA ? '#eee' : 'white', marginTop: '5px' }} />
                </div>
                <div style={{ marginTop: '20px' }}>
                  <input type="checkbox" name="prevEducZipCodeNA" checked={data.prevEducZipCodeNA || false} onChange={handleCheck} id="prevEducZipCodeNA" />
                  <label htmlFor="prevEducZipCodeNA" style={{ marginLeft: '5px' }}>Does Not Apply</label>
                </div>
              </div>

              <div className="field full" style={{ marginBottom: '15px' }}>
                <label style={{ fontWeight: 'bold' }}>Country/Region</label><br/>
                <select name="prevEducCountry" value={data.prevEducCountry || ''} onChange={handleChange} style={{ width: '95%', padding: '5px', marginTop: '5px' }}>
                  <option value="">- Select One -</option>
                  {countries.map(c => <option key={c.val} value={c.val}>{c.label}</option>)}
                </select>
              </div>

              <div className="field full" style={{ marginBottom: '15px' }}>
                <label style={{ fontWeight: 'bold' }}>Course of Study</label><br/>
                <input type="text" name="prevEducCourse" value={data.prevEducCourse || ''} onChange={handleChange} maxLength="66" style={{ width: '95%', padding: '5px', marginTop: '5px' }} />
              </div>

              <div className="field full" style={{ marginBottom: '15px' }}>
                <label style={{ fontWeight: 'bold' }}>Date of Attendance From</label><br/>
                <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
                  <select name="prevEducStartDateDay" value={data.prevEducStartDateDay || ''} onChange={handleChange} style={{ padding: '5px', width: '60px' }}>
                    <option value=""></option>
                    {days.map(d => <option key={d.val} value={d.val}>{d.label}</option>)}
                  </select>
                  <select name="prevEducStartDateMonth" value={data.prevEducStartDateMonth || ''} onChange={handleChange} style={{ padding: '5px', width: '70px' }}>
                    <option value=""></option>
                    {months.map(m => <option key={m.val} value={m.label}>{m.label}</option>)}
                  </select>
                  <input type="text" name="prevEducStartDateYear" value={data.prevEducStartDateYear || ''} onChange={handleChange} maxLength="4" placeholder="YYYY" style={{ padding: '5px', width: '60px' }} />
                </div>
                <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>(Format: DD-MMM-YYYY)</div>
              </div>

              <div className="field full" style={{ marginBottom: '15px' }}>
                <label style={{ fontWeight: 'bold' }}>Date of Attendance To</label><br/>
                <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
                  <select name="prevEducEndDateDay" value={data.prevEducEndDateDay || ''} onChange={handleChange} style={{ padding: '5px', width: '60px' }}>
                    <option value=""></option>
                    {days.map(d => <option key={d.val} value={d.val}>{d.label}</option>)}
                  </select>
                  <select name="prevEducEndDateMonth" value={data.prevEducEndDateMonth || ''} onChange={handleChange} style={{ padding: '5px', width: '70px' }}>
                    <option value=""></option>
                    {months.map(m => <option key={m.val} value={m.label}>{m.label}</option>)}
                  </select>
                  <input type="text" name="prevEducEndDateYear" value={data.prevEducEndDateYear || ''} onChange={handleChange} maxLength="4" placeholder="YYYY" style={{ padding: '5px', width: '60px' }} />
                </div>
                <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>(Format: DD-MMM-YYYY)</div>
              </div>
            </div>
          )}

        </fieldset>

        <div style={{ padding: '15px', backgroundColor: '#e9f5ff', border: '1px solid #b3d4fc', marginTop: '20px' }}>
          <h4 style={{ color: '#891300', margin: '0 0 10px 0' }}>Help:</h4>
          <p style={{ margin: '0 0 10px 0' }}><strong>Level of Education:</strong> You must answer Yes to this question if you have ever attended, for any length of time, a high school/secondary school (or its equivalent in your country) or college, university, graduate school, a doctoral program, or a vocational program.</p>
          <p style={{ margin: 0 }}><strong>Course of Study:</strong> For middle school/junior high or high school course of study please indicate “Academic” or “Vocational.” For all other educational levels please indicate your major or concentration.</p>
        </div>

      </div>
    </div>
  );
};

export default PreviousWorkEducation;
