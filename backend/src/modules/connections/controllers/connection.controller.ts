import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import connectionService from '../services/connection.service';
import MarketplaceConnection, { 
  AuthenticationType, 
  ConnectionStatus, 
  MarketplaceType,
  SyncStatus
} from '../models/connection.model';
import { MarketplaceCredentials } from '../../marketplaces/models/marketplace.models';

// Authenticated request type
type AuthenticatedRequest = Request & {
  user?: {
    id: string;
    organizationId: string;
    email?: string;
    role?: string;
  };
};

/**
 * Controller for marketplace connections endpoints
 */
class ConnectionController {
  /**
   * Get all connections for a user
   * @param req - Express request
   * @param res - Express response
   */
  public async getConnections(req: Request, res: Response): Promise<void> {
    try {
      // @ts-ignore - Auth middleware adds user to request
      const userId = req.user?.id;
      // @ts-ignore - Auth middleware adds organization to request
      const organizationId = req.user?.organizationId;
      
      const connections = await connectionService.getConnections(userId, organizationId);
      
      // Transform for client response (omit credential reference)
      const transformedConnections = connections.map(conn => ({
        id: (conn as any)._id,
        marketplaceId: conn.marketplaceId,
        marketplaceName: conn.marketplaceName,
        status: conn.status,
        authenticationType: conn.authenticationType,
        lastChecked: conn.lastChecked,
        lastSyncedAt: conn.lastSyncedAt,
        lastError: conn.lastError,
        expiresAt: conn.expiresAt,
        createdAt: conn.createdAt,
        updatedAt: conn.updatedAt,
        metadata: conn.credentialMetadata,
      }));
      
      res.status(StatusCodes.OK).json({
        success: true,
        count: connections.length,
        data: transformedConnections,
      });
    } catch (error) {
      console.error('Error getting connections:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: `Failed to retrieve connections: ${error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error)}`,
      });
    }
  }

  /**
   * Create a new connection
   * @param req - Express request
   * @param res - Express response
   */
  public async createConnection(req: Request, res: Response): Promise<void> {
    try {
      // @ts-ignore - Auth middleware adds user to request
      const userId = req.user?.id;
      // @ts-ignore - Auth middleware adds organization to request
      const organizationId = req.user?.organizationId;
      
      const { 
        marketplaceId,
        credentials,
        metadata
      } = req.body;
      
      // Validate required fields
      if (!marketplaceId || !credentials) {
        res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: 'Missing required fields: marketplaceId and credentials',
        });
        return;
      }
      
      // Validate marketplace ID
      if (!Object.values(MarketplaceType).includes(marketplaceId as MarketplaceType)) {
        res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: `Invalid marketplaceId. Must be one of: ${Object.values(MarketplaceType).join(', ')}`,
        });
        return;
      }
      
      // Determine marketplace name based on ID
      const marketplaceNames: Record<MarketplaceType, string> = {
        [MarketplaceType.TAKEALOT]: 'Takealot',
        [MarketplaceType.AMAZON]: 'Amazon',
        [MarketplaceType.AMAZON_US]: 'Amazon US',
        [MarketplaceType.AMAZON_UK]: 'Amazon UK',
        [MarketplaceType.AMAZON_EU]: 'Amazon EU',
        [MarketplaceType.SHOPIFY]: 'Shopify',
        [MarketplaceType.XERO]: 'Xero',
      };
      
      const marketplaceName = marketplaceNames[marketplaceId as MarketplaceType];
      
      // Determine authentication type based on credentials
      let authType = AuthenticationType.API_KEY;
      if (credentials.refreshToken) {
        authType = AuthenticationType.OAUTH;
      } else if (credentials.username && credentials.password) {
        authType = AuthenticationType.USERNAME_PASSWORD;
      }
      
      // Create the connection
      const connection = await connectionService.createConnection(
        userId,
        organizationId,
        marketplaceId,
        marketplaceName,
        authType,
        credentials as MarketplaceCredentials,
        metadata
      );
      
      // Return success response without exposing the credential reference
      res.status(StatusCodes.CREATED).json({
        success: true,
        message: 'Connection created successfully',
        data: {
          id: (connection as any)._id,
          marketplaceId: connection.marketplaceId,
          marketplaceName: connection.marketplaceName,
          status: connection.status,
          authenticationType: connection.authenticationType,
          lastChecked: connection.lastChecked,
          metadata: connection.credentialMetadata,
        },
      });
    } catch (error) {
      console.error('Error creating connection:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: `Failed to create connection: ${error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error)}`,
      });
    }
  }

  /**
   * Get a specific connection by ID
   * @param req - Express request
   * @param res - Express response
   */
  public async getConnection(req: Request, res: Response): Promise<void> {
    try {
      const { connectionId } = req.params;
      // @ts-ignore - Auth middleware adds user to request
      const userId = req.user?.id;
      // @ts-ignore - Auth middleware adds organization to request
      const organizationId = req.user?.organizationId;
      
      const connection = await connectionService.getConnectionById(
        connectionId,
        userId,
        organizationId
      );
      
      if (!connection) {
        res.status(StatusCodes.NOT_FOUND).json({
          success: false,
          message: 'Connection not found',
        });
        return;
      }
      
      // Transform for client response (omit credential reference)
      const transformedConnection = {
        id: (connection as any)._id,
        marketplaceId: connection.marketplaceId,
        marketplaceName: connection.marketplaceName,
        status: connection.status,
        authenticationType: connection.authenticationType,
        lastChecked: connection.lastChecked,
        lastSyncedAt: connection.lastSyncedAt,
        lastError: connection.lastError,
        expiresAt: connection.expiresAt,
        createdAt: connection.createdAt,
        updatedAt: connection.updatedAt,
        metadata: connection.credentialMetadata,
      };
      
      res.status(StatusCodes.OK).json({
        success: true,
        data: transformedConnection,
      });
    } catch (error) {
      console.error('Error getting connection:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: `Failed to retrieve connection: ${error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error)}`,
      });
    }
  }

  /**
   * Delete a connection
   * @param req - Express request
   * @param res - Express response
   */
  public async deleteConnection(req: Request, res: Response): Promise<void> {
    try {
      const { connectionId } = req.params;
      // @ts-ignore - Auth middleware adds user to request
      const userId = req.user?.id;
      // @ts-ignore - Auth middleware adds organization to request
      const organizationId = req.user?.organizationId;
      
      const success = await connectionService.deleteConnection(
        connectionId,
        userId,
        organizationId
      );
      
      if (!success) {
        res.status(StatusCodes.NOT_FOUND).json({
          success: false,
          message: 'Connection not found',
        });
        return;
      }
      
      res.status(StatusCodes.OK).json({
        success: true,
        message: 'Connection deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting connection:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: `Failed to delete connection: ${error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error)}`,
      });
    }
  }

  /**
   * Test a connection
   * @param req - Express request
   * @param res - Express response
   */
  public async testConnection(req: Request, res: Response): Promise<void> {
    try {
      const { connectionId } = req.params;
      // @ts-ignore - Auth middleware adds user to request
      const userId = req.user?.id;
      // @ts-ignore - Auth middleware adds organization to request
      const organizationId = req.user?.organizationId;
      
      const result = await connectionService.testConnection(
        connectionId,
        userId,
        organizationId
      );
      
      res.status(StatusCodes.OK).json({
        success: result.success,
        message: result.message,
      });
    } catch (error) {
      console.error('Error testing connection:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: `Failed to test connection: ${error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error)}`,
      });
    }
  }
}

