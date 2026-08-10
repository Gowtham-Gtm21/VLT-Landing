import { IS_DEMO, wait } from './demo';
import { sheetDirectEnabled, sendLeadToSheet } from './sheet';

const BASE = import.meta.env.VITE_API_URL || '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  let data = {};
  try {
    data = await res.json();
  } catch {
    /* empty body */
  }

  if (!res.ok) {
    const error = new Error(data.message || 'Request failed. Please try again.');
    error.status = res.status;
    error.fieldErrors = data.errors || {};
    throw error;
  }

  return data;
}

export async function submitLead(payload) {
  if (IS_DEMO) {
    await wait(500);
    return { success: true, leadId: 'demo-lead', calendlyUrl: '' };
  }

  // No API deployed: the Google Sheet is the lead store. The browser posts
  // there directly, which is the whole backend for a static-only deploy.
  if (sheetDirectEnabled) {
    const leadId = await sendLeadToSheet(payload, payload.attribution);
    return { success: true, leadId, calendlyUrl: import.meta.env.VITE_CALENDLY_URL || '' };
  }

  return request('/leads', { method: 'POST', body: JSON.stringify(payload) });
}

/**
 * Called the moment Calendly reports a booking, so the lead's status, sheet
 * row and WhatsApp alert all reflect it. The server-side Calendly webhook is
 * the backup if the visitor closes the tab before this lands.
 */
export async function markScheduled(leadId, payload) {
  if (IS_DEMO) {
    await wait(200);
    return { success: true, status: 'appointment_booked' };
  }

  if (sheetDirectEnabled) {
    await sendLeadToSheet({}, {}, 'update', leadId);
    return { success: true, status: 'appointment_booked' };
  }

  return request(`/leads/${leadId}/scheduled`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}
