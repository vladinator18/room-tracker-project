import { useState } from 'react';
import { votingApi } from './services/votingApi';
import CreateEvent from './CreateEvent';
import EventDashboard from './EventDashboard';
import Heatmap from './Heatmap';
import { Calendar, Mail, ArrowRight, LogOut, Loader2, Plus, List, Map } from 'lucide-react';

export default function App() {
  const [email, setEmail] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState('heatmap'); // 'heatmap', 'list', or 'create'

  const handleEnter = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    
    const cleanEmail = email.trim().toLowerCase();

    try {
      const isAuthorized = await votingApi.checkWhitelist(cleanEmail);
      if (isAuthorized) {
        setIsLoggedIn(true);
      } else {
        setErrorMsg("Access Denied: Email not on whitelist.");
      }
    } catch (error) {
      setErrorMsg("Error checking authorization.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm border p-8 text-center">
          <Mail className="w-12 h-12 text-blue-600 mx-auto mb-4 bg-blue-100 p-2 rounded-full" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Campus & Event Hub</h2>
          <p className="text-slate-500 mb-6">Enter an authorized email to access the dashboard.</p>
          
          {errorMsg && <div className="bg-rose-50 text-rose-600 p-3 rounded-lg mb-4 font-medium">{errorMsg}</div>}

          <form onSubmit={handleEnter} className="space-y-4">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg"
              placeholder="you@example.com"
            />
            <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg flex justify-center gap-2 items-center">
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Access Dashboard <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border p-4 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-wrap gap-2 md:gap-4 justify-center">
            <button onClick={() => setActiveTab('heatmap')} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold ${activeTab === 'heatmap' ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}>
              <Map className="w-4 h-4" /> Room Heatmap
            </button>
            <button onClick={() => setActiveTab('list')} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold ${activeTab === 'list' ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}>
              <List className="w-4 h-4" /> Active Polls
            </button>
            <button onClick={() => setActiveTab('create')} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold ${activeTab === 'create' ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}>
              <Plus className="w-4 h-4" /> Create Event
            </button>
          </div>
          <button onClick={() => setIsLoggedIn(false)} className="flex items-center gap-2 text-slate-500 hover:text-slate-800">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>

        {activeTab === 'heatmap' && <Heatmap />}
        {activeTab === 'list' && <EventDashboard voterEmail={email.trim().toLowerCase()} />}
        {activeTab === 'create' && <CreateEvent creatorEmail={email.trim().toLowerCase()} onEventCreated={() => setActiveTab('list')} />}
      </div>
    </div>
  );
}