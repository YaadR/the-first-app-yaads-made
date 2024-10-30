import { useState, useEffect } from 'react';
import { OpenAI } from 'openai';
import { ImageIcon, Code2, MessageSquare, UserCircle2 } from 'lucide-react';
import ImageGenerator from './components/ImageGenerator';
import ChatBot from './components/ChatBot';
import Auth from './components/Auth/Auth';
import Subscription from './components/Subscription';
import About from './components/About';
import Contact from './components/Contact';
import AddUser from './components/AddUser';
import UserMenu from './components/UserMenu';
import { auth } from './config/firebase';
import { User } from 'firebase/auth';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

function App() {
  const [activePage, setActivePage] = useState('image');
  const [showAuth, setShowAuth] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const renderContent = () => {
    switch (activePage) {
      case 'image':
      case 'chat':
        return !user ? (
          <div className="text-center">
            <p className="text-xl mb-4">Please log in to access the AI tools</p>
            <button
              onClick={() => setShowAuth(true)}
              className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600"
            >
              Login to Continue
            </button>
          </div>
        ) : (
          activePage === 'image' ? <ImageGenerator openai={openai} /> : <ChatBot openai={openai} />
        );
      case 'addUser':
        return <AddUser />;
      case 'subscription':
        return <Subscription />;
      case 'about':
        return <About />;
      case 'contact':
        return <Contact />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-gray-800 text-white py-4">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center">
            <Code2 className="mr-2" size={24} />
            <span className="text-xl font-bold">The Koko App</span>
          </div>
          <nav className="flex items-center space-x-6">
            <ul className="flex space-x-4">
              <li>
                <button 
                  onClick={() => setActivePage('image')} 
                  className="hover:text-gray-300"
                >
                  Home
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActivePage('subscription')} 
                  className="hover:text-gray-300"
                >
                  Pricing
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActivePage('about')} 
                  className="hover:text-gray-300"
                >
                  About
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActivePage('contact')} 
                  className="hover:text-gray-300"
                >
                  Contact
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActivePage('addUser')} 
                  className="hover:text-gray-300"
                >
                  Add User
                </button>
              </li>

            </ul>
            {user ? (
              <UserMenu user={user} />
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-md transition-colors"
              >
                <UserCircle2 size={20} />
                <span>Login</span>
              </button>
            )}
          </nav>
        </div>
      </header>

      {(activePage === 'image' || activePage === 'chat') && (
        <nav className="bg-gray-100 shadow-md">
          <div className="container mx-auto px-4 py-2">
            <ul className="flex space-x-4">
              <li>
                <button
                  onClick={() => setActivePage('image')}
                  className={`flex items-center px-3 py-2 rounded-md ${activePage === 'image' ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-200'}`}
                >
                  <ImageIcon className="mr-2" size={20} />
                  Image Generator
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActivePage('chat')}
                  className={`flex items-center px-3 py-2 rounded-md ${activePage === 'chat' ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-200'}`}
                >
                  <MessageSquare className="mr-2" size={20} />
                  ChatBot
                </button>
              </li>
              
            </ul>
          </div>
        </nav>
      )}

      <main className="flex-grow">
        <div className="bg-gradient-to-r from-blue-600 via-purple-500 to-green-500 text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold mb-4">The Koko App AI Tools</h1>
            <p className="text-xl">Transform your ideas into stunning visuals and engage in intelligent conversations</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          {renderContent()}
        </div>
      </main>

      <footer className="bg-gray-800 text-white py-6">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 The Koko App. All rights reserved.</p>
          <p className="mt-2 text-sm text-gray-400">Powered by DALL-E 3 and GPT-4 from OpenAI</p>
        </div>
      </footer>

      {showAuth && <Auth onClose={() => setShowAuth(false)} />}
    </div>
  );
}

export default App;