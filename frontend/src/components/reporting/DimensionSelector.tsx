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
  Switch,
  Select,
  Divider,
  ScrollArea,
  SimpleGrid
} from '@mantine/core';
import { IconPlus, IconTrash, IconSearch, IconArrowsSort } from '@tabler/icons-react';
import { DataSourceField, ReportDimension } from '@/types/reporting';
import { useMotionPreference } from '@/hooks/useMotionPreference';
import gsap from 'gsap';

interface DimensionSelectorProps {
  availableDimensions: DataSourceField[];
  selectedDimensions: ReportDimension[];
  onAddDimension: (field: DataSourceField) => void;
  onRemoveDimension: (id: string) => void;
  onUpdateDimension: (id: string, updates: Partial<ReportDimension>) => void;
}

export function DimensionSelector({
  availableDimensions,
  selectedDimensions,
  onAddDimension,
  onRemoveDimension,
  onUpdateDimension
}: DimensionSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const selectedDimensionsRef = useRef<HTMLDivElement>(null);
  const availableDimensionsRef = useRef<HTMLDivElement>(null);
  const { motionLevel } = useMotionPreference();
  
  // Filter available dimensions based on search term
  const filteredDimensions = availableDimensions.filter(
    dimension => !selectedDimensions.some(d => d.field === dimension.name) && (
      dimension.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dimension.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dimension.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );
  
  // Animation effects
  useEffect(() => {
    if (motionLevel === 'minimal') return;
    
    // Animate available dimensions on mount
    if (availableDimensionsRef.current) {
      const dimensions = availableDimensionsRef.current.querySelectorAll('.available-dimension');
      gsap.fromTo(
        dimensions,
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
    
    // Animate selected dimensions
    if (selectedDimensionsRef.current) {
      const dimensions = selectedDimensionsRef.current.querySelectorAll('.selected-dimension');
      gsap.fromTo(
        dimensions,
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
  
  // Animate dimension add
  const animateAddDimension = (dimension: DataSourceField) => {
    if (motionLevel === 'minimal') {
      onAddDimension(dimension);
      return;
    }
    
    // Find the dimension element
    const dimensionElement = availableDimensionsRef.current?.querySelector(`[data-dimension-id="${dimension.name}"]`);
    
    if (dimensionElement) {
      gsap.timeline()
        .to(dimensionElement, {
          scale: 1.05,
          duration: 0.2,
          ease: 'power2.out'
        })
        .to(dimensionElement, {
          x: 20,
          opacity: 0,
          duration: 0.3,
          ease: 'power2.in',
          onComplete: () => {
            onAddDimension(dimension);
          }
        });
    } else {
      onAddDimension(dimension);
    }
  };
  
  // Animate dimension remove
  const animateRemoveDimension = (id: string) => {
    if (motionLevel === 'minimal') {
      onRemoveDimension(id);
      return;
    }
    
    // Find the dimension element
    const dimensionElement = selectedDimensionsRef.current?.querySelector(`[data-dimension-id="${id}"]`);
    
    if (dimensionElement) {
      gsap.to(dimensionElement, {
        opacity: 0,
        x: -20,
        height: 0,
        marginBottom: 0,
        padding: 0,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
          onRemoveDimension(id);
        }
      });
    } else {
      onRemoveDimension(id);
    }
  };

  return (
    <Box>
      <Title order={3} mb="md">Select Dimensions</Title>
      <Text color="dimmed" mb="lg">
        Choose the dimensions to group your data by. Dimensions are typically categorical values like dates, categories, or regions.
      </Text>
      
      <Grid>
        {/* Selected dimensions */}
        <Grid.Col span={12} mb="lg">
          <Box>
            <Title order={4} mb="sm">Selected Dimensions</Title>
            <Card p="md" radius="md" withBorder ref={selectedDimensionsRef}>
              {selectedDimensions.length === 0 ? (
                <Text color="dimmed" align="center" py="md">
                  No dimensions selected. Add dimensions from the list below.
                </Text>
              ) : (
                <SimpleGrid cols={1} spacing="md">
                  {selectedDimensions.map((dimension) => (
                    <Card 
                      key={dimension.id} 
                      p="md" 
                      radius="md" 
                      withBorder
                      className="selected-dimension"
                      data-dimension-id={dimension.id}
                    >
                      <Grid>
                        <Grid.Col span={5}>
                          <TextInput
                            label="Display Label"
                            value={dimension.label}
                            onChange={(e) => onUpdateDimension(dimension.id, { label: e.currentTarget.value })}
                          />
                        </Grid.Col>
                        <Grid.Col span={4}>
                          <Select
                            label="Sort Order"
                            value={dimension.sortOrder || ''}
                            data={[
                              { value: '', label: 'No Sorting' },
                              { value: 'asc', label: 'Ascending' },
                              { value: 'desc', label: 'Descending' }
                            ]}
                            onChange={(value) => onUpdateDimension(dimension.id, { 
                              sortOrder: (value as 'asc' | 'desc' | undefined) || undefined 
                            })}
                          />
                        </Grid.Col>
                        <Grid.Col span={3}>
                          <Box mt="xl">
                            <Switch
                              label="Group By"
                              checked={dimension.groupBy || false}
                              onChange={(e) => onUpdateDimension(dimension.id, { groupBy: e.currentTarget.checked })}
                            />
                          </Box>
                        </Grid.Col>
                        <Grid.Col span={12} mt="xs">
                          <Group position="apart">
                            <Text size="sm" color="dimmed">
                              Field: <Badge size="sm">{dimension.field}</Badge>
                            </Text>
                            <ActionIcon 
                              color="red" 
                              variant="light"
                              onClick={() => animateRemoveDimension(dimension.id)}
                            >
                              <IconTrash size={16} />
                            </ActionIcon>
                          </Group>
                        </Grid.Col>
                      </Grid>
                    </Card>
                  ))}
                </SimpleGrid>
              )}
            </Card>
          </Box>
        </Grid.Col>
        
        <Grid.Col span={12}>
          <Divider mb="md" />
          <Title order={4} mb="sm">Available Dimensions</Title>
          
          <TextInput
            placeholder="Search dimensions..."
            icon={<IconSearch size={14} />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.currentTarget.value)}
            mb="md"
          />
          
          <ScrollArea h={300} offsetScrollbars>
            <SimpleGrid cols={2} spacing="md" ref={availableDimensionsRef}>
              {filteredDimensions.map((dimension) => (
                <Card
                  key={dimension.name}
                  p="sm"
                  radius="md"
                  withBorder
                  className="available-dimension"
                  data-dimension-id={dimension.name}
                  sx={(theme) => ({
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease, background-color 0.2s ease',
                    '&:hover': {
                      backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[0],
                      transform: 'translateY(-2px)'
                    }
                  })}
                  onClick={() => animateAddDimension(dimension)}
                >
                  <Group position="apart" noWrap>
                    <Box>
                      <Text weight={500}>{dimension.label}</Text>
                      <Text size="xs" color="dimmed">{dimension.name}</Text>
                    </Box>
                    <Group spacing={4}>
                      <Badge size="sm" color={dimension.type === 'date' ? 'green' : 'blue'}>
                        {dimension.type}
                      </Badge>
                      <ActionIcon color="blue" variant="light">
                        <IconPlus size={16} />
                      </ActionIcon>
                    </Group>
                  </Group>
                  
                  {dimension.description && (
                    <Text size="xs" color="dimmed" mt="xs" lineClamp={2}>
                      {dimension.description}
                    </Text>
                  )}
                </Card>
              ))}
              
              {filteredDimensions.length === 0 && (
                <Text align="center" color="dimmed" style={{ gridColumn: '1 / -1' }}>
                  No dimensions found matching your search criteria.
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