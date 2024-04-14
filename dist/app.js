import express from "express";
import cors from "cors";
import { ConnectFyersSocket, fyersRouter } from "./routes/fyers.js";
import { userRouter } from "./routes/users.js";
import { Server } from "socket.io";
import http from "http";
import { symbolRouter } from "./routes/symbol.js";
import { strategyRouter } from "./routes/stratergy.js";
import { CronJob } from "cron";
const app = express();
const server = http.createServer(app);
app.use(express.json());
app.use(cors());
const PORT = process.env.PORT || 3010;
// Set your APPID obtained from Fyers (replace "xxx-1xx" with your actual APPID)
const io = new Server(server, { cors: { origin: "*" } });
io.on("connection", (socket) => {
    console.log("connected");
    ConnectFyersSocket(io, socket);
});
// Routes
app.get("/", (req, res) => {
    res.send("Hello World!");
});
app.use("/api/fyers", fyersRouter);
app.use("/user", userRouter);
app.use("/api/symbol", symbolRouter);
app.use("/api/strategy", strategyRouter);
// Start server
const job = new CronJob("15 9 * * 1-5", // cronTime
function () {
    console.log("You will see this message every second");
}, // onTick
null, // onComplete
true, // start
"system" // timezone
);
server.listen(PORT, () => {
    console.log(`App open at URL: http://localhost:${PORT}`);
});
//# sourceMappingURL=app.js.map