import { 
  users, 
  transactions, 
  type User, 
  type InsertUser,
  type Transaction,
  type InsertTransaction
} from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserBalance(userId: number, newBalance: number): Promise<User | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getTransactionsByUserId(userId: number): Promise<Transaction[]>;
  getAllUsers(): Promise<User[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private transactions: Map<number, Transaction>;
  private userIdCounter: number;
  private transactionIdCounter: number;
  
  constructor() {
    this.users = new Map();
    this.transactions = new Map();
    this.userIdCounter = 1;
    this.transactionIdCounter = 1;
    
    // Add some initial users for demo
    this.createUser({
      firstName: "Demo",
      lastName: "User",
      email: "demo@example.com",
      password: "$2b$10$PbVwrL2rRsP/ZqWrg7YUneRSv1ePJB3DDQo5ylWfwvC4MIEnF5xHS", // password: password123
    }).then(user => {
      this.updateUserBalance(user.id, 5000);
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    // Set minimum balance of 1000 Rs for all new accounts
    const user: User = { ...userData, id, balance: 1000 };
    this.users.set(id, user);
    return user;
  }

  async updateUserBalance(userId: number, newBalance: number): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;
    
    const updatedUser = { ...user, balance: newBalance };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const id = this.transactionIdCounter++;
    const now = new Date();
    
    // Ensure all required fields are provided with defaults to satisfy the type
    const newTransaction: Transaction = { 
      ...transaction, 
      id, 
      timestamp: now,
      senderId: transaction.senderId ?? null,
      receiverId: transaction.receiverId ?? null,
      note: transaction.note ?? null
    };
    
    this.transactions.set(id, newTransaction);
    return newTransaction;
  }

  async getTransactionsByUserId(userId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(
      transaction => transaction.senderId === userId || transaction.receiverId === userId
    ).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
}

export const storage = new MemStorage();
