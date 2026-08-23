import { useState } from 'react';
import { votingApi } from './services/votingApi';
import { CalendarPlus, Plus, Trash2, Loader2, CheckCircle, Mail } from 'lucide-react';

export default function CreateEvent({ onEventCreated }) {
  const [creatorEmail, setCreatorEmail] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dates, setDates] = useState(['', '']); 
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleDateChange = (index, value) => {
    const newDates = [...dates];
    newDates[index] = value;
    setDates(newDates);
  };

  const addDateRow = () => setDates([...dates, '']);

  const removeDateRow = (index) => {
    if (dates.length <= 2) return;
    setDates(dates.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    const cleanEmail = creatorEmail.trim().toLowerCase();
    const validDates = dates.filter(d => d.trim() !== '');

    if (validDates.length < 2) {
      setErrorMsg("Please provide at least two date/time options.");
      setIsLoading(false);
      return;
    }

    try {
      // 1. Verify the email against the whitelist first
      const isAuthorized = await votingApi.checkWhitelist(cleanEmail);
      if (!isAuthorized) {
        setErrorMsg("Access Denied: This email is not authorized to create events.");
        setIsLoading(false);
        return;
      }

      // 2. If authorized, create the event
      const eventId = await votingApi.createEvent(title, description, validDates, cleanEmail);
      setSuccessMsg('Event created successfully!');
      
      if (onEventCreated) onEventCreated(eventId);
      
      // Reset form
      setTitle('');
      setDescription('');
      setDates(['', '']);
      setCreatorEmail('');
    } catch (error) {
      console.error(error);
      setErrorMsg("Failed to create event. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <CalendarPlus className="w-6 h-6 text-blue-600" />
        <h2 className="text-xl font-bold text-slate-800">Create New Poll</h2>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 text-emerald-700 p-4 rounded-lg text-sm font-medium mb-6 flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-50 text-rose-600 p-4 rounded-lg text-sm font-medium mb-6">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Creator Authorization */}
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <label className="block text-sm font-semibold text-slate-700 mb-1">Your Authorized Email</label>
          <div className="relative">
            <Mail className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="email"
              required
              value={creatorEmail}
              onChange={(e) => setCreatorEmail(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              placeholder="Must be on the whitelist to create events"
            />
          </div>
        </div>

        <hr className="border-slate-200" />

        {/* Event Details */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Event Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Disney Cruise 2026"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Description & Context</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
              placeholder="e.g., Trying to figure out if we can avoid the schedule conflicts."
            />
          </div>
        </div>

        <hr className="border-slate-200" />

        {/* Dynamic Date/Time Options */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-3">Proposed Dates / Times</label>
          <div className="space-y-3">
            {dates.map((date, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  required
                  value={date}
                  onChange={(e) => handleDateChange(index, e.target.value)}
                  className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={index === 0 ? "e.g., September 3, 2026" : index === 1 ? "e.g., Nov 2 - 7, 2026" : "Add another option..."}
                />
                <button
                  type="button"
                  onClick={() => removeDateRow(index)}
                  disabled={dates.length <= 2}
                  className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-slate-400"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
          
          <button
            type="button"
            onClick={addDateRow}
            className="mt-3 flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add another option
          </button>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 rounded-lg transition-colors flex justify-center items-center gap-2"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Generate Voting Link'}
        </button>
      </form>
    </div>
  );
}