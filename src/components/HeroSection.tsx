import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HERO_PRESETS, type HeroPreset } from '../data/curriculum';

interface HeroSectionProps {
  currentPhotoUrl: string;
  onPhotoChange: (newUrl: string) => void;
  onCustomUpload: (file: File) => Promise<string>;
}

type RadianceMood = 'solaire' | 'clarte' | 'imperiale';

export type MonogramFont = 'playfair' | 'cinzel' | 'jakarta' | 'alex' | 'mono';

export interface FontOption {
  id: MonogramFont;
  name: string;
  cssFamily: string;
  className: string;
  sample: string;
}

export const MONOGRAM_FONTS: FontOption[] = [
  {
    id: 'playfair',
    name: 'Oxford Playfair',
    cssFamily: "'Playfair Display', serif",
    className: 'font-serif font-black',
    sample: 'Serif Royal'
  },
  {
    id: 'cinzel',
    name: 'Cinzel Impérial',
    cssFamily: "'Cinzel', serif",
    className: 'font-serif font-bold tracking-[0.12em]',
    sample: 'Romain Antique'
  },
  {
    id: 'jakarta',
    name: 'Jakarta Sans',
    cssFamily: "'Plus Jakarta Sans', sans-serif",
    className: 'font-sans font-black tracking-tight',
    sample: 'Monumental Bold'
  },
  {
    id: 'alex',
    name: 'Alex Cursive',
    cssFamily: "'Alex Brush', cursive",
    className: 'font-normal tracking-normal italic',
    sample: 'Calligraphie'
  },
  {
    id: 'mono',
    name: 'Space Mono',
    cssFamily: "'Space Mono', monospace",
    className: 'font-mono font-bold tracking-widest',
    sample: 'Horloger'
  }
];

