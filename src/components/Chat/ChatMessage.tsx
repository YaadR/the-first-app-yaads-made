import { MessageSquare, User } from 'lucide-react';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  attachments?: string[];
}

export function ChatMessage({ role, content, attachments }: ChatMessageProps) {
  return (
    <div className={`mb-4 ${role === 'user' ? 'text-right' : 'text-left'}`}>
      {attachments && attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {attachments.map((url, i) => (
            <img 
              key={i} 
              src={url} 
              alt={`Attachment ${i + 1}`} 
              className="max-w-xs h-auto rounded"
            />
          ))}
        </div>
      )}
      <div className="flex items-start gap-2">
        {role === 'assistant' && (
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-blue-600" />
          </div>
        )}
        <span
          className={`inline-block p-3 rounded-lg ${
            role === 'user'
              ? 'bg-blue-500 text-white ml-auto'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {content}
        </span>
        {role === 'user' && (
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-blue-600" />
          </div>
        )}
      </div>
    </div>
  );
}