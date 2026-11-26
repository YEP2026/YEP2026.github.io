import { EXEC_URL } from './config.js';

const TIMEOUT_MS = 20000;

// POST {action, ...params} to the Apps Script backend.
// Never throws and never hangs: always resolves to an object with a `status`.
export async function call(action, params = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  let text;
  try {
    // text/plain avoids a CORS preflight, which Apps Script can't answer.
    const res = await fetch(EXEC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action, ...params }),
      signal: controller.signal,
    });
    text = await res.text();
  } catch (err) {
    const message = err.name === 'AbortError' ? `No answer after ${TIMEOUT_MS / 1000}s` : `Network problem (${err.name}: ${err.message})`;
    console.error(action, err);
    return { status: 'error', message };
  } finally {
    clearTimeout(timer);
  }
  try {
    return JSON.parse(text);
  } catch {
    console.error(text);
    return { status: 'error', message: 'Server error (not JSON)' };
  }
}
