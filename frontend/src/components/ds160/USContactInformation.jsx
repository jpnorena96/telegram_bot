import React from 'react';
import './ds160.css';

const USContactInformation = ({ data, updateData }) => {
  const handleChange = (e) => {
    updateData({ [e.target.name]: e.target.value });
  };

  const handleCheck = (e) => {
    updateData({ [e.target.name]: e.target.checked });
  };

  const usStates = [
    { val: 'AL', label: 'ALABAMA' }, { val: 'AK', label: 'ALASKA' }, { val: 'AZ', label: 'ARIZONA' },
    { val: 'AR', label: 'ARKANSAS' }, { val: 'CA', label: 'CALIFORNIA' }, { val: 'CO', label: 'COLORADO' },
    { val: 'CT', label: 'CONNECTICUT' }, { val: 'DE', label: 'DELAWARE' }, { val: 'DC', label: 'DISTRICT OF COLUMBIA' },
    { val: 'FL', label: 'FLORIDA' }, { val: 'GA', label: 'GEORGIA' }, { val: 'HI', label: 'HAWAII' },
    { val: 'ID', label: 'IDAHO' }, { val: 'IL', label: 'ILLINOIS' }, { val: 'IN', label: 'INDIANA' },
    { val: 'IA', label: 'IOWA' }, { val: 'KS', label: 'KANSAS' }, { val: 'KY', label: 'KENTUCKY' },
    { val: 'LA', label: 'LOUISIANA' }, { val: 'ME', label: 'MAINE' }, { val: 'MD', label: 'MARYLAND' },
    { val: 'MA', label: 'MASSACHUSETTS' }, { val: 'MI', label: 'MICHIGAN' }, { val: 'MN', label: 'MINNESOTA' },
    { val: 'MS', label: 'MISSISSIPPI' }, { val: 'MO', label: 'MISSOURI' }, { val: 'MT', label: 'MONTANA' },
    { val: 'NE', label: 'NEBRASKA' }, { val: 'NV', label: 'NEVADA' }, { val: 'NH', label: 'NEW HAMPSHIRE' },
    { val: 'NJ', label: 'NEW JERSEY' }, { val: 'NM', label: 'NEW MEXICO' }, { val: 'NY', label: 'NEW YORK' },
    { val: 'NC', label: 'NORTH CAROLINA' }, { val: 'ND', label: 'NORTH DAKOTA' }, { val: 'OH', label: 'OHIO' },
    { val: 'OK', label: 'OKLAHOMA' }, { val: 'OR', label: 'OREGON' }, { val: 'PA', label: 'PENNSYLVANIA' },
    { val: 'RI', label: 'RHODE ISLAND' }, { val: 'SC', label: 'SOUTH CAROLINA' }, { val: 'SD', label: 'SOUTH DAKOTA' },
    { val: 'TN', label: 'TENNESSEE' }, { val: 'TX', label: 'TEXAS' }, { val: 'UT', label: 'UTAH' },
    { val: 'VT', label: 'VERMONT' }, { val: 'VA', label: 'VIRGINIA' }, { val: 'WA', label: 'WASHINGTON' },
    { val: 'WV', label: 'WEST VIRGINIA' }, { val: 'WI', label: 'WISCONSIN' }, { val: 'WY', label: 'WYOMING' }
  ];

  return (
    <div className="ds160-container" style={{ fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#333' }}>
      <div className="section-header">
        <h2>U.S. Point of Contact Information</h2>
        <p className="note">Contact Person or Organization in the United States</p>
      </div>

      <div className="form-container">
        <fieldset>
          <h3>Contact Person</h3>
          
          <div className="field full" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
            <div>
              <label style={{ fontWeight: 'bold' }}>Surnames</label><br/>
              <input type="text" name="pocSurname" value={data.pocSurname || ''} onChange={handleChange} maxLength="33" disabled={data.pocNameNA} style={{ padding: '5px', width: '200px', backgroundColor: data.pocNameNA ? '#eee' : 'white' }} />
            </div>
            <div>
              <label style={{ fontWeight: 'bold' }}>Given Names</label><br/>
              <input type="text" name="pocGivenName" value={data.pocGivenName || ''} onChange={handleChange} maxLength="33" disabled={data.pocNameNA} style={{ padding: '5px', width: '200px', backgroundColor: data.pocNameNA ? '#eee' : 'white' }} />
            </div>
            <div style={{ marginTop: '20px' }}>
              <input type="checkbox" name="pocNameNA" checked={data.pocNameNA || false} onChange={handleCheck} id="pocNameNA" />
              <label htmlFor="pocNameNA" style={{ marginLeft: '5px' }}>Do Not Know</label>
            </div>
          </div>

          <div className="field full" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
            <div>
              <label style={{ fontWeight: 'bold' }}>Organization Name</label><br/>
              <input type="text" name="pocOrgName" value={data.pocOrgName || ''} onChange={handleChange} maxLength="33" disabled={data.pocOrgNA} style={{ padding: '5px', width: '300px', backgroundColor: data.pocOrgNA ? '#eee' : 'white' }} />
            </div>
            <div style={{ marginTop: '20px' }}>
              <input type="checkbox" name="pocOrgNA" checked={data.pocOrgNA || false} onChange={handleCheck} id="pocOrgNA" />
              <label htmlFor="pocOrgNA" style={{ marginLeft: '5px' }}>Do Not Know</label>
            </div>
          </div>

          <div className="field full" style={{ marginBottom: '15px' }}>
            <label style={{ fontWeight: 'bold' }}>Relationship to You</label><br/>
            <select name="pocRelationship" value={data.pocRelationship || ''} onChange={handleChange} style={{ width: '300px', padding: '5px' }}>
              <option value="">- SELECT ONE -</option>
              <option value="R">RELATIVE</option>
              <option value="S">SPOUSE</option>
              <option value="C">FRIEND</option>
              <option value="B">BUSINESS ASSOCIATE</option>
              <option value="P">EMPLOYER</option>
              <option value="H">SCHOOL OFFICIAL</option>
              <option value="O">OTHER</option>
            </select>
          </div>
        </fieldset>

        <hr />

        <fieldset>
          <h3>Address and Phone Number of Point of Contact</h3>
          
          <div className="field full" style={{ marginBottom: '15px' }}>
            <label style={{ fontWeight: 'bold' }}>U.S. Street Address (Line 1)</label><br/>
            <input type="text" name="pocStreet1" value={data.pocStreet1 || ''} onChange={handleChange} maxLength="40" style={{ width: '100%', maxWidth: '400px', padding: '5px' }} />
          </div>

          <div className="field full" style={{ marginBottom: '15px' }}>
            <label style={{ fontWeight: 'bold' }}>U.S. Street Address (Line 2) <span style={{color: '#891300', fontStyle: 'italic', fontWeight: 'normal'}}>*Optional</span></label><br/>
            <input type="text" name="pocStreet2" value={data.pocStreet2 || ''} onChange={handleChange} maxLength="40" style={{ width: '100%', maxWidth: '400px', padding: '5px' }} />
          </div>

          <div className="field full" style={{ marginBottom: '15px' }}>
            <label style={{ fontWeight: 'bold' }}>City</label><br/>
            <input type="text" name="pocCity" value={data.pocCity || ''} onChange={handleChange} maxLength="20" style={{ padding: '5px' }} />
          </div>

          <div className="field full" style={{ marginBottom: '15px' }}>
            <label style={{ fontWeight: 'bold' }}>State</label><br/>
            <select name="pocState" value={data.pocState || ''} onChange={handleChange} style={{ width: '200px', padding: '5px' }}>
              <option value="">- Select one -</option>
              {usStates.map(st => <option key={st.val} value={st.val}>{st.label}</option>)}
            </select>
          </div>

          <div className="field full" style={{ marginBottom: '15px' }}>
            <label style={{ fontWeight: 'bold' }}>ZIP Code <span style={{fontWeight: 'normal'}}>(if known)</span></label><br/>
            <input type="text" name="pocZipCode" value={data.pocZipCode || ''} onChange={handleChange} maxLength="10" placeholder="e.g., 55555" style={{ padding: '5px' }} />
          </div>

          <div className="field full" style={{ marginBottom: '15px' }}>
            <label style={{ fontWeight: 'bold' }}>Phone Number</label><br/>
            <input type="text" name="pocPhone" value={data.pocPhone || ''} onChange={handleChange} maxLength="15" placeholder="e.g., 5555555555" style={{ padding: '5px' }} />
          </div>

          <div className="field full" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
            <div>
              <label style={{ fontWeight: 'bold' }}>Email Address</label><br/>
              <input type="text" name="pocEmail" value={data.pocEmail || ''} onChange={handleChange} maxLength="50" disabled={data.pocEmailNA} placeholder="emailaddress@example.com" style={{ padding: '5px', width: '300px', backgroundColor: data.pocEmailNA ? '#eee' : 'white' }} />
            </div>
            <div style={{ marginTop: '20px' }}>
              <input type="checkbox" name="pocEmailNA" checked={data.pocEmailNA || false} onChange={handleCheck} id="pocEmailNA" />
              <label htmlFor="pocEmailNA" style={{ marginLeft: '5px' }}>Does Not Apply</label>
            </div>
          </div>
        </fieldset>
      </div>
    </div>
  );
};

export default USContactInformation;