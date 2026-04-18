addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

const TELEGRAM_BOT_TOKEN = '0000:LHHL';
const TELEGRAM_CHAT_ID = '00000';

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}

async function handleRequest(request) {
  if (request.method === 'OPTIONS') {
    return jsonResponse({ ok: true });
  }

  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  let data;
  try {
    data = await request.json();
  } catch (err) {
    return jsonResponse({ error: 'Invalid JSON' }, 400);
  }

  const name = String(data.name || 'Không rõ').trim().slice(0, 100);
  const message = String(data.message || '').trim().slice(0, 1000);
  const page = String(data.page || 'unknown');
  const sentAt = String(data.sentAt || new Date().toISOString());

  if (!message) {
    return jsonResponse({ error: 'Message is required' }, 400);
  }

  const text = `📩 Tin nhắn từ website\n\nTên: ${name}\n\nNội dung:\n${message}\n\nTrang: ${page}\nThời gian: ${sentAt}`;

  const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

  const telegramRes = await fetch(telegramUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text, parse_mode: 'HTML' })
  });

  const telegramJson = await telegramRes.json();

  if (!telegramRes.ok || !telegramJson.ok) {
    return jsonResponse({ error: 'Telegram send failed', details: telegramJson }, 500);
  }

  return jsonResponse({ ok: true }, 200);
}
