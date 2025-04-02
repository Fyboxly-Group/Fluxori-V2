/**
 * Mock data for credit system development
 */

import { CreditTransactionType, CreditTransaction, CreditBalance, CreditPackage } from '../api/credits.api';

// Generate a random ID
const generateId = () => Math.random().toString(36).substring(2, 15);

// Generate a random date within the past 90 days
const randomDate = (days: any = 90) => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * days));
  return date.toISOString();
};

// Mock credit transactions
export const mockTransactions: CreditTransaction[] = [
  {
    id: generateId(),
    userId: '123',
    type: CreditTransactionType.ALLOCATION,
    amount: 100,
    description: 'Welcome bonus credits',
    balanceAfter: 100,
    createdAt: randomDate(90),
  },
  {
    id: generateId(),
    userId: '123',
    type: CreditTransactionType.PURCHASE,
    amount: 500,
    description: 'Purchased Standard credit package',
    balanceAfter: 600,
    createdAt: randomDate(60),
  },
  {
    id: generateId(),
    userId: '123',
    type: CreditTransactionType.USAGE,
    amount: -50,
    description: 'AI Customer Service chat session',
    balanceAfter: 550,
    createdAt: randomDate(45),
  },
  {
    id: generateId(),
    userId: '123',
    type: CreditTransactionType.USAGE,
    amount: -25,
    description: 'AI-powered inventory optimization',
    balanceAfter: 525,
    createdAt: randomDate(30),
  },
  {
    id: generateId(),
    userId: '123',
    type: CreditTransactionType.PURCHASE,
    amount: 1000,
    description: 'Purchased Premium credit package',
    balanceAfter: 1525,
    createdAt: randomDate(15),
  },
  {
    id: generateId(),
    userId: '123',
    type: CreditTransactionType.USAGE,
    amount: -75,
    description: 'Bulk import and AI categorization',
    balanceAfter: 1450,
    createdAt: randomDate(7),
  },
  {
    id: generateId(),
    userId: '123',
    type: CreditTransactionType.USAGE,
    amount: -30,
    description: 'Advanced analytics report generation',
    balanceAfter: 1420,
    createdAt: randomDate(2),
  },
];

// Mock credit balance
export const mockCreditBalance: CreditBalance = {
  userId: '123',
  balance: 1420,
  lastUpdated: new Date().toISOString(),
};

// Mock credit packages
export const mockCreditPackages: CreditPackage[] = [
  {
    id: 'starter',
    name: 'Starter Package',
    description: 'Perfect for individuals and small teams just getting started',
    amount: 100,
    price: 9.99,
    currency: 'USD',
  },
  {
    id: 'standard',
    name: 'Standard Package',
    description: 'Our most popular package for growing businesses',
    amount: 500,
    price: 39.99,
    currency: 'USD',
    isPopular: true,
  },
  {
    id: 'premium',
    name: 'Premium Package',
    description: 'Best value for businesses with high usage needs',
    amount: 1000,
    price: 69.99,
    currency: 'USD',
  },
  {
    id: 'enterprise',
    name: 'Enterprise Package',
    description: 'Designed for large organizations with extensive requirements',
    amount: 5000,
    price: 299.99,
    currency: 'USD',
  },
];