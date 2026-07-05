// src/server.js
import "dotenv/config";

// src/app.js
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

// src/routes/user.routes.js
import { Router } from "express";

// src/config/dbconfig.js
import { PrismaClient } from "#prisma";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
var prisma = new PrismaClient({
  adapter: new PrismaMariaDb(process.env.DATABASE_URL)
});
var productionmode = true;

// src/controller/user.controller.js
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
var JWT_SECRET = process.env.JWT_SECRET || "fintrackpro_secret";
var COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1e3;
var signupController = async (req, res) => {
  try {
    const { email, password, fullName } = req.body;
    if (!email || !password || !fullName) {
      return res.status(400).json({ error: "Email, password, and full name are required" });
    }
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: "Email already in use" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        uiid: crypto.randomUUID(),
        email,
        password: hashedPassword,
        fullName
      }
    });
    const token = jwt.sign({ userId: user.uiid, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
    res.cookie("fintrackerpro_user_token", token, {
      httpOnly: true,
      sameSite: productionmode ? "None" : "lax",
      path: "/",
      maxAge: COOKIE_MAX_AGE
    });
    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json({ message: "Signup successful", user: userWithoutPassword });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Internal server error", message: error.message });
  }
};
var loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid password" });
    }
    const token = jwt.sign({ userId: user.uiid, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
    res.cookie("fintrackerpro_user_token", token, {
      httpOnly: true,
      sameSite: productionmode ? "None" : "lax",
      path: "/",
      maxAge: COOKIE_MAX_AGE
    });
    const { password: _, ...userWithoutPassword } = user;
    res.status(200).json({ message: "Login successful", user: userWithoutPassword });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error", message: error.message });
  }
};
var checkIsLoggedInController = async (req, res) => {
  try {
    const token = req.cookies?.fintrackerpro_user_token;
    if (!token) {
      return res.status(401).json({ loggedIn: false });
    }
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return res.status(401).json({ loggedIn: false });
    }
    const user = await prisma.user.findUnique({
      where: { uiid: decoded.userId },
      select: { uiid: true, email: true, fullName: true, currency: true, createdAt: true, updatedAt: true }
    });
    if (!user) {
      return res.status(401).json({ loggedIn: false });
    }
    res.status(200).json({ loggedIn: true, user });
  } catch (error) {
    console.error("Check auth error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
var updateUserController = async (req, res) => {
  try {
    const token = req.cookies?.fintrackerpro_user_token;
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { fullName, currency } = req.body;
    if (!fullName && !currency) {
      return res.status(400).json({ error: "Nothing to update" });
    }
    const user = await prisma.user.update({
      where: { uiid: decoded.userId },
      data: {
        ...fullName !== void 0 && { fullName },
        ...currency !== void 0 && { currency }
      },
      select: { uiid: true, email: true, fullName: true, currency: true, createdAt: true, updatedAt: true }
    });
    res.status(200).json({ message: "Profile updated", user });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ error: "Internal server error", message: error.message });
  }
};

// src/routes/user.routes.js
var router = Router();
router.post("/signup", signupController);
router.post("/login", loginController);
router.get("/check", checkIsLoggedInController);
router.patch("/update", updateUserController);
var user_routes_default = router;

// src/routes/money.routes.js
import { Router as Router2 } from "express";

// src/controller/money.controller.js
import jwt2 from "jsonwebtoken";
var JWT_SECRET2 = process.env.JWT_SECRET || "fintrackpro_secret";
var getUserFromToken = async (req) => {
  const token = req.cookies?.fintrackerpro_user_token;
  if (!token) return null;
  try {
    const decoded = jwt2.verify(token, JWT_SECRET2);
    const user = await prisma.user.findUnique({
      where: { uiid: decoded.userId },
      select: { uiid: true }
    });
    return user;
  } catch {
    return null;
  }
};
var addTransaction = async (req, res) => {
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
        category
      }
    });
    res.status(201).json({ message: "Transaction added", transaction });
  } catch (error) {
    console.error("Add transaction error:", error);
    res.status(500).json({ error: "Internal server error", message: error.message });
  }
};
var getTransactions = async (req, res) => {
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
      orderBy: { date: "desc" }
    });
    res.status(200).json({ transactions });
  } catch (error) {
    console.error("Get transactions error:", error);
    res.status(500).json({ error: "Internal server error", message: error.message });
  }
};
var deleteTransaction = async (req, res) => {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { id } = req.params;
    const transaction = await prisma.transaction.findUnique({
      where: { id }
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
var getTransactionSummary = async (req, res) => {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const transactions = await prisma.transaction.findMany({
      where: { userId: user.uiid },
      select: { type: true, amount: true }
    });
    const totalIncome = transactions.filter((t) => t.type === "Income").reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions.filter((t) => t.type === "Expense").reduce((sum, t) => sum + t.amount, 0);
    res.status(200).json({
      totalBalance: totalIncome - totalExpense,
      totalIncome,
      totalExpense,
      totalTransactions: transactions.length
    });
  } catch (error) {
    console.error("Get summary error:", error);
    res.status(500).json({ error: "Internal server error", message: error.message });
  }
};

// src/routes/money.routes.js
var router2 = Router2();
router2.post("/addTransaction", addTransaction);
router2.get("/getTransactions", getTransactions);
router2.get("/getTransactionSummary", getTransactionSummary);
router2.delete("/deleteTransaction/:id", deleteTransaction);
var money_routes_default = router2;

// src/app.js
import swaggerUi from "swagger-ui-express";
import fs from "fs";
var app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors(
    {
      origin: (origin, callback) => {
        if (!origin) {
          return callback(null, true);
        }
        return callback(null, origin);
      },
      credentials: true
    }
  )
);
app.use("/userRoutes", user_routes_default);
app.use("/moneyRoutes", money_routes_default);
var swaggerData = JSON.parse(fs.readFileSync("./swagger-output.json", "utf-8"));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerData));
var app_default = app;

// src/server.js
app_default.get("/", (req, res) => {
  res.send("server Started");
});
var ServerPort = process.env.SERVERPORT;
app_default.listen(ServerPort, () => {
  console.log(`server started at ${ServerPort}`);
});
