import { EMA, RSI, VWAP, } from "technicalindicators";
export const emaRsiStrategy = (data, targetPercentage, stopLossPercentage) => {
    const result = [];
    let signal = "wait";
    let positionTaken = false;
    let positionPriceTaken = 0;
    for (let i = 0; i < data.length; i++) {
        let ema1 = [];
        let ema2 = [];
        let ema3 = [];
        let rsi = [];
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
        const currentposiotnpercentage = ((data[i].close - positionPriceTaken) / positionPriceTaken) * 100;
        if (positionTaken && currentposiotnpercentage > targetPercentage) {
            signal = "sell";
            positionPriceTaken = 0;
            positionTaken = false;
        }
        else if (positionTaken && currentposiotnpercentage < stopLossPercentage) {
            signal = "sell";
            positionPriceTaken = 0;
            positionTaken = false;
        }
        else if (ema1[ema1.length - 1] > ema2[ema2.length - 1] &&
            ema2[ema2.length - 1] > ema3[ema3.length - 1] &&
            rsi[rsi.length - 1] > 55) {
            if (signal === "wait") {
                signal = "buy";
                positionPriceTaken = data[i].close;
                positionTaken = true;
            }
            else if (signal === "buy") {
                signal = "hold";
            }
            else if (signal === "sell") {
                signal = "wait";
            }
        }
        else {
            if (signal === "hold") {
                signal = "sell";
                positionPriceTaken = 0;
                positionTaken = false;
            }
            else if (signal === "sell") {
                signal = "wait";
            }
            else if (signal === "buy") {
                signal = "hold";
            }
        }
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
export const emaVwapStratergy = (data, targetPercentage, stopLossPercentage) => {
    const result = [];
    let signal = "wait";
    let positionTaken = false;
    let positionPriceTaken = 0;
    for (let i = 0; i < data.length; i++) {
        let ema1 = [];
        let vwap = [];
        const closePriceArr = data
            .map((d) => d.close)
            .flat()
            .slice(0, i + 1);
        if (i > 9) {
            ema1 = EMA.calculate({ values: closePriceArr, period: 9 });
        }
        const closeArr = data.map((dataItem) => dataItem.close);
        const highArr = data.map((dataItem) => dataItem.high);
        const lowArr = data.map((dataItem) => dataItem.low);
        const volumeArr = data.map((dataItem) => dataItem.volume);
        vwap = VWAP.calculate({
            close: closeArr,
            high: highArr,
            low: lowArr,
            volume: volumeArr,
        });
        const currentposiotnpercentage = ((data[i].close - positionPriceTaken) / positionPriceTaken) * 100;
        if (positionTaken && currentposiotnpercentage > targetPercentage) {
            signal = "sell";
            positionPriceTaken = 0;
            positionTaken = false;
        }
        else if (positionTaken && currentposiotnpercentage < stopLossPercentage) {
            signal = "sell";
            positionPriceTaken = 0;
            positionTaken = false;
        }
        else if (ema1[ema1.length - 1] > vwap[vwap.length - 1]) {
            if (signal === "wait") {
                signal = "buy";
                positionPriceTaken = data[i].close;
                positionTaken = true;
            }
            else if (signal === "buy") {
                signal = "hold";
            }
            else if (signal === "sell") {
                signal = "wait";
            }
        }
        else {
            if (signal === "hold") {
                signal = "sell";
                positionPriceTaken = 0;
                positionTaken = false;
            }
            else if (signal === "sell") {
                signal = "wait";
            }
            else if (signal === "buy") {
                signal = "hold";
            }
        }
        result.push({
            time: data[i].time,
            open: data[i].open,
            high: data[i].high,
            low: data[i].low,
            close: data[i].close,
            volume: data[i].volume,
            adjclose: data[i].adjclose,
            ema1: ema1[ema1.length - 1],
            vwap: data[i].close,
            signal: signal,
        });
    }
    return result;
};
export const crossOverStratergy = (data, targetPercentage, stopLossPercentage) => {
    const result = [];
    let signal = "wait";
    let positionTaken = false;
    let positionPriceTaken = 0;
    let recentSwingHigh = 0;
    for (let i = 0; i < data.length; i++) {
        let ema1 = [];
        let ema2 = [];
        let ema3 = [];
        const closePriceArr = data
            .map((d) => d.close)
            .flat()
            .slice(0, i + 1);
        if (i > 9) {
            ema1 = EMA.calculate({ values: closePriceArr, period: 9 });
        }
        if (i > 21) {
            ema2 = EMA.calculate({ values: closePriceArr, period: 21 });
        }
        if (i > 55) {
            ema3 = EMA.calculate({ values: closePriceArr, period: 55 });
        }
        const currentposiotnpercentage = ((data[i].close - positionPriceTaken) / positionPriceTaken) * 100;
        if (positionTaken && currentposiotnpercentage > targetPercentage) {
            signal = "sell";
            positionPriceTaken = 0;
            positionTaken = false;
        }
        else if (positionTaken && currentposiotnpercentage < stopLossPercentage) {
            signal = "sell";
            positionPriceTaken = 0;
            positionTaken = false;
        }
        else if (ema1[ema1.length - 1] > ema2[ema2.length - 1] &&
            ema1[ema1.length - 1] > ema3[ema3.length - 1] &&
            ema2[ema2.length - 1] > ema3[ema3.length - 1] &&
            data[i].close > recentSwingHigh) {
            if (signal === "wait") {
                signal = "buy";
                positionPriceTaken = data[i].close;
                positionTaken = true;
            }
            else if (signal === "buy") {
                signal = "hold";
            }
            else if (signal === "sell") {
                signal = "wait";
            }
        }
        else {
            if (signal === "hold") {
                signal = "sell";
                positionPriceTaken = 0;
                positionTaken = false;
            }
            else if (signal === "sell") {
                signal = "wait";
            }
            else if (signal === "buy") {
                signal = "hold";
            }
        }
        if (recentSwingHigh > data[i].high) {
            recentSwingHigh = data[i].high;
        }
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
            rsi: 0,
            signal: signal,
        });
    }
    return result;
};
export const emaStrategy = (data, targetPercentage, stopLossPercentage) => {
    const result = [];
    let signal = "wait";
    let positionTaken = false;
    let positionPriceTaken = 0;
    for (let i = 0; i < data.length; i++) {
        let ema1 = [];
        let ema2 = [];
        let ema3 = [];
        let rsi = [];
        const closePriceArr = data
            .map((d) => d.close)
            .flat()
            .slice(0, i + 1);
        if (i > 9) {
            ema1 = EMA.calculate({ values: closePriceArr, period: 9 });
        }
        if (i > 20) {
            ema2 = EMA.calculate({ values: closePriceArr, period: 20 });
        }
        const currentposiotnpercentage = ((data[i].close - positionPriceTaken) / positionPriceTaken) * 100;
        if (positionTaken && currentposiotnpercentage > targetPercentage) {
            signal = "sell";
            positionPriceTaken = 0;
            positionTaken = false;
        }
        else if (positionTaken && currentposiotnpercentage < stopLossPercentage) {
            signal = "sell";
            positionPriceTaken = 0;
            positionTaken = false;
        }
        else if (ema1[ema1.length - 1] > ema2[ema2.length - 1]) {
            if (signal === "wait") {
                signal = "buy";
                positionPriceTaken = data[i].close;
                positionTaken = true;
            }
            else if (signal === "buy") {
                signal = "hold";
            }
            else if (signal === "sell") {
                signal = "wait";
            }
        }
        else {
            if (signal === "hold") {
                signal = "sell";
                positionPriceTaken = 0;
                positionTaken = false;
            }
            else if (signal === "sell") {
                signal = "wait";
            }
            else if (signal === "buy") {
                signal = "hold";
            }
        }
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
            ema3: 0,
            rsi: 0,
            signal: signal,
        });
    }
    return result;
};
//# sourceMappingURL=Stratergy.js.map