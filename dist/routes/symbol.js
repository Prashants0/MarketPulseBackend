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
    let symbolDataExchange = "NS";
    if (symbolData.exchange == "NSE") {
        symbolDataExchange = "NS";
    }
    else if (symbolData.exchange == "BSE") {
        symbolDataExchange = "BO";
    }
    const { regularMarketChange, regularMarketPrice, regularMarketChangePercent, } = await yahooFinance.quoteCombine(`${symbolData.symbol}.${symbolDataExchange}`);
    if (!regularMarketChange ||
        !regularMarketPrice ||
        !regularMarketChangePercent) {
        return res.status(400).json({ error: "No data found" });
    }
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