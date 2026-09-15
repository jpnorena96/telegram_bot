import React from 'react';

const DemographicsSection = ({ data, updateData }) => {
  return (
    <div style={{ padding: '15px', marginBottom: '20px' }}>
      <h3 style={{ fontSize: '1.1rem', color: '#1E293B', marginBottom: '16px', fontWeight: 700, borderBottom: '1px solid #E2E8F0', paddingBottom: '8px' }}>
        Datos Demográficos
      </h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div>
          <label>Sex (Sexo)</label>
          <select 
            value={data?.gender || ''} 
            onChange={(e) => updateData({ gender: e.target.value })} 
          >
            <option value="">- Seleccione -</option>
            <option value="M">Masculino (MALE)</option>
            <option value="F">Femenino (FEMALE)</option>
          </select>
        </div>

        <div>
          <label>Marital Status (Estado Civil)</label>
          <select 
            value={data?.marital || ''} 
            onChange={(e) => updateData({ marital: e.target.value })} 
          >
            <option value="">- Seleccione -</option>
            <option value="M">Casado/a (MARRIED)</option>
            <option value="C">Unión Libre (COMMON LAW MARRIAGE)</option>
            <option value="P">Unión Civil (CIVIL UNION/DOMESTIC PARTNERSHIP)</option>
            <option value="S">Soltero/a (SINGLE)</option>
            <option value="W">Viudo/a (WIDOWED)</option>
            <option value="D">Divorciado/a (DIVORCED)</option>
            <option value="L">Separado/a Legalmente (LEGALLY SEPARATED)</option>
            <option value="O">Otro (OTHER)</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default DemographicsSection;
