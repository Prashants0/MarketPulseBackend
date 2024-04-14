import { fyersOrderSocket } from "fyers-api-v3";
export const StartPostionsSocket = (accessToken, fyersSocket, socketId) => {
    const fyersOrderData = new fyersOrderSocket(accessToken);
    fyersOrderData.on("error", function (errs) {
        console.log(errs);
    });
    //for ticks of general data like price-alerts,EDIS
    fyersOrderData.on("general", function (msg) {
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
    fyersOrderData.on("positions", function (msg) {
        fyersSocket.to(socketId).emit("positions", msg);
    });
    fyersOrderData.on("orders", function (msg) {
        console.log(msg);
        fyersSocket.to(socketId).emit("orders", msg);
    });
    fyersOrderData.autoreconnect();
    fyersOrderData.connect();
};
//# sourceMappingURL=postion.js.map