import React from 'react';
import './ds160.css';

const PhotoUpload = ({ data, updateData }) => {
  return (
    <div className="ds160-container" style={{ fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#333' }}>
      <div className="section-header">
        <h2>PHOTO</h2>
      </div>

      <div className="form-container">
        
        <fieldset>
          <div style={{ lineHeight: '2.0', fontSize: '14px', marginBottom: '20px' }}>
            <span style={{ color: '#990000', fontSize: 'large', fontWeight: 'bold' }}>
              Starting November 1, 2016, eye glasses will no longer be allowed in new visa photos.
            </span>
            <br /><br />
            <span className="note">
              Click on the Upload Your Photo button below to access our photo submission system. Once there you will be given instructions on how to supply an approved photo for your Visa application. After you have selected the photo to upload and the system verifies the photo is acceptable, you will return to “Confirm Photo” to continue the application process.
            </span>
          </div>
        </fieldset>

        <hr />
        
        {/* We can provide a dummy upload button for visual replication */}
        <fieldset style={{ textAlign: 'center', marginTop: '20px' }}>
          <button type="button" disabled style={{ padding: '10px 20px', fontSize: '16px', backgroundColor: '#003366', color: 'white', border: 'none', borderRadius: '4px', cursor: 'not-allowed' }}>
            Upload Your Photo
          </button>
        </fieldset>

      </div>
    </div>
  );
};

export default PhotoUpload;
