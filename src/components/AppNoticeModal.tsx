import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import imgOverview from '../assets/images/notice_app_overview_map_1795214324278.jpg';
import imgCity from '../assets/images/notice_city_map_3d_1795214324394.jpg';
import imgStudio from '../assets/images/notice_speaking_dictation_studio_1795214325581.jpg';
import imgCurriculum from '../assets/images/notice_curriculum_flashcards_1795214325385.jpg';
import imgDashboard from '../assets/images/notice_dashboard_arcade_rewards_1795214325447.jpg';
import { GlassSlidingCapsule } from './GlassSlidingCapsule';

interface NoticeChapter {
  id: string;
  order: string;
  shortTitle: string;
  title: string;
  subtitle: string;
  icon: string;
  imageSrc: string;
  imageAlt: string;
  imageHighlights: Array<{
    badge: string;
    label: string;
    detail: string;
  }>;
  quickSteps: Array<{
    step: string;
    action: string;
    result: string;
  }>;
  proTip: string;
}

const NOTICE_CHAPTERS: NoticeChapter[] = [
  {
    id: 'overview',
    order: '01',
    shortTitle: 'Vue Générale',
    title: "Comprendre l'application en 30 secondes",
    subtitle:
      "Cinq espaces complémentaires reliés automatiquement pour maîtriser l'anglais de la 6e jusqu'au niveau C1/C2.",
    icon: 'hub',
    imageSrc: imgOverview,
    imageAlt: "Schéma visuel de l'écosystème English Boost MSZ reliant Accueil, Cité 3D, Cours, Studio Vocal et Dashboard",
    imageHighlights: [
      {
        badge: 'A',
        label: 'Accueil & Défi Quotidien',
        detail: "Lancez votre session du jour, écoutez les folios audio et consultez votre série (Streak)."
      },
      {
        badge: 'B',
        label: 'Cité 3D & Cursus Scolaire',
        detail: 'Avancez niveau par niveau (600 niveaux, 6 000 chapitres) de la 6e à la Terminale.'
      },
      {
        badge: 'C',
        label: 'Studio Vocal & Tableau de Bord',
        detail: 'Enregistrez votre voix en acoustique 3D, suivez vos courbes XP et exportez votre bilan PDF.'
      }
    ],
    quickSteps: [
      {
        step: '1. Naviguer sans effort',
        action: 'Utilisez la barre de navigation en bas (ou en haut sur grand écran) pour passer entre Accueil, Cité, Cursus, Jeux, Pratique et Dashboard.',
        result: 'Chaque activité crédite automatiquement vos XP (100 XP = +1 niveau) et vos pièces MSZ.'
      },
      {
        step: '2. Étudier même hors connexion',
        action: 'Vos dictées, flashcards et chapitres restent enregistrés localement via IndexedDB.',
        result: 'Dès que le réseau revient, Cloud Firestore synchronise vos progrès automatiquement.'
      },
      {
        step: '3. Garder le rythme',
        action: "Ajustez votre objectif quotidien (20, 30 ou 45 min) depuis le Dashboard et suivez la jauge d'assiduité.",
        result: 'Vous progressez sans surcharge grâce à des sessions courtes et ciblées.'
      }
    ],
    proTip:
      "Pour démarrer tout de suite : ouvrez l'onglet Cité pour suivre le parcours guidé niveau par niveau, ou l'onglet Pratique pour une séance rapide de 5 minutes."
  },
  {
    id: 'city',
    order: '02',
    shortTitle: 'Cité 3D (600 Niv.)',
    title: 'La Cité 3D : 600 Niveaux & 6 000 Chapitres',
    subtitle:
      'Une maquette architecturale interactive où chaque monument débloque le suivant sur le boulevard doré.',
    icon: 'location_city',
    imageSrc: imgCity,
    imageAlt: 'Maquette 3D isométrique de la Cité avec boulevard illuminé, anneaux de progression et rivière',
    imageHighlights: [
      {
        badge: '1',
        label: 'Socles & Anneaux de Progrès',
        detail: "L'anneau autour de chaque monument se remplit de 0 à 10 chapitres. Une fois à 10/10, il passe au vert émeraude."
      },
      {
        badge: '2',
        label: 'Boulevard Doré Illuminé',
        detail: "Le tracé d'or relie toutes vos étapes débloquées jusqu'au monument actif (« Étape active »)."
      },
      {
        badge: '3',
        label: 'Diorama 3D ou Plan Zénithal',
        detail: 'Basculez en 1 clic entre la vue maquette inclinée 3D (avec reflets au survol) et la vue carte plate.'
      }
    ],
    quickSteps: [
      {
        step: '1. Filtrer sans encombrer',
        action: 'Choisissez « Groupes de 50 (1–600) » ou « Par Classes (6e–Term.) » pour n’afficher que la plage de niveaux qui vous intéresse.',
        result: 'Vous retrouvez immédiatement votre secteur actif avec le bouton « Centrer ».'
      },
      {
        step: '2. Lancer un monument',
        action: 'Cliquez sur votre niveau actif (en or) pour ouvrir ses 10 chapitres audio et questions mélangées aléatoirement.',
        result: 'Chaque chapitre réussi rapporte des XP ; valider les 10/10 trace la route vers le niveau suivant.'
      },
      {
        step: '3. Explorer aussi les Mini-Jeux',
        action: "Dans l'onglet Jeux, passez en vue Plan / City Map pour parcourir les 21 épreuves d'arcade dans le même style 3D.",
        result: 'Un premier clic inspecte les règles du jeu ; un second clic lance la partie.'
      }
    ],
    proTip:
      "Besoin d'aller vite ? Cliquez sur le bouton doré « Jouer Niveau X » tout en haut de la Cité pour ouvrir directement votre prochaine épreuve."
  },
  {
    id: 'studio',
    order: '03',
    shortTitle: 'Studio & Dictée',
    title: "Studio d'Élocution 3D, Dictée & Duel Vocal",
    subtitle:
      'Travaillez votre accent britannique ou américain avec comparaison acoustique temps réel et environnement audio 3D.',
    icon: 'graphic_eq',
    imageSrc: imgStudio,
    imageAlt: "Studio d'enregistrement vocal avec microphone laiton, double courbe acoustique or et cyan et ondes spatiales 3D",
    imageHighlights: [
      {
        badge: '1',
        label: 'Courbe Or vs Courbe Cyan',
        detail: 'La courbe dorée montre la prosodie native (Oxford RP UK ou GenAm US) ; la courbe cyan affiche votre propre voix.'
      },
      {
        badge: '2',
        label: 'Acoustique Spatiale 3D',
        detail: 'Choisissez Bibliothèque Oxford, Cabine BBC ou Amphithéâtre : un halo sonore 3D discret réagit à votre micro sans jamais couvrir votre voix.'
      },
      {
        badge: '3',
        label: 'Duel Spectral 60 FPS',
        detail: 'Défiez le modèle natif en temps réel sur les formants des voyelles et l’intonation pour gagner des pièces MSZ.'
      }
    ],
    quickSteps: [
      {
        step: '1. Écouter puis enregistrer',
        action: 'Choisissez l’accent UK ou US, écoutez la phrase modèle, puis appuyez sur le bouton micro doré.',
        result: 'La reconnaissance vocale transcrit vos mots en direct et corrige immédiatement orthographe et phonétique.'
      },
      {
        step: '2. Activer le Mode Focus en Dictée',
        action: 'Dans la fenêtre de Dictée cadencée, cliquez sur le bouton « Focus » pour masquer les éléments secondaires.',
        result: "Votre attention reste à 100 % sur l'audio et votre zone de rédaction."
      },
      {
        step: '3. Valider et enregistrer le score',
        action: 'Comparez votre diagnostic et votre onde sonore, puis cliquez sur « Valider » pour sauvegarder votre tentative.',
        result: 'Votre score est archivé dans votre historique de progression.'
      }
    ],
    proTip:
      'Utilisez un casque audio pour profiter pleinement de la spatialisation 3D du studio (carrousel gauche/droite, compte à rebours spatial 3-2-1 et ambiance feutrée).'
  },
  {
    id: 'curriculum',
    order: '04',
    shortTitle: 'Cours & Double-Clic',
    title: 'Cours 6e–Terminale, Double-Clic IPA & Flashcards',
    subtitle:
      'Comprenez instantanément chaque mot inconnu sans quitter votre leçon et mémorisez durablement.',
    icon: 'auto_stories',
    imageSrc: imgCurriculum,
    imageAlt: 'Manuel scolaire anglais ouvert avec infobulle phonétique IPA et cartes de révision espacée',
    imageHighlights: [
      {
        badge: '1',
        label: 'Double-Clic sur n’importe quel mot',
        detail: 'Faites un double-clic sur un mot anglais dans les leçons ou exercices : une infobulle affiche sa traduction et sa phonétique IPA.'
      },
      {
        badge: '2',
        label: 'Leçons Audio & Exercices Guidés',
        detail: 'Chaque classe propose des phrases modèles, grammaire contextualisée, structuration de phrases et analyseur rhétorique.'
      },
      {
        badge: '3',
        label: 'Flashcards Mémoire SM-2',
        detail: 'Notez votre facilité de rappel pour que l’algorithme recalcule automatiquement la prochaine révision.'
      }
    ],
    quickSteps: [
      {
        step: '1. Sélectionner sa classe',
        action: 'Ouvrez l’onglet Cursus (de la 6e à la Terminale) ou utilisez la barre de recherche globale en haut.',
        result: 'Vous accédez directement aux leçons adaptées à votre niveau scolaire ou CECRL.'
      },
      {
        step: '2. Débloquer un mot par double-clic',
        action: 'Double-cliquez sur un mot anglais dans le texte de la leçon, une phrase modèle ou l’analyseur.',
        result: 'La traduction française et la transcription IPA locale s’affichent immédiatement sans casser votre lecture.'
      },
      {
        step: '3. Réviser en cartes espacées',
        action: 'Ouvrez « Flashcards » depuis Accueil ou Pratique et retournez les cartes avec écoute vocale intégrée.',
        result: 'Les mots difficiles reviennent plus souvent ; les mots acquis s’espacent.'
      }
    ],
    proTip:
      'Vous pouvez mettre une leçon en favori ou la lier directement au Studio Vocal grâce au bouton « Phrasé de la Leçon ».'
  },
  {
    id: 'dashboard',
    order: '05',
    shortTitle: 'Dashboard & PDF',
    title: 'Courbes XP, Annotations, Export PDF & Boutique MSZ',
    subtitle:
      'Visualisez vos progrès sur 7 et 30 jours, annotez vos moments clés et téléchargez votre bilan officiel.',
    icon: 'insights',
    imageSrc: imgDashboard,
    imageAlt: 'Tablette affichant une courbe de progression XP dorée, rapport PDF scellé, flamme 7 jours et médailles MSZ',
    imageHighlights: [
      {
        badge: '1',
        label: 'Graphiques Recharts & Annotations',
        detail: 'Passez de la vue 7 jours au suivi 30 jours et cliquez sur un point du graphique pour y attacher une note personnelle.'
      },
      {
        badge: '2',
        label: 'Export Rapport PDF en 1 clic',
        detail: 'Le bouton « Rapport PDF » en haut du Dashboard génère un document récapitulatif complet prêt à conserver ou imprimer.'
      },
      {
        badge: '3',
        label: 'Pièces MSZ & Ligue d’Oxford',
        detail: 'Cumulez des pièces dans les 21 mini-jeux et collectionnez cartes 3D et thèmes depuis votre tableau de bord.'
      }
    ],
    quickSteps: [
      {
        step: '1. Suivre vos indicateurs clés',
        action: 'Consultez en haut du Dashboard votre série de jours, vos XP hebdomadaires, votre temps du jour et votre précision moyenne.',
        result: 'Les sous-onglets « Vue Complète », « Objectifs », « Courbes 7 Jours » et « Cursus & Boutique » organisent tout sans surcharge.'
      },
      {
        step: '2. Annoter votre courbe de progrès',
        action: "Descendez vers l'historique de progression et sélectionnez un point du graphique pour écrire un repère (ex. : « Examen blanc B2 »).",
        result: "Vos jalons personnels apparaissent durablement sur l'axe chronologique."
      },
      {
        step: '3. Télécharger votre bilan PDF',
        action: 'Cliquez sur « Rapport PDF » en haut à droite du Dashboard (ou dans la section Historique).',
        result: 'Un rapport multi-pages synthétisant niveaux, scores et annotations est téléchargé immédiatement.'
      }
    ],
    proTip:
      'Utilisez le bouton « Synchroniser Maintenant » en bas du Dashboard si vous venez de travailler hors-ligne et souhaitez forcer l’envoi Cloud immédiat.'
  }
];

