import Lead from '../models/Lead.js';
import { validateLead, buildCalendlyUrl } from '../utils/validate.js';
import { notifyTeam } from '../utils/mailer.js';
import { notifyWhatsApp, leadLines } from '../utils/whatsapp.js';
import { sendToSheet } from '../utils/sheets.js';

/**
 * POST /api/leads
 * Stores the enquiry, then pushes it to WhatsApp and the Google Sheet.
 *
 * The lead is written to MongoDB first and the notifications are
 * fire-and-forget afterwards, so a WhatsApp outage or a bad sheet URL can
 * never fail a visitor's submission.
 */
export async function createLead(req, res, next) {
  try {
    // honeypot: bots fill hidden fields, humans never see them
    if (req.body.website) {
      return res.status(200).json({ success: true, leadId: null });
    }

    const { valid, errors } = validateLead(req.body);
    if (!valid) {
      return res.status(422).json({ success: false, message: 'Please check the form.', errors });
    }

    const lead = await Lead.create({
      name: String(req.body.name).trim(),
      email: String(req.body.email).trim().toLowerCase(),
      phone: String(req.body.phone).trim(),
      company: String(req.body.company || '').trim(),
      service: req.body.service,
      projectDetails: String(req.body.projectDetails || '').trim(),
      attribution: {
        utm_source: req.body.attribution?.utm_source,
        utm_medium: req.body.attribution?.utm_medium,
        utm_campaign: req.body.attribution?.utm_campaign,
        utm_content: req.body.attribution?.utm_content,
        utm_term: req.body.attribution?.utm_term,
        fbclid: req.body.attribution?.fbclid,
        landingPath: req.body.attribution?.landingPath,
        referrer: req.body.attribution?.referrer,
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent') || '',
    });

    sendToSheet(lead, 'append');
    notifyWhatsApp(leadLines(lead, 'New enquiry'));

    notifyTeam(`New enquiry: ${lead.name}${lead.company ? ` (${lead.company})` : ''}`, [
      `Name: ${lead.name}`,
      `Email: ${lead.email}`,
      `Phone: ${lead.phone}`,
      `Company: ${lead.company || '-'}`,
      `Service: ${lead.service}`,
      `Details: ${lead.projectDetails || '-'}`,
      `Campaign: ${lead.attribution?.utm_campaign || '-'}`,
    ]);

    return res.status(201).json({
      success: true,
      leadId: lead._id,
      calendlyUrl: buildCalendlyUrl(lead),
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * PATCH /api/leads/:id/scheduled
 * Called by the browser the moment Calendly reports `event_scheduled`.
 * Records the booking, updates the sheet row, and alerts WhatsApp again.
 */
export async function markScheduled(req, res, next) {
  try {
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      {
        status: 'appointment_booked',
        scheduledAt: req.body.scheduledAt ? new Date(req.body.scheduledAt) : new Date(),
        calendlyEventUri: req.body.eventUri || '',
        calendlyInviteeUri: req.body.inviteeUri || '',
      },
      { new: true }
    );

    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found.' });

    sendToSheet(lead, 'update');
    notifyWhatsApp([
      ...leadLines(lead, 'Appointment booked'),
      lead.scheduledAt ? `When: ${new Date(lead.scheduledAt).toLocaleString('en-IN')}` : null,
    ].filter(Boolean));

    notifyTeam(`Appointment booked: ${lead.name}`, [
      `Name: ${lead.name}`,
      `Email: ${lead.email}`,
      `Phone: ${lead.phone}`,
      `Calendly event: ${lead.calendlyEventUri || '-'}`,
    ]);

    return res.json({ success: true, status: lead.status });
  } catch (err) {
    return next(err);
  }
}

/**
 * PATCH /api/leads/:id/status   (header: x-admin-key)
 * Moves a lead along the pipeline once the team has actually spoken to them.
 * The sheet row is rewritten to match, so the sales view stays in step.
 */
export async function updateStatus(req, res, next) {
  try {
    const { status, notes } = req.body;
    const allowed = [
      'enquiry_received',
      'appointment_booked',
      'appointment_cancelled',
      'contacted',
      'closed',
    ];

    if (!allowed.includes(status)) {
      return res
        .status(422)
        .json({ success: false, message: `status must be one of: ${allowed.join(', ')}` });
    }

    const update = { status };
    if (typeof notes === 'string') update.notes = notes.trim().slice(0, 2000);

    const lead = await Lead.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found.' });

    sendToSheet(lead, 'update');

    return res.json({ success: true, status: lead.status });
  } catch (err) {
    return next(err);
  }
}

/**
 * GET /api/leads   (header: x-admin-key)
 * Simple export for the sales team until a CRM is connected.
 */
export async function listLeads(req, res, next) {
  try {
    const { status, limit = 100 } = req.query;
    const filter = status ? { status } : {};
    const leads = await Lead.find(filter)
      .sort({ createdAt: -1 })
      .limit(Math.min(Number(limit) || 100, 500))
      .lean();

    return res.json({ success: true, count: leads.length, leads });
  } catch (err) {
    return next(err);
  }
}
