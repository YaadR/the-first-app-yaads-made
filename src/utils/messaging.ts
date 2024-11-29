import { User } from '../types/user';

export async function sendWhatsAppMessage(phone: string, message: string) {
  const response = await fetch('/.netlify/functions/send-whatsapp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ phone: phone.replace(/[^\d+]/g, ''), message }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to send WhatsApp message: ${errorText}`);
  }

  return response.json();
}

export async function sendSignalMessage(phone: string, message: string) {
  const response = await fetch('/.netlify/functions/send-signal', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ phone: phone.replace(/[^\d+]/g, ''), message }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to send Signal message: ${errorText}`);
  }

  return response.json();
}

export async function sendWebhookNotification(user: User) {
  const response = await fetch('https://hook.eu2.make.com/mzi8uhost4b3m27nm1a6o3ds0n6ntjvi', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userName: user.displayName,
      userPhone: user.phone,
      userRole: user.role,
      timestamp: new Date().toISOString()
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to send webhook notification');
  }

  return response.json();
}