import { useState, useEffect } from 'react';
import { votingApi } from './services/votingApi';
import { Calendar, Users, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';

export default function EventDashboard({ voterEmail }) {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [votingLoading, setVotingLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const data = await votingApi.getAllEvents();
      setEvents(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const openEvent = async (event) => {
    setLoading(true);
    setMsg('');
    try {
      const details = await votingApi.getEventDetails(event.id);
      setSelectedEvent(details);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (optionId) => {
    setVotingLoading(true);
    setMsg('');
    try {
      await votingApi.castVote(optionId, voterEmail);
      setMsg('Vote successfully cast!');
      await openEvent(selectedEvent); 
    } catch (error) {
      if (error.code === '23505') {
        setMsg('You have already voted for this specific date.');
      } else {
        setMsg('Failed to cast vote. Please try again.');
      }
    } finally {
      setVotingLoading(false);
    }
  };

  if (loading) return <div className="text-center p-8"><Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" /></div>;

  if (selectedEvent) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
        <button onClick={() => setSelectedEvent(null)} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to Events
        </button>
        
        <h2 className="text-2xl font-bold text-slate-800 mb-2">{selectedEvent.title}</h2>
        <p className="text-slate-600 mb-8">{selectedEvent.description}</p>

        {msg && (
          <div className={`p-4 rounded-lg text-sm font-medium mb-6 ${msg.includes('success') ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-600'}`}>
            {msg}
          </div>
        )}

        <div className="space-y-4">
          <h3 className="font-semibold text-slate-800 text-lg">Available Dates</h3>
          {selectedEvent.date_options.map(option => (
            <div key={option.id} className="flex justify-between items-center p-4 border rounded-lg hover:border-blue-300 transition-colors bg-slate-50">
              <div>
                <div className="font-bold text-slate-800 text-lg">{option.date_string}</div>
                <div className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                  <Users className="w-4 h-4" /> {option.date_votes.length} votes
                </div>
              </div>
              <button 
                onClick={() => handleVote(option.id)}
                disabled={votingLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {votingLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />} Vote
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-slate-800 mb-4">Active Polls</h2>
      {events.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border p-8 text-center text-slate-500">No events found. Create one to get started!</div>
      ) : (
        events.map(event => (
          <div 
            key={event.id} 
            onClick={() => openEvent(event)}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 cursor-pointer hover:border-blue-400 hover:shadow-md transition-all flex items-center gap-4"
          >
            <div className="bg-blue-100 p-3 rounded-full text-blue-600">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg">{event.title}</h3>
              <p className="text-slate-500 text-sm line-clamp-1">{event.description}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