/**
 * Get connection statuses for dashboard widget
 * @param req - Express request
 * @param res - Express response
 */
class ConnectionStatusController {
  public async getConnectionStatuses(req: Request, res: Response): Promise<void> {
    try {
      // @ts-ignore - Auth middleware adds user to request
      const userId = req.user?.id;
      // @ts-ignore - Auth middleware adds organization to request
      const organizationId = req.user?.organizationId;
      
      const connections = await connectionService.getConnections(userId, organizationId);
      
      // Transform for client response
      const statuses = connections.map(conn => {
        // Map SyncStatus to our expected format
        let syncStatus = 'idle';
        if (conn.syncStatus === SyncStatus.IN_PROGRESS) {
          syncStatus = 'syncing';
        } else if (conn.syncStatus === SyncStatus.SUCCESS) {
          syncStatus = 'success';
        } else if (conn.syncStatus === SyncStatus.ERROR) {
          syncStatus = 'error';
        }

        // Calculate a human-readable last sync time
        let lastSyncTime = '';
        if (conn.lastSyncedAt) {
          const now = new Date();
          const diffMs = now.getTime() - conn.lastSyncedAt.getTime();
          const diffMin = Math.floor(diffMs / 60000);
          
          if (diffMin < 1) {
            lastSyncTime = 'just now';
          } else if (diffMin < 60) {
            lastSyncTime = `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
          } else {
            const diffHours = Math.floor(diffMin / 60);
            if (diffHours < 24) {
              lastSyncTime = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
            } else {
              const diffDays = Math.floor(diffHours / 24);
              lastSyncTime = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
            }
          }
        }
        
        return {
          id: (conn as any)._id ? (conn as any)._id.toString() : '',
          marketplaceId: conn.marketplaceId,
          marketplaceName: conn.marketplaceName,
          connectionStatus: conn.status,
          syncStatus: syncStatus,
          lastSyncTimestamp: conn.lastSyncedAt ? conn.lastSyncedAt.toISOString() : null,
          lastSyncTime: lastSyncTime,
          lastError: conn.lastError,
        };
      });
      
      res.status(StatusCodes.OK).json({
        success: true,
        count: statuses.length,
        data: statuses,
      });
    } catch (error) {
      console.error('Error getting connection statuses:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: `Failed to retrieve connection statuses: ${error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error)}`,
      });
    }
  }
}

const connectionController = new ConnectionController();
const connectionStatusController = new ConnectionStatusController();

// Extend the controller with the status controller
Object.assign(connectionController, {
  getConnectionStatuses: connectionStatusController.getConnectionStatuses,
});

export default connectionController;

/**
 * getConnections method placeholder
 */
export const getConnections = async (req, res) => {
  try {
    // TODO: Implement getConnections functionality
    return res.status(200).json({ message: 'getConnections functionality not implemented yet' });
  } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
    console.error('Error in getConnections:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * createConnection method placeholder
 */
export const createConnection = async (req, res) => {
  try {
    // TODO: Implement createConnection functionality
    return res.status(200).json({ message: 'createConnection functionality not implemented yet' });
  } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
    console.error('Error in createConnection:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * getConnection method placeholder
 */
export const getConnection = async (req, res) => {
  try {
    // TODO: Implement getConnection functionality
    return res.status(200).json({ message: 'getConnection functionality not implemented yet' });
  } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
    console.error('Error in getConnection:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * deleteConnection method placeholder
 */
export const deleteConnection = async (req, res) => {
  try {
    // TODO: Implement deleteConnection functionality
    return res.status(200).json({ message: 'deleteConnection functionality not implemented yet' });
  } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
    console.error('Error in deleteConnection:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * testConnection method placeholder
 */
export const testConnection = async (req, res) => {
  try {
    // TODO: Implement testConnection functionality
    return res.status(200).json({ message: 'testConnection functionality not implemented yet' });
  } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
    console.error('Error in testConnection:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * getConnections method placeholder
 */
export const getConnections = async (req, res) => {
  try {
    // TODO: Implement getConnections functionality
    return res.status(200).json({ message: 'getConnections functionality not implemented yet' });
  } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
    console.error('Error in getConnections:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};