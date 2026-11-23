import { useState, useEffect, useMemo, useCallback } from 'react';
import type { UserProfile, LearningAttempt, FlashcardProgress } from '../firebase/types';
import {
  getLocalUserProfile,
  getUserLearningAttempts,
  getStoredFlashcardProgressList
} from '../firebase/client';
import { getCityMapProgression } from '../utils/cityMapManager';
import {
  evaluateAdaptiveLearning,
  getCompletedTenMinBlockIds,
  TEN_MIN_SESSION_UPDATED_EVENT,
  type AdaptiveAssessmentResult
} from '../services/adaptiveEngine';

export interface UseAdaptiveProfileReturn {
  user: UserProfile;
  attempts: LearningAttempt[];
  flashcards: FlashcardProgress[];
  assessment: AdaptiveAssessmentResult;
  completedTenMinIds: string[];
  isLoading: boolean;
  refresh: () => Promise<void>;
}

/**
 * Global reactive hook connecting every view (Accueil, Cursus, Game, Atelier, Dashboard, Profil)
 * to the centralized Adaptive Learning Engine and live telemetry.
 */
export function useAdaptiveProfile(externalUser?: UserProfile): UseAdaptiveProfileReturn {
  const [internalUser, setInternalUser] = useState<UserProfile>(() => externalUser || getLocalUserProfile());
  const effectiveUser = externalUser || internalUser;

  const [attempts, setAttempts] = useState<LearningAttempt[]>([]);
  const [flashcards, setFlashcards] = useState<FlashcardProgress[]>([]);
  const [cityProg, setCityProg] = useState(() => getCityMapProgression());
  const [completedTenMinIds, setCompletedTenMinIds] = useState<string[]>(() =>
    getCompletedTenMinBlockIds()
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadTelemetry = useCallback(async () => {
    try {
      const latestUser = externalUser || getLocalUserProfile();
      if (!externalUser) {
        setInternalUser(latestUser);
      }
      const [{ attempts: atts }, cards] = await Promise.all([
        getUserLearningAttempts(latestUser.uid, 120),
        getStoredFlashcardProgressList()
      ]);
      setAttempts(atts);
      setFlashcards(cards);
      setCityProg(getCityMapProgression());
      setCompletedTenMinIds(getCompletedTenMinBlockIds());
    } catch {
      // safe offline fallback
    } finally {
      setIsLoading(false);
    }
  }, [externalUser]);

  useEffect(() => {
    loadTelemetry();

    const handleRefresh = () => {
      loadTelemetry();
    };
    const handleTenMinUpdate = (e: Event) => {
      const ce = e as CustomEvent<string[]>;
      if (Array.isArray(ce.detail)) {
        setCompletedTenMinIds(ce.detail);
      } else {
        setCompletedTenMinIds(getCompletedTenMinBlockIds());
      }
    };

    window.addEventListener('eb_attempts_updated', handleRefresh);
    window.addEventListener('eb_city_map_updated', handleRefresh);
    window.addEventListener(TEN_MIN_SESSION_UPDATED_EVENT, handleTenMinUpdate);

    return () => {
      window.removeEventListener('eb_attempts_updated', handleRefresh);
      window.removeEventListener('eb_city_map_updated', handleRefresh);
      window.removeEventListener(TEN_MIN_SESSION_UPDATED_EVENT, handleTenMinUpdate);
    };
  }, [loadTelemetry, effectiveUser.uid, effectiveUser.level, effectiveUser.schoolGrade, effectiveUser.stats?.totalXp, effectiveUser.placementTest?.completedAt]);

  const assessment = useMemo(
    () => evaluateAdaptiveLearning(effectiveUser, attempts, flashcards, cityProg),
    [effectiveUser, attempts, flashcards, cityProg]
  );

  return {
    user: effectiveUser,
    attempts,
    flashcards,
    assessment,
    completedTenMinIds,
    isLoading,
    refresh: loadTelemetry
  };
}
