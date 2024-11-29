import { useState, useRef } from 'react';
import { Send, Paperclip, X } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string, attachments: string[]) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && attachments.length === 0) return;
    
    onSend(input, attachments);
    setInput('');
    setAttachments([]);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileUrls = Array.from(files).map(file => URL.createObjectURL(file));
      setAttachments(prev => [...prev, ...fileUrls]);
    }
  };

  return (
    <div>
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
      
      <form onSubmit={handleSubmit} className="flex items-center space-x-2">
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
          disabled={disabled}
        >
          <Paperclip size={20} />
        </button>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Type your message..."
          disabled={disabled}
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center disabled:opacity-50"
          disabled={disabled}
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
}