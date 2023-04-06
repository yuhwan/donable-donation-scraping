import express, { Request, Response } from "express";
const router = express.Router();

router.post("/start-new-donation", (req: Request, res: Response) => {
  res.send("START NEW DONATION");
});

export default router;
