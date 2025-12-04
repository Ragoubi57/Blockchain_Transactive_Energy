"use client";
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Marketplace from '../components/Marketplace';
import Dashboard from '../components/Dashboard';
import Wallet from '../components/Wallet';

export default function Home() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [view, setView] = useState<'marketplace' | 'dashboard' | 'wallet'>('dashboard');

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setWalletAddress(address);
      } catch (error) {
        console.error("User rejected request", error);
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-gray-50 dark:bg-black">
      {/* Header */}
      <div className="z-10 w-full max-w-7xl items-center justify-between font-mono text-sm lg:flex mb-12">
        <p className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-green-500">
          Transactive Energy Platform
        </p>
        <div className="flex items-center gap-4">
          {walletAddress ? (
            <div className="flex items-center gap-2 bg-white dark:bg-zinc-800 px-4 py-2 rounded-full border border-gray-200 dark:border-neutral-700">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <p className="font-mono">{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</p>
            </div>
          ) : (
            <button 
              onClick={connectWallet}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full transition-all shadow-lg hover:shadow-blue-500/20"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-7xl">
        {!walletAddress ? (
          <div className="text-center py-20">
            <h1 className="text-4xl font-bold mb-4">Welcome to the Future of Energy Trading</h1>
            <p className="text-xl text-gray-500 mb-8">Connect your wallet to start trading renewable energy peer-to-peer.</p>
            <button 
              onClick={connectWallet}
              className="bg-green-500 hover:bg-green-600 text-white text-lg font-bold py-3 px-8 rounded-lg"
            >
              Get Started
            </button>
          </div>
        ) : (
          <>
            {/* Navigation Tabs */}
            <div className="flex gap-2 mb-8 p-1 bg-gray-100 dark:bg-zinc-900 rounded-xl w-fit">
              <button 
                onClick={() => setView('dashboard')}
                className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                  view === 'dashboard' 
                    ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                Dashboard
              </button>
              <button 
                onClick={() => setView('marketplace')}
                className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                  view === 'marketplace' 
                    ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                Marketplace
              </button>
              <button 
                onClick={() => setView('wallet')}
                className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                  view === 'wallet' 
                    ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                Wallet
              </button>
            </div>

            {/* View Content */}
            {view === 'marketplace' && <Marketplace walletAddress={walletAddress} />}
            {view === 'dashboard' && <Dashboard />}
            {view === 'wallet' && <Wallet walletAddress={walletAddress} />}
          </>
        )}
      </div>
    </main>
  )
}
