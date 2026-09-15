import React from 'react';
import { useParams } from 'react-router-dom';
import DS160Wizard from '../components/ds160/DS160Wizard';
import { Toaster } from 'react-hot-toast';

const ClientPortalPage = () => {
  const { id } = useParams();

  return (
    <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      <Toaster position="top-center" />
      <div style={{ padding: '20px', textAlign: 'center', backgroundColor: '#003366', color: 'white' }}>
        <h1 style={{ margin: 0, fontSize: '24px' }}>Formulario DS-160 Seguro</h1>
        <p style={{ margin: '5px 0 0 0', fontSize: '14px', opacity: 0.9 }}>
          Por favor complete todas las secciones con información verídica y precisa.
        </p>
      </div>
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <DS160Wizard isPublic={true} processId={id} />
      </div>
    </div>
  );
};

export default ClientPortalPage;
