import { prisma,productionmode } from "../config/dbconfig.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "fintrackpro_secret";
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

export const signupController = async (req, res) => {
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
        fullName,
      },
    });

    const token = jwt.sign({ userId: user.uiid, email: user.email }, JWT_SECRET, { expiresIn: "7d" });

    res.cookie("fintrackerpro_user_token", token, {
      httpOnly: true,
      sameSite: productionmode ? "None" : "lax",
      path: "/",
      maxAge: COOKIE_MAX_AGE,
    });

    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json({ message: "Signup successful", user: userWithoutPassword });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const loginController = async (req, res) => {
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
      maxAge: COOKIE_MAX_AGE,
    });

    const { password: _, ...userWithoutPassword } = user;
    res.status(200).json({ message: "Login successful", user: userWithoutPassword });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const checkIsLoggedInController = async (req, res) => {
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
      select: { uiid: true, email: true, fullName: true, currency: true, createdAt: true, updatedAt: true },
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
