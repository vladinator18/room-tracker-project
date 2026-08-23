import { useState } from 'react';
import { votingApi } from './services/votingApi';
import CreateEvent from './CreateEvent';
import { Calendar, Mail, ArrowRight, LogOut, Loader2 } from 'lucide-react';

export default function App() {
  const [email, setEmail] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleEnter = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMsg("Please enter a valid email address.");
      setIsLoading(false);
      return;
    }

    try {
      // Ask the database if this email is on the guest list
      const isAuthorized = await votingApi.checkWhitelist(cleanEmail);
      
      if (isAuthorized) {
        setIsLoggedIn(true);
      } else {
        setErrorMsg("Access Denied: This email is not on the authorized guest list.");
      }
    } catch (error) {
      console.error(error);
      setErrorMsg("An error occurred while checking authorization.");
    } finally {
      setIsLoading(false);
    }
  };

  // 1. The Frictionless "Login" Gate
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm border p-8 text-center">
          
          <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Private Event Voting</h2>
          <p className="text-slate-500 text-sm mb-6">Enter your authorized email to view dates and cast your vote.</p>
          
          {errorMsg && (
            <div className="bg-rose-50 text-rose-600 p-3 rounded-lg text-sm font-medium mb-4">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleEnter} className="space-y-4">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@example.com"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors flex justify-center items-center gap-2"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>Continue to Dashboard <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

        </div>
      </div>
    );
  }

  // 2. The Active Dashboard
  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* Navigation Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-bold text-slate-800">Event Voting Dashboard</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-600 hidden md:block">
              Voting as: <span className="font-bold text-blue-600">{email.toLowerCase()}</span>
            </span>
            <button 
              onClick={() => {
                setIsLoggedIn(false);
                setEmail('');
              }}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
        
        {/* Load the Event Builder Component */}
        <CreateEvent creatorEmail={email.toLowerCase()} />

      </div>
    </div>
  );
}