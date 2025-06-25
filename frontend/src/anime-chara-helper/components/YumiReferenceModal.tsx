import React, { useState, useRef } from 'react';
import { IoClose, IoCloudUpload, IoImage, IoHeart, IoEye } from 'react-icons/io5';
import { YUMI_REFS, YUMI_CATEGORIES, REFERENCE_DISCLAIMER, type YumiReference } from '../../constants/yumiReferences';
import './YumiReferenceModal.css';

interface YumiReferenceModalProps {
  onClose: () => void;
  onSelect: (url: string) => void;
}

export const YumiReferenceModal: React.FC<YumiReferenceModalProps> = ({ onClose, onSelect }) => {
  const [showUpload, setShowUpload] = useState(false);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedReference, setSelectedReference] = useState<YumiReference | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB.');
      return;
    }
    
    setUploadFile(file);
    const url = URL.createObjectURL(file);
    setFilePreview(url);
  };

  const handleUploadSubmit = async () => {
    if (!uploadFile) return;
    
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('artwork', uploadFile);
      
      // Submit to backend API
      const response = await fetch('/api/art/upload', { 
        method: 'POST', 
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Assuming JWT auth
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        alert(`🎉 Thanks for sharing! Your artwork has been submitted for review.\n\n🎁 Reward: You'll receive 1000 timeshards once approved!\n💫 First contribution bonus: +500 extra timeshards!`);
      } else {
        throw new Error('Upload failed');
      }
      
      // Reset upload state
      setShowUpload(false);
      setFilePreview(null);
      setUploadFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again later.');
    }
  };

  const handleReferenceSelect = (reference: YumiReference) => {
    onSelect(reference.src);
    onClose();
  };

  const handleReferencePreview = (reference: YumiReference) => {
    setSelectedReference(reference);
  };

  const filteredReferences = selectedCategory === 'all' 
    ? YUMI_REFS 
    : YUMI_REFS.filter(ref => ref.tags.includes(selectedCategory));

  return (
    <div
      className="yumi-reference-modal-overlay"
      onClick={onClose}
    >
      <div
        className="yumi-reference-modal"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div className="header-content">
            <h2>🎨 Yumi Reference Library</h2>
            <p className="header-subtitle">
              AI-generated Yumi images for drawing reference and inspiration
            </p>
          </div>
          <button onClick={onClose} className="close-button">
            <IoClose size={24} />
          </button>
        </div>

        {/* Category Filter */}
        <div className="category-filter">
          {YUMI_CATEGORIES.map(category => (
            <button
              key={category.id}
              className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.label}
              <span className="count">({category.count})</span>
            </button>
          ))}
        </div>

        {/* Reference Grid */}
        <div className="reference-grid">
          {filteredReferences.map(reference => (
            <div key={reference.id} className="reference-item">
              <div className="reference-image-container">
                <img
                  src={reference.src}
                  alt={reference.title}
                  className="reference-image"
                  onError={(e) => {
                    // Fallback for missing images
                    (e.target as HTMLImageElement).src = '/placeholder-yumi.png';
                  }}
                />
                <div className="reference-overlay">
                  <button
                    className="overlay-btn preview-btn"
                    onClick={() => handleReferencePreview(reference)}
                    title="Preview"
                  >
                    <IoEye size={20} />
                  </button>
                  <button
                    className="overlay-btn select-btn"
                    onClick={() => handleReferenceSelect(reference)}
                    title="Use as Reference"
                  >
                    <IoImage size={20} />
                  </button>
                </div>
              </div>
              <div className="reference-info">
                <h4>{reference.title}</h4>
                <p>{reference.description}</p>
                <div className="reference-tags">
                  {reference.tags.map(tag => (
                    <span key={tag} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Share Your Art Section */}
        <div className="share-art-section">
          <div className="section-divider">
            <span>Share Your Art</span>
          </div>
          
          {!showUpload ? (
            <div className="share-invitation">
              <IoHeart className="heart-icon" size={32} />
              <h3>Love creating Yumi art?</h3>
              <p>We'd love to see your original artwork! Share your creations with our community and earn rewards.</p>
              
              <div className="reward-info">
                <div className="reward-item">
                  <span className="reward-icon">🎁</span>
                  <span className="reward-text"><strong>1000 timeshards</strong> for approved artwork</span>
                </div>
                <div className="reward-item">
                  <span className="reward-icon">💫</span>
                  <span className="reward-text"><strong>+500 bonus</strong> for your first contribution</span>
                </div>
                <div className="reward-item">
                  <span className="reward-icon">⭐</span>
                  <span className="reward-text"><strong>+250 bonus</strong> for exceptional quality</span>
                </div>
              </div>
              
              <button
                onClick={() => setShowUpload(true)}
                className="share-btn"
              >
                <IoCloudUpload size={20} />
                Share Your Original Art
              </button>
            </div>
          ) : (
            <div className="upload-section">
              <h3>Upload Your Artwork</h3>
              <p className="upload-description">
                Share your original Yumi-inspired artwork with our community. 
                By uploading, you agree to our terms and may allow us to feature your art.
                <br />
                <strong>🎁 Earn 1000+ timeshards for approved contributions!</strong>
              </p>
              
              {filePreview && (
                <div className="file-preview">
                  <img src={filePreview} alt="Upload preview" className="preview-image" />
                  <div className="preview-info">
                    <p><strong>{uploadFile?.name}</strong></p>
                    <p>Size: {uploadFile ? (uploadFile.size / 1024).toFixed(1) : 0} KB</p>
                  </div>
                </div>
              )}
              
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileChange}
                className="file-input"
              />
              
              <div className="upload-actions">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="select-file-btn"
                >
                  <IoImage size={20} />
                  {filePreview ? 'Change Image' : 'Select Image'}
                </button>
                
                {filePreview && (
                  <button
                    onClick={handleUploadSubmit}
                    className="upload-submit-btn"
                  >
                    <IoCloudUpload size={20} />
                    Upload & Share
                  </button>
                )}
                
                <button
                  onClick={() => {
                    setShowUpload(false);
                    setFilePreview(null);
                    setUploadFile(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  className="cancel-btn"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Legal Disclaimer */}
        <div className="legal-disclaimer">
          <small>{REFERENCE_DISCLAIMER}</small>
        </div>

        {/* Reference Preview Modal */}
        {selectedReference && (
          <div className="preview-modal-overlay" onClick={() => setSelectedReference(null)}>
            <div className="preview-modal" onClick={e => e.stopPropagation()}>
              <div className="preview-header">
                <h3>{selectedReference.title}</h3>
                <button onClick={() => setSelectedReference(null)} className="close-button">
                  <IoClose size={20} />
                </button>
              </div>
              <div className="preview-content">
                <img
                  src={selectedReference.src}
                  alt={selectedReference.title}
                  className="preview-full-image"
                />
                <div className="preview-details">
                  <p>{selectedReference.description}</p>
                  <div className="preview-tags">
                    {selectedReference.tags.map(tag => (
                      <span key={tag} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => handleReferenceSelect(selectedReference)}
                    className="use-reference-btn"
                  >
                    <IoImage size={20} />
                    Use as Reference
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 