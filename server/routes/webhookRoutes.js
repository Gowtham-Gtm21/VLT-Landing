import { Router } from 'express';
import crypto from 'node:crypto';
import Lead from '../models/Lead.js';
import { sendToSheet } from '../utils/sheets.js';
import { notifyWhatsApp, leadLines } from '../utils/whatsapp.js';

const router = Router();

/**
 * Safety net for the booking step. The browser already reports a booking, but
 * if the visitor closes the tab at the wrong moment this still records it —
 * and it is the only thing that catches a cancellation.
 *
 * Calendly: Integrations -> Webhooks -> invitee.created, invitee.canceled
 */
router.post('/calendly', async (req, res) => {
  const secret = process.env.CALENDLY_WEBHOOK_SECRET;
  const raw = req.body instanceof Buffer ? req.body.toString('utf8') : JSON.stringify(req.body);

  if (secret) {
    const header = req.get('Calendly-Webhook-Signature') || '';
    const parts = Object.fromEntries(header.split(',').map((p) => p.split('=')));

    if (!parts.t || !parts.v1) {
      return res.status(400).json({ success: false, message: 'Missing signature.' });
    }

    const expected = crypto.createHmac('sha256', secret).update(`${parts.t}.${raw}`).digest('hex');
    const ok =
      expected.length === parts.v1.length &&
      crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(parts.v1));

    if (!ok) return res.status(401).json({ success: false, message: 'Invalid signature.' });
  }

  let body;
  try {
    body = JSON.parse(raw);
  } catch {
    return res.status(400).json({ success: false, message: 'Invalid JSON.' });
  }

  const payload = body.payload || {};
  const leadId = payload.tracking?.utm_content; // set when the Calendly URL was built
  const email = payload.email;

  const filter = leadId ? { _id: leadId } : email ? { email: String(email).toLowerCase() } : null;
  if (!filter) return res.json({ success: true, message: 'No lead reference in payload.' });

  const cancelled = body.event === 'invitee.canceled';
  const update = cancelled
    ? { status: 'appointment_cancelled' }
    : {
        status: 'appointment_booked',
        scheduledAt: payload.scheduled_event?.start_time || new Date(),
        calendlyEventUri: payload.scheduled_event?.uri || '',
        calendlyInviteeUri: payload.uri || '',
      };

  try {
    const lead = await Lead.findOneAndUpdate(filter, update, {
      sort: { createdAt: -1 },
      new: true,
    });

    if (lead) {
      sendToSheet(lead, 'update');
      if (cancelled) notifyWhatsApp(leadLines(lead, 'Appointment cancelled'));
    }
  } catch (err) {
    console.error('Calendly webhook update failed:', err.message);
  }

  return res.json({ success: true });
});

export default router;
