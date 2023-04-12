import express, { Request, Response, NextFunction } from "express";
import * as dotenv from "dotenv";

import routerAngelsHaven from "./router/angelshaven";
import { startScrapingServer } from "./lib/puppeteer";

dotenv.config();
const app = express();

app.use(express.json());
app.use("/angelshaven", routerAngelsHaven);

startScrapingServer(() => {
  app.listen(process.env.PORT, () => {
    console.log(`⚡️ SERVER IS LISTENING ON PORT ${process.env.PORT}!`);
  });
});