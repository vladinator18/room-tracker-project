import { useState } from 'react';
import { votingApi } from './services/votingApi';
import { CalendarPlus, Plus, Trash2, Loader2, CheckCircle } from 'lucide-react';

export default function CreateEvent({ creatorEmail, onEventCreated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dates, setDates] = useState(['', '']); // Start with two blank options
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Update a specific date row
  const handleDateChange = (index, value) => {
    const newDates = [...dates];
    newDates[index] = value;
    setDates(newDates);
  };

  // Add a new blank date row
  const addDateRow = () => setDates([...dates, '']);

  // Remove a date row
  const removeDateRow = (index) => {
    if (dates.length <= 2) return; // Keep at least 2 options
    setDates(dates.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMsg('');

    // Filter out any blank rows before submitting
    const validDates = dates.filter(d => d.trim() !== '');

    if (validDates.length < 2) {
      alert("Please provide at least two date/time options.");
      setIsLoading(false);
      return;
    }

    try {
      const eventId = await votingApi.createEvent(title, description, validDates, creatorEmail);
      setSuccessMsg('Event created successfully!');
      
      // Optional: Pass the new ID back to the main App to switch views
      if (onEventCreated) onEventCreated(eventId);
      
      // Reset form
      setTitle('');
      setDescription('');
      setDates(['', '']);
    } catch (error) {
      console.error(error);
      alert("Failed to create event.");
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

      <form onSubmit={handleSubmit} className="space-y-6">
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
              placeholder="e.g., Trying to figure out if we can avoid the Quarterm schedule conflicts. Vote on which window works best!"
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