export interface Kline {
  symbol: string;
  close: number;
  trades: number;
  baseVolume: number;
  quoteVolume: number;
  volume24h: number;
  upperBand: number;
  lowerBand: number;
  time: number;
  change: number;
  high: number;
  low: number;
  high24h: number;
  low24h: number;
  atr: number;
  atrChange: number;
  priceChange: number;
  widthChange: number;
  volumeChange: number;
  vwap: number;
  rsi: number;
  emaFlip: boolean;
  vwapFlip: boolean;
}

export interface Pair {
  quote: string;
  trade_status: "tradable" | "untradable";
  id: string;
  precision: number;
  amount_precision: number;
}

export interface Ticker {
  quote_volume: string;
  currency_pair: string;
}

export interface Trade {
  side: string;
  price: string;
  precision: number;
}
