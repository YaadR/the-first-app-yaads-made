import React from 'react';

function ChatBotSmart() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-gray-50 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">Smart ChatBot</h2>
        <div className="flex justify-center">
          <iframe 
            src="https://app.fastbots.ai/embed/cm42pjr7o0l1on8bksb7j5713"
            className="w-[400px] h-[600px] border-0 rounded-lg shadow-lg"
            title="Smart ChatBot"
          />
        </div>
      </div>
    </div>
  );
}

export default ChatBotSmart;