/**
 * Sends a lead straight from the browser to a Google Apps Script web app.
 *
 * This is the no-backend path: with a static deploy and no API running,
 * `VITE_SHEET_WEBHOOK_URL` makes the sheet the lead store on its own. When the
 * Express API *is* running it already mirrors leads into the same sheet, so
 * this is not needed and should be left unset — see lib/api.js.
 *
 * Two things worth knowing about posting to Apps Script from a browser:
 *
 * 1. Apps Script does not return CORS headers, so a normal request is blocked
 *    even though it succeeds server-side. `mode: 'no-cors'` sends it anyway,
 *    at the cost of not being able to read the response — so a failure here is
 *    invisible to us. That is why the API path is preferred when available.
 * 2. A JSON content-type triggers a preflight that Apps Script rejects.
 *    text/plain avoids it; the script parses the body itself.
 */

const SHEET_URL = import.meta.env.VITE_SHEET_WEBHOOK_URL || '';
const SHEET_SECRET = import.meta.env.VITE_SHEET_SECRET || '';

export const sheetDirectEnabled = Boolean(SHEET_URL);

function row(values, attribution) {
  return {
    submittedAt: new Date().toISOString(),
    name: values.name || '',
    email: values.email || '',
    phone: values.phone || '',
    company: values.company || '',
    service: values.service || '',
    projectDetails: values.projectDetails || '',
    status: 'enquiry_received',
    scheduledAt: '',
    source: attribution?.utm_source || '',
    medium: attribution?.utm_medium || '',
    campaign: attribution?.utm_campaign || '',
    landingPath: attribution?.landingPath || '',
    referrer: attribution?.referrer || '',
    leadId: `web-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  };
}

export async function sendLeadToSheet(values, attribution, action = 'append', leadId) {
  if (!SHEET_URL) return null;

  const payload = row(values, attribution);

  // On an update the script matches by Lead ID and rewrites the whole row, so
  // the original details have to travel with it or they would be blanked.
  if (action === 'update') {
    try {
      const saved = JSON.parse(sessionStorage.getItem('vlt_lead') || '{}');
      payload.name = saved.name || payload.name;
      payload.email = saved.email || payload.email;
      payload.phone = saved.phone || payload.phone;
      payload.company = saved.company || '';
      payload.service = saved.service || '';
      payload.projectDetails = saved.projectDetails || '';
    } catch {
      /* session unavailable; the row keeps whatever was passed in */
    }
  }
  if (leadId) payload.leadId = leadId;
  if (action === 'update') {
    payload.status = 'appointment_booked';
    payload.scheduledAt = new Date().toISOString();
  }

  try {
    await fetch(SHEET_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ secret: SHEET_SECRET, action, row: payload }),
    });
    return payload.leadId;
  } catch (err) {
    // never block the visitor on this
    console.error('[sheet] direct submit failed:', err.message);
    return null;
  }
}
