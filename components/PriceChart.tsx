import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchCoinHistory, ChartDataPoint } from '../services/cryptoService';
import { Coin } from '../types';
import { TrendingUp, TrendingDown, Clock } from 'lucide-react';

interface PriceChartProps {
  coin: Coin | undefined;
}

const PriceChart: React.FC<PriceChartProps> = ({ coin }) => {
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [timeframe, setTimeframe] = useState<string>('1'); // 1, 7, 30, 365
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!coin?.id) return;

    const loadHistory = async () => {
      setLoading(true);
      const history = await fetchCoinHistory(coin.id, timeframe);
      setData(history);
      setLoading(false);
    };

    loadHistory();
  }, [coin?.id, timeframe]);

  if (!coin) return null;

  const isPositive = coin.price_change_percentage_24h >= 0;
  const color = isPositive ? '#10b981' : '#ef4444'; // Emerald or Red

  const formatXAxis = (tickItem: number) => {
    const date = new Date(tickItem);
    if (timeframe === '1') {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-700 p-3 rounded-lg shadow-xl">
          <p className="text-gray-400 text-xs mb-1">
            {new Date(label).toLocaleString()}
          </p>
          <p className="text-white font-bold">
            ₹{payload[0].value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex items-center gap-4">
          <img src={coin.image} alt={coin.name} className="w-12 h-12 rounded-full" />
          <div>
            <div className="flex items-baseline gap-2">
              <h2 className="text-2xl font-bold text-white">{coin.name}</h2>
              <span className="text-gray-500 font-medium uppercase">{coin.symbol}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-mono text-white">₹{coin.current_price.toLocaleString()}</span>
              <span className={`flex items-center text-sm font-medium px-2 py-0.5 rounded ${isPositive ? 'bg-emerald-900/30 text-emerald-400' : 'bg-red-900/30 text-red-400'}`}>
                {isPositive ? <TrendingUp size={14} className="mr-1"/> : <TrendingDown size={14} className="mr-1"/>}
                {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
              </span>
            </div>
          </div>
        </div>

        {/* Timeframe Selectors */}
        <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
          {[
            { label: '24H', value: '1' },
            { label: '7D', value: '7' },
            { label: '1M', value: '30' },
            { label: '1Y', value: '365' },
          ].map((tf) => (
            <button
              key={tf.value}
              onClick={() => setTimeframe(tf.value)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                timeframe === tf.value
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Area */}
      <div className="flex-grow w-full min-h-[300px] relative">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis 
              dataKey="timestamp" 
              tickFormatter={formatXAxis} 
              stroke="#64748b" 
              fontSize={12}
              tickMargin={10}
              minTickGap={30}
            />
            <YAxis 
              domain={['auto', 'auto']} 
              stroke="#64748b" 
              fontSize={12}
              tickFormatter={(val) => `₹${val.toLocaleString(undefined, { notation: "compact" })}`}
              width={60}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="price" 
              stroke={color} 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorPrice)" 
              animationDuration={1000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 flex items-center justify-between text-xs text-gray-500 border-t border-slate-800 pt-4">
        <div className="flex items-center">
            <Clock className="h-3 w-3 mr-1" /> Updated Just Now
        </div>
        <div>
            High: ₹{coin.high_24h.toLocaleString()} • Low: ₹{coin.low_24h.toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export default PriceChart;