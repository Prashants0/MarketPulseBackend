import express from "express";
import yahooFinance from "yahoo-finance2";
import {
  SymbolData,
  SymbolEmaRsiData,
  SymbolEmaVwapData,
} from "../types/symbolData.js";
import {
  crossOverStratergy,
  emaRsiStrategy,
  emaVwapStratergy,
} from "../lib/Stratergy.js";
import prisma from "../lib/prisma.js";

export const strategyRouter = express.Router();

strategyRouter.post("/backtest", async (req, res) => {
  yahooFinance._opts.cookieJar?.removeAllCookiesSync();
  try {
    const { symbol, exchange, targetPercentage, stopLossPercentage, strategy } =
      req.body;
    let exchangeSign = "NS";
    if (exchange == "NSE") {
      exchangeSign = "NS";
    } else if (exchange == "BSE") {
      exchangeSign = "BO";
    }
    const currentTimestamp = Math.floor(Date.now() / 1000);

    const secondsIn60Days = 50 * 24 * 60 * 60;

    const sixMonthsAgo = new Date((currentTimestamp - secondsIn60Days) * 1000);
    const queryOptions = {
      period1: sixMonthsAgo,
      period2: new Date((currentTimestamp - 60 * 60) * 1000),
      interval: "5m" as "5m",
    };
    const result = await yahooFinance.chart(
      `${symbol}.${exchangeSign}`,
      queryOptions
    );
    const structuredResult = await result.quotes.map((data) => {
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
    let results: SymbolEmaRsiData[] | SymbolEmaVwapData[] = [];
    if (strategy == 2) {
      results = crossOverStratergy(
        structuredResult,
        targetPercentage,
        -stopLossPercentage
      );
    } else if (strategy == 3) {
      results = emaRsiStrategy(
        structuredResult,
        targetPercentage,
        -stopLossPercentage
      );
    } else if (strategy == 4) {
      results = emaVwapStratergy(
        structuredResult,
        targetPercentage,
        -stopLossPercentage
      );
    } else if (strategy == 1) {
      results = emaVwapStratergy(
        structuredResult,
        targetPercentage,
        -stopLossPercentage
      );
    }

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

strategyRouter.post("/stopDeployment", async (req, res) => {
  try {
    const { strategyId } = req.body;
    await prisma.user_trading_strategy.update({
      where: {
        id: strategyId,
      },
      data: {
        liveStatus: false,
      },
    });
  } catch (error) {
    console.log(error);
    res.send("error fetching backtest").status(500);
    return;
  }
  res.send("success").status(200);
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
      strategy,
      quantity: quantity,
    } = req.body;

    const oldStrategy = await prisma.user_trading_strategy.findFirst({
      where: {
        id: strategyId,
      },
    });

    if (oldStrategy && oldStrategy.liveStatus) {
      return res.status(400).json({ error: "Strategy is already live" });
    }
    if (oldStrategy && !oldStrategy.liveStatus) {
      await prisma.user_trading_strategy.update({
        where: {
          id: strategyId,
        },
        data: {
          liveStatus: true,
        },
      });
      return res.status(200).json({ error: "Strategy is live" });
    }

    await prisma.user_trading_strategy.create({
      data: {
        id: strategyId,
        liveStatus: true,
        symbol_id: symbolId,
        strategy: strategy,
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
