import { PortfolioItem, Order, Coin } from '../types';

const PORTFOLIO_KEY = 'coinswift_portfolio';
const ORDERS_KEY = 'coinswift_orders';

export const getPortfolio = (): PortfolioItem[] => {
  const data = localStorage.getItem(PORTFOLIO_KEY);
  return data ? JSON.parse(data) : [];
};

export const savePortfolio = (portfolio: PortfolioItem[]) => {
  localStorage.setItem(PORTFOLIO_KEY, JSON.stringify(portfolio));
};

export const addToPortfolio = (newItem: PortfolioItem) => {
  const current = getPortfolio();
  const existingIndex = current.findIndex(item => item.coinId === newItem.coinId);

  if (existingIndex >= 0) {
    // Average down calculation
    const existing = current[existingIndex];
    const totalCost = (existing.amount * existing.avgBuyPrice) + (newItem.amount * newItem.avgBuyPrice);
    const totalAmount = existing.amount + newItem.amount;
    
    current[existingIndex] = {
      ...existing,
      amount: totalAmount,
      avgBuyPrice: totalCost / totalAmount
    };
  } else {
    current.push(newItem);
  }

  savePortfolio(current);
};

export const sellFromPortfolio = (coinId: string, amount: number): boolean => {
  let current = getPortfolio();
  const index = current.findIndex(item => item.coinId === coinId);

  if (index === -1) return false;

  const item = current[index];
  
  // Floating point precision check
  if (item.amount < amount - 0.00000001) return false; // Insufficient funds

  item.amount -= amount;

  if (item.amount <= 0.000001) {
    // Remove if effectively zero
    current = current.filter(i => i.coinId !== coinId);
  } else {
    current[index] = item;
  }

  savePortfolio(current);
  return true;
};

// --- Order Management ---

export const getOrders = (): Order[] => {
  const data = localStorage.getItem(ORDERS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveOrders = (orders: Order[]) => {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
};

export const addOrder = (order: Order) => {
  const orders = getOrders();
  orders.push(order);
  saveOrders(orders);
};

export const cancelOrder = (orderId: string) => {
  const orders = getOrders();
  const orderIndex = orders.findIndex(o => o.id === orderId);
  
  if (orderIndex === -1) return;
  
  const order = orders[orderIndex];
  
  // If it was a sell order, we need to refund the locked assets to the portfolio
  if (order.type === 'SELL' && order.status === 'OPEN') {
    addToPortfolio({
      id: crypto.randomUUID(),
      coinId: order.coinId,
      symbol: order.symbol,
      name: order.name,
      image: order.image,
      amount: order.quantity,
      avgBuyPrice: order.limitPrice // Return at limit price or original? Keeping it simple.
    });
  }

  // Mark as cancelled or remove? Let's remove to keep list clean for this demo
  orders.splice(orderIndex, 1);
  saveOrders(orders);
};

// Check for orders that should be filled based on current prices
export const processOrders = (marketData: Coin[]): Order[] => {
  const orders = getOrders();
  const filledOrders: Order[] = [];
  let hasChanges = false;

  orders.forEach(order => {
    if (order.status !== 'OPEN') return;

    const coin = marketData.find(c => c.id === order.coinId);
    if (!coin) return;

    let shouldExecute = false;

    if (order.type === 'BUY') {
      // Buy Limit: Market Price <= Limit Price
      if (coin.current_price <= order.limitPrice) {
        shouldExecute = true;
      }
    } else {
      // Sell Limit: Market Price >= Limit Price
      if (coin.current_price >= order.limitPrice) {
        shouldExecute = true;
      }
    }

    if (shouldExecute) {
      order.status = 'FILLED';
      filledOrders.push(order);
      hasChanges = true;

      // Execute the trade
      if (order.type === 'BUY') {
        addToPortfolio({
          id: crypto.randomUUID(),
          coinId: order.coinId,
          name: order.name,
          symbol: order.symbol,
          image: order.image,
          amount: order.quantity,
          avgBuyPrice: order.limitPrice // Use the limit price as the buy price
        });
      }
      // For SELL, assets were already deducted/locked when order was placed.
      // We don't need to do anything for portfolio here.
    }
  });

  if (hasChanges) {
    saveOrders(orders.filter(o => o.status === 'OPEN')); // Remove filled from open list
  }

  return filledOrders;
};