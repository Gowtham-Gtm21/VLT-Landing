/**
 * Creates the Calendly webhook subscription.
 *
 * Calendly has no UI for this — subscriptions are made through their API — so
 * this wraps the two calls it takes: look up your user/organisation, then
 * register the endpoint.
 *
 *   node create-webhook.mjs <personal-access-token> <https://your-api/api/webhooks/calendly>
 *   node create-webhook.mjs <personal-access-token> --list
 *   node create-webhook.mjs <personal-access-token> --delete <subscription-uri>
 *
 * Get the token from Calendly: Integrations & apps -> API and webhooks ->
 * Personal access tokens -> Get a token now.
 *
 * Note: webhook subscriptions require a Standard plan or above. On the free
 * plan this returns a permission error, which is a plan limit, not a bug.
 */

const API = 'https://api.calendly.com';
const [token, target, extra] = process.argv.slice(2);

if (!token) {
  console.error(`
Usage:
  node create-webhook.mjs <token> <endpoint-url>     create the subscription
  node create-webhook.mjs <token> --list             show existing subscriptions
  node create-webhook.mjs <token> --delete <uri>     remove one
`);
  process.exit(1);
}

async function call(path, options = {}) {
  const res = await fetch(path.startsWith('http') ? path : `${API}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const text = await res.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }

  if (!res.ok) {
    const err = new Error(body?.message || body?.title || `HTTP ${res.status}`);
    err.status = res.status;
    err.body = body;
    throw err;
  }

  return body;
}

try {
  const me = await call('/users/me');
  const user = me.resource.uri;
  const org = me.resource.current_organization;
  console.log(`Signed in as ${me.resource.name} <${me.resource.email}>`);

  if (target === '--list') {
    const list = await call(
      `/webhook_subscriptions?organization=${encodeURIComponent(org)}&user=${encodeURIComponent(user)}&scope=user`
    );
    if (!list.collection.length) {
      console.log('\nNo webhook subscriptions.');
    } else {
      console.log(`\n${list.collection.length} subscription(s):`);
      for (const w of list.collection) {
        console.log(`  ${w.state.padEnd(8)} ${w.callback_url}`);
        console.log(`           events: ${w.events.join(', ')}`);
        console.log(`           uri:    ${w.uri}`);
      }
    }
    process.exit(0);
  }

  if (target === '--delete') {
    if (!extra) throw new Error('Pass the subscription uri to delete.');
    await call(extra, { method: 'DELETE' });
    console.log('\nDeleted.');
    process.exit(0);
  }

  if (!target?.startsWith('https://')) {
    throw new Error('The endpoint URL must start with https:// — Calendly rejects plain http.');
  }

  const created = await call('/webhook_subscriptions', {
    method: 'POST',
    body: JSON.stringify({
      url: target,
      events: ['invitee.created', 'invitee.canceled'],
      organization: org,
      user,
      scope: 'user',
    }),
  });

  console.log(`
Webhook created.
  endpoint: ${created.resource.callback_url}
  events:   ${created.resource.events.join(', ')}
  uri:      ${created.resource.uri}
`);

  if (created.resource.signing_key) {
    console.log('Put this in server/.env, then restart the API:\n');
    console.log(`CALENDLY_WEBHOOK_SECRET=${created.resource.signing_key}\n`);
  } else {
    console.log(
      'No signing key was returned. Signature checking stays off unless you set\n' +
        'CALENDLY_WEBHOOK_SECRET yourself — the endpoint still works without it.\n'
    );
  }
} catch (err) {
  const raw = JSON.stringify(err.body || err.message || '').toLowerCase();
  const networkProblem =
    !err.status ||
    raw.includes('allowlist') ||
    raw.includes('egress') ||
    raw.includes('enotfound') ||
    raw.includes('econnrefused') ||
    raw.includes('fetch failed');

  console.error(`\nFailed: ${err.message}`);

  if (networkProblem) {
    console.error(
      '\nThis looks like a network problem rather than anything Calendly said —\n' +
        'api.calendly.com could not be reached. Check your connection, or any\n' +
        'proxy or firewall between this machine and the internet.\n'
    );
    process.exit(1);
  }

  if (err.status === 401) {
    console.error('\n401 means the token is wrong or expired. Generate a fresh one.\n');
  }

  if (err.status === 403) {
    // Calendly returns 403 both for a bad token and for a plan limitation, so
    // don't guess — the body distinguishes them.
    const authProblem =
      raw.includes('unauthorized') ||
      raw.includes('invalid token') ||
      raw.includes('authentication');

    if (authProblem) {
      console.error(
        '\nThe token was rejected. Check it was copied whole — Calendly shows it\n' +
          'once and it is long. Generate a fresh one if in doubt.\n'
      );
    } else {
      console.error(
        '\nThis usually means the plan does not include webhooks; they need\n' +
          'Standard or above. If the token is definitely correct, that is it.\n'
      );
    }

    console.error(
      'Either way, nothing else in the project depends on this. The browser\n' +
        'already reports bookings — the webhook only adds cancellations and the\n' +
        'case where someone closes the tab mid-booking.\n'
    );
  }

  if (err.body) console.error(`Calendly's reply: ${JSON.stringify(err.body)}\n`);
  process.exit(1);
}
