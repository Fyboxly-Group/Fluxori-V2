import { useState, useCallback } from 'react';

interface useDateRangeProps {}


type DateRange = {
  startDate: Date;
  endDate: Date;
};

type DateRangeOption = {
  label: string;
  value: number; // days
  default?: boolean;
};

type UseDateRangeResult = {
  dateRange: DateRange;
  options: DateRangeOption[];
  selectedOption: number;
  setSelectedOption: (option: number) => void;
  formatDateRange: (dateRange: DateRange) => string;
};

/**
 * Custom hook for handling date range selection
 */
export function useDateRange(): UseDateRangeResult {
  // Default options for date ranges
  const options: DateRangeOption[] = [
    { label: 'Last 24 hours', value: 1 },
    { label: 'Last 7 days', value: 7, default: true },
    { label: 'Last 14 days', value: 14 },
    { label: 'Last 30 days', value: 30 },
    { label: 'Last 90 days', value: 90 },
  ];

  // Find default option
  const defaultOption = options.findIndex(option => option.default) || 0;
  
  // State for selected option
  const [selectedOption, setSelectedOption] = useState<number>(defaultOption);
  
  // Calculate date range based on selected option
  const calculateDateRange = useCallback((): DateRange => {
    const endDate = new Date();
    const days = options[selectedOption]?.value || 7;
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);
    
    // Set time to start/end of day
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
    
    return { startDate, endDate };
  }, [selectedOption, options]);
  
  // Format the date range for display
  const formatDateRange = useCallback((range: DateRange): string => {
    const formatDate = (date: Date): string => {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    };
    
    return `${formatDate(range.startDate)} - ${formatDate(range.endDate)}`;
  }, []);
  
  return {
    dateRange: calculateDateRange(),
    options,
    selectedOption,
    setSelectedOption,
    formatDateRange
  };
}