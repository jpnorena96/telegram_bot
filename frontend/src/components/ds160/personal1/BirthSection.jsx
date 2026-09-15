import React from 'react';

const BirthSection = ({ data, updateData }) => {
  return (
    <div style={{ padding: '15px', marginBottom: '20px' }}>
      <h3 style={{ fontSize: '1.1rem', color: '#1E293B', marginBottom: '16px', fontWeight: 700, borderBottom: '1px solid #E2E8F0', paddingBottom: '8px' }}>
        Lugar y Fecha de Nacimiento
      </h3>
      
      <div style={{ marginBottom: '20px' }}>
        <label>Date of Birth (Fecha de Nacimiento)</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
          <div>
            <select 
              value={data?.dobDay || ''} 
              onChange={(e) => updateData({ dobDay: e.target.value })} 
            >
              <option value="">Día</option>
              {[...Array(31)].map((_, i) => <option key={i+1} value={i+1}>{(i+1).toString().padStart(2, '0')}</option>)}
            </select>
          </div>
          <div>
            <select 
              value={data?.dobMonth || ''} 
              onChange={(e) => updateData({ dobMonth: e.target.value })} 
            >
              <option value="">Mes</option>
              <option value="JAN">Ene (JAN)</option>
              <option value="FEB">Feb (FEB)</option>
              <option value="MAR">Mar (MAR)</option>
              <option value="APR">Abr (APR)</option>
              <option value="MAY">May (MAY)</option>
              <option value="JUN">Jun (JUN)</option>
              <option value="JUL">Jul (JUL)</option>
              <option value="AUG">Ago (AUG)</option>
              <option value="SEP">Sep (SEP)</option>
              <option value="OCT">Oct (OCT)</option>
              <option value="NOV">Nov (NOV)</option>
              <option value="DEC">Dic (DEC)</option>
            </select>
          </div>
          <div>
            <input 
              type="text" 
              maxLength="4" 
              placeholder="Año (YYYY)"
              value={data?.dobYear || ''} 
              onChange={(e) => updateData({ dobYear: e.target.value })} 
            />
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        <div>
          <label>City of Birth (Ciudad de Nacimiento)</label>
          <input 
            type="text" 
            maxLength="20" 
            value={data?.pobCity || ''} 
            onChange={(e) => updateData({ pobCity: e.target.value })} 
            placeholder="Ej. BOGOTA"
          />
        </div>

        <div>
          <label>State/Province (Estado/Provincia)</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input 
              type="text" 
              maxLength="20" 
              disabled={data?.pobStateNA} 
              value={data?.pobStateNA ? '' : (data?.pobState || '')} 
              onChange={(e) => updateData({ pobState: e.target.value })} 
              placeholder="Ej. CUNDINAMARCA"
            />
            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: data?.pobStateNA ? '#EFF6FF' : 'transparent', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s', width: 'fit-content' }} onClick={() => updateData({ pobStateNA: !data?.pobStateNA })}>
              <input 
                type="checkbox" 
                checked={data?.pobStateNA || false} 
                onChange={() => {}} // Handled by div click
                style={{ margin: 0, pointerEvents: 'none' }}
              />
              <span style={{ fontSize: '13px', fontWeight: 500, color: data?.pobStateNA ? '#1D4ED8' : '#64748B' }}>
                Does Not Apply (No Aplica)
              </span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <label>Country/Region of Birth (País de Nacimiento)</label>
        <select 
          value={data?.pobCountry || ''} 
          onChange={(e) => updateData({ pobCountry: e.target.value })} 
        >
          <option value="">- Seleccione -</option>
          <option value="MEX">MEXICO</option>
          <option value="COL">COLOMBIA</option>
          <option value="ARG">ARGENTINA</option>
          <option value="USA">UNITED STATES OF AMERICA</option>
          <option value="VEN">VENEZUELA</option>
          <option value="PER">PERU</option>
          <option value="CHL">CHILE</option>
          <option value="ECU">ECUADOR</option>
          <option value="ESP">SPAIN</option>
          <option value="OTHER">Otro (Seleccionar en sistema oficial)</option>
        </select>
      </div>
    </div>
  );
};

export default BirthSection;
