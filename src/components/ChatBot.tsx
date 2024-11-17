import React, { useState, useRef } from 'react';
import { OpenAI } from 'openai';
import { Send, Loader2, AlertCircle, ToggleLeft, ToggleRight, Paperclip, X } from 'lucide-react';

interface ChatBotProps {
  openai: OpenAI | null;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  attachments?: string[];
}

function ChatBot({ openai }: ChatBotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [usePerplexity, setUsePerplexity] = useState(false);
  const [attachments, setAttachments] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileUrls = Array.from(files).map(file => URL.createObjectURL(file));
      setAttachments(prev => [...prev, ...fileUrls]);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!openai) {
      return;
    }
    
    if (!input.trim() && attachments.length === 0) return;

    const userMessage: Message = { 
      role: 'user', 
      content: input,
      attachments: attachments.length > 0 ? attachments : undefined
    };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput('');
    setAttachments([]);
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
            messages: [...messages, userMessage].map(({ role, content }) => ({ role, content })),
          }),
        });
    
        // Check if the response is ok before proceeding
        if (!response.ok) {
          const errorText = await response.text();  // Get the error message if the response isn't OK
          throw new Error(`Perplexity API Error: ${errorText}`);
        }
    
        const data = await response.json();
        response = { choices: [{ message: { content: data.choices[0].message.content } }] };
      } else {
        response = await openai.chat.completions.create({
          model: "gpt-4",
          messages: [...messages, userMessage].map(({ role, content }) => ({ role, content })),
        });
      }
    
      const assistantMessage: Message = {
        role: 'assistant',
        content: response.choices[0].message.content || 'Sorry, I couldn\'t generate a response.',
      };
      setMessages((prevMessages) => [...prevMessages, assistantMessage]);
    } catch (error) {
      console.error('Error in chat completion:', error);
      
      // More detailed error information for debugging
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: 'assistant', content: `Sorry, an error occurred: ${errorMessage}. Please try again.` },
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
        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-4 ${
              message.role === 'user' ? 'text-right' : 'text-left'
            }`}
          >
            {message.attachments && message.attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {message.attachments.map((url, i) => (
                  <img 
                    key={i} 
                    src={url} 
                    alt={`Attachment ${i + 1}`} 
                    className="max-w-xs h-auto rounded"
                  />
                ))}
              </div>
            )}
            <span
              className={`inline-block p-2 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              {message.content}
            </span>
          </div>
        ))}
      </div>

      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {attachments.map((url, index) => (
            <div key={index} className="relative">
              <img 
                src={url} 
                alt={`Upload preview ${index + 1}`} 
                className="w-20 h-20 object-cover rounded"
              />
              <button
                onClick={() => setAttachments(prev => prev.filter((_, i) => i !== index))}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={sendMessage} className="flex items-center space-x-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
          multiple
          accept="image/*,.pdf,.doc,.docx"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 text-gray-500 hover:text-gray-700"
        >
          <Paperclip size={20} />
        </button>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Type your message..."
          disabled={loading}
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center"
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <Send size={20} />
          )}
        </button>
      </form>
    </div>
  );
}

export default ChatBot;