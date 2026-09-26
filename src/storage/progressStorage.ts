import AsyncStorage from '@react-native-async-storage/async-storage';
import { createJSONStorage } from 'zustand/middleware';

import type { Progress } from '@/types';

export const PROGRESS_STORAGE_KEY = '@projectlab/progress';
export const PROGRESS_STORAGE_VERSION = 1;

export type PersistedProgressState = Progress;

export const progressStorage = createJSONStorage<PersistedProgressState>(() => AsyncStorage);

export function migrateProgressState(
  persistedState: unknown,
  persistedVersion: number,
): PersistedProgressState {
  switch (persistedVersion) {
    // Add version-specific migrations here before increasing
    // PROGRESS_STORAGE_VERSION.
    default:
      return persistedState as PersistedProgressState;
  }
}
