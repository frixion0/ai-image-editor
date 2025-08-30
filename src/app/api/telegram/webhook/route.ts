// src/app/api/telegram/webhook/route.ts
import { NextResponse } from 'next/server';
import { aiImageManipulation } from '@/ai/flows/ai-image-manipulation';

const TELEGRAM_BOT_TOKEN = '8385588826:AAFzWYNYppcjjwiHnPjK2fTtl4BqJzhcxR8';
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

// Helper function to send a message back to the user
async function sendMessage(chatId: number, text: string) {
  await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
}

// Helper function to send a photo back to the user
async function sendPhoto(chatId: number, photoUrl: string, caption: string) {
  // Telegram requires the photo to be sent as multipart/form-data if it's a data URI
  // Or it can be a public URL. Since we have a data URI, we need to convert it to a blob.
  const response = await fetch(photoUrl);
  const blob = await response.blob();
  
  const formData = new FormData();
  formData.append('chat_id', String(chatId));
  formData.append('photo', blob, 'edited-image.png');
  formData.append('caption', caption);

  await fetch(`${TELEGRAM_API_URL}/sendPhoto`, {
    method: 'POST',
    body: formData, // Sending form data, no need for Content-Type header, fetch handles it
  });
}

// Helper function to get the full path to a file from Telegram
async function getFile(fileId: string): Promise<any> {
    const response = await fetch(`${TELEGRAM_API_URL}/getFile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file_id: fileId }),
    });
    if (!response.ok) {
        throw new Error('Failed to get file info from Telegram');
    }
    const data = await response.json();
    return data.result;
}


export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Check for a message with a photo and a caption
    if (body.message && body.message.photo && body.message.caption) {
      const message = body.message;
      const chatId = message.chat.id;
      const instructions = message.caption;
      
      // Get the highest resolution photo
      const photo = message.photo[message.photo.length - 1];
      const fileId = photo.file_id;

      await sendMessage(chatId, 'Got it! Processing your image now. This might take a moment...');

      // Get file path from Telegram
      const fileInfo = await getFile(fileId);
      const fileUrl = `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${fileInfo.file_path}`;

      // Download the image and convert to base64 data URI
      const imageResponse = await fetch(fileUrl);
      const imageBuffer = await imageResponse.arrayBuffer();
      const imageBase64 = Buffer.from(imageBuffer).toString('base64');
      const mimeType = imageResponse.headers.get('content-type') || 'image/jpeg';
      const photoDataUri = `data:${mimeType};base64,${imageBase64}`;

      // Call your AI flow
      const result = await aiImageManipulation({
        photoDataUri,
        instructions,
      });

      if (result.editedPhotoDataUri) {
        await sendPhoto(chatId, result.editedPhotoDataUri, `Here's your edited image!`);
      } else {
        await sendMessage(chatId, `Sorry, I couldn't edit the image. Error: ${result.error}`);
      }
    } else if (body.message && body.message.text) {
        const message = body.message;
        const chatId = message.chat.id;
        await sendMessage(chatId, 'Hello! Please send me a photo with a caption describing how you want to edit it.');
    } else {
         console.warn('Received an unhandled update type:', body);
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error: any) {
    console.error('Error in Telegram webhook:', error);
    // Attempt to notify the user if possible
    try {
        const body = await request.json();
        if (body.message && body.message.chat) {
            await sendMessage(body.message.chat.id, `An internal error occurred: ${error.message}`);
        }
    } catch (e) {
        console.error("Failed to notify user of error", e);
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
