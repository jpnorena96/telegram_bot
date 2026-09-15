import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DS160Wizard from '../../components/ds160/DS160Wizard';
import { ArrowLeft } from 'lucide-react';

const DS160FormPage = () => {
  const { applicantId } = useParams();
  const navigate = useNavigate();
  return (
    <div style={{ padding: '20px' }}>
      <button onClick={() => navigate(-1)} style={{ marginBottom: '20px', padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #ccc', borderRadius: '4px', background: '#fff' }}>
        <ArrowLeft size={16} /> Volver
      </button>
      <h1 style={{ marginBottom: '20px', fontSize: '24px', fontWeight: 'bold' }}>DS-160 Form Entry</h1>
      <p style={{ marginBottom: '20px', color: '#666' }}>
        This page exactly replicates the official CEAC form structure to capture user data securely before generating the JSON payload.
      </p>
      <DS160Wizard applicantId={applicantId} />
    </div>
  );
};

export default DS160FormPage;