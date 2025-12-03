import React from 'react';
import { Coin } from '../types';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface CoinTickerProps {
  coins: Coin[];
}

const CoinTicker: React.FC<CoinTickerProps> = ({ coins }) => {
  // Duplicate list to create seamless infinite scroll effect
  const tickerItems = [...coins.slice(0, 10), ...coins.slice(0, 10)];

  return (
    <div className="w-full bg-slate-900 border-y border-slate-800 overflow-hidden h-12 flex items-center relative">
      <div className="animate-ticker flex whitespace-nowrap">
        {tickerItems.map((coin, index) => (
          <div key={`${coin.id}-${index}`} className="flex items-center px-6 border-r border-slate-800/50">
            <span className="font-semibold text-gray-300 mr-2 uppercase">{coin.symbol}</span>
            <span className="text-white mr-2">₹{coin.current_price.toLocaleString()}</span>
            <span className={`flex items-center text-xs ${coin.price_change_percentage_24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {coin.price_change_percentage_24h >= 0 ? <TrendingUp size={12} className="mr-1"/> : <TrendingDown size={12} className="mr-1"/>}
              {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
      {/* CSS for animation injected inline for simplicity within the component module scope */}
      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-ticker {
          display: flex;
          animation: ticker 30s linear infinite;
        }
        .animate-ticker:hover {
            animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

export default CoinTicker;