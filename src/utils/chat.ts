import { db, auth } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface AssistantContext {
  task: string;
  userName: string;
  agentName: string;
}

export async function getChatContext(): Promise<AssistantContext | null> {
  if (!auth.currentUser) return null;

  try {
    const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
    if (!userDoc.exists()) return null;
    
    const userData = userDoc.data();
    const orgId = userData.organizationId;

    const orgDoc = await getDoc(doc(db, 'organizations', orgId));
    if (!orgDoc.exists()) return null;
    
    const orgData = orgDoc.data();

    return {
      task: orgData.task || '',
      userName: userData.displayName || 'User',
      agentName: 'Leann'
    };
  } catch (error) {
    console.error('Error fetching chat context:', error);
    return null;
  }
}

export async function sendChatSummary(summary: any) {
  try {
    const response = await fetch('https://hook.eu2.make.com/mzi8uhost4b3m27nm1a6o3ds0n6ntjvi', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(summary),
    });

    if (!response.ok) {
      throw new Error('Failed to send chat summary');
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending chat summary:', error);
    throw error;
  }
}