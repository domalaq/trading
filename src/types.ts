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
}
