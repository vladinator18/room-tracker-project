import CreateEvent from './CreateEvent';
import { Calendar } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* Public Navigation Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-bold text-slate-800">Event Voting Dashboard</h1>
          </div>
          <div className="text-sm font-medium text-slate-500">
            Public View
          </div>
        </div>
        
        {/* Load the Event Builder Component */}
        <CreateEvent />

      </div>
    </div>
  );
}