import React from 'react';

const PurposeSection = ({ data, updateData }) => {
  const handleChange = (e) => {
    updateData({ [e.target.name]: e.target.value });
  };

  return (
    <div className="field-group full">
      <h4>Provide the following information:</h4>
      <div className="field full" style={{ paddingBottom: '0%' }}>
        <label>Purpose of Trip to the U.S.</label>
        <br />
        <select 
          name="purposeOfTrip" 
          value={data.purposeOfTrip || ''} 
          onChange={handleChange}
          style={{ width: '100%', maxWidth: '400px' }}
        >
          <option value="">PLEASE SELECT A VISA CLASS</option>
          <option value="A">FOREIGN GOVERNMENT OFFICIAL (A)</option>
          <option value="B">TEMP. BUSINESS OR PLEASURE VISITOR (B)</option>
          <option value="C">ALIEN IN TRANSIT (C)</option>
          <option value="CNMI">CNMI WORKER OR INVESTOR (CW/E2C)</option>
          <option value="D">CREWMEMBER (D)</option>
          <option value="E">TREATY TRADER OR INVESTOR (E)</option>
          <option value="F">ACADEMIC OR LANGUAGE STUDENT (F)</option>
          <option value="G">INTERNATIONAL ORGANIZATION REP./EMP. (G)</option>
          <option value="H">TEMPORARY WORKER (H)</option>
          <option value="I">FOREIGN MEDIA REPRESENTATIVE (I)</option>
          <option value="J">EXCHANGE VISITOR (J)</option>
          <option value="K">FIANCÉ(E) OR SPOUSE OF A U.S. CITIZEN (K)</option>
          <option value="L">INTRACOMPANY TRANSFEREE (L)</option>
          <option value="M">VOCATIONAL/NONACADEMIC STUDENT (M)</option>
          <option value="N">OTHER (N)</option>
          <option value="NATO">NATO STAFF (NATO)</option>
          <option value="O">ALIEN WITH EXTRAORDINARY ABILITY (O)</option>
          <option value="P">INTERNATIONALLY RECOGNIZED ALIEN (P)</option>
          <option value="Q">CULTURAL EXCHANGE VISITOR (Q)</option>
          <option value="R">RELIGIOUS WORKER (R)</option>
          <option value="S">INFORMANT OR WITNESS (S)</option>
          <option value="T">VICTIM OF TRAFFICKING (T)</option>
          <option value="TD/TN">NAFTA PROFESSIONAL (TD/TN)</option>
          <option value="U">VICTIM OF CRIMINAL ACTIVITY (U)</option>
          <option value="PAROLE-BEN">PAROLE BENEFICIARY (PARCIS)</option>
        </select>
      </div>

      {data.purposeOfTrip === 'B' && (
        <div className="field full" style={{ paddingBottom: '0%' }}>
          <label>Specify</label>
          <br />
          <select 
            name="specifyPurpose" 
            value={data.specifyPurpose || ''} 
            onChange={handleChange}
            style={{ width: '100%', maxWidth: '400px' }}
          >
            <option value="">PLEASE SELECT</option>
            <option value="B1-B2">BUSINESS OR TOURISM (TEMPORARY VISITOR) (B1/B2)</option>
            <option value="B1-CF">BUSINESS/CONFERENCE (B1)</option>
            <option value="B2-TM">TOURISM/MEDICAL TREATMENT (B2)</option>
            <option value="BC-C">BORDER CROSSING CARD (MEXICO ONLY) (BCC)</option>
          </select>
        </div>
      )}
    </div>
  );
};

export default PurposeSection;