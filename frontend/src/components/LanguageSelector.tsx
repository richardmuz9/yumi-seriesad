import React from 'react';
import { Select, MenuItem, SelectChangeEvent } from '@mui/material';
import { useLanguage } from '../contexts/LanguageContext';

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'ja', name: '日本語' },
  { code: 'zh', name: '中文' },
  { code: 'ko', name: '한국어' }
] as const;

export const LanguageSelector: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  const handleChange = (event: SelectChangeEvent<string>) => {
    const lang = event.target.value as typeof language;
    setLanguage(lang);
  };

  return (
    <Select
      value={language}
      onChange={handleChange}
      size="small"
      sx={{
        minWidth: 120,
        '& .MuiSelect-select': {
          py: 1,
          display: 'flex',
          alignItems: 'center',
        }
      }}
    >
      {LANGUAGES.map(({ code, name }) => (
        <MenuItem key={code} value={code}>
          {name}
        </MenuItem>
      ))}
    </Select>
  );
};

export default LanguageSelector; 