import { ResponsiveValue, GridTemplateColumns, LayoutDirection, ResponsiveSpacing } from '../../../utils/chakra-utils';
import { ResponsiveValue, GridTemplateColumns, LayoutDirection, ResponsiveSpacing } from '../../../utils/chakra-utils';
/**
 * Feedback analytics component for admin dashboard
 */
/// <reference path="../../../types/module-declarations.d.ts" />

import { Divider } from '@/utils/chakra-compat';
import { useColorMode } from '@/components/stubs/ChakraStubs';;;
;;
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
;
import { AlertTriangle, BarChart2 } from 'lucide-react';
import { useFeedback } from '../hooks/useFeedback';
import {
  FeedbackType,
  FeedbackCategory,
  FeedbackSeverity,
  FeedbackStatus
} from '../api/feedback.api';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale,
  LinearScale,
  BarElement,
  Title
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

import { convertChakraProps, withAriaLabel } from '@/utils';

// Register Chart.js components
ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

// Colors for charts
const chartColors = {
  type: {
    [FeedbackType.BUG]: '#F56565',
    [FeedbackType.FEATURE_REQUEST]: '#4299E1',
    [FeedbackType.USABILITY]: '#319795',
    [FeedbackType.PERFORMANCE]: '#ED8936',
    [FeedbackType.GENERAL]: '#A0AEC0'
  },
  severity: {
    [FeedbackSeverity.CRITICAL]: '#E53E3E',
    [FeedbackSeverity.HIGH]: '#DD6B20',
    [FeedbackSeverity.MEDIUM]: '#D69E2E',
    [FeedbackSeverity.LOW]: '#38A169'
  },
  status: {
    [FeedbackStatus.NEW]: '#A0AEC0',
    [FeedbackStatus.UNDER_REVIEW]: '#805AD5',
    [FeedbackStatus.IN_PROGRESS]: '#4299E1',
    [FeedbackStatus.COMPLETED]: '#38A169',
    [FeedbackStatus.DECLINED]: '#F56565',
    [FeedbackStatus.PLANNED]: '#319795'
  }
};

interface FeedbackAnalyticsProps {
  organizationId?: string;
}

