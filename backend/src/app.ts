import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import config from './config';

/**
 * Express app configuration
 */
const app: Express = express();

// Middleware setup
app.use(helmet());
app.use(cors({
  origin: config.corsOrigin
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
if (config.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Fluxori API is running',
    version: config.apiVersion
  });
});

// Import and configure routes
import milestoneRoutes from './routes/milestone.routes';
import customerRoutes from './routes/customer.routes';
import inventoryRoutes from './routes/inventory.routes';
import inventoryAlertRoutes from './routes/inventory-alert.routes';
import analyticsRoutes from './routes/analytics.routes';
import authRoutes from './routes/auth.routes';
import dashboardRoutes from './routes/dashboard.routes';
import projectRoutes from './routes/project.routes';
import taskRoutes from './routes/task.routes';
import shipmentRoutes from './routes/shipment.routes';
import webhookRoutes from './routes/webhook.routes';
import uploadRoutes from './routes/upload.routes';

// Route registration
app.use('/api/milestones', milestoneRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/inventory-alerts', inventoryAlertRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/shipments', shipmentRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/uploads', uploadRoutes);

// Import and configure module routes
import internationalTradeRoutes from './modules/international-trade/routes/international-trade.routes';
import marketplaceProductRoutes from './modules/marketplaces/routes/marketplace-product.routes';
import conversationRoutes from './modules/ai-cs-agent/routes/conversation.routes';
import ragRetrievalRoutes from './modules/rag-retrieval/routes/rag-retrieval.routes';
import notificationRoutes from './modules/notifications/routes/notification.routes';
import creditRoutes from './modules/credits/routes/credit.routes';

// Module route registration
app.use('/api/international-trade', internationalTradeRoutes);
app.use('/api/marketplace-products', marketplaceProductRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/rag', ragRetrievalRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/credits', creditRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    success: false,
    message,
    ...(config.nodeEnv === 'development' && { stack: err.stack })
  });
});

export default app;