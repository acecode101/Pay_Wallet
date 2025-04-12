import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import express from "express";
import { 
  insertUserSchema, 
  loginUserSchema, 
  insertTransactionSchema,
  type User
} from "@shared/schema";
import bcrypt from "bcrypt";
import session from "express-session";
import MemoryStore from "memorystore";

const SessionStore = MemoryStore(session);

export async function registerRoutes(app: Express): Promise<Server> {
  // Session setup
  app.use(
    session({
      cookie: { maxAge: 86400000 }, // 24 hours
      secret: process.env.SESSION_SECRET || "paywallet-secret",
      resave: false,
      saveUninitialized: false,
      store: new SessionStore({
        checkPeriod: 86400000, // prune expired entries every 24h
      }),
    })
  );

  // Middleware to check if user is authenticated
  const isAuthenticated = (req: Request, res: Response, next: Function) => {
    if (req.session.userId) {
      next();
    } else {
      res.status(401).json({ message: "Unauthorized" });
    }
  };

  // Authentication routes
  app.post("/api/auth/signup", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      // Create user with hashed password
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword
      });

      // Set session
      req.session.userId = user.id;
      
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      res.status(400).json({ message: "Invalid user data", error });
    }
  });

  app.post("/api/auth/signin", async (req: Request, res: Response) => {
    try {
      const loginData = loginUserSchema.parse(req.body);
      
      // Find user by email
      const user = await storage.getUserByEmail(loginData.email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Compare passwords
      const passwordMatch = await bcrypt.compare(loginData.password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Set session
      req.session.userId = user.id;
      
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      res.status(400).json({ message: "Invalid login data", error });
    }
  });

  app.post("/api/auth/signout", (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        res.status(500).json({ message: "Failed to sign out" });
      } else {
        res.status(200).json({ message: "Signed out successfully" });
      }
    });
  });

  app.get("/api/auth/me", async (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user data" });
    }
  });

  // User routes
  app.get("/api/users", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const users = await storage.getAllUsers();
      
      // Filter out sensitive information
      const sanitizedUsers = users.map(({ password, ...user }) => ({
        ...user,
        initials: `${user.firstName[0]}${user.lastName[0]}`
      }));
      
      res.status(200).json(sanitizedUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Transaction routes
  app.post("/api/transactions", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId as number;
      const transactionData = insertTransactionSchema.parse({
        ...req.body,
        senderId: userId
      });

      // Get sender and receiver
      const sender = await storage.getUser(userId);
      const receiver = await storage.getUser(transactionData.receiverId);

      if (!sender || !receiver) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if sender has enough balance
      if (sender.balance < transactionData.amount) {
        return res.status(400).json({ message: "Insufficient balance" });
      }

      // Update balances
      await storage.updateUserBalance(
        sender.id, 
        sender.balance - transactionData.amount
      );
      
      await storage.updateUserBalance(
        receiver.id, 
        receiver.balance + transactionData.amount
      );

      // Create transaction record
      const transaction = await storage.createTransaction(transactionData);
      
      res.status(201).json(transaction);
    } catch (error) {
      res.status(400).json({ message: "Invalid transaction data", error });
    }
  });

  app.get("/api/transactions", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId as number;
      const transactions = await storage.getTransactionsByUserId(userId);
      
      // Get all users to populate transaction details
      const users = await storage.getAllUsers();
      const usersMap = new Map(users.map(user => [user.id, user]));
      
      // Enhance transactions with user details
      const enhancedTransactions = transactions.map(transaction => {
        const sender = usersMap.get(transaction.senderId || 0);
        const receiver = usersMap.get(transaction.receiverId || 0);
        
        return {
          ...transaction,
          senderName: sender ? `${sender.firstName} ${sender.lastName}` : 'Unknown',
          receiverName: receiver ? `${receiver.firstName} ${receiver.lastName}` : 'Unknown',
          isIncoming: transaction.receiverId === userId,
        };
      });
      
      res.status(200).json(enhancedTransactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
