import React from 'react';
import './ds160.css';

const WorkEducationInformation = ({ data, updateData }) => {
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

  const occupations = [
    { val: 'A', label: 'AGRICULTURE' },
    { val: 'AP', label: 'ARTIST/PERFORMER' },
    { val: 'B', label: 'BUSINESS' },
    { val: 'CM', label: 'COMMUNICATIONS' },
    { val: 'CS', label: 'COMPUTER SCIENCE' },
    { val: 'C', label: 'CULINARY/FOOD SERVICES' },
    { val: 'ED', label: 'EDUCATION' },
    { val: 'EN', label: 'ENGINEERING' },
    { val: 'G', label: 'GOVERNMENT' },
    { val: 'H', label: 'HOMEMAKER' },
    { val: 'LP', label: 'LEGAL PROFESSION' },
    { val: 'MH', label: 'MEDICAL/HEALTH' },
    { val: 'M', label: 'MILITARY' },
    { val: 'NS', label: 'NATURAL SCIENCE' },
    { val: 'N', label: 'NOT EMPLOYED' },
    { val: 'PS', label: 'PHYSICAL SCIENCES' },
    { val: 'RV', label: 'RELIGIOUS VOCATION' },
    { val: 'R', label: 'RESEARCH' },
    { val: 'RT', label: 'RETIRED' },
    { val: 'SS', label: 'SOCIAL SCIENCE' },
    { val: 'S', label: 'STUDENT' },
    { val: 'O', label: 'OTHER' }
  ];

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

  const notEmployedOrHomemaker = data.primaryOccupation === 'N' || data.primaryOccupation === 'H' || data.primaryOccupation === 'RT';

  return (
    <div className="ds160-container" style={{ fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#333' }}>
      <div className="section-header">
        <h2>Present Work/Education/Training Information</h2>
        <p className="note">NOTE: Provide the following information concerning your current employment or education.</p>
      </div>

      <div className="form-container">
        <fieldset>
          
          <div className="field full" style={{ marginBottom: '15px' }}>
            <label style={{ fontWeight: 'bold' }}>Primary Occupation</label><br/>
            <select name="primaryOccupation" value={data.primaryOccupation || ''} onChange={handleChange} style={{ width: '300px', padding: '5px', marginTop: '5px' }}>
              <option value="">-Select One-</option>
              {occupations.map(occ => <option key={occ.val} value={occ.val}>{occ.label}</option>)}
            </select>
          </div>

          {!notEmployedOrHomemaker && data.primaryOccupation && (
            <div className="field-group callout" style={{ padding: '15px', backgroundColor: '#f9f9f9', border: '1px solid #ddd' }}>
              <div className="field full" style={{ marginBottom: '15px' }}>
                <label style={{ fontWeight: 'bold' }}>Present Employer or School Name</label><br/>
                <input type="text" name="empSchName" value={data.empSchName || ''} onChange={handleChange} maxLength="75" style={{ width: '95%', padding: '5px', marginTop: '5px' }} />
              </div>

              <h4>Present employer or school address:</h4>

              <div className="field full" style={{ marginBottom: '15px' }}>
                <label style={{ fontWeight: 'bold' }}>Street Address (Line 1)</label><br/>
                <input type="text" name="empSchAddr1" value={data.empSchAddr1 || ''} onChange={handleChange} maxLength="40" style={{ width: '95%', padding: '5px', marginTop: '5px' }} />
              </div>

              <div className="field full" style={{ marginBottom: '15px' }}>
                <label style={{ fontWeight: 'bold' }}>Street Address (Line 2) <span style={{color: '#891300', fontStyle: 'italic', fontWeight: 'normal'}}>*Optional</span></label><br/>
                <input type="text" name="empSchAddr2" value={data.empSchAddr2 || ''} onChange={handleChange} maxLength="40" style={{ width: '95%', padding: '5px', marginTop: '5px' }} />
              </div>

              <div className="field full" style={{ marginBottom: '15px' }}>
                <label style={{ fontWeight: 'bold' }}>City</label><br/>
                <input type="text" name="empSchCity" value={data.empSchCity || ''} onChange={handleChange} maxLength="20" style={{ width: '95%', padding: '5px', marginTop: '5px' }} />
              </div>

              <div className="field full" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ fontWeight: 'bold' }}>State/Province</label><br/>
                  <input type="text" name="empSchState" value={data.empSchState || ''} onChange={handleChange} maxLength="20" disabled={data.empSchStateNA} style={{ padding: '5px', width: '200px', backgroundColor: data.empSchStateNA ? '#eee' : 'white', marginTop: '5px' }} />
                </div>
                <div style={{ marginTop: '20px' }}>
                  <input type="checkbox" name="empSchStateNA" checked={data.empSchStateNA || false} onChange={handleCheck} id="empSchStateNA" />
                  <label htmlFor="empSchStateNA" style={{ marginLeft: '5px' }}>Does Not Apply</label>
                </div>
              </div>

              <div className="field full" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ fontWeight: 'bold' }}>Postal Zone/ZIP Code</label><br/>
                  <input type="text" name="empSchZipCode" value={data.empSchZipCode || ''} onChange={handleChange} maxLength="10" disabled={data.empSchZipCodeNA} style={{ padding: '5px', width: '150px', backgroundColor: data.empSchZipCodeNA ? '#eee' : 'white', marginTop: '5px' }} />
                </div>
                <div style={{ marginTop: '20px' }}>
                  <input type="checkbox" name="empSchZipCodeNA" checked={data.empSchZipCodeNA || false} onChange={handleCheck} id="empSchZipCodeNA" />
                  <label htmlFor="empSchZipCodeNA" style={{ marginLeft: '5px' }}>Does Not Apply</label>
                </div>
              </div>

              <div className="field full" style={{ marginBottom: '15px' }}>
                <label style={{ fontWeight: 'bold' }}>Phone Number</label><br/>
                <input type="text" name="empSchPhone" value={data.empSchPhone || ''} onChange={handleChange} maxLength="15" style={{ width: '65%', padding: '5px', marginTop: '5px' }} />
              </div>

              <div className="field full" style={{ marginBottom: '15px' }}>
                <label style={{ fontWeight: 'bold' }}>Country/Region</label><br/>
                <select name="empSchCountry" value={data.empSchCountry || ''} onChange={handleChange} style={{ width: '95%', padding: '5px', marginTop: '5px' }}>
                  <option value="">- Select One -</option>
                  {countries.map(c => <option key={c.val} value={c.val}>{c.label}</option>)}
                </select>
              </div>

              <div className="field full" style={{ marginBottom: '15px' }}>
                <label style={{ fontWeight: 'bold' }}>Start Date</label><br/>
                <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
                  <select name="empStartDateDay" value={data.empStartDateDay || ''} onChange={handleChange} style={{ padding: '5px', width: '60px' }}>
                    <option value=""></option>
                    {days.map(d => <option key={d.val} value={d.val}>{d.label}</option>)}
                  </select>
                  <select name="empStartDateMonth" value={data.empStartDateMonth || ''} onChange={handleChange} style={{ padding: '5px', width: '70px' }}>
                    <option value=""></option>
                    {months.map(m => <option key={m.val} value={m.label}>{m.label}</option>)}
                  </select>
                  <input type="text" name="empStartDateYear" value={data.empStartDateYear || ''} onChange={handleChange} maxLength="4" placeholder="YYYY" style={{ padding: '5px', width: '60px' }} />
                </div>
                <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>(Format: DD-MMM-YYYY)</div>
              </div>

              <div className="field full" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ fontWeight: 'bold' }}>Monthly Income in Local Currency (if employed)</label><br/>
                  <input type="text" name="monthlyIncome" value={data.monthlyIncome || ''} onChange={handleChange} maxLength="15" disabled={data.monthlyIncomeNA} style={{ padding: '5px', width: '150px', backgroundColor: data.monthlyIncomeNA ? '#eee' : 'white', marginTop: '5px' }} />
                </div>
                <div style={{ marginTop: '20px' }}>
                  <input type="checkbox" name="monthlyIncomeNA" checked={data.monthlyIncomeNA || false} onChange={handleCheck} id="monthlyIncomeNA" />
                  <label htmlFor="monthlyIncomeNA" style={{ marginLeft: '5px' }}>Does Not Apply</label>
                </div>
              </div>

              <div className="field full" style={{ marginBottom: '15px' }}>
                <label style={{ fontWeight: 'bold' }}>Briefly describe your duties:</label><br/>
                <textarea name="empDuties" value={data.empDuties || ''} onChange={handleChange} rows="3" maxLength="4000" style={{ width: '300px', height: '65px', padding: '5px', marginTop: '5px', resize: 'none' }}></textarea>
              </div>

            </div>
          )}

          {data.primaryOccupation === 'N' && (
             <div className="field-group callout" style={{ padding: '15px', backgroundColor: '#f9f9f9', border: '1px solid #ddd', marginTop: '15px' }}>
               <div className="field full" style={{ marginBottom: '15px' }}>
                  <label style={{ fontWeight: 'bold' }}>Explain:</label><br/>
                  <textarea name="notEmployedExplain" value={data.notEmployedExplain || ''} onChange={handleChange} rows="3" maxLength="4000" style={{ width: '300px', height: '65px', padding: '5px', marginTop: '5px', resize: 'none' }}></textarea>
               </div>
             </div>
          )}
        </fieldset>

      </div>
    </div>
  );
};

export default WorkEducationInformation;
