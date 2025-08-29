import { NextResponse } from 'next/server';
import { adminDb, adminMessaging } from '@/lib/firebase/admin';

// Ensure values in data are strings (FCM requirement)
function serializeData(data) {
  if (!data || typeof data !== 'object') return undefined;
  const out = {};
  for (const [k, v] of Object.entries(data)) {
    out[k] = typeof v === 'string' ? v : JSON.stringify(v);
  }
  return out;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { token, tokens, topic, userId, title, body: messageBody, data, dryRun } = body || {};

    if (!title || !messageBody) {
      return NextResponse.json({ success: false, error: 'Missing title or body' }, { status: 400 });
    }

    const messaging = adminMessaging();

    // Resolve target tokens if userId provided and no tokens passed
    let targetTokens = Array.isArray(tokens) ? tokens.filter(Boolean) : [];
    if (token) targetTokens.push(token);

    if (!topic && !targetTokens.length && userId) {
      const snap = await adminDb().doc(`users/${userId}`).get();
      if (snap.exists) {
        const u = snap.data();
        if (u && u.fcmToken) {
          targetTokens = [u.fcmToken];
        }
      }
    }

    if (!topic && !targetTokens.length) {
      return NextResponse.json(
        { success: false, error: 'Provide token/tokens/topic or a userId with saved fcmToken' },
        { status: 400 }
      );
    }

    const payloadBase = {
      notification: {
        title,
        body: messageBody,
      },
      data: serializeData(data),
      webpush: {
        notification: {
          icon: '/favicon.ico',
        },
        fcmOptions: {
          link: (data && data.link) || '/',
        },
      },
    };

    // Send to topic
    if (topic) {
      const message = { ...payloadBase, topic };
      const id = await messaging.send(message, Boolean(dryRun));
      return NextResponse.json({ success: true, id, target: { topic } });
    }

    // Send to tokens (single or multiple)
    if (targetTokens.length === 1) {
      const message = { ...payloadBase, token: targetTokens[0] };
      const id = await messaging.send(message, Boolean(dryRun));
      return NextResponse.json({ success: true, id, target: { tokens: targetTokens } });
    }

    const multicast = {
      tokens: targetTokens,
      notification: payloadBase.notification,
      data: payloadBase.data,
      webpush: payloadBase.webpush,
    };
    const response = await messaging.sendMulticast(multicast, Boolean(dryRun));
    return NextResponse.json({
      success: true,
      target: { tokens: targetTokens },
      count: { success: response.successCount, failure: response.failureCount },
      responses: response.responses?.map((r) => ({ success: r.success, error: r.error?.message })) || [],
    });
  } catch (error) {
    console.error('Error sending push notification:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
