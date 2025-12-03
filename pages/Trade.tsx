import React, { useEffect, useState } from 'react';
import { fetchMarketData } from '../services/cryptoService';
import { addToPortfolio, sellFromPortfolio, addOrder, getOrders, cancelOrder, processOrders } from '../services/storageService';
import { Coin, Order } from '../types';
import { ArrowDownUp, Info, Wallet, AlertCircle, Clock, XCircle, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PriceChart from '../components/PriceChart';

const Trade: React.FC = () => {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [selectedCoinId, setSelectedCoinId] = useState<string>('bitcoin');
  
  // Form State
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [amountInr, setAmountInr] = useState<string>('');
  const [limitPriceInr, setLimitPriceInr] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');
  
  // App State
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [openOrders, setOpenOrders] = useState<Order[]>([]);
  
  const navigate = useNavigate();

  const selectedCoin = coins.find(c => c.id === selectedCoinId);

  // Load Data & Orders
  useEffect(() => {
    const load = async () => {
      const data = await fetchMarketData();
      setCoins(data);
      
      // Check if any existing limit orders should be filled now
      const filled = processOrders(data);
      if (filled.length > 0) {
        setSuccessMsg(`${filled.length} Limit Order(s) Executed!`);
      }
      
      setOpenOrders(getOrders());
      setLoading(false);
    };
    load();
  }, []);

  // Set default limit price when coin changes
  useEffect(() => {
    if (selectedCoin && orderType === 'limit') {
      setLimitPriceInr(selectedCoin.current_price.toString());
    }
  }, [selectedCoinId, orderType]);

  // Calculations
  const effectivePrice = orderType === 'limit' && limitPriceInr 
    ? parseFloat(limitPriceInr) 
    : selectedCoin?.current_price || 0;

  const estimatedCrypto = effectivePrice > 0 && amountInr && !isNaN(parseFloat(amountInr)) 
    ? parseFloat(amountInr) / effectivePrice 
    : 0;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmountInr(value);
      setError(null);
    }
  };

  const handleLimitPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setLimitPriceInr(value);
    }
  };

  const handleTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCoin) return;

    setError(null);
    setSuccessMsg(null);
    const amount = parseFloat(amountInr);
    const limitPrice = parseFloat(limitPriceInr);

    // Validation
    if (!amountInr || isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount.');
      return;
    }

    if (orderType === 'limit') {
      if (!limitPriceInr || isNaN(limitPrice) || limitPrice <= 0) {
         setError('Please enter a valid limit price.');
         return;
      }
    }

    // Bounds check
    if (amount < 100) {
      setError('Minimum trade amount is ₹100.');
      return;
    }
    if (amount > 10000000) {
      setError('Maximum trade amount is ₹1,00,00,000.');
      return;
    }

    setProcessing(true);

    setTimeout(() => {
      const quantity = amount / effectivePrice;

      if (orderType === 'market') {
        // --- Market Order Logic ---
        if (activeTab === 'buy') {
          addToPortfolio({
            id: crypto.randomUUID(),
            coinId: selectedCoin.id,
            name: selectedCoin.name,
            symbol: selectedCoin.symbol,
            image: selectedCoin.image,
            amount: quantity,
            avgBuyPrice: selectedCoin.current_price
          });
          navigate('/portfolio');
        } else {
          const success = sellFromPortfolio(selectedCoin.id, quantity);
          if (success) {
             navigate('/portfolio');
          } else {
             setError(`Insufficient holdings to sell this amount.`);
          }
        }
      } else {
        // --- Limit Order Logic ---
        if (activeTab === 'sell') {
          // Lock assets for sell order immediately
          const success = sellFromPortfolio(selectedCoin.id, quantity);
          if (!success) {
            setError('Insufficient holdings to place this sell order.');
            setProcessing(false);
            return;
          }
        }

        // Create Order
        const newOrder: Order = {
          id: crypto.randomUUID(),
          type: activeTab === 'buy' ? 'BUY' : 'SELL',
          coinId: selectedCoin.id,
          symbol: selectedCoin.symbol,
          name: selectedCoin.name,
          image: selectedCoin.image,
          amountInr: amount,
          limitPrice: limitPrice,
          quantity: quantity,
          status: 'OPEN',
          createdAt: Date.now()
        };

        addOrder(newOrder);
        setOpenOrders(getOrders());
        setSuccessMsg(`Limit ${activeTab.toUpperCase()} Order Placed at ₹${limitPrice.toLocaleString()}`);
        setAmountInr(''); // Reset form
      }

      setProcessing(false);
    }, 1000);
  };

  const handleCancelOrder = (id: string) => {
    cancelOrder(id);
    setOpenOrders(getOrders());
  };

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading market data...</div>;

  return (
    <div className="min-h-screen bg-slate-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        <h1 className="text-3xl font-bold text-white mb-8 hidden lg:block">Trade Cryptocurrency</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Chart & Open Orders */}
          <div className="lg:col-span-2 space-y-8">
            <div className="min-h-[500px]">
              <PriceChart coin={selectedCoin} />
            </div>

            {/* Open Orders Section */}
            {openOrders.length > 0 && (
              <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                  <h3 className="text-lg font-bold text-white flex items-center">
                    <Clock className="mr-2 h-5 w-5 text-blue-500" /> Open Orders
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-800">
                    <thead className="bg-slate-900/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pair</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Limit Price</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {openOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-slate-800/50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <img className="h-6 w-6 rounded-full mr-3" src={order.image} alt="" />
                              <span className="text-sm font-medium text-white">{order.symbol.toUpperCase()}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-md text-xs font-bold ${order.type === 'BUY' ? 'bg-blue-900/30 text-blue-400' : 'bg-red-900/30 text-red-400'}`}>
                              {order.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-white font-mono">
                            ₹{order.limitPrice.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-400">
                            {order.quantity.toFixed(6)} {order.symbol.toUpperCase()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                            <button 
                              onClick={() => handleCancelOrder(order.id)}
                              className="text-red-400 hover:text-red-300 font-medium text-xs border border-red-900/50 bg-red-900/20 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              Cancel
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Trade Form */}
          <div className="lg:col-span-1">
            <div className="bg-slate-900 p-6 md:p-8 rounded-2xl border border-slate-800 shadow-xl sticky top-24">
              
              <div className="text-center mb-4">
                <h2 className="text-2xl font-bold text-white">
                  {activeTab === 'buy' ? 'Buy Asset' : 'Sell Asset'}
                </h2>
              </div>

              {/* Order Type Toggle */}
              <div className="flex justify-center mb-6 border-b border-slate-800 pb-4">
                <div className="flex space-x-6">
                  <button
                    onClick={() => { setOrderType('market'); setError(null); }}
                    className={`text-sm font-medium pb-1 border-b-2 transition-colors ${
                      orderType === 'market' 
                        ? 'border-blue-500 text-white' 
                        : 'border-transparent text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    Market Order
                  </button>
                  <button
                    onClick={() => { setOrderType('limit'); setError(null); }}
                    className={`text-sm font-medium pb-1 border-b-2 transition-colors ${
                      orderType === 'limit' 
                        ? 'border-blue-500 text-white' 
                        : 'border-transparent text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    Limit Order
                  </button>
                </div>
              </div>

              {/* Buy/Sell Tab Toggle */}
              <div className="bg-slate-950 p-1 rounded-xl flex mb-6">
                <button
                  onClick={() => { setActiveTab('buy'); setError(null); setSuccessMsg(null); }}
                  className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${
                    activeTab === 'buy' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  BUY
                </button>
                <button
                  onClick={() => { setActiveTab('sell'); setError(null); setSuccessMsg(null); }}
                  className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${
                    activeTab === 'sell' ? 'bg-red-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  SELL
                </button>
              </div>

              <form className="space-y-5" onSubmit={handleTransaction}>
                
                {/* Coin Selection */}
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Select Asset</label>
                  <div className="relative">
                    <select
                      value={selectedCoinId}
                      onChange={(e) => setSelectedCoinId(e.target.value)}
                      className="block w-full pl-12 pr-10 py-3.5 text-base border-slate-700 bg-slate-800 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-xl appearance-none"
                    >
                      {coins.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.symbol.toUpperCase()})
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      {selectedCoin && <img src={selectedCoin.image} alt="" className="h-6 w-6 rounded-full" />}
                    </div>
                  </div>
                </div>

                {/* Limit Price Input (Conditional) */}
                {orderType === 'limit' && (
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Limit Price (INR)</label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">₹</span>
                      </div>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={limitPriceInr}
                        onChange={handleLimitPriceChange}
                        className="block w-full pl-8 pr-12 sm:text-sm rounded-xl py-3.5 text-white placeholder-gray-500 bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-500/20"
                        placeholder={selectedCoin?.current_price.toString()}
                      />
                    </div>
                    <p className="text-xs text-right text-gray-500 mt-1">
                      Current: ₹{selectedCoin?.current_price.toLocaleString()}
                    </p>
                  </div>
                )}

                {/* Amount Input */}
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Amount (INR)</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">₹</span>
                    </div>
                    <input
                      type="text"
                      inputMode="decimal"
                      required
                      value={amountInr}
                      onChange={handleAmountChange}
                      className={`block w-full pl-8 pr-12 sm:text-sm rounded-xl py-3.5 text-white placeholder-gray-500 bg-slate-800 focus:outline-none focus:ring-2 transition-colors ${
                        error 
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                          : 'border-slate-700 focus:border-blue-500 focus:ring-blue-500/20'
                      } border`}
                      placeholder="0.00"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">INR</span>
                    </div>
                  </div>
                </div>

                {/* Status Messages */}
                {error && (
                  <div className="flex items-center text-sm text-red-400 bg-red-900/20 p-3 rounded-lg animate-fadeIn">
                    <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                    {error}
                  </div>
                )}
                
                {successMsg && (
                   <div className="flex items-center text-sm text-emerald-400 bg-emerald-900/20 p-3 rounded-lg animate-fadeIn">
                    <CheckCircle2 className="h-4 w-4 mr-2 flex-shrink-0" />
                    {successMsg}
                  </div>
                )}

                {/* Conversion Display */}
                <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center text-gray-400">
                    <Wallet className="h-5 w-5 mr-2" />
                    <span className="text-xs uppercase tracking-wide">Est. Receive</span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-white">
                      {estimatedCrypto.toFixed(8)}
                    </div>
                    <div className="text-xs text-gray-500 uppercase">
                      {selectedCoin?.symbol}
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={processing || !!error || !amountInr}
                  className={`group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-bold rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all ${
                    processing || !!error || !amountInr
                      ? 'bg-slate-700 cursor-not-allowed text-gray-400' 
                      : activeTab === 'buy' ? 'bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-600/20 hover:shadow-blue-600/40' : 'bg-red-600 hover:bg-red-700 shadow-xl shadow-red-600/20 hover:shadow-red-600/40'
                  }`}
                >
                  {processing ? (
                    <span className="flex items-center">
                      <ArrowDownUp className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                      Processing...
                    </span>
                  ) : (
                    orderType === 'market' 
                      ? `${activeTab === 'buy' ? 'BUY' : 'SELL'} ${selectedCoin?.symbol.toUpperCase()}`
                      : `PLACE LIMIT ${activeTab.toUpperCase()}`
                  )}
                </button>

                <div className="flex items-start">
                  <Info className="h-4 w-4 text-gray-500 mt-0.5 mr-2 flex-shrink-0" />
                  <p className="text-xs text-gray-500 leading-tight">
                    {orderType === 'market' 
                      ? 'Market orders execute immediately at the best available price.' 
                      : 'Limit orders execute only when the market price reaches your set limit price.'}
                  </p>
               </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trade;