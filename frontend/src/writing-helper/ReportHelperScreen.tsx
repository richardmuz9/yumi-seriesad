import React, { useState, useRef, useEffect } from 'react';
import { 
  IoArrowBack, 
  IoMenu, 
  IoClose, 
  IoSwapHorizontal,
  IoSettings,
  IoCloudUpload,
  IoImage,
  IoColorPalette
} from 'react-icons/io5';
import AIAssistant from '../components/AIAssistant';
import { EquationBuilder } from './components/EquationBuilder';
import { ChartGenerator } from './components/ChartGenerator';

// Creative Control System
import { CreativeControlPanel } from '../shared/components/CreativeControlPanel';
import { IterativeFeedbackPanel } from '../shared/components/IterativeFeedbackPanel';
import { CreativeControlSettings, CreativeSession, CreativeVersion, CreativeFeedback } from '../shared/types/creativeModes';
import { smartPromptEngine, createCreativeSession, updateUserHistory } from '../shared/services/smartPromptEngine';
import { getAvailablePersonalities } from '../shared/services/yumiPersonalityService';

interface ReportHelperScreenProps {
  content: string;
  onContentChange: (content: string) => void;
  onBack: () => void;
}

type SidebarPosition = 'left' | 'right';

const ReportHelperScreen: React.FC<ReportHelperScreenProps> = ({
  content,
  onContentChange,
  onBack
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarPosition, setSidebarPosition] = useState<SidebarPosition>('left');
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showAI, setShowAI] = useState(false);
  const [showCustomization, setShowCustomization] = useState(false);
  const [backgroundSettings, setBackgroundSettings] = useState({
    type: 'solid' as 'solid' | 'gradient' | 'image',
    color: '#1e293b',
    gradient: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
    image: '',
    opacity: 0.95
  });
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Creative Control System state
  const [creativeSession, setCreativeSession] = useState<CreativeSession>(
    createCreativeSession('report', {
      level: 'balanced',
      yumiPersonality: 'teacher',
      allowSuggestions: true,
      memoryNudges: true,
      iterativeMode: true
    })
  );
  const [showIterativeFeedback, setShowIterativeFeedback] = useState(false);
  const [currentVersions, setCurrentVersions] = useState<CreativeVersion[]>([]);
  const [availablePersonalities] = useState<string[]>(getAvailablePersonalities());

  // Sidebar dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (sidebarRef.current) {
      setIsDragging(true);
      const rect = sidebarRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && sidebarRef.current) {
      const newX = e.clientX - dragOffset.x;
      const screenWidth = window.innerWidth;
      
      // Switch sides based on position
      if (newX < screenWidth / 2 && sidebarPosition === 'right') {
        setSidebarPosition('left');
      } else if (newX > screenWidth / 2 && sidebarPosition === 'left') {
        setSidebarPosition('right');
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const togglePosition = () => {
    setSidebarPosition(prev => prev === 'left' ? 'right' : 'left');
  };

  const handleToolClick = (tool: string) => {
    setActiveTool(activeTool === tool ? null : tool);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
    
    // Handle background image upload
    if (files[0] && backgroundSettings.type === 'image') {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBackgroundSettings(prev => ({
          ...prev,
          image: reader.result as string
        }));
      };
      reader.readAsDataURL(files[0]);
    }
  };

  // Creative Control System handlers
  const handleCreativeSettingsChange = (settings: CreativeControlSettings) => {
    const previousSettings = creativeSession.controlSettings;
    
    setCreativeSession(prev => ({
      ...prev,
      controlSettings: settings
    }));
    
    // Update user history if personality changed
    if (settings.yumiPersonality !== previousSettings.yumiPersonality) {
      setCreativeSession(prev => updateUserHistory(prev, {
        lastUsedPersonality: settings.yumiPersonality
      }));
    }
  };

  const handleVersionSelect = (versionId: string) => {
    const version = currentVersions.find(v => v.id === versionId);
    if (version && typeof version.content === 'string') {
      onContentChange(version.content);
    }
  };

  const handleRequestRefinement = (feedback: CreativeFeedback) => {
    if (creativeSession.controlSettings.level === 'balanced' || creativeSession.controlSettings.allowSuggestions) {
      // Generate enhanced prompt with personality influence
      const enhancedPrompt = smartPromptEngine.generateBasePrompt(
        `${content}\n\nRefinement request: ${feedback.question}`,
        creativeSession.controlSettings
      );
      
      // Apply refinement based on feedback type
      if (feedback.type === 'detail') {
        setShowAI(true); // Show AI assistant for detailed analysis
      }

      // Update session context
      setCreativeSession(prev => ({
        ...prev,
        currentContext: { feedback, originalContent: content }
      }));
    }
  };

  const generateReportVersions = () => {
    if (creativeSession.controlSettings.iterativeMode && content.trim()) {
      const versions: CreativeVersion[] = [
        {
          id: `version_${Date.now()}_main`,
          type: 'main',
          content: content,
          metadata: {
            aiConfidence: 0.9,
            refinementsSuggested: ['Add citations', 'Include data analysis', 'Improve structure'],
            personalityInfluence: [creativeSession.controlSettings.yumiPersonality]
          }
        }
      ];

      // Generate academic-style alternative
      if (creativeSession.controlSettings.allowSuggestions) {
        versions.push({
          id: `version_${Date.now()}_academic`,
          type: 'alternative',
          content: content + '\n\n[Academic enhanced version with formal language and structured analysis would appear here]',
          metadata: {
            aiConfidence: 0.8,
            refinementsSuggested: ['Academic formatting', 'Peer review ready'],
            personalityInfluence: [creativeSession.controlSettings.yumiPersonality]
          }
        });
      }

      setCurrentVersions(versions);
      setShowIterativeFeedback(true);
    }
  };

  const getBackgroundStyle = () => {
    switch (backgroundSettings.type) {
      case 'solid':
        return { backgroundColor: backgroundSettings.color };
      case 'gradient':
        return { background: backgroundSettings.gradient };
      case 'image':
        return {
          backgroundImage: backgroundSettings.image ? `url(${backgroundSettings.image})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        };
      default:
        return {};
    }
  };

  const reportTools = [
    { id: 'scientific-search', icon: '🔬', label: 'Scientific Search', category: 'research' },
    { id: 'nature-physics', icon: '🌿', label: 'Nature/Physics DB', category: 'research' },
    { id: 'latex-editor', icon: '📄', label: 'LaTeX Editor', category: 'editing' },
    { id: 'equation-builder', icon: '∑', label: 'Equation Builder', category: 'editing' },
    { id: 'generate-versions', icon: '✨', label: 'Generate Versions', category: 'editing' },
    { id: 'plagiarism-check', icon: '🛡️', label: 'Plagiarism Check', category: 'analysis' },
    { id: 'citation-manager', icon: '📚', label: 'Citation Manager', category: 'analysis' },
    { id: 'chart-generator', icon: '📊', label: 'Chart Generator', category: 'export' },
    { id: 'pdf-export', icon: '📋', label: 'PDF Export', category: 'export' },
    { id: 'upload', icon: '📤', label: 'Upload Files', category: 'tools' }
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'research': return '#3b82f6';
      case 'editing': return '#f59e0b';
      case 'analysis': return '#ef4444';
      case 'export': return '#10b981';
      case 'tools': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  const renderToolPanel = () => {
    if (!activeTool) return null;

    const tool = reportTools.find(t => t.id === activeTool);
    if (!tool) return null;

    return (
      <div className="tool-panel">
        <h3>{tool.icon} {tool.label}</h3>
        
        {activeTool === 'upload' && (
          <div className="upload-panel">
            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept="image/*,text/*,.pdf,.doc,.docx,.csv,.xlsx"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
            <button 
              className="upload-btn"
              onClick={() => fileInputRef.current?.click()}
            >
              <IoCloudUpload size={20} />
              Upload Research Files
            </button>
            {uploadedFiles.length > 0 && (
              <div className="uploaded-files">
                <h4>Uploaded Files:</h4>
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="file-item">
                    <span>{file.name}</span>
                    <small>({(file.size / 1024).toFixed(1)} KB)</small>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {activeTool === 'scientific-search' && (
          <div className="scientific-search">
            <input type="text" placeholder="Search scientific papers..." />
            <div className="database-filters">
              <label><input type="checkbox" /> PubMed</label>
              <label><input type="checkbox" /> IEEE</label>
              <label><input type="checkbox" /> Nature</label>
              <label><input type="checkbox" /> Science</label>
            </div>
            <button className="search-btn" onClick={() => window.open('https://pubmed.ncbi.nlm.nih.gov/', '_blank')}>🔍 Search Papers</button>
          </div>
        )}

        {activeTool === 'nature-physics' && (
          <div className="nature-physics">
            <div className="database-options">
              <button onClick={() => window.open('https://www.nature.com/', '_blank')}>🌿 Nature Database</button>
              <button onClick={() => window.open('https://journals.aps.org/', '_blank')}>⚛️ Physics Review</button>
              <button onClick={() => window.open('https://www.cas.org/', '_blank')}>🧪 Chemical Abstracts</button>
              <button onClick={() => window.open('https://www.sciencedirect.com/', '_blank')}>🔬 Science Direct</button>
            </div>
          </div>
        )}

        {activeTool === 'latex-editor' && (
          <div className="latex-editor-panel">
            <textarea placeholder="Enter LaTeX code here..." />
            <div className="latex-templates">
              <button>📄 Article Template</button>
              <button>📊 Report Template</button>
              <button>📚 Thesis Template</button>
              <button>📑 Paper Template</button>
            </div>
            <div className="copy-helper">
              <button 
                onClick={() => navigator.clipboard.writeText(content)}
                className="copy-btn"
              >
                📋 Copy LaTeX
              </button>
            </div>
          </div>
        )}

        {activeTool === 'equation-builder' && (
          <div className="equation-panel">
            <EquationBuilder />
          </div>
        )}

        {activeTool === 'generate-versions' && (
          <div className="generate-versions-panel">
            <h4>✨ Academic Report Versions</h4>
            <p>Generate multiple versions of your report with different academic styles and analysis depths!</p>
            
            <div className="version-controls">
              <div className="control-info">
                <strong>Current Mode:</strong> {creativeSession.controlSettings.level}
                <br />
                <strong>Academic Guide:</strong> {creativeSession.controlSettings.yumiPersonality}
              </div>
              
              <button 
                className="generate-btn primary"
                onClick={generateReportVersions}
                disabled={!content.trim()}
              >
                ✨ Generate Academic Versions
              </button>
              
              <div className="academic-variations">
                <h5>Academic Enhancements:</h5>
                <button>📚 Literature Review</button>
                <button>📊 Data Analysis</button>
                <button>🔬 Methodology</button>
                <button>📋 Executive Summary</button>
              </div>
            </div>
          </div>
        )}

        {activeTool === 'plagiarism-check' && (
          <div className="plagiarism-check">
            <div className="check-options">
              <button onClick={() => window.open('https://www.grammarly.com/plagiarism-checker', '_blank')}>🔍 Quick Check</button>
              <button>📊 Detailed Report</button>
              <button>📚 Citation Check</button>
              <button>🌐 Web Search</button>
            </div>
            <div className="similarity-threshold">
              <label>Similarity Threshold: <input type="range" min="0" max="100" /></label>
            </div>
            <div className="copy-helper">
              <textarea 
                value={content} 
                readOnly 
                placeholder="Your content will be analyzed for plagiarism"
                rows={3}
              />
              <button 
                onClick={() => navigator.clipboard.writeText(content)}
                className="copy-btn"
              >
                📋 Copy for Analysis
              </button>
            </div>
          </div>
        )}

        {activeTool === 'citation-manager' && (
          <div className="citation-manager">
            <div className="citation-styles">
              <button>📖 APA</button>
              <button>📚 MLA</button>
              <button>🔬 IEEE</button>
              <button>📄 Chicago</button>
            </div>
            <textarea placeholder="Add citation details..." />
          </div>
        )}

        {activeTool === 'chart-generator' && (
          <div className="chart-panel">
            <ChartGenerator />
          </div>
        )}

        {activeTool === 'pdf-export' && (
          <div className="pdf-export">
            <div className="export-options">
              <label><input type="checkbox" /> Include References</label>
              <label><input type="checkbox" /> Include Figures</label>
              <label><input type="checkbox" /> Include Appendices</label>
              <label><input type="checkbox" /> Academic Format</label>
            </div>
            <button className="export-btn">📋 Export as PDF</button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div 
      className="report-helper-screen"
      style={{
        ...getBackgroundStyle(),
        opacity: backgroundSettings.opacity
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Header */}
      <div className="screen-header">
        <button className="back-btn" onClick={onBack}>
          <IoArrowBack size={24} />
        </button>
        <h1>📊 Report Helper</h1>
        <button 
          className="customize-btn"
          onClick={() => setShowCustomization(!showCustomization)}
        >
          <IoSettings size={24} />
        </button>
      </div>

      {/* Customization Panel */}
      {showCustomization && (
        <div className="customization-panel">
          <h3>🎨 Customize Report Helper</h3>
          
          <div className="customization-section">
            <h4>Background</h4>
            <div className="bg-type-selector">
              <button 
                className={backgroundSettings.type === 'solid' ? 'active' : ''}
                onClick={() => setBackgroundSettings(prev => ({ ...prev, type: 'solid' }))}
              >
                <IoColorPalette size={16} />
                Solid
              </button>
              <button 
                className={backgroundSettings.type === 'gradient' ? 'active' : ''}
                onClick={() => setBackgroundSettings(prev => ({ ...prev, type: 'gradient' }))}
              >
                🌈 Gradient
              </button>
              <button
                className={backgroundSettings.type === 'image' ? 'active' : ''}
                onClick={() => setBackgroundSettings(prev => ({ ...prev, type: 'image' }))}
              >
                <IoImage size={16} />
                Image
              </button>
            </div>

            {backgroundSettings.type === 'solid' && (
              <div className="color-picker">
                <input 
                  type="color" 
                  value={backgroundSettings.color}
                  onChange={(e) => setBackgroundSettings(prev => ({ ...prev, color: e.target.value }))}
                />
              </div>
            )}

            {backgroundSettings.type === 'gradient' && (
              <div className="gradient-presets">
                <button onClick={() => setBackgroundSettings(prev => ({ ...prev, gradient: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' }))}>
                  Dark Slate
                </button>
                <button onClick={() => setBackgroundSettings(prev => ({ ...prev, gradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }))}>
                  Deep Blue
                </button>
                <button onClick={() => setBackgroundSettings(prev => ({ ...prev, gradient: 'linear-gradient(135deg, #374151 0%, #4b5563 100%)' }))}>
                  Professional Gray
                </button>
              </div>
            )}

            {backgroundSettings.type === 'image' && (
              <div className="image-upload">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="upload-btn"
                >
                  <IoCloudUpload size={16} />
                  Upload Background
                </button>
              </div>
            )}

            <div className="opacity-slider">
              <label>Opacity: {Math.round(backgroundSettings.opacity * 100)}%</label>
              <input 
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={backgroundSettings.opacity}
                onChange={(e) => setBackgroundSettings(prev => ({ ...prev, opacity: parseFloat(e.target.value) }))}
              />
            </div>
          </div>

          <div className="customization-section">
            <h4>Sidebar Settings</h4>
            <div className="sidebar-options">
              <button onClick={togglePosition}>
                <IoSwapHorizontal size={16} />
                Switch to {sidebarPosition === 'left' ? 'Right' : 'Left'}
              </button>
              <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
                {sidebarCollapsed ? <IoMenu size={16} /> : <IoClose size={16} />}
                {sidebarCollapsed ? 'Expand' : 'Collapse'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Editor */}
      <div className={`content-area ${sidebarCollapsed ? 'sidebar-collapsed' : ''} sidebar-${sidebarPosition}`}>
        <textarea
          className="main-editor"
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          placeholder="Start writing your scientific report..."
        />
      </div>

      {/* Draggable Sidebar */}
      <div 
        ref={sidebarRef}
        className={`report-sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${sidebarPosition}`}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        {/* Sidebar Header */}
        <div className="sidebar-header" onMouseDown={handleMouseDown}>
          <div className="sidebar-controls">
            <button 
              className="collapse-btn"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              {sidebarCollapsed ? <IoMenu size={20} /> : <IoClose size={20} />}
            </button>
            <button className="position-btn" onClick={togglePosition}>
              <IoSwapHorizontal size={20} />
            </button>
          </div>
          {!sidebarCollapsed && <h3>Research Tools</h3>}
        </div>

        {/* Tools */}
        {!sidebarCollapsed && (
          <div className="sidebar-content">
            <div className="tools-grid">
              {reportTools.map(tool => (
                <button
                  key={tool.id}
                  className={`tool-btn ${activeTool === tool.id ? 'active' : ''}`}
                  style={{ '--category-color': getCategoryColor(tool.category) } as React.CSSProperties}
                  onClick={() => handleToolClick(tool.id)}
                >
                  <span className="tool-icon">{tool.icon}</span>
                  <span className="tool-label">{tool.label}</span>
                </button>
              ))}
            </div>

            {/* Tool Panel */}
            {renderToolPanel()}
          </div>
        )}

        {/* Collapsed Icons */}
        {sidebarCollapsed && (
          <div className="collapsed-icons">
            {reportTools.map(tool => (
              <button
                key={tool.id}
                className="collapsed-tool-btn"
                onClick={() => {
                  setSidebarCollapsed(false);
                  handleToolClick(tool.id);
                }}
                title={tool.label}
              >
                {tool.icon}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* AI Assistant */}
      <AIAssistant 
        isOpen={showAI}
        onClose={() => setShowAI(false)}
        mode="report-helper"
        floatingMode={!showAI}
      />

      {/* Creative Control Panel */}
      <CreativeControlPanel
        currentSettings={creativeSession.controlSettings}
        onSettingsChange={handleCreativeSettingsChange}
        userHistory={creativeSession.userHistory}
        availablePersonalities={availablePersonalities}
        mode="report"
      />

      {/* Iterative Feedback Panel */}
      {showIterativeFeedback && currentVersions.length > 0 && (
        <IterativeFeedbackPanel
          versions={currentVersions}
          onVersionSelect={handleVersionSelect}
          onRequestRefinement={handleRequestRefinement}
          currentPersonality={creativeSession.controlSettings.yumiPersonality}
          refinementSuggestions={[
            'Add citations',
            'Include data analysis',
            'Improve structure',
            'Academic formatting',
            'Peer review ready',
            'Add conclusions'
          ]}
        />
      )}
    </div>
  );
};

export default ReportHelperScreen; 