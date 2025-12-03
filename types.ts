export interface Coin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  price_change_percentage_24h: number;
  high_24h: number;
  low_24h: number;
}

export interface PortfolioItem {
  id: string;
  coinId: string;
  symbol: string;
  name: string;
  image: string;
  amount: number;
  avgBuyPrice: number;
}

export interface Transaction {
  id: string;
  type: 'BUY' | 'SELL';
  coinId: string;
  symbol: string;
  amount: number;
  priceAtTransaction: number;
  totalValue: number;
  date: string;
}

export interface Order {
  id: string;
  type: 'BUY' | 'SELL';
  coinId: string;
  symbol: string;
  name: string;
  image: string;
  amountInr: number;
  limitPrice: number;
  quantity: number;
  status: 'OPEN' | 'FILLED' | 'CANCELLED';
  createdAt: number;
}