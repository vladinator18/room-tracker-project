import { useState, useEffect, useMemo } from 'react';
import { supabase } from './services/supabaseClient';
import { Calendar, Loader2, Filter, Info, MapPin } from 'lucide-react';

export default function Heatmap() {
  const [rawData, setRawData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [roomType, setRoomType] = useState('All');

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const times = [
    '07:30 AM', '09:00 AM', '10:30 AM', '12:00 PM', '01:30 PM', 
    '03:00 PM', '04:30 PM', '06:00 PM', '07:30 PM'
  ];

  // Specific Lab definitions
  const labNumbers = ['409', '407', '321', '320', '319', '318', '317', '316', '308', '304', '303'];

  useEffect(() => {
    fetchSupabaseData();
  }, []);

  const fetchSupabaseData = async () => {
    try {
      const { data, error } = await supabase.from('campus_schedule').select('*');
      if (error) throw error;
      setRawData(data || []);
    } catch (error) {
      console.error("Error fetching from Supabase:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const gridData = useMemo(() => {
    const grid = Array(9).fill(null).map(() => Array(7).fill({ count: 0, availableRooms: [] }));
    if (!rawData.length) return grid;

    rawData.forEach(row => {
      // Accommodate Supabase's automatic column naming during import
      const rowTime = row['time_slot'] || row['Time Slot'] || row['time slot'];
      const rowDay = row['day'] || row['Day'];

      const rowIndex = times.indexOf(rowTime);
      const colIndex = days.indexOf(rowDay);

      if (rowIndex !== -1 && colIndex !== -1) {
        let availableRooms = [];

        Object.entries(row).forEach(([key, value]) => {
          const lowerKey = key.toLowerCase();
          if (lowerKey === 'day' || lowerKey === 'time_slot' || lowerKey === 'time slot' || lowerKey === 'id') return;

          if (value === 'Available') {
            const cleanName = key.replace(/_/g, ' ').toUpperCase();
            const isLab = labNumbers.some(num => cleanName.includes(num));

            if (roomType === 'All') {
              availableRooms.push(cleanName);
            } else if (roomType === 'Lab' && isLab) {
              availableRooms.push(cleanName);
            } else if (roomType === 'Lecture' && !isLab) {
              availableRooms.push(cleanName);
            }
          }
        });

        grid[rowIndex][colIndex] = {
          count: availableRooms.length,
          availableRooms: availableRooms.sort()
        };
      }
    });
    return grid;
  }, [rawData, roomType]);

  const getColorClass = (count) => {
    let maxRooms = 19;
    if (roomType === 'Lab') maxRooms = 11;
    if (roomType === 'Lecture') maxRooms = 8; // 19 total - 11 labs

    if (count === 0) return 'bg-rose-500 text-white';
    
    const ratio = count / maxRooms;
    if (ratio <= 0.35) return 'bg-amber-400 text-slate-900';
    if (ratio <= 0.75) return 'bg-emerald-400 text-slate-900';
    return 'bg-emerald-700 text-white';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 font-sans">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center gap-3">
          <Calendar className="w-8 h-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-slate-800">Room Availability Heatmap</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <select 
            value={roomType} 
            onChange={(e) => setRoomType(e.target.value)}
            className="px-3 py-2 border rounded-lg bg-slate-50 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="All">All Rooms (19)</option>
            <option value="Lab">IT Labs Only (11)</option>
            <option value="Lecture">Lectures / Specialties</option>
          </select>
        </div>
      </div>

      {roomType === 'Lab' && (
        <div className="bg-blue-50 text-blue-800 text-sm px-4 py-3 rounded-lg mb-6 flex items-start gap-2 border border-blue-100">
          <Info className="w-5 h-5 shrink-0 mt-0.5" />
          <p><strong>Tracking IT Labs:</strong> Rooms 409, 407, 321, 320, 319, 318, 317, 316, 308, 304, and 303.</p>
        </div>
      )}

      <div className="flex items-center gap-6 mb-8 text-sm font-semibold text-slate-700">
        <span className="mr-2">Legend:</span>
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-rose-500 rounded-sm"></div> Full</div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-amber-400 rounded-sm"></div> Limited</div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-emerald-400 rounded-sm"></div> Good</div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-emerald-700 rounded-sm"></div> Wide Open</div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="overflow-x-auto pb-8">
          <div className="min-w-[800px]">
            <div className="grid grid-cols-[100px_repeat(7,1fr)] gap-2 mb-2">
              <div></div>
              {days.map(day => (
                <div key={day} className="text-center font-bold text-slate-600 text-sm py-2">{day}</div>
              ))}
            </div>

            {times.map((time, rowIndex) => (
              <div key={time} className="grid grid-cols-[100px_repeat(7,1fr)] gap-2 mb-2 items-center">
                <div className="text-right pr-4 text-xs font-semibold text-slate-500">{time}</div>
                
                {gridData[rowIndex]?.map((cell, colIndex) => (
                  <div 
                    key={`${rowIndex}-${colIndex}`} 
                    className={`relative group h-12 flex items-center justify-center rounded-md font-bold text-sm transition-colors ${getColorClass(cell.count)}`}
                  >
                    {cell.count}
                    
                    {/* Hover Tooltip */}
                    {cell.count > 0 && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-slate-900 text-white text-xs rounded-lg p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 shadow-xl pointer-events-none">
                        <div className="font-bold border-b border-slate-700 pb-2 mb-2 flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-blue-400" />
                          {days[colIndex]} @ {time}
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {cell.availableRooms.map(room => (
                            <span key={room} className="bg-slate-800 border border-slate-700 px-2 py-1 rounded shadow-sm">
                              {room}
                            </span>
                          ))}
                        </div>
                        {/* CSS Triangle Arrow */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
                      </div>
                    )}

                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
