"use client";
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES } from '../config';
import P2PTradingArtifact from '../contracts/P2PTrading.json';
import { Zap, TrendingUp, Leaf, Battery } from 'lucide-react';

export default function Marketplace({ walletAddress }: { walletAddress: string }) {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Mock data for demo purposes if contract is empty
  const mockListings = [
    { id: 101, seller: "0x71...3A", amount: "50", price: "0.12", type: "Solar", reliability: "High" },
    { id: 102, seller: "0x82...9B", amount: "120", price: "0.10", type: "Wind", reliability: "Medium" },
    { id: 103, seller: "0x93...4C", amount: "30", price: "0.15", type: "Battery", reliability: "High" },
    { id: 104, seller: "0xA4...5D", amount: "200", price: "0.09", type: "Solar", reliability: "Low" },
  ];

  useEffect(() => {
    // In a real scenario, we would fetch from blockchain
    // For the demo, we mix real (if any) and mock
    setListings(mockListings);
  }, [walletAddress]);

  return (
    <div className="space-y-8">
      {/* Market Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-6 h-6" />
            <h3 className="font-bold text-lg">Market Price</h3>
          </div>
          <p className="text-4xl font-bold">0.12 ENG<span className="text-sm font-normal opacity-80">/kWh</span></p>
          <p className="text-sm mt-2 opacity-80">+2.4% from yesterday</p>
        </div>
        
        <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 border border-gray-200 dark:border-zinc-700 shadow-sm">
          <div className="flex items-center gap-3 mb-2 text-green-600">
            <Leaf className="w-6 h-6" />
            <h3 className="font-bold text-lg">Green Energy Ratio</h3>
          </div>
          <p className="text-4xl font-bold text-gray-900 dark:text-white">78%</p>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-3 dark:bg-gray-700">
            <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '78%' }}></div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 border border-gray-200 dark:border-zinc-700 shadow-sm">
          <div className="flex items-center gap-3 mb-2 text-blue-600">
            <Zap className="w-6 h-6" />
            <h3 className="font-bold text-lg">Active Volume</h3>
          </div>
          <p className="text-4xl font-bold text-gray-900 dark:text-white">1,240 <span className="text-sm font-normal text-gray-500">kWh</span></p>
          <p className="text-sm mt-2 text-gray-500">42 active traders</p>
        </div>
      </div>

      {/* Listings Grid */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Live Offers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((item) => (
            <div key={item.id} className="group bg-white dark:bg-zinc-800 rounded-2xl border border-gray-200 dark:border-zinc-700 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className={`h-2 w-full ${item.type === 'Solar' ? 'bg-yellow-400' : item.type === 'Wind' ? 'bg-blue-400' : 'bg-green-400'}`}></div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${item.type === 'Solar' ? 'bg-yellow-100 text-yellow-600' : item.type === 'Wind' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                      {item.type === 'Solar' ? <Zap size={20} /> : item.type === 'Wind' ? <TrendingUp size={20} /> : <Battery size={20} />}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">{item.type} Energy</p>
                      <p className="text-xs text-gray-500">Seller: {item.seller}</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-gray-100 dark:bg-zinc-700 text-xs rounded-md font-medium">
                    #{item.id}
                  </span>
                </div>

                <div className="flex justify-between items-end mb-6">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Amount</p>
                    <p className="text-2xl font-bold">{item.amount} <span className="text-sm font-normal text-gray-500">kWh</span></p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 mb-1">Price</p>
                    <p className="text-2xl font-bold text-indigo-600">{item.price} <span className="text-sm font-normal text-gray-500">ENG</span></p>
                  </div>
                </div>

                <button className="w-full py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold hover:opacity-90 transition-opacity flex justify-center items-center gap-2 group-hover:bg-indigo-600 group-hover:text-white dark:group-hover:bg-indigo-600 dark:group-hover:text-white">
                  Buy Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
