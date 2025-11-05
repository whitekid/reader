/**
 * Theme Management
 *
 * Handles 2-way theme toggle (Light/Dark) for the Reader application.
 * Provides manual theme selection with localStorage persistence.
 *
 * @module theme
 */

(function() {
  'use strict';

  /**
   * Valid theme values
   * @constant {string[]}
   */
  const VALID_THEMES = ['light', 'dark'];

  /**
   * Theme icon mapping
   * @constant {Object.<string, string>}
   */
  const THEME_ICONS = {
    light: '☀️',
    dark: '🌙'
  };

  /**
   * Get current theme from DOM attribute or localStorage
   * @returns {string} Current theme: "light" | "dark"
   */
  function getCurrentTheme() {
    // First check DOM attribute
    const domTheme = document.documentElement.getAttribute('data-theme');
    if (domTheme && VALID_THEMES.includes(domTheme)) {
      return domTheme;
    }

    // Fallback to localStorage
    try {
      const storedTheme = localStorage.getItem('theme');
      if (storedTheme && VALID_THEMES.includes(storedTheme)) {
        return storedTheme;
      }
    } catch (e) {
      // localStorage unavailable (private browsing, etc.)
      console.warn('localStorage unavailable:', e);
    }

    // Default to light theme
    return 'light';
  }

  /**
   * Calculate next theme: light → dark → light
   * @param {string} currentTheme - Current theme value
   * @returns {string} Next theme
   */
  function getNextTheme(currentTheme) {
    return currentTheme === 'light' ? 'dark' : 'light';
  }

  /**
   * Apply theme to DOM and persist to localStorage
   * @param {string} theme - Theme to apply: "light" | "dark"
   */
  function applyTheme(theme) {
    // Validate theme value
    if (!VALID_THEMES.includes(theme)) {
      console.warn('Invalid theme:', theme);
      return;
    }

    // Update DOM attribute
    document.documentElement.setAttribute('data-theme', theme);

    // Persist to localStorage with error handling
    try {
      localStorage.setItem('theme', theme);
    } catch (e) {
      // localStorage write failed (private browsing, quota exceeded, disabled)
      console.warn('Theme preference not saved (localStorage unavailable):', e.name);
      // Continue - theme still works for current session
    }

    // Update button state
    updateButtonState(theme);
  }

  /**
   * Update button icon and accessibility attributes
   * @param {string} theme - Current theme value
   */
  function updateButtonState(theme) {
    const button = document.getElementById('theme-toggle');
    if (!button) return;

    const icon = THEME_ICONS[theme] || THEME_ICONS.light;
    button.textContent = icon;
    button.setAttribute('title', `Theme: ${theme}`);
    button.setAttribute('aria-label', `Toggle theme (current: ${theme})`);
  }

  /**
   * Handle theme toggle button click
   * @param {Event} event - Click event
   */
  function handleToggleClick(event) {
    event.preventDefault();
    const currentTheme = getCurrentTheme();
    const nextTheme = getNextTheme(currentTheme);
    applyTheme(nextTheme);
  }

  // Initialize on DOMContentLoaded
  document.addEventListener('DOMContentLoaded', function() {
    const button = document.getElementById('theme-toggle');
    if (button) {
      // Attach click handler
      button.addEventListener('click', handleToggleClick);

      // Initialize button state
      const currentTheme = getCurrentTheme();
      updateButtonState(currentTheme);
    }
  });

})();
