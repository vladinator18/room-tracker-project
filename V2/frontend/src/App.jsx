import { useState, useEffect, useMemo } from 'react';
import Papa from 'papaparse';
import { Calendar, Clock, MapPin, CheckCircle2, XCircle, Filter, DoorOpen } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIMES = ['07:30 AM', '09:00 AM', '10:30 AM', '12:00 PM', '01:30 PM', '03:00 PM', '04:30 PM', '06:00 PM', '07:30 PM'];

export default function App() {
  const [data, setData] = useState([]);
  const [selectedCell, setSelectedCell] = useState(null);
  const [requiredBlocks, setRequiredBlocks] = useState(1); 
  const [selectedRoomFilter, setSelectedRoomFilter] = useState('All');

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('/compiled_schedule.csv');
      const reader = await response.text();
      
      Papa.parse(reader, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          setData(results.data);
        },
      });
    };
    fetchData();
  }, []);

  // Extract all unique room names from the dataset
  const allRooms = useMemo(() => {
    if (data.length === 0) return [];
    return Object.keys(data[0]).filter(k => k !== 'Day' && k !== 'Time Slot');
  }, [data]);

  // Process the raw CSV and calculate availability based on filters
  const heatmapData = useMemo(() => {
    const matrix = {};
    const baseAvailability = {};

    // First pass: Figure out exactly who is free
    data.forEach(row => {
      const day = row.Day;
      const time = row['Time Slot'];
      if (!baseAvailability[day]) baseAvailability[day] = {};

      const roomNames = Object.keys(row).filter(k => k !== 'Day' && k !== 'Time Slot');
      
      let availableRooms = roomNames.filter(room => row[room] === 'Available');
      
      // Apply the specific room filter if one is selected
      if (selectedRoomFilter !== 'All') {
        availableRooms = availableRooms.filter(room => room === selectedRoomFilter);
      }
      
      baseAvailability[day][time] = availableRooms;
    });

    const currentTotalRooms = selectedRoomFilter === 'All' ? allRooms.length : 1;

    // Second pass: Calculate consecutive block overlaps
    DAYS.forEach(day => {
      matrix[day] = {};
      TIMES.forEach((time, index) => {
        
        if (index + requiredBlocks > TIMES.length) {
          matrix[day][time] = { availableCount: 0, totalCount: currentTotalRooms, availableRooms: [] };
          return;
        }

        let continuousRooms = baseAvailability[day]?.[time] || [];
        
        for (let i = 1; i < requiredBlocks; i++) {
          const nextTime = TIMES[index + i];
          const nextAvailable = baseAvailability[day]?.[nextTime] || [];
          continuousRooms = continuousRooms.filter(room => nextAvailable.includes(room));
        }

        matrix[day][time] = {
          availableCount: continuousRooms.length,
          totalCount: currentTotalRooms,
          availableRooms: continuousRooms
        };
      });
    });
    
    return matrix;
  }, [data, requiredBlocks, selectedRoomFilter, allRooms.length]);

  const getCellColor = (available, total) => {
    if (total === 0) return 'bg-slate-100 border-slate-200';
    const ratio = available / total;
    
    if (ratio === 0) return 'bg-rose-500 hover:bg-rose-600 text-white border-rose-600'; 
    if (ratio < 0.35) return 'bg-amber-400 hover:bg-amber-500 text-slate-900 border-amber-500'; 
    if (ratio < 0.75) return 'bg-emerald-400 hover:bg-emerald-500 text-slate-900 border-emerald-500'; 
    return 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700'; 
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        
        {/* Header Section */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6 border-b pb-6">
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-slate-800">Room Tracker</h1>
          </div>
          
          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            
            {/* Room Selector */}
            <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border w-full sm:w-auto">
              <DoorOpen className="w-4 h-4 text-slate-500 ml-1" />
              <label className="text-sm font-semibold text-slate-700">Room:</label>
              <select 
                value={selectedRoomFilter}
                onChange={(e) => {
                  setSelectedRoomFilter(e.target.value);
                  setSelectedCell(null);
                }}
                className="bg-white border rounded px-2 py-1 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[120px]"
              >
                <option value="All">All Rooms</option>
                {allRooms.map(room => (
                  <option key={room} value={room}>{room}</option>
                ))}
              </select>
            </div>

            {/* Duration Selector */}
            <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-500 ml-1" />
              <label className="text-sm font-semibold text-slate-700">Duration:</label>
              <select 
                value={requiredBlocks}
                onChange={(e) => {
                  setRequiredBlocks(Number(e.target.value));
                  setSelectedCell(null);
                }}
                className="bg-white border rounded px-2 py-1 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={1}>1.5 Hrs</option>
                <option value={2}>3.0 Hrs</option>
                <option value={3}>4.5 Hrs</option>
                <option value={4}>6.0 Hrs</option>
              </select>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mb-6 text-sm text-slate-600">
          <span className="font-semibold">Availability:</span>
          <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded bg-rose-500"></div> Full</div>
          {selectedRoomFilter === 'All' && (
            <>
              <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded bg-amber-400"></div> Limited</div>
              <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded bg-emerald-400"></div> Good</div>
            </>
          )}
          <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded bg-emerald-600"></div> Available</div>
        </div>

        {/* Heatmap Grid */}
        <div className="overflow-x-auto pb-4">
          <div className="min-w-[800px]">
            {/* Grid Headers */}
            <div className="grid grid-cols-8 gap-2 mb-2">
              <div className="p-2"></div>
              {DAYS.map(day => (
                <div key={day} className="text-center font-bold text-slate-600 text-sm py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Grid Body */}
            {TIMES.map(time => (
              <div key={time} className="grid grid-cols-8 gap-2 mb-2">
                <div className="flex items-center justify-end pr-4 text-xs font-semibold text-slate-500 whitespace-nowrap">
                  {time}
                </div>
                
                {DAYS.map(day => {
                  const cellData = heatmapData[day]?.[time] || { availableCount: 0, totalCount: allRooms.length, availableRooms: [] };
                  const isSelected = selectedCell?.day === day && selectedCell?.time === time;
                  
                  return (
                    <button
                      key={`${day}-${time}`}
                      onClick={() => setSelectedCell({ day, time, ...cellData })}
                      className={`
                        h-12 rounded border shadow-sm transition-all flex items-center justify-center font-bold text-sm
                        ${getCellColor(cellData.availableCount, cellData.totalCount)}
                        ${isSelected ? 'ring-4 ring-blue-300 scale-105 z-10' : 'hover:scale-105'}
                      `}
                      title={selectedRoomFilter === 'All' ? `${cellData.availableCount} rooms available` : (cellData.availableCount ? 'Available' : 'Occupied')}
                    >
                      {selectedRoomFilter === 'All' ? (cellData.availableCount > 0 ? cellData.availableCount : '0') : (cellData.availableCount > 0 ? 'Free' : '')}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Selected Details Panel */}
        {selectedCell && (
          <div className="mt-8 bg-blue-50 border border-blue-100 rounded-xl p-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center gap-4 border-b border-blue-200 pb-4 mb-4">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Clock className="text-blue-700 w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-blue-900">
                  {selectedCell.day} starting at {selectedCell.time}
                </h3>
                <p className="text-blue-700 font-medium">
                  {selectedRoomFilter === 'All' 
                    ? `${selectedCell.availableCount} rooms remain free for the full ${requiredBlocks * 1.5} hours`
                    : `${selectedRoomFilter} is ${selectedCell.availableCount ? 'available' : 'occupied'} for this duration.`}
                </p>
              </div>
            </div>

            {selectedCell.availableCount === 0 ? (
              <div className="flex items-center gap-2 text-rose-600 font-semibold p-4 bg-rose-50 rounded-lg">
                <XCircle className="w-5 h-5" />
                {selectedRoomFilter === 'All' 
                  ? `No rooms are continuously available for this duration starting at ${selectedCell.time}.`
                  : `${selectedRoomFilter} is unavailable during this time block.`}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {selectedCell.availableRooms.map(room => (
                  <div key={room} className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border shadow-sm text-slate-700 font-semibold">
                    <MapPin className="w-4 h-4 text-emerald-500" />
                    {room}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}