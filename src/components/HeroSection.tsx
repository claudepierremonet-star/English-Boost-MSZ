import React, { useState, useEffect, useRef } from 'react';
import { HERO_PRESETS, type HeroPreset } from '../data/curriculum';

interface HeroSectionProps {
  currentPhotoUrl: string;
  onPhotoChange: (newUrl: string) => void;
  onCustomUpload: (file: File) => Promise<string>;
}

type RadianceMood = 'solaire' | 'clarte' | 'imperiale';

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

  const heroWrapperRef = useRef<HTMLDivElement>(null);
  const heroImgRef = useRef<HTMLImageElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

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
    setIsUploading(true);
    try {
      const url = await onCustomUpload(file);
      onPhotoChange(url);
      setActivePresetIdx(-1);
    } catch (err) {
      console.error('Upload failed', err);
    } finally {
      setIsUploading(false);
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
                  CURATED SALON • VOL. VIII
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-amber-200/90 font-mono tracking-wider font-semibold">
                  <span className="text-[#f2ca50]">✦</span> EXCELLENCE ACADÉMIQUE
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#101b33]/85 text-[10px] text-yellow-200 border border-[#f2ca50]/40 font-mono font-bold shadow-sm">
                  OXFORD C2
                </span>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#f2ca50] to-[#d4af37] text-[#291e00] flex items-center justify-center shadow-[0_0_12px_rgba(242,202,80,0.5)]">
                  <span className="material-symbols-outlined text-base font-bold">auto_awesome</span>
                </div>
              </div>
            </div>

            {/* Center Monumental Cutout Headline */}
            <div className="flex flex-col my-auto items-center justify-center text-center transition-transform duration-300 ease-out">
              {/* Vibrant Golden Crest Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#0c1424]/85 border border-[#f2ca50]/60 backdrop-blur-md mb-2 shadow-[0_0_16px_rgba(242,202,80,0.25)]">
                <span className="w-2 h-2 rounded-full bg-gradient-to-r from-amber-400 to-[#f2ca50] shadow-[0_0_10px_#f2ca50] animate-pulse" />
                <p className="text-[11px] uppercase tracking-[0.3em] text-[#ffeaa7] font-bold">
                  The Sovereign Path
                </p>
              </div>

              {/* Monumental Clipped Title: SOVEREIGN */}
              <div className="relative py-1 select-none">
                {/* Champagne Radiant Aura Glow */}
                <span
                  aria-hidden="true"
                  className="absolute inset-0 flex items-center justify-center font-serif font-black tracking-[-0.04em] text-[54px] sm:text-[72px] leading-none text-[#f2ca50]/35 blur-xl pointer-events-none"
                >
                  SOVEREIGN
                </span>

                <h1
                  ref={titleRef}
                  className={`font-serif font-black tracking-[-0.03em] text-[54px] sm:text-[72px] leading-none uppercase select-none transition-all duration-300 drop-shadow-[0_8px_28px_rgba(0,0,0,0.85)] ${
                    isCutoutMode ? 'monumental-clip-text' : 'text-transparent bg-clip-text bg-gradient-to-b from-yellow-100 via-[#f2ca50] to-[#cba328]'
                  }`}
                  style={
                    isCutoutMode
                      ? {
                          backgroundImage: `url('${currentPhotoUrl}')`,
                          backgroundSize: `${160 + (totalScale - 1) * 80}%`,
                          backgroundPosition: 'center',
                          transform: `scale(${1 + (totalScale - 1) * 0.2})`,
                          filter: 'contrast(1.15) brightness(1.12)'
                        }
                      : undefined
                  }
                >
                  SOVEREIGN
                </h1>
              </div>

              <p className="font-serif text-lg sm:text-2xl italic text-[#fff4cc] font-light tracking-wide -mt-0.5 drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)]">
                English Master Series • Oxford C2
              </p>
            </div>

            {/* Bottom Status bar: Clean, Crisp, Energetic */}
            <div className="flex items-center justify-between text-[#e4dbca] text-[11px] pt-1 font-medium">
              <span className="flex items-center gap-1.5 bg-[#0c1424]/85 backdrop-blur-md px-3 py-1 rounded-full border border-[#f2ca50]/40 shadow-sm text-yellow-100">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                Sanctuaire de Savoir &bull; Érudition Vivante
              </span>
              <span className="text-[#ffe082] font-semibold bg-[#0c1424]/85 backdrop-blur-md px-3 py-1 rounded-full border border-[#f2ca50]/40 font-mono shadow-sm">
                Focale {Math.round(totalScale * 100)}% &bull; {isCutoutMode ? 'Découpe Vivante' : 'Or Pur 24K'}
              </span>
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
                className="w-11 h-11 rounded-xl bg-[#13203c] border border-[#f2ca50]/50 flex items-center justify-center text-[#ffe082] hover:text-white hover:bg-[#1a2b52] cursor-pointer active:scale-95 transition-all shadow-sm shrink-0"
                title="Téléverser votre propre photographie d'exception"
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileInput}
                  className="hidden"
                  disabled={isUploading}
                />
                <span className="material-symbols-outlined text-xl">
                  {isUploading ? 'sync' : 'add_photo_alternate'}
                </span>
              </label>
            </div>

            {/* Quick Radiance Mode Switcher & Toggles */}
            <div className="flex items-center gap-1.5 shrink-0 ml-auto">
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
