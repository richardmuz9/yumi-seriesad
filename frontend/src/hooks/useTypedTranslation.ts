import { useTranslation } from 'react-i18next';

type TranslationNamespace = 
  | 'main'
  | 'writing'
  | 'report'
  | 'helper'
  | 'anime'
  | 'image'
  | 'billing'
  | 'download'
  | 'common';

export const useTypedTranslation = (ns?: TranslationNamespace | TranslationNamespace[]) => {
  return useTranslation(ns);
};

export const useCommonTranslation = () => {
  return useTranslation('common');
};

export const useMainTranslation = () => {
  return useTranslation('main');
};

export const useWritingTranslation = () => {
  return useTranslation('writing');
};

export const useReportTranslation = () => {
  return useTranslation('report');
};

export const useHelperTranslation = () => {
  return useTranslation('helper');
};

export const useAnimeTranslation = () => {
  return useTranslation('anime');
};

export const useImageTranslation = () => {
  return useTranslation('image');
};

export const useBillingTranslation = () => {
  return useTranslation('billing');
};

export const useDownloadTranslation = () => {
  return useTranslation('download');
}; 