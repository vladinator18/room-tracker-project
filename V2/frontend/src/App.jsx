import { useState } from 'react';
import CreateEvent from './CreateEvent';
import EventDashboard from './EventDashboard';
import Heatmap from './Heatmap';
import { Calendar, Mail, ArrowRight, LogOut, Loader2, Plus, List, Map } from 'lucide-react';

export default function App() {
  const [email, setEmail] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [activeTab, setActiveTab] = useState('heatmap'); 
  const [eventView, setEventView] = useState('list'); 

  const handleEnter = (e) => {
    e.preventDefault();
    setErrorMsg('');
    
    const cleanEmail = email.trim().toLowerCase();

    // No more whitelist check! As long as they typed an email, let them in.
    if (cleanEmail) {
      setIsLoggedIn(true);
    } else {
      setErrorMsg("Please enter a valid email address.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        <div className="bg-white rounded-xl shadow-sm border p-4 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex gap-2">
            <button 
              onClick={() => setActiveTab('heatmap')} 
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${activeTab === 'heatmap' ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <Map className="w-4 h-4" /> Room Heatmap
            </button>
            <button 
              onClick={() => setActiveTab('events')} 
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${activeTab === 'events' ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <Calendar className="w-4 h-4" /> Event Voting
            </button>
          </div>
          
          {isLoggedIn && activeTab === 'events' && (
            <button onClick={() => setIsLoggedIn(false)} className="flex items-center gap-2 text-slate-500 hover:text-rose-600 text-sm font-medium">
              <LogOut className="w-4 h-4" /> Sign Out ({email.split('@')[0]})
            </button>
          )}
        </div>

        {activeTab === 'heatmap' && <Heatmap />}

        {activeTab === 'events' && (
          <div className="max-w-4xl mx-auto">
            {!isLoggedIn ? (
              <div className="bg-white rounded-xl shadow-sm border p-8 text-center max-w-md mx-auto mt-12">
                <Mail className="w-12 h-12 text-blue-600 mx-auto mb-4 bg-blue-100 p-2 rounded-full" />
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Event Voting</h2>
                <p className="text-slate-500 mb-6">Enter your email to view polls and cast your vote.</p>
                
                {errorMsg && <div className="bg-rose-50 text-rose-600 p-3 rounded-lg mb-4 font-medium">{errorMsg}</div>}

                <form onSubmit={handleEnter} className="space-y-4">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="you@example.com"
                  />
                  <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg flex justify-center gap-2 items-center">
                    Access Polls <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </div>
            ) : (
              <div>
                <div className="flex gap-4 mb-6 border-b pb-4">
                  <button onClick={() => setEventView('list')} className={`flex items-center gap-2 px-3 py-1.5 rounded-md font-semibold text-sm ${eventView === 'list' ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}>
                    <List className="w-4 h-4" /> Active Polls
                  </button>
                  <button onClick={() => setEventView('create')} className={`flex items-center gap-2 px-3 py-1.5 rounded-md font-semibold text-sm ${eventView === 'create' ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}>
                    <Plus className="w-4 h-4" /> Create New Event
                  </button>
                </div>

                {eventView === 'list' ? (
                  <EventDashboard voterEmail={email.trim().toLowerCase()} />
                ) : (
                  <CreateEvent creatorEmail={email.trim().toLowerCase()} onEventCreated={() => setEventView('list')} />
                )}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
EOFcat << 'EOF' > V2/frontend/src/App.jsx
import { useState } from 'react';
import CreateEvent from './CreateEvent';
import EventDashboard from './EventDashboard';
import Heatmap from './Heatmap';
import { Calendar, Mail, ArrowRight, LogOut, Loader2, Plus, List, Map } from 'lucide-react';

export default function App() {
  const [email, setEmail] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [activeTab, setActiveTab] = useState('heatmap'); 
  const [eventView, setEventView] = useState('list'); 

  const handleEnter = (e) => {
    e.preventDefault();
    setErrorMsg('');
    
    const cleanEmail = email.trim().toLowerCase();

    // No more whitelist check! As long as they typed an email, let them in.
    if (cleanEmail) {
      setIsLoggedIn(true);
    } else {
      setErrorMsg("Please enter a valid email address.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        <div className="bg-white rounded-xl shadow-sm border p-4 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex gap-2">
            <button 
              onClick={() => setActiveTab('heatmap')} 
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${activeTab === 'heatmap' ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <Map className="w-4 h-4" /> Room Heatmap
            </button>
            <button 
              onClick={() => setActiveTab('events')} 
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${activeTab === 'events' ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <Calendar className="w-4 h-4" /> Event Voting
            </button>
          </div>
          
          {isLoggedIn && activeTab === 'events' && (
            <button onClick={() => setIsLoggedIn(false)} className="flex items-center gap-2 text-slate-500 hover:text-rose-600 text-sm font-medium">
              <LogOut className="w-4 h-4" /> Sign Out ({email.split('@')[0]})
            </button>
          )}
        </div>

        {activeTab === 'heatmap' && <Heatmap />}

        {activeTab === 'events' && (
          <div className="max-w-4xl mx-auto">
            {!isLoggedIn ? (
              <div className="bg-white rounded-xl shadow-sm border p-8 text-center max-w-md mx-auto mt-12">
                <Mail className="w-12 h-12 text-blue-600 mx-auto mb-4 bg-blue-100 p-2 rounded-full" />
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Event Voting</h2>
                <p className="text-slate-500 mb-6">Enter your email to view polls and cast your vote.</p>
                
                {errorMsg && <div className="bg-rose-50 text-rose-600 p-3 rounded-lg mb-4 font-medium">{errorMsg}</div>}

                <form onSubmit={handleEnter} className="space-y-4">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="you@example.com"
                  />
                  <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg flex justify-center gap-2 items-center">
                    Access Polls <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </div>
            ) : (
              <div>
                <div className="flex gap-4 mb-6 border-b pb-4">
                  <button onClick={() => setEventView('list')} className={`flex items-center gap-2 px-3 py-1.5 rounded-md font-semibold text-sm ${eventView === 'list' ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}>
                    <List className="w-4 h-4" /> Active Polls
                  </button>
                  <button onClick={() => setEventView('create')} className={`flex items-center gap-2 px-3 py-1.5 rounded-md font-semibold text-sm ${eventView === 'create' ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}>
                    <Plus className="w-4 h-4" /> Create New Event
                  </button>
                </div>

                {eventView === 'list' ? (
                  <EventDashboard voterEmail={email.trim().toLowerCase()} />
                ) : (
                  <CreateEvent creatorEmail={email.trim().toLowerCase()} onEventCreated={() => setEventView('list')} />
                )}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
