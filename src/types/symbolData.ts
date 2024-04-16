export type SymbolData = {
  time: number;
  high: number;
  volume: number;
  open: number;
  low: number;
  close: number;
  adjclose: number;
};

export type SymbolEmaRsiData = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adjclose: number;
  ema1: number;
  ema2: number;
  ema3: number;
  rsi: number;
  signal: string;
};

export type SymbolEmaVwapData = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adjclose: number;
  ema1: number;
  vwap: number;
  signal: string;
};
