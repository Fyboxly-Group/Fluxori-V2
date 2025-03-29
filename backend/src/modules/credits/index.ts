import { CreditService, InsufficientCreditsError } from './services/credit.service';
import { 
  CreditBalance, 
  CreditTransaction, 
  CreditTransactionType,
  SubscriptionTier,
  MONTHLY_CREDITS
} from './models/credit.model';
import creditRoutes from './routes/credit.routes';

// Export module components
export {
  CreditService,
  CreditBalance,
  CreditTransaction,
  CreditTransactionType,
  SubscriptionTier,
  MONTHLY_CREDITS,
  InsufficientCreditsError,
  creditRoutes
};

// Initialize module function
export const initializeCreditModule = () => {
  console.log('Credit module initialized');
  // Any additional initialization logic can go here
};