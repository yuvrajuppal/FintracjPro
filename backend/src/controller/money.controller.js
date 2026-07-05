import { prisma } from "../config/dbconfig.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fintrackpro_secret";

const getUserFromToken = async (req) => {
  const token = req.cookies?.fintrackerpro_user_token;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { uiid: decoded.userId },
      select: { uiid: true },
    });
    return user;
  } catch {
    return null;
  }
};

export const addTransaction = async (req, res) => {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { type, paymentType, description, amount, date, category } = req.body;

    if (!type || !description || !amount || !date || !category) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId: user.uiid,
        type,
        paymentType: paymentType || (type === "Income" ? "credit" : "debit"),
        description,
        amount: parseFloat(amount),
        date: new Date(date),
        category,
      },
    });

    res.status(201).json({ message: "Transaction added", transaction });
  } catch (error) {
    console.error("Add transaction error:", error);
    res.status(500).json({ error: "Internal server error", message: error.message });
  }
};

export const getTransactions = async (req, res) => {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { type, search } = req.query;

    const where = { userId: user.uiid };

    if (type && type !== "All Types") {
      where.type = type;
    }

    if (search) {
      where.description = { contains: search };
    }

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { date: "desc" },
    });

    res.status(200).json({ transactions });
  } catch (error) {
    console.error("Get transactions error:", error);
    res.status(500).json({ error: "Internal server error", message: error.message });
  }
};

export const deleteTransaction = async (req, res) => {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { id } = req.params;

    const transaction = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!transaction || transaction.userId !== user.uiid) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    await prisma.transaction.delete({ where: { id } });

    res.status(200).json({ message: "Transaction deleted" });
  } catch (error) {
    console.error("Delete transaction error:", error);
    res.status(500).json({ error: "Internal server error", message: error.message });
  }
};

export const getTransactionSummary = async (req, res) => {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const transactions = await prisma.transaction.findMany({
      where: { userId: user.uiid },
      select: { type: true, amount: true },
    });

    const totalIncome = transactions
      .filter((t) => t.type === "Income")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
      .filter((t) => t.type === "Expense")
      .reduce((sum, t) => sum + t.amount, 0);

    res.status(200).json({
      totalBalance: totalIncome - totalExpense,
      totalIncome,
      totalExpense,
      totalTransactions: transactions.length,
    });
  } catch (error) {
    console.error("Get summary error:", error);
    res.status(500).json({ error: "Internal server error", message: error.message });
  }
};
