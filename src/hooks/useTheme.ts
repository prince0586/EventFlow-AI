import { useState, useCallback, useEffect } from 'react';

export type Theme = 'light' | 'dark' | 'high-contrast';

/**
 * EventFlow AI - Theme Orchestration Hook
 * 
 * Manages the application's visual state, ensuring accessibility compliance 
 * through high-contrast support and synchronizing preferences with localStorage 
 * and system-level color schemes.
 * 
 * @returns {ThemeInterface} Object containing reactive theme state and toggle handlers.
 * @category Hooks
 */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>('light');

  /**
   * Effect logic to initialize the theme baseline.
   * Prioritizes persisted user preferences, falling back to system heuristics.
   */
  useEffect(() => {
    const savedTheme = localStorage.getItem('eventflow-theme') as Theme | null;
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const initialTheme = savedTheme || (systemDark ? 'dark' : 'light');
    setTheme(initialTheme);
  }, []);

  /**
   * Effect logic for document injection and persistence.
   * Synchronizes the DOM 'dark' class and localStorage key on state displacement.
   */
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark', 'high-contrast');
    root.classList.add(theme);
    localStorage.setItem('eventflow-theme', theme);
  }, [theme]);

  /**
   * Displaces the current theme between polarized Light/Dark states.
   */
  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  }, []);

  /**
   * Toggles the high-fidelity High Contrast mode for enhanced legibility.
   */
  const toggleHighContrast = useCallback(() => {
    setTheme(prev => prev === 'high-contrast' ? 'light' : 'high-contrast');
  }, []);

  return {
    theme,
    toggleTheme,
    toggleHighContrast,
    setTheme
  };
}
