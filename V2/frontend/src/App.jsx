import { useState } from 'react';
import { Calendar, Mail, ArrowRight, LogOut } from 'lucide-react';

export default function App() {
  const [email, setEmail] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleEnter = (e) => {
    e.preventDefault();
    
    // Basic validation to ensure it looks like an email
    if (email.trim() && email.includes('@')) {
      setIsLoggedIn(true);
    } else {
      alert("Please enter a valid email address.");
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
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Event Voting</h2>
          <p className="text-slate-500 text-sm mb-6">Enter your email to view available dates and cast your vote.</p>
          
          <form onSubmit={handleEnter} className="space-y-4">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="user@example.com"
            />
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors flex justify-center items-center gap-2"
            >
              Continue to Voting <ArrowRight className="w-4 h-4" />
            </button>
          </form>

        </div>
      </div>
    );
  }

  // 2. The Active Voting Dashboard
  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Navigation Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-bold text-slate-800">Event Voting Dashboard</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-600 hidden md:block">
              Voting as: <span className="font-bold">{email}</span>
            </span>
            <button 
              onClick={() => setIsLoggedIn(false)}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Change Email
            </button>
          </div>
        </div>
        
        {/* Voting UI placeholder */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Ready to Vote!</h2>
          <p className="text-slate-500">We will render the actual dates here next.</p>
        </div>

      </div>
    </div>
  );
}