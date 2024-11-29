import React, { useState, useEffect, useCallback } from 'react';
import { OpenAI } from 'openai';
import { MessageSquare, UserPlus, Menu, X, FileSpreadsheet, ToggleLeft, ToggleRight, Building2, Bot } from 'lucide-react';
import ChatBot from './components/ChatBot';
import ChatBotSmart from './components/ChatBotSmart';
import Auth from './components/Auth/Auth';
import RegistrationCompletion from './components/RegistrationCompletion';
import Subscription from './components/Subscription';
import About from './components/About';
import Contact from './components/Contact';
import AddUser from './components/AddUser';
import PresentationViewer from './components/PresentationViewer';
import UserMenu from './components/UserMenu';
import { auth } from './config/firebase';
import { User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './config/firebase';
import ComponentsPage from './components/ComponentsPage';
import OrganizationSettings from './components/OrganizationSettings';

function App() {
  const [activeTool, setActiveTool] = useState('organization');
  const [showAuth, setShowAuth] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [devMode, setDevMode] = useState(false);
  const openai = new OpenAI({ 
    apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
    dangerouslyAllowBrowser: true
  });

  const checkUserRegistration = useCallback(async (user: User) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        setShowRegistration(true);
      }
    } catch (err) {
      console.error('Error checking user registration:', err);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user);
      if (user) {
        await checkUserRegistration(user);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [checkUserRegistration]);

  const scrollToSection = useCallback((id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMenuOpen(false);
  }, []);

  const renderTool = useCallback(() => {
    if (showRegistration) {
      return <RegistrationCompletion />;
    }

    if (!user && !devMode) {
      return (
        <div className="text-center p-8">
          <p className="text-xl mb-4">Please log in to access the tools</p>
          <button
            onClick={() => setShowAuth(true)}
            className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600"
          >
            Login to Continue
          </button>
        </div>
      );
    }

    switch (activeTool) {
      case 'organization':
        return <OrganizationSettings />;
      case 'interact':
        return <ComponentsPage />;
      case 'chat':
        return <ChatBot openai={openai} />;
      case 'chatbot-smart':
        return <ChatBotSmart />;
      case 'users':
        return <AddUser devMode={devMode} />;
      case 'presentation':
        return <PresentationViewer />;
      default:
        return null;
    }
  }, [activeTool, showRegistration, user, devMode, openai]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <header className="bg-gradient-to-r from-[#2E2457] via-[#453975] to-[#5C4E94] text-white py-4 fixed w-full z-50"> 
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center">
            <img 
              // src="/assets/leannone-logo-transparent.png" 
              src="https://raw.githubusercontent.com/YaadR/the-first-app-yaads-made/main/assets/leannone-logo-transparent.png"
              alt="LeannOne Logo" 
              className="h-8"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setDevMode(!devMode)}
              className="flex items-center space-x-2 text-sm"
              title="Toggle Developer Mode"
            >
              {devMode ? (
                <ToggleRight className="text-green-400" size={24} />
              ) : (
                <ToggleLeft className="text-gray-400" size={24} />
              )}
            </button>
            
            <div className="md:hidden">
              <button onClick={() => setMenuOpen(!menuOpen)} className="p-2">
                {menuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>

            {(user || devMode) && (
              <UserMenu user={user} devMode={devMode} />
            )}
          </div>

          <nav className={`${menuOpen ? 'block' : 'hidden'} md:block absolute md:relative top-full left-0 w-full md:w-auto bg-[#2E2457] md:bg-transparent`}>
            <ul className="flex flex-col md:flex-row md:items-center md:space-x-6 p-4 md:p-0">
              <li>
                <button onClick={() => scrollToSection('tools')} className="w-full text-left py-2 md:py-0 hover:text-gray-300">
                  Tools
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('pricing')} className="w-full text-left py-2 md:py-0 hover:text-gray-300">
                  Pricing
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('about')} className="w-full text-left py-2 md:py-0 hover:text-gray-300">
                  About
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('contact')} className="w-full text-left py-2 md:py-0 hover:text-gray-300">
                  Contact
                </button>
              </li>
              {!user && !devMode && (
                <li className="md:ml-4">
                  <button
                    onClick={() => setShowAuth(true)}
                    className="w-full md:w-auto bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-md transition-colors flex items-center justify-center"
                  >
                    Login
                  </button>
                </li>
              )}
            </ul>
          </nav>
        </div>
      </header>

      <main className="flex-grow pt-16">
        <section id="tools" className="min-h-screen">
          <div className="bg-gradient-to-r from-[#2E2457] via-[#453975] to-[#5C4E94] text-white py-20">
            <div className="container mx-auto px-4 text-center">
              <h1 className="text-4xl font-bold mb-4">LeannOne Agent</h1>
              <p className="text-xl">Accelerate your Business Processes with Leann.One</p>
            </div>
          </div>

          {(user || devMode) && (
            <div className="container mx-auto px-4 py-8">
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                <button
                  onClick={() => setActiveTool('organization')}
                  className={`flex items-center px-4 py-2 rounded-md ${
                    activeTool === 'organization' ? 'bg-[#2E2457] text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <Building2 className="mr-2" size={20} />
                  Organization
                </button>
                <button
                  onClick={() => setActiveTool('interact')}
                  className={`flex items-center px-4 py-2 rounded-md ${
                    activeTool === 'interact' ? 'bg-[#2E2457] text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <UserPlus className="mr-2" size={20} />
                  Interact
                </button>
                <button
                  onClick={() => setActiveTool('chat')}
                  className={`flex items-center px-4 py-2 rounded-md ${
                    activeTool === 'chat' ? 'bg-[#2E2457] text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <MessageSquare className="mr-2" size={20} />
                  ChatBot
                </button>
                <button
                  onClick={() => setActiveTool('chatbot-smart')}
                  className={`flex items-center px-4 py-2 rounded-md ${
                    activeTool === 'chatbot-smart' ? 'bg-[#2E2457] text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <Bot className="mr-2" size={20} />
                  Smart ChatBot
                </button>
                <button
                  onClick={() => setActiveTool('users')}
                  className={`flex items-center px-4 py-2 rounded-md ${
                    activeTool === 'users' ? 'bg-[#2E2457] text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <UserPlus className="mr-2" size={20} />
                  Manage Users
                </button>
                <button
                  onClick={() => setActiveTool('presentation')}
                  className={`flex items-center px-4 py-2 rounded-md ${
                    activeTool === 'presentation' ? 'bg-[#2E2457] text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <FileSpreadsheet className="mr-2" size={20} />
                  Presentation Viewer
                </button>
              </div>
            </div>
          )}

          <div className="container mx-auto px-4 py-8">
            {renderTool()}
          </div>
        </section>

        <section id="pricing" className="min-h-screen bg-gray-50 py-20">
          <Subscription />
        </section>

        <section id="about" className="min-h-screen py-20">
          <About />
        </section>

        <section id="contact" className="min-h-screen bg-gray-50 py-20">
          <Contact />
        </section>
      </main>

      <footer className="bg-[#2E2457] text-white py-6">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 LeannOne. All rights reserved.</p>
          <p className="mt-2 text-sm text-gray-400">Powered by AI API</p>
        </div>
      </footer>

      {showAuth && <Auth onClose={() => setShowAuth(false)} />}
    </div>
  );
}

export default App;