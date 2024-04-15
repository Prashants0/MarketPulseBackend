import { EMA, RSI } from "technicalindicators";
import { SymbolData, SymbolEmaRsiData } from "../types/symbolData.js";

export const emaRsiStrategy = (
  data: SymbolData[],
  targetPercentage: number,
  stopLossPercentage: number
) => {
  const result: SymbolEmaRsiData[] = [];
  const trendWindow = 10;
  let signal = "wait";
  let positionTaken = false;
  let positionPriceTaken = 0;

  for (let i = 0; i < data.length; i++) {
    let ema1: number[] = [];
    let ema2: number[] = [];
    let ema3: number[] = [];
    let rsi: number[] = [];
    let inDowntrend = false;
    // for (let j = 0; j < trendWindow && i - j >= 0; j++) {
    //   if (data[i - j].close < data[i - j - 1].close) {
    //     // Check for higher highs
    //     inDowntrend = true;
    //     break;
    //   }
    // }

    const closePriceArr = data
      .map((d) => d.close)
      .flat()
      .slice(0, i + 1);
    if (i > 9) {
      ema1 = EMA.calculate({ values: closePriceArr, period: 9 });
    }
    if (i > 55) {
      ema2 = EMA.calculate({ values: closePriceArr, period: 55 });
    }
    if (i > 200) {
      ema3 = EMA.calculate({ values: closePriceArr, period: 200 });
    }
    if (i > 14) {
      rsi = RSI.calculate({ values: closePriceArr, period: 20 });
    }
    const currentposiotnpercentage =
      ((data[i].close - positionPriceTaken) / positionPriceTaken) * 100;

    if (positionTaken && currentposiotnpercentage > targetPercentage) {
      signal = "sell";
      positionPriceTaken = 0;
      positionTaken = false;
    } else if (positionTaken && currentposiotnpercentage < stopLossPercentage) {
      signal = "sell";
      positionPriceTaken = 0;
      positionTaken = false;
    } else if (
      ema1[ema1.length - 1] > ema2[ema2.length - 1] &&
      ema2[ema2.length - 1] > ema3[ema3.length - 1] &&
      rsi[rsi.length - 1] > 55
    ) {
      if (signal === "wait") {
        signal = "buy";
        positionPriceTaken = data[i].close;
        positionTaken = true;
      } else if (signal === "buy") {
        signal = "hold";
      } else if (signal === "sell") {
        signal = "wait";
      }
    } else {
      if (signal === "hold") {
        signal = "sell";
        positionPriceTaken = 0;
        positionTaken = false;
      } else if (signal === "sell") {
        signal = "wait";
      } else if (signal === "buy") {
        signal = "hold";
      }
    }
    console.log(signal);
    result.push({
      time: data[i].time,
      open: data[i].open,
      high: data[i].high,
      low: data[i].low,
      close: data[i].close,
      volume: data[i].volume,
      adjclose: data[i].adjclose,
      ema1: ema1[ema1.length - 1],
      ema2: ema2[ema2.length - 1],
      ema3: ema3[ema3.length - 1],
      rsi: rsi[rsi.length - 1],
      signal: signal,
    });
  }

  return result;
};
