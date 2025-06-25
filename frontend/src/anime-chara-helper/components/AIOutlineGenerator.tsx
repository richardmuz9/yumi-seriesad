import React, { useState, useRef } from 'react';
import { Box, Button, Card, CardContent, TextField, Typography, Alert, CircularProgress, Slider } from '@mui/material';
import { IoCloudUpload, IoImage, IoColorWand } from 'react-icons/io5';
import './AIOutlineGenerator.css';

interface AIOutlineGeneratorProps {
  onOutlineGenerated: (outlineUrl: string) => void;
  onClose: () => void;
}

export const AIOutlineGenerator: React.FC<AIOutlineGeneratorProps> = ({ onOutlineGenerated, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [inputType, setInputType] = useState<'image' | 'text'>('image');
  const [textPrompt, setTextPrompt] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [outlineStrength, setOutlineStrength] = useState(0.7);
  const [detailLevel, setDetailLevel] = useState(0.5);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedImage(reader.result as string);
      setInputType('image');
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateOutline = async () => {
    if (!uploadedImage && !textPrompt.trim()) {
      setError('Please upload an image or enter a text description');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const requestData = {
        type: inputType,
        ...(inputType === 'image' 
          ? { image: uploadedImage, strength: outlineStrength, detailLevel }
          : { prompt: textPrompt, detailLevel }
        )
      };

      const response = await fetch('/api/anime-chara-helper/generate-outline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error('Failed to generate outline');
      }

      const data = await response.json();
      onOutlineGenerated(data.outlineUrl);
    } catch (err: any) {
      setError(err.message || 'Failed to generate outline');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="ai-outline-generator">
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" component="h2">
            AI Outline Generator
          </Typography>
          <Button onClick={onClose} size="small">
            ✕
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Input Type Selection */}
        <Box mb={3}>
          <Typography variant="subtitle2" gutterBottom>
            Input Method
          </Typography>
          <Box display="flex" gap={1}>
            <Button
              variant={inputType === 'image' ? 'contained' : 'outlined'}
              startIcon={<IoImage />}
              onClick={() => setInputType('image')}
              size="small"
            >
              From Image
            </Button>
            <Button
              variant={inputType === 'text' ? 'contained' : 'outlined'}
              startIcon={<IoColorWand />}
              onClick={() => setInputType('text')}
              size="small"
            >
              From Description
            </Button>
          </Box>
        </Box>

        {/* Image Upload */}
        {inputType === 'image' && (
          <Box mb={3}>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
            <Button
              variant="outlined"
              startIcon={<IoCloudUpload />}
              onClick={() => fileInputRef.current?.click()}
              fullWidth
              sx={{ mb: 2 }}
            >
              Upload Reference Image
            </Button>
            {uploadedImage && (
              <Box className="image-preview">
                <img src={uploadedImage} alt="Reference" />
              </Box>
            )}
          </Box>
        )}

        {/* Text Input */}
        {inputType === 'text' && (
          <Box mb={3}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Describe what you want to outline"
              placeholder="e.g., A cute anime girl with long hair wearing a school uniform..."
              value={textPrompt}
              onChange={(e) => setTextPrompt(e.target.value)}
            />
          </Box>
        )}

        {/* Settings */}
        <Box mb={3}>
          <Typography variant="subtitle2" gutterBottom>
            Outline Settings
          </Typography>
          
          {inputType === 'image' && (
            <Box mb={2}>
              <Typography variant="body2" gutterBottom>
                Outline Strength: {Math.round(outlineStrength * 100)}%
              </Typography>
              <Slider
                value={outlineStrength}
                onChange={(_, value) => setOutlineStrength(value as number)}
                min={0.1}
                max={1.0}
                step={0.1}
                marks={[
                  { value: 0.3, label: 'Soft' },
                  { value: 0.7, label: 'Medium' },
                  { value: 1.0, label: 'Strong' }
                ]}
              />
            </Box>
          )}

          <Box>
            <Typography variant="body2" gutterBottom>
              Detail Level: {Math.round(detailLevel * 100)}%
            </Typography>
            <Slider
              value={detailLevel}
              onChange={(_, value) => setDetailLevel(value as number)}
              min={0.1}
              max={1.0}
              step={0.1}
              marks={[
                { value: 0.2, label: 'Simple' },
                { value: 0.5, label: 'Medium' },
                { value: 0.8, label: 'Detailed' }
              ]}
            />
          </Box>
        </Box>

        {/* Generate Button */}
        <Button
          variant="contained"
          fullWidth
          onClick={handleGenerateOutline}
          disabled={loading || (!uploadedImage && !textPrompt.trim())}
          startIcon={loading ? <CircularProgress size={20} /> : <IoColorWand />}
        >
          {loading ? 'Generating Outline...' : 'Generate Outline'}
        </Button>

        {/* Tips */}
        <Box mt={2}>
          <Typography variant="caption" color="textSecondary">
            💡 Tips: Upload clear images for better outlines. Higher detail levels take longer to process.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}; 