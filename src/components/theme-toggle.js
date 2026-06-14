/**
 * theme-toggle.js
 *
 * Manages dark/light theme switching.
 * Sets [data-theme] on <html> and persists to localStorage.
 * Reads system preference as the default if no stored value.
 *
 * Usage: include this script BEFORE </head> or at top of <body>.
 * The toggle button must have id="theme-toggle".
 */

(function () {

  const STORAGE_KEY = 'learngit-theme';

  function getPreferred() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  function apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }

  /* Apply immediately on load to prevent flash */
  apply(getPreferred());

  document.addEventListener('DOMContentLoaded', function () {
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;

    btn.addEventListener('click', function () {
      const current = document.documentElement.getAttribute('data-theme') ?? 'dark';
      apply(current === 'dark' ? 'light' : 'dark');
    });
  });

})();
