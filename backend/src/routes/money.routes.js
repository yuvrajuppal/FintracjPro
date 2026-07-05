import { Router } from "express";
import {
  addTransaction,
  getTransactions,
  deleteTransaction,
  getTransactionSummary,
} from "../controller/money.controller.js";

const router = Router();

router.post("/addTransaction", addTransaction);
router.get("/getTransactions", getTransactions);
router.get("/getTransactionSummary", getTransactionSummary);
router.delete("/deleteTransaction/:id", deleteTransaction);

export default router;
