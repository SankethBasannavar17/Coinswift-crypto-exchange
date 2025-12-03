import React, { useEffect, useState } from 'react';
import { getPortfolio } from '../services/storageService';
import { fetchMarketData } from '../services/cryptoService';
import { PortfolioItem, Coin } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { Wallet, TrendingUp, TrendingDown, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Portfolio: React.FC = () => {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [currentPrices, setCurrentPrices] = useState<Record<string, number>>({});
  const [totalValue, setTotalValue] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const savedPortfolio = getPortfolio();
      const marketData = await fetchMarketData();
      
      const priceMap: Record<string, number> = {};
      marketData.forEach(c => {
        priceMap[c.id] = c.current_price;
      });

      let calculatedValue = 0;
      let calculatedCost = 0;

      savedPortfolio.forEach(item => {
        const price = priceMap[item.coinId] || item.avgBuyPrice; // Fallback to buy price if live missing
        calculatedValue += item.amount * price;
        calculatedCost += item.amount * item.avgBuyPrice;
      });

      setPortfolio(savedPortfolio);
      setCurrentPrices(priceMap);
      setTotalValue(calculatedValue);
      setTotalProfit(calculatedValue - calculatedCost);
      setLoading(false);
    };
    load();
  }, []);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const chartData = portfolio.map(item => ({
    name: item.symbol.toUpperCase(),
    value: item.amount * (currentPrices[item.coinId] || item.avgBuyPrice)
  }));

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading portfolio...</div>;

  return (
    <div className="min-h-screen bg-slate-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">My Portfolio</h1>
            <p className="text-gray-400">Track your crypto assets and performance</p>
          </div>
          <Link to="/trade" className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium">
            <PlusCircle className="mr-2 h-5 w-5" /> Buy New Asset
          </Link>
        </div>

        {portfolio.length === 0 ? (
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-12 text-center">
            <div className="mx-auto h-24 w-24 bg-slate-800 rounded-full flex items-center justify-center mb-6">
              <Wallet className="h-12 w-12 text-gray-600" />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">Your portfolio is empty</h3>
            <p className="text-gray-400 mb-6">Start trading to build your crypto portfolio today.</p>
            <Link to="/trade" className="text-blue-400 hover:text-blue-300 font-medium">Go to Market &rarr;</Link>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg">
                <h3 className="text-gray-400 text-sm font-medium mb-1">Total Balance</h3>
                <div className="text-3xl font-bold text-white">₹{totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
              </div>
              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg">
                <h3 className="text-gray-400 text-sm font-medium mb-1">Total Profit/Loss</h3>
                <div className={`text-3xl font-bold flex items-center ${totalProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {totalProfit >= 0 ? '+' : ''}₹{totalProfit.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  {totalProfit >= 0 ? <TrendingUp className="ml-2 h-6 w-6" /> : <TrendingDown className="ml-2 h-6 w-6" />}
                </div>
              </div>
              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg">
                <h3 className="text-gray-400 text-sm font-medium mb-1">Asset Count</h3>
                <div className="text-3xl font-bold text-white">{portfolio.length}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Assets Table */}
              <div className="lg:col-span-2 bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-lg">
                <div className="p-6 border-b border-slate-800">
                  <h3 className="text-lg font-bold text-white">Your Holdings</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-800">
                    <thead className="bg-slate-900">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Current Price</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Returns</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {portfolio.map((item) => {
                        const currentPrice = currentPrices[item.coinId] || item.avgBuyPrice;
                        const currentValue = item.amount * currentPrice;
                        const investmentCost = item.amount * item.avgBuyPrice;
                        const profit = currentValue - investmentCost;
                        const profitPercent = (profit / investmentCost) * 100;

                        return (
                          <tr key={item.coinId} className="hover:bg-slate-800/50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-8 w-8 flex-shrink-0">
                                  <img className="h-8 w-8 rounded-full" src={item.image} alt="" />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-white">{item.name}</div>
                                  <div className="text-xs text-gray-500 uppercase">{item.symbol}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-300">
                              {item.amount.toFixed(4)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-300">
                              ₹{currentPrice.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-white">
                              ₹{currentValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                            </td>
                            <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-medium ${profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {profit >= 0 ? '+' : ''}{profitPercent.toFixed(2)}%
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pie Chart */}
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-lg flex flex-col items-center justify-center">
                <h3 className="text-lg font-bold text-white mb-4 w-full text-left">Allocation</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        formatter={(value: number) => `₹${value.toLocaleString()}`}
                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Legend 
                        layout="horizontal" 
                        verticalAlign="bottom" 
                        align="center"
                        wrapperStyle={{ paddingTop: '20px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Portfolio;