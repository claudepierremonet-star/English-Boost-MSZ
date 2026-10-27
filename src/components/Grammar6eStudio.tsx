import React, { useState, useMemo } from 'react';
import {
  GRAMMAR_6E_ITEMS,
  GRAMMAR_6E_CATEGORIES,
  type Grammar6eItem
} from '../data/grammar6eData';
import { SentenceStructuringExercise } from './SentenceStructuringExercise';

interface Grammar6eStudioProps {
  onProgressUpdate?: (completedCount: number) => void;
}

export const Grammar6eStudio: React.FC<Grammar6eStudioProps> = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Toutes les catégories');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [completedItemIds, setCompletedItemIds] = useState<Set<string>>(new Set());

  // Filter items based on category and search query
  const filteredItems = useMemo(() => {
    return GRAMMAR_6E_ITEMS.filter((item) => {
      const matchesCategory =
        selectedCategory === 'Toutes les catégories' || item.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.rule.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.structure_formula.toLowerCase().includes(q) ||
        item.exercise.french_prompt.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [selectedCategory, searchQuery]);

  // Ensure selectedIndex stays valid when filter changes
  const activeItem: Grammar6eItem = filteredItems[selectedIndex] || filteredItems[0] || GRAMMAR_6E_ITEMS[0];

  const handleCompleteItem = (itemId: string) => {
    setCompletedItemIds((prev) => {
      const next = new Set(prev);
      next.add(itemId);
      return next;
    });
  };

  const handleNext = () => {
    if (selectedIndex < filteredItems.length - 1) {
      setSelectedIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (selectedIndex > 0) {
      setSelectedIndex((prev) => prev - 1);
    }
  };

  const progressPercent = Math.round((completedItemIds.size / GRAMMAR_6E_ITEMS.length) * 100);

  return (
    <div className="flex flex-col gap-5 w-full select-none animate-fadeIn">
      {/* HEADER BANNER */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#172033] via-[#1a2338] to-[#121927] border border-[#f2ca50]/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#232a3a] border border-[#f2ca50]/30 w-fit">
            <span className="material-symbols-outlined text-[#f2ca50] text-sm">psychology</span>
            <span className="text-[10px] font-mono font-bold text-[#d4c78f] uppercase tracking-wider">
              Cycle 3 • 6ème • 50 Fiches Fondamentales
            </span>
          </div>

          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#dce2f8] flex items-center gap-2">
            <span>Atelier Grammaire 6e & Structuration de Phrases</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#f2ca50]/20 text-[#f2ca50] font-mono font-bold border border-[#f2ca50]/30">
              50 Contenus
            </span>
          </h2>

          <p className="text-xs sm:text-sm text-[#d0c5af]/80 max-w-2xl leading-relaxed">
            Maîtrisez la syntaxe anglaise en recomposant les phrases mot par mot. Chaque fiche aborde une règle clé du programme officiel de 6ème (BE, HAVE GOT, Présent Simple, Modaux, Génitif, Mots interrogatifs).
          </p>
        </div>

        {/* PROGRESS METRIC */}
        <div className="p-3 rounded-xl bg-[#0c121e] border border-[#232a3a] flex flex-col gap-1.5 shrink-0 min-w-[190px]">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#99907c] font-mono">Progression 6e</span>
            <span className="text-[#f2ca50] font-bold font-mono">
              {completedItemIds.size}/50 ({progressPercent}%)
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-[#1c2436] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#d4af37] to-[#f2ca50] transition-all duration-300"
              style={{ width: `${Math.max(4, progressPercent)}%` }}
            />
          </div>
          <span className="text-[10px] text-[#99907c] font-mono text-center">
            {50 - completedItemIds.size} fiches restantes à valider
          </span>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="flex flex-col gap-3">
        {/* Search */}
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#99907c]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Rechercher parmi les 50 règles de grammaire 6e (ex: have got, présent simple, can, who, there is)..."
            className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-[#151b2b] border border-[#232a3a] text-xs text-[#dce2f8] focus:border-[#f2ca50] focus:outline-none focus:ring-1 focus:ring-[#f2ca50]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedIndex(0);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#99907c] hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category Pills Scroller */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {GRAMMAR_6E_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat);
                  setSelectedIndex(0);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all ${
                  isSelected
                    ? 'bg-[#f2ca50] text-[#3c2f00] font-bold shadow-md shadow-[#f2ca50]/20'
                    : 'bg-[#151b2b] text-[#d0c5af] hover:text-[#f2ca50] border border-[#232a3a]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* HORIZONTAL SCRUBBER / QUICK JUMP OF 50 CARDS */}
      <div className="p-3 rounded-xl bg-[#111726] border border-[#232a3a] flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs text-[#99907c]">
          <span className="font-mono">
            {filteredItems.length} fiche(s) disponible(s) • Fiche #{activeItem.number} :{' '}
            <strong className="text-[#f2ca50]">{activeItem.title}</strong>
          </span>
          <span className="text-[11px] font-mono text-[#d4c78f]">
            Sélection rapide (1 à 50)
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 pt-0.5 no-scrollbar">
          {filteredItems.map((item, idx) => {
            const isSelected = idx === selectedIndex;
            const isDone = completedItemIds.has(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                className={`w-9 h-9 rounded-lg font-mono text-xs font-bold shrink-0 transition-all flex flex-col items-center justify-center relative ${
                  isSelected
                    ? 'bg-[#f2ca50] text-[#3c2f00] scale-105 shadow-md shadow-[#f2ca50]/30 ring-2 ring-[#f2ca50]'
                    : isDone
                    ? 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-300'
                    : 'bg-[#182133] border border-[#28344e] text-[#dce2f8] hover:bg-[#232f48]'
                }`}
                title={`#${item.number} - ${item.title}`}
              >
                <span>{item.number}</span>
                {isDone && !isSelected && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-black" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ACTIVE GRAMMAR MODULE & INTERACTIVE EXERCISE */}
      <SentenceStructuringExercise
        item={activeItem}
        onComplete={handleCompleteItem}
        onNext={handleNext}
        onPrev={handlePrev}
        hasPrev={selectedIndex > 0}
        hasNext={selectedIndex < filteredItems.length - 1}
        currentIndex={selectedIndex + 1}
        totalCount={filteredItems.length}
      />
    </div>
  );
};
