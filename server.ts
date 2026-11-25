import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import type { Request, Response } from 'express';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';
import {
  getRegistrySnapshot,
  toggleSkillEnabled,
  selectAndLoadSkillsForTask,
  getSkillInstructionsDetails
} from './skills/skillsStore.ts';

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
  if (
    lower.includes('unavailable') ||
    lower.includes('high demand') ||
    lower.includes('"code":503') ||
    lower.includes('503')
  ) {
    return {
      status: 503,
      message:
        'Le service Google Gemini connaît actuellement une forte affluence. Réessayez dans quelques instants.'
    };
  }

  let cleanMessage = rawMessage;
  if (rawMessage.trim().startsWith('{')) {
    try {
      const parsedErr = JSON.parse(rawMessage);
      if (typeof parsedErr?.error?.message === 'string') {
        cleanMessage = parsedErr.error.message;
      }
    } catch {
      // Keep rawMessage
    }
  }

  return {
    status: 502,
    message: cleanMessage || 'Erreur de communication avec l’API Google Gemini.'
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
  app.use(express.json({ limit: '32kb' }));

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

  // =========================================================================
  // AI ENGLISH TUTOR: Personalized Conversational Teacher, Feedback & Drills
  // =========================================================================
  const VALID_GRADES = new Set(['6e', '5e', '4e', '3e', '2nde', '1re', 'terminale']);
  const VALID_CEFR = new Set(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);
  const VALID_TUTOR_MODES = new Set([
    'free_conversation',
    'school_english',
    'everyday_english',
    'travel_english',
    'restaurant_english',
    'job_interview',
    'debate_argumentation',
    'exam_preparation',
    'storytelling'
  ]);
  const VALID_MISTAKE_CATEGORIES = new Set([
    'grammar',
    'vocabulary',
    'structure',
    'unnatural',
    'pronunciation'
  ]);

  const MODE_PEDAGOGICAL_BRIEF: Record<string, string> = {
    free_conversation: 'Open, engaging English chat adapting naturally to student interests while gently stretching vocabulary.',
    school_english: 'French Collège/Lycée English curriculum coach: tenses, irregular verbs, reading analysis, and classroom oral readiness.',
    everyday_english: 'Authentic daily life routines, social small talk, shopping, hobbies, and idiomatic spoken phrasing.',
    travel_english: 'Airport, hotel check-in, train directions, sightseeing, and resolving travel hiccups smoothly.',
    restaurant_english: 'Polite ordering, dietary questions, recommending dishes, asking for the bill, and tipping etiquette.',
    job_interview: 'Professional self-introduction, strengths, motivation, STAR answers, and polite interview questions.',
    debate_argumentation: 'Structured opinion building, nuanced linkers (however, furthermore, nevertheless), and respectful counter-arguments.',
    exam_preparation: 'Brevet / Bac / Cambridge speaking & synthesis tasks: clear thesis, cultural references, and formal accuracy.',
    storytelling: 'Narrative tenses (past simple, past continuous, past perfect), sensory adjectives, suspense, and creative pacing.'
  };

  function sanitizeGrade(val: unknown): string {
    return typeof val === 'string' && VALID_GRADES.has(val) ? val : '2nde';
  }
  function sanitizeCefr(val: unknown): string {
    return typeof val === 'string' && VALID_CEFR.has(val) ? val : 'B1';
  }
  function sanitizeTutorMode(val: unknown): string {
    return typeof val === 'string' && VALID_TUTOR_MODES.has(val) ? val : 'free_conversation';
  }

  app.post('/api/gemini/tutor-chat', async (req: Request, res: Response) => {
    const body = (req.body || {}) as {
      message?: string;
      mode?: string;
      schoolGrade?: string;
      cefrLevel?: string;
      weakestSkills?: string[];
      teachingLanguagePreference?: 'english_default' | 'bilingual_fr';
      struggleCount?: number;
      studentProfileContext?: {
        recentTestAvg?: number;
        recentModules?: string[];
        vocabWeaknesses?: string[];
        recurringMistakes?: string[];
        strongestSkills?: string[];
      };
      speechAnalysisReport?: {
        accuracyScore?: number;
        missedWords?: string[];
        phoneticTips?: string[];
      } | null;
      history?: Array<{ role: string; text: string }>;
    };

    const userMsg = typeof body.message === 'string' ? body.message.trim().slice(0, 900) : '';
    if (!userMsg || userMsg.length < 2) {
      res.status(400).json({ error: 'Saisissez un message ou une phrase parlée (2 à 900 caractères).' });
      return;
    }

    const ai = createGeminiClient();
    if (!ai) {
      res.status(503).json({
        error: 'Clé API Google Gemini non configurée côté serveur. Ajoutez GEMINI_API_KEY dans Settings > Secrets.'
      });
      return;
    }

    const grade = sanitizeGrade(body.schoolGrade);
    const cefr = sanitizeCefr(body.cefrLevel);
    const mode = sanitizeTutorMode(body.mode);
    const weakSkills = Array.isArray(body.weakestSkills)
      ? body.weakestSkills.filter((s) => typeof s === 'string').slice(0, 4)
      : [];
    const ctx = body.studentProfileContext || {};
    const recentAvg = typeof ctx.recentTestAvg === 'number' ? Math.round(ctx.recentTestAvg) : null;
    const recentModules = Array.isArray(ctx.recentModules) ? ctx.recentModules.slice(0, 4) : [];
    const vocabWeaknesses = Array.isArray(ctx.vocabWeaknesses) ? ctx.vocabWeaknesses.slice(0, 6) : [];
    const recurringMistakes = Array.isArray(ctx.recurringMistakes) ? ctx.recurringMistakes.slice(0, 6) : [];
    const strongestSkills = Array.isArray(ctx.strongestSkills) ? ctx.strongestSkills.slice(0, 3) : [];
    const struggleCount = typeof body.struggleCount === 'number' ? Math.max(0, body.struggleCount) : 0;

    const wantsFrenchExplicit =
      body.teachingLanguagePreference === 'bilingual_fr' ||
      /français|french|en francais|explique|je ne comprends pas|aide-moi|comment dit-on|traduis/i.test(userMsg);
    const needsFrenchHelp = wantsFrenchExplicit || struggleCount >= 2;

    const speechReport = body.speechAnalysisReport;
    const hasReliableSpeechData = Boolean(
      speechReport &&
      (typeof speechReport.accuracyScore === 'number' ||
        (Array.isArray(speechReport.missedWords) && speechReport.missedWords.length > 0))
    );

    const historyLines = Array.isArray(body.history)
      ? body.history
          .slice(-8)
          .map((h) => `${h.role === 'user' ? 'Student' : 'Professor Sterling'}: ${String(h.text || '').slice(0, 280)}`)
          .join('\n')
      : '';

    const systemInstruction = `You are Professor Arthur Sterling, a warm, highly qualified, endlessly patient and encouraging Oxford English Teacher inside English Boost MSZ.
PERSONALITY RULES (STRICT):
- Celebrate genuine progress and effort warmly; NEVER humiliate, scold, or use harsh/discouraging words.
- Adapt sentence length, vocabulary, and complexity strictly to a French ${grade} student at CEFR ${cefr}.
- Mode: "${mode}" — ${MODE_PEDAGOGICAL_BRIEF[mode] || MODE_PEDAGOGICAL_BRIEF.free_conversation}

TEACHING LANGUAGE RULE (STRICT):
- English is your default teaching language. Keep "replyEn", "followUpQuestion", "praiseNote", and correction "explanation" in clear, supportive English tailored to ${cefr}.
- French Support Mode active: ${needsFrenchHelp ? 'YES — student requested French, wrote in French, or has struggled on consecutive turns. Provide a warm, clear French explanation in "frenchSupport" and fill "explanationFr" for every correction.' : 'NO — keep English immersion primary; leave "frenchSupport" empty ("") unless the student asked a French question.'}

STUDENT DIAGNOSTIC PROFILE:
- School Grade: ${grade} | CEFR: ${cefr}${recentAvg !== null ? ` | Recent Quiz/Exercise Avg: ${recentAvg}%` : ''}
- Weakest skills: ${weakSkills.join(', ') || 'balanced fluency'}
- Strongest skills: ${strongestSkills.join(', ') || 'curiosity & participation'}
- Vocabulary weaknesses to weave in naturally: ${vocabWeaknesses.join(', ') || 'none flagged yet'}
- Recurring mistakes to watch kindly for: ${recurringMistakes.join(' | ') || 'none recorded yet'}
- Recent studied modules: ${recentModules.join(', ') || 'general practice'}

CORRECTION DISCIPLINE (AFTER STUDENT FINISHES):
- Inspect the student's completed message without breaking conversational flow.
- Identify genuine mistakes in these exact categories ONLY: "grammar", "vocabulary", "structure", "unnatural", "pronunciation".
- IMPORTANT: Only create a "pronunciation" mistake if reliable speech-analysis data is supplied below OR the student explicitly asked about pronunciation.
- If the student made NO real mistakes, return "corrections": [] and celebrate their accuracy!
- For EVERY mistake returned, you MUST populate ALL fields:
  1. "category": one of grammar | vocabulary | structure | unnatural | pronunciation
  2. "original": exact faulty snippet/sentence from the student
  3. "corrected": accurate, natural English version
  4. "explanation": clear, simple, encouraging explanation in English
  5. "explanationFr": brief French clarification when French help is helpful
  6. "additionalExample": ONE new natural English example sentence illustrating the correct pattern

Return valid JSON strictly matching the schema.`;

    const promptParts = [
      historyLines ? `Recent conversation:\n${historyLines}` : '',
      hasReliableSpeechData
        ? `Reliable Voice/Phonetic Telemetry from Student Audio:\n- Orthographic/Phonetic match: ${speechReport?.accuracyScore ?? 'N/A'}%\n- Missed or misheard words: ${(speechReport?.missedWords || []).join(', ') || 'none'}\n- Phonetic notes: ${(speechReport?.phoneticTips || []).join(' | ') || 'none'}`
        : 'Input modality: Written text or uncalibrated mic (do NOT invent pronunciation errors).',
      `Student message: "${userMsg}"`
    ].filter(Boolean);

    try {
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: promptParts.join('\n\n'),
        config: {
          systemInstruction,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              replyEn: { type: Type.STRING, description: 'Encouraging, conversational reply in English matched to student CEFR and mode.' },
              praiseNote: { type: Type.STRING, description: 'Specific positive reinforcement celebrating what the student did well in English.' },
              frenchSupport: { type: Type.STRING, description: 'Clear French explanation when requested, student uses French, or struggles consecutively; empty string otherwise.' },
              corrections: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    category: { type: Type.STRING, description: 'grammar | vocabulary | structure | unnatural | pronunciation' },
                    original: { type: Type.STRING },
                    corrected: { type: Type.STRING },
                    explanation: { type: Type.STRING },
                    explanationFr: { type: Type.STRING },
                    additionalExample: { type: Type.STRING }
                  },
                  required: ['category', 'original', 'corrected', 'explanation', 'additionalExample']
                }
              },
              vocabularyBoost: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    term: { type: Type.STRING },
                    phonetic: { type: Type.STRING },
                    translationFr: { type: Type.STRING }
                  },
                  required: ['term', 'phonetic', 'translationFr']
                }
              },
              pronunciationCoach: { type: Type.STRING, description: 'Focused stress/IPA pronunciation tip grounded in a key word or speech telemetry (in English, or bilingual if French help active).' },
              followUpQuestion: { type: Type.STRING, description: 'Warm follow-up question in English continuing the scenario.' },
              suggestedReplies: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '3 helpful short English replies or questions the student can try next.'
              },
              fluencyScoreEstimate: { type: Type.INTEGER, description: 'Encouraging communicative clarity score 50-100.' }
            },
            required: [
              'replyEn',
              'praiseNote',
              'frenchSupport',
              'corrections',
              'vocabularyBoost',
              'pronunciationCoach',
              'followUpQuestion',
              'suggestedReplies',
              'fluencyScoreEstimate'
            ]
          }
        }
      });

      const rawJson = (response.text ?? '').trim();
      const parsed = JSON.parse(rawJson);
      if (!parsed || typeof parsed.replyEn !== 'string' || !parsed.replyEn.trim()) {
        throw new Error('Réponse éducative AI incomplète.');
      }

      const rawCorrections = Array.isArray(parsed.corrections) ? parsed.corrections : [];
      const sanitizedCorrections = rawCorrections
        .filter((c: any) => c && typeof c.original === 'string' && typeof c.corrected === 'string' && c.original.trim() && c.corrected.trim())
        .slice(0, 5)
        .map((c: any) => ({
          category: VALID_MISTAKE_CATEGORIES.has(c.category) ? c.category : 'grammar',
          original: String(c.original).trim(),
          corrected: String(c.corrected).trim(),
          explanation: String(c.explanation || 'Use the corrected natural phrasing here.').trim(),
          explanationFr: typeof c.explanationFr === 'string' ? c.explanationFr.trim() : '',
          additionalExample: String(c.additionalExample || c.corrected).trim()
        }));

      res.json({
        source: 'google_gemini',
        replyEn: parsed.replyEn.trim(),
        praiseNote: typeof parsed.praiseNote === 'string' && parsed.praiseNote.trim()
          ? parsed.praiseNote.trim()
          : 'Great effort expressing your ideas clearly in English!',
        frenchSupport: typeof parsed.frenchSupport === 'string' ? parsed.frenchSupport.trim() : '',
        usedFrenchHelp: Boolean(needsFrenchHelp || (typeof parsed.frenchSupport === 'string' && parsed.frenchSupport.trim().length > 0)),
        corrections: sanitizedCorrections,
        vocabularyBoost: Array.isArray(parsed.vocabularyBoost) ? parsed.vocabularyBoost.slice(0, 3) : [],
        pronunciationCoach: typeof parsed.pronunciationCoach === 'string' ? parsed.pronunciationCoach.trim() : '',
        followUpQuestion: typeof parsed.followUpQuestion === 'string' ? parsed.followUpQuestion.trim() : '',
        suggestedReplies: Array.isArray(parsed.suggestedReplies)
          ? parsed.suggestedReplies.filter((s: any) => typeof s === 'string' && s.trim()).slice(0, 3)
          : [],
        fluencyScoreEstimate: Math.max(55, Math.min(100, Math.round(Number(parsed.fluencyScoreEstimate) || 82)))
      });
    } catch (err) {
      const { status, message } = getHttpStatusFromError(err);
      res.status(status).json({ error: message });
    }
  });

  app.post('/api/gemini/tutor-session-summary', async (req: Request, res: Response) => {
    const body = (req.body || {}) as {
      mode?: string;
      modeLabel?: string;
      schoolGrade?: string;
      cefrLevel?: string;
      turnsCount?: number;
      transcriptTurns?: Array<{ role: string; text: string }>;
      recordedCorrections?: Array<{ category: string; original: string; corrected: string; explanation: string }>;
      recurringWeaknesses?: string[];
    };

    const ai = createGeminiClient();
    if (!ai) {
      res.status(503).json({
        error: 'Clé API Google Gemini non configurée côté serveur. Ajoutez GEMINI_API_KEY dans Settings > Secrets.'
      });
      return;
    }

    const grade = sanitizeGrade(body.schoolGrade);
    const cefr = sanitizeCefr(body.cefrLevel);
    const mode = sanitizeTutorMode(body.mode);
    const modeLabel = typeof body.modeLabel === 'string' ? body.modeLabel.slice(0, 80) : mode;
    const transcript = Array.isArray(body.transcriptTurns)
      ? body.transcriptTurns.slice(-14).map((t) => `${t.role === 'user' ? 'Student' : 'Tutor'}: ${String(t.text || '').slice(0, 220)}`).join('\n')
      : '';
    const corrSummary = Array.isArray(body.recordedCorrections)
      ? body.recordedCorrections.slice(0, 12).map((c) => `[${c.category}] "${c.original}" -> "${c.corrected}" (${c.explanation})`).join('\n')
      : '';

    try {
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: `Session Mode: ${modeLabel} (${mode})\nStudent: ${grade}, CEFR ${cefr}\nTranscript:\n${transcript || 'Short practice session'}\n\nCorrections observed:\n${corrSummary || 'No major mistakes — smooth communication!'}`,
        config: {
          systemInstruction: 'You are Professor Arthur Sterling concluding a supportive AI English Tutor session. Celebrate strengths genuinely, summarize any weaknesses gently and constructively, recommend the next practice focus, and score communicative fluency from 60 to 100 fairly. Strict JSON only.',
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              fluencyScore: { type: Type.INTEGER },
              strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
              weaknessesIdentified: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    category: { type: Type.STRING },
                    label: { type: Type.STRING },
                    tip: { type: Type.STRING }
                  },
                  required: ['category', 'label', 'tip']
                }
              },
              recommendedFocus: { type: Type.STRING },
              encouragementEn: { type: Type.STRING },
              summaryFr: { type: Type.STRING },
              nextPracticePrompt: { type: Type.STRING }
            },
            required: [
              'fluencyScore',
              'strengths',
              'weaknessesIdentified',
              'recommendedFocus',
              'encouragementEn',
              'summaryFr',
              'nextPracticePrompt'
            ]
          }
        }
      });

      const parsed = JSON.parse((response.text ?? '').trim());
      if (!parsed || typeof parsed.encouragementEn !== 'string') {
        throw new Error('Résumé de session IA incomplet.');
      }

      res.json({
        source: 'google_gemini',
        fluencyScore: Math.max(60, Math.min(100, Math.round(Number(parsed.fluencyScore) || 85))),
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths.slice(0, 4) : [],
        weaknessesIdentified: Array.isArray(parsed.weaknessesIdentified)
          ? parsed.weaknessesIdentified.slice(0, 5).map((w: any) => ({
              category: VALID_MISTAKE_CATEGORIES.has(w?.category) ? w.category : 'grammar',
              label: String(w?.label || 'Sentence refinement').slice(0, 100),
              tip: String(w?.tip || '').slice(0, 200)
            }))
          : [],
        recommendedFocus: String(parsed.recommendedFocus || '').slice(0, 200),
        encouragementEn: String(parsed.encouragementEn || '').trim(),
        summaryFr: String(parsed.summaryFr || '').trim(),
        nextPracticePrompt: String(parsed.nextPracticePrompt || '').trim()
      });
    } catch (err) {
      const { status, message } = getHttpStatusFromError(err);
      res.status(status).json({ error: message });
    }
  });

  app.post('/api/gemini/evaluate-writing', async (req: Request, res: Response) => {
    const body = (req.body || {}) as {
      text?: string;
      promptTopic?: string;
      schoolGrade?: string;
      cefrLevel?: string;
    };

    const essay = typeof body.text === 'string' ? body.text.trim().slice(0, 1800) : '';
    if (!essay || essay.length < 10) {
      res.status(400).json({ error: 'Rédigez au moins 10 caractères en anglais pour obtenir une évaluation.' });
      return;
    }

    const ai = createGeminiClient();
    if (!ai) {
      res.status(503).json({
        error: 'Clé API Google Gemini non configurée côté serveur. Ajoutez GEMINI_API_KEY dans Settings > Secrets.'
      });
      return;
    }

    const grade = sanitizeGrade(body.schoolGrade);
    const cefr = sanitizeCefr(body.cefrLevel);
    const topic = typeof body.promptTopic === 'string' ? body.promptTopic.trim().slice(0, 160) : 'Expression libre';

    try {
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: `Sujet : ${topic}\nClasse : ${grade} | Niveau visé : ${cefr}\nTexte de l'élève :\n"""${essay}"""`,
        config: {
          systemInstruction: `Tu es examinateur académique d'anglais pour élèves francophones (${grade}, niveau cible ${cefr}). Évalue la production écrite sur 100 avec rigueur et bienveillance, propose une version corrigée et enrichie en anglais, liste les points forts et axes d'amélioration en français, et identifie la règle grammaticale clé à retenir.`,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.INTEGER, description: 'Score out of 100 matching CEFR standards for this grade.' },
              cefrEstimate: { type: Type.STRING, description: 'Estimated CEFR level: A1, A2, B1, B2, C1, or C2.' },
              correctedText: { type: Type.STRING, description: 'Polished and grammatically accurate English version.' },
              strengthsFr: { type: Type.ARRAY, items: { type: Type.STRING } },
              improvementsFr: { type: Type.ARRAY, items: { type: Type.STRING } },
              keyGrammarPointFr: { type: Type.STRING },
              encouragementFr: { type: Type.STRING }
            },
            required: ['score', 'cefrEstimate', 'correctedText', 'strengthsFr', 'improvementsFr', 'keyGrammarPointFr', 'encouragementFr']
          }
        }
      });

      const parsed = JSON.parse((response.text ?? '').trim());
      if (!parsed || typeof parsed.correctedText !== 'string' || !parsed.correctedText.trim()) {
        throw new Error('Évaluation IA invalide.');
      }

      const clampedScore = Math.max(20, Math.min(100, Math.round(Number(parsed.score) || 70)));
      const estCefr = VALID_CEFR.has(parsed.cefrEstimate) ? parsed.cefrEstimate : cefr;

      res.json({
        source: 'google_gemini',
        score: clampedScore,
        cefrEstimate: estCefr,
        correctedText: parsed.correctedText.trim(),
        strengthsFr: Array.isArray(parsed.strengthsFr) ? parsed.strengthsFr.slice(0, 4) : [],
        improvementsFr: Array.isArray(parsed.improvementsFr) ? parsed.improvementsFr.slice(0, 4) : [],
        keyGrammarPointFr: typeof parsed.keyGrammarPointFr === 'string' ? parsed.keyGrammarPointFr : '',
        encouragementFr: typeof parsed.encouragementFr === 'string' ? parsed.encouragementFr : ''
      });
    } catch (err) {
      const { status, message } = getHttpStatusFromError(err);
      res.status(status).json({ error: message });
    }
  });

  app.post('/api/gemini/generate-drill', async (req: Request, res: Response) => {
    const body = (req.body || {}) as {
      focusSkill?: string;
      schoolGrade?: string;
      cefrLevel?: string;
      topic?: string;
      recurringWeaknesses?: string[];
      vocabWeaknesses?: string[];
    };

    const allowedSkills = new Set(['vocabulary', 'grammar', 'reading', 'writing', 'structure']);
    const focusSkill = typeof body.focusSkill === 'string' && allowedSkills.has(body.focusSkill) ? body.focusSkill : 'grammar';
    const grade = sanitizeGrade(body.schoolGrade);
    const cefr = sanitizeCefr(body.cefrLevel);
    const topic = typeof body.topic === 'string' ? body.topic.trim().slice(0, 140) : 'Programme scolaire officiel';
    const recurringWeaknesses = Array.isArray(body.recurringWeaknesses)
      ? body.recurringWeaknesses.filter((w) => typeof w === 'string' && w.trim()).slice(0, 6)
      : [];
    const vocabWeaknesses = Array.isArray(body.vocabWeaknesses)
      ? body.vocabWeaknesses.filter((w) => typeof w === 'string' && w.trim()).slice(0, 6)
      : [];

    const ai = createGeminiClient();
    if (!ai) {
      res.status(503).json({
        error: 'Clé API Google Gemini non configurée côté serveur. Ajoutez GEMINI_API_KEY dans Settings > Secrets.'
      });
      return;
    }

    const weaknessBlock = [
      recurringWeaknesses.length > 0 ? `Erreurs récurrentes détectées chez cet élève à cibler en priorité : ${recurringWeaknesses.join(' | ')}` : '',
      vocabWeaknesses.length > 0 ? `Mots du journal d'erreurs à réactiver : ${vocabWeaknesses.join(', ')}` : ''
    ].filter(Boolean).join('\n');

    try {
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: `Crée un micro-atelier d'entraînement personnalisé de 3 questions QCM (4 choix exacts par question) ciblant la compétence "${focusSkill}" pour un élève en ${grade} (niveau CECRL ${cefr}), thème "${topic}".${weaknessBlock ? `\n\n${weaknessBlock}` : ''}`,
        config: {
          systemInstruction: `Tu es concepteur pédagogique certifié pour English Boost MSZ. Génère exactement 3 questions QCM valides pédagogiquement, sans ambiguïté, avec exactement 4 options distinctes chacune, un correctIndex (0 à 3) exact, et une explication claire en français + exemple en anglais. Lorsque des erreurs récurrentes de l'élève sont fournies, construis les questions pour corriger ces erreurs précises.`,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              explanationFr: { type: Type.STRING },
              questions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    question: { type: Type.STRING },
                    options: { type: Type.ARRAY, items: { type: Type.STRING } },
                    correctIndex: { type: Type.INTEGER },
                    explanationFr: { type: Type.STRING },
                    sampleSentenceEn: { type: Type.STRING }
                  },
                  required: ['question', 'options', 'correctIndex', 'explanationFr', 'sampleSentenceEn']
                }
              }
            },
            required: ['title', 'explanationFr', 'questions']
          }
        }
      });

      const parsed = JSON.parse((response.text ?? '').trim());
      const validQuestions = Array.isArray(parsed?.questions)
        ? parsed.questions
            .filter(
              (q: any) =>
                q &&
                typeof q.question === 'string' &&
                q.question.trim().length > 4 &&
                Array.isArray(q.options) &&
                q.options.length === 4 &&
                typeof q.correctIndex === 'number' &&
                q.correctIndex >= 0 &&
                q.correctIndex <= 3
            )
            .slice(0, 3)
        : [];

      if (validQuestions.length < 3 || typeof parsed?.title !== 'string') {
        throw new Error('Contenu éducatif généré non conforme aux critères de validation.');
      }

      res.json({
        source: 'google_gemini',
        title: parsed.title.trim(),
        focusSkill,
        cefrLevel: cefr,
        schoolGrade: grade,
        targetedWeaknessesCount: recurringWeaknesses.length + vocabWeaknesses.length,
        explanationFr: typeof parsed.explanationFr === 'string' ? parsed.explanationFr.trim() : '',
        questions: validQuestions
      });
    } catch (err) {
      const { status, message } = getHttpStatusFromError(err);
      res.status(status).json({ error: message });
    }
  });

  app.post('/api/gemini/chesterfield-quote', async (req: Request, res: Response) => {
    const body = (req.body || {}) as { excludeQuotes?: unknown };
    const excludeQuotes = Array.isArray(body.excludeQuotes)
      ? body.excludeQuotes
          .filter((q): q is string => typeof q === 'string' && q.trim().length > 0)
          .map((q) => q.trim().slice(0, 280))
          .slice(-12)
      : [];

    const ai = createGeminiClient();
    if (!ai) {
      res.status(503).json({
        error: 'Clé API Google Gemini non configurée côté serveur. Ajoutez GEMINI_API_KEY dans Settings > Secrets.'
      });
      return;
    }

    const topics = [
      'eloquence and clarity of speech',
      'discipline, focus, and daily habits',
      'courtesy, tact, and listening to others',
      'intellectual curiosity and reading widely',
      'composure under pressure and self-mastery',
      'style, grace, and precision of thought',
      'diplomacy and observation of human character'
    ];
    const pickedTopic = topics[Math.floor(Math.random() * topics.length)];
    const exclusionText =
      excludeQuotes.length > 0
        ? `\n\nDo NOT repeat or closely paraphrase any of these quotes already shown:\n${excludeQuotes.map((q) => `- "${q}"`).join('\n')}`
        : '';

    try {
      let response: Awaited<ReturnType<typeof ai.models.generateContent>> | null = null;
      let lastGenErr: unknown;
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: `Generate a refined Lord Chesterfield epistolary quote in 18th-century English prose on the theme of "${pickedTopic}", along with a literary French translation and brief UK/US phonetic tips referencing actual words in your generated English quote.${exclusionText}`,
            config: {
              systemInstruction:
                "You are a bilingual Oxford philologist and specialist in 18th-century English epistolary literature (Philip Stanhope, 4th Earl of Chesterfield). Produce an authentic or faithfully styled Lord Chesterfield maxim in eloquent English (10-26 words, no outer quotes), its polished literary French translation (no outer quotes), attribution metadata, and two concise French phonetic observations (one for British RP and one for General American) referencing exact words present in the generated English quote.",
              thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  quoteEn: {
                    type: Type.STRING,
                    description: 'Eloquent English sentence by Lord Chesterfield (10 to 26 words, without outer quotation marks).'
                  },
                  quoteFr: {
                    type: Type.STRING,
                    description: 'Polished literary French translation (without outer guillemets or quotation marks).'
                  },
                  sourceWork: {
                    type: Type.STRING,
                    description: 'Short historical source title, e.g. Letters to his Son or Maxims on Manners & Rhetoric.'
                  },
                  year: {
                    type: Type.STRING,
                    description: 'Four-digit historical year between 1746 and 1777, e.g. 1751 or 1774.'
                  },
                  cefrFocus: {
                    type: Type.STRING,
                    description: 'Short CEFR badge in French, e.g. CEFR C1/C2 Rhétorique or CEFR C2 Éloquence.'
                  },
                  phoneticNoteUk: {
                    type: Type.STRING,
                    description: 'Concise French observation on British RP pronunciation of a specific word in quoteEn.'
                  },
                  phoneticNoteUs: {
                    type: Type.STRING,
                    description: 'Concise French observation on General American pronunciation of a specific word in quoteEn.'
                  }
                },
                required: ['quoteEn', 'quoteFr', 'sourceWork', 'year', 'cefrFocus', 'phoneticNoteUk', 'phoneticNoteUs']
              }
            }
          });
          break;
        } catch (err) {
          lastGenErr = err;
          const msg = err instanceof Error ? err.message.toLowerCase() : String(err).toLowerCase();
          if (attempt === 0 && (msg.includes('503') || msg.includes('unavailable'))) {
            await new Promise((resolve) => setTimeout(resolve, 650));
            continue;
          }
          throw err;
        }
      }
      if (!response) {
        throw lastGenErr ?? new Error('Réponse Gemini vide.');
      }

      const parsed = JSON.parse((response.text ?? '').trim());
      const stripOuterQuotes = (value: unknown) =>
        typeof value === 'string'
          ? value
              .trim()
              .replace(/^[«“"'`]+|[»”"'`]+$/g, '')
              .trim()
          : '';

      const quoteEn = stripOuterQuotes(parsed?.quoteEn);
      const quoteFr = stripOuterQuotes(parsed?.quoteFr);

      if (quoteEn.length < 12 || quoteFr.length < 12) {
        throw new Error('Citation générée incomplète ou invalide.');
      }

      res.json({
        source: 'google_gemini',
        quoteEn,
        quoteFr,
        sourceWork:
          typeof parsed?.sourceWork === 'string' && parsed.sourceWork.trim()
            ? parsed.sourceWork.trim().slice(0, 80)
            : 'Letters to his Son',
        year:
          typeof parsed?.year === 'string' && /^\d{4}$/.test(parsed.year.trim())
            ? parsed.year.trim()
            : '1774',
        cefrFocus:
          typeof parsed?.cefrFocus === 'string' && parsed.cefrFocus.trim()
            ? parsed.cefrFocus.trim().slice(0, 48)
            : 'CEFR C2 Rhétorique',
        phoneticNoteUk:
          typeof parsed?.phoneticNoteUk === 'string' && parsed.phoneticNoteUk.trim()
            ? parsed.phoneticNoteUk.trim().slice(0, 140)
            : 'Articulation britannique nette et voyelles longues non-rhôtiques.',
        phoneticNoteUs:
          typeof parsed?.phoneticNoteUs === 'string' && parsed.phoneticNoteUs.trim()
            ? parsed.phoneticNoteUs.trim().slice(0, 140)
            : 'Rhotisme rétroflexe marqué sur les /r/ et cadence fluide américaine.'
      });
    } catch (err) {
      const { status, message } = getHttpStatusFromError(err);
      res.status(status).json({ error: message });
    }
  });

  app.post('/api/gemini/chesterfield-rhetoric', async (req: Request, res: Response) => {
    const body = (req.body || {}) as {
      quoteEn?: unknown;
      quoteFr?: unknown;
      sourceWork?: unknown;
      year?: unknown;
    };

    const quoteEn = typeof body.quoteEn === 'string' ? body.quoteEn.trim().slice(0, 500) : '';
    const quoteFr = typeof body.quoteFr === 'string' ? body.quoteFr.trim().slice(0, 500) : '';
    const sourceWork =
      typeof body.sourceWork === 'string' && body.sourceWork.trim()
        ? body.sourceWork.trim().slice(0, 100)
        : 'Letters to his Son';
    const year = typeof body.year === 'string' && body.year.trim() ? body.year.trim().slice(0, 16) : '1774';

    if (quoteEn.length < 8) {
      res.status(400).json({ error: 'Citation anglaise trop courte ou manquante pour l’analyse rhétorique.' });
      return;
    }

    const ai = createGeminiClient();
    if (!ai) {
      res.status(503).json({
        error: 'Clé API Google Gemini non configurée côté serveur. Ajoutez GEMINI_API_KEY dans Settings > Secrets.'
      });
      return;
    }

    try {
      let response: Awaited<ReturnType<typeof ai.models.generateContent>> | null = null;
      let lastErr: unknown;
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: `Analyse la rhétorique de cette citation de Lord Chesterfield (${sourceWork}, ${year}) :\nAnglais : "${quoteEn}"${quoteFr ? `\nTraduction française : "${quoteFr}"` : ''}`,
            config: {
              systemInstruction:
                "Tu es professeur agrégé de stylistique anglaise et rhétorique du XVIIIe siècle (Lord Chesterfield). Fournis en français une analyse concise, rigoureuse et accessible pour des lycéens et étudiants : identifie le style général, les figures de style précises présentes dans la phrase anglaise (ex : antithèse, parallélisme, métaphore, litote, chiasme, cadence binaire) en citant les extraits anglais exacts, précise le registre de langue et donne un conseil pratique pour réutiliser ce procédé à l'écrit ou à l'oral.",
              thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  registerLabel: {
                    type: Type.STRING,
                    description: 'Étiquette courte du registre de langue en français, ex: Soutenu • Prose épistolaire classique.'
                  },
                  styleOverviewFr: {
                    type: Type.STRING,
                    description: 'Explication concise en français (2 phrases max) du style et du ton employés.'
                  },
                  figuresOfSpeech: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: {
                          type: Type.STRING,
                          description: 'Nom de la figure de style en français (ex: Antithèse, Parallélisme).'
                        },
                        excerpt: {
                          type: Type.STRING,
                          description: 'Court extrait anglais tiré de la citation illustrant cette figure.'
                        },
                        explanationFr: {
                          type: Type.STRING,
                          description: 'Courte explication pédagogique en français (1 à 2 phrases).'
                        }
                      },
                      required: ['name', 'excerpt', 'explanationFr']
                    }
                  },
                  registerAnalysisFr: {
                    type: Type.STRING,
                    description: 'Analyse brève en français du registre de langue, du choix lexical et de son effet.'
                  },
                  keyTakeawayFr: {
                    type: Type.STRING,
                    description: 'Une astuce concrète en français pour réinvestir ce style en anglais.'
                  }
                },
                required: [
                  'registerLabel',
                  'styleOverviewFr',
                  'figuresOfSpeech',
                  'registerAnalysisFr',
                  'keyTakeawayFr'
                ]
              }
            }
          });
          break;
        } catch (err) {
          lastErr = err;
          const msg = err instanceof Error ? err.message.toLowerCase() : String(err).toLowerCase();
          if (attempt === 0 && (msg.includes('503') || msg.includes('unavailable'))) {
            await new Promise((resolve) => setTimeout(resolve, 650));
            continue;
          }
          throw err;
        }
      }

      if (!response) {
        throw lastErr ?? new Error('Réponse Gemini vide.');
      }

      const parsed = JSON.parse((response.text ?? '').trim());
      if (
        !parsed ||
        typeof parsed.styleOverviewFr !== 'string' ||
        !parsed.styleOverviewFr.trim() ||
        typeof parsed.registerAnalysisFr !== 'string'
      ) {
        throw new Error('Analyse rhétorique IA incomplète.');
      }

      const figures = Array.isArray(parsed.figuresOfSpeech)
        ? parsed.figuresOfSpeech
            .filter(
              (f: any) =>
                f &&
                typeof f.name === 'string' &&
                f.name.trim() &&
                typeof f.explanationFr === 'string' &&
                f.explanationFr.trim()
            )
            .slice(0, 4)
            .map((f: any) => ({
              name: f.name.trim().slice(0, 60),
              excerpt: typeof f.excerpt === 'string' ? f.excerpt.trim().slice(0, 140) : '',
              explanationFr: f.explanationFr.trim().slice(0, 280)
            }))
        : [];

      res.json({
        source: 'google_gemini',
        registerLabel:
          typeof parsed.registerLabel === 'string' && parsed.registerLabel.trim()
            ? parsed.registerLabel.trim().slice(0, 90)
            : 'Soutenu • Prose épistolaire classique',
        styleOverviewFr: parsed.styleOverviewFr.trim().slice(0, 450),
        figuresOfSpeech: figures,
        registerAnalysisFr: parsed.registerAnalysisFr.trim().slice(0, 400),
        keyTakeawayFr:
          typeof parsed.keyTakeawayFr === 'string' && parsed.keyTakeawayFr.trim()
            ? parsed.keyTakeawayFr.trim().slice(0, 260)
            : ''
      });
    } catch (err) {
      const { status, message } = getHttpStatusFromError(err);
      res.status(status).json({ error: message });
    }
  });

  // ---------------------------------------------------------------------------
  // AI Studio Master & Workspace Skills Registry / Context Endpoints
  // ---------------------------------------------------------------------------
  app.get('/api/skills', (_req: Request, res: Response) => {
    try {
      const snapshot = getRegistrySnapshot(__dirname);
      res.json(snapshot);
    } catch (err) {
      console.error('Failed to read skills registry:', err instanceof Error ? err.message : err);
      res.status(500).json({ error: 'Impossible de lire le registre skills/index.json.' });
    }
  });

  app.patch('/api/skills/:id', async (req: Request, res: Response) => {
    const rawId = typeof req.params.id === 'string' ? req.params.id.trim() : '';
    if (!/^[a-z0-9-]+$/.test(rawId) || rawId.length > 80) {
      res.status(400).json({ error: 'Identifiant de compétence invalide.' });
      return;
    }

    const body = (req.body || {}) as { enabled?: unknown };
    if (typeof body.enabled !== 'boolean') {
      res.status(400).json({ error: 'Le champ booléen "enabled" est requis.' });
      return;
    }

    try {
      const updated = await toggleSkillEnabled(__dirname, rawId, body.enabled);
      res.json(updated);
    } catch (err) {
      const statusCode =
        typeof (err as { statusCode?: unknown })?.statusCode === 'number'
          ? (err as { statusCode: number }).statusCode
          : 500;
      const message =
        statusCode === 404
          ? `Compétence introuvable : ${rawId}`
          : 'Impossible de mettre à jour le statut de la compétence.';
      res.status(statusCode).json({ error: message });
    }
  });

  app.post('/api/skills/select', (req: Request, res: Response) => {
    const body = (req.body || {}) as { task?: unknown; maxResults?: unknown };
    const rawTask = typeof body.task === 'string' ? body.task.trim() : '';
    if (!rawTask || rawTask.length > 2000) {
      res.status(400).json({
        error: 'Décrivez la tâche demandée (1 à 2000 caractères).'
      });
      return;
    }

    const maxResults =
      typeof body.maxResults === 'number' && Number.isFinite(body.maxResults)
        ? Math.max(1, Math.min(26, Math.round(body.maxResults)))
        : 8;

    try {
      const result = selectAndLoadSkillsForTask(__dirname, rawTask, { maxResults });
      res.json(result);
    } catch (err) {
      console.error('Failed to select skills:', err instanceof Error ? err.message : err);
      res.status(500).json({ error: 'Erreur lors de la sélection des compétences.' });
    }
  });

  app.get('/api/skills/:id/instructions', (req: Request, res: Response) => {
    const rawId = typeof req.params.id === 'string' ? req.params.id.trim() : '';
    if (!/^[a-z0-9-]+$/.test(rawId) || rawId.length > 80) {
      res.status(400).json({ error: 'Identifiant de compétence invalide.' });
      return;
    }

    try {
      const details = getSkillInstructionsDetails(__dirname, rawId);
      if (details.found === false) {
        res.status(404).json({ error: `Compétence introuvable : ${rawId}` });
        return;
      }
      res.json(details);
    } catch (err) {
      console.error('Failed to read skill instructions:', err instanceof Error ? err.message : err);
      res.status(500).json({ error: 'Erreur lors de la lecture des instructions Skill.' });
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
