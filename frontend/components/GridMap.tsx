"use client";
import { useState, useEffect } from 'react';
import { Zap, Home, Battery, Sun, Wind } from 'lucide-react';

export default function GridMap() {
  // Mock nodes for the grid
  const nodes = [
    { id: 1, x: 20, y: 30, type: 'consumer', status: 'buying', load: 2.4 },
    { id: 2, x: 50, y: 20, type: 'prosumer', status: 'selling', load: -1.5, source: 'solar' },
    { id: 3, x: 80, y: 30, type: 'consumer', status: 'neutral', load: 0.2 },
    { id: 4, x: 35, y: 60, type: 'prosumer', status: 'selling', load: -3.2, source: 'wind' },
    { id: 5, x: 65, y: 60, type: 'storage', status: 'charging', load: 1.8 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Local Grid Topology</h2>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-500"></span> Selling
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500"></span> Buying
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500"></span> Storage
          </div>
        </div>
      </div>

      <div className="relative w-full h-[500px] bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 shadow-2xl">
        {/* Grid Background */}
        <div className="absolute inset-0 opacity-20" 
             style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
        </div>

        {/* Connections */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22c55e" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.5" />
            </linearGradient>
          </defs>
          {/* Draw lines between nodes (simplified mesh) */}
          <line x1="20%" y1="30%" x2="50%" y2="20%" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
          <line x1="50%" y1="20%" x2="80%" y2="30%" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
          <line x1="20%" y1="30%" x2="35%" y2="60%" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
          <line x1="35%" y1="60%" x2="65%" y2="60%" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
          <line x1="50%" y1="20%" x2="65%" y2="60%" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
          
          {/* Active Transaction Animation */}
          <circle r="3" fill="#4ade80">
            <animateMotion dur="2s" repeatCount="indefinite" path="M 500 200 L 200 300" />
          </circle>
           <circle r="3" fill="#4ade80">
            <animateMotion dur="3s" repeatCount="indefinite" path="M 350 600 L 650 600" />
          </circle>
        </svg>

        {/* Nodes */}
        {nodes.map((node) => (
          <div 
            key={node.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
            style={{ left: `${node.x}%`, top: `${node.y}%` }}
          >
            {/* Pulse Effect */}
            <div className={`absolute inset-0 rounded-full animate-ping opacity-20 ${
              node.status === 'selling' ? 'bg-green-500' : node.status === 'buying' ? 'bg-red-500' : 'bg-blue-500'
            }`}></div>
            
            {/* Node Icon */}
            <div className={`relative w-16 h-16 rounded-full flex items-center justify-center border-4 shadow-lg transition-transform hover:scale-110 ${
              node.status === 'selling' ? 'bg-gray-800 border-green-500 text-green-500' : 
              node.status === 'buying' ? 'bg-gray-800 border-red-500 text-red-500' : 
              'bg-gray-800 border-blue-500 text-blue-500'
            }`}>
              {node.source === 'solar' ? <Sun size={24} /> : 
               node.source === 'wind' ? <Wind size={24} /> :
               node.type === 'storage' ? <Battery size={24} /> :
               <Home size={24} />}
            </div>

            {/* Tooltip/Label */}
            <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs py-1 px-2 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
              Node #{node.id} ({node.status})
              <br/>
              {node.load > 0 ? `Load: ${node.load} kW` : `Gen: ${Math.abs(node.load)} kW`}
            </div>
          </div>
        ))}
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-800 p-4 rounded-xl border border-gray-200 dark:border-zinc-700">
          <h3 className="text-gray-500 text-sm">Grid Stability</h3>
          <p className="text-2xl font-bold text-green-500">98.5%</p>
        </div>
        <div className="bg-white dark:bg-zinc-800 p-4 rounded-xl border border-gray-200 dark:border-zinc-700">
          <h3 className="text-gray-500 text-sm">Active Peers</h3>
          <p className="text-2xl font-bold">124</p>
        </div>
        <div className="bg-white dark:bg-zinc-800 p-4 rounded-xl border border-gray-200 dark:border-zinc-700">
          <h3 className="text-gray-500 text-sm">Total Throughput</h3>
          <p className="text-2xl font-bold text-indigo-500">450 kWh</p>
        </div>
      </div>
    </div>
  );
}
