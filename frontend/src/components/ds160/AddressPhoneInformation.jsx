import React from 'react';
import './ds160.css';

const AddressPhoneInformation = ({ data, updateData }) => {
  const handleChange = (e) => {
    updateData({ [e.target.name]: e.target.value });
  };

  const handleCheck = (e) => {
    updateData({ [e.target.name]: e.target.checked });
  };

  return (
    <div className="ds160-container" style={{ fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#333' }}>
      <div className="section-header">
        <h2>Address and Phone Information</h2>
        <p className="note">NOTE: Provide your address and phone information.</p>
      </div>
      
      <div className="form-container">
        <fieldset>
          <h3>Home Address</h3>
          <div className="field full" style={{ marginBottom: '15px' }}>
            <label style={{ fontWeight: 'bold' }}>Street Address (Line 1)</label><br/>
            <input type="text" name="homeStreet1" value={data.homeStreet1 || ''} onChange={handleChange} maxLength="40" style={{ width: '100%', maxWidth: '400px', padding: '5px' }} />
          </div>
          <div className="field full" style={{ marginBottom: '15px' }}>
            <label style={{ fontWeight: 'bold' }}>Street Address (Line 2) <span style={{color: '#891300', fontStyle: 'italic', fontWeight: 'normal'}}>*Optional</span></label><br/>
            <input type="text" name="homeStreet2" value={data.homeStreet2 || ''} onChange={handleChange} maxLength="40" style={{ width: '100%', maxWidth: '400px', padding: '5px' }} />
          </div>
          <div className="field full" style={{ marginBottom: '15px' }}>
            <label style={{ fontWeight: 'bold' }}>City</label><br/>
            <input type="text" name="homeCity" value={data.homeCity || ''} onChange={handleChange} maxLength="20" style={{ padding: '5px' }} />
          </div>
          
          <div className="field full" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
            <div>
              <label style={{ fontWeight: 'bold' }}>State/Province</label><br/>
              <input type="text" name="homeState" value={data.homeState || ''} onChange={handleChange} maxLength="20" disabled={data.homeStateNA} style={{ padding: '5px', backgroundColor: data.homeStateNA ? '#eee' : 'white' }} />
            </div>
            <div style={{ marginTop: '20px' }}>
              <input type="checkbox" name="homeStateNA" checked={data.homeStateNA || false} onChange={handleCheck} id="homeStateNA" />
              <label htmlFor="homeStateNA" style={{ marginLeft: '5px' }}>Does Not Apply</label>
            </div>
          </div>

          <div className="field full" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
            <div>
              <label style={{ fontWeight: 'bold' }}>Postal Zone/ZIP Code</label><br/>
              <input type="text" name="homeZip" value={data.homeZip || ''} onChange={handleChange} maxLength="10" disabled={data.homeZipNA} style={{ padding: '5px', backgroundColor: data.homeZipNA ? '#eee' : 'white' }} />
            </div>
            <div style={{ marginTop: '20px' }}>
              <input type="checkbox" name="homeZipNA" checked={data.homeZipNA || false} onChange={handleCheck} id="homeZipNA" />
              <label htmlFor="homeZipNA" style={{ marginLeft: '5px' }}>Does Not Apply</label>
            </div>
          </div>

          <div className="field full" style={{ marginBottom: '15px' }}>
            <label style={{ fontWeight: 'bold' }}>Country/Region</label><br/>
            <select name="homeCountry" value={data.homeCountry || ''} onChange={handleChange} style={{ width: '300px', padding: '5px' }}>
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
          <h3>Mailing Address</h3>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ fontWeight: 'bold' }}>Is your Mailing Address the same as your Home Address?</label><br/>
            <div style={{ marginTop: '5px' }}>
              <label style={{ marginRight: '15px' }}>
                <input type="radio" name="sameMailingAddress" value="Y" checked={data.sameMailingAddress === 'Y'} onChange={handleChange} style={{ marginRight: '5px' }} /> Yes
              </label>
              <label>
                <input type="radio" name="sameMailingAddress" value="N" checked={data.sameMailingAddress === 'N'} onChange={handleChange} style={{ marginRight: '5px' }} /> No
              </label>
            </div>
          </div>

          {data.sameMailingAddress === 'N' && (
            <div style={{ marginLeft: '20px', paddingLeft: '15px', borderLeft: '3px solid #0055a5' }}>
              <h4>Provide your mailing address:</h4>
              <div className="field full" style={{ marginBottom: '15px' }}>
                <label style={{ fontWeight: 'bold' }}>Street Address (Line 1)</label><br/>
                <input type="text" name="mailStreet1" value={data.mailStreet1 || ''} onChange={handleChange} maxLength="40" style={{ width: '100%', maxWidth: '400px', padding: '5px' }} />
              </div>
              <div className="field full" style={{ marginBottom: '15px' }}>
                <label style={{ fontWeight: 'bold' }}>Street Address (Line 2) <span style={{color: '#891300', fontStyle: 'italic', fontWeight: 'normal'}}>*Optional</span></label><br/>
                <input type="text" name="mailStreet2" value={data.mailStreet2 || ''} onChange={handleChange} maxLength="40" style={{ width: '100%', maxWidth: '400px', padding: '5px' }} />
              </div>
              <div className="field full" style={{ marginBottom: '15px' }}>
                <label style={{ fontWeight: 'bold' }}>City</label><br/>
                <input type="text" name="mailCity" value={data.mailCity || ''} onChange={handleChange} maxLength="20" style={{ padding: '5px' }} />
              </div>
              
              <div className="field full" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ fontWeight: 'bold' }}>State/Province</label><br/>
                  <input type="text" name="mailState" value={data.mailState || ''} onChange={handleChange} maxLength="20" disabled={data.mailStateNA} style={{ padding: '5px', backgroundColor: data.mailStateNA ? '#eee' : 'white' }} />
                </div>
                <div style={{ marginTop: '20px' }}>
                  <input type="checkbox" name="mailStateNA" checked={data.mailStateNA || false} onChange={handleCheck} id="mailStateNA" />
                  <label htmlFor="mailStateNA" style={{ marginLeft: '5px' }}>Does Not Apply</label>
                </div>
              </div>

              <div className="field full" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ fontWeight: 'bold' }}>Postal Zone/ZIP Code</label><br/>
                  <input type="text" name="mailZip" value={data.mailZip || ''} onChange={handleChange} maxLength="10" disabled={data.mailZipNA} style={{ padding: '5px', backgroundColor: data.mailZipNA ? '#eee' : 'white' }} />
                </div>
                <div style={{ marginTop: '20px' }}>
                  <input type="checkbox" name="mailZipNA" checked={data.mailZipNA || false} onChange={handleCheck} id="mailZipNA" />
                  <label htmlFor="mailZipNA" style={{ marginLeft: '5px' }}>Does Not Apply</label>
                </div>
              </div>

              <div className="field full" style={{ marginBottom: '15px' }}>
                <label style={{ fontWeight: 'bold' }}>Country/Region</label><br/>
                <select name="mailCountry" value={data.mailCountry || ''} onChange={handleChange} style={{ width: '300px', padding: '5px' }}>
                  <option value="">- Select One -</option>
                  <option value="MEX">MEXICO</option>
                  <option value="USA">UNITED STATES OF AMERICA</option>
                  <option value="CAN">CANADA</option>
                  <option value="COL">COLOMBIA</option>
                </select>
              </div>
            </div>
          )}
        </fieldset>

        <hr />

        <fieldset>
          <h3>Phone</h3>
          <div className="field full" style={{ marginBottom: '15px' }}>
            <label style={{ fontWeight: 'bold' }}>Primary Phone Number</label><br/>
            <input type="text" name="primaryPhone" value={data.primaryPhone || ''} onChange={handleChange} maxLength="15" style={{ padding: '5px' }} />
          </div>

          <div className="field full" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
            <div>
              <label style={{ fontWeight: 'bold' }}>Secondary Phone Number</label><br/>
              <input type="text" name="secondaryPhone" value={data.secondaryPhone || ''} onChange={handleChange} maxLength="15" disabled={data.secondaryPhoneNA} style={{ padding: '5px', backgroundColor: data.secondaryPhoneNA ? '#eee' : 'white' }} />
            </div>
            <div style={{ marginTop: '20px' }}>
              <input type="checkbox" name="secondaryPhoneNA" checked={data.secondaryPhoneNA || false} onChange={handleCheck} id="secondaryPhoneNA" />
              <label htmlFor="secondaryPhoneNA" style={{ marginLeft: '5px' }}>Does Not Apply</label>
            </div>
          </div>

          <div className="field full" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
            <div>
              <label style={{ fontWeight: 'bold' }}>Work Phone Number</label><br/>
              <input type="text" name="workPhone" value={data.workPhone || ''} onChange={handleChange} maxLength="15" disabled={data.workPhoneNA} style={{ padding: '5px', backgroundColor: data.workPhoneNA ? '#eee' : 'white' }} />
            </div>
            <div style={{ marginTop: '20px' }}>
              <input type="checkbox" name="workPhoneNA" checked={data.workPhoneNA || false} onChange={handleCheck} id="workPhoneNA" />
              <label htmlFor="workPhoneNA" style={{ marginLeft: '5px' }}>Does Not Apply</label>
            </div>
          </div>
        </fieldset>

        <hr />

        <fieldset>
          <h3>Email Address</h3>
          <div className="field full" style={{ marginBottom: '15px' }}>
            <label style={{ fontWeight: 'bold' }}>Email Address</label><br/>
            <input type="text" name="emailAddress" value={data.emailAddress || ''} onChange={handleChange} maxLength="50" style={{ width: '100%', maxWidth: '300px', padding: '5px' }} />
          </div>
        </fieldset>

        <hr />

        <fieldset>
          <h3>Social Media</h3>
          <p>Do you have a social media presence?</p>
          <div className="field full" style={{ marginBottom: '15px' }}>
            <label style={{ fontWeight: 'bold' }}>Social Media Provider/Platform</label><br/>
            <select name="socialMediaPlatform" value={data.socialMediaPlatform || 'NONE'} onChange={handleChange} style={{ width: '300px', padding: '5px', marginTop: '5px' }}>
              <option value="SONE">- Select One -</option>
              <option value="FCBK">FACEBOOK</option>
              <option value="INST">INSTAGRAM</option>
              <option value="LINK">LINKEDIN</option>
              <option value="TWIT">TWITTER</option>
              <option value="YTUB">YOUTUBE</option>
              <option value="NONE">NONE</option>
            </select>
          </div>
          
          {data.socialMediaPlatform !== 'NONE' && data.socialMediaPlatform !== 'SONE' && data.socialMediaPlatform !== undefined && (
            <div className="field full" style={{ marginBottom: '15px' }}>
              <label style={{ fontWeight: 'bold' }}>Social Media Identifier</label><br/>
              <input type="text" name="socialMediaIdent" value={data.socialMediaIdent || ''} onChange={handleChange} maxLength="50" style={{ width: '100%', maxWidth: '300px', padding: '5px', marginTop: '5px' }} />
            </div>
          )}
        </fieldset>
      </div>
    </div>
  );
};

export default AddressPhoneInformation;