/**
 * Demo mode powers preview.html: the same components and styles, but the
 * API call is stubbed so the file can be opened straight from disk with no
 * server and no database.
 * Production builds never set VITE_DEMO, so this stays false.
 */
export const IS_DEMO = import.meta.env.VITE_DEMO === 'true';

export const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
