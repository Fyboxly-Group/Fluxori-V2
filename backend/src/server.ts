import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import http from 'http';
import swaggerUi from 'swagger-ui-express';
import { notFound, errorHandler } from './middleware/error.middleware';
import { SystemStatusService } from './services/system-status.service';
import { swaggerSpec } from './config/swagger';

// Module imports
import { initializeMarketplaceModule, marketplaceProductRoutes } from './modules/marketplaces';
import { initializeCreditModule, creditRoutes } from './modules/credits';
import { initializeAICsAgentModule, conversationRoutes } from './modules/ai-cs-agent';
import { initializeRagRetrievalModule, ragRetrievalRoutes } from './modules/rag-retrieval';
import { initializeNotificationsModule, notificationRoutes } from './modules/notifications';
import { initializeBuyBoxModule, buyboxRoutes, repricingRoutes } from './modules/buybox';
import { initializeAIInsightsModule, insightRoutes } from './modules/ai-insights';

// Routes
import authRoutes from './routes/auth.routes';
import dashboardRoutes from './routes/dashboard.routes';
import taskRoutes from './routes/task.routes';
import inventoryRoutes from './routes/inventory.routes';
import inventoryAlertRoutes from './routes/inventory-alert.routes';
import uploadRoutes from './routes/upload.routes';
import shipmentRoutes from './routes/shipment.routes';
import projectRoutes from './routes/project.routes';
import milestoneRoutes from './routes/milestone.routes';
import customerRoutes from './routes/customer.routes';
import analyticsRoutes from './routes/analytics.routes';
import webhookRoutes from './routes/webhook.routes';

// Load environment variables
dotenv.config();

// Initialize express app and http server (for WebSockets)
const app: Express = express();
const httpServer = http.createServer(app);
const port = process.env.PORT || 8080;

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fluxori-v2';
    await mongoose.connect(mongoURI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Connect to database
connectDB().then(async () => {
  // Initialize system status components after database connection
  await SystemStatusService.initializeSystemComponents();
  console.log('System status components initialized');
  
  // Initialize modules
  initializeMarketplaceModule();
  initializeCreditModule();
  initializeAICsAgentModule(httpServer);
  initializeRagRetrievalModule();
  initializeNotificationsModule(httpServer);
  initializeBuyBoxModule();
  initializeAIInsightsModule();
}).catch((error) => {
  console.error('Error initializing system:', error);
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/inventory-alerts', inventoryAlertRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/shipments', shipmentRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/milestones', milestoneRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/credits', creditRoutes);
app.use('/api/ai-cs-agent', conversationRoutes);
app.use('/api/rag-retrieval', ragRetrievalRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/buybox', buyboxRoutes);
app.use('/api/repricing', repricingRoutes);
app.use('/api', marketplaceProductRoutes);
app.use('/api/insights', insightRoutes);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Basic root endpoint
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({ 
    message: 'Welcome to Fluxori-V2 API',
    version: '1.0.0',
    docs: '/api-docs'
  });
});

// Development routes
if (process.env.NODE_ENV !== 'production') {
  import('./services/seed.service').then(({ SeedService }) => {
    app.get('/api/dev/seed', async (req: Request, res: Response) => {
      try {
        await SeedService.seedAll();
        res.status(200).json({
          success: true,
          message: 'Database seeded successfully',
        });
      } catch (error) {
        console.error('Error seeding database:', error);
        res.status(500).json({
          success: false,
          message: 'Error seeding database',
          error: error.message,
        });
      }
    });
  });
}

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server using the HTTP server (not the Express app directly)
httpServer.listen(port, () => {
  console.log(`⚡️ Server is running at http://localhost:${port}`);
  console.log(`🔌 WebSocket server available at ws://localhost:${port}/api/ws/ai-cs-agent`);
});