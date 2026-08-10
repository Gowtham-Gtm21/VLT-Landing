/**
 * One place for every conversion event, so the three pages of the flow
 * report the same names to Meta and GA4.
 *
 *   Lead                 -> form submitted
 *   CompleteRegistration -> Thank You page reached (final conversion)
 */
export function track(event, data = {}) {
  if (typeof window === 'undefined') return;

  if (typeof window.fbq === 'function') {
    window.fbq('track', event, data);
  }

  if (typeof window.gtag === 'function') {
    window.gtag('event', event, data);
  }

  if (import.meta.env.DEV) {
    console.info('[track]', event, data);
  }
}

export function trackPageView() {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    window.fbq('track', 'PageView');
  }
}
