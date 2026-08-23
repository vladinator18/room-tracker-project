import { useState, useEffect } from 'react';
import { Calendar, Loader2 } from 'lucide-react';

export default function Heatmap() {
  const [availabilityData, setAvailabilityData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const times = [
    '07:30 AM', '09:00 AM', '10:30 AM', '12:00 PM', '01:30 PM', 
    '03:00 PM', '04:30 PM', '06:00 PM', '07:30 PM'
  ];

  // Fetch the CSV file from the public folder when the component loads
  useEffect(() => {
    fetchCSVData();
  }, []);

  const fetchCSVData = async () => {
    try {
      // Vite serves files in the public folder directly at the root URL
      const response = await fetch('/compiled_schedule.csv');
      const csvText = await response.text();
      
      parseCSVToGrid(csvText);
    } catch (error) {
      console.error("Error fetching the CSV:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const parseCSVToGrid = (csvText) => {
    // 1. Split the text into rows and remove any empty lines
    const rows = csvText.split('\n').filter(row => row.trim() !== '');
    
    // 2. Initialize a blank 9x7 grid (9 timeslots, 7 days)
    const grid = Array(9).fill(0).map(() => Array(7).fill(0));

    // 3. Skip the header row (i=1), then parse the data
    // Assuming CSV format: Time, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday
    for (let i = 1; i < rows.length; i++) {
      const columns = rows[i].split(',');
      
      // We only care about the 9 time blocks we defined
      const timeLabel = columns[0].trim();
      const rowIndex = times.indexOf(timeLabel);
      
      if (rowIndex !== -1) {
        // Loop through the 7 days and push the room counts into the grid
        for (let colIndex = 0; colIndex < 7; colIndex++) {
          // +1 because the first column is the Time label
          grid[rowIndex][colIndex] = parseInt(columns[colIndex + 1], 10) || 0; 
        }
      }
    }

    setAvailabilityData(grid);
  };

  const getColorClass = (count) => {
    if (count === 0) return 'bg-rose-500 text-white'; 
    if (count <= 6) return 'bg-amber-400 text-slate-900'; 
    if (count <= 14) return 'bg-emerald-400 text-slate-900'; 
    return 'bg-emerald-700 text-white'; 
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 font-sans">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center gap-3">
          <Calendar className="w-8 h-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-slate-800">Room Availability Heatmap</h1>
        </div>
        <div className="bg-slate-100 text-slate-600 px-4 py-2 rounded-full text-sm font-medium">
          Tracking rooms across Mapúa Makati
        </div>
      </div>

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
        <div className="overflow-x-auto pb-4">
          <div className="min-w-[800px]">
            <div className="grid grid-cols-[100px_repeat(7,1fr)] gap-2 mb-2">
              <div></div>
              {days.map(day => (
                <div key={day} className="text-center font-bold text-slate-600 text-sm py-2">
                  {day}
                </div>
              ))}
            </div>

            {times.map((time, rowIndex) => (
              <div key={time} className="grid grid-cols-[100px_repeat(7,1fr)] gap-2 mb-2 items-center">
                <div className="text-right pr-4 text-xs font-semibold text-slate-500">
                  {time}
                </div>
                
                {availabilityData[rowIndex]?.map((count, colIndex) => (
                  <div 
                    key={`${rowIndex}-${colIndex}`} 
                    className={`
                      h-12 flex items-center justify-center rounded-md font-bold text-sm cursor-pointer transition-all
                      hover:ring-2 hover:ring-blue-400 hover:ring-offset-1
                      ${getColorClass(count)}
                    `}
                  >
                    {count}
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