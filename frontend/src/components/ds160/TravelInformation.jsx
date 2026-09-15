import React from 'react';
import './ds160.css';
import PurposeSection from './travel/PurposeSection';
import SpecificTravelSection from './travel/SpecificTravelSection';
import AddressStaySection from './travel/AddressStaySection';
import PayerSection from './travel/PayerSection';

const TravelInformation = ({ data, updateData }) => {
  return (
    <div className="ds160-container" style={{ fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#333' }}>
      <div className="section-header">
        <h2>Travel Information</h2>
        <p className="note">NOTE: Provide the following information concerning your travel plans.</p>
      </div>
      
      <div className="form-container">
        <fieldset>
          <PurposeSection data={data} updateData={updateData} />
          <hr />
          <SpecificTravelSection data={data} updateData={updateData} />
          <hr />
          <AddressStaySection data={data} updateData={updateData} />
        </fieldset>
        
        <hr />
        <fieldset>
          <PayerSection data={data} updateData={updateData} />
        </fieldset>
      </div>
    </div>
  );
};

export default TravelInformation;