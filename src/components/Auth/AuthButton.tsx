import React from 'react';

interface AuthButtonProps {
  onClick: () => void;
  children: React.ReactNode;
}

function AuthButton({ onClick, children }: AuthButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
    >
      {children}
    </button>
  );
}

export default AuthButton;