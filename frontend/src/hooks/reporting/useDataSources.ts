import { useState, useCallback, useMemo } from 'react';
import { DataSource, DataSourceField, ReportCategory } from '@/types/reporting';
import { dataSources } from '@/mocks/reportingData';

export function useDataSources() {
  const [selectedDataSourceId, setSelectedDataSourceId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ReportCategory | null>(null);

  // Get all available data sources
  const allDataSources = useMemo(() => {
    return dataSources;
  }, []);

  // Get filtered data sources
  const filteredDataSources = useMemo(() => {
    let filtered = allDataSources;
    
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(ds => 
        ds.name.toLowerCase().includes(lowerSearchTerm) || 
        ds.description?.toLowerCase().includes(lowerSearchTerm)
      );
    }
    
    if (categoryFilter) {
      filtered = filtered.filter(ds => ds.category === categoryFilter);
    }
    
    return filtered;
  }, [allDataSources, searchTerm, categoryFilter]);

  // Get selected data source
  const selectedDataSource = useMemo(() => {
    if (!selectedDataSourceId) return null;
    return allDataSources.find(ds => ds.id === selectedDataSourceId) || null;
  }, [allDataSources, selectedDataSourceId]);

  // Get available fields from selected data source
  const availableFields = useMemo(() => {
    if (!selectedDataSource) return { metrics: [], dimensions: [] };
    
    const metricFields = selectedDataSource.fields.filter(field => field.isMetric);
    const dimensionFields = selectedDataSource.fields.filter(field => field.isDimension);
    
    return { metrics: metricFields, dimensions: dimensionFields };
  }, [selectedDataSource]);

  // Filter fields by search term
  const filterFields = useCallback((fields: DataSourceField[], search: string) => {
    if (!search) return fields;
    
    const lowerSearch = search.toLowerCase();
    return fields.filter(field => 
      field.name.toLowerCase().includes(lowerSearch) || 
      field.label.toLowerCase().includes(lowerSearch) ||
      field.description?.toLowerCase().includes(lowerSearch)
    );
  }, []);

  // Get unique categories from all data sources
  const availableCategories = useMemo(() => {
    const categories = new Set<ReportCategory>();
    allDataSources.forEach(ds => categories.add(ds.category));
    return Array.from(categories);
  }, [allDataSources]);

  // Reset all filters
  const resetFilters = useCallback(() => {
    setSearchTerm('');
    setCategoryFilter(null);
  }, []);

  return {
    // State
    selectedDataSourceId,
    searchTerm,
    categoryFilter,
    
    // Data
    allDataSources,
    filteredDataSources,
    selectedDataSource,
    availableFields,
    availableCategories,
    
    // Actions
    setSelectedDataSourceId,
    setSearchTerm,
    setCategoryFilter,
    filterFields,
    resetFilters
  };
}