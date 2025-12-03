import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Zap, Percent, ChevronRight } from 'lucide-react';
import { fetchMarketData } from '../services/cryptoService';
import { Coin } from '../types';
import CoinTicker from '../components/CoinTicker';

const Home: React.FC = () => {
  const [coins, setCoins] = useState<Coin[]>([]);

  useEffect(() => {
    const loadCoins = async () => {
      const data = await fetchMarketData();
      setCoins(data);
    };
    loadCoins();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Ticker */}
      <CoinTicker coins={coins} />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-slate-900 to-slate-950 py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Abstract Background Element */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl"></div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-6">
            Buy & Sell Crypto <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
              Instantly & Securely
            </span>
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-400 mb-10">
            Join the world's fastest-growing crypto exchange. Trade Bitcoin, Ethereum, and 100+ other cryptocurrencies with INR in seconds.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup" className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/30 transition-all">
              Start Trading Now
            </Link>
            <Link to="/market" className="inline-flex items-center justify-center px-8 py-4 border border-slate-700 text-lg font-medium rounded-xl text-gray-300 bg-slate-800 hover:bg-slate-700 transition-all">
              View Markets
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Why Choose CoinSwift?</h2>
            <p className="text-gray-400">Experience the best in class trading platform built for everyone.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 bg-slate-900 rounded-2xl border border-slate-800 hover:border-blue-500/50 transition-colors">
              <div className="w-14 h-14 bg-blue-900/30 rounded-lg flex items-center justify-center mb-6">
                <ShieldCheck className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Bank-Grade Security</h3>
              <p className="text-gray-400 leading-relaxed">
                Your assets are protected with industry-leading encryption and cold storage protocols. We take security seriously.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 bg-slate-900 rounded-2xl border border-slate-800 hover:border-emerald-500/50 transition-colors">
              <div className="w-14 h-14 bg-emerald-900/30 rounded-lg flex items-center justify-center mb-6">
                <Percent className="h-8 w-8 text-emerald-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Lowest Fees</h3>
              <p className="text-gray-400 leading-relaxed">
                Maximize your profits with our ultra-low trading fees. No hidden charges, transparent pricing structure.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 bg-slate-900 rounded-2xl border border-slate-800 hover:border-purple-500/50 transition-colors">
              <div className="w-14 h-14 bg-purple-900/30 rounded-lg flex items-center justify-center mb-6">
                <Zap className="h-8 w-8 text-purple-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Instant Buy & Sell</h3>
              <p className="text-gray-400 leading-relaxed">
                Execute trades in milliseconds. Our high-frequency matching engine ensures you never miss a market move.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-900/20 to-slate-900 py-16 border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to start your crypto journey?</h2>
          <Link to="/trade" className="inline-flex items-center text-blue-400 hover:text-blue-300 font-semibold text-lg">
            Create your portfolio today <ChevronRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;