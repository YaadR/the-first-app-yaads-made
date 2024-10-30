import { useState } from 'react';
import { LogOut } from 'lucide-react';
import { User, signOut } from 'firebase/auth';
import { auth } from '../config/firebase';

interface UserMenuProps {
  user: User;
}

function UserMenu({ user }: UserMenuProps) {
  const [showLogout, setShowLogout] = useState(false);

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setShowLogout(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="relative">
      <div
        className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-md transition-colors cursor-pointer"
        onMouseEnter={() => setShowLogout(true)}
        onMouseLeave={() => setShowLogout(false)}
      >
        <span className="font-medium">
          {getUserInitials(user.displayName || user.email || 'User')}
        </span>
      </div>
      {showLogout && (
        <div
          className="absolute right-0 mt-2 py-2 w-48 bg-white rounded-md shadow-xl z-50"
          onMouseEnter={() => setShowLogout(true)}
          onMouseLeave={() => setShowLogout(false)}
        >
          <button
            onClick={handleLogout}
            className="flex items-center px-4 py-2 text-gray-800 hover:bg-gray-100 w-full"
          >
            <LogOut className="mr-2" size={16} />
            <span>Log Out</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default UserMenu;