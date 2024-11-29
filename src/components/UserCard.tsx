import React from 'react';
import { MessageSquare, Loader2 } from 'lucide-react';
import { User } from '../types/user';

interface UserCardProps {
  user: User;
  sending: boolean;
  useWebhook: boolean;
  useSignal: boolean;
  onClick: () => void;
}

export function UserCard({ user, sending, useWebhook, useSignal, onClick }: UserCardProps) {
  return (
    <div
      id={`user-${user.id}`}
      className={`bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer ${
        useWebhook ? 'bg-orange-50' : ''
      }`}
      onClick={onClick}
    >
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-xl font-semibold text-blue-600">
            {user.displayName?.charAt(0) || '?'}
          </span>
        </div>
        <h3 className="font-semibold mb-2">{user.displayName}</h3>
        <p className="text-sm text-gray-500 mb-2">{user.email}</p>
        <p className="text-sm text-gray-500 mb-2">Role: {user.role}</p>
        <p className="text-sm text-gray-500 mb-2">Type: {user.type}</p>
        {sending ? (
          <div className="flex items-center justify-center text-blue-500">
            <Loader2 className="animate-spin mr-2" size={16} />
            <span className="text-sm">Sending...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center text-green-500">
            <MessageSquare size={16} className="mr-1" />
            <span className="text-sm">
              {useWebhook
                ? 'Click to notify'
                : `Click to message via ${useSignal ? 'Signal' : 'WhatsApp'}`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}