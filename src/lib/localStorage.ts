/**
 * localStorage Utilities for InspirasiHub
 * Handles favorites, history, and user preferences
 */

import { Quote } from '@/types';

// Storage keys
const STORAGE_KEYS = {
  FAVORITES: 'inspirasi_favorites',
  HISTORY: 'inspirasi_history',
  PREFERENCES: 'inspirasi_preferences',
  LAST_VISIT: 'inspirasi_last_visit'
} as const;

// User preferences interface
export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  defaultCategory: string | null;
  autoPlay: boolean;
  showAuthor: boolean;
  historyLimit: number;
}

// Default preferences
const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'auto',
  defaultCategory: null,
  autoPlay: true,
  showAuthor: true,
  historyLimit: 50
};

/**
 * Safely parse JSON from localStorage
 */
function safeParseJSON<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  
  try {
    return JSON.parse(value);
  } catch (error) {
    console.warn('Failed to parse localStorage value:', error);
    return fallback;
  }
}

/**
 * Safely stringify and save to localStorage
 */
function safeSaveJSON(key: string, value: any): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
    return false;
  }
}

// =============================================================================
// FAVORITES MANAGEMENT
// =============================================================================

/**
 * Get all favorite quotes
 */
export function getFavorites(): Quote[] {
  const stored = localStorage.getItem(STORAGE_KEYS.FAVORITES);
  return safeParseJSON(stored, []);
}

/**
 * Add quote to favorites
 */
export function addToFavorites(quote: Quote): boolean {
  const favorites = getFavorites();
  
  // Check if already in favorites
  if (favorites.some(fav => fav.id === quote.id)) {
    return false; // Already exists
  }
  
  favorites.unshift(quote); // Add to beginning
  return safeSaveJSON(STORAGE_KEYS.FAVORITES, favorites);
}

/**
 * Remove quote from favorites
 */
export function removeFromFavorites(quoteId: string): boolean {
  const favorites = getFavorites();
  const filtered = favorites.filter(fav => fav.id !== quoteId);
  return safeSaveJSON(STORAGE_KEYS.FAVORITES, filtered);
}

/**
 * Check if quote is in favorites
 */
export function isFavorite(quoteId: string): boolean {
  const favorites = getFavorites();
  return favorites.some(fav => fav.id === quoteId);
}

/**
 * Get favorites count
 */
export function getFavoritesCount(): number {
  return getFavorites().length;
}

/**
 * Clear all favorites
 */
export function clearFavorites(): boolean {
  return safeSaveJSON(STORAGE_KEYS.FAVORITES, []);
}

// =============================================================================
// HISTORY MANAGEMENT
// =============================================================================

/**
 * Get quote history
 */
export function getHistory(): Quote[] {
  const stored = localStorage.getItem(STORAGE_KEYS.HISTORY);
  return safeParseJSON(stored, []);
}

/**
 * Add quote to history
 */
export function addToHistory(quote: Quote): boolean {
  const preferences = getPreferences();
  let history = getHistory();
  
  // Remove if already exists (to move to top)
  history = history.filter(item => item.id !== quote.id);
  
  // Add to beginning
  history.unshift(quote);
  
  // Limit history size
  if (history.length > preferences.historyLimit) {
    history = history.slice(0, preferences.historyLimit);
  }
  
  return safeSaveJSON(STORAGE_KEYS.HISTORY, history);
}

/**
 * Clear quote history
 */
export function clearHistory(): boolean {
  return safeSaveJSON(STORAGE_KEYS.HISTORY, []);
}

/**
 * Get recent quotes (last 10)
 */
export function getRecentQuotes(limit: number = 10): Quote[] {
  const history = getHistory();
  return history.slice(0, limit);
}

// =============================================================================
// USER PREFERENCES
// =============================================================================

/**
 * Get user preferences
 */
export function getPreferences(): UserPreferences {
  const stored = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
  return { ...DEFAULT_PREFERENCES, ...safeParseJSON(stored, {}) };
}

/**
 * Update user preferences
 */
export function updatePreferences(updates: Partial<UserPreferences>): boolean {
  const current = getPreferences();
  const updated = { ...current, ...updates };
  return safeSaveJSON(STORAGE_KEYS.PREFERENCES, updated);
}

/**
 * Reset preferences to default
 */
export function resetPreferences(): boolean {
  return safeSaveJSON(STORAGE_KEYS.PREFERENCES, DEFAULT_PREFERENCES);
}

// =============================================================================
// ANALYTICS & TRACKING
// =============================================================================

/**
 * Record last visit timestamp
 */
export function recordVisit(): boolean {
  return safeSaveJSON(STORAGE_KEYS.LAST_VISIT, new Date().toISOString());
}

/**
 * Get last visit date
 */
export function getLastVisit(): Date | null {
  const stored = localStorage.getItem(STORAGE_KEYS.LAST_VISIT);
  if (!stored) return null;
  
  try {
    return new Date(JSON.parse(stored));
  } catch {
    return null;
  }
}

/**
 * Get usage statistics
 */
export function getUsageStats() {
  return {
    favoritesCount: getFavoritesCount(),
    historyCount: getHistory().length,
    lastVisit: getLastVisit(),
    preferences: getPreferences()
  };
}

// =============================================================================
// EXPORT/IMPORT UTILITIES
// =============================================================================

/**
 * Export user data for backup
 */
export function exportUserData() {
  return {
    favorites: getFavorites(),
    history: getHistory(),
    preferences: getPreferences(),
    exportDate: new Date().toISOString(),
    version: '1.1.0'
  };
}

/**
 * Import user data from backup
 */
export function importUserData(data: any): boolean {
  try {
    if (data.favorites) {
      safeSaveJSON(STORAGE_KEYS.FAVORITES, data.favorites);
    }
    if (data.history) {
      safeSaveJSON(STORAGE_KEYS.HISTORY, data.history);
    }
    if (data.preferences) {
      safeSaveJSON(STORAGE_KEYS.PREFERENCES, { ...DEFAULT_PREFERENCES, ...data.preferences });
    }
    return true;
  } catch (error) {
    console.error('Failed to import user data:', error);
    return false;
  }
}
