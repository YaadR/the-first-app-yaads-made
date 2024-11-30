import React, { useState, useEffect } from 'react';
import { OpenAI } from 'openai';
import { Loader2 } from 'lucide-react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { queryAssistant } from '../../utils/openai';
import { getChatContext, sendChatSummary } from '../../utils/chat';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  attachments?: string[];
}

interface ChatContainerProps {
  openai: OpenAI | null;
}

export function ChatContainer({ openai }: ChatContainerProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState<{
    task: string;
    userName: string;
    agentName: string;
  } | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const initializeChat = async () => {
      const assistantContext = await getChatContext();
      if (assistantContext) {
        setContext(assistantContext);
        const systemMessage: Message = {
          role: 'system',
          content: `You are ${assistantContext.agentName}, an AI assistant.
                    You are speaking with ${assistantContext.userName}.
                    Understand your task from ${assistantContext.task}`
        }; 
        const greetingMessage: Message = {
          role: 'assistant',
          content: `Hello ${assistantContext.userName}! I'm ${assistantContext.agentName}.`
        };
        setMessages([systemMessage, greetingMessage]);
      }
    };

    initializeChat();
  }, []);

  const handleSendMessage = async (content: string, attachments: string[]) => {
    if (!openai || isComplete || !context) return;

    const userMessage: Message = { role: 'user', content, attachments };
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      const response = await queryAssistant(openai, content);
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: response.content
      };
      
      setMessages(prev => [...prev, assistantMessage]);

      if (content.toLowerCase().includes('thank you') || content.toLowerCase().includes("that's all")) {
        setIsComplete(true);
        await sendChatSummary({
          userName: context.userName,
          agentName: context.agentName,
          timestamp: new Date().toISOString(),
          task: context.task,
          conversation: messages.concat(userMessage, assistantMessage),
          completionStatus: 'completed'
        });
      }
    } catch (error) {
      console.error('Error in chat:', error);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, an error occurred. Please try again.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="h-96 overflow-y-auto mb-4 p-4 border border-gray-200 rounded">
        {messages
          .filter(message => message.role !== 'system')
          .map((message, index) => (
            <ChatMessage 
              key={index} 
              {...(message as Omit<Message, 'role'> & { role: 'user' | 'assistant' })} 
            />
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