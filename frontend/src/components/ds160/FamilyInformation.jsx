import React from 'react';
import './ds160.css';

const FamilyInformation = ({ data, updateData }) => {
  const handleChange = (e) => {
    updateData({ [e.target.name]: e.target.value });
  };

  const handleCheck = (e) => {
    updateData({ [e.target.name]: e.target.checked });
  };

  const months = [
    { val: 'JAN', label: 'JAN' }, { val: 'FEB', label: 'FEB' }, { val: 'MAR', label: 'MAR' },
    { val: 'APR', label: 'APR' }, { val: 'MAY', label: 'MAY' }, { val: 'JUN', label: 'JUN' },
    { val: 'JUL', label: 'JUL' }, { val: 'AUG', label: 'AUG' }, { val: 'SEP', label: 'SEP' },
    { val: 'OCT', label: 'OCT' }, { val: 'NOV', label: 'NOV' }, { val: 'DEC', label: 'DEC' }
  ];

  const days = Array.from({ length: 31 }, (_, i) => ({ val: String(i + 1).padStart(2, '0'), label: String(i + 1).padStart(2, '0') }));

  return (
    <div className="ds160-container" style={{ fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#333' }}>
      <div className="section-header">
        <h2>Family Information: Relatives</h2>
        <p className="note">NOTE: Please provide the following information concerning your biological parents. If you are adopted, please provide the following information on your adoptive parents.</p>
      </div>

      <div className="form-container">
        
        {/* FATHER'S INFO */}
        <fieldset>
          <h3>Father's Full Name and Date of Birth</h3>
          
          <div className="field full" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
            <div>
              <label style={{ fontWeight: 'bold' }}>Surnames</label><br/>
              <input type="text" name="fatherSurname" value={data.fatherSurname || ''} onChange={handleChange} maxLength="33" disabled={data.fatherSurnameNA} style={{ padding: '5px', width: '200px', backgroundColor: data.fatherSurnameNA ? '#eee' : 'white' }} />
              <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>(e.g., Hernandez Garcia)</div>
            </div>
            <div>
              <label style={{ fontWeight: 'bold' }}>Given Names</label><br/>
              <input type="text" name="fatherGivenName" value={data.fatherGivenName || ''} onChange={handleChange} maxLength="33" disabled={data.fatherGivenNameNA} style={{ padding: '5px', width: '200px', backgroundColor: data.fatherGivenNameNA ? '#eee' : 'white' }} />
              <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>(e.g., Juan Miguel)</div>
            </div>
            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <input type="checkbox" name="fatherSurnameNA" checked={data.fatherSurnameNA || false} onChange={handleCheck} id="fatherSurnameNA" />
                <label htmlFor="fatherSurnameNA" style={{ marginLeft: '5px' }}>Do Not Know Surname</label>
              </div>
              <div>
                <input type="checkbox" name="fatherGivenNameNA" checked={data.fatherGivenNameNA || false} onChange={handleCheck} id="fatherGivenNameNA" />
                <label htmlFor="fatherGivenNameNA" style={{ marginLeft: '5px' }}>Do Not Know Given Name</label>
              </div>
            </div>
          </div>

          <div className="field full" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
            <div>
              <label style={{ fontWeight: 'bold' }}>Date of Birth</label><br/>
              <div style={{ display: 'flex', gap: '5px' }}>
                <select name="fatherDOBDay" value={data.fatherDOBDay || ''} onChange={handleChange} disabled={data.fatherDOBNA} style={{ padding: '5px', width: '60px', backgroundColor: data.fatherDOBNA ? '#eee' : 'white' }}>
                  <option value=""></option>
                  {days.map(d => <option key={d.val} value={d.val}>{d.label}</option>)}
                </select>
                <select name="fatherDOBMonth" value={data.fatherDOBMonth || ''} onChange={handleChange} disabled={data.fatherDOBNA} style={{ padding: '5px', width: '70px', backgroundColor: data.fatherDOBNA ? '#eee' : 'white' }}>
                  <option value=""></option>
                  {months.map(m => <option key={m.val} value={m.val}>{m.label}</option>)}
                </select>
                <input type="text" name="fatherDOBYear" value={data.fatherDOBYear || ''} onChange={handleChange} disabled={data.fatherDOBNA} maxLength="4" placeholder="YYYY" style={{ padding: '5px', width: '60px', backgroundColor: data.fatherDOBNA ? '#eee' : 'white' }} />
              </div>
              <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>(Format: DD-MMM-YYYY)</div>
            </div>
            <div style={{ marginTop: '5px' }}>
              <input type="checkbox" name="fatherDOBNA" checked={data.fatherDOBNA || false} onChange={handleCheck} id="fatherDOBNA" />
              <label htmlFor="fatherDOBNA" style={{ marginLeft: '5px' }}>Do Not Know</label>
            </div>
          </div>

          <div className="field full" style={{ marginBottom: '15px' }}>
            <label style={{ fontWeight: 'bold' }}>Is your father in the U.S.?</label><br/>
            <div style={{ display: 'flex', gap: '15px', marginTop: '5px' }}>
              <label>
                <input type="radio" name="fatherInUS" value="Y" checked={data.fatherInUS === 'Y'} onChange={handleChange} /> Yes
              </label>
              <label>
                <input type="radio" name="fatherInUS" value="N" checked={data.fatherInUS === 'N'} onChange={handleChange} /> No
              </label>
            </div>
          </div>
        </fieldset>

        <hr />

        {/* MOTHER'S INFO */}
        <fieldset>
          <h3>Mother's Full Name and Date of Birth</h3>
          
          <div className="field full" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
            <div>
              <label style={{ fontWeight: 'bold' }}>Surnames</label><br/>
              <input type="text" name="motherSurname" value={data.motherSurname || ''} onChange={handleChange} maxLength="33" disabled={data.motherSurnameNA} style={{ padding: '5px', width: '200px', backgroundColor: data.motherSurnameNA ? '#eee' : 'white' }} />
              <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>(e.g., Hernandez Garcia)</div>
            </div>
            <div>
              <label style={{ fontWeight: 'bold' }}>Given Names</label><br/>
              <input type="text" name="motherGivenName" value={data.motherGivenName || ''} onChange={handleChange} maxLength="33" disabled={data.motherGivenNameNA} style={{ padding: '5px', width: '200px', backgroundColor: data.motherGivenNameNA ? '#eee' : 'white' }} />
              <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>(e.g., Juanita Miguel)</div>
            </div>
            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <input type="checkbox" name="motherSurnameNA" checked={data.motherSurnameNA || false} onChange={handleCheck} id="motherSurnameNA" />
                <label htmlFor="motherSurnameNA" style={{ marginLeft: '5px' }}>Do Not Know Surname</label>
              </div>
              <div>
                <input type="checkbox" name="motherGivenNameNA" checked={data.motherGivenNameNA || false} onChange={handleCheck} id="motherGivenNameNA" />
                <label htmlFor="motherGivenNameNA" style={{ marginLeft: '5px' }}>Do Not Know Given Name</label>
              </div>
            </div>
          </div>

          <div className="field full" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
            <div>
              <label style={{ fontWeight: 'bold' }}>Date of Birth</label><br/>
              <div style={{ display: 'flex', gap: '5px' }}>
                <select name="motherDOBDay" value={data.motherDOBDay || ''} onChange={handleChange} disabled={data.motherDOBNA} style={{ padding: '5px', width: '60px', backgroundColor: data.motherDOBNA ? '#eee' : 'white' }}>
                  <option value=""></option>
                  {days.map(d => <option key={d.val} value={d.val}>{d.label}</option>)}
                </select>
                <select name="motherDOBMonth" value={data.motherDOBMonth || ''} onChange={handleChange} disabled={data.motherDOBNA} style={{ padding: '5px', width: '70px', backgroundColor: data.motherDOBNA ? '#eee' : 'white' }}>
                  <option value=""></option>
                  {months.map(m => <option key={m.val} value={m.val}>{m.label}</option>)}
                </select>
                <input type="text" name="motherDOBYear" value={data.motherDOBYear || ''} onChange={handleChange} disabled={data.motherDOBNA} maxLength="4" placeholder="YYYY" style={{ padding: '5px', width: '60px', backgroundColor: data.motherDOBNA ? '#eee' : 'white' }} />
              </div>
              <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>(Format: DD-MMM-YYYY)</div>
            </div>
            <div style={{ marginTop: '5px' }}>
              <input type="checkbox" name="motherDOBNA" checked={data.motherDOBNA || false} onChange={handleCheck} id="motherDOBNA" />
              <label htmlFor="motherDOBNA" style={{ marginLeft: '5px' }}>Do Not Know</label>
            </div>
          </div>

          <div className="field full" style={{ marginBottom: '15px' }}>
            <label style={{ fontWeight: 'bold' }}>Is your mother in the U.S.?</label><br/>
            <div style={{ display: 'flex', gap: '15px', marginTop: '5px' }}>
              <label>
                <input type="radio" name="motherInUS" value="Y" checked={data.motherInUS === 'Y'} onChange={handleChange} /> Yes
              </label>
              <label>
                <input type="radio" name="motherInUS" value="N" checked={data.motherInUS === 'N'} onChange={handleChange} /> No
              </label>
            </div>
          </div>
        </fieldset>

        <hr />

        {/* IMMEDIATE RELATIVES */}
        <fieldset>
          <div className="field full" style={{ marginBottom: '15px' }}>
            <label style={{ fontWeight: 'bold' }}>Do you have any immediate relatives, not including parents, in the United States?</label><br/>
            <div style={{ display: 'flex', gap: '15px', marginTop: '5px' }}>
              <label>
                <input type="radio" name="immediateRelatives" value="Y" checked={data.immediateRelatives === 'Y'} onChange={handleChange} /> Yes
              </label>
              <label>
                <input type="radio" name="immediateRelatives" value="N" checked={data.immediateRelatives === 'N'} onChange={handleChange} /> No
              </label>
            </div>
          </div>
          
          <div className="field full" style={{ marginBottom: '15px' }}>
            <label style={{ fontWeight: 'bold' }}>Do you have any other relatives in the United States?</label><br/>
            <div style={{ display: 'flex', gap: '15px', marginTop: '5px' }}>
              <label>
                <input type="radio" name="otherRelatives" value="Y" checked={data.otherRelatives === 'Y'} onChange={handleChange} /> Yes
              </label>
              <label>
                <input type="radio" name="otherRelatives" value="N" checked={data.otherRelatives === 'N'} onChange={handleChange} /> No
              </label>
            </div>
          </div>
        </fieldset>

      </div>
    </div>
  );
};

export default FamilyInformation;
