"use client";
import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Brush } from 'recharts';

export default function Dashboard() {
  const [data, setData] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(false);

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
