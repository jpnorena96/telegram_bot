import React from 'react';
import './ds160.css';

const PassportInformation = ({ data, updateData }) => {
  const handleChange = (e) => {
    updateData({ [e.target.name]: e.target.value });
  };

  const handleCheck = (e) => {
    updateData({ [e.target.name]: e.target.checked });
  };

  const days = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));
  const months = [
    { val: '01', label: 'JAN' }, { val: '02', label: 'FEB' }, { val: '03', label: 'MAR' },
    { val: '04', label: 'APR' }, { val: '05', label: 'MAY' }, { val: '06', label: 'JUN' },
    { val: '07', label: 'JUL' }, { val: '08', label: 'AUG' }, { val: '09', label: 'SEP' },
    { val: '10', label: 'OCT' }, { val: '11', label: 'NOV' }, { val: '12', label: 'DEC' }
  ];

  return (
    <div className="ds160-container" style={{ fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#333' }}>
      <div className="section-header">
        <h2>Passport Information</h2>
        <p className="note">NOTE: Provide the following passport information.</p>
      </div>
      
      <div className="form-container">
        <fieldset>
          <div className="field full" style={{ marginBottom: '15px' }}>
            <label style={{ fontWeight: 'bold' }}>Passport/Travel Document Type</label><br/>
            <select name="passportType" value={data.passportType || ''} onChange={handleChange} style={{ width: '300px', padding: '5px' }}>
              <option value="">-Select One-</option>
              <option value="R">REGULAR</option>
              <option value="O">OFFICIAL</option>
              <option value="D">DIPLOMATIC</option>
              <option value="L">LAISSEZ-PASSER</option>
              <option value="T">OTHER</option>
            </select>
          </div>

          <div className="field full" style={{ marginBottom: '15px' }}>
            <label style={{ fontWeight: 'bold' }}>Passport/Travel Document Number</label><br/>
            <input type="text" name="passportNumber" value={data.passportNumber || ''} onChange={handleChange} maxLength="20" style={{ width: '100%', maxWidth: '300px', padding: '5px' }} />
          </div>
          
          <div className="field full" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
            <div>
              <label style={{ fontWeight: 'bold' }}>Passport Book Number</label><br/>
              <input type="text" name="passportBookNumber" value={data.passportBookNumber || ''} onChange={handleChange} maxLength="20" disabled={data.passportBookNumberNA} style={{ padding: '5px', backgroundColor: data.passportBookNumberNA ? '#eee' : 'white' }} />
            </div>
            <div style={{ marginTop: '20px' }}>
              <input type="checkbox" name="passportBookNumberNA" checked={data.passportBookNumberNA || false} onChange={handleCheck} id="passportBookNumberNA" />
              <label htmlFor="passportBookNumberNA" style={{ marginLeft: '5px' }}>Does Not Apply</label>
            </div>
          </div>

          <div className="field full" style={{ marginBottom: '15px' }}>
            <label style={{ fontWeight: 'bold' }}>Country/Authority that Issued Passport/Travel Document</label><br/>
            <select name="passportIssuedCountry" value={data.passportIssuedCountry || ''} onChange={handleChange} style={{ width: '300px', padding: '5px' }}>
              <option value="">- Select One -</option>
              <option value="MEX">MEXICO</option>
              <option value="USA">UNITED STATES OF AMERICA</option>
              <option value="CAN">CANADA</option>
              <option value="COL">COLOMBIA</option>
            </select>
          </div>
        </fieldset>
        
        <hr />
        
        <fieldset>
          <h3>Where was the Passport/Travel Document Issued?</h3>
          <div className="field full" style={{ marginBottom: '15px' }}>
            <label style={{ fontWeight: 'bold' }}>City</label><br/>
            <input type="text" name="passportIssuedCity" value={data.passportIssuedCity || ''} onChange={handleChange} maxLength="25" style={{ width: '100%', maxWidth: '300px', padding: '5px' }} />
          </div>
          
          <div className="field full" style={{ marginBottom: '15px' }}>
            <label style={{ fontWeight: 'bold' }}>State/Province <span style={{color: '#891300', fontStyle: 'italic', fontWeight: 'normal'}}>*If shown on passport</span></label><br/>
            <input type="text" name="passportIssuedState" value={data.passportIssuedState || ''} onChange={handleChange} maxLength="25" style={{ width: '100%', maxWidth: '300px', padding: '5px' }} />
          </div>

          <div className="field full" style={{ marginBottom: '15px' }}>
            <label style={{ fontWeight: 'bold' }}>Country/Region</label><br/>
            <select name="passportIssuedCountryRegion" value={data.passportIssuedCountryRegion || ''} onChange={handleChange} style={{ width: '300px', padding: '5px' }}>
              <option value="">- Select One -</option>
              <option value="MEX">MEXICO</option>
              <option value="USA">UNITED STATES OF AMERICA</option>
              <option value="CAN">CANADA</option>
              <option value="COL">COLOMBIA</option>
            </select>
          </div>
        </fieldset>
        
        <hr />

        <fieldset>
          <div className="field full" style={{ marginBottom: '15px' }}>
            <label style={{ fontWeight: 'bold' }}>Issuance Date</label><br/>
            <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
              <select name="passportIssuedDay" value={data.passportIssuedDay || ''} onChange={handleChange} style={{ padding: '5px' }}>
                <option value="">Day</option>
                {days.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <select name="passportIssuedMonth" value={data.passportIssuedMonth || ''} onChange={handleChange} style={{ padding: '5px' }}>
                <option value="">Month</option>
                {months.map(m => <option key={m.val} value={m.val}>{m.label}</option>)}
              </select>
              <input type="text" name="passportIssuedYear" value={data.passportIssuedYear || ''} onChange={handleChange} maxLength="4" placeholder="YYYY" style={{ padding: '5px', width: '60px' }} />
            </div>
          </div>

          <div className="field full" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
            <div>
              <label style={{ fontWeight: 'bold' }}>Expiration Date</label><br/>
              <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                <select name="passportExpireDay" value={data.passportExpireDay || ''} onChange={handleChange} disabled={data.passportExpireNA} style={{ padding: '5px', backgroundColor: data.passportExpireNA ? '#eee' : 'white' }}>
                  <option value="">Day</option>
                  {days.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <select name="passportExpireMonth" value={data.passportExpireMonth || ''} onChange={handleChange} disabled={data.passportExpireNA} style={{ padding: '5px', backgroundColor: data.passportExpireNA ? '#eee' : 'white' }}>
                  <option value="">Month</option>
                  {months.map(m => <option key={m.val} value={m.val}>{m.label}</option>)}
                </select>
                <input type="text" name="passportExpireYear" value={data.passportExpireYear || ''} onChange={handleChange} maxLength="4" placeholder="YYYY" disabled={data.passportExpireNA} style={{ padding: '5px', width: '60px', backgroundColor: data.passportExpireNA ? '#eee' : 'white' }} />
              </div>
            </div>
            <div style={{ marginTop: '20px' }}>
              <input type="checkbox" name="passportExpireNA" checked={data.passportExpireNA || false} onChange={handleCheck} id="passportExpireNA" />
              <label htmlFor="passportExpireNA" style={{ marginLeft: '5px' }}>No Expiration</label>
            </div>
          </div>
        </fieldset>

        <hr />
        
        <fieldset>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ fontWeight: 'bold' }}>Have you ever lost a passport or had one stolen?</label><br/>
            <div style={{ marginTop: '5px' }}>
              <label style={{ marginRight: '15px' }}>
                <input type="radio" name="lostPassport" value="Y" checked={data.lostPassport === 'Y'} onChange={handleChange} style={{ marginRight: '5px' }} /> Yes
              </label>
              <label>
                <input type="radio" name="lostPassport" value="N" checked={data.lostPassport === 'N'} onChange={handleChange} style={{ marginRight: '5px' }} /> No
              </label>
            </div>
          </div>
        </fieldset>
      </div>
    </div>
  );
};

export default PassportInformation;