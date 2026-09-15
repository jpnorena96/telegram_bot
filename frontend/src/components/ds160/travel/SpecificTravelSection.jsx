import React from 'react';

const SpecificTravelSection = ({ data, updateData }) => {
  const handleChange = (e) => {
    updateData({ [e.target.name]: e.target.value });
  };

  const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

  return (
    <div className="field-group full">
      <div className="q">
        <label>Have you made specific travel plans?</label>
      </div>
      <div className="a">
        <div className="radio-group">
          <label>
            <input 
              type="radio" 
              name="specificTravelPlans" 
              value="Y" 
              checked={data.specificTravelPlans === 'Y'} 
              onChange={handleChange} 
            /> Yes
          </label>
          <label>
            <input 
              type="radio" 
              name="specificTravelPlans" 
              value="N" 
              checked={data.specificTravelPlans === 'N'} 
              onChange={handleChange} 
            /> No
          </label>
        </div>
      </div>

      {data.specificTravelPlans === 'N' && (
        <div className="field-groups" style={{ marginTop: '15px' }}>
          <div className="field full">
            <label>Intended Date of Arrival</label>
            <div className="date-group" style={{ display: 'flex', gap: '5px' }}>
              <input type="text" name="arrivalDay" placeholder="Day" value={data.arrivalDay || ''} onChange={handleChange} maxLength="2" style={{ width: '50px' }} />
              <select name="arrivalMonth" value={data.arrivalMonth || ''} onChange={handleChange}>
                <option value="">Month</option>
                {months.map((m, i) => <option key={m} value={i+1}>{m}</option>)}
              </select>
              <input type="text" name="arrivalYear" placeholder="Year" value={data.arrivalYear || ''} onChange={handleChange} maxLength="4" style={{ width: '60px' }} />
            </div>
          </div>
          
          <div className="field full">
            <label>Intended Length of Stay in U.S.</label>
            <div style={{ display: 'flex', gap: '5px' }}>
              <input type="text" name="stayLength" value={data.stayLength || ''} onChange={handleChange} maxLength="3" style={{ width: '50px' }} />
              <select name="stayUnit" value={data.stayUnit || ''} onChange={handleChange}>
                <option value="">-Select One-</option>
                <option value="Y">Year(s)</option>
                <option value="M">Month(s)</option>
                <option value="W">Week(s)</option>
                <option value="D">Day(s)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {data.specificTravelPlans === 'Y' && (
        <div className="field-groups" style={{ marginTop: '15px' }}>
          <div className="field full">
            <label>Date of Arrival in U.S.</label>
            <div className="date-group" style={{ display: 'flex', gap: '5px' }}>
              <input type="text" name="specificArrivalDay" placeholder="Day" value={data.specificArrivalDay || ''} onChange={handleChange} maxLength="2" style={{ width: '50px' }} />
              <select name="specificArrivalMonth" value={data.specificArrivalMonth || ''} onChange={handleChange}>
                <option value="">Month</option>
                {months.map((m, i) => <option key={m} value={m}>{m}</option>)}
              </select>
              <input type="text" name="specificArrivalYear" placeholder="Year" value={data.specificArrivalYear || ''} onChange={handleChange} maxLength="4" style={{ width: '60px' }} />
            </div>
          </div>
          <div className="field full">
            <label>Arrival Flight (if known)</label><br/>
            <input type="text" name="arrivalFlight" value={data.arrivalFlight || ''} onChange={handleChange} />
          </div>
          <div className="field full">
            <label>Arrival City</label><br/>
            <input type="text" name="arrivalCity" value={data.arrivalCity || ''} onChange={handleChange} />
          </div>

          <div className="field full" style={{ marginTop: '15px' }}>
            <label>Date of Departure from U.S.</label>
            <div className="date-group" style={{ display: 'flex', gap: '5px' }}>
              <input type="text" name="specificDepDay" placeholder="Day" value={data.specificDepDay || ''} onChange={handleChange} maxLength="2" style={{ width: '50px' }} />
              <select name="specificDepMonth" value={data.specificDepMonth || ''} onChange={handleChange}>
                <option value="">Month</option>
                {months.map((m, i) => <option key={m} value={m}>{m}</option>)}
              </select>
              <input type="text" name="specificDepYear" placeholder="Year" value={data.specificDepYear || ''} onChange={handleChange} maxLength="4" style={{ width: '60px' }} />
            </div>
          </div>
          <div className="field full">
            <label>Departure Flight (if known)</label><br/>
            <input type="text" name="departureFlight" value={data.departureFlight || ''} onChange={handleChange} />
          </div>
          <div className="field full">
            <label>Departure City</label><br/>
            <input type="text" name="departureCity" value={data.departureCity || ''} onChange={handleChange} />
          </div>
          <div className="field full">
            <label>Provide the locations you plan to visit in the U.S.</label><br/>
            <input type="text" name="locationsToVisit" value={data.locationsToVisit || ''} onChange={handleChange} style={{ width: '100%', maxWidth: '400px' }} />
          </div>
        </div>
      )}
    </div>
  );
};

export default SpecificTravelSection;