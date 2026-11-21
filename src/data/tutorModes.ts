import type { CEFRLevel, TutorConversationMode, TutorMistakeCategory } from '../firebase/types';

export interface TutorModeConfig {
  id: TutorConversationMode;
  labelEn: string;
  labelFr: string;
  icon: string;
  taglineEn: string;
  starterPromptLow: string;
  starterPromptMid: string;
  starterPromptHigh: string;
  suggestedPrompts: Record<'low' | 'mid' | 'high', string[]>;
}

export const TUTOR_MISTAKE_CATEGORY_META: Record<
  TutorMistakeCategory,
  { labelEn: string; labelFr: string; icon: string; badgeClass: string }
> = {
  grammar: {
    labelEn: 'Grammar',
    labelFr: 'Grammaire',
    icon: 'gavel',
    badgeClass: 'text-amber-300 bg-amber-950/60 border-amber-500/40'
  },
  vocabulary: {
    labelEn: 'Vocabulary',
    labelFr: 'Vocabulaire',
    icon: 'menu_book',
    badgeClass: 'text-sky-300 bg-sky-950/60 border-sky-500/40'
  },
  structure: {
    labelEn: 'Sentence Structure',
    labelFr: 'Structure',
    icon: 'account_tree',
    badgeClass: 'text-indigo-300 bg-indigo-950/60 border-indigo-500/40'
  },
  unnatural: {
    labelEn: 'Natural Phrasing',
    labelFr: 'Formulation naturelle',
    icon: 'auto_awesome',
    badgeClass: 'text-emerald-300 bg-emerald-950/60 border-emerald-500/40'
  },
  pronunciation: {
    labelEn: 'Pronunciation',
    labelFr: 'Prononciation',
    icon: 'record_voice_over',
    badgeClass: 'text-rose-300 bg-rose-950/60 border-rose-500/40'
  }
};

