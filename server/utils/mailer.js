import nodemailer from 'nodemailer';

let transporter = null;

if (process.env.SMTP_HOST && process.env.SMTP_USER) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

/**
 * Sends an internal alert. Silently skips when SMTP is not configured,
 * so a mail outage can never break the conversion flow.
 */
export async function notifyTeam(subject, lines = []) {
  if (!transporter || !process.env.NOTIFY_TO) return;

  try {
    await transporter.sendMail({
      from: process.env.NOTIFY_FROM || process.env.SMTP_USER,
      to: process.env.NOTIFY_TO,
      subject,
      text: lines.join('\n'),
    });
  } catch (err) {
    console.error('Notification email failed:', err.message);
  }
}
