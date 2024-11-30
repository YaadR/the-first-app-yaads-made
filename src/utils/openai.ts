import { OpenAI } from 'openai';

const ASSISTANT_ID = import.meta.env.VITE_OPENAI_API_ASSISTANT_ID;

export async function queryAssistant(openai: OpenAI, content: string, context: {
  task: string;
  userName: string;
  agentName: string;
}) {
  if (!openai || !ASSISTANT_ID) {
    throw new Error('OpenAI client or Assistant ID not configured');
  }

  try {
    // Create a thread
    const thread = await openai.beta.threads.create();

    // First, send the context as a system message
    await openai.beta.threads.messages.create(thread.id, {
      role: 'user',
      content: `Context for this conversation:
        - You are ${context.agentName}
        - You are speaking with ${context.userName}
        - Your specific task is: ${context.task}
        
        Please acknowledge this context and proceed with the conversation accordingly.`
    });

    // Wait for the assistant to process the context
    let contextRun = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: ASSISTANT_ID
    });

    // Poll for the context run completion
    let runStatus = await openai.beta.threads.runs.retrieve(thread.id, contextRun.id);
    while (runStatus.status === 'queued' || runStatus.status === 'in_progress') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(thread.id, contextRun.id);
    }

    // Now add the user's actual message
    await openai.beta.threads.messages.create(thread.id, {
      role: 'user',
      content: content
    });

    // Run the assistant for the user's message
    const messageRun = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: ASSISTANT_ID
    });

    // Poll for the message run completion
    runStatus = await openai.beta.threads.runs.retrieve(thread.id, messageRun.id);
    while (runStatus.status === 'queued' || runStatus.status === 'in_progress') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(thread.id, messageRun.id);
    }

    // Get the assistant's response
    const messages = await openai.beta.threads.messages.list(thread.id);
    const lastMessage = messages.data[0];

    return {
      content: lastMessage.content[0].type === 'text' ? lastMessage.content[0].text.value : 'No response generated'
    };
  } catch (error) {
    console.error('Error querying assistant:', error);
    throw error;
  }
}