interface AppNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AppNoticeModal: React.FC<AppNoticeModalProps> = ({ isOpen, onClose }) => {
  const shouldReduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'visual' | 'steps'>('visual');
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const chapterNavRef = useRef<HTMLElement | null>(null);

  if (!isOpen) return null;

  const chapter = NOTICE_CHAPTERS[activeIndex] || NOTICE_CHAPTERS[0];
  const hasImageFailed = Boolean(failedImages[chapter.id]);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + NOTICE_CHAPTERS.length) % NOTICE_CHAPTERS.length);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % NOTICE_CHAPTERS.length);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="notice-modal-title"
    >
      <motion.div
        initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.98 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-5xl max-h-[92vh] rounded-3xl bg-[#0c1322] border border-[#f2ca50]/45 shadow-[0_28px_70px_-14px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden"
      >
        {/* Top Header */}
        <header className="px-5 py-4 sm:px-7 sm:py-5 bg-[#151b2b] border-b border-[#232a3a] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#f2ca50]/15 border border-[#f2ca50]/40 text-[#f2ca50] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-xl">menu_book</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs font-mono text-[#d4c78f]">
                <span className="text-[#f2ca50] font-bold">Notice d&apos;Utilisation</span>
                <span aria-hidden="true">·</span>
                <span>Prise en main immédiate</span>
              </div>
              <h2
                id="notice-modal-title"
                className="font-serif text-lg sm:text-xl font-bold text-[#dce2f8] leading-tight truncate"
              >
                Guide Visuel &amp; Fonctionnement Complet
              </h2>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0">
            {/* Switch between Image-First Visual Mode vs Detailed Step Mode */}
            <div
              className="inline-flex items-center gap-1 p-1 rounded-xl bg-[#070e1d] border border-[#232a3a]"
              role="group"
              aria-label="Mode de lecture de la notice"
            >
              <button
                type="button"
                onClick={() => setViewMode('visual')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 flex items-center gap-1.5 transition-colors cursor-pointer ${
                  viewMode === 'visual'
                    ? 'bg-[#f2ca50] text-[#3c2f00] font-bold shadow-sm'
                    : 'text-[#d0c5af] hover:text-[#dce2f8]'
                }`}
              >
                <span className="material-symbols-outlined text-sm">image</span>
                <span>Par l&apos;Image</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('steps')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 flex items-center gap-1.5 transition-colors cursor-pointer ${
                  viewMode === 'steps'
                    ? 'bg-[#f2ca50] text-[#3c2f00] font-bold shadow-sm'
                    : 'text-[#d0c5af] hover:text-[#dce2f8]'
                }`}
              >
                <span className="material-symbols-outlined text-sm">format_list_numbered</span>
                <span>Étapes Claires</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-[#191f2f] border border-[#232a3a] text-[#d0c5af] hover:text-[#f2ca50] hover:border-[#f2ca50]/50 flex items-center justify-center shrink-0 cursor-pointer transition-colors"
              aria-label="Fermer la notice"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
        </header>

        {/* Chapter Quick Selector Bar */}
        <nav
          ref={chapterNavRef}
          aria-label="Chapitres de la notice"
          className="relative px-4 py-2.5 sm:px-7 bg-[#191f2f] border-b border-[#232a3a] flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0"
        >
          <GlassSlidingCapsule containerRef={chapterNavRef} activeKey={chapter.id} />
          {NOTICE_CHAPTERS.map((ch, idx) => {
            const isActive = idx === activeIndex;
            return (
              <button
                key={ch.id}
                type="button"
                data-capsule-key={ch.id}
                onClick={() => setActiveIndex(idx)}
                className={`relative z-10 px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 flex items-center gap-1.5 border transition-colors cursor-pointer ${
                  isActive
                    ? 'glass-capsule-active-text border-transparent font-bold'
                    : 'bg-[#151b2b]/80 border-[#232a3a] text-[#d0c5af] hover:text-[#dce2f8] hover:border-[#f2ca50]/45'
                }`}
              >
                <span className="font-mono tabular-nums text-[11px] opacity-80">{ch.order}.</span>
                <span className="material-symbols-outlined text-sm">{ch.icon}</span>
                <span>{ch.shortTitle}</span>
              </button>
            );
          })}
        </nav>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-7">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${chapter.id}-${viewMode}`}
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="flex flex-col gap-5"
            >
              {/* Chapter Title & One-Line Purpose */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-xs font-mono text-[#d4c78f] tabular-nums">
                  <span>Module {chapter.order} sur 05</span>
                  <span aria-hidden="true">·</span>
                  <span>Lecture directe</span>
                </div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#dce2f8] text-balance">
                  {chapter.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#d0c5af] leading-relaxed max-w-3xl">
                  {chapter.subtitle}
                </p>
              </div>

              {viewMode === 'visual' ? (
                /* IMAGE-FIRST VISUAL MODE: Large Illustration + Instant Visual Callouts */
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                  {/* Prominent High-Fidelity Visual Frame (7 cols on desktop) */}
                  <div className="lg:col-span-7 relative rounded-2xl overflow-hidden bg-[#070e1d] border border-[#f2ca50]/35 shadow-xl flex flex-col justify-between min-h-[240px]">
                    {!hasImageFailed ? (
                      <div className="relative w-full h-full min-h-[240px] sm:min-h-[320px]">
                        <img
                          src={chapter.imageSrc}
                          alt={chapter.imageAlt}
                          referrerPolicy="no-referrer"
                          onError={() =>
                            setFailedImages((prev) => ({ ...prev, [chapter.id]: true }))
                          }
                          className="w-full h-full object-cover block"
                        />
                        <div
                          className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/90 via-black/55 to-transparent pointer-events-none"
                          aria-hidden="true"
                        />
                        <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between gap-2 text-xs text-white">
                          <span className="font-serif font-semibold truncate">
                            Aperçu visuel · {chapter.shortTitle}
                          </span>
                          <button
                            type="button"
                            onClick={() => setViewMode('steps')}
                            className="px-2.5 py-1 rounded-lg bg-black/75 border border-[#f2ca50]/60 text-[#f2ca50] hover:bg-black/90 text-[11px] font-semibold whitespace-nowrap shrink-0 cursor-pointer"
                          >
                            Voir les étapes →
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Zero-Broken-Image Styled Fallback Container */
                      <div className="w-full h-full min-h-[260px] bg-gradient-to-br from-[#151b2b] via-[#0c1322] to-[#070e1d] p-6 flex flex-col items-center justify-center text-center gap-3">
                        <div className="w-16 h-16 rounded-2xl bg-[#f2ca50]/15 border border-[#f2ca50]/45 text-[#f2ca50] flex items-center justify-center">
                          <span className="material-symbols-outlined text-4xl">{chapter.icon}</span>
                        </div>
                        <p className="font-serif text-lg font-bold text-[#dce2f8]">{chapter.title}</p>
                        <p className="text-xs text-[#d0c5af] max-w-md">{chapter.imageAlt}</p>
                      </div>
                    )}
                  </div>

                  {/* Right Side: Visual Key Repères (5 cols on desktop) */}
                  <div className="lg:col-span-5 flex flex-col justify-between gap-3">
                    <div className="flex flex-col gap-2.5">
                      <span className="text-xs font-mono font-bold text-[#f2ca50]">
                        Ce que montre l&apos;image en un coup d&apos;œil :
                      </span>

                      {chapter.imageHighlights.map((hl) => (
                        <div
                          key={hl.badge}
                          className="p-3.5 rounded-2xl bg-[#151b2b] border border-[#232a3a] flex items-start gap-3"
                        >
                          <span className="w-7 h-7 rounded-lg bg-[#f2ca50] text-[#3c2f00] font-mono text-xs font-black flex items-center justify-center shrink-0">
                            {hl.badge}
                          </span>
                          <div className="flex flex-col gap-0.5 min-w-0">
                            <h4 className="font-serif text-sm font-bold text-[#dce2f8]">
                              {hl.label}
                            </h4>
                            <p className="text-xs text-[#d0c5af] leading-relaxed">{hl.detail}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Pro Tip Summary Box */}
                    <div className="p-3.5 rounded-2xl bg-[#191f2f] border border-[#f2ca50]/35 flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-lg text-[#f2ca50] shrink-0">
                        tips_and_updates
                      </span>
                      <p className="text-xs text-[#dce2f8] leading-relaxed">
                        <strong className="text-[#f2ca50]">Astuce rapide : </strong>
                        {chapter.proTip}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                /* DETAILED STEPS MODE: Clear How-It-Works Walkthrough + Side Visual Thumbnail */
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                  <div className="lg:col-span-8 flex flex-col gap-3">
                    {chapter.quickSteps.map((st, sIdx) => (
                      <div
                        key={sIdx}
                        className="p-4 rounded-2xl bg-[#151b2b] border border-[#232a3a] flex flex-col gap-1.5"
                      >
                        <h4 className="font-serif text-base font-bold text-[#f2ca50]">
                          {st.step}
                        </h4>
                        <p className="text-xs sm:text-sm text-[#dce2f8] leading-relaxed">
                          <strong className="text-[#d4c78f]">Action : </strong>
                          {st.action}
                        </p>
                        <p className="text-xs text-[#d0c5af] leading-relaxed">
                          <strong className="text-emerald-400">Résultat : </strong>
                          {st.result}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Side Visual Reference Thumbnail */}
                  <div className="lg:col-span-4 flex flex-col gap-3">
                    <div className="rounded-2xl overflow-hidden bg-[#070e1d] border border-[#232a3a]">
                      {!hasImageFailed ? (
                        <img
                          src={chapter.imageSrc}
                          alt={chapter.imageAlt}
                          referrerPolicy="no-referrer"
                          onError={() =>
                            setFailedImages((prev) => ({ ...prev, [chapter.id]: true }))
                          }
                          className="w-full h-44 object-cover block"
                        />
                      ) : (
                        <div className="w-full h-40 flex items-center justify-center text-[#f2ca50]">
                          <span className="material-symbols-outlined text-4xl">{chapter.icon}</span>
                        </div>
                      )}
                      <div className="p-3 border-t border-[#232a3a] flex items-center justify-between gap-2">
                        <span className="text-xs text-[#d0c5af] truncate">
                          Schéma · {chapter.shortTitle}
                        </span>
                        <button
                          type="button"
                          onClick={() => setViewMode('visual')}
                          className="text-xs font-semibold text-[#f2ca50] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          Agrandir l&apos;image
                        </button>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[#191f2f] border border-[#f2ca50]/35 flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-lg text-[#f2ca50] shrink-0">
                        lightbulb
                      </span>
                      <p className="text-xs text-[#dce2f8] leading-relaxed">{chapter.proTip}</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Navigation Controls */}
        <footer className="px-5 py-3.5 sm:px-7 bg-[#151b2b] border-t border-[#232a3a] flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={handlePrev}
            className="px-3.5 py-2 rounded-xl bg-[#191f2f] hover:bg-[#232a3a] border border-[#232a3a] text-xs font-semibold text-[#dce2f8] whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            <span>Précédent</span>
          </button>

          <span className="text-xs font-mono tabular-nums text-[#d4c78f]">
            {activeIndex + 1} / {NOTICE_CHAPTERS.length}
          </span>

          {activeIndex < NOTICE_CHAPTERS.length - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-4 py-2 rounded-xl bg-[#f2ca50] hover:bg-[#ffe088] text-[#3c2f00] text-xs font-bold whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer transition-colors shadow-md"
            >
              <span>Suivant</span>
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#f2ca50] hover:bg-[#ffe088] text-[#3c2f00] text-xs font-bold whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer transition-colors shadow-md"
            >
              <span className="material-symbols-outlined text-base">check</span>
              <span>J&apos;ai compris</span>
            </button>
          )}
        </footer>
      </motion.div>
    </div>
  );
};
