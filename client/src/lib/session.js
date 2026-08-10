const KEY = 'vlt_lead';

export function saveLead(lead) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(lead));
  } catch {
    /* ignore */
  }
}

export function readLead() {
  try {
    return JSON.parse(sessionStorage.getItem(KEY) || 'null');
  } catch {
    return null;
  }
}

export function clearLead() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
