import React from 'react';

const PayerSection = ({ data, updateData }) => {
  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    updateData({ [e.target.name]: value });
  };

  return (
    <div className="field-group full">
      <div className="field full">
        <label>Person/Entity Paying for Your Trip</label><br/>
        <select 
          name="whoIsPaying" 
          value={data.whoIsPaying || ''} 
          onChange={handleChange}
          style={{ width: '100%', maxWidth: '400px' }}
        >
          <option value="">-Select One-</option>
          <option value="S">Self</option>
          <option value="O">Other Person</option>
          <option value="P">Present Employer</option>
          <option value="U">Employer in the U.S.</option>
          <option value="C">Other Company/Organization</option>
        </select>
      </div>

      {data.whoIsPaying === 'O' && (
        <div style={{ marginTop: '15px' }}>
          <h4>Information about Person Paying for your Trip</h4>
          
          <div className="field-group callout" style={{ padding: '15px', background: '#f9f9f9', border: '1px solid #ccc' }}>
            <div className="field full">
              <label>Surnames of Person Paying for Trip</label><br/>
              <input type="text" name="payerSurname" value={data.payerSurname || ''} onChange={handleChange} style={{ width: '95%' }} />
            </div>
            
            <div className="field full" style={{ marginTop: '10px' }}>
              <label>Given Names of Person Paying for Trip</label><br/>
              <input type="text" name="payerGivenName" value={data.payerGivenName || ''} onChange={handleChange} style={{ width: '95%' }} />
            </div>
            
            <div className="field full" style={{ marginTop: '10px' }}>
              <label>Telephone Number</label><br/>
              <input type="text" name="payerPhone" value={data.payerPhone || ''} onChange={handleChange} style={{ width: '95%' }} />
            </div>
            
            <div className="field full" style={{ marginTop: '10px' }}>
              <label>Email Address</label><br/>
              <input 
                type="text" 
                name="payerEmail" 
                value={data.payerEmail || ''} 
                onChange={handleChange} 
                disabled={data.payerEmailNA}
                style={{ width: '60%', backgroundColor: data.payerEmailNA ? 'LightGrey' : 'White' }} 
              />
              <label style={{ marginLeft: '10px' }}>
                <input 
                  type="checkbox" 
                  name="payerEmailNA" 
                  checked={data.payerEmailNA || false} 
                  onChange={handleChange} 
                /> Does Not Apply
              </label>
            </div>
            
            <div className="field full" style={{ marginTop: '10px' }}>
              <label>Relationship to You</label><br/>
              <select name="payerRelationship" value={data.payerRelationship || ''} onChange={handleChange} style={{ width: '95%' }}>
                <option value="">- SELECT ONE -</option>
                <option value="C">CHILD</option>
                <option value="P">PARENT</option>
                <option value="S">SPOUSE</option>
                <option value="R">OTHER RELATIVE</option>
                <option value="F">FRIEND</option>
                <option value="O">OTHER</option>
              </select>
            </div>

            <div className="field full" style={{ marginTop: '15px' }}>
              <label>Is the address of the party paying for your trip the same as your Home or Mailing Address?</label>
              <div className="radio-group" style={{ marginTop: '5px' }}>
                <label>
                  <input type="radio" name="payerAddrSameAsInd" value="Y" checked={data.payerAddrSameAsInd === 'Y'} onChange={handleChange} /> Yes
                </label>
                <label style={{ marginLeft: '10px' }}>
                  <input type="radio" name="payerAddrSameAsInd" value="N" checked={data.payerAddrSameAsInd === 'N'} onChange={handleChange} /> No
                </label>
              </div>
            </div>
            
            {data.payerAddrSameAsInd === 'N' && (
              <div style={{ marginTop: '20px' }}>
                <h4>Address of Person Paying</h4>
                <div className="field full">
                  <label>Street Address (Line 1)</label><br/>
                  <input type="text" name="payerStreet1" value={data.payerStreet1 || ''} onChange={handleChange} style={{ width: '95%' }} />
                </div>
                
                <div className="field full" style={{ marginTop: '10px' }}>
                  <label>Street Address (Line 2) <span style={{ color: '#891300', fontStyle: 'italic' }}>*Optional</span></label><br/>
                  <input type="text" name="payerStreet2" value={data.payerStreet2 || ''} onChange={handleChange} style={{ width: '95%' }} />
                </div>
                
                <div className="field full" style={{ marginTop: '10px' }}>
                  <label>City</label><br/>
                  <input type="text" name="payerCity" value={data.payerCity || ''} onChange={handleChange} style={{ width: '95%' }} />
                </div>
                
                <div className="field full" style={{ marginTop: '10px' }}>
                  <label>State/Province</label><br/>
                  <input 
                    type="text" 
                    name="payerState" 
                    value={data.payerState || ''} 
                    onChange={handleChange} 
                    disabled={data.payerStateNA}
                    style={{ width: '55%', backgroundColor: data.payerStateNA ? 'LightGrey' : 'White' }} 
                  />
                  <label style={{ marginLeft: '10px' }}>
                    <input 
                      type="checkbox" 
                      name="payerStateNA" 
                      checked={data.payerStateNA || false} 
                      onChange={handleChange} 
                    /> Does Not Apply
                  </label>
                </div>
                
                <div className="field full" style={{ marginTop: '10px' }}>
                  <label>Postal Zone/ZIP Code</label><br/>
                  <input 
                    type="text" 
                    name="payerZIP" 
                    value={data.payerZIP || ''} 
                    onChange={handleChange} 
                    disabled={data.payerZIPNA}
                    style={{ width: '45%', backgroundColor: data.payerZIPNA ? 'LightGrey' : 'White' }} 
                  />
                  <label style={{ marginLeft: '10px' }}>
                    <input 
                      type="checkbox" 
                      name="payerZIPNA" 
                      checked={data.payerZIPNA || false} 
                      onChange={handleChange} 
                    /> Does Not Apply
                  </label>
                </div>
                
                <div className="field full" style={{ marginTop: '10px' }}>
                  <label>Country/Region</label><br/>
                  <select name="payerCountry" value={data.payerCountry || ''} onChange={handleChange} style={{ width: '95%' }}>
                    <option value="">- Select One -</option>
                    <option value="COL">COLOMBIA</option>
                    <option value="USA">UNITED STATES OF AMERICA</option>
                    <option value="MEX">MEXICO</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {(data.whoIsPaying === 'P' || data.whoIsPaying === 'U' || data.whoIsPaying === 'C') && (
        <div style={{ marginTop: '15px' }}>
          <h4>Information about Company/Organization Paying for your Trip</h4>
          <div className="field full">
            <label>Name of Company/Organization</label><br/>
            <input type="text" name="payerOrgName" value={data.payerOrgName || ''} onChange={handleChange} />
          </div>
          <div className="field full">
            <label>Telephone Number</label><br/>
            <input type="text" name="payerOrgPhone" value={data.payerOrgPhone || ''} onChange={handleChange} />
          </div>
          <div className="field full">
            <label>Relationship to You</label><br/>
            <input type="text" name="payerOrgRelationship" value={data.payerOrgRelationship || ''} onChange={handleChange} />
          </div>
        </div>
      )}
    </div>
  );
};

export default PayerSection;