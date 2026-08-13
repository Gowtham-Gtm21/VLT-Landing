/**
 * Paste this into the Google Sheet: Extensions -> Apps Script.
 *
 * It receives a lead from the landing page API and either appends a new row or
 * updates the existing row for that lead when a booking or status change
 * comes in.
 */

// Must match GOOGLE_SHEET_SECRET in the server's .env.
// Change this to a long random string before deploying.
const SHARED_SECRET = '1rXUoQlxu4SaSmMUWp1cqLi75cqMAYjQFrPL38C_cVc';

const SHEET_NAME = 'Leads';

const HEADERS = [
  'Submitted at',
  'Name',
  'Email',
  'Phone',
  'Company',
  'Service',
  'Project details',
  'Status',
  'Scheduled at',
  'Contacted at',
  'Notes',
  'Source',
  'Medium',
  'Campaign',
  'Landing path',
  'Referrer',
  'Lead ID',
];

// Order must match HEADERS.
const FIELDS = [
  'submittedAt',
  'name',
  'email',
  'phone',
  'company',
  'service',
  'projectDetails',
  'status',
  'scheduledAt',
  'contactedAt',
  'notes',
  'source',
  'medium',
  'campaign',
  'landingPath',
  'referrer',
  'leadId',
];

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function doPost(e) {
  // A lock stops two simultaneous submissions writing to the same row.
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);

  try {
    const payload = JSON.parse(e.postData.contents);

    if (SHARED_SECRET && payload.secret !== SHARED_SECRET) {
      return reply({ ok: false, error: 'bad secret' });
    }

    const row = payload.row || {};
    const sheet = getSheet();
    const values = FIELDS.map(function (f) {
      return row[f] === undefined ? '' : row[f];
    });

    if (payload.action === 'update' && row.leadId) {
      const idCol = FIELDS.indexOf('leadId') + 1;
      const last = sheet.getLastRow();

      if (last > 1) {
        const ids = sheet.getRange(2, idCol, last - 1, 1).getValues();
        for (let i = ids.length - 1; i >= 0; i--) {
          if (String(ids[i][0]) === String(row.leadId)) {
            sheet.getRange(i + 2, 1, 1, values.length).setValues([values]);
            return reply({ ok: true, updated: i + 2 });
          }
        }
      }
    }

    sheet.appendRow(values);
    return reply({ ok: true, appended: sheet.getLastRow() });
  } catch (err) {
    return reply({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

/** Lets you confirm the deployment is live by opening the URL in a browser. */
function doGet() {
  return reply({ ok: true, service: 'vlt-lead-sheet' });
}