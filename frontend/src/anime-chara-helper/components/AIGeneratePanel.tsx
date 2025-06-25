import React, { useState, useRef } from 'react';
import { generateAnimeCharacter } from '../../services/api';
import { AIGenerationSettings, GeneratedImage } from '../types';
import { Alert, Box, Button, Card, CardContent, CircularProgress, Grid, Tab, Tabs, TextField, Typography } from '@mui/material';
import { CURATED_PROMPTS } from '../data/curated-prompts';
import './AIGeneratePanel.css';

interface AIGeneratePanelProps {
  onDone: (imageUrl: string) => void;
  hasImageGenAccess: boolean;
  freeTrialsUsed: number;
  onPaymentRequired?: () => void;
}

interface ErrorState {
  visible: boolean;
  message: string;
  type: 'error' | 'warning' | 'info';
}

export default function AIGeneratePanel({ onDone, hasImageGenAccess, freeTrialsUsed }: AIGeneratePanelProps) {
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<'swimsuit' | 'maid' | 'seifuku'>('swimsuit');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<ErrorState>({
    visible: false,
    message: '',
    type: 'error'
  });
  const [retryCount, setRetryCount] = useState(0);

  const remainingTrials = 3 - freeTrialsUsed;
  const isFreeTrial = !hasImageGenAccess && remainingTrials > 0;

  const [settings, setSettings] = useState<AIGenerationSettings>({
    iterations: 1,
    useCustomModel: true,
    postProcessing: {
      upscale: true,
      denoise: true,
      lineArtCleanup: true,
      colorCorrection: {
        contrast: 1,
        saturation: 1,
        bloom: 0.5
      }
    }
  });

  const handleReferenceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setSettings(prev => ({
        ...prev,
        referenceImage: reader.result as string
      }));
    };
    reader.readAsDataURL(file);
  };

  const handlePromptChange = (value: string) => {
    setPrompt(value);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError({
        visible: true,
        message: 'Please enter a description for your character.',
        type: 'warning'
      });
      return;
    }

    setLoading(true);
    setError({ visible: false, message: '', type: 'error' });

    try {
      // If it's a free trial and no custom prompt, use the curated prompt
      const finalPrompt = isFreeTrial && !prompt.trim() 
        ? CURATED_PROMPTS.find(p => p.theme === selectedTheme)?.prompt || ''
        : prompt;

      const results = await generateAnimeCharacter(finalPrompt, settings);
      setGeneratedImages(results);
      
      if (results[0]) {
        onDone(results[0].url);
      }
    } catch (error: any) {
      console.error('Generation error:', error);
      
      // Handle specific error types
      if (error.type === 'BILLING_ERROR') {
        setError({
          visible: true,
          message: error.userMessage || 'Insufficient credits. Please check your balance.',
          type: 'error'
        });
      } else if (error.type === 'API_ERROR') {
        if (retryCount < 2) { // Allow 2 retries
          setRetryCount(prev => prev + 1);
          setError({
            visible: true,
            message: 'Temporarily unable to generate image. Retrying...',
            type: 'info'
          });
          setTimeout(() => handleGenerate(), 2000); // Retry after 2 seconds
          return;
        } else {
          setError({
            visible: true,
            message: error.userMessage || 'Service is currently unavailable. Please try again later.',
            type: 'error'
          });
        }
      } else {
        setError({
          visible: true,
          message: error.userMessage || 'An unexpected error occurred. Please try again.',
          type: 'error'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-generate-panel">
      {!hasImageGenAccess && remainingTrials <= 0 ? (
        <Alert severity="info" sx={{ mb: 2 }}>
          You've used all your free trials. Please purchase access to continue using image generation.
        </Alert>
      ) : isFreeTrial ? (
        <Alert severity="info" sx={{ mb: 2 }}>
          Try our curated themes! {remainingTrials} free trial{remainingTrials !== 1 ? 's' : ''} remaining.
        </Alert>
      ) : null}

      {isFreeTrial && (
        <>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Choose a Theme (or write your own prompt below)
          </Typography>
          <Tabs
            value={selectedTheme}
            onChange={(_, value) => setSelectedTheme(value)}
            sx={{ mb: 2 }}
          >
            <Tab label="🌊 Swimsuit" value="swimsuit" />
            <Tab label="🧹 Maid" value="maid" />
            <Tab label="🎓 Seifuku" value="seifuku" />
          </Tabs>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="body1">
                {CURATED_PROMPTS.find(p => p.theme === selectedTheme)?.prompt}
              </Typography>
            </CardContent>
          </Card>
        </>
      )}

      <Grid container spacing={2}>
        {hasImageGenAccess && (
          <Grid item xs={12}>
            <Box className="reference-upload" sx={{ mb: 2 }}>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleReferenceUpload}
                style={{ display: 'none' }}
              />
              <Button 
                variant="outlined" 
                onClick={() => fileInputRef.current?.click()}
                fullWidth
              >
                Upload Reference Image (Optional)
              </Button>
              {settings.referenceImage && (
                <Box sx={{ mt: 1 }}>
                  <img 
                    src={settings.referenceImage} 
                    alt="Reference" 
                    style={{ maxWidth: '100%', maxHeight: 200 }}
                  />
                </Box>
              )}
            </Box>
          </Grid>
        )}

        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder={isFreeTrial ? "Describe your character (or leave blank to use the selected theme)" : "Describe your character..."}
            value={prompt}
            onChange={(e) => handlePromptChange(e.target.value)}
            disabled={loading}
          />
          {error.visible && (
            <div className={`error-message ${error.type}`}>
              {error.message}
            </div>
          )}
        </Grid>

        <Grid item xs={12}>
          <Button
            variant="contained"
            onClick={handleGenerate}
            disabled={loading || (!hasImageGenAccess && remainingTrials <= 0)}
            fullWidth
          >
            {loading ? <CircularProgress size={24} /> : 'Generate Character'}
          </Button>
        </Grid>
      </Grid>

      {generatedImages.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            Generated Images
          </Typography>
          <Grid container spacing={2}>
            {generatedImages.map((image, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <img 
                  src={image.url} 
                  alt={`Generated ${index + 1}`}
                  style={{ width: '100%', cursor: 'pointer' }}
                  onClick={() => onDone(image.url)}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Creating your character...</p>
        </div>
      )}
    </div>
  );
} 