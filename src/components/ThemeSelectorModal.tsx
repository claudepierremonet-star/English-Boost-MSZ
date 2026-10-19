import React from 'react';
import { useAppTheme, type AppTheme, type FloralBorderWidth } from '../theme/ThemeContext';

interface ThemeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ThemeSelectorModal: React.FC<ThemeSelectorModalProps> = ({ isOpen, onClose }) => {
  const { theme, floralWidth, setTheme, setFloralWidth, isDark } = useAppTheme();

  if (!isOpen) return null;

  const skins: Array<{
    id: AppTheme;
    name: string;
    category: string;
    description: string;
    previewBg: string;
    previewBorder: string;
    previewAccent: string;
    isFloral: boolean;
  }> = [
    {
      id: 'dark',
      name: 'Nocturne Classique',
      category: 'Version Sombre',
      description: 'Bleu marine abyssal, or champagne et photographie de bibliothèque victorienne.',
      previewBg: '#0c1322',
      previewBorder: '#4d4635',
      previewAccent: '#f2ca50',
      isFloral: false
    },
    {
      id: 'light',
      name: 'Clair Albâtre',
      category: 'Version Claire',
      description: 'Parchemin ivoire, encres bistre d’archives et contrastes doux pour lecture en plein jour.',
      previewBg: '#f7f4ee',
      previewBorder: '#d6cebe',
      previewAccent: '#9a6700',
      isFloral: false
    },
    {
      id: 'dark-floral',
      name: 'Nocturne Florale',
      category: 'Version Sombre Florale',
      description: 'Nuit profonde parée d’une bordure végétale dorée de 0,5 à 1 cm aux pourtours de l’écran.',
      previewBg: '#0c1322',
      previewBorder: '#f2ca50',
      previewAccent: '#f2ca50',
      isFloral: true
    },
    {
      id: 'light-floral',
      name: 'Clair Botanique',
      category: 'Version Claire Florale',
      description: 'Parchemin lumineux bordé de rinceaux d’acanthe et de lauriers discrets sur 0,5 à 1 cm.',
      previewBg: '#f7f4ee',
      previewBorder: '#785b24',
      previewAccent: '#785b24',
      isFloral: true
    }
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn select-none"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-lg rounded-2xl p-6 shadow-2xl border flex flex-col gap-5 ${
          isDark
            ? 'bg-[#191f2f] border-[#f2ca50]/40 text-[#dce2f8]'
            : 'bg-[#ffffff] border-[#d6cebe] text-[#1c1917]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`material-symbols-outlined text-xl ${isDark ? 'text-[#f2ca50]' : 'text-[#9a6700]'}`}>
              palette
            </span>
            <div>
              <h2 className="font-serif text-lg sm:text-xl font-bold">
                Choix de la Peau & Thème
              </h2>
              <p className="text-xs opacity-75">
                Personnalisez l’ambiance chromatique et les bordures florales
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              isDark ? 'bg-[#232a3a] text-[#d0c5af] hover:text-[#f2ca50]' : 'bg-[#f2eee5] text-[#78716c] hover:text-[#1c1917]'
            }`}
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>

        {/* 4 Theme Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {skins.map((skin) => {
            const isSelected = theme === skin.id;
            return (
              <button
                key={skin.id}
                type="button"
                onClick={() => setTheme(skin.id)}
                className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between gap-3 active:scale-[0.98] ${
                  isSelected
                    ? isDark
                      ? 'border-[#f2ca50] bg-[#232a3a] shadow-lg shadow-[#f2ca50]/15 ring-1 ring-[#f2ca50]'
                      : 'border-[#9a6700] bg-[#fbf9f5] shadow-lg shadow-[#9a6700]/15 ring-1 ring-[#9a6700]'
                    : isDark
                    ? 'border-[#4d4635]/40 bg-[#151b2b] hover:bg-[#232a3a]'
                    : 'border-[#e7dfd3] bg-[#f7f4ee] hover:bg-[#f2eee5]'
                }`}
              >
                {/* Visual Swatch Strip */}
                <div className="flex items-center justify-between w-full">
                  <div
                    className="w-10 h-10 rounded-lg shadow-inner flex items-center justify-center relative overflow-hidden border"
                    style={{
                      backgroundColor: skin.previewBg,
                      borderColor: skin.previewBorder
                    }}
                  >
                    {skin.isFloral ? (
                      <span
                        className="material-symbols-outlined text-sm"
                        style={{ color: skin.previewAccent }}
                      >
                        local_florist
                      </span>
                    ) : (
                      <span
                        className="material-symbols-outlined text-sm"
                        style={{ color: skin.previewAccent }}
                      >
                        {skin.id === 'dark' ? 'dark_mode' : 'light_mode'}
                      </span>
                    )}

                    {/* Miniature representation of the outer 0.5-1cm border */}
                    {skin.isFloral && (
                      <div
                        className="absolute inset-0 border-[3px]"
                        style={{ borderColor: skin.previewBorder }}
                      />
                    )}
                  </div>

                  <span
                    className={`material-symbols-outlined text-lg ${
                      isSelected
                        ? isDark
                          ? 'text-[#f2ca50]'
                          : 'text-[#9a6700]'
                        : 'opacity-30'
                    }`}
                  >
                    {isSelected ? 'check_circle' : 'radio_button_unchecked'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider font-mono opacity-80">
                    {skin.category}
                  </span>
                  <h3 className="font-serif font-bold text-sm leading-tight mt-0.5">
                    {skin.name}
                  </h3>
                  <p className="text-[11px] opacity-75 mt-1 leading-snug line-clamp-2">
                    {skin.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Floral Border Width Configuration (Only active for floral skins) */}
        {(theme === 'dark-floral' || theme === 'light-floral') && (
          <div
            className={`p-4 rounded-xl border flex flex-col gap-2.5 animate-fadeIn ${
              isDark
                ? 'bg-[#070e1d] border-[#f2ca50]/40'
                : 'bg-[#f7f4ee] border-[#9a6700]/30'
            }`}
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-serif font-bold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">local_florist</span>
                Largeur de la Bordure Florale
              </span>
              <span className="font-mono font-bold">{floralWidth}</span>
            </div>

            <p className="text-[11px] opacity-75 leading-relaxed">
              Bordure végétale discrète confinée strictement à la périphérie extérieure de l'application, sans gêner la lisibilité des textes.
            </p>

            <div className="grid grid-cols-3 gap-2 pt-1">
              {(['0.5cm', '0.75cm', '1cm'] as FloralBorderWidth[]).map((width) => (
                <button
                  key={width}
                  type="button"
                  onClick={() => setFloralWidth(width)}
                  className={`py-2 rounded-lg text-xs font-mono font-bold transition-all border ${
                    floralWidth === width
                      ? isDark
                        ? 'bg-[#f2ca50] text-[#3c2f00] border-[#f2ca50] shadow-sm'
                        : 'bg-[#9a6700] text-white border-[#9a6700] shadow-sm'
                      : isDark
                      ? 'bg-[#191f2f] text-[#dce2f8] border-[#4d4635]/40 hover:bg-[#232a3a]'
                      : 'bg-white text-[#1c1917] border-[#d6cebe] hover:bg-[#f2eee5]'
                  }`}
                >
                  {width}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Modal Close CTA */}
        <button
          type="button"
          onClick={onClose}
          className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-all ${
            isDark
              ? 'bg-[#f2ca50] text-[#3c2f00] hover:bg-[#ffe088]'
              : 'bg-[#9a6700] text-white hover:bg-[#855700]'
          }`}
        >
          Appliquer cette Peau
        </button>
      </div>
    </div>
  );
};
