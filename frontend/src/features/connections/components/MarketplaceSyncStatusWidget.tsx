/// <reference path="../../../types/module-declarations.d.ts" />
import { Divider } from '@/utils/chakra-compat';;;
;
import React from 'react';
;
;
;
;
;
;
;
;
;
import { convertChakraProps, withAriaLabel } from '@/utils';

// Mock icons since we don't have the right imports
const CheckCircleIcon = (props: any) => <span {...props}>✓</span>;
const WarningIcon = (props: any) => <span {...props}>⚠</span>;
const RepeatIcon = (props: any) => <span {...props}>↻</span>;
const InfoIcon = (props: any) => <span {...props}>ℹ</span>;
import useConnections from '../hooks/useConnections';
import { ConnectionStatus, SyncStatus, ConnectionStatusResponse } from '../../../api/connections.api';
import { MarketplaceIcon } from '../utils/marketplace-icons';
import { QueryStateHandler } from '@/components/common/QueryStateHandler';
import { AppError, ErrorCategory } from '@/utils/error.utils';
import { captureException } from '@/utils/monitoring.utils';

// Interval to auto-refresh the widget data (30 seconds)
const REFRESH_INTERVAL = 30000;

/**
 * Get color for connection status
 */
const getConnectionStatusColor = (status: ConnectionStatus): string => {
  switch (status) {
    case ConnectionStatus.CONNECTED:
      return 'green';
    case ConnectionStatus.DISCONNECTED:
      return 'red';
    case ConnectionStatus.ERROR:
      return 'red';
    case ConnectionStatus.PENDING:
      return 'yellow';
    case ConnectionStatus.EXPIRED:
      return 'orange';
    default:
      return 'gray';
  }
};

/**
 * Get icon for sync status
 */
const getSyncStatusIcon = (status: string) => {
  switch (status) {
    case SyncStatus.SUCCESS:
      return <CheckCircleIcon color="green.500" />;
    case SyncStatus.ERROR:
      return <WarningIcon color="red.500" />;
    case SyncStatus.SYNCING:
      return <Spinner size="sm" color="blue.500"   />;
    case SyncStatus.IDLE:
      return <InfoIcon color="gray.500" />;
    default:
      return <InfoIcon color="gray.500" />;
  }
};

interface MarketplaceSyncStatusWidgetProps {
  title?: string;
  maxItems?: number;
}

export const MarketplaceSyncStatusWidget: React.FC<MarketplaceSyncStatusWidgetProps> = ({
  title = 'Marketplace Sync Status',
  maxItems = 4,
}) => {
  const { useConnectionStatuses } = useConnections();
  const { 
    data: statuses, 
    loading,
    isFetching, 
    isError, 
    error, 
    refetch 
  } = useConnectionStatuses(REFRESH_INTERVAL);

  const handleRefresh = () => {
    // Log refresh attempt for monitoring
    if (isError && error) {
      captureException(error as unknown as AppError, {
        context: 'MarketplaceSyncStatusWidget',
        action: 'manual-refresh',
      });
    }
    refetch();
  };

  // Custom error component that matches the widget style
  const errorComponent = (
    <Card>
      <CardHeader>
        <Flex justifyContent="space-between" alignItems="center">
          <Heading size="md">{title}</Heading>
          <Button 
            size="sm" 
            onClick={handleRefresh} 
            leftIcon={<RepeatIcon />}
          >
            Retry
          </Button>
        </Flex>
      </CardHeader>
      <CardBody>
        {error && (error as unknown as AppError)?.category === ErrorCategory.API_LIMIT ? (
          <Text color="orange.500">
            Marketplace API rate limit exceeded. Please try again in a few minutes.
          </Text>
        ) : (error as unknown as AppError)?.category === ErrorCategory.NETWORK ? (
          <Text color="red.500">
            Unable to connect to marketplace services. Please check your network connection.
          </Text>
        ) : (
          <Text color="red.500">
            Error loading marketplace statuses. Please try again or contact support if the issue persists.
          </Text>
        )}
      </CardBody>
    </Card>
  );

  // Content that will be displayed when data is loaded successfully
  const content = (
    <Card>
      <CardHeader>
        <Flex justifyContent="space-between" alignItems="center">
          <Heading size="md">{title}</Heading>
          <Button 
            size="sm" 
            onClick={handleRefresh} 
            leftIcon={<RepeatIcon />}
            loading={isFetching}
          >
            Refresh
          </Button>
        </Flex>
      </CardHeader>
      <CardBody>
        {!statuses?.length ? (
          <Text>No marketplace connections found. Connect a marketplace to see status here.</Text>
        ) : (
          <Stack gap={3} divider={<Divider   />}>
            {statuses.slice(0, maxItems).map((status: ConnectionStatusResponse) => (
              <Flex key={status.id} alignItems="center" justifyContent="space-between">
                <Flex alignItems="center" gap={3}>
                  <MarketplaceIcon marketplaceId={status.marketplaceId} boxSize={6} />
                  <Box>
                    <Text fontWeight="medium">{status.marketplaceName}</Text>
                    <Text fontSize="sm" color="gray.500">
                      {status.lastSyncTime ? `Last synced: ${status.lastSyncTime}` : 'Never synced'}
                    </Text>
                  </Box>
                </Flex>
                <Flex alignItems="center" gap={2}>
                  <Badge colorScheme={getConnectionStatusColor(status.connectionStatus)}>
                    {status.connectionStatus}
                  </Badge>
                  <Tooltip label={`Sync status: ${status.syncStatus}`}>
                    {getSyncStatusIcon(status.syncStatus as SyncStatus)}
                  </Tooltip>
                </Flex>
              </Flex>
            ))}
            
            {statuses.length > maxItems && (
              <Text fontSize="sm" textAlign="center">
                +{statuses.length - maxItems} more connections
              </Text>
            )}
          </Stack>
        )}
      </CardBody>
    </Card>
  );

  // Use QueryStateHandler to handle all loading/error states with standardized UI
  return (
    <QueryStateHandler
      isLoading={loading}
      isError={isError}
      error={error}
      isFetching={isFetching}
      onRetry={handleRefresh}
      errorComponent={errorComponent}
      showSpinnerOnFetch={false}
      useSkeleton={true}
      skeletonHeight="200px"
      skeletonLines={5}
    >
      {content}
    </QueryStateHandler>
  );
};

export default MarketplaceSyncStatusWidget;