import React from 'react';
import DS160Wizard from '../../components/ds160/DS160Wizard';

const DS160FormPage = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ marginBottom: '20px', fontSize: '24px', fontWeight: 'bold' }}>DS-160 Form Entry</h1>
      <p style={{ marginBottom: '20px', color: '#666' }}>
        This page exactly replicates the official CEAC form structure to capture user data securely before generating the JSON payload.
      </p>
      <DS160Wizard />
    </div>
  );
};

export default DS160FormPage;