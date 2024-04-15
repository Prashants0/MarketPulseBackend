import { fyersModel } from "fyers-api-v3";
import { FYERS_APP_ID } from "../utils.js";
import prisma from "../prisma.js";
var fyers = new fyersModel();
fyers.setAppId(FYERS_APP_ID);
export const buyOrder = async (symbol, quantity, user_id, exchange) => {
    const userInfo = await prisma.users_broker_profile.findFirst({
        where: {
            usersId: user_id,
        },
    });
    if (!userInfo) {
        throw new Error("User not found");
    }
    fyers.setAccessToken(userInfo.access_token);
    let exchangeSign = "-EQ";
    if (exchange == "NSE") {
        exchangeSign = "-EQ";
    }
    else if (exchange == "BSE") {
        exchangeSign = "-X";
    }
    const reqBody = {
        symbol: `${exchange}:${symbol}${exchangeSign}`,
        qty: quantity,
        type: 2,
        side: 1,
        productType: "CNC",
        limitPrice: 0,
        stopPrice: 0,
        disclosedQty: 0,
        validity: "DAY",
        offlineOrder: false,
        stopLoss: 0,
        takeProfit: 0,
        orderTag: "tag1",
    };
    fyers
        .place_order(reqBody)
        .then((response) => {
        console.log(response);
    })
        .catch((error) => {
        console.log(error);
    });
};
export const sellOrder = async (symbol, quantity, user_id, exchange) => {
    const userInfo = await prisma.users_broker_profile.findFirst({
        where: {
            usersId: user_id,
        },
    });
    if (!userInfo) {
        throw new Error("User not found");
    }
    fyers.setAccessToken(userInfo.access_token);
    let exchangeSign = "-EQ";
    if (exchange == "NSE") {
        exchangeSign = "-EQ";
    }
    else if (exchange == "BSE") {
        exchangeSign = "-X";
    }
    const reqBody = {
        symbol: `${exchange}:${symbol}${exchangeSign}`,
        qty: quantity,
        type: 2,
        side: -1,
        productType: "CNC",
        limitPrice: 0,
        stopPrice: 0,
        disclosedQty: 0,
        validity: "DAY",
        offlineOrder: false,
        stopLoss: 0,
        takeProfit: 0,
        orderTag: "tag1",
    };
    fyers
        .place_order(reqBody)
        .then((response) => {
        console.log(response);
    })
        .catch((error) => {
        console.log(error);
    });
};
//# sourceMappingURL=trade.js.map