export const TUTOR_CONVERSATION_MODES: TutorModeConfig[] = [
  {
    id: 'free_conversation',
    labelEn: 'Free Conversation',
    labelFr: 'Discussion Libre',
    icon: 'forum',
    taglineEn: 'Speak naturally about any topic you enjoy.',
    starterPromptLow: 'Hello! I am Professor Arthur Sterling. What did you enjoy doing this week?',
    starterPromptMid: 'Good to see you! What topic, book, or passion has caught your attention lately?',
    starterPromptHigh: 'Welcome! Let us have a thoughtful conversation—what global issue or cultural idea fascinates you right now?',
    suggestedPrompts: {
      low: [
        'Today I went to school and played basketball with friends.',
        'Can you ask me three easy questions about my hobbies?',
        'Please explain in French how to talk about yesterday.'
      ],
      mid: [
        'I recently watched a fascinating documentary and want to discuss it.',
        'Could you give me an example using "even though" naturally?',
        'What idioms do British speakers use in everyday chats?'
      ],
      high: [
        'I would like to explore how technology reshapes our attention span.',
        'Challenge my vocabulary with C1-level nuances during this chat.',
        'Could you rephrase my ideas in a more idiomatic register?'
      ]
    }
  },
  {
    id: 'school_english',
    labelEn: 'School English Practice',
    labelFr: 'Programme Scolaire',
    icon: 'school',
    taglineEn: 'Target class tenses, grammar, and oral fluency.',
    starterPromptLow: 'Welcome to class practice! Shall we review Present Simple vs Present Continuous, or tell me about your favourite school subject?',
    starterPromptMid: 'Let us sharpen your school English! Pick a tricky tense (Present Perfect or Conditionals) or summarize what you studied this week.',
    starterPromptHigh: 'Ready for Lycée mastery! Would you like to work on Bac oral synthesis, passive nuance, or essay transitions today?',
    suggestedPrompts: {
      low: [
        'My favourite subject is history because the teacher is kind.',
        'When do I use "do" vs "does" in a question?',
        'Give me a short sentence with an irregular past verb to practice.'
      ],
      mid: [
        'Explain the difference between "for" and "since" with examples.',
        'Check my sentence: "Since three years I learn English at school."',
        'Can we practice talking about a cultural axis for class?'
      ],
      high: [
        'How can I introduce a Bac oral presentation smoothly?',
        'Test me on inversion and mixed conditionals in formal English.',
        'Can you check my thesis statement on citizenship and virtual worlds?'
      ]
    }
  },
  {
    id: 'everyday_english',
    labelEn: 'Everyday English',
    labelFr: 'Vie Quotidienne',
    icon: 'coffee',
    taglineEn: 'Daily routines, errands, plans, and polite small talk.',
    starterPromptLow: 'Good morning! Imagine we meet at the neighbourhood café—how are you doing today and what are your plans?',
    starterPromptMid: 'Let us practice authentic daily English! Tell me about a typical Saturday morning or ask me about weekend plans.',
    starterPromptHigh: 'Let us dive into natural spoken routines—how do you wind down after a demanding week, and how would you express that idiomatically?',
    suggestedPrompts: {
      low: [
        'Usually I wake up at seven and eat toast before school.',
        'How do I politely ask someone to repeat something?',
        'What is a natural way to invite a friend to the cinema?'
      ],
      mid: [
        'I have been super busy lately, so I barely had time to relax.',
        'Give me three natural phrasal verbs for daily routines.',
        'Let us roleplay chatting with an English host family at breakfast.'
      ],
      high: [
        'I tend to juggle multiple commitments before catching a breather.',
        'What subtle tone shifts separate casual from polite everyday requests?',
        'Teach me nuanced phrasal verbs native speakers use at home.'
      ]
    }
  },
  {
    id: 'travel_english',
    labelEn: 'Travel English',
    labelFr: 'Voyage & Aéroport',
    icon: 'flight_takeoff',
    taglineEn: 'Airports, hotels, directions, and unexpected hiccups.',
    starterPromptLow: 'Welcome to London Heathrow! Imagine I am at the information desk—where do you need to go first?',
    starterPromptMid: 'Welcome to Paddington Station! Your train to Oxford has just been delayed—how will you ask for help and alternative options?',
    starterPromptHigh: 'Imagine your connecting flight was cancelled while checking in for a conference in Edinburgh. Handle the rebooking politely and firmly.',
    suggestedPrompts: {
      low: [
        'Excuse me, where is the platform for the train to Oxford?',
        'I have a reservation for two nights under my name.',
        'Can you speak a bit slower, please? How much is a return ticket?'
      ],
      mid: [
        'My luggage has not arrived on the belt yet—who should I talk to?',
        'Could you recommend a quiet museum within walking distance?',
        'Ask me a realistic hotel check-in problem to solve.'
      ],
      high: [
        'I would appreciate being accommodated on the earliest alternative flight.',
        'Could we verify whether my travel voucher covers overnight lodging?',
        'Roleplay a polite negotiation over an unexpected hotel room upgrade.'
      ]
    }
  },
  {
    id: 'restaurant_english',
    labelEn: 'Restaurant English',
    labelFr: 'Restaurant & Gastronomie',
    icon: 'restaurant',
    taglineEn: 'Ordering dishes, allergies, recommendations, and the bill.',
    starterPromptLow: 'Good evening and welcome to The Crown Bistro! Here is your menu—would you like something to drink first?',
    starterPromptMid: 'Good evening! I am your waiter tonight at our London bistro. Do you have any dietary preferences before I recommend today’s specials?',
    starterPromptHigh: 'Welcome to our Oxford tasting room! Feel free to inquire about provenance, allergens, or pairing before placing your order.',
    suggestedPrompts: {
      low: [
        'Could I have a glass of still water and the chicken salad, please?',
        'What is today’s soup? Is it spicy?',
        'Excuse me, could we have the bill, please?'
      ],
      mid: [
        'I am allergic to nuts—could you tell me which starter is safest?',
        'What do you recommend between the salmon and the vegetarian risotto?',
        'Politely mention that my dish arrived slightly cold.'
      ],
      high: [
        'Could you elaborate on how the seasonal catch is prepared tonight?',
        'We would love to split the bill evenly once dessert is cleared.',
        'Give me refined phrases for complimenting a chef or sommelier.'
      ]
    }
  },
  {
    id: 'job_interview',
    labelEn: 'Job Interview',
    labelFr: 'Entretien Professionnel',
    icon: 'work',
    taglineEn: 'Strengths, motivation, STAR stories, and smart questions.',
    starterPromptLow: 'Hello and thank you for coming! To begin, please tell me a little bit about yourself and why you like working with people.',
    starterPromptMid: 'Welcome to the interview! Could you introduce yourself briefly and share one strength that helps you work well in a team?',
    starterPromptHigh: 'Thank you for joining our panel today. Walk us through a challenging project you led and what measurable impact it delivered.',
    suggestedPrompts: {
      low: [
        'Hello! I am a motivated student who enjoys learning new skills.',
        'How do I describe my strengths without sounding arrogant?',
        'Ask me a beginner interview question about teamwork.'
      ],
      mid: [
        'My main strength is organization, and I handle deadlines calmly.',
        'How do I structure a STAR answer for an internship interview?',
        'What smart question should I ask the interviewer at the end?'
      ],
      high: [
        'When our team faced a tight deadline, I streamlined our workflow.',
        'How can I frame a past weakness constructively at C1 level?',
        'Run a realistic 3-question mock interview for an international role.'
      ]
    }
  },
  {
    id: 'debate_argumentation',
    labelEn: 'Debate & Argumentation',
    labelFr: 'Débat & Rhétorique',
    icon: 'balance',
    taglineEn: 'Defend viewpoints, nuance counter-arguments, and persuade.',
    starterPromptLow: 'Let us practice sharing opinions! Do you think teenagers spend too much time on phones, and why?',
    starterPromptMid: 'Let us debate respectfully! Topic: Should school uniforms be mandatory in high schools? Share your opening stance.',
    starterPromptHigh: 'Motion for today’s Oxford Union practice: "Artificial intelligence will empower human creativity rather than diminish it." Where do you stand?',
    suggestedPrompts: {
      low: [
        'In my opinion, phones are useful for school, but breaks are important.',
        'Give me easy linkers to agree or disagree politely.',
        'Help me give two simple reasons for my opinion.'
      ],
      mid: [
        'On the one hand uniforms reduce pressure; on the other hand they limit style.',
        'Give me stronger transitions than "but" and "also".',
        'Play devil’s advocate against my argument so I can respond.'
      ],
      high: [
        'While efficiency rises, uncritical reliance may erode original thought.',
        'Teach me diplomatic hedging phrases for Oxford-style rebuttal.',
        'Challenge my counter-argument with a sharper nuance.'
      ]
    }
  },
  {
    id: 'exam_preparation',
    labelEn: 'Exam Preparation',
    labelFr: 'Prépa Brevet / Bac',
    icon: 'workspace_premium',
    taglineEn: 'Oral exams, document synthesis, and scoring criteria.',
    starterPromptLow: 'Welcome to Exam Studio! Let us practice presenting a personal project or describing a picture clearly for your oral test.',
    starterPromptMid: 'Let us train for your upcoming oral evaluation! Choose an exam axis (Identities, Citizenship, or Innovation) and state your key idea.',
    starterPromptHigh: 'Welcome to Bac / Cambridge C1 readiness! Present a structured 3-sentence response linking cultural context to a clear thesis.',
    suggestedPrompts: {
      low: [
        'Let me describe my favourite city in three clear sentences.',
        'What linking words earn bonus points at Brevet oral?',
        'Give me a timed-style question to answer in English.'
      ],
      mid: [
        'How can I connect "Art & Power" to a historical example in English?',
        'Check my short introduction for a Lycée oral assessment.',
        'Ask me an examiner follow-up question to test my reaction.'
      ],
      high: [
        'Does my synthesis balance historical perspective and modern stakes?',
        'Correct any informal phrasing so my register matches C1 criteria.',
        'Simulate a demanding examiner cross-question now.'
      ]
    }
  },
  {
    id: 'storytelling',
    labelEn: 'Storytelling',
    labelFr: 'Art du Récit',
    icon: 'auto_stories',
    taglineEn: 'Weave vivid stories using narrative tenses and suspense.',
    starterPromptLow: 'Story time! Start a short tale with: "Yesterday evening, I opened an old wooden box and found..." — add two sentences!',
    starterPromptMid: 'Let us co-write a vivid story! Set the scene: "While rain tapped against the train window, a stranger handed me an envelope..."',
    starterPromptHigh: 'Welcome to Oxford Creative Narrative! Craft the opening twist of a mystery set in a fog-draped library using rich sensory detail.',
    suggestedPrompts: {
      low: [
        'Inside the box there was a silver key and a small map.',
        'What past verbs make a story more exciting?',
        'Continue the story with me sentence by sentence!'
      ],
      mid: [
        'While I was reading the note, the lights suddenly flickered out.',
        'Help me replace "very scary" and "very big" with vivid adjectives.',
        'Check my mix of Past Simple and Past Continuous in this paragraph.'
      ],
      high: [
        'Having deciphered the margin notes, she realized the archive had moved.',
        'Suggest sensory metaphors to heighten atmospheric tension.',
        'Co-build a dialogue-driven twist using inverted conditionals.'
      ]
    }
  }
];

