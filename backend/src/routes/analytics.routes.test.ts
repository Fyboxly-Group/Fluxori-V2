import express from 'express';
import request from 'supertest';
import analyticsRoutes from './analytics.routes';
import * as analyticsController from '../controllers/analytics.controller';
import { authenticate } from '../middleware/auth.middleware';

// Mock middleware and controllers
jest.mock('../middleware/auth.middleware', () => ({
  authenticate: jest.fn((req, res, next) => next()),
  authorize: jest.fn((role) => (req, res, next) => next())
}));

jest.mock('../controllers/analytics.controller');

const mockControllers = analyticsController as jest.Mocked<typeof analyticsController>;

describe('Analytics Routes', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/analytics', analyticsRoutes);

    // Reset mocks
    jest.clearAllMocks();
  });

  it('should apply authentication middleware to all routes', async () => {
    await request(app).get('/api/analytics/overview');

    expect(authenticate).toHaveBeenCalled();
  });

  it('should call getBusinessOverview controller on GET /overview', async () => {
    mockControllers.getBusinessOverview.mockImplementation((req, res, next) => {
      res.status(200).json({ success: true });
      return Promise.resolve();
    });

    await request(app).get('/api/analytics/overview');

    expect(mockControllers.getBusinessOverview).toHaveBeenCalled();
  });

  it('should call getProjectPerformance controller on GET /projects/performance', async () => {
    mockControllers.getProjectPerformance.mockImplementation((req, res, next) => {
      res.status(200).json({ success: true });
      return Promise.resolve();
    });

    await request(app).get('/api/analytics/projects/performance');

    expect(mockControllers.getProjectPerformance).toHaveBeenCalled();
  });

  it('should call getProjectTimeToCompletion controller on GET /projects/time-to-completion', async () => {
    mockControllers.getProjectTimeToCompletion.mockImplementation((req, res, next) => {
      res.status(200).json({ success: true });
      return Promise.resolve();
    });

    await request(app).get('/api/analytics/projects/time-to-completion');

    expect(mockControllers.getProjectTimeToCompletion).toHaveBeenCalled();
  });

  it('should call getInventoryAnalytics controller on GET /inventory', async () => {
    mockControllers.getInventoryAnalytics.mockImplementation((req, res, next) => {
      res.status(200).json({ success: true });
      return Promise.resolve();
    });

    await request(app).get('/api/analytics/inventory');

    expect(mockControllers.getInventoryAnalytics).toHaveBeenCalled();
  });

  it('should call getShipmentAnalytics controller on GET /shipments', async () => {
    mockControllers.getShipmentAnalytics.mockImplementation((req, res, next) => {
      res.status(200).json({ success: true });
      return Promise.resolve();
    });

    await request(app).get('/api/analytics/shipments');

    expect(mockControllers.getShipmentAnalytics).toHaveBeenCalled();
  });

  it('should call getCustomerAnalytics controller on GET /customers', async () => {
    mockControllers.getCustomerAnalytics.mockImplementation((req, res, next) => {
      res.status(200).json({ success: true });
      return Promise.resolve();
    });

    await request(app).get('/api/analytics/customers');

    expect(mockControllers.getCustomerAnalytics).toHaveBeenCalled();
  });

  it('should call getTimeSeriesData controller on GET /timeseries', async () => {
    mockControllers.getTimeSeriesData.mockImplementation((req, res, next) => {
      res.status(200).json({ success: true });
      return Promise.resolve();
    });

    await request(app).get('/api/analytics/timeseries');

    expect(mockControllers.getTimeSeriesData).toHaveBeenCalled();
  });
});