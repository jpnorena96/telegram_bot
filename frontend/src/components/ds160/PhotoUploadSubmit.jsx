import React from 'react';
import './ds160.css';

const PhotoUploadSubmit = ({ data, updateData }) => {
  return (
    <div className="ds160-container" style={{ fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#333' }}>
      <div className="section-header">
        <h2>Upload Photo</h2>
      </div>

      <div className="form-container">
        
        <table style={{ width: '100%', marginBottom: '20px' }}>
          <tbody>
            <tr>
              <td style={{ verticalAlign: 'top', paddingRight: '20px' }}>
                <h3 style={{ color: '#003366', fontSize: '14px', borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>Prepare Photo for Submission</h3>
                <p>Please refer to the Department of State's <a href="http://travel.state.gov/content/visas/english/general/photos.html" target="_blank" rel="noreferrer" style={{ color: '#0066cc', textDecoration: 'none' }}>image requirements</a>.</p>
                <p>To assist in preparing your image, you may click on the icon to the right to use a Department of State photo cropping tool. You may use this tool to resize, rotate, and/or crop a photo on your computer to meet the Department of State's head-size and <a href="http://travel.state.gov/content/visas/english/general/photos/digital-image-requirements.html" target="_blank" rel="noreferrer" style={{ color: '#0066cc', textDecoration: 'none' }}>digital image submission requirements</a>.</p>
              </td>
              <td style={{ verticalAlign: 'top', textAlign: 'center', width: '200px' }}>
                <div style={{ padding: '10px', backgroundColor: '#f5f5f5', border: '1px solid #ddd' }}>
                  <p style={{ margin: '0 0 10px 0' }}>Photo Cropping Tool</p>
                  <a href="http://travel.state.gov/_res/flash/cropper/FIG_cropper.html" target="_blank" rel="noreferrer">
                    <button type="button" style={{ padding: '5px 10px', backgroundColor: '#0066cc', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>Start Photo Tool</button>
                  </a>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <h3 style={{ color: '#003366', fontSize: '14px', borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>Select Your Photo</h3>
        <p>Click the "Browse" button and choose a JPEG format image (i.e., .jpg file type) that is 240 Kb or less in file size.</p>

        <h3 style={{ color: '#003366', fontSize: '14px', borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>Photo Quality Standards</h3>
        <p>In order to ensure the highest quality photos will be used in the final printed travel document, the Department of State has created a guide for you to use when creating and uploading your photos <a href="http://travel.state.gov/content/visas/english/general/photos.html" target="_blank" rel="noreferrer" style={{ color: '#0066cc', textDecoration: 'none' }}>[see photo quality standards guide]</a>.</p>

        <fieldset style={{ backgroundColor: '#f9f9f9', padding: '15px', border: '1px solid #ddd', marginTop: '20px' }}>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Photo:</label>
            <input type="file" accept="image/jpeg" style={{ width: '250px' }} />
          </div>
          <p style={{ margin: '0' }}>
            <div style={{ width: '150px', height: '150px', backgroundColor: '#eee', border: '1px dashed #999', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
              No Photo Selected
            </div>
          </p>
        </fieldset>

        <fieldset style={{ textAlign: 'right', marginTop: '20px' }}>
          <button type="button" disabled style={{ padding: '8px 15px', fontSize: '14px', backgroundColor: '#ccc', color: '#666', border: '1px solid #999', borderRadius: '4px', cursor: 'not-allowed', marginRight: '10px' }}>
            Back: Cancel
          </button>
          <button type="button" disabled style={{ padding: '8px 15px', fontSize: '14px', backgroundColor: '#003366', color: 'white', border: 'none', borderRadius: '4px', cursor: 'not-allowed' }}>
            Next: Upload Selected Photo
          </button>
        </fieldset>

      </div>
    </div>
  );
};

export default PhotoUploadSubmit;
