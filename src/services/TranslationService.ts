import { supabase } from './supabase';

export const TranslationService = {
  /**
   * Translates text from source language to target language using a secure
   * backend Edge Function to avoid exposing API credentials on the frontend.
   *
   * @param text Original text
   * @param sourceLang Name of source language (e.g., 'Telugu')
   * @param targetLang Name of target language (e.g., 'English')
   * @returns The translated text, or the original text if translation fails.
   */
  async translate(text: string, sourceLang: string, targetLang: string = 'English'): Promise<string> {
    if (!text || text.trim() === '') return text;
    if (sourceLang === targetLang) return text;

    try {
      const { data, error } = await supabase.functions.invoke('translate', {
        body: { text, sourceLang, targetLang },
      });

      if (error) {
        console.error('Translation edge function error:', error.message);
        return text; // Fallback to original
      }

      if (data && data.translatedText) {
        return data.translatedText;
      }

      return text; // Fallback
    } catch (e: any) {
      console.error('Translation network/invocation error:', e.message);
      return text; // Fallback to original text to not block visitor creation
    }
  }
};
