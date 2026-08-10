const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

// Accepts +91 98765 43210, 09876543210, (044) 4000 1234 etc. Digits only count: 8-15.
export function isValidPhone(value = '') {
  const digits = String(value).replace(/\D/g, '');
  return digits.length >= 8 && digits.length <= 15;
}

export function isValidEmail(value = '') {
  return EMAIL_RE.test(String(value).trim());
}

export function validateLead(body = {}) {
  const errors = {};
  const name = String(body.name || '').trim();
  const email = String(body.email || '').trim();
  const phone = String(body.phone || '').trim();

  if (name.length < 2) errors.name = 'Enter your full name.';
  if (!isValidEmail(email)) errors.email = 'Enter a valid email address.';
  if (!isValidPhone(phone)) errors.phone = 'Enter a valid phone number with country code.';

  return { errors, valid: Object.keys(errors).length === 0 };
}


/**
 * Builds the Calendly URL the visitor is sent to after submitting.
 * Prefilling means they never retype anything on the booking screen, and
 * utm_content carries the lead id back through Calendly's webhook.
 */
export function buildCalendlyUrl(lead) {
  const base = process.env.CALENDLY_URL;
  if (!base) return '';

  try {
    const url = new URL(base);
    url.searchParams.set('name', lead.name);
    url.searchParams.set('email', lead.email);
    url.searchParams.set('a1', lead.phone); // Calendly's first custom question
    url.searchParams.set('hide_gdpr_banner', '1');
    url.searchParams.set('utm_content', String(lead._id));
    if (lead.attribution?.utm_source) url.searchParams.set('utm_source', lead.attribution.utm_source);
    if (lead.attribution?.utm_medium) url.searchParams.set('utm_medium', lead.attribution.utm_medium);
    if (lead.attribution?.utm_campaign)
      url.searchParams.set('utm_campaign', lead.attribution.utm_campaign);
    return url.toString();
  } catch {
    console.error('[calendly] CALENDLY_URL is not a valid URL:', base);
    return '';
  }
}
