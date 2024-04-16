import express from "express";
import prisma from "../lib/prisma.js";
import { fyersModel } from "fyers-api-v3";
import { FYERS_APP_ID } from "../lib/utils.js";
import { buyOrder, sellOrder } from "../lib/fyers/trade.js";
export const userRouter = express.Router();
const fyers = new fyersModel();
fyers.setAppId(FYERS_APP_ID);
userRouter.get("/holdings", async (req, res) => {
    const userId = (await req.query.userId);
    try {
        const { broker, access_token } = (await prisma.users_broker_profile.findFirst({
            where: {
                usersId: userId,
            },
        }));
        fyers.setAccessToken(access_token);
        let holdingRes = null;
        if (broker == "Fyers") {
            holdingRes = await fyers.get_holdings();
        }
        await holdingRes.holdings.map((holding) => {
            let exchange = holding.symbol.slice(holding.symbol.indexOf("-") + 1);
            if (exchange == "EQ") {
                holding.exchange = "NSE";
            }
            else if (exchange == "X") {
                holding.exchange = "BSE";
            }
            holding.symbol = holding.symbol.slice(holding.symbol.indexOf(":") + 1, holding.symbol.indexOf("-"));
        });
        res.send(holdingRes.holdings);
    }
    catch (error) {
        console.log(error, "\n holdings");
        res.send("error fetching holdings").status(500);
        return;
    }
});
userRouter.get("/positions", async (req, res) => {
    const userId = req.query.userId;
    try {
        const { broker, access_token } = (await prisma.users_broker_profile.findFirst({
            where: {
                usersId: userId,
            },
        }));
        fyers.setAccessToken(access_token);
        let positionRes = null;
        if (broker == "Fyers") {
            positionRes = await fyers.get_positions();
        }
        console.log(positionRes);
        await positionRes.netPositions.map((position) => {
            position.symbol = position.symbol.slice(position.symbol.indexOf(":") + 1, position.symbol.indexOf("-"));
        });
        res.send(positionRes.orderBook);
    }
    catch (error) {
        console.log(error);
        res.send("error fetching positions").status(500);
        return;
    }
});
userRouter.get("/orders", async (req, res) => {
    const userId = req.query.userId;
    try {
        const { broker, access_token } = (await prisma.users_broker_profile.findFirst({
            where: {
                usersId: userId,
            },
        }));
        fyers.setAccessToken(access_token);
        let orderRes = null;
        if (broker == "Fyers") {
            orderRes = await fyers.get_orders();
        }
        console.log(orderRes);
        await orderRes.orderBook.map((order) => {
            order.symbol = order.symbol.slice(order.symbol.indexOf(":") + 1, order.symbol.indexOf("-"));
        });
        res.send(orderRes.orderBook);
    }
    catch (error) {
        console.log(error);
        res.send("error fetching orders").status(500);
        return;
    }
});
userRouter.post("/buy-order", async (req, res) => {
    const userId = req.body.userId;
    const symbol = req.body.symbol;
    const quantity = req.body.quantity;
    const exchange = req.body.exchange;
    try {
        const response = await buyOrder(symbol, quantity, userId, exchange);
        res.send(response).status(200);
        return;
    }
    catch (error) {
        res.send(error).status(500);
        return;
    }
});
userRouter.post("/sell-order", async (req, res) => {
    const userId = req.body.userId;
    const symbol = req.body.symbol;
    const quantity = req.body.quantity;
    const exchange = req.body.exchange;
    try {
        const response = await sellOrder(symbol, quantity, userId, exchange);
        res.send(response).status(200);
        return;
    }
    catch (error) {
        res.send(error).status(500);
        return;
    }
});
//# sourceMappingURL=users.js.map