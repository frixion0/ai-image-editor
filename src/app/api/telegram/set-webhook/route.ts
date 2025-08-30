// src/app/api/telegram/set-webhook/route.ts
import { NextResponse } from 'next/server';

const TELEGRAM_BOT_TOKEN = '8385588826:AAFzWYNYppcjjwiHnPjK2fTtl4BqJzhcxR8';
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;
// This should be your production URL where the webhook handler is located.
const WEBHOOK_URL = 'https://ai-image-editor-eta.vercel.app/api/telegram/webhook';

export async function POST(request: Request) {
  try {
    const response = await fetch(`${TELEGRAM_API_URL}/setWebhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: WEBHOOK_URL,
      }),
    });

    const data = await response.json();

    if (!data.ok) {
      // Telegram often gives descriptive error messages.
      throw new Error(data.description || 'Failed to set webhook');
    }

    return NextResponse.json({
      success: true,
      message: data.description || 'Webhook was set successfully!',
    });
  } catch (error: any) {
    console.error('Error setting Telegram webhook:', error);
    return NextResponse.json(
      { error: error.message || 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}
