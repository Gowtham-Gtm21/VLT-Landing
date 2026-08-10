const KEY = 'vlt_attribution';
const FIELDS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid'];

/**
 * Meta strips campaign parameters once the visitor navigates, so the values
 * are captured on first paint and kept for the rest of the session.
 */
export function captureAttribution() {
  if (typeof window === 'undefined') return {};

  const params = new URLSearchParams(window.location.search);
  const fromUrl = {};
  FIELDS.forEach((f) => {
    const v = params.get(f);
    if (v) fromUrl[f] = v;
  });

  const stored = readAttribution();
  const merged = {
    ...stored,
    ...fromUrl,
    landingPath: stored.landingPath || window.location.pathname,
    referrer: stored.referrer || document.referrer || '',
  };

  try {
    sessionStorage.setItem(KEY, JSON.stringify(merged));
  } catch {
    /* private mode — attribution is best effort */
  }

  return merged;
}

export function readAttribution() {
  try {
    return JSON.parse(sessionStorage.getItem(KEY) || '{}');
  } catch {
    return {};
  }
}
