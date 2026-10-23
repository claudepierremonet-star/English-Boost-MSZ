import React, { useState, useEffect, useRef } from 'react';
import {
  fetchFullWeather,
  DEFAULT_WEATHER_DATA,
  type WeatherData,
  type DayForecast
} from '../services/weatherService';

export function DiscreteWeatherBar() {
  const [weather, setWeather] = useState<WeatherData>(DEFAULT_WEATHER_DATA);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [usingGps, setUsingGps] = useState<boolean>(false);

  // 5-second auto-dismiss countdown timer state
  const [timeLeft, setTimeLeft] = useState<number>(5.0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize weather on mount with Geolocation
  useEffect(() => {
    loadWeatherWithGeolocation();
  }, []);

  const loadWeatherWithGeolocation = () => {
    setLoading(true);
    setGeoError(null);

    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const data = await fetchFullWeather(
              position.coords.latitude,
              position.coords.longitude
            );
            setWeather(data);
            setUsingGps(true);
          } catch (err) {
            console.warn('Weather fetch error:', err);
          } finally {
            setLoading(false);
          }
        },
        async (error) => {
          console.warn('Geolocation denied or unavailable, using Paris default:', error.message);
          setUsingGps(false);
          setGeoError('Position GPS non disponible • Météo Paris affichée');
          try {
            const data = await fetchFullWeather(48.8566, 2.3522);
            setWeather(data);
          } catch (e) {
            // keep default
          } finally {
            setLoading(false);
          }
        },
        { timeout: 7000, enableHighAccuracy: false }
      );
    } else {
      setLoading(false);
    }
  };

  // 5-second auto-dismiss timer countdown
  useEffect(() => {
    if (!isExpanded) {
      if (timerRef.current) clearInterval(timerRef.current);
      setTimeLeft(5.0);
      setIsPaused(false);
      return;
    }

    setTimeLeft(5.0);

    const intervalMs = 100;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (isPaused) return prev;
        if (prev <= 0.1) {
          setIsExpanded(false);
          return 5.0;
        }
        return Number((prev - 0.1).toFixed(1));
      });
    }, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isExpanded, isPaused]);

  const handleBarClick = () => {
    if (!isExpanded) {
      setIsExpanded(true);
      setTimeLeft(5.0);
      setIsPaused(false);
    }
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(false);
  };

  const handleTogglePause = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPaused((prev) => !prev);
  };

  const handleRefresh = (e: React.MouseEvent) => {
    e.stopPropagation();
    loadWeatherWithGeolocation();
    setTimeLeft(5.0);
  };

  // Artistic condition classifier for the 7-day forecast with exact matching icons
  const getArtisticCondition = (day: DayForecast) => {
    const code = day.weatherCode;
    // Neige (Snow)
    if ((code >= 71 && code <= 77) || code === 85 || code === 86) {
      return { label: 'Neige', icon: 'ac_unit', color: 'text-sky-700' };
    }
    // Brouillard (Fog)
    if (code === 45 || code === 48) {
      return { label: 'Brouillard', icon: 'foggy', color: 'text-stone-600' };
    }
    // Orages (Thunderstorm)
    if (code >= 95 && code <= 99) {
      return { label: 'Orages', icon: 'thunderstorm', color: 'text-amber-800' };
    }
    // Averses (Rain Showers - cloud with rain, NOT bathroom shower)
    if (code >= 80 && code <= 82) {
      return { label: 'Averses', icon: 'rainy', color: 'text-blue-700' };
    }
    // Pluie (Rain)
    if (code >= 51 && code <= 67) {
      return { label: 'Pluie', icon: 'water_drop', color: 'text-indigo-800' };
    }
    // Ensoleillé (Sun)
    if (code === 0 || code === 1) {
      return { label: 'Ensoleillé', icon: 'wb_sunny', color: 'text-amber-600' };
    }
    // Éclaircies / Partiellement Nuageux
    if (code === 2) {
      return { label: 'Éclaircies', icon: 'partly_cloudy_day', color: 'text-amber-700' };
    }
    // Couvert
    return { label: 'Couvert', icon: 'cloud', color: 'text-stone-600' };
  };

  return (
    <aside
      aria-label="Barre météo et environnement discrète"
      className="w-full select-none relative z-40 transition-all duration-300"
    >
      {/* =========================================================================
          1. COLLAPSED STATE: STRICT 1 CM THICKNESS (h-[1cm]), FLUSH (NO 0.5CM INDENT)
          Ultra-refined, discreet, dark jewel hairline with gold micro-accents
         ========================================================================= */}
      {!isExpanded && (
        <div
          role="button"
          tabIndex={0}
          onClick={handleBarClick}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleBarClick();
            }
          }}
          style={{ height: '1cm' }}
          className="w-full bg-[#0c1322]/90 hover:bg-[#121927] border-b border-[#d4af37]/30 hover:border-[#f2ca50] backdrop-blur-md px-3 sm:px-5 flex items-center justify-between cursor-pointer transition-all duration-300 group shadow-sm"
          title="Station météo discrète (1 cm) — Cliquez pour afficher en plein écran (disparaît en 5s)"
        >
          {/* Left: Minimalist Astronomical Signature */}
          <div className="flex items-center gap-2">
            <span className="text-[#d4af37] text-xs font-serif italic tracking-wide group-hover:text-[#f2ca50] transition-colors flex items-center gap-1.5">
              <span className="text-[13px]">✦</span>
              <span className="font-semibold uppercase tracking-[0.18em] text-[10px] font-sans text-[#f2ca50]">
                Météo & Climat
              </span>
            </span>
            <span className="text-[#4a5568] text-[10px]">•</span>
            <span className="font-serif italic text-xs text-[#dce2f8]/90">
              {weather.city}
            </span>
          </div>

          {/* Center: Essential Live Glimpse (Temp + Wind km/h + Air/Pollen) */}
          <div className="flex items-center gap-3 sm:gap-6 text-xs">
            <div className="flex items-baseline gap-1 font-serif font-bold text-[#f2ca50]">
              <span className="text-sm">{weather.currentTemp}°C</span>
              <span className="text-[10px] font-sans font-normal text-[#c7d2e9]/70 hidden md:inline">
                ({weather.conditionLabel})
              </span>
            </div>

            <div className="hidden xs:flex items-center gap-1 text-[11px] font-mono text-[#cbd5e1]">
              <span className="material-symbols-outlined text-[13px] text-[#38bdf8]">air</span>
              <span>{weather.windSpeedKmH} km/h</span>
            </div>

            <div className="hidden lg:flex items-center gap-2 text-[10px] font-serif text-[#d0c5af]/80">
              <span>Air : <strong className="text-emerald-400 font-sans">{weather.airQuality.aqiLabel}</strong></span>
              <span className="text-[#4a5568]">•</span>
              <span>Pollen : <strong className="text-amber-300 font-sans">{weather.airQuality.pollenLevel}</strong></span>
            </div>
          </div>

          {/* Right: Fine call-to-action touch pill */}
          <div className="flex items-center gap-2">
            <span className="text-[9px] uppercase tracking-[0.2em] font-sans font-semibold text-[#f2ca50]/80 group-hover:text-[#f2ca50] hidden sm:inline">
              Ouvrir (5s)
            </span>
            <div className="w-5 h-5 rounded-full border border-[#d4af37]/40 flex items-center justify-center text-[#f2ca50] group-hover:bg-[#f2ca50] group-hover:text-[#0c1322] transition-colors">
              <span className="material-symbols-outlined text-[13px]">expand_more</span>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          2. EXPANDED STATE: LUMINOUS CLEAR BACKGROUND ("FOND PLUS CLAIR")
          HAUTE HORLOGERIE / ATELIER ARTISTIC LUXURY PRESENTATION
          COMPACT, NO BULKY LOGOS, NO 0.5CM GAP, AUTO-DISMISS IN 5 SECONDS
         ========================================================================= */}
      {isExpanded && (
        <div
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="w-full bg-gradient-to-b from-[#fdfbf7] via-[#f7f2e7] to-[#ede3d0] text-[#1e2738] border-b-2 border-[#b89033] shadow-[0_20px_50px_rgba(40,30,10,0.22)] backdrop-blur-2xl transition-all duration-300 animate-fadeIn"
        >
          {/* Top Control Bar (Height 1cm, flush edge-to-edge) */}
          <div
            style={{ height: '1cm' }}
            className="w-full px-3 sm:px-6 bg-[#f2ebd9] border-b border-[#d8c8a5] flex items-center justify-between text-xs"
          >
            {/* Title & Astrological Crest */}
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-[#a67c1e] text-base font-serif">✦</span>
              <div className="flex items-baseline gap-2">
                <h3 className="font-serif font-bold text-[#2a1d0f] text-sm tracking-wide">
                  Observatoire Météorologique & Climatologique
                </h3>
                <span className="hidden md:inline text-[9px] font-serif uppercase tracking-[0.2em] text-[#8c6d23] border border-[#d8c8a5] px-2 py-0.2 rounded-full bg-[#fdfbf7]">
                  {usingGps ? 'Coordonnées GPS en direct' : 'Station Géolocalisée'}
                </span>
              </div>
            </div>

            {/* Controls: Countdown Timer + Pause + Refresh + Close */}
            <div className="flex items-center gap-2">
              {/* Countdown badge with fine gold outline */}
              <div
                className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#fdfbf7] border border-[#c4a253] text-[11px] font-mono font-bold text-[#8c6d23]"
                title="Temps restant avant fermeture automatique"
              >
                <span className="material-symbols-outlined text-xs">
                  {isPaused ? 'pause_circle' : 'hourglass_top'}
                </span>
                <span>{timeLeft.toFixed(1)}s</span>
              </div>

              {/* Pause / Hold Button */}
              <button
                type="button"
                onClick={handleTogglePause}
                className={`px-2.5 py-1 rounded-full text-[10px] font-sans font-bold uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer shadow-sm ${
                  isPaused
                    ? 'bg-[#8c6d23] text-[#ffffff] border border-[#8c6d23]'
                    : 'bg-[#fdfbf7] hover:bg-[#fff9ed] text-[#4a3b22] border border-[#c4a253]'
                }`}
                title={isPaused ? 'Reprendre le compte à rebours 5s' : 'Mettre en pause pour examiner'}
              >
                <span className="material-symbols-outlined text-[12px]">
                  {isPaused ? 'play_arrow' : 'pause'}
                </span>
                <span className="hidden sm:inline">{isPaused ? 'Reprendre' : 'Garder ouvert'}</span>
              </button>

              {/* Refresh Button */}
              <button
                type="button"
                onClick={handleRefresh}
                disabled={loading}
                className="p-1 rounded-full bg-[#fdfbf7] hover:bg-[#fff9ed] text-[#8c6d23] border border-[#c4a253] transition-colors cursor-pointer shadow-sm"
                title="Actualiser la géolocalisation"
              >
                <span className={`material-symbols-outlined text-sm ${loading ? 'animate-spin' : ''}`}>
                  refresh
                </span>
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={handleClose}
                className="p-1 rounded-full bg-[#fdfbf7] hover:bg-rose-100 text-stone-700 hover:text-rose-700 border border-[#c4a253] transition-colors cursor-pointer shadow-sm"
                title="Fermer la station météo"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
          </div>

          {/* 5-second animated hair-thin gold thread */}
          <div className="w-full bg-[#e2d4b7] h-[2px] overflow-hidden">
            <div
              className={`h-full transition-all ease-linear ${isPaused ? 'bg-amber-600' : 'bg-[#b89033]'}`}
              style={{
                width: `${(timeLeft / 5.0) * 100}%`,
                transitionDuration: '100ms'
              }}
            />
          </div>

          {/* Main Sophisticated Horological & Environmental Dashboard */}
          <div className="w-full px-3 sm:px-6 py-4 space-y-3.5">
            {/* ROW 1: COMPACT, LUXURY METRICS (Zero bulky logos, pure fine-art typography) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5">
              {/* CARD 1: TEMPÉRATURE & ÉTAT DU CIEL */}
              <div className="p-3 rounded-xl bg-[#ffffff]/90 border border-[#d8c8a5] shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] uppercase tracking-[0.2em] font-sans font-bold text-[#8c6d23] flex items-center gap-1">
                    <span className="text-xs">✦</span>
                    <span>TEMPÉRATURE EN DIRECT</span>
                  </span>
                  <span className="font-serif italic text-xs text-[#524330] font-semibold">
                    {weather.city}
                  </span>
                </div>

                <div className="my-1.5 flex items-baseline justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-serif font-bold text-[#1e2738] tracking-tight">
                      {weather.currentTemp}°C
                    </span>
                    <span className="text-[11px] font-serif italic text-[#786345]">
                      Ressenti {weather.apparentTemp}°C
                    </span>
                  </div>
                  <span className="material-symbols-outlined text-2xl text-[#b89033]">
                    {weather.iconName}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-[#f0e6d2] text-[#63533c]">
                  <span className="font-medium text-[#2a1d0f]">{weather.conditionLabel}</span>
                  <span className="font-mono">Humidité : {weather.humidity}%</span>
                </div>
              </div>

              {/* CARD 2: VITESSE DU VENT (KM/H) & DIRECTION */}
              <div className="p-3 rounded-xl bg-[#ffffff]/90 border border-[#d8c8a5] shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] uppercase tracking-[0.2em] font-sans font-bold text-[#0284c7] flex items-center gap-1">
                    <span className="material-symbols-outlined text-[11px]">air</span>
                    <span>VITESSE DU VENT</span>
                  </span>
                  <span className="text-[10px] font-mono text-[#0369a1] font-semibold">
                    Rose des vents
                  </span>
                </div>

                <div className="my-1.5 flex items-baseline justify-between">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl sm:text-4xl font-mono font-bold text-[#0c4a6e] tracking-tight">
                      {weather.windSpeedKmH}
                    </span>
                    <span className="text-xs font-mono font-bold text-[#0284c7]">km/h</span>
                  </div>
                  <div
                    className="w-7 h-7 rounded-full border border-[#7dd3fc] bg-[#f0f9ff] flex items-center justify-center text-[#0284c7] shadow-inner"
                    title={`Direction ${weather.windDirectionCompass} (${weather.windDirectionDeg}°)`}
                  >
                    <span
                      className="material-symbols-outlined text-sm transition-transform"
                      style={{ transform: `rotate(${weather.windDirectionDeg}deg)` }}
                    >
                      navigation
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-[#f0e6d2] text-[#475569]">
                  <span className="font-medium">Cap : {weather.windDirectionCompass} ({weather.windDirectionDeg}°)</span>
                  <span className="font-serif italic">
                    {weather.windSpeedKmH < 15 ? 'Brise douce' : weather.windSpeedKmH < 35 ? 'Vent modéré' : 'Vent soutenu'}
                  </span>
                </div>
              </div>

              {/* CARD 3: QUALITÉ DE L'AIR & PARTICULES (AQI, PM2.5, NO2, OZONE) */}
              <div className="p-3 rounded-xl bg-[#ffffff]/90 border border-[#d8c8a5] shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] uppercase tracking-[0.2em] font-sans font-bold text-[#15803d] flex items-center gap-1">
                    <span className="material-symbols-outlined text-[11px]">masks</span>
                    <span>QUALITÉ DE L'AIR</span>
                  </span>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                    AQI {weather.airQuality.aqi} • {weather.airQuality.aqiLabel}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-1.5 my-2 text-center">
                  <div className="p-1 rounded bg-[#fbf9f4] border border-[#ebdcc2]">
                    <div className="text-[8px] uppercase tracking-wider text-[#786345]">PM2.5</div>
                    <div className="text-[11px] font-mono font-bold text-[#1e293b]">{weather.airQuality.pm25}</div>
                  </div>
                  <div className="p-1 rounded bg-[#fbf9f4] border border-[#ebdcc2]">
                    <div className="text-[8px] uppercase tracking-wider text-[#786345]">PM10</div>
                    <div className="text-[11px] font-mono font-bold text-[#1e293b]">{weather.airQuality.pm10}</div>
                  </div>
                  <div className="p-1 rounded bg-[#fbf9f4] border border-[#ebdcc2]">
                    <div className="text-[8px] uppercase tracking-wider text-[#786345]">NO₂</div>
                    <div className="text-[11px] font-mono font-bold text-[#1e293b]">{weather.airQuality.no2}</div>
                  </div>
                  <div className="p-1 rounded bg-[#fbf9f4] border border-[#ebdcc2]">
                    <div className="text-[8px] uppercase tracking-wider text-[#786345]">O₃</div>
                    <div className="text-[11px] font-mono font-bold text-[#1e293b]">{weather.airQuality.ozone}</div>
                  </div>
                </div>

                <div className="text-[9px] font-serif italic text-right text-[#63533c] pt-1 border-t border-[#f0e6d2]">
                  Concentrations exprimées en µg/m³
                </div>
              </div>

              {/* CARD 4: POLLEN & ALLERGÈNES (Graminées, Bouleau, Olivier) */}
              <div className="p-3 rounded-xl bg-[#ffffff]/90 border border-[#d8c8a5] shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] uppercase tracking-[0.2em] font-sans font-bold text-[#b45309] flex items-center gap-1">
                    <span className="material-symbols-outlined text-[11px]">local_florist</span>
                    <span>INDICE POLLINIQUE</span>
                  </span>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-50 text-amber-900 border border-amber-200">
                    Risque {weather.airQuality.pollenLevel}
                  </span>
                </div>

                <div className="space-y-1 my-1 text-[10px] font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-[#645037]">Graminées</span>
                    <div className="flex items-center gap-1.5">
                      <div className="w-16 bg-[#eaddc6] h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-600 h-full rounded-full"
                          style={{ width: `${Math.min(weather.airQuality.grassPollen * 2.5, 100)}%` }}
                        />
                      </div>
                      <span className="font-bold text-[#2a1d0f]">{weather.airQuality.grassPollen}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[#645037]">Bouleau</span>
                    <div className="flex items-center gap-1.5">
                      <div className="w-16 bg-[#eaddc6] h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-amber-600 h-full rounded-full"
                          style={{ width: `${Math.min(weather.airQuality.birchPollen * 2.5, 100)}%` }}
                        />
                      </div>
                      <span className="font-bold text-[#2a1d0f]">{weather.airQuality.birchPollen}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[#645037]">Olivier</span>
                    <div className="flex items-center gap-1.5">
                      <div className="w-16 bg-[#eaddc6] h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-sky-600 h-full rounded-full"
                          style={{ width: `${Math.min(weather.airQuality.olivePollen * 3, 100)}%` }}
                        />
                      </div>
                      <span className="font-bold text-[#2a1d0f]">{weather.airQuality.olivePollen}</span>
                    </div>
                  </div>
                </div>

                <div className="text-[9px] font-serif italic text-right text-[#63533c] pt-1 border-t border-[#f0e6d2]">
                  Grains / m³ d'air
                </div>
              </div>
            </div>

            {/* ROW 2: ÉPHÉMÉRIDE DE LA SEMAINE (7 Jours: Pluie, Ensoleillé, Averses, Neige, Brouillard) */}
            <div className="p-3 sm:p-4 rounded-xl bg-[#ffffff]/95 border border-[#d8c8a5] shadow-sm">
              {/* Header */}
              <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-[#ebdcc2] flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[#8c6d23] text-sm">✦</span>
                  <h4 className="font-serif font-bold text-xs sm:text-sm text-[#2a1d0f] tracking-wide">
                    Prévisions Journalières de la Semaine (7 Jours)
                  </h4>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 text-[10px] font-serif text-[#645037]">
                  <span className="inline-flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px] text-blue-700">rainy</span> Pluie & Averses
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px] text-amber-600">wb_sunny</span> Ensoleillé
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px] text-sky-700">ac_unit</span> Neige
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px] text-stone-600">foggy</span> Brouillard
                  </span>
                </div>
              </div>

              {/* 7 Ultra-Sophisticated Slender Day Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                {weather.weeklyForecast.map((day, idx) => {
                  const cond = getArtisticCondition(day);
                  const isToday = idx === 0;

                  return (
                    <div
                      key={day.dateKey}
                      className={`p-2.5 rounded-lg border text-center transition-all ${
                        isToday
                          ? 'bg-[#faf6ee] border-[#b89033] shadow-sm ring-1 ring-[#b89033]/30'
                          : 'bg-[#fdfbf7] border-[#e8dac0] hover:border-[#b89033]'
                      }`}
                    >
                      {/* Day Label */}
                      <div className="text-[11px] font-serif font-bold text-[#2a1d0f]">
                        {day.dayName}
                      </div>
                      <div className="text-[9px] font-mono text-[#8c6d23]">
                        {day.dateKey.slice(5).replace('-', '/')}
                      </div>

                      {/* Micro Icon & Condition Label (Exact Matching Logo & Word) */}
                      <div className="my-1.5 flex flex-col items-center">
                        <span className={`material-symbols-outlined text-xl ${cond.color}`}>
                          {cond.icon}
                        </span>
                        <span className="text-[9px] font-serif italic text-[#4a3b22] mt-0.5">
                          {cond.label}
                        </span>
                      </div>

                      {/* Temperatures Max / Min */}
                      <div className="flex items-center justify-center gap-1 text-xs font-serif font-bold py-1 border-t border-[#f0e6d2]">
                        <span className="text-[#b91c1c]">{day.tempMax}°</span>
                        <span className="text-[#a89578] font-normal text-[10px]">/</span>
                        <span className="text-[#0369a1]">{day.tempMin}°</span>
                      </div>

                      {/* Rain Probability & Wind Max (displayed as km) */}
                      <div className="mt-1 pt-1 border-t border-[#f0e6d2] text-[9px] font-mono text-[#645037] space-y-0.5">
                        <div className="flex justify-between items-center">
                          <span className="text-[8px] text-[#786345]">Pluie</span>
                          <span className="font-bold text-[#1e293b]">{day.precipProb}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[8px] text-[#786345]">Vent</span>
                          <span className="font-bold text-[#0369a1]">{day.windMaxKmH} km</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Geolocation Notice (if fallback used) */}
            {geoError && (
              <div className="text-[10px] text-[#8c6d23] bg-[#fbf6ea] border border-[#e2d4b7] rounded-lg px-3 py-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="text-xs">✦</span>
                  <span>{geoError}</span>
                </span>
                <button
                  type="button"
                  onClick={handleRefresh}
                  className="underline font-serif text-[10px] cursor-pointer"
                >
                  Autoriser la géolocalisation
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
