import React, { useState, useEffect, useCallback } from 'react';
import { OpenAI } from 'openai';
import { Loader2, AlertCircle, ToggleLeft, ToggleRight } from 'lucide-react';
import { ChatMessage } from './Chat/ChatMessage';
import { ChatInput } from './Chat/ChatInput';
import { getChatContext, sendChatSummary } from '../utils/chat';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  attachments?: string[];
}

interface ChatBotProps {
  openai: OpenAI | null;
}

function ChatBot({ openai }: ChatBotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [usePerplexity, setUsePerplexity] = useState(false);
  const [context, setContext] = useState<{
    requirements: string;
    task: string;
    userName: string;
    agentName: string;
  } | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const initializeChat = async () => {
      const chatContext = await getChatContext();
      if (chatContext) {
        setContext(chatContext);
        
        // Set up initial system context and greeting
        const systemMessage: Message = {
          role: 'system',
          content: `You are ${chatContext.agentName}, an AI assistant. Your task is: ${chatContext.task}. 
                   Requirements: ${chatContext.requirements}. 
                   You are speaking with ${chatContext.userName}.
                   Always introduce yourself as ${chatContext.agentName} and maintain this identity throughout the conversation.
                   Never mention that you're an AI model or language model.
                   Stay focused on your assigned task and requirements.`
        };

        const greetingMessage: Message = {
          role: 'assistant',
          content: `Hello ${chatContext.userName}! I'm ${chatContext.agentName}. How can I assist you today?`
        };

        setMessages([systemMessage, greetingMessage]);
      }
    };

    initializeChat();
  }, []);

  const checkCompletion = useCallback((message: string) => {
    const completionPhrases = [
      'i am done',
      'i\'m done',
      'that\'s all',
      'that is all',
      'thank you, that\'s all',
      'thanks, that\'s all'
    ];
    return completionPhrases.some(phrase => message.toLowerCase().includes(phrase));
  }, []);

  const handleSendMessage = async (content: string, attachments: string[]) => {
    if (!openai || isComplete || !context) return;

    const userMessage: Message = { role: 'user', content, attachments };
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      let response;
      
      if (usePerplexity) {
        response = await fetch('https://api.perplexity.ai/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_PERPLEXITY_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama-3.1-sonar-small-128k-online',
            messages: messages.concat(userMessage).map(({ role, content }) => ({ role, content })),
          }),
        });

        if (!response.ok) {
          throw new Error('Perplexity API Error');
        }

        const data = await response.json();
        response = { choices: [{ message: { content: data.choices[0].message.content } }] };
      } else {
        response = await openai.chat.completions.create({
          model: "gpt-4",
          messages: messages.concat(userMessage).map(({ role, content }) => ({ role, content })),
        });
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.choices[0].message.content || 'Sorry, I couldn\'t generate a response.',
      };
      setMessages(prev => [...prev, assistantMessage]);

      if (checkCompletion(content)) {
        setIsComplete(true);
        // Send chat summary
        await sendChatSummary({
          userName: context.userName,
          agentName: context.agentName,
          timestamp: new Date().toISOString(),
          requirements: context.requirements,
          task: context.task,
          conversation: messages
            .filter(m => m.role !== 'system')
            .concat(userMessage, assistantMessage),
          completionStatus: 'completed'
        });
      }
    } catch (error) {
      console.error('Error in chat completion:', error);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, an error occurred. Please try again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!openai) {
    return (
      <div className="bg-yellow-50 p-8 rounded-lg shadow-md max-w-2xl mx-auto">
        <div className="flex items-center text-yellow-800 mb-4">
          <AlertCircle className="mr-2" size={24} />
          <h3 className="font-semibold">AI Features Disabled</h3>
        </div>
        <p className="text-yellow-700">
          Chat functionality is currently unavailable because the API key is not configured.
          Please contact the administrator to enable this feature.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
      <div className="flex justify-end mb-4">
        <div className="flex items-center space-x-2">
          <span className={!usePerplexity ? 'font-semibold' : ''}>ChatGPT</span>
          <button
            onClick={() => setUsePerplexity(!usePerplexity)}
            className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200"
          >
            {usePerplexity ? (
              <ToggleRight className="h-6 w-6 text-blue-500" />
            ) : (
              <ToggleLeft className="h-6 w-6 text-gray-500" />
            )}
          </button>
          <span className={usePerplexity ? 'font-semibold' : ''}>Perplexity</span>
        </div>
      </div>

      <div className="h-96 overflow-y-auto mb-4 p-4 border border-gray-200 rounded">
            {messages
        .filter(message => message.role !== 'system') // Exclude 'system' messages
        .map((message, index) => (
          <ChatMessage key={index} {...(message as Omit<Message, 'role'> & { role: 'user' | 'assistant' })} />
        ))}
        {loading && (
          <div className="flex justify-center">
            <Loader2 className="animate-spin" size={24} />
          </div>
        )}
      </div>

      <ChatInput onSend={handleSendMessage} disabled={loading || isComplete} />
      
      {isComplete && (
        <div className="mt-4 p-4 bg-green-50 text-green-700 rounded-md">
          Chat session completed. Thank you for using our service!
        </div>
      )}
    </div>
  );
}

export default ChatBot;