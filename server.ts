import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import type { Request, Response } from 'express';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rawPort = Number(process.env.PORT);
const nginxPort = Number(process.env.NGINX_PORT);
const PORT =
  rawPort && rawPort !== nginxPort
    ? rawPort
    : Number(process.env.DEFAULT_APP_PORT) || 3000;
const MODEL_NAME = 'gemini-4-hydrogen';

interface WordInsightRequestBody {
  text?: string;
  lessonContext?: string;
  gradeLevel?: string;
}

interface GeminiInsightPayload {
  term: string;
  phonetic: string;
  partOfSpeech: string;
  definitionFr: string;
  definitionEn: string;
  etymologyOrigin: string;
  etymologyDetail: string;
  exampleEn: string;
  exampleFr: string;
  synonyms: string[];
}

function createGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });
}

function getHttpStatusFromError(err: unknown): { status: number; message: string } {
  const rawMessage = err instanceof Error ? err.message : String(err);
  const lower = rawMessage.toLowerCase();

  if (lower.includes('api_key_invalid') || lower.includes('api key not valid')) {
    return {
      status: 400,
      message: 'Clé API Google Gemini invalide. Vérifiez Settings > Secrets.'
    };
  }
  if (lower.includes('permission_denied') || lower.includes('403')) {
    return {
      status: 403,
      message: 'Accès refusé par l’API Google Gemini. Vérifiez Settings > Secrets.'
    };
  }
  if (lower.includes('resource_exhausted') || lower.includes('429')) {
    return {
      status: 429,
      message: 'Quota API Google Gemini temporairement atteint. Réessayez dans quelques instants.'
    };
  }
  return {
    status: 502,
    message: rawMessage || 'Erreur de communication avec l’API Google Gemini.'
  };
}

async function generateInsightWithRetry(
  ai: GoogleGenAI,
  text: string,
  lessonContext?: string,
  gradeLevel?: string
): Promise<GeminiInsightPayload> {
  const promptLines = [
    `Analyse le mot ou l'expression anglaise suivante : "${text}".`,
    gradeLevel ? `Niveau de l'élève francophone : ${gradeLevel}.` : '',
    lessonContext ? `Contexte de la leçon : ${lessonContext}.` : '',
    'Fournis : la transcription phonétique IPA, la catégorie grammaticale en français, une définition claire en français et en anglais, son étymologie précise (filiation linguistique et évolution historique en français), une phrase d’exemple naturelle en anglais avec sa traduction fidèle en français, et jusqu’à 4 synonymes anglais.'
  ].filter(Boolean);

  const systemInstruction =
    "Tu es un lexicographe et étymologiste expert bilingue anglais-français pour l'application English Boost MSZ. Réponds uniquement en JSON conforme au schéma fourni. Reste concis, pédagogique et rigoureux scientifiquement.";

  let lastError: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: promptLines.join('\n'),
        config: {
          systemInstruction,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              term: {
                type: Type.STRING,
                description: "Le mot ou l'expression anglaise sous forme canonique."
              },
              phonetic: {
                type: Type.STRING,
                description: 'Transcription phonétique IPA entre barres obliques, ex: /ˈwʌn.də.fəl/.'
              },
              partOfSpeech: {
                type: Type.STRING,
                description: 'Catégorie grammaticale en français (ex: Nom commun, Verbe, Adjectif, Expression).'
              },
              definitionFr: {
                type: Type.STRING,
                description: 'Définition claire et précise en français adaptée au niveau de l’élève.'
              },
              definitionEn: {
                type: Type.STRING,
                description: 'Définition concise et claire en anglais.'
              },
              etymologyOrigin: {
                type: Type.STRING,
                description: 'Filiation étymologique concise, ex: Latin → Ancien Français → Anglais.'
              },
              etymologyDetail: {
                type: Type.STRING,
                description: 'Explication concise en français de l’origine et de l’évolution sémantique du terme.'
              },
              exampleEn: {
                type: Type.STRING,
                description: 'Une phrase d’exemple naturelle et authentique en anglais utilisant ce terme.'
              },
              exampleFr: {
                type: Type.STRING,
                description: 'Traduction française naturelle et fidèle de exampleEn.'
              },
              synonyms: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Jusqu’à 4 synonymes anglais pertinents.'
              }
            },
            required: [
              'term',
              'phonetic',
              'partOfSpeech',
              'definitionFr',
              'definitionEn',
              'etymologyOrigin',
              'etymologyDetail',
              'exampleEn',
              'exampleFr'
            ]
          }
        }
      });

      const jsonText = (response.text ?? '').trim();
      if (!jsonText) {
        throw new Error('Réponse vide de l’API Google Gemini.');
      }
      const parsed = JSON.parse(jsonText) as GeminiInsightPayload;
      return {
        term: parsed.term || text,
        phonetic: parsed.phonetic || '',
        partOfSpeech: parsed.partOfSpeech || 'Terme',
        definitionFr: parsed.definitionFr || '',
        definitionEn: parsed.definitionEn || '',
        etymologyOrigin: parsed.etymologyOrigin || '',
        etymologyDetail: parsed.etymologyDetail || '',
        exampleEn: parsed.exampleEn || '',
        exampleFr: parsed.exampleFr || '',
        synonyms: Array.isArray(parsed.synonyms) ? parsed.synonyms.slice(0, 4) : []
      };
    } catch (err) {
      lastError = err;
      const { status } = getHttpStatusFromError(err);
      // Do not retry auth / bad request errors
      if (status === 400 || status === 403) {
        throw err;
      }
      if (attempt === 0) {
        await new Promise((resolve) => setTimeout(resolve, 350));
      }
    }
  }
  throw lastError;
}

async function startServer(): Promise<void> {
  const app = express();
  app.use(express.json({ limit: '16kb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ ok: true });
  });

  app.post('/api/gemini/word-insight', async (req: Request, res: Response) => {
    const body = (req.body || {}) as WordInsightRequestBody;
    const rawText = typeof body.text === 'string' ? body.text.trim().replace(/\s+/g, ' ') : '';

    if (!rawText || rawText.length > 120 || !/[a-zA-Z]/.test(rawText)) {
      res.status(400).json({
        error: 'Sélectionnez un mot ou une courte expression anglaise valide (1 à 120 caractères).'
      });
      return;
    }

    const ai = createGeminiClient();
    if (!ai) {
      res.status(503).json({
        error: 'Clé API Google Gemini non configurée. Veuillez la sélectionner dans Settings > Secrets.'
      });
      return;
    }

    try {
      const lessonContext = typeof body.lessonContext === 'string' ? body.lessonContext.slice(0, 180) : undefined;
      const gradeLevel = typeof body.gradeLevel === 'string' ? body.gradeLevel.slice(0, 40) : undefined;

      const insight = await generateInsightWithRetry(ai, rawText, lessonContext, gradeLevel);
      res.json({
        source: 'google_gemini',
        ...insight
      });
    } catch (err) {
      const { status, message } = getHttpStatusFromError(err);
      res.status(status).json({ error: message });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR === 'true' ? false : undefined,
        watch: process.env.DISABLE_HMR === 'true' ? null : undefined
      },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`English Boost MSZ server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
