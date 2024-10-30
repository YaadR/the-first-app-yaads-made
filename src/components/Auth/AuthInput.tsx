import React from 'react';
import { LucideIcon } from 'lucide-react';

interface AuthInputProps {
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
  Icon: LucideIcon;
}

function AuthInput({ type, value, onChange, label, Icon }: AuthInputProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="mt-1 relative">
        <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type={type}
          value={value}
          onChange={onChange}
          className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
    </div>
  );
}

export default AuthInput;