/**
 * Sends new enquiries to the team's WhatsApp.
 *
 * Uses Meta's WhatsApp Cloud API. Like the mailer, it silently does nothing
 * when the credentials are absent, so a missing token or an outage can never
 * break the conversion flow — the lead is already in MongoDB by the time this
 * is called.
 *
 * Two things worth knowing before this works in production:
 *
 * 1. A business can only send a *free-form* message inside 24 hours of the
 *    recipient last messaging the business number. Outside that window Meta
 *    requires a pre-approved template. Set WHATSAPP_TEMPLATE to use one; leave
 *    it empty and this sends free-form, which is fine if the notified number
 *    keeps the thread warm.
 *
 * 2. The recipient must be added as a test number, or the app must be live.
 */

const API_VERSION = 'v21.0';

function config() {
  return {
    token: process.env.WHATSAPP_TOKEN,
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
    to: (process.env.WHATSAPP_NOTIFY_TO || '').replace(/[^\d]/g, ''),
    template: process.env.WHATSAPP_TEMPLATE || '',
    lang: process.env.WHATSAPP_TEMPLATE_LANG || 'en',
  };
}

export function whatsappConfigured() {
  const c = config();
  return Boolean(c.token && c.phoneNumberId && c.to);
}

export async function notifyWhatsApp(lines = []) {
  const c = config();

  if (!whatsappConfigured()) {
    if (process.env.NODE_ENV !== 'production') {
      console.info('[whatsapp] not configured, skipping:\n' + lines.join('\n'));
    }
    return false;
  }

  const body = c.template
    ? {
        messaging_product: 'whatsapp',
        to: c.to,
        type: 'template',
        template: {
          name: c.template,
          language: { code: c.lang },
          components: [
            {
              type: 'body',
              parameters: lines.slice(0, 6).map((text) => ({ type: 'text', text })),
            },
          ],
        },
      }
    : {
        messaging_product: 'whatsapp',
        to: c.to,
        type: 'text',
        text: { preview_url: false, body: lines.join('\n') },
      };

  try {
    const res = await fetch(
      `https://graph.facebook.com/${API_VERSION}/${c.phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${c.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      console.error(`[whatsapp] send failed ${res.status}: ${detail.slice(0, 300)}`);
      return false;
    }

    return true;
  } catch (err) {
    console.error('[whatsapp] send error:', err.message);
    return false;
  }
}

/** Formats a lead the way it should read on a phone. */
export function leadLines(lead, heading = 'New enquiry') {
  return [
    `*${heading}*`,
    `Name: ${lead.name}`,
    `Phone: ${lead.phone}`,
    `Email: ${lead.email}`,
    lead.company ? `Company: ${lead.company}` : null,
    `Needs: ${lead.service}`,
    lead.projectDetails ? `Details: ${lead.projectDetails}` : null,
    lead.attribution?.utm_campaign ? `Campaign: ${lead.attribution.utm_campaign}` : null,
  ].filter(Boolean);
}
