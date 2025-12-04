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
    if (!amount || !price) return;
    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESSES.P2PTrading, P2PTradingArtifact.abi, signer);
      
      const tx = await contract.listEnergy(amount, ethers.parseEther(price));
      await tx.wait();
      alert("Energy listed successfully!");
      fetchListings();
    } catch (error) {
      console.error("Error listing energy:", error);
      alert("Failed to list energy");
    }
    setLoading(false);
  };

  const buyEnergy = async (id: number, price: string, amount: string) => {
    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      // 1. Approve Token Spend
      const tokenContract = new ethers.Contract(CONTRACT_ADDRESSES.EnergyToken, EnergyTokenArtifact.abi, signer);
      const totalPrice = ethers.parseEther(price) * BigInt(amount);
      const approveTx = await tokenContract.approve(CONTRACT_ADDRESSES.P2PTrading, totalPrice);
      await approveTx.wait();

      // 2. Buy Energy
      const tradingContract = new ethers.Contract(CONTRACT_ADDRESSES.P2PTrading, P2PTradingArtifact.abi, signer);
      const tx = await tradingContract.buyEnergy(id, amount);
      await tx.wait();
      
      alert("Energy bought successfully!");
      fetchListings();
    } catch (error) {
      console.error("Error buying energy:", error);
      alert("Failed to buy energy");
    }
    setLoading(false);
  };

  return (
    <div className="p-6 bg-white dark:bg-zinc-800/30 rounded-xl border border-gray-200 dark:border-neutral-700">
      <h2 className="text-2xl font-bold mb-4">P2P Energy Marketplace</h2>
      
      {/* List Energy Form */}
      <div className="mb-8 p-4 bg-gray-50 dark:bg-zinc-900/50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Sell Energy</h3>
        <div className="flex gap-4">
          <input
            type="number"
            placeholder="Amount (kWh)"
            className="p-2 rounded border dark:bg-zinc-800 dark:border-neutral-600"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <input
            type="number"
            placeholder="Price per kWh (ENG)"
            className="p-2 rounded border dark:bg-zinc-800 dark:border-neutral-600"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
          <button
            onClick={listEnergy}
            disabled={loading}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'List Energy'}
          </button>
        </div>
      </div>

      {/* Listings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {listings.map((listing) => (
          <div key={listing.id} className="p-4 border rounded-lg dark:border-neutral-600">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-500">Seller</span>
              <span className="text-sm font-mono">{listing.seller.slice(0,6)}...</span>
            </div>
            <div className="text-2xl font-bold mb-1">{listing.amount} kWh</div>
            <div className="text-lg text-green-500 mb-4">{listing.price} ENG/kWh</div>
            <button
              onClick={() => buyEnergy(listing.id, listing.price, listing.amount)}
              disabled={loading || listing.seller.toLowerCase() === walletAddress?.toLowerCase()}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded disabled:opacity-50 disabled:bg-gray-400"
            >
              Buy Now
            </button>
          </div>
        ))}
        {listings.length === 0 && (
          <p className="text-gray-500 col-span-full text-center py-8">No active listings found.</p>
        )}
      </div>
    </div>
  );
}
