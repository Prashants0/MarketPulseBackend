import express from "express";
import { FYERS_APP_ID, FYERS_SECRET_KEY, FRONTEND_URL } from "../lib/utils.js";
import { fyersModel } from "fyers-api-v3";
import { Broker, Prisma } from "@prisma/client";
import prisma from "../lib/prisma.js";
import { StartPostionsSocket as StartPotionsSocket } from "../lib/fyers/postion.js";

export const fyersRouter = express.Router();

const fyers = new fyersModel();
fyers.setAppId(FYERS_APP_ID);

fyersRouter.get("/connect", async (req, res) => {
  const userId = req.query.userId;
  fyers.setRedirectUrl(
    `http://127.0.0.1:3010/api/fyers/generate-token/${userId}`
  );

  fyers.setAppId(FYERS_APP_ID);
  const generateAuthcodeURL = fyers.generateAuthCode();

  res.send(generateAuthcodeURL).status(200);
});

fyersRouter.post("/buy-order", async () => {});

fyersRouter.get("/generate-token/:userId", async (req, res) => {
  const userId = req.params.userId;
  const authcode = req.query.auth_code;
  fyers.setRedirectUrl(`${FRONTEND_URL}/dashboard`);

  const tokenJson = await fyers.generate_access_token({
    secret_key: FYERS_SECRET_KEY,
    auth_code: authcode,
  });

  const token = tokenJson.access_token;
  fyers.setAccessToken(token);

  try {
    const holding = await fyers.get_holdings();
    const user = await prisma.users_broker_profile.findUnique({
      where: {
        usersId: userId,
      },
    });
    if (user) {
      await prisma.users_broker_profile.delete({
        select: {
          usersId: true,
        },

        where: {
          usersId: userId,
          broker: Broker.Fyers,
        },
      });
    }
    await prisma.users_broker_profile.create({
      data: {
        users: { connect: { id: userId } },
        broker: Broker.Fyers,
        holdings: holding.holdings,
        access_token: token,
        refresh_token: tokenJson.refresh_token,
      },
    });
  } catch (error) {
    console.log(error);
  }

  res.redirect(`${FRONTEND_URL}/dashboard`);
});

//connect fyers socket
export const ConnectFyersSocket = (io: any, socket: any) => {
  const fyersSocket = io.of("/fyers-socket");

  fyersSocket.on("connection", async (socket: any) => {
    console.log("fyers socket connected" + socket.handshake.auth.userId);
    const fyersToken = await prisma.users_broker_profile.findUnique({
      where: {
        usersId: socket.handshake.auth.userId,
      },
    });
    const socketToken = FYERS_APP_ID + ":" + fyersToken?.access_token;
    StartPotionsSocket(socketToken, fyersSocket, socket.id);
  });

  fyersSocket.use((socket: any, next: any) => {
    if (socket.handshake.auth.userId) {
      return next();
    } else {
      return next(new Error("authentication error"));
    }
  });
};
