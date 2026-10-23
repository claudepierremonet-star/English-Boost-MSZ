import React from 'react';
import { useAppTheme, type FloralBorderWidth } from '../theme/ThemeContext';

export const FloralBorderFrame: React.FC = () => {
  const { isFloral, isDark, floralWidth } = useAppTheme();

  if (!isFloral) return null;

  // Map 0.5cm, 0.75cm, 1cm to approximate pixel values on standard screens (1cm ~ 38px)
  const widthMap: Record<FloralBorderWidth, { css: string; px: number }> = {
    '0.5cm': { css: '0.5cm', px: 19 },
    '0.75cm': { css: '0.75cm', px: 28 },
    '1cm': { css: '1cm', px: 38 }
  };

  const { css, px } = widthMap[floralWidth] || widthMap['0.75cm'];
  const strokeColor = isDark ? '#d4af37' : '#785b24';
  const leafColor = isDark ? '#f2ca50' : '#556b2f';

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-50 overflow-hidden select-none"
      style={{
        border: `1px solid ${isDark ? 'rgba(212, 175, 55, 0.3)' : 'rgba(120, 91, 36, 0.25)'}`
      }}
    >
      {/* Outer Fine Hairline Framing the Border */}
      <div
        className="absolute inset-0 border"
        style={{
          borderColor: isDark ? 'rgba(242, 202, 80, 0.35)' : 'rgba(120, 91, 36, 0.3)'
        }}
      />

      {/* Inner Boundary Line separating the floral margin from the central content */}
      <div
        className="absolute border"
        style={{
          top: css,
          bottom: css,
          left: css,
          right: css,
          borderColor: isDark ? 'rgba(212, 175, 55, 0.25)' : 'rgba(120, 91, 36, 0.2)'
        }}
      />

      {/* TOP-LEFT BOTANICAL CORNER VIGNETTE */}
      <div
        className="absolute top-0 left-0"
        style={{ width: `${Math.max(64, px * 2.8)}px`, height: `${Math.max(64, px * 2.8)}px` }}
      >
        <svg viewBox="0 0 80 80" className="w-full h-full" fill="none" opacity={isDark ? 0.75 : 0.6}>
          <path
            d="M 6 74 C 6 30 30 6 74 6"
            stroke={strokeColor}
            strokeWidth="1.2"
            strokeDasharray="2 2"
          />
          <path
            d="M 2 78 C 2 35 35 2 78 2"
            stroke={strokeColor}
            strokeWidth="1.5"
          />
          {/* Subtle leaves */}
          <path d="M 24 16 C 28 12 34 14 36 18 C 34 22 28 20 24 16 Z" fill={leafColor} opacity="0.8" />
          <path d="M 16 24 C 12 28 14 34 18 36 C 22 34 20 28 16 24 Z" fill={leafColor} opacity="0.8" />
          <path d="M 44 8 C 48 5 54 7 55 11 C 53 14 47 13 44 8 Z" fill={leafColor} opacity="0.6" />
          <path d="M 8 44 C 5 48 7 54 11 55 C 14 53 13 47 8 44 Z" fill={leafColor} opacity="0.6" />
          {/* Small corner rosette */}
          <circle cx="10" cy="10" r="3" fill={strokeColor} />
          <circle cx="10" cy="10" r="5" stroke={strokeColor} strokeWidth="0.8" />
        </svg>
      </div>

      {/* TOP-RIGHT BOTANICAL CORNER VIGNETTE */}
      <div
        className="absolute top-0 right-0"
        style={{ width: `${Math.max(64, px * 2.8)}px`, height: `${Math.max(64, px * 2.8)}px` }}
      >
        <svg viewBox="0 0 80 80" className="w-full h-full transform scale-x-[-1]" fill="none" opacity={isDark ? 0.75 : 0.6}>
          <path d="M 6 74 C 6 30 30 6 74 6" stroke={strokeColor} strokeWidth="1.2" strokeDasharray="2 2" />
          <path d="M 2 78 C 2 35 35 2 78 2" stroke={strokeColor} strokeWidth="1.5" />
          <path d="M 24 16 C 28 12 34 14 36 18 C 34 22 28 20 24 16 Z" fill={leafColor} opacity="0.8" />
          <path d="M 16 24 C 12 28 14 34 18 36 C 22 34 20 28 16 24 Z" fill={leafColor} opacity="0.8" />
          <circle cx="10" cy="10" r="3" fill={strokeColor} />
          <circle cx="10" cy="10" r="5" stroke={strokeColor} strokeWidth="0.8" />
        </svg>
      </div>

      {/* BOTTOM-LEFT BOTANICAL CORNER VIGNETTE */}
      <div
        className="absolute bottom-0 left-0"
        style={{ width: `${Math.max(64, px * 2.8)}px`, height: `${Math.max(64, px * 2.8)}px` }}
      >
        <svg viewBox="0 0 80 80" className="w-full h-full transform scale-y-[-1]" fill="none" opacity={isDark ? 0.75 : 0.6}>
          <path d="M 6 74 C 6 30 30 6 74 6" stroke={strokeColor} strokeWidth="1.2" strokeDasharray="2 2" />
          <path d="M 2 78 C 2 35 35 2 78 2" stroke={strokeColor} strokeWidth="1.5" />
          <path d="M 24 16 C 28 12 34 14 36 18 C 34 22 28 20 24 16 Z" fill={leafColor} opacity="0.8" />
          <path d="M 16 24 C 12 28 14 34 18 36 C 22 34 20 28 16 24 Z" fill={leafColor} opacity="0.8" />
          <circle cx="10" cy="10" r="3" fill={strokeColor} />
          <circle cx="10" cy="10" r="5" stroke={strokeColor} strokeWidth="0.8" />
        </svg>
      </div>

      {/* BOTTOM-RIGHT BOTANICAL CORNER VIGNETTE */}
      <div
        className="absolute bottom-0 right-0"
        style={{ width: `${Math.max(64, px * 2.8)}px`, height: `${Math.max(64, px * 2.8)}px` }}
      >
        <svg viewBox="0 0 80 80" className="w-full h-full transform scale-x-[-1] scale-y-[-1]" fill="none" opacity={isDark ? 0.75 : 0.6}>
          <path d="M 6 74 C 6 30 30 6 74 6" stroke={strokeColor} strokeWidth="1.2" strokeDasharray="2 2" />
          <path d="M 2 78 C 2 35 35 2 78 2" stroke={strokeColor} strokeWidth="1.5" />
          <path d="M 24 16 C 28 12 34 14 36 18 C 34 22 28 20 24 16 Z" fill={leafColor} opacity="0.8" />
          <path d="M 16 24 C 12 28 14 34 18 36 C 22 34 20 28 16 24 Z" fill={leafColor} opacity="0.8" />
          <circle cx="10" cy="10" r="3" fill={strokeColor} />
          <circle cx="10" cy="10" r="5" stroke={strokeColor} strokeWidth="0.8" />
        </svg>
      </div>

      {/* Discrete running edge vine along Top Margin (strictly in the border area) */}
      <div
        className="absolute top-0 left-20 right-20 flex items-center justify-center overflow-hidden"
        style={{ height: css }}
      >
        <svg viewBox="0 0 400 16" className="w-full h-full max-w-lg" preserveAspectRatio="none" opacity={isDark ? 0.45 : 0.35}>
          <path d="M 0 8 Q 50 4 100 8 T 200 8 T 300 8 T 400 8" stroke={strokeColor} strokeWidth="0.8" fill="none" />
          <circle cx="100" cy="8" r="1.5" fill={leafColor} />
          <circle cx="200" cy="8" r="2" fill={strokeColor} />
          <circle cx="300" cy="8" r="1.5" fill={leafColor} />
          {/* Micro leaves */}
          <path d="M 150 7 C 153 4 157 5 158 8 C 155 9 152 8 150 7 Z" fill={leafColor} />
          <path d="M 250 9 C 253 12 257 11 258 8 C 255 7 252 8 250 9 Z" fill={leafColor} />
        </svg>
      </div>

      {/* Discrete running edge vine along Bottom Margin */}
      <div
        className="absolute bottom-0 left-20 right-20 flex items-center justify-center overflow-hidden"
        style={{ height: css }}
      >
        <svg viewBox="0 0 400 16" className="w-full h-full max-w-lg" preserveAspectRatio="none" opacity={isDark ? 0.45 : 0.35}>
          <path d="M 0 8 Q 50 12 100 8 T 200 8 T 300 8 T 400 8" stroke={strokeColor} strokeWidth="0.8" fill="none" />
          <circle cx="100" cy="8" r="1.5" fill={leafColor} />
          <circle cx="200" cy="8" r="2" fill={strokeColor} />
          <circle cx="300" cy="8" r="1.5" fill={leafColor} />
          <path d="M 150 9 C 153 12 157 11 158 8 C 155 7 152 8 150 9 Z" fill={leafColor} />
          <path d="M 250 7 C 253 4 257 5 258 8 C 255 9 252 8 250 7 Z" fill={leafColor} />
        </svg>
      </div>

      {/* Micro-label indicator on border for elegance */}
      <div
        className="absolute top-1 left-1/2 -translate-x-1/2 px-2 py-0.2 rounded text-[8px] font-serif uppercase tracking-[0.25em] font-semibold pointer-events-none"
        style={{
          color: isDark ? '#f2ca50' : '#785b24',
          opacity: 0.6
        }}
      >
        Édition Florale • {floralWidth}
      </div>
    </div>
  );
};
