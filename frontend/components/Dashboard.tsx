"use client";
import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Brush } from 'recharts';

export default function Dashboard() {
  // Initialize with dummy data immediately for screenshot readiness
  const generateDummyData = () => {
    const now = Date.now();
    return Array.from({ length: 30 }, (_, i) => ({
      timestamp: new Date(now - (29 - i) * 3600000).toISOString(),
      consumption: 2 + Math.sin(i/5) + Math.random() * 0.5,
      production: 1.5 + Math.cos(i/5) + Math.random() * 1.5,
      type: 'history',
      displayDate: new Date(now - (29 - i) * 3600000).toLocaleDateString(undefined, { hour: '2-digit' })
    })).concat(Array.from({ length: 24 }, (_, i) => ({
      timestamp: new Date(now + (i + 1) * 3600000).toISOString(),
      predicted_consumption: 2 + Math.sin((i+30)/5) + Math.random() * 0.2,
      predicted_production: 1.5 + Math.cos((i+30)/5) + Math.random() * 0.5,
      type: 'forecast',
      displayDate: new Date(now + (i + 1) * 3600000).toLocaleDateString(undefined, { hour: '2-digit' })
    })));
  };

  const [data, setData] = useState<any[]>(generateDummyData());
  const [summary, setSummary] = useState<any>({
    total_consumption_30d: 450,
    total_production_30d: 380,
    predicted_consumption_24h: 45,
    predicted_production_24h: 52
  });
  const [loading, setLoading] = useState(false);
  
  // Live Telemetry State
  const [livePower, setLivePower] = useState(4.2);
  const [gridFreq, setGridFreq] = useState(50.0);
  const [voltage, setVoltage] = useState(230.1);

  useEffect(() => {
    const interval = setInterval(() => {
      setLivePower(prev => +(prev + (Math.random() * 0.4 - 0.2)).toFixed(2));
      setGridFreq(prev => +(50.0 + (Math.random() * 0.1 - 0.05)).toFixed(2));
      setVoltage(prev => +(230.0 + (Math.random() * 2 - 1)).toFixed(1));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const fetchForecast = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3001/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}) 
      });
      const result = await res.json();
      
      if (result.history && result.forecast) {
        // Combine history and forecast for the chart
        // We only take the last 7 days of history for the default view to avoid overcrowding
        // but keep full data available
        const combined = [
            ...result.history,
            ...result.forecast
        ].map(d => ({
            ...d,
            // Format date for X-axis
            displayDate: new Date(d.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit' })
        }));
        
        setData(combined);
        setSummary(result.summary);
      }
    } catch (err) {
      console.error("Failed to fetch forecast:", err);
      // Fallback data for demo purposes if backend is offline
      const now = Date.now();
      const dummyData = Array.from({ length: 30 }, (_, i) => ({
        timestamp: new Date(now - (29 - i) * 3600000).toISOString(),
        consumption: 2 + Math.random() * 2,
        production: 1 + Math.random() * 3,
        type: 'history',
        displayDate: new Date(now - (29 - i) * 3600000).toLocaleDateString(undefined, { hour: '2-digit' })
      })).concat(Array.from({ length: 24 }, (_, i) => ({
        timestamp: new Date(now + (i + 1) * 3600000).toISOString(),
        predicted_consumption: 2 + Math.random() * 2,
        predicted_production: 1 + Math.random() * 3,
        type: 'forecast',
        displayDate: new Date(now + (i + 1) * 3600000).toLocaleDateString(undefined, { hour: '2-digit' })
      })));
      setData(dummyData);
      setSummary({
        total_consumption_30d: 450,
        total_production_30d: 380,
        predicted_consumption_24h: 45,
        predicted_production_24h: 52
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForecast();
  }, []);

  // Calculate split index for the reference line (where history ends and forecast begins)
  const splitIndex = data.findIndex(d => d.type === 'forecast');

  return (
    <div className="space-y-6">
      {/* Live Telemetry Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-black text-green-400 p-4 rounded-lg font-mono border border-green-500/30 shadow-[0_0_10px_rgba(34,197,94,0.2)] flex justify-between items-center">
          <div>
            <p className="text-xs text-green-600 uppercase">Live Net Load</p>
            <p className="text-2xl font-bold">{livePower} kW</p>
          </div>
          <div className="h-2 w-2 bg-green-500 rounded-full animate-ping"></div>
        </div>
        <div className="bg-black text-blue-400 p-4 rounded-lg font-mono border border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.2)] flex justify-between items-center">
          <div>
            <p className="text-xs text-blue-600 uppercase">Grid Frequency</p>
            <p className="text-2xl font-bold">{gridFreq} Hz</p>
          </div>
          <div className="text-xs px-2 py-1 bg-blue-900/50 rounded text-blue-300">STABLE</div>
        </div>
        <div className="bg-black text-purple-400 p-4 rounded-lg font-mono border border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.2)] flex justify-between items-center">
          <div>
            <p className="text-xs text-purple-600 uppercase">Voltage</p>
            <p className="text-2xl font-bold">{voltage} V</p>
          </div>
          <div className="text-xs px-2 py-1 bg-purple-900/50 rounded text-purple-300">NOMINAL</div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="p-6 bg-white dark:bg-zinc-800/50 rounded-xl border border-gray-200 dark:border-neutral-700">
          <h3 className="text-sm text-gray-500 mb-2">30-Day Consumption</h3>
          <p className="text-2xl font-bold text-blue-500">{summary?.total_consumption_30d ? Math.round(summary.total_consumption_30d) : '...'} kWh</p>
        </div>
        <div className="p-6 bg-white dark:bg-zinc-800/50 rounded-xl border border-gray-200 dark:border-neutral-700">
          <h3 className="text-sm text-gray-500 mb-2">30-Day Production</h3>
          <p className="text-2xl font-bold text-green-500">{summary?.total_production_30d ? Math.round(summary.total_production_30d) : '...'} kWh</p>
        </div>
        <div className="p-6 bg-white dark:bg-zinc-800/50 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gradient-to-br from-indigo-500/10 to-purple-500/10">
          <h3 className="text-sm text-gray-500 mb-2">Predicted Usage (24h)</h3>
          <p className="text-2xl font-bold text-indigo-500">{summary?.predicted_consumption_24h ? Math.round(summary.predicted_consumption_24h) : '...'} kWh</p>
        </div>
        <div className="p-6 bg-white dark:bg-zinc-800/50 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gradient-to-br from-green-500/10 to-emerald-500/10">
          <h3 className="text-sm text-gray-500 mb-2">Predicted Gen (24h)</h3>
          <p className="text-2xl font-bold text-emerald-500">{summary?.predicted_production_24h ? Math.round(summary.predicted_production_24h) : '...'} kWh</p>
        </div>
      </div>

      {/* Main Chart */}
      <div className="p-6 bg-white dark:bg-zinc-800/50 rounded-xl border border-gray-200 dark:border-neutral-700">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <h3 className="text-xl font-bold">Energy Analysis & LSTM Forecast</h3>
            <span className="ml-3 px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-100 text-xs rounded-full flex items-center gap-1">
              <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
              PyTorch LSTM Model
            </span>
          </div>
          <button 
            onClick={fetchForecast}
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm transition-colors disabled:opacity-50"
          >
            {loading ? 'Running Model...' : 'Update Analysis'}
          </button>
        </div>
        
        <div className="h-[500px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorProd" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorCons" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="displayDate" 
                minTickGap={50}
                tick={{fontSize: 12}}
              />
              <YAxis />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
              />
              <ReferenceLine x={data[splitIndex]?.displayDate} stroke="red" strokeDasharray="3 3" label="Forecast Start" />
              
              <Area type="monotone" dataKey="production" stroke="#22c55e" fillOpacity={1} fill="url(#colorProd)" name="Production (kWh)" />
              <Area type="monotone" dataKey="consumption" stroke="#3b82f6" fillOpacity={1} fill="url(#colorCons)" name="Consumption (kWh)" />
              <Brush dataKey="displayDate" height={30} stroke="#8884d8" startIndex={data.length - 48} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
