import express, { Request, Response, NextFunction } from "express";
import * as dotenv from "dotenv";

import routerAngelsHaven from "./router/angelshaven";

dotenv.config();
const app = express();

app.use("/angelshaven", routerAngelsHaven);

app.listen(process.env.PORT, () => {
  console.log(`⚡️ SERVER IS LISTENING ON PORT ${process.env.PORT}!`);
});
