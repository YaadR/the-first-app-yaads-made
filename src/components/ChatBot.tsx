import React from 'react';
import { OpenAI } from 'openai';
import { AlertCircle } from 'lucide-react';
import { ChatContainer } from './Chat/ChatContainer';

interface ChatBotProps {
  openai: OpenAI | null;
}

function ChatBot({ openai }: ChatBotProps) {
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
    <div className="max-w-2xl mx-auto">
      <ChatContainer openai={openai} />
    </div>
  );
}

export default ChatBot;