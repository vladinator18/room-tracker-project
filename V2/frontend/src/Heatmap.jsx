import { useState, useEffect, useMemo } from 'react';
import { supabase } from './services/supabaseClient';
import { Calendar, Clock, MapPin, XCircle, Filter, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIMES = ['07:30 AM', '09:00 AM', '10:30 AM', '12:00 PM', '01:30 PM', '03:00 PM', '04:30 PM', '06:00 PM', '07:30 PM'];
const LAB_NUMBERS = ['409', '407', '321', '320', '319', '318', '317', '316', '308', '304', '303'];
const ROOMS_PER_PAGE = 10;

export default function Heatmap() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCell, setSelectedCell] = useState(null);
  const [requiredBlocks, setRequiredBlocks] = useState(1); 
  const [roomCategory, setRoomCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  // Dynamic Room Counts
  const [roomCounts, setRoomCounts] = useState({ total: 0, labs: 0, lectures: 0 });

  useEffect(() => {
    const fetchSupabaseData = async () => {
      try {
        const { data: dbData, error } = await supabase.from('campus_schedule').select('*');
        if (error) throw error;

        setData(dbData || []);
        
        // Dynamically calculate how many rooms exist in the database table
        if (dbData && dbData.length > 0) {
          const sampleRow = dbData[0];
          const excludedKeys = ['id', 'day', 'time_slot', 'time slot'];
          
          const allRooms = Object.keys(sampleRow).filter(k => !excludedKeys.includes(k.toLowerCase()));
          const labs = allRooms.filter(room => LAB_NUMBERS.some(num => room.replace(/_/g, ' ').includes(num))).length;
          
          setRoomCounts({
            total: allRooms.length,
            labs: labs,
            lectures: allRooms.length - labs
          });
        }
      } catch (error) {
        console.error("Error fetching from Supabase:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSupabaseData();
  }, []);

  const heatmapData = useMemo(() => {
    const matrix = {};
    const baseAvailability = {};
    
    let maxThreshold = roomCounts.total;
    if (roomCategory === 'Lab') maxThreshold = roomCounts.labs;
    if (roomCategory === 'Lecture') maxThreshold = roomCounts.lectures;

    // 1. Map out base availability
    data.forEach(row => {
      const day = row.day || row.Day;
      const time = row.time_slot || row['Time Slot'] || row['time slot'];
      if (!day || !time) return;

      if (!baseAvailability[day]) baseAvailability[day] = {};

      let availableRooms = [];
      Object.entries(row).forEach(([key, value]) => {
        const lowerKey = key.toLowerCase();
        if (['id', 'day', 'time_slot', 'time slot'].includes(lowerKey)) return;

        if (value === 'Available') {
          // Clean up column names from Supabase (e.g. replacing underscores with spaces)
          const cleanName = key.replace(/_/g, ' ').toUpperCase();
          const isLab = LAB_NUMBERS.some(num => cleanName.includes(num));

          if (roomCategory === 'All') availableRooms.push(cleanName);
          else if (roomCategory === 'Lab' && isLab) availableRooms.push(cleanName);
          else if (roomCategory === 'Lecture' && !isLab) availableRooms.push(cleanName);
        }
      });

      baseAvailability[day][time] = availableRooms;
    });

    // 2. Calculate consecutive blocks
    DAYS.forEach(day => {
      matrix[day] = {};
      TIMES.forEach((time, index) => {
        if (index + requiredBlocks > TIMES.length) {
          matrix[day][time] = { availableCount: 0, totalCount: maxThreshold, availableRooms: [] };
          return;
        }

        const startingRooms = baseAvailability[day]?.[time] || [];
        const qualifiedRooms = [];
        
        startingRooms.forEach(room => {
          let consecutiveSlots = 1;
          while (
            index + consecutiveSlots < TIMES.length && 
            (baseAvailability[day]?.[TIMES[index + consecutiveSlots]] || []).includes(room)
          ) {
            consecutiveSlots++;
          }

          if (consecutiveSlots >= requiredBlocks) {
            qualifiedRooms.push({ name: room, slotsFree: consecutiveSlots });
          }
        });

        qualifiedRooms.sort((a, b) => b.slotsFree - a.slotsFree);

        matrix[day][time] = {
          availableCount: qualifiedRooms.length,
          totalCount: maxThreshold,
          availableRooms: qualifiedRooms
        };
      });
    });
    
    return matrix;
  }, [data, requiredBlocks, roomCategory, roomCounts]);

  const getCellColor = (available, total) => {
    if (total === 0) return 'bg-slate-100 border-slate-200 cursor-not-allowed';
    const ratio = available / total;
    
    if (ratio === 0) return 'bg-rose-500 hover:bg-rose-600 text-white border-rose-600'; 
    if (ratio < 0.35) return 'bg-amber-400 hover:bg-amber-500 text-slate-900 border-amber-500'; 
    if (ratio < 0.75) return 'bg-emerald-400 hover:bg-emerald-500 text-slate-900 border-emerald-500'; 
    return 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700'; 
  };

  const getRoomTagStyles = (slotsFree) => {
    if (slotsFree >= 4) return 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-sm'; 
    if (slotsFree === 3) return 'bg-blue-50 border-blue-300 text-blue-800 shadow-sm';      
    if (slotsFree === 2) return 'bg-amber-50 border-amber-300 text-amber-800 shadow-sm';         
    return 'bg-slate-50 border-slate-300 text-slate-700 shadow-sm';                              
  };

  const handleCellClick = (cellData, day, time) => {
    setSelectedCell({ day, time, ...cellData });
    setCurrentPage(1); 
  };

  const paginatedRooms = selectedCell 
    ? selectedCell.availableRooms.slice((currentPage - 1) * ROOMS_PER_PAGE, currentPage * ROOMS_PER_PAGE)
    : [];
  const totalPages = selectedCell ? Math.max(1, Math.ceil(selectedCell.availableCount / ROOMS_PER_PAGE)) : 1;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 font-sans">
      
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 border-b pb-4">
        <div className="flex items-center gap-3">
          <Calendar className="w-8 h-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-slate-800">Room Availability</h1>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-500 ml-1" />
            <select 
              value={roomCategory} 
              onChange={(e) => { setRoomCategory(e.target.value); setSelectedCell(null); }}
              className="bg-transparent text-sm font-semibold text-slate-700 outline-none cursor-pointer w-full"
            >
              <option value="All">All Rooms ({roomCounts.total})</option>
              <option value="Lab">IT Labs ({roomCounts.labs})</option>
              <option value="Lecture">Lectures ({roomCounts.lectures})</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200 w-full sm:w-auto">
            <Clock className="w-4 h-4 text-slate-500 ml-1" />
            <select 
              value={requiredBlocks}
              onChange={(e) => { setRequiredBlocks(Number(e.target.value)); setSelectedCell(null); }}
              className="bg-transparent text-sm font-semibold text-slate-700 outline-none cursor-pointer w-full"
            >
              <option value={1}>1.5 Hours (1 Slot)</option>
              <option value={2}>3.0 Hours (2 Slots)</option>
              <option value={3}>4.5 Hours (3 Slots)</option>
              <option value={4}>6.0+ Hours (4+ Slots)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-6 text-sm text-slate-600">
        <span className="font-semibold">Availability:</span>
        <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded bg-rose-500"></div> Full</div>
        <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded bg-amber-400"></div> Limited</div>
        <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded bg-emerald-400"></div> Good</div>
        <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded bg-emerald-600"></div> Wide Open</div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="overflow-x-auto pb-4">
          <div className="min-w-[800px]">
            <div className="grid grid-cols-[100px_repeat(7,1fr)] gap-2 mb-2">
              <div className="p-2"></div>
              {DAYS.map(day => (
                <div key={day} className="text-center font-bold text-slate-600 text-sm py-2">{day}</div>
              ))}
            </div>

            {TIMES.map((time, index) => (
              <div key={time} className="grid grid-cols-[100px_repeat(7,1fr)] gap-2 mb-2">
                <div className="flex items-center justify-end pr-4 text-xs font-semibold text-slate-500 whitespace-nowrap">
                  {time}
                </div>
                
                {DAYS.map(day => {
                  const cellData = heatmapData[day]?.[time] || { availableCount: 0, totalCount: roomCounts.total, availableRooms: [] };
                  const isSelected = selectedCell?.day === day && selectedCell?.time === time;
                  const isOutOfBounds = index + requiredBlocks > TIMES.length;
                  
                  return (
                    <button
                      key={`${day}-${time}`}
                      onClick={() => { if (!isOutOfBounds) handleCellClick(cellData, day, time); }}
                      disabled={isOutOfBounds}
                      className={`
                        h-12 rounded border shadow-sm transition-all flex items-center justify-center font-bold text-sm
                        ${getCellColor(cellData.availableCount, cellData.totalCount)}
                        ${isSelected ? 'ring-4 ring-blue-300 scale-105 z-10' : (!isOutOfBounds && 'hover:scale-105')}
                      `}
                    >
                      {isOutOfBounds ? '-' : (cellData.availableCount > 0 ? cellData.availableCount : '0')}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedCell && (
        <div className="mt-8 bg-slate-50 border border-slate-200 rounded-xl p-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Clock className="text-blue-700 w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  {selectedCell.day} starting at {selectedCell.time}
                </h3>
                <p className="text-slate-600 font-medium text-sm">
                  Found {selectedCell.availableCount} rooms (Minimum {requiredBlocks * 1.5} hrs)
                </p>
              </div>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-lg border shadow-sm">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <ChevronLeft className="w-5 h-5 text-slate-700" />
                </button>
                <span className="text-sm font-bold text-slate-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <ChevronRight className="w-5 h-5 text-slate-700" />
                </button>
              </div>
            )}
          </div>

          {selectedCell.availableCount === 0 ? (
            <div className="flex items-center gap-2 text-rose-600 font-semibold p-4 bg-rose-50 rounded-lg">
              <XCircle className="w-5 h-5" />
              No rooms match your filter criteria starting at {selectedCell.time}.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {paginatedRooms.map(room => (
                <div 
                  key={room.name} 
                  className={`flex flex-col px-4 py-3 rounded-xl border ${getRoomTagStyles(room.slotsFree)}`}
                >
                  <div className="flex items-center justify-between font-bold text-base mb-1">
                    <span className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 opacity-80" />
                      {room.name}
                    </span>
                  </div>
                  <div className="text-xs font-semibold opacity-90 tracking-wide">
                    {room.slotsFree * 1.5} HOURS FREE
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
