import { fyersOrderSocket } from "fyers-api-v3";

export const StartPostionsSocket = (
  accessToken: string,
  fyersSocket: any,
  socketId: string
) => {
  const fyersOrderData = new fyersOrderSocket(accessToken);

  fyersOrderData.on("error", function (errs: any) {
    console.log(errs);
  });

  //for ticks of general data like price-alerts,EDIS
  fyersOrderData.on("general", function (msg: any) {
    console.log(msg);
  });
  fyersOrderData.on("connect", function () {
    fyersOrderData.subscribe([
      fyersOrderData.positionUpdates,
      fyersOrderData.orderUpdates,
    ]);
  });
  fyersOrderData.on("close", function () {
    console.log("closed");
  });

  //for ticks of positions
  fyersOrderData.on("positions", function (msg: any) {
    fyersSocket.to(socketId).emit("positions", msg);
  });
  fyersOrderData.on("orders", function (msg: any) {
    console.log(msg);
    fyersSocket.to(socketId).emit("orders", msg);
  });
  fyersOrderData.autoreconnect();
  fyersOrderData.connect();
};
