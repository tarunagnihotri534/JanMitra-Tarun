/**
 * JanMitra API Service
 * Calls Supabase REST API directly for data (schemes, submissions).
 * AI features (chat, analyze) still proxy through /api/ (Vercel serverless).
 */

const SUPABASE_URL = 'https://htticteiuuhfnycowwji.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0dGljdGVpdXVoZm55Y293d2ppIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjA1MTE4OCwiZXhwIjoyMDkxNjI3MTg4fQ.FlggZKl7r1brcz2gzY9su4nPZ_V5J9cvIoZsBRk0rn8';

const headers = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation',
};

// ─── Schemes ──────────────────────────────────────────────
export async function fetchSchemes({ state, gender, age, category, language } = {}) {
  const table = language === 'hi' ? 'schemes_hi' : 'schemes';
  const url = `${SUPABASE_URL}/rest/v1/${table}?select=*`;
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error('Failed to fetch schemes');
  let data = await res.json();

  // Client-side filtering (matches backend logic)
  if (state && !['All States', 'Any'].includes(state)) {
    data = data.filter(s => [state, 'Any', 'All States'].includes(s.state));
  }
  if (gender && gender !== 'Any') {
    data = data.filter(s => [gender, 'Any'].includes(s.gender));
  }
  if (age && age !== 'Any') {
    data = data.filter(s => [age, 'Any'].includes(s.age_group));
  }
  if (category && category !== 'Any') {
    data = data.filter(s => [category, 'Any'].includes(s.category));
  }
  return data;
}

export async function fetchSchemeById(id, language) {
  const table = language === 'hi' ? 'schemes_hi' : 'schemes';
  const url = `${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}&select=*`;
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error('Failed to fetch scheme');
  const data = await res.json();
  return data[0] || null;
}

// ─── Submissions ──────────────────────────────────────────
export async function fetchSubmissions() {
  const url = `${SUPABASE_URL}/rest/v1/submissions?select=*&order=id.desc`;
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error('Failed to fetch submissions');
  const data = await res.json();
  return data.map(r => ({ id: r.id, formType: r.form_type, formData: r.form_data, timestamp: r.timestamp }));
}

export async function createSubmission(formType, formData) {
  const url = `${SUPABASE_URL}/rest/v1/submissions`;
  const res = await fetch(url, {
    method: 'POST', headers,
    body: JSON.stringify({ form_type: formType, form_data: formData, timestamp: new Date().toISOString() }),
  });
  if (!res.ok) throw new Error('Failed to submit');
  const data = await res.json();
  return { success: true, id: data[0]?.id, message: 'Form submitted successfully' };
}

// ─── AI Endpoints (require backend / Vercel serverless) ───
export async function chat(message, language) {
  const res = await fetch('/api/chat', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, language }),
  });
  if (!res.ok) throw new Error('AI backend not available');
  return res.json();
}

export async function analyzeIssue(citizenMessage) {
  const res = await fetch('/api/analyze-issue', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ citizen_message: citizenMessage }),
  });
  if (!res.ok) throw new Error('AI backend not available');
  return res.json();
}

export async function analyzeDocument(file) {
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch('/api/analyze-document', { method: 'POST', body: fd });
  if (!res.ok) throw new Error('AI backend not available');
  return res.json();
}

export async function analyzeFormRisk(file) {
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch('/api/analyze-form-risk', { method: 'POST', body: fd });
  if (!res.ok) throw new Error('AI backend not available');
  return res.json();
}