export function getCefrBand(cefr: CEFRLevel): 'low' | 'mid' | 'high' {
  if (cefr === 'A1' || cefr === 'A2') return 'low';
  if (cefr === 'B1' || cefr === 'B2') return 'mid';
  return 'high';
}

export function getTutorModeConfig(mode: TutorConversationMode): TutorModeConfig {
  return TUTOR_CONVERSATION_MODES.find((m) => m.id === mode) || TUTOR_CONVERSATION_MODES[0];
}

export function buildModeStarterText(
  mode: TutorConversationMode,
  cefr: CEFRLevel,
  gradeShortLabel: string,
  weakSkillsLabels: string[],
  recurringMistakesCount: number
): { replyEn: string; followUpQuestion: string; suggestedReplies: string[]; praiseNote: string } {
  const cfg = getTutorModeConfig(mode);
  const band = getCefrBand(cefr);
  const followUpQuestion =
    band === 'low' ? cfg.starterPromptLow : band === 'mid' ? cfg.starterPromptMid : cfg.starterPromptHigh;

  const personalCue =
    recurringMistakesCount > 0
      ? `I also keep your ${recurringMistakesCount} tracked focus point${recurringMistakesCount > 1 ? 's' : ''} in mind so we reinforce them gently.`
      : `Your learning profile (${gradeShortLabel} · ${cefr}) highlights ${weakSkillsLabels.join(' & ') || 'all-around fluency'} as our target focus.`;

  return {
    replyEn: `Welcome to ${cfg.labelEn}! ${personalCue} Speak naturally by microphone or type below—I will let you finish completely before offering encouraging feedback.`,
    followUpQuestion,
    suggestedReplies: cfg.suggestedPrompts[band],
    praiseNote: `Calibrated to ${gradeShortLabel} (${cefr}) · English immersion default (French help available anytime)`
  };
}
