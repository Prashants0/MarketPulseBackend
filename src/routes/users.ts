import express from "express";
import prisma from "../lib/prisma.js";
import { fyersModel } from "fyers-api-v3";
import { FYERS_APP_ID, FYERS_SECRET_KEY } from "../lib/utils.js";
import { users_broker_profile } from "@prisma/client";
import { buyOrder, sellOrder } from "../lib/fyers/trade.js";

export const userRouter = express.Router();

const fyers = new fyersModel();
fyers.setAppId(FYERS_APP_ID);

userRouter.get("/holdings", async (req, res) => {
  const userId = (await req.query.userId) as string;
  try {
    const { broker, access_token } =
      (await prisma.users_broker_profile.findFirst({
        where: {
          usersId: userId,
        },
      })) as users_broker_profile;
    fyers.setAccessToken(access_token);

    let holdingRes = null;
    if (broker == "Fyers") {
      holdingRes = await fyers.get_holdings();
    }
    await holdingRes.holdings.map((holding: any) => {
      let exchange = holding.symbol.slice(holding.symbol.indexOf("-") + 1);

      if (exchange == "EQ") {
        holding.exchange = "NSE";
      } else if (exchange == "X") {
        holding.exchange = "BSE";
      }
      holding.symbol = holding.symbol.slice(
        holding.symbol.indexOf(":") + 1,
        holding.symbol.indexOf("-")
      );
    });
    res.send(holdingRes.holdings);
  } catch (error) {
    console.log(error, "\n holdings");
    res.send("error fetching holdings").status(500);
    return;
  }
});

userRouter.get("/positions", async (req, res) => {
  const userId = req.query.userId as string;
  try {
    const { broker, access_token } =
      (await prisma.users_broker_profile.findFirst({
        where: {
          usersId: userId,
        },
      })) as users_broker_profile;

    fyers.setAccessToken(access_token);

    let positionRes = null;
    if (broker == "Fyers") {
      positionRes = await fyers.get_positions();
    }
    console.log(positionRes);
    await positionRes.netPositions.map(
      (position: { symbol: string | string[] }) => {
        position.symbol = position.symbol.slice(
          position.symbol.indexOf(":") + 1,
          position.symbol.indexOf("-")
        );
      }
    );

    res.send(positionRes.orderBook);
  } catch (error) {
    console.log(error);
    res.send("error fetching positions").status(500);
    return;
  }
});

userRouter.get("/orders", async (req, res) => {
  const userId = req.query.userId as string;
  try {
    const { broker, access_token } =
      (await prisma.users_broker_profile.findFirst({
        where: {
          usersId: userId,
        },
      })) as users_broker_profile;

    fyers.setAccessToken(access_token);

    let orderRes = null;
    if (broker == "Fyers") {
      orderRes = await fyers.get_orders();
    }
    console.log(orderRes);
    await orderRes.orderBook.map((order: { symbol: string | string[] }) => {
      order.symbol = order.symbol.slice(
        order.symbol.indexOf(":") + 1,
        order.symbol.indexOf("-")
      );
    });

    res.send(orderRes.orderBook);
  } catch (error) {
    console.log(error);
    res.send("error fetching orders").status(500);
    return;
  }
});

userRouter.post("/buy-order", async (req, res) => {
  const userId = req.body.userId as string;
  const symbol = req.body.symbol as string;
  const quantity = req.body.quantity as number;
  const exchange = req.body.exchange as string;

  try {
    const response = await buyOrder(symbol, quantity, userId, exchange);
    res.send(response).status(200);
    return;
  } catch (error) {
    res.send(error).status(500);
    return;
  }
});

userRouter.post("/sell-order", async (req, res) => {
  const userId = req.body.userId as string;
  const symbol = req.body.symbol as string;
  const quantity = req.body.quantity as number;
  const exchange = req.body.exchange as string;
  try {
    const response = await sellOrder(symbol, quantity, userId, exchange);
    res.send(response).status(200);
    return;
  } catch (error) {
    res.send(error).status(500);
    return;
  }
});
