import React, { useState, useEffect, useRef } from 'react';
import { HERO_PRESETS, type HeroPreset } from '../data/curriculum';

interface HeroSectionProps {
  currentPhotoUrl: string;
  onPhotoChange: (newUrl: string) => void;
  onCustomUpload: (file: File) => Promise<string>;
}

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

  return (
    <section className="relative w-full overflow-hidden px-4 sm:px-6 pt-3 pb-5" id="hero-section">
      {/* Ambient Radial Golden Vignette */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-[#f2ca50]/15 blur-3xl pointer-events-none transition-opacity duration-700" />

      {/* Hero Backing Stage */}
      <div
        className={`relative w-full rounded-2xl overflow-hidden bg-[#070e1d] border border-[#4d4635]/40 shadow-[0_16px_45px_rgba(7,14,29,0.9)] transition-all duration-700 ease-out ${
          isImmersionMode ? 'ring-2 ring-[#f2ca50] shadow-[0_25px_60px_rgba(242,202,80,0.25)]' : ''
        }`}
      >
        {/* Dynamic Background Stage */}
        <div
          ref={heroWrapperRef}
          className={`relative w-full overflow-hidden transition-all duration-500 ease-out origin-center ${
            isImmersionMode ? 'h-[460px] sm:h-[520px]' : 'h-[330px] sm:h-[380px]'
          }`}
        >
          {/* Active Background Master Image (Effect B: Zoom plein écran) */}
          <img
            ref={heroImgRef}
            src={currentPhotoUrl}
            alt="Sanctuaire d'érudition Oxford et architecture victorienne"
            className="w-full h-full object-cover transition-transform duration-300 ease-out will-change-transform"
            style={{
              transform: `scale(${totalScale * (isImmersionMode ? 1.25 : 1.05)})`,
              filter: isImmersionMode ? 'brightness(0.95)' : 'brightness(0.85)'
            }}
          />

          {/* Scrim Gradient for high contrast */}
          <div
            className={`absolute inset-0 bg-gradient-to-t from-[#0c1322] via-[#0c1322]/50 to-transparent transition-opacity duration-500 ${
              isImmersionMode ? 'opacity-40' : 'opacity-85'
            }`}
          />

          {/* Radial depth vignette */}
          <div className="absolute inset-0 bg-radial from-transparent via-transparent to-[#070e1d]/85 pointer-events-none" />

          {/* Monumental Typographic Showcase (Effect A: background-clip text) */}
          <div className="absolute inset-0 flex flex-col justify-between p-5 pointer-events-none z-10">
            {/* Headerlet */}
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-[#2e3545]/80 border border-[#f2ca50]/20 backdrop-blur-md text-[#f2ca50] text-[10px] font-bold uppercase tracking-[0.2em] shadow-sm">
                CURATED SALON • VOL. VIII
              </span>
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-full bg-[#191f2f]/80 text-[10px] text-[#d4c78f] border border-[#4d4635]/40 font-mono">
                  POINT 02
                </span>
                <div className="w-8 h-8 rounded-full bg-[#2e3545]/80 border border-[#f2ca50]/30 backdrop-blur-md flex items-center justify-center text-[#f2ca50] shadow-md">
                  <span className="material-symbols-outlined text-base">auto_awesome</span>
                </div>
              </div>
            </div>

            {/* Center Monumental Cutout Headline */}
            <div className="flex flex-col my-auto items-center justify-center text-center transition-transform duration-300 ease-out">
              <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-[#070e1d]/80 border border-[#f2ca50]/30 backdrop-blur-md mb-2 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-[#f2ca50] animate-ping" />
                <p className="text-[11px] uppercase tracking-[0.28em] text-[#d4c78f] font-semibold">
                  The Sovereign Path
                </p>
              </div>

              {/* Monumental Clipped Title: SOVEREIGN */}
              <div className="relative py-1 select-none">
                {/* Champagne subtle shadow aura */}
                <span
                  aria-hidden="true"
                  className="absolute inset-0 flex items-center justify-center font-serif font-black tracking-[-0.04em] text-[52px] sm:text-[68px] leading-none text-[#f2ca50]/20 blur-md pointer-events-none"
                >
                  SOVEREIGN
                </span>

                <h1
                  ref={titleRef}
                  className={`font-serif font-black tracking-[-0.03em] text-[52px] sm:text-[68px] leading-none uppercase select-none transition-all duration-300 drop-shadow-[0_8px_24px_rgba(0,0,0,0.95)] ${
                    isCutoutMode ? 'monumental-clip-text' : 'text-[#f2ca50]'
                  }`}
                  style={
                    isCutoutMode
                      ? {
                          backgroundImage: `url('${currentPhotoUrl}')`,
                          backgroundSize: `${160 + (totalScale - 1) * 80}%`,
                          backgroundPosition: 'center',
                          transform: `scale(${1 + (totalScale - 1) * 0.2})`
                        }
                      : undefined
                  }
                >
                  SOVEREIGN
                </h1>
              </div>

              <p className="font-serif text-lg sm:text-xl italic text-[#f1e3a9]/95 font-light tracking-wide -mt-0.5 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                English Master Series • Oxford C2
              </p>
            </div>

            {/* Bottom Status bar */}
            <div className="flex items-center justify-between text-[#d0c5af] text-[11px] pt-1">
              <span className="flex items-center gap-1.5 bg-[#070e1d]/70 backdrop-blur-sm px-2.5 py-0.5 rounded-full border border-[#4d4635]/40">
                <span className="w-1.5 h-1.5 rounded-full bg-[#f2ca50]" /> Oxford Academic Standard
              </span>
              <span className="text-[#d4c78f] font-semibold bg-[#070e1d]/70 backdrop-blur-sm px-2.5 py-0.5 rounded-full border border-[#4d4635]/40 font-mono">
                Focale {Math.round(totalScale * 100)}% • {isCutoutMode ? 'Découpé' : 'Solide'}
              </span>
            </div>
          </div>
        </div>

        {/* Live Photographic & Focal Control Suite */}
        <div className="bg-[#232a3a]/95 backdrop-blur-lg border-t border-[#4d4635]/40 p-3 flex flex-col gap-2.5">
          {/* Top row: Presets & Upload */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
              {HERO_PRESETS.map((preset, idx) => {
                const isActive = activePresetIdx === idx;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handlePresetSelect(preset, idx)}
                    className={`relative w-10 h-10 rounded-xl overflow-hidden focus:outline-none transition-all active:scale-95 shadow-md shrink-0 ${
                      isActive
                        ? 'ring-2 ring-[#f2ca50] opacity-100'
                        : 'opacity-60 hover:opacity-100 ring-1 ring-white/10'
                    }`}
                    title={preset.name}
                  >
                    <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                    {isActive && <div className="absolute inset-0 bg-[#f2ca50]/20" />}
                    <span className="absolute bottom-0.5 right-0.5 text-[8px] bg-[#070e1d]/85 text-[#f2ca50] px-1 rounded font-bold font-mono">
                      {preset.tag}
                    </span>
                  </button>
                );
              })}

              {/* Custom Upload Button */}
              <label
                className="w-10 h-10 rounded-xl bg-[#191f2f] border border-[#4d4635]/60 flex items-center justify-center text-[#d4c78f] hover:text-[#f2ca50] cursor-pointer active:scale-95 transition-all shadow-sm shrink-0"
                title="Téléverser votre propre photographie"
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileInput}
                  className="hidden"
                  disabled={isUploading}
                />
                <span className="material-symbols-outlined text-lg">
                  {isUploading ? 'sync' : 'add_photo_alternate'}
                </span>
              </label>
            </div>

            {/* Quick Demo Mode Toggles */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Immersion Mode */}
              <button
                type="button"
                onClick={() => setIsImmersionMode(!isImmersionMode)}
                className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold flex items-center gap-1 transition-all shadow-sm active:scale-95 ${
                  isImmersionMode
                    ? 'bg-[#f2ca50] text-[#3c2f00] border-[#f2ca50]'
                    : 'bg-[#191f2f] text-[#f2ca50] border-[#f2ca50]/40 hover:bg-[#f2ca50]/10'
                }`}
                title="Tester l'agrandissement cinématographique"
              >
                <span className="material-symbols-outlined text-sm">
                  {isImmersionMode ? 'fullscreen_exit' : 'fullscreen'}
                </span>
                <span>{isImmersionMode ? 'Réduire' : 'Immersion'}</span>
              </button>

              {/* Cutout text toggle */}
              <button
                type="button"
                onClick={() => setIsCutoutMode(!isCutoutMode)}
                className={`p-1.5 rounded-lg border transition-colors active:scale-95 ${
                  isCutoutMode
                    ? 'bg-[#191f2f] border-[#4d4635]/50 text-[#d4c78f] hover:text-[#f2ca50]'
                    : 'bg-[#f2ca50]/20 border-[#f2ca50] text-[#f2ca50]'
                }`}
                title="Basculer Texte découpé / Texte or pur"
              >
                <span className="material-symbols-outlined text-base">
                  {isCutoutMode ? 'visibility' : 'visibility_off'}
                </span>
              </button>
            </div>
          </div>

          {/* Bottom row: Interactive Focal Scrubber */}
          <div className="flex items-center justify-between gap-3 pt-1 border-t border-[#2e3545]/60">
            <div className="flex items-center gap-1.5 text-[#d4c78f] text-[11px]">
              <span className="material-symbols-outlined text-sm text-[#f2ca50]">filter_center_focus</span>
              <span>Focale :</span>
              <span className="text-[#f2ca50] font-bold font-mono">
                {Math.round(totalScale * 100)}%
              </span>
            </div>

            <div className="flex-1 flex items-center gap-2 max-w-[200px]">
              <span className="material-symbols-outlined text-[#d0c5af] text-sm">zoom_out</span>
              <input
                type="range"
                min="1.0"
                max="2.5"
                step="0.02"
                value={manualZoom}
                onChange={(e) => setManualZoom(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-[#2e3545] rounded-lg appearance-none cursor-pointer accent-[#f2ca50] focus:outline-none"
                aria-label="Ajuster la focale"
              />
              <span className="material-symbols-outlined text-[#d0c5af] text-sm">zoom_in</span>
            </div>

            <button
              type="button"
              onClick={handleResetZoom}
              className="text-xs text-[#d4c78f] hover:text-[#f2ca50] px-2 py-0.5 rounded bg-[#2e3545]/70 transition-colors font-mono"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
