import React from 'react';
import './ds160.css';

const TravelCompanions = ({ data, updateData }) => {
  const handleChange = (e) => {
    updateData({ [e.target.name]: e.target.value });
  };

  return (
    <div className="ds160-container" style={{ fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#333' }}>
      <div className="section-header">
        <h2>Travel Companions Information</h2>
        <p className="note">NOTE: Provide the following travel companion information.</p>
      </div>

      <div className="form-container">
        <fieldset>
          <div className="field-groups">
            <h3>Persons traveling with you</h3>
            <br />
            <div className="q">
              <label>Are there other persons traveling with you?</label>
            </div>
            <div className="a">
              <div className="radio-group">
                <label>
                  <input 
                    type="radio" 
                    name="otherPersonsTravelingWithYou" 
                    value="Y" 
                    checked={data.otherPersonsTravelingWithYou === 'Y'} 
                    onChange={handleChange} 
                  /> Yes
                </label>
                <label>
                  <input 
                    type="radio" 
                    name="otherPersonsTravelingWithYou" 
                    value="N" 
                    checked={data.otherPersonsTravelingWithYou === 'N'} 
                    onChange={handleChange} 
                  /> No
                </label>
              </div>
            </div>
          </div>

          <div className="help" style={{ marginTop: '15px', marginBottom: '15px' }}>
            <h4><span style={{ color: '#891300' }}>Help:</span> Traveling with Others</h4>
            <p>
              You should answer Yes to this question if you are traveling with family, as part of an organized tour, 
              or as part of a performing group or athletic team. You do not need to list individuals who are traveling 
              with you for the purposes of employment with the same employer.
            </p>
          </div>
        </fieldset>

        {data.otherPersonsTravelingWithYou === 'Y' && (
          <fieldset>
            <div className="hr"></div>
            <div className="field-groups">
              <div className="q">
                <label>Are you traveling as part of a group or organization?</label>
              </div>
              <div className="a">
                <div className="radio-group">
                  <label>
                    <input 
                      type="radio" 
                      name="groupTravel" 
                      value="Y" 
                      checked={data.groupTravel === 'Y'} 
                      onChange={handleChange} 
                    /> Yes
                  </label>
                  <label>
                    <input 
                      type="radio" 
                      name="groupTravel" 
                      value="N" 
                      checked={data.groupTravel === 'N'} 
                      onChange={handleChange} 
                    /> No
                  </label>
                </div>
              </div>
            </div>

            {data.groupTravel === 'Y' && (
              <div style={{ marginTop: '20px' }}>
                <h4>Enter the name of the group you are traveling with</h4>
                <div className="field-group callout" style={{ padding: '15px', background: '#f9f9f9', border: '1px solid #ccc' }}>
                  <div className="field full">
                    <label>Group Name</label>
                    <br />
                    <input 
                      type="text" 
                      name="groupName" 
                      value={data.groupName || ''} 
                      onChange={handleChange} 
                      style={{ width: '95%' }} 
                    />
                  </div>
                </div>
              </div>
            )}

            {data.groupTravel === 'N' && (
              <div style={{ marginTop: '20px' }}>
                <h4>Enter person(s) traveling with you</h4>
                <div className="field-group callout wadd" style={{ padding: '15px', background: '#f9f9f9', border: '1px solid #ccc' }}>
                  <div className="field full">
                    <label>Surnames of Person Traveling With You</label>
                    <br />
                    <input 
                      type="text" 
                      name="companionSurname" 
                      value={data.companionSurname || ''} 
                      onChange={handleChange} 
                      style={{ width: '95%' }} 
                    />
                  </div>
                  
                  <div className="field full" style={{ marginTop: '10px' }}>
                    <label>Given Names of Person Traveling With You</label>
                    <br />
                    <input 
                      type="text" 
                      name="companionGivenName" 
                      value={data.companionGivenName || ''} 
                      onChange={handleChange} 
                      style={{ width: '95%' }} 
                    />
                  </div>
                  
                  <div className="field full" style={{ marginTop: '10px' }}>
                    <label>Relationship with Person</label>
                    <br />
                    <select 
                      name="companionRelationship" 
                      value={data.companionRelationship || ''} 
                      onChange={handleChange} 
                    >
                      <option value="">- SELECT ONE -</option>
                      <option value="P">PARENT</option>
                      <option value="S">SPOUSE</option>
                      <option value="C">CHILD</option>
                      <option value="R">OTHER RELATIVE</option>
                      <option value="F">FRIEND</option>
                      <option value="B">BUSINESS ASSOCIATE</option>
                      <option value="O">OTHER</option>
                    </select>
                  </div>
                  
                  <div style={{ marginTop: '15px', textAlign: 'right' }}>
                    <a href="#" style={{ color: '#003366', textDecoration: 'none', marginRight: '15px' }}>+ Add Another</a>
                    <a href="#" style={{ color: '#003366', textDecoration: 'none' }}>- Remove</a>
                  </div>
                </div>
              </div>
            )}
          </fieldset>
        )}
      </div>
    </div>
  );
};

export default TravelCompanions;