export const FeedbackAnalytics: React.FC<FeedbackAnalyticsProps> = ({ organizationId }) => {
  const { getFeedbackAnalytics } = useFeedback();
  const { data, loading, isError } = getFeedbackAnalytics(organizationId);
  
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  if (loading) {
    return (
      <Flex justify="center" align="center" h="200px">
        <Spinner size="lg"   />
      </Flex>
    );
  }
  
  if (isError || !data) {
    return (
      <Flex 
        justify="center" 
        align="center" 
        h="200px" 
        direction="column"
        color="red.500"
      >
        <AlertTriangle size={40} strokeWidth={1.5} />
        <Text mt={2}>Error loading analytics</Text>
      </Flex>
    );
  }
  
  // Prepare chart data
  const typeChartData = {
    labels: Object.keys(data.byType).map(type => 
      type.replace('_', ' ')
    ),
    datasets: [
      {
        data: Object.values(data.byType),
        backgroundColor: Object.keys(data.byType).map(type => 
          chartColors.type[type as FeedbackType] || '#A0AEC0'
        )
      }
    ]
  };
  
  const severityChartData = {
    labels: Object.keys(data.bySeverity).map(severity => 
      severity.charAt(0).toUpperCase() + severity.slice(1)
    ),
    datasets: [
      {
        data: Object.values(data.bySeverity),
        backgroundColor: Object.keys(data.bySeverity).map(severity => 
          chartColors.severity[severity as FeedbackSeverity] || '#A0AEC0'
        )
      }
    ]
  };
  
  const statusChartData = {
    labels: Object.keys(data.byStatus).map(status => 
      status.replace('_', ' ')
    ),
    datasets: [
      {
        label: 'Feedback Count',
        data: Object.values(data.byStatus),
        backgroundColor: Object.keys(data.byStatus).map(status => 
          chartColors.status[status as FeedbackStatus] || '#A0AEC0'
        )
      }
    ]
  };
  
  const categoryChartData = {
    labels: Object.keys(data.byCategory).map(category => 
      category.replace('_', ' ')
    ),
    datasets: [
      {
        label: 'By Category',
        data: Object.values(data.byCategory),
        backgroundColor: 'rgba(66, 153, 225, 0.6)',
        borderColor: 'rgba(66, 153, 225, 1)',
        borderWidth: 1
      }
    ]
  };
  
  // Chart options
  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          boxWidth: 15,
          padding: 10
        }
      }
    }
  };
  
  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0
        }
      }
    }
  };
  
  return (
    <Box>
      <Flex justify="space-between" align="center" mb={4}>
        <Heading size="md">Feedback Analytics</Heading>
      </Flex>
      
      <StatGroup 
        mb={6} 
        p={4} 
        bg={bgColor} 
        borderRadius="md" 
        boxShadow="sm" 
        border="1px" 
        borderColor={borderColor}
      >
        <Stat>
          <StatLabel>Total Feedback</StatLabel>
          <StatNumber>{data.total}</StatNumber>
        </Stat>
        
        <Stat>
          <StatLabel>Open Items</StatLabel>
          <StatNumber>
            {(data.byStatus[FeedbackStatus.NEW] || 0) + 
             (data.byStatus[FeedbackStatus.UNDER_REVIEW] || 0) + 
             (data.byStatus[FeedbackStatus.IN_PROGRESS] || 0)}
          </StatNumber>
        </Stat>
        
        <Stat>
          <StatLabel>Bugs</StatLabel>
          <StatNumber>{data.byType[FeedbackType.BUG] || 0}</StatNumber>
        </Stat>
        
        <Stat>
          <StatLabel>Feature Requests</StatLabel>
          <StatNumber>{data.byType[FeedbackType.FEATURE_REQUEST] || 0}</StatNumber>
        </Stat>
      </StatGroup>
      
      <Grid 
        templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" } as ResponsiveValue<string>}
        gap={6}
      >
        <Box 
          p={4} 
          bg={bgColor} 
          borderRadius="md" 
          boxShadow="sm" 
          border="1px" 
          borderColor={borderColor}
          height="300px"
        >
          <Heading size="sm" mb={4}>Feedback by Type</Heading>
          <Box height="calc(100% - 40px)">
            <Pie data={typeChartData} options={pieOptions} />
          </Box>
        </Box>
        
        <Box 
          p={4} 
          bg={bgColor} 
          borderRadius="md" 
          boxShadow="sm" 
          border="1px" 
          borderColor={borderColor}
          height="300px"
        >
          <Heading size="sm" mb={4}>Feedback by Severity</Heading>
          <Box height="calc(100% - 40px)">
            <Pie data={severityChartData} options={pieOptions} />
          </Box>
        </Box>
        
        <Box 
          p={4} 
          bg={bgColor} 
          borderRadius="md" 
          boxShadow="sm" 
          border="1px" 
          borderColor={borderColor}
          height="300px"
        >
          <Heading size="sm" mb={4}>Feedback by Status</Heading>
          <Box height="calc(100% - 40px)">
            <Bar data={statusChartData} options={barOptions} />
          </Box>
        </Box>
        
        <Box 
          p={4} 
          bg={bgColor} 
          borderRadius="md" 
          boxShadow="sm" 
          border="1px" 
          borderColor={borderColor}
          height="300px"
        >
          <Heading size="sm" mb={4}>Feedback by Category</Heading>
          <Box height="calc(100% - 40px)">
            <Bar data={categoryChartData} options={barOptions} />
          </Box>
        </Box>
      </Grid>
      
      <Box 
        mt={6}
        p={4} 
        bg={bgColor} 
        borderRadius="md" 
        boxShadow="sm" 
        border="1px" 
        borderColor={borderColor}
      >
        <Heading size="sm" mb={4}>Key Insights</Heading>
        <VStack align="start" gap={3}>
          {data.byType[FeedbackType.BUG] > 0 && (
            <HStack>
              <Badge colorScheme="red">Bugs</Badge>
              <Text>
                {data.byType[FeedbackType.BUG]} bug {data.byType[FeedbackType.BUG] === 1 ? 'report' : 'reports'} submitted
              </Text>
            </HStack>
          )}
          
          {(data.bySeverity[FeedbackSeverity.CRITICAL] > 0 || data.bySeverity[FeedbackSeverity.HIGH] > 0) && (
            <HStack>
              <Badge colorScheme="orange">High Priority</Badge>
              <Text>
                {(data.bySeverity[FeedbackSeverity.CRITICAL] || 0) + (data.bySeverity[FeedbackSeverity.HIGH] || 0)} high priority items require attention
              </Text>
            </HStack>
          )}
          
          {data.byStatus[FeedbackStatus.NEW] > 0 && (
            <HStack>
              <Badge colorScheme="blue">New</Badge>
              <Text>
                {data.byStatus[FeedbackStatus.NEW]} new {data.byStatus[FeedbackStatus.NEW] === 1 ? 'item' : 'items'} waiting for review
              </Text>
            </HStack>
          )}
          
          {data.byType[FeedbackType.FEATURE_REQUEST] > 0 && (
            <HStack>
              <Badge colorScheme="green">Features</Badge>
              <Text>
                {data.byType[FeedbackType.FEATURE_REQUEST]} feature {data.byType[FeedbackType.FEATURE_REQUEST] === 1 ? 'request' : 'requests'} from users
              </Text>
            </HStack>
          )}
          
          <Divider my={2}   />
          
          <Text fontSize="sm" color="gray.600">
            {data.total === 0 
              ? 'No feedback data available yet.'
              : `Total of ${data.total} feedback items collected. ${Math.round((data.byStatus[FeedbackStatus.COMPLETED] || 0) / data.total * 100) || 0}% of issues resolved.`
            }
          </Text>
        </VStack>
      </Box>
    </Box>
  );
};