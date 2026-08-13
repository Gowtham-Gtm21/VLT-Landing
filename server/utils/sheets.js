/**
 * Mirrors every lead into a Google Sheet.
 *
 * Posts to a Google Apps Script web app rather than the Sheets REST API, which
 * avoids a service-account key file, OAuth scopes and a Cloud project — the
 *
 * Fire-and-forget, like the mailer and the WhatsApp notifier: the lead is
 * already in MongoDB before this runs, so a bad URL or a Google outage cannot
 * fail the visitor's submission. Failures are logged, not thrown.
 */

function config() {
  return {
    url: process.env.GOOGLE_SHEET_WEBHOOK_URL,
    secret: process.env.GOOGLE_SHEET_SECRET || '',
  };
}

export function sheetConfigured() {
  return Boolean(config().url);
}

/** One row per lead. Column order here must match the header in the sheet. */
export function leadRow(lead) {
  return {
    submittedAt: new Date(lead.createdAt || Date.now()).toISOString(),
    name: lead.name || '',
    email: lead.email || '',
    phone: lead.phone || '',
    company: lead.company || '',
    service: lead.service || '',
    projectDetails: lead.projectDetails || '',
    status: lead.status || 'new',
    scheduledAt: lead.scheduledAt ? new Date(lead.scheduledAt).toISOString() : '',
    contactedAt: lead.contactedAt ? new Date(lead.contactedAt).toISOString() : '',
    notes: lead.notes || '',
    source: lead.attribution?.utm_source || '',
    medium: lead.attribution?.utm_medium || '',
    campaign: lead.attribution?.utm_campaign || '',
    landingPath: lead.attribution?.landingPath || '',
    referrer: lead.attribution?.referrer || '',
    leadId: String(lead._id || ''),
  };
}

/**
 * `action` is 'append' for a new enquiry, or 'update' when a slot is booked or
 * the team changes the status — the script matches on leadId, so an update
 * rewrites the same row rather than adding a second one.
 */
export async function sendToSheet(lead, action = 'append') {
  const { url, secret } = config();

  if (!url) {
    if (process.env.NODE_ENV !== 'production') {
      console.info('[sheets] not configured, skipping row for', lead.email);
    }
    return false;
  }

  const body = JSON.stringify({ secret, action, row: leadRow(lead) });

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url, {
      method: 'POST',
      // Apps Script web apps reject a JSON preflight; text/plain avoids it
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body,
      redirect: 'follow',
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      console.error(`[sheets] ${action} failed ${res.status}`);
      return false;
    }

    const text = await res.text().catch(() => '');
    if (text && !text.includes('"ok":true')) {
      console.error('[sheets] script replied:', text.slice(0, 200));
      return false;
    }

    return true;
  } catch (err) {
    console.error('[sheets] error:', err.name === 'AbortError' ? 'timed out' : err.message);
    return false;
  }
}
