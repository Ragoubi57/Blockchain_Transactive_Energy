"use client";
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES } from '../config';
import EnergyTokenArtifact from '../contracts/EnergyToken.json';

export default function Wallet({ walletAddress }: { walletAddress: string }) {
  const [balance, setBalance] = useState('0');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (walletAddress) {
      fetchBalance();
    }
  }, [walletAddress]);

  const fetchBalance = async () => {
    if (!window.ethereum) return;
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(CONTRACT_ADDRESSES.EnergyToken, EnergyTokenArtifact.abi, provider);
    try {
      const bal = await contract.balanceOf(walletAddress);
      setBalance(ethers.formatEther(bal));
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="p-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl text-white shadow-xl">
        <p className="text-blue-100 mb-2">Total Balance</p>
        <h2 className="text-5xl font-bold mb-6">{parseFloat(balance).toFixed(2)} ENG</h2>
        <div className="flex gap-4">
          <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-6 py-2 rounded-lg transition-colors">
            Send
          </button>
          <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-6 py-2 rounded-lg transition-colors">
            Receive
          </button>
        </div>
      </div>

      <div className="p-6 bg-white dark:bg-zinc-800/50 rounded-xl border border-gray-200 dark:border-neutral-700">
        <h3 className="text-xl font-bold mb-4">Wallet Details</h3>
        <div className="space-y-4">
          <div className="flex justify-between py-3 border-b border-gray-100 dark:border-neutral-700">
            <span className="text-gray-500">Address</span>
            <span className="font-mono text-sm">{walletAddress}</span>
          </div>
          <div className="flex justify-between py-3 border-b border-gray-100 dark:border-neutral-700">
            <span className="text-gray-500">Network</span>
            <span className="font-medium">Localhost</span>
          </div>
          <div className="flex justify-between py-3 border-b border-gray-100 dark:border-neutral-700">
            <span className="text-gray-500">Status</span>
            <span className="text-green-500 font-medium">Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