export const HeroSection: React.FC<HeroSectionProps> = ({
  currentPhotoUrl,
  onPhotoChange,
  onCustomUpload
}) => {
  const [activePresetIdx, setActivePresetIdx] = useState<number>(0);
  const [manualZoom, setManualZoom] = useState<number>(1.0);
  const [scrollZoomFactor, setScrollZoomFactor] = useState<number>(1.0);
  const [isImmersionMode, setIsImmersionMode] = useState<boolean>(false);
  const [isCutoutMode, setIsCutoutMode] = useState<boolean>(true);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [radianceMood, setRadianceMood] = useState<RadianceMood>('solaire');

  // Interactive controls for letter M: resizing, arbitrary positioning, and font styling
  const [letterText, setLetterText] = useState<string>('M');
  const [letterSize, setLetterSize] = useState<number>(88);
  const [letterPosition, setLetterPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [selectedFont, setSelectedFont] = useState<MonogramFont>('playfair');
  const [isLetterStudioOpen, setIsLetterStudioOpen] = useState<boolean>(false);

  const currentFontObj = MONOGRAM_FONTS.find((f) => f.id === selectedFont) || MONOGRAM_FONTS[0];

  const handleIncreaseSize = () => setLetterSize((prev) => Math.min(180, prev + 8));
  const handleDecreaseSize = () => setLetterSize((prev) => Math.max(36, prev - 8));
  const handleResetLetterPosition = () => setLetterPosition({ x: 0, y: 0 });

  const heroWrapperRef = useRef<HTMLDivElement>(null);
  const heroImgRef = useRef<HTMLImageElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync active preset index with currentPhotoUrl (-1 when custom photo is active)
  useEffect(() => {
    const matchedIdx = HERO_PRESETS.findIndex((p) => p.url === currentPhotoUrl);
    setActivePresetIdx(matchedIdx);
  }, [currentPhotoUrl]);

  // Scroll listener for smooth progressive zoom using requestAnimationFrame
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY || window.pageYOffset;
          // When user scrolls down within top 450px, zoom expands proportionally
          if (scrollY >= 0 && scrollY < 450) {
            const factor = 1.0 + (scrollY * 0.0009);
            setScrollZoomFactor(factor);
          } else if (scrollY === 0) {
            setScrollZoomFactor(1.0);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Compute final combined scale
  const totalScale = Math.min(2.5, Math.max(1.0, manualZoom * scrollZoomFactor));

  const handlePresetSelect = (preset: HeroPreset, idx: number) => {
    setActivePresetIdx(idx);
    onPhotoChange(preset.url);
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Instant 0ms latency display with local object URL
    const instantUrl = URL.createObjectURL(file);
    onPhotoChange(instantUrl);
    setActivePresetIdx(-1);

    setIsUploading(true);
    try {
      // 2. Compress client-side and persist
      const persistedUrl = await onCustomUpload(file);
      if (persistedUrl && persistedUrl !== instantUrl) {
        onPhotoChange(persistedUrl);
      }
    } catch (err) {
      console.warn('Upload persistence error, preserving instant local preview', err);
      // Keep instantUrl active so the user photo is guaranteed visible
      onPhotoChange(instantUrl);
    } finally {
      setIsUploading(false);
      // Reset input value so re-selecting same file works every time
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  const handleResetZoom = () => {
    setManualZoom(1.0);
    setScrollZoomFactor(1.0);
  };

  // Dynamic filter for high vitality, rich color saturation and luminous radiance (no dark/murky desaturation)
  const getFilterStyle = (): string => {
    switch (radianceMood) {
      case 'clarte':
        return isImmersionMode
          ? 'contrast(1.10) brightness(1.08) saturate(1.22)'
          : 'contrast(1.08) brightness(1.04) saturate(1.18)';
      case 'imperiale':
        return isImmersionMode
          ? 'contrast(1.12) brightness(1.04) saturate(1.25) sepia(0.08)'
          : 'contrast(1.09) brightness(1.02) saturate(1.20) sepia(0.06)';
      case 'solaire':
      default:
        return isImmersionMode
          ? 'contrast(1.10) brightness(1.07) saturate(1.24) hue-rotate(-3deg)'
          : 'contrast(1.08) brightness(1.05) saturate(1.20) hue-rotate(-2deg)';
    }
  };

  return (
    <section className="relative w-full overflow-hidden px-4 sm:px-6 pt-3 pb-5" id="hero-section">
      {/* Radiant Multi-Layer Solar Aura - Vibrant, Warm, High-End */}
      <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[720px] max-w-full h-80 rounded-full bg-gradient-to-r from-amber-400/30 via-[#f2ca50]/35 to-yellow-300/25 blur-3xl pointer-events-none transition-all duration-700 animate-pulse" />
      <div className="absolute top-10 right-10 w-64 h-64 rounded-full bg-yellow-400/20 blur-2xl pointer-events-none" />

      {/* Hero Backing Stage with Jewel-Class Border & Luminous Presence */}
      <div
        className={`relative w-full rounded-2xl overflow-hidden bg-[#0c1424] border border-[#f2ca50]/50 shadow-[0_22px_60px_rgba(242,202,80,0.18),0_12px_35px_rgba(0,0,0,0.5)] transition-all duration-700 ease-out group ${
          isImmersionMode ? 'ring-2 ring-[#f2ca50] shadow-[0_28px_70px_rgba(242,202,80,0.35)]' : ''
        }`}
      >
        {/* Top Edge Luminous Gold Filament */}
        <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-transparent via-[#f2ca50] via-yellow-200 to-transparent shadow-[0_0_14px_rgba(242,202,80,0.95)] z-20" />

        {/* Dynamic Background Stage */}
        <div
          ref={heroWrapperRef}
          className={`relative w-full overflow-hidden transition-all duration-500 ease-out origin-center ${
            isImmersionMode ? 'h-[470px] sm:h-[530px]' : 'h-[340px] sm:h-[390px]'
          }`}
        >
          {/* Active Master Image - Luminous, Vibrant and Full of Life */}
          <img
            ref={heroImgRef}
            src={currentPhotoUrl}
            alt="Sanctuaire d'érudition Oxford et architecture victorienne"
            className="w-full h-full object-cover transition-transform duration-300 ease-out will-change-transform"
            style={{
              transform: `scale(${totalScale * (isImmersionMode ? 1.25 : 1.05)})`,
              filter: getFilterStyle()
            }}
            onError={() => {
              console.warn('Hero image failed to load, restoring default preset');
              onPhotoChange(HERO_PRESETS[0].url);
            }}
          />

          {/* Luminous Sunbeam & Warm Vitality Overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/18 via-transparent to-yellow-300/15 pointer-events-none mix-blend-screen" />

          {/* Gentle Typographic Contrast Scrim (light and luminous, never suffocating) */}
          <div
            className={`absolute inset-0 bg-gradient-to-t from-[#080d19]/80 via-[#080d19]/25 to-transparent transition-opacity duration-500 pointer-events-none ${
              isImmersionMode ? 'opacity-40' : 'opacity-70'
            }`}
          />

          {/* Top Subtle Vignette for Headerlet Readability */}
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-[#080d19]/50 to-transparent pointer-events-none" />

          {/* Monumental Typographic Showcase */}
          <div className="absolute inset-0 flex flex-col justify-between p-5 sm:p-6 pointer-events-none z-10">
            {/* Headerlet: Prestigious and Lively */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-3.5 py-1 rounded-full bg-[#101b33]/85 border border-[#f2ca50]/50 backdrop-blur-md text-[#f2ca50] text-[10px] font-bold uppercase tracking-[0.22em] shadow-[0_2px_10px_rgba(242,202,80,0.2)] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#f2ca50] shadow-[0_0_8px_#f2ca50]" />
                  ENGLISH BOOST MSZ
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-amber-200/90 font-mono tracking-wider font-semibold">
                  <span className="text-[#f2ca50]">✦</span> EXCELLENCE ACADÉMIQUE
                </span>
              </div>
            </div>

            {/* Center Monumental Draggable Letter M / Monogram Headline */}
            <div className="flex flex-col my-auto items-center justify-center text-center transition-transform duration-300 ease-out">
              <motion.div
                drag
                dragConstraints={heroWrapperRef}
                dragElastic={0.15}
                animate={{ x: letterPosition.x, y: letterPosition.y }}
                transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                whileHover={{ scale: 1.02 }}
                whileDrag={{ scale: 1.06, cursor: 'grabbing' }}
                onDragEnd={(_e, info) => {
                  setLetterPosition((prev) => ({
                    x: Math.round(prev.x + info.offset.x),
                    y: Math.round(prev.y + info.offset.y)
                  }));
                }}
                className="relative py-1 select-none pointer-events-auto cursor-grab active:cursor-grabbing touch-none flex flex-col items-center justify-center group"
                title="Cliquer et glisser pour déplacer la lettre M n'importe où sur l'image"
              >
                {/* Drag hint on hover */}
                <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none px-2 py-0.5 rounded-full bg-[#070e1d]/90 border border-[#f2ca50]/50 text-[9px] text-[#f2ca50] font-mono whitespace-nowrap shadow-lg flex items-center gap-1 z-20">
                  <span className="material-symbols-outlined text-[11px]">drag_pan</span>
                  <span>Glisser pour déplacer</span>
                </div>

                {/* Champagne Radiant Aura Glow */}
                <span
                  aria-hidden="true"
                  className={`absolute inset-0 flex items-center justify-center leading-none text-[#f2ca50]/35 blur-xl pointer-events-none uppercase ${currentFontObj.className}`}
                  style={{
                    fontFamily: currentFontObj.cssFamily,
                    fontSize: `${letterSize}px`,
                    letterSpacing: currentFontObj.id === 'cinzel' ? '0.12em' : '0.04em'
                  }}
                >
                  {letterText}
                </span>

                <h1
                  ref={titleRef}
                  className={`leading-none uppercase select-none transition-all duration-200 drop-shadow-[0_8px_28px_rgba(0,0,0,0.85)] ${
                    currentFontObj.className
                  } ${
                    isCutoutMode
                      ? 'monumental-clip-text'
                      : 'text-transparent bg-clip-text bg-gradient-to-b from-yellow-100 via-[#f2ca50] to-[#cba328]'
                  }`}
                  style={{
                    fontFamily: currentFontObj.cssFamily,
                    fontSize: `${letterSize}px`,
                    letterSpacing: currentFontObj.id === 'cinzel' ? '0.12em' : '0.04em',
                    ...(isCutoutMode
                      ? {
                          backgroundImage: `url('${currentPhotoUrl}')`,
                          backgroundSize: `${160 + (totalScale - 1) * 80}%`,
                          backgroundPosition: 'center',
                          transform: `scale(${1 + (totalScale - 1) * 0.2})`,
                          filter: 'contrast(1.15) brightness(1.12)'
                        }
                      : {})
                  }}
                >
                  {letterText}
                </h1>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Live Photographic & Focal Control Suite: Luminous Luxury Glassmorphism */}
        <div className="bg-gradient-to-r from-[#0d162a]/95 via-[#13203c]/95 to-[#0d162a]/95 backdrop-blur-xl border-t border-[#f2ca50]/35 p-3 sm:p-3.5 flex flex-col gap-2.5 shadow-inner">
          {/* Top row: Presets, Radiance Moods & Actions */}
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            {/* Presets and Upload */}
            <div className="flex items-center gap-2 overflow-x-auto py-0.5">
              <span className="text-[10px] text-amber-200/80 font-mono uppercase tracking-wider font-bold shrink-0 hidden sm:inline">
                Archives :
              </span>
              {HERO_PRESETS.map((preset, idx) => {
                const isActive = activePresetIdx === idx;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handlePresetSelect(preset, idx)}
                    className={`relative w-11 h-11 rounded-xl overflow-hidden focus:outline-none transition-all active:scale-95 shadow-md shrink-0 ${
                      isActive
                        ? 'ring-2 ring-[#f2ca50] ring-offset-2 ring-offset-[#0c1424] opacity-100 shadow-[0_0_14px_rgba(242,202,80,0.45)]'
                        : 'opacity-70 hover:opacity-100 ring-1 ring-white/15 hover:ring-[#f2ca50]/50'
                    }`}
                    title={preset.name}
                  >
                    <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                    {isActive && <div className="absolute inset-0 bg-[#f2ca50]/15" />}
                    <span className="absolute bottom-0.5 right-0.5 text-[8px] bg-[#0c1424]/90 text-[#f2ca50] px-1 rounded font-bold font-mono border border-[#f2ca50]/30">
                      {preset.tag}
                    </span>
                  </button>
                );
              })}

              {/* Custom Upload Button */}
              <label
                htmlFor="hero-photo-upload"
                onClick={() => {
                  if (!isUploading) {
                    fileInputRef.current?.click();
                  }
                }}
                className={`relative w-11 h-11 rounded-xl flex items-center justify-center cursor-pointer active:scale-95 transition-all shadow-md shrink-0 ${
                  activePresetIdx === -1
                    ? 'ring-2 ring-[#f2ca50] ring-offset-2 ring-offset-[#0c1424] bg-[#1a2b52] text-[#f2ca50] shadow-[0_0_14px_rgba(242,202,80,0.45)] border border-[#f2ca50]'
                    : 'bg-[#13203c] border border-[#f2ca50]/50 text-[#ffe082] hover:text-white hover:bg-[#1a2b52]'
                }`}
                title={
                  activePresetIdx === -1
                    ? "Photographie personnalisée active (Cliquer pour changer)"
                    : "Téléverser votre propre photographie d'exception"
                }
              >
                <input
                  id="hero-photo-upload"
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/webp, image/gif, image/*"
                  onChange={handleFileInput}
                  className="hidden"
                />
                <span className={`material-symbols-outlined text-xl ${isUploading ? 'animate-spin text-[#f2ca50]' : ''}`}>
                  {isUploading ? 'sync' : activePresetIdx === -1 ? 'check_circle' : 'add_photo_alternate'}
                </span>
                {activePresetIdx === -1 && !isUploading && (
                  <span className="absolute bottom-0.5 right-0.5 text-[7px] bg-[#0c1424]/95 text-[#f2ca50] px-1 rounded font-bold font-mono border border-[#f2ca50]/40">
                    PERSO
                  </span>
                )}
              </label>
            </div>

            {/* Quick Radiance Mode Switcher & Toggles */}
            <div className="flex items-center gap-1.5 shrink-0 ml-auto flex-wrap">
              {/* Studio Typo & Position de la Lettre M Button */}
              <button
                type="button"
                onClick={() => setIsLetterStudioOpen(!isLetterStudioOpen)}
                className={`px-3 py-1.5 rounded-lg border text-[11px] font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95 ${
                  isLetterStudioOpen
                    ? 'bg-gradient-to-r from-[#f2ca50] to-[#ffd700] text-[#291e00] border-[#f2ca50] shadow-[0_0_12px_rgba(242,202,80,0.5)] ring-2 ring-[#f2ca50]'
                    : 'bg-[#152342] text-[#ffe082] border-[#f2ca50]/50 hover:bg-[#1f325c] hover:border-[#f2ca50]'
                }`}
                title="Agrandir/diminuer, déplacer la position et changer la police de la lettre M"
              >
                <span className="material-symbols-outlined text-base">format_shapes</span>
                <span>Lettre {letterText}</span>
                <span className="text-[9px] px-1 py-0.2 rounded bg-[#0a1120] text-[#f2ca50] font-mono border border-[#f2ca50]/30 font-bold">
                  {letterSize}px
                </span>
              </button>

              {/* Direct Quick Size Steppers (A- / A+) */}
              <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-[#0a1120] border border-[#f2ca50]/30 shadow-inner">
                <button
                  type="button"
                  onClick={handleDecreaseSize}
                  className="w-7 h-6 rounded flex items-center justify-center text-[11px] font-mono font-bold text-[#d0c5af] hover:text-[#f2ca50] hover:bg-[#19243c] active:scale-95 transition-all"
                  title="Diminuer la taille de la lettre (A-)"
                >
                  A-
                </button>
                <button
                  type="button"
                  onClick={handleIncreaseSize}
                  className="w-7 h-6 rounded flex items-center justify-center text-[11px] font-mono font-bold text-[#d0c5af] hover:text-[#f2ca50] hover:bg-[#19243c] active:scale-95 transition-all"
                  title="Agrandir la taille de la lettre (A+)"
                >
                  A+
                </button>
              </div>

              {/* Quick Center Position Reset */}
              {(letterPosition.x !== 0 || letterPosition.y !== 0) && (
                <button
                  type="button"
                  onClick={handleResetLetterPosition}
                  className="px-2 py-1 rounded-lg bg-[#0a1120] border border-[#f2ca50]/40 text-[#f2ca50] text-[10px] font-mono font-bold hover:bg-[#19243c] transition-all flex items-center gap-1 shadow-sm active:scale-95"
                  title="Recentrer la lettre au milieu (0, 0)"
                >
                  <span className="material-symbols-outlined text-xs">center_focus_strong</span>
                  <span>Centrer</span>
                </button>
              )}

              {/* Radiance Mood Segmented Control */}
              <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-[#0a1120] border border-[#f2ca50]/30 shadow-inner">
                <button
                  type="button"
                  onClick={() => setRadianceMood('solaire')}
                  className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                    radianceMood === 'solaire'
                      ? 'bg-gradient-to-r from-[#f2ca50] to-[#e6b82e] text-[#2c2000] shadow-sm'
                      : 'text-[#d0c5af] hover:text-white'
                  }`}
                  title="Ambiance Solaire Lumineuse (Vitalité dorée)"
                >
                  ☀ Solaire
                </button>
                <button
                  type="button"
                  onClick={() => setRadianceMood('clarte')}
                  className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                    radianceMood === 'clarte'
                      ? 'bg-gradient-to-r from-[#f2ca50] to-[#e6b82e] text-[#2c2000] shadow-sm'
                      : 'text-[#d0c5af] hover:text-white'
                  }`}
                  title="Clarté Pure & Cristalline"
                >
                  ✦ Clarté
                </button>
                <button
                  type="button"
                  onClick={() => setRadianceMood('imperiale')}
                  className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                    radianceMood === 'imperiale'
                      ? 'bg-gradient-to-r from-[#f2ca50] to-[#e6b82e] text-[#2c2000] shadow-sm'
                      : 'text-[#d0c5af] hover:text-white'
                  }`}
                  title="Dorure Impériale Oxford"
                >
                  ⚜ Or
                </button>
              </div>

              {/* Immersion Mode Toggle */}
              <button
                type="button"
                onClick={() => setIsImmersionMode(!isImmersionMode)}
                className={`px-3 py-1.5 rounded-lg border text-[11px] font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95 ${
                  isImmersionMode
                    ? 'bg-gradient-to-r from-[#f2ca50] to-[#ffd700] text-[#291e00] border-[#f2ca50] shadow-[0_0_12px_rgba(242,202,80,0.5)]'
                    : 'bg-[#152342] text-[#ffe082] border-[#f2ca50]/50 hover:bg-[#1f325c] hover:border-[#f2ca50]'
                }`}
                title="Agrandissement cinématographique immersif"
              >
                <span className="material-symbols-outlined text-base">
                  {isImmersionMode ? 'fullscreen_exit' : 'fullscreen'}
                </span>
                <span>{isImmersionMode ? 'Réduire' : 'Immersion'}</span>
              </button>

              {/* Cutout text toggle */}
              <button
                type="button"
                onClick={() => setIsCutoutMode(!isCutoutMode)}
                className={`p-1.5 rounded-lg border transition-all active:scale-95 shadow-sm ${
                  isCutoutMode
                    ? 'bg-[#152342] border-[#f2ca50]/50 text-[#ffe082] hover:text-white hover:border-[#f2ca50]'
                    : 'bg-gradient-to-r from-[#f2ca50] to-[#e6b82e] text-[#2c2000] border-[#f2ca50] font-bold shadow-[0_0_10px_rgba(242,202,80,0.4)]'
                }`}
                title="Basculer entre Découpe Vivante et Or Pur 24K"
              >
                <span className="material-symbols-outlined text-base">
                  {isCutoutMode ? 'format_color_text' : 'title'}
                </span>
              </button>
            </div>
          </div>

          {/* Collapsible Interactive Studio for Letter M (Size, Position & Font) */}
          <AnimatePresence>
            {isLetterStudioOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden border-t border-[#f2ca50]/30 pt-3 flex flex-col gap-3"
              >
                {/* Header of the studio with quick letter selector */}
                <div className="flex flex-wrap items-center justify-between gap-2 bg-[#09101f]/90 p-2.5 rounded-xl border border-[#f2ca50]/30 shadow-inner">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#f2ca50] text-lg">tune</span>
                    <span className="text-xs font-serif font-bold text-[#dce2f8]">
                      Studio Personnalisé : Lettre {letterText}
                    </span>
                    <span className="text-[10px] text-[#d0c5af]/80 font-mono hidden sm:inline">
                      • Agrandir, réduire, basculer et changer la typographie
                    </span>
                  </div>

                  {/* Quick Letter Toggle (M vs MSZ vs custom) */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-[#d0c5af] font-mono uppercase font-semibold">Afficher :</span>
                    <button
                      type="button"
                      onClick={() => setLetterText('M')}
                      className={`px-2.5 py-1 rounded text-xs font-bold font-mono transition-all ${
                        letterText === 'M'
                          ? 'bg-[#f2ca50] text-[#2c2000] shadow-sm'
                          : 'bg-[#152342] text-[#dce2f8] hover:text-[#f2ca50]'
                      }`}
                    >
                      M
                    </button>
                    <button
                      type="button"
                      onClick={() => setLetterText('MSZ')}
                      className={`px-2.5 py-1 rounded text-xs font-bold font-mono transition-all ${
                        letterText === 'MSZ'
                          ? 'bg-[#f2ca50] text-[#2c2000] shadow-sm'
                          : 'bg-[#152342] text-[#dce2f8] hover:text-[#f2ca50]'
                      }`}
                    >
                      MSZ
                    </button>
                    <input
                      type="text"
                      maxLength={6}
                      value={letterText}
                      onChange={(e) => setLetterText(e.target.value.toUpperCase())}
                      className="w-16 px-1.5 py-1 rounded bg-[#0a1120] border border-[#f2ca50]/40 text-xs font-mono font-bold text-[#f2ca50] text-center focus:outline-none focus:border-[#f2ca50]"
                      placeholder="Texte"
                      title="Personnaliser les lettres"
                    />
                  </div>
                </div>

                {/* 3 Columns / Controls Grid: 1. Taille, 2. Position & Bascule, 3. Police de Lettre */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Column 1: Taille de la lettre */}
                  <div className="rounded-xl bg-[#09101f]/70 border border-[#f2ca50]/20 p-3 flex flex-col justify-between gap-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-[#f2ca50] flex items-center gap-1 font-mono uppercase">
                        <span className="material-symbols-outlined text-sm">format_size</span>
                        Taille de la Lettre
                      </span>
                      <span className="text-xs font-mono font-bold text-[#f2ca50] px-2 py-0.5 rounded bg-[#101b33] border border-[#f2ca50]/30 shadow-sm">
                        {letterSize}px
                      </span>
                    </div>

                    {/* Continuous Slider with Steppers */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleDecreaseSize}
                        className="w-8 h-8 rounded-lg bg-[#152342] border border-[#f2ca50]/30 text-[#f2ca50] hover:bg-[#f2ca50] hover:text-[#2c2000] flex items-center justify-center font-bold text-xs transition-all active:scale-95 shadow-sm"
                        title="Diminuer la taille (A-)"
                      >
                        A-
                      </button>
                      <input
                        type="range"
                        min="36"
                        max="170"
                        step="2"
                        value={letterSize}
                        onChange={(e) => setLetterSize(parseInt(e.target.value, 10))}
                        className="w-full h-2 bg-[#0a1120] rounded-lg appearance-none cursor-pointer accent-[#f2ca50] focus:outline-none border border-[#f2ca50]/30"
                        aria-label="Taille de la lettre M"
                      />
                      <button
                        type="button"
                        onClick={handleIncreaseSize}
                        className="w-8 h-8 rounded-lg bg-[#152342] border border-[#f2ca50]/30 text-[#f2ca50] hover:bg-[#f2ca50] hover:text-[#2c2000] flex items-center justify-center font-bold text-xs transition-all active:scale-95 shadow-sm"
                        title="Agrandir la taille (A+)"
                      >
                        A+
                      </button>
                    </div>

                    {/* Quick Size Presets */}
                    <div className="grid grid-cols-4 gap-1.5 pt-1">
                      {[
                        { label: 'Compact', size: 48 },
                        { label: 'Normal', size: 72 },
                        { label: 'Monument', size: 96 },
                        { label: 'Titanesque', size: 136 }
                      ].map((item) => (
                        <button
                          key={item.size}
                          type="button"
                          onClick={() => setLetterSize(item.size)}
                          className={`py-1.5 rounded-lg text-[10px] font-mono font-bold transition-all ${
                            letterSize === item.size
                              ? 'bg-[#f2ca50] text-[#2c2000] shadow-sm'
                              : 'bg-[#152342] text-[#d0c5af] hover:text-[#f2ca50]'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Column 2: Bascule & Positionnement */}
                  <div className="rounded-xl bg-[#09101f]/70 border border-[#f2ca50]/20 p-3 flex flex-col justify-between gap-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-[#f2ca50] flex items-center gap-1 font-mono uppercase">
                        <span className="material-symbols-outlined text-sm">open_with</span>
                        Bascule de Position
                      </span>
                      <button
                        type="button"
                        onClick={handleResetLetterPosition}
                        className="text-[10px] font-mono text-[#d4c78f] hover:text-[#f2ca50] underline cursor-pointer"
                        title="Réinitialiser au centre exact"
                      >
                        Centrer (0, 0)
                      </button>
                    </div>

                    {/* 3x3 Positioning Pad */}
                    <div className="grid grid-cols-3 gap-1.5 max-w-[190px] mx-auto py-0.5">
                      {[
                        { label: '↖', x: -110, y: -45, title: 'Haut Gauche' },
                        { label: '↑', x: 0, y: -55, title: 'Haut Centre' },
                        { label: '↗', x: 110, y: -45, title: 'Haut Droite' },
                        { label: '←', x: -110, y: 0, title: 'Gauche' },
                        { label: '•', x: 0, y: 0, title: 'Centre' },
                        { label: '→', x: 110, y: 0, title: 'Droite' },
                        { label: '↙', x: -110, y: 45, title: 'Bas Gauche' },
                        { label: '↓', x: 0, y: 55, title: 'Bas Centre' },
                        { label: '↘', x: 110, y: 45, title: 'Bas Droite' }
                      ].map((pos) => {
                        const isSelected = letterPosition.x === pos.x && letterPosition.y === pos.y;
                        return (
                          <button
                            key={pos.title}
                            type="button"
                            onClick={() => setLetterPosition({ x: pos.x, y: pos.y })}
                            className={`h-7 rounded flex items-center justify-center font-bold text-xs font-mono transition-all active:scale-90 ${
                              isSelected
                                ? 'bg-[#f2ca50] text-[#2c2000] shadow-[0_0_10px_rgba(242,202,80,0.5)] ring-1 ring-[#f2ca50]'
                                : 'bg-[#152342] text-[#dce2f8] hover:bg-[#1f325c] hover:text-[#f2ca50]'
                            }`}
                            title={`Positionner la lettre à : ${pos.title}`}
                          >
                            {pos.label}
                          </button>
                        );
                      })}
                    </div>

                    <p className="text-[10px] text-[#99907c] text-center italic leading-tight">
                      ✦ Vous pouvez aussi glisser directement la lettre sur l'image avec la souris ou au doigt !
                    </p>
                  </div>

                  {/* Column 3: Police de Caractère */}
                  <div className="rounded-xl bg-[#09101f]/70 border border-[#f2ca50]/20 p-3 flex flex-col justify-between gap-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-[#f2ca50] flex items-center gap-1 font-mono uppercase">
                        <span className="material-symbols-outlined text-sm">font_download</span>
                        Police de Lettre
                      </span>
                      <span className="text-[10px] font-mono text-[#d4c78f] uppercase">
                        {currentFontObj.name}
                      </span>
                    </div>

                    {/* Font Selector Buttons with live preview */}
                    <div className="flex flex-col gap-1.5 max-h-[140px] overflow-y-auto pr-1">
                      {MONOGRAM_FONTS.map((font) => {
                        const isFontSelected = selectedFont === font.id;
                        return (
                          <button
                            key={font.id}
                            type="button"
                            onClick={() => setSelectedFont(font.id)}
                            className={`w-full px-2.5 py-1.5 rounded-lg flex items-center justify-between text-xs transition-all active:scale-98 ${
                              isFontSelected
                                ? 'bg-[#f2ca50] text-[#2c2000] font-bold shadow-sm ring-1 ring-[#f2ca50]'
                                : 'bg-[#152342] text-[#dce2f8] hover:bg-[#1f325c] hover:text-[#f2ca50]'
                            }`}
                          >
                            <span className="font-mono text-[11px] truncate">{font.name}</span>
                            <span
                              className="text-sm font-semibold truncate ml-2"
                              style={{ fontFamily: font.cssFamily }}
                            >
                              {letterText} {font.sample}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom row: Interactive Focal Scrubber & Vitality Readout */}
          <div className="flex items-center justify-between gap-3 pt-1.5 border-t border-[#f2ca50]/20">
            <div className="flex items-center gap-2 text-[#d4c78f] text-[11px]">
              <span className="material-symbols-outlined text-base text-[#f2ca50] animate-spin-slow">filter_center_focus</span>
              <span className="font-medium text-amber-200">Focale Haute Précision :</span>
              <span className="text-[#f2ca50] font-black font-mono text-xs px-2 py-0.5 rounded bg-[#0a1120] border border-[#f2ca50]/40 shadow-sm">
                {Math.round(totalScale * 100)}%
              </span>
            </div>

            <div className="flex-1 flex items-center gap-2 max-w-[220px]">
              <span className="material-symbols-outlined text-amber-300/80 text-sm">zoom_out</span>
              <input
                type="range"
                min="1.0"
                max="2.5"
                step="0.02"
                value={manualZoom}
                onChange={(e) => setManualZoom(parseFloat(e.target.value))}
                className="w-full h-2 bg-[#0a1120] rounded-lg appearance-none cursor-pointer accent-[#f2ca50] focus:outline-none border border-[#f2ca50]/30"
                aria-label="Ajuster la focale photographique"
              />
              <span className="material-symbols-outlined text-amber-300/80 text-sm">zoom_in</span>
            </div>

            <button
              type="button"
              onClick={handleResetZoom}
              className="text-xs text-[#ffeaa7] hover:text-[#2c2000] hover:bg-[#f2ca50] px-2.5 py-1 rounded bg-[#13203c] border border-[#f2ca50]/40 transition-all font-mono font-bold shadow-sm active:scale-95"
            >
              Reset 100%
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
