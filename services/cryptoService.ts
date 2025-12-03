import { Coin } from '../types';

// Fallback data in case CoinGecko API rate limits or fails
const FALLBACK_COINS: Coin[] = [
  { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png', current_price: 5600000, market_cap: 110000000000000, market_cap_rank: 1, price_change_percentage_24h: 2.5, high_24h: 5700000, low_24h: 5500000 },
  { id: 'ethereum', symbol: 'eth', name: 'Ethereum', image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png', current_price: 320000, market_cap: 38000000000000, market_cap_rank: 2, price_change_percentage_24h: -1.2, high_24h: 325000, low_24h: 315000 },
  { id: 'ripple', symbol: 'xrp', name: 'XRP', image: 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png', current_price: 52, market_cap: 2800000000000, market_cap_rank: 6, price_change_percentage_24h: 5.4, high_24h: 54, low_24h: 50 },
  { id: 'solana', symbol: 'sol', name: 'Solana', image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png', current_price: 12500, market_cap: 5600000000000, market_cap_rank: 5, price_change_percentage_24h: 8.1, high_24h: 12800, low_24h: 11500 },
  { id: 'dogecoin', symbol: 'doge', name: 'Dogecoin', image: 'https://assets.coingecko.com/coins/images/5/large/dogecoin.png', current_price: 14, market_cap: 2000000000000, market_cap_rank: 9, price_change_percentage_24h: -0.5, high_24h: 14.5, low_24h: 13.8 },
  { id: 'tether', symbol: 'usdt', name: 'Tether', image: 'https://assets.coingecko.com/coins/images/325/large/Tether.png', current_price: 83.5, market_cap: 9000000000000, market_cap_rank: 3, price_change_percentage_24h: 0.1, high_24h: 83.6, low_24h: 83.4 },
  { id: 'binancecoin', symbol: 'bnb', name: 'BNB', image: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png', current_price: 48000, market_cap: 7500000000000, market_cap_rank: 4, price_change_percentage_24h: 1.1, high_24h: 48500, low_24h: 47800 },
  { id: 'cardano', symbol: 'ada', name: 'Cardano', image: 'https://assets.coingecko.com/coins/images/975/large/cardano.png', current_price: 45, market_cap: 1600000000000, market_cap_rank: 10, price_change_percentage_24h: -2.3, high_24h: 46.5, low_24h: 44.8 },
];

export const fetchMarketData = async (): Promise<Coin[]> => {
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=inr&order=market_cap_desc&per_page=50&page=1&sparkline=false'
    );
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.warn("Using fallback data due to API error:", error);
    return FALLBACK_COINS;
  }
};

export interface ChartDataPoint {
  timestamp: number;
  price: number;
}

export const fetchCoinHistory = async (coinId: string, days: string): Promise<ChartDataPoint[]> => {
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=inr&days=${days}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch history');
    }
    
    const data = await response.json();
    return data.prices.map((item: [number, number]) => ({
      timestamp: item[0],
      price: item[1]
    }));
  } catch (error) {
    console.warn("Using fallback chart data due to API error:", error);
    
    // Generate realistic looking dummy data based on time
    const now = Date.now();
    const dataPoints = days === '1' ? 24 : days === '7' ? 7 : 30;
    const interval = days === '1' ? 3600 * 1000 : 24 * 3600 * 1000;
    
    let currentPrice = 50000 + Math.random() * 5000; // Base price
    
    return Array.from({ length: dataPoints }).map((_, i) => {
      // Random walk
      const change = (Math.random() - 0.5) * (currentPrice * 0.05);
      currentPrice += change;
      
      return {
        timestamp: now - ((dataPoints - 1 - i) * interval),
        price: Math.max(0, currentPrice)
      };
    });
  }
};