import { OpenAI } from 'openai';

const ASSISTANT_ID = import.meta.env.VITE_OPENAI_API_ASSISTANT_ID;
const VECTOR_STORE_ID = import.meta.env.VITE_OPENAI_API_ASSISTANT_VECTOR_STORE_ID;

export async function queryAssistant(openai: OpenAI, content: string) {
  if (!openai || !ASSISTANT_ID) {
    throw new Error('OpenAI client or Assistant ID not configured');
  }

  try {
    // Update assistant with vector store configuration
    // await openai.beta.assistants.update(
    //   ASSISTANT_ID
    //   {
    //     tools: [{ type: "file_search" }],
    //     tool_resources: {
    //       file_search: {
    //         vector_store_ids: [VECTOR_STORE_ID] // Link to the vector store
    //       }
    //     }
    //   }
    // );

    // Create a thread
    const thread = await openai.beta.threads.create();

    // Add a message to the thread that asks the assistant to refer to file search
    await openai.beta.threads.messages.create(thread.id, {
      role: 'user',
      content: `Can you help me find information related to: ${content}`
    });

    // Run the assistant
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: ASSISTANT_ID
    });

    // Poll for the run completion
    let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    while (runStatus.status === 'queued' || runStatus.status === 'in_progress') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
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
