import React, { useState } from 'react';
import './PoseLibrary.css';

export interface CharacterPose {
  id: string;
  name: string;
  description: string;
  preview: string;
  category: 'standing' | 'action' | 'sitting' | 'expression';
}

export const CHARACTER_POSES: CharacterPose[] = [
  {
    id: 'confident_stand',
    name: 'Confident Stand',
    description: 'Standing with hands on hips, confident pose',
    preview: '🧍‍♀️',
    category: 'standing'
  },
  {
    id: 'energetic_jump',
    name: 'Energetic Jump',
    description: 'Mid-jump with arms raised, full of energy',
    preview: '🤸‍♀️',
    category: 'action'
  },
  {
    id: 'relaxed_sitting',
    name: 'Relaxed Sitting',
    description: 'Sitting casually with a relaxed posture',
    preview: '🪑',
    category: 'sitting'
  },
  {
    id: 'happy_smile',
    name: 'Happy Smile',
    description: 'Bright, genuine smile with sparkling eyes',
    preview: '😊',
    category: 'expression'
  },
  {
    id: 'surprised_gasp',
    name: 'Surprised Gasp',
    description: 'Wide eyes and open mouth, surprised expression',
    preview: '😲',
    category: 'expression'
  },
  {
    id: 'mischievous_smirk',
    name: 'Mischievous Smirk',
    description: 'Slight smirk with a playful glint in the eyes',
    preview: '😏',
    category: 'expression'
  },
  {
    id: 'determined_fist',
    name: 'Determined Fist',
    description: 'Clenched fist raised, showing determination',
    preview: '✊',
    category: 'action'
  },
  {
    id: 'peaceful_meditation',
    name: 'Peaceful Meditation',
    description: 'Cross-legged sitting in peaceful meditation',
    preview: '🧘‍♀️',
    category: 'sitting'
  }
];

interface PoseLibraryProps {
  selectedPose: CharacterPose;
  onPoseSelect: (pose: CharacterPose) => void;
  onClose: () => void;
}

const PoseLibrary: React.FC<PoseLibraryProps> = ({
  selectedPose,
  onPoseSelect,
  onClose
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', name: 'All Poses', icon: '🎭' },
    { id: 'standing', name: 'Standing', icon: '🧍‍♀️' },
    { id: 'action', name: 'Action', icon: '🤸‍♀️' },
    { id: 'sitting', name: 'Sitting', icon: '🪑' },
    { id: 'expression', name: 'Expression', icon: '😊' }
  ];

  const filteredPoses = selectedCategory === 'all'
    ? CHARACTER_POSES
    : CHARACTER_POSES.filter(pose => pose.category === selectedCategory);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'standing': return '🧍‍♀️';
      case 'action': return '🤸‍♀️';
      case 'sitting': return '🪑';
      case 'expression': return '😊';
      default: return '🎭';
    }
  };

  return (
    <div className="pose-library-modal">
      <div className="pose-library-content">
        <div className="pose-library-header">
          <h3>🎭 Pose Library</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="category-tabs">
          {categories.map(category => (
            <button
              key={category.id}
              className={`category-tab ${selectedCategory === category.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category.id)}
            >
              <span className="category-icon">{category.icon}</span>
              <span className="category-name">{category.name}</span>
            </button>
          ))}
        </div>

        <div className="poses-grid">
          {filteredPoses.map(pose => (
            <div
              key={pose.id}
              className={`pose-card ${selectedPose.id === pose.id ? 'selected' : ''}`}
              onClick={() => onPoseSelect(pose)}
            >
              <div className="pose-preview">
                <span className="pose-emoji">{pose.preview}</span>
              </div>
              
              <div className="pose-info">
                <h4 className="pose-name">{pose.name}</h4>
                <p className="pose-description">{pose.description}</p>
                <span className="pose-category">
                  {getCategoryIcon(pose.category)} {pose.category}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="pose-actions">
          <button
            onClick={() => onPoseSelect(selectedPose)}
            className="confirm-pose-btn"
          >
            ✅ Use Selected Pose
          </button>
        </div>
      </div>
    </div>
  );
};

export default PoseLibrary; 