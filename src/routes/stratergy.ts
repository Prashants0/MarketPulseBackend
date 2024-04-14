import express from "express";
import yahooFinance from "yahoo-finance2";
import { SymbolData } from "../types/symbolData.js";
import { emaRsiStrategy } from "../lib/Stratergy.js";
import prisma from "../lib/prisma.js";

export const strategyRouter = express.Router();

strategyRouter.post("/backtest", async (req, res) => {
  try {
    const {
      symbol,
      strategyId,
      exchange,
      targetPercentage,
      stopLossPercentage,
    } = req.body;
    let exchangeSign = "NS";
    if (exchange == "NSE") {
      exchangeSign = "NS";
    } else if (exchange == "BSE") {
      exchangeSign = "BO";
    }
    const today = new Date();
    const currentTimestamp = Math.floor(Date.now() / 1000);

    const secondsIn60Days = 50 * 24 * 60 * 60;

    const newTimestampInSeconds = currentTimestamp - secondsIn60Days;
    const sixMonthsAgo = new Date((currentTimestamp - secondsIn60Days) * 1000);
    const queryOptions = {
      period1: sixMonthsAgo,
      interval: "5m" as "5m",
    };
    const result = await yahooFinance.chart(
      `${symbol}.${exchangeSign}`,
      queryOptions
    );
    const structedResult = await result.quotes.map((data) => {
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
    const results = emaRsiStrategy(
      structedResult,
      targetPercentage,
      -stopLossPercentage
    );

    res.send(results);
  } catch (error) {
    console.log(error);
    res.send("error fetching backtest").status(500);
    return;
  }
});

strategyRouter.get("/getDeployedTrades", async (req, res) => {
  try {
    const { userId } = req.body;
    const results = await prisma.user_trading_strategy.findMany({
      where: {
        usersId: userId,
      },
    });
    res.send(results).status(200);
  } catch (error) {
    console.log(error);
    res.send("error fetching backtest").status(500);
    return;
  }
});

strategyRouter.post("/deploy", async (req, res) => {
  try {
    const {
      symbolId,
      strategyId,
      exchange,
      targetPercentage,
      stopLossPercentage,
      userId,
      quantity: quantity,
    } = req.body;
    await prisma.user_trading_strategy.create({
      data: {
        id: strategyId,
        liveStatus: true,
        symbol_id: symbolId,
        strategy: 3,
        targetPercentage: targetPercentage,
        stoplossPercentage: stopLossPercentage,
        timeframe: "5m",
        qutanity: quantity,
        usersId: userId,
      },
    });
  } catch (error) {
    console.log(error);
    res.send("error fetching backtest").status(500);
    return;
  }
  res.send("success").status(200);
});
