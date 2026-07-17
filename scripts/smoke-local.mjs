const base = process.env.APP_URL ?? 'http://127.0.0.1:3000';

async function check(path, init) {
  const res = await fetch(`${base}${path}`, init);
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = null;
  }
  return { status: res.status, json, text: text.slice(0, 200) };
}

const health = await check('/api/health');
console.log('health', health.status, health.json?.data?.status ?? health.text);

const loginRes = await fetch(`${base}/api/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'demo@kesbyar.ir', password: 'demo1234' }),
});
const setCookie = loginRes.headers.get('set-cookie') ?? '';
const loginJson = await loginRes.json();
console.log('login', loginRes.status, loginJson.success ? 'ok' : loginJson.error?.message);

const sessionCookie = setCookie.split(';')[0];
const dash = await fetch(`${base}/dashboard`, {
  headers: { cookie: sessionCookie },
  redirect: 'manual',
});
console.log('dashboard', dash.status, dash.headers.get('location') ?? 'loaded');
