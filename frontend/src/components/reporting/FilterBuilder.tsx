import { useEffect, useRef } from 'react';
import {
  Box,
  Text,
  Title,
  Group,
  Card,
  Badge,
  ActionIcon,
  TextInput,
  Grid,
  Select,
  NumberInput,
  MultiSelect,
  Checkbox,
  DatePicker,
  Divider,
  ScrollArea,
  SimpleGrid
} from '@mantine/core';
import { IconPlus, IconTrash, IconSearch, IconFilter } from '@tabler/icons-react';
import { DataSourceField, ReportFilter, FilterOperator, FilterFieldType } from '@/types/reporting';
import { useMotionPreference } from '@/hooks/useMotionPreference';
import gsap from 'gsap';

interface FilterBuilderProps {
  availableFields: DataSourceField[];
  filters: ReportFilter[];
  onAddFilter: (field: DataSourceField) => void;
  onRemoveFilter: (id: string) => void;
  onUpdateFilter: (id: string, updates: Partial<ReportFilter>) => void;
}

export function FilterBuilder({
  availableFields,
  filters,
  onAddFilter,
  onRemoveFilter,
  onUpdateFilter
}: FilterBuilderProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const filtersRef = useRef<HTMLDivElement>(null);
  const availableFieldsRef = useRef<HTMLDivElement>(null);
  const { motionLevel } = useMotionPreference();
  
  // Filter available fields based on search term
  const filteredFields = availableFields.filter(
    field => !filters.some(f => f.field === field.name) && (
      field.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      field.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      field.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );
  
  // Animation effects
  useEffect(() => {
    if (motionLevel === 'minimal') return;
    
    // Animate available fields on mount
    if (availableFieldsRef.current) {
      const fields = availableFieldsRef.current.querySelectorAll('.available-field');
      gsap.fromTo(
        fields,
        { opacity: 0, y: 10 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.3, 
          stagger: 0.03, 
          ease: 'power2.out' 
        }
      );
    }
    
    // Animate filters
    if (filtersRef.current) {
      const filterElements = filtersRef.current.querySelectorAll('.filter-card');
      gsap.fromTo(
        filterElements,
        { opacity: 0, x: -10 },
        { 
          opacity: 1, 
          x: 0, 
          duration: 0.3, 
          stagger: 0.05, 
          ease: 'power2.out' 
        }
      );
    }
  }, [motionLevel]);
  
  // Animate filter add
  const animateAddFilter = (field: DataSourceField) => {
    if (motionLevel === 'minimal') {
      onAddFilter(field);
      return;
    }
    
    // Find the field element
    const fieldElement = availableFieldsRef.current?.querySelector(`[data-field-id="${field.name}"]`);
    
    if (fieldElement) {
      gsap.timeline()
        .to(fieldElement, {
          scale: 1.05,
          duration: 0.2,
          ease: 'power2.out'
        })
        .to(fieldElement, {
          x: 20,
          opacity: 0,
          duration: 0.3,
          ease: 'power2.in',
          onComplete: () => {
            onAddFilter(field);
          }
        });
    } else {
      onAddFilter(field);
    }
  };
  
  // Animate filter remove
  const animateRemoveFilter = (id: string) => {
    if (motionLevel === 'minimal') {
      onRemoveFilter(id);
      return;
    }
    
    // Find the filter element
    const filterElement = filtersRef.current?.querySelector(`[data-filter-id="${id}"]`);
    
    if (filterElement) {
      gsap.to(filterElement, {
        opacity: 0,
        x: -20,
        height: 0,
        marginBottom: 0,
        padding: 0,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
          onRemoveFilter(id);
        }
      });
    } else {
      onRemoveFilter(id);
    }
  };
  
  // Get operator options based on field type
  const getOperatorOptions = (fieldType: FilterFieldType): FilterOperator[] => {
    switch (fieldType) {
      case 'text':
        return ['equals', 'notEquals', 'contains', 'notContains', 'startsWith', 'endsWith', 'in', 'notIn'];
      case 'number':
        return ['equals', 'notEquals', 'greaterThan', 'lessThan', 'between', 'in', 'notIn'];
      case 'date':
        return ['equals', 'notEquals', 'greaterThan', 'lessThan', 'between'];
      case 'boolean':
        return ['equals'];
      case 'select':
      case 'multiSelect':
        return ['equals', 'notEquals', 'in', 'notIn'];
      default:
        return ['equals', 'notEquals'];
    }
  };
  
  // Render filter value input based on field type and operator
  const renderFilterValueInput = (filter: ReportFilter) => {
    const { fieldType, operator, value, options } = filter;
    
    if (operator === 'in' || operator === 'notIn') {
      return (
        <MultiSelect
          label="Values"
          data={options || []}
          value={Array.isArray(value) ? value.map(v => v.toString()) : []}
          onChange={(values) => onUpdateFilter(filter.id, { value: values })}
          searchable
          clearable
          placeholder="Select values"
        />
      );
    }
    
    if (operator === 'between') {
      if (fieldType === 'number') {
        return (
          <Group grow>
            <NumberInput
              label="Min Value"
              value={Array.isArray(value) ? Number(value[0]) : 0}
              onChange={(val) => {
                const newValue = Array.isArray(value) ? 
                  [val, value[1]] : [val, 0];
                onUpdateFilter(filter.id, { value: newValue });
              }}
            />
            <NumberInput
              label="Max Value"
              value={Array.isArray(value) ? Number(value[1]) : 0}
              onChange={(val) => {
                const newValue = Array.isArray(value) ? 
                  [value[0], val] : [0, val];
                onUpdateFilter(filter.id, { value: newValue });
              }}
            />
          </Group>
        );
      }
      
      if (fieldType === 'date') {
        return (
          <Group grow>
            <DatePicker
              label="Start Date"
              value={Array.isArray(value) && value[0] instanceof Date ? value[0] : null}
              onChange={(date) => {
                const newValue = Array.isArray(value) ? 
                  [date, value[1]] : [date, null];
                onUpdateFilter(filter.id, { value: newValue });
              }}
            />
            <DatePicker
              label="End Date"
              value={Array.isArray(value) && value[1] instanceof Date ? value[1] : null}
              onChange={(date) => {
                const newValue = Array.isArray(value) ? 
                  [value[0], date] : [null, date];
                onUpdateFilter(filter.id, { value: newValue });
              }}
            />
          </Group>
        );
      }
    }
    
    switch (fieldType) {
      case 'text':
        return (
          <TextInput
            label="Value"
            value={value as string}
            onChange={(e) => onUpdateFilter(filter.id, { value: e.currentTarget.value })}
          />
        );
      case 'number':
        return (
          <NumberInput
            label="Value"
            value={value as number}
            onChange={(val) => onUpdateFilter(filter.id, { value: val })}
          />
        );
      case 'date':
        return (
          <DatePicker
            label="Value"
            value={value as Date}
            onChange={(date) => onUpdateFilter(filter.id, { value: date })}
          />
        );
      case 'boolean':
        return (
          <Checkbox
            label="Is True"
            checked={value as boolean}
            onChange={(e) => onUpdateFilter(filter.id, { value: e.currentTarget.checked })}
            mt="md"
          />
        );
      case 'select':
        return (
          <Select
            label="Value"
            data={options || []}
            value={value as string}
            onChange={(val) => onUpdateFilter(filter.id, { value: val })}
          />
        );
      default:
        return (
          <TextInput
            label="Value"
            value={value as string}
            onChange={(e) => onUpdateFilter(filter.id, { value: e.currentTarget.value })}
          />
        );
    }
  };

  return (
    <Box>
      <Title order={3} mb="md">Build Filters</Title>
      <Text color="dimmed" mb="lg">
        Add filters to narrow down the data included in your report.
      </Text>
      
      <Grid>
        {/* Selected filters */}
        <Grid.Col span={12} mb="lg">
          <Box>
            <Title order={4} mb="sm">Applied Filters</Title>
            <Card p="md" radius="md" withBorder ref={filtersRef}>
              {filters.length === 0 ? (
                <Text color="dimmed" align="center" py="md">
                  No filters applied. Add filters from the available fields below.
                </Text>
              ) : (
                <SimpleGrid cols={1} spacing="md">
                  {filters.map((filter) => {
                    const field = availableFields.find(f => f.name === filter.field);
                    
                    return (
                      <Card 
                        key={filter.id} 
                        p="md" 
                        radius="md" 
                        withBorder
                        className="filter-card"
                        data-filter-id={filter.id}
                      >
                        <Grid>
                          <Grid.Col span={4}>
                            <TextInput
                              label="Display Label"
                              value={filter.label}
                              onChange={(e) => onUpdateFilter(filter.id, { label: e.currentTarget.value })}
                            />
                          </Grid.Col>
                          <Grid.Col span={3}>
                            <Select
                              label="Operator"
                              value={filter.operator}
                              data={getOperatorOptions(filter.fieldType).map(op => ({
                                value: op,
                                label: op.replace(/([A-Z])/g, ' $1')
                                  .replace(/^./, str => str.toUpperCase())
                              }))}
                              onChange={(value) => onUpdateFilter(filter.id, { 
                                operator: value as FilterOperator 
                              })}
                            />
                          </Grid.Col>
                          <Grid.Col span={5}>
                            {renderFilterValueInput(filter)}
                          </Grid.Col>
                          <Grid.Col span={12} mt="xs">
                            <Group position="apart">
                              <Text size="sm" color="dimmed">
                                Field: <Badge size="sm">{filter.field}</Badge> 
                                <Badge size="sm" ml="xs">{filter.fieldType}</Badge>
                              </Text>
                              <ActionIcon 
                                color="red" 
                                variant="light"
                                onClick={() => animateRemoveFilter(filter.id)}
                              >
                                <IconTrash size={16} />
                              </ActionIcon>
                            </Group>
                          </Grid.Col>
                        </Grid>
                      </Card>
                    );
                  })}
                </SimpleGrid>
              )}
            </Card>
          </Box>
        </Grid.Col>
        
        <Grid.Col span={12}>
          <Divider mb="md" />
          <Title order={4} mb="sm">Available Fields</Title>
          
          <TextInput
            placeholder="Search fields..."
            icon={<IconSearch size={14} />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.currentTarget.value)}
            mb="md"
          />
          
          <ScrollArea h={300} offsetScrollbars>
            <SimpleGrid cols={2} spacing="md" ref={availableFieldsRef}>
              {filteredFields.map((field) => (
                <Card
                  key={field.name}
                  p="sm"
                  radius="md"
                  withBorder
                  className="available-field"
                  data-field-id={field.name}
                  sx={(theme) => ({
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease, background-color 0.2s ease',
                    '&:hover': {
                      backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[0],
                      transform: 'translateY(-2px)'
                    }
                  })}
                  onClick={() => animateAddFilter(field)}
                >
                  <Group position="apart" noWrap>
                    <Box>
                      <Text weight={500}>{field.label}</Text>
                      <Text size="xs" color="dimmed">{field.name}</Text>
                    </Box>
                    <Group spacing={4}>
                      <Badge size="sm" color={field.type === 'date' ? 'green' : field.type === 'number' ? 'blue' : 'gray'}>
                        {field.type}
                      </Badge>
                      <ActionIcon color="blue" variant="light">
                        <IconPlus size={16} />
                      </ActionIcon>
                    </Group>
                  </Group>
                  
                  {field.description && (
                    <Text size="xs" color="dimmed" mt="xs" lineClamp={2}>
                      {field.description}
                    </Text>
                  )}
                </Card>
              ))}
              
              {filteredFields.length === 0 && (
                <Text align="center" color="dimmed" style={{ gridColumn: '1 / -1' }}>
                  No fields found matching your search criteria.
                </Text>
              )}
            </SimpleGrid>
          </ScrollArea>
        </Grid.Col>
      </Grid>
    </Box>
  );
}

// For TypeScript support
import { useState } from 'react';