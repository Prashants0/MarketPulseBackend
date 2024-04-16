import express from "express";
import yahooFinance from "yahoo-finance2";
import prisma from "../lib/prisma.js";
export const symbolRouter = express.Router();
symbolRouter.post("/get_quote", async (req, res) => {
    const { symbol, exchange, type } = req.body;
    let symbolData;
    if (type == "holding") {
        symbolData = await prisma.symbol_list.findFirst({
            where: {
                AND: [
                    {
                        symbol: symbol,
                    },
                    {
                        exchange: exchange,
                    },
                ],
            },
        });
    }
    else {
        symbolData = await prisma.symbol_list.findFirst({
            where: {
                id: symbol,
            },
        });
    }
    if (!symbolData) {
        return res.status(400).json({ error: "No data found" });
    }
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const secondsIn1Day = 5 * 24 * 60 * 60;
    const sixMonthsAgo = new Date((currentTimestamp - secondsIn1Day) * 1000);
    const queryOptions = {
        period1: sixMonthsAgo,
    };
    let symbolDataExchange = "NS";
    if (symbolData.exchange == "NSE") {
        symbolDataExchange = "NS";
    }
    else if (symbolData.exchange == "BSE") {
        symbolDataExchange = "BO";
    }
    const result = await yahooFinance.chart(`${symbolData.symbol}.${symbolDataExchange}`, queryOptions);
    const quotes = result.quotes;
    const regularMarketPrice = quotes[quotes.length - 1].close;
    const regularMarketChange = quotes[quotes.length - 1].close - quotes[quotes.length - 2].close;
    const regularMarketChangePercent = ((quotes[quotes.length - 1].close - quotes[quotes.length - 2].close) /
        quotes[quotes.length - 2].close) *
        100;
    res.status(200).json({
        symbol: symbolData.symbol,
        exchange: symbolData.exchange,
        change: regularMarketChange?.toFixed(2),
        price: regularMarketPrice?.toFixed(2),
        changePercent: regularMarketChangePercent?.toFixed(2),
    });
});
symbolRouter.get("/", async (req, res) => {
    res.send("Hello World!");
});
//# sourceMappingURL=symbol.js.map