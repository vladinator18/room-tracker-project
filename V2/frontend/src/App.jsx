import { useState, useEffect } from 'react';
import { authApi } from './services/authApi';
import Auth from './Auth';
import { LogOut, Calendar } from 'lucide-react';

export default function App() {
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check active session on load via API
    authApi.getSession().then((sessionData) => {
      setSession(sessionData);
      setIsLoading(false);
    });

    // Listen for login/logout events via API
    const subscription = authApi.onAuthStateChange((_event, sessionData) => {
      setSession(sessionData);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await authApi.signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-semibold">Authenticating session...</div>;
  }

  // Gatekeeper: Reject unauthorized access
  if (!session) {
    return <Auth />;
  }

  // Authorized Dashboard
  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Nav Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-bold text-slate-800">Event Voting Dashboard</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-600 hidden md:block">
              Authorized User: {session.user.email}
            </span>
            <button 
              onClick={handleSignOut}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Terminate Session
            </button>
          </div>
        </div>

        {/* Voting UI placeholder */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Authentication Successful</h2>
          <p className="text-slate-500">Secure voting interface initialized.</p>
        </div>

      </div>
    </div>
  );
}