import prisma from "./prisma.js";
import yahooFinance from "yahoo-finance2";
import { crossOverStratergy, emaRsiStrategy, emaVwapStratergy, } from "./Stratergy.js";
import { buyOrder, sellOrder } from "./fyers/trade.js";
import { fyersSocket } from "../app.js";
export const liveTradeSetup = async () => {
    const liveTradeData = await prisma.user_trading_strategy.findMany();
    for (let i = 0; i < liveTradeData.length; i++) {
        const user_id = liveTradeData[i].usersId;
        const strategyId = liveTradeData[i].id;
        const strategyType = liveTradeData[i].strategy;
        const symbolId = liveTradeData[i].symbol_id;
        const targetPercentage = liveTradeData[i].targetPercentage;
        const stopLossPercentage = liveTradeData[i].stoplossPercentage;
        const quantity = liveTradeData[i].qutanity;
        const postionTaken = liveTradeData[i].positionTaken;
        if (!strategyType ||
            !symbolId ||
            !targetPercentage ||
            !stopLossPercentage) {
            throw new Error("Invalid strategy data");
        }
        if (!quantity || !strategyId) {
            throw new Error("Invalid strategy data");
        }
        liveTrade(strategyType, symbolId, targetPercentage, stopLossPercentage, quantity, strategyId, postionTaken, user_id);
    }
};
const liveTrade = async (strategyType, symbolId, targetPercentage, stopLossPercentage, quantity, strategyId, positionTaken, user_id) => {
    const symbolInfo = await prisma.symbol_list.findFirst({
        where: {
            id: symbolId,
        },
    });
    if (!symbolInfo) {
        throw new Error("Symbol not found");
    }
    let exchangeSign = "NS";
    if (symbolInfo.exchange == "NSE") {
        exchangeSign = "NS";
    }
    else if (symbolInfo.exchange == "BSE") {
        exchangeSign = "BO";
    }
    const today = new Date();
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const secondsIn60Days = 50 * 24 * 60 * 60;
    const sixMonthsAgo = new Date((currentTimestamp - secondsIn60Days) * 1000);
    const queryOptions = {
        period1: sixMonthsAgo,
        period2: new Date((currentTimestamp - 60 * 60) * 1000),
        interval: "5m",
    };
    const symbolData = await yahooFinance.chart(`${symbolInfo.symbol}.${exchangeSign}`, queryOptions);
    const structedResult = await symbolData.quotes.map((data) => {
        return {
            time: data.date.getTime() / 1000 + 19800,
            high: data.high ?? 0,
            volume: data.volume ?? 0,
            open: data.open ?? 0,
            low: data.low ?? 0,
            close: data.close ?? 0,
            adjclose: data.adjclose ?? 0,
        };
    });
    let strategyResults = [];
    if (strategyType == 3) {
        strategyResults = emaRsiStrategy(structedResult, targetPercentage, -stopLossPercentage);
    }
    if (strategyType == 4) {
        strategyResults = emaVwapStratergy(structedResult, targetPercentage, -stopLossPercentage);
    }
    if (strategyType == 2) {
        strategyResults = crossOverStratergy(structedResult, targetPercentage, -stopLossPercentage);
    }
    const result = strategyResults[strategyResults.length - 1];
    if (result.signal == "buy") {
        await buyOrder(symbolInfo.symbol, quantity, user_id, symbolInfo.exchange);
        fyersSocket.emit("live-trade", {
            symbol: symbolInfo.symbol,
            quantity: quantity,
            type: 2,
            typeName: "buy",
        });
        await prisma.user_trading_strategy.update({
            where: {
                id: strategyId,
            },
            data: {
                positionTaken: true,
            },
        });
    }
    if (result.signal == "sell") {
        await sellOrder(symbolInfo.symbol, quantity, user_id, symbolInfo.exchange);
        fyersSocket.emit("live-trade", {
            symbol: symbolInfo.symbol,
            quantity: quantity,
            type: 2,
            typeName: "sell",
        });
        await prisma.user_trading_strategy.update({
            where: {
                id: strategyId,
            },
            data: {
                positionTaken: false,
            },
        });
    }
    if (result.signal == "hold" && !positionTaken) {
        await buyOrder(symbolInfo.symbol, quantity, user_id, symbolInfo.exchange);
        fyersSocket.emit("live-trade", {
            symbol: symbolInfo.symbol,
            quantity: quantity,
            type: 2,
            typeName: "buy",
        });
        await prisma.user_trading_strategy.update({
            where: {
                id: strategyId,
            },
            data: {
                positionTaken: true,
            },
        });
    }
};
//# sourceMappingURL=liveTrade.js.map