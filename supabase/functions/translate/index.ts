// @ts-nocheck
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

// ============================================================================
// DEVELOPMENT TRANSLATION PROVIDER
// Using MyMemory API (Free tier: 500 words/day without email, 5000 with email)
// URL: https://mymemory.translated.net/doc/spec.php
//
// In Production, replace this provider with Google Cloud Translation API or
// AWS Translate, securely using environment variables for the API keys.
// ============================================================================

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      }
    });
  }

  try {
    const { text, sourceLang, targetLang } = await req.json();

    if (!text || !sourceLang || !targetLang) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { 
        status: 400, 
        headers: { "Content-Type": "application/json", 'Access-Control-Allow-Origin': '*' }
      });
    }

    // If source and target are the same, don't waste API calls
    if (sourceLang === targetLang) {
      return new Response(JSON.stringify({ translatedText: text }), { 
        status: 200, 
        headers: { "Content-Type": "application/json", 'Access-Control-Allow-Origin': '*' }
      });
    }

    // Map language names to language codes for MyMemory
    const langMap: Record<string, string> = {
      'English': 'en',
      'Hindi': 'hi',
      'Telugu': 'te',
    };

    const sourceCode = langMap[sourceLang] || 'auto';
    const targetCode = langMap[targetLang] || 'en';

    // Development provider using MyMemory public API
    const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceCode}|${targetCode}`);
    const data = await res.json();

    if (data.responseStatus !== 200) {
      throw new Error(data.responseDetails || "Translation API failed");
    }

    const translatedText = data.responseData.translatedText;

    return new Response(JSON.stringify({ translatedText }), {
      headers: { "Content-Type": "application/json", 'Access-Control-Allow-Origin': '*' },
    });
  } catch (err) {
    console.error("Translation error:", err);
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 500,
      headers: { "Content-Type": "application/json", 'Access-Control-Allow-Origin': '*' }
    });
  }
});
