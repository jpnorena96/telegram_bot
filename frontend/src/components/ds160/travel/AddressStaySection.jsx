import React from 'react';

const AddressStaySection = ({ data, updateData }) => {
  const handleChange = (e) => {
    updateData({ [e.target.name]: e.target.value });
  };

  return (
    <div className="field-group full">
      <h4>Address Where You Will Stay in the U.S.</h4>
      <div className="field full">
        <label>Street Address (Line 1)</label><br/>
        <input type="text" name="usStreet1" value={data.usStreet1 || ''} onChange={handleChange} style={{ width: '100%', maxWidth: '400px' }} />
      </div>
      <div className="field full">
        <label>Street Address (Line 2) *Optional</label><br/>
        <input type="text" name="usStreet2" value={data.usStreet2 || ''} onChange={handleChange} style={{ width: '100%', maxWidth: '400px' }} />
      </div>
      <div className="field full">
        <label>City</label><br/>
        <input type="text" name="usCity" value={data.usCity || ''} onChange={handleChange} />
      </div>
      <div className="field full">
        <label>State</label><br/>
        <select name="usState" value={data.usState || ''} onChange={handleChange} style={{ width: '100%', maxWidth: '400px', padding: '5px' }}>
          <option value="">- Select one -</option>
          <option value="AL">ALABAMA</option>
          <option value="AK">ALASKA</option>
          <option value="AS">AMERICAN SAMOA</option>
          <option value="AZ">ARIZONA</option>
          <option value="AR">ARKANSAS</option>
          <option value="CA">CALIFORNIA</option>
          <option value="CO">COLORADO</option>
          <option value="CT">CONNECTICUT</option>
          <option value="DE">DELAWARE</option>
          <option value="DC">DISTRICT OF COLUMBIA</option>
          <option value="FL">FLORIDA</option>
          <option value="GA">GEORGIA</option>
          <option value="GU">GUAM</option>
          <option value="HI">HAWAII</option>
          <option value="ID">IDAHO</option>
          <option value="IL">ILLINOIS</option>
          <option value="IN">INDIANA</option>
          <option value="IA">IOWA</option>
          <option value="KS">KANSAS</option>
          <option value="KY">KENTUCKY</option>
          <option value="LA">LOUISIANA</option>
          <option value="ME">MAINE</option>
          <option value="MD">MARYLAND</option>
          <option value="MA">MASSACHUSETTS</option>
          <option value="MI">MICHIGAN</option>
          <option value="MN">MINNESOTA</option>
          <option value="MS">MISSISSIPPI</option>
          <option value="MO">MISSOURI</option>
          <option value="MT">MONTANA</option>
          <option value="NE">NEBRASKA</option>
          <option value="NV">NEVADA</option>
          <option value="NH">NEW HAMPSHIRE</option>
          <option value="NJ">NEW JERSEY</option>
          <option value="NM">NEW MEXICO</option>
          <option value="NY">NEW YORK</option>
          <option value="NC">NORTH CAROLINA</option>
          <option value="ND">NORTH DAKOTA</option>
          <option value="MP">NORTHERN MARIANA ISLANDS</option>
          <option value="OH">OHIO</option>
          <option value="OK">OKLAHOMA</option>
          <option value="OR">OREGON</option>
          <option value="PA">PENNSYLVANIA</option>
          <option value="PR">PUERTO RICO</option>
          <option value="RI">RHODE ISLAND</option>
          <option value="SC">SOUTH CAROLINA</option>
          <option value="SD">SOUTH DAKOTA</option>
          <option value="TN">TENNESSEE</option>
          <option value="TX">TEXAS</option>
          <option value="UT">UTAH</option>
          <option value="VT">VERMONT</option>
          <option value="VI">VIRGIN ISLANDS</option>
          <option value="VA">VIRGINIA</option>
          <option value="WA">WASHINGTON</option>
          <option value="WV">WEST VIRGINIA</option>
          <option value="WI">WISCONSIN</option>
          <option value="WY">WYOMING</option>
        </select>
      </div>
      <div className="field full">
        <label>ZIP Code (if known)</label><br/>
        <input type="text" name="usZip" value={data.usZip || ''} onChange={handleChange} />
      </div>
    </div>
  );
};

export default AddressStaySection;