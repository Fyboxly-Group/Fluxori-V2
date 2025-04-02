import { useRef, useEffect } from 'react';
import { 
  Box, 
  Text, 
  Grid, 
  Card, 
  Group, 
  Title, 
  Badge, 
  TextInput, 
  SimpleGrid, 
  ScrollArea
} from '@mantine/core';
import { DataSource, ReportCategory } from '@/types/reporting';
import { IconSearch, IconDatabase, IconChartBar, IconTruckDelivery, IconShoppingCart } from '@tabler/icons-react';
import { useMotionPreference } from '@/hooks/useMotionPreference';
import gsap from 'gsap';

interface DataSourceSelectorProps {
  availableDataSources: DataSource[];
  selectedDataSourceId: string | null;
  onSelectDataSource: (id: string) => void;
  setReportCategory: (category: string) => void;
}

export function DataSourceSelector({
  availableDataSources,
  selectedDataSourceId,
  onSelectDataSource,
  setReportCategory
}: DataSourceSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const cardsRef = useRef<HTMLDivElement>(null);
  const { motionLevel } = useMotionPreference();
  
  // Filter data sources by search term
  const filteredDataSources = availableDataSources.filter(
    ds => ds.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ds.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Handle data source selection
  const handleSelectDataSource = (dataSource: DataSource) => {
    onSelectDataSource(dataSource.id);
    setReportCategory(dataSource.category);
  };
  
  // Get icon for category
  const getCategoryIcon = (category: ReportCategory) => {
    switch(category) {
      case 'inventory':
        return <IconDatabase size={18} />;
      case 'sales':
        return <IconChartBar size={18} />;
      case 'fulfillment':
        return <IconTruckDelivery size={18} />;
      case 'marketplace':
      case 'buybox':
        return <IconShoppingCart size={18} />;
      default:
        return <IconDatabase size={18} />;
    }
  };
  
  // Animate cards on mount
  useEffect(() => {
    if (cardsRef.current && motionLevel !== 'minimal') {
      const cards = cardsRef.current.querySelectorAll('.data-source-card');
      
      gsap.fromTo(
        cards,
        { 
          opacity: 0, 
          y: 20 
        },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.4, 
          stagger: 0.05, 
          ease: 'power2.out' 
        }
      );
    }
  }, [motionLevel]);
  
  // Animate selected card
  const animateSelectedCard = (cardElement: HTMLElement) => {
    if (motionLevel === 'minimal') return;
    
    gsap.timeline()
      .to(cardElement, { 
        scale: 1.03, 
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)', 
        duration: 0.2, 
        ease: 'power2.out' 
      })
      .to(cardElement, { 
        scale: 1, 
        duration: 0.5, 
        ease: 'elastic.out(1, 0.3)' 
      });
  };

  return (
    <Box>
      <Title order={3} mb="md">Select Data Source</Title>
      <Text color="dimmed" mb="lg">
        Choose the data source that contains the information you want to report on.
      </Text>
      
      <TextInput
        placeholder="Search data sources..."
        icon={<IconSearch size={14} />}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.currentTarget.value)}
        mb="lg"
      />
      
      <ScrollArea h={400} offsetScrollbars>
        <SimpleGrid cols={2} spacing="md" ref={cardsRef}>
          {filteredDataSources.map((dataSource) => (
            <Card
              key={dataSource.id}
              p="md"
              radius="md"
              className="data-source-card"
              withBorder
              sx={(theme) => ({
                cursor: 'pointer',
                borderColor: selectedDataSourceId === dataSource.id 
                  ? theme.colors[theme.primaryColor][5] 
                  : theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[2],
                backgroundColor: selectedDataSourceId === dataSource.id 
                  ? theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0]
                  : 'transparent',
                transition: 'background-color 200ms ease, border-color 200ms ease',
                '&:hover': {
                  backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[0]
                }
              })}
              onClick={(e) => {
                handleSelectDataSource(dataSource);
                if (e.currentTarget) {
                  animateSelectedCard(e.currentTarget);
                }
              }}
            >
              <Group position="apart" mb="xs">
                <Title order={4}>{dataSource.name}</Title>
                <Badge 
                  leftSection={getCategoryIcon(dataSource.category)}
                  variant="filled"
                >
                  {dataSource.category}
                </Badge>
              </Group>
              
              <Text size="sm" color="dimmed" mb="md">
                {dataSource.description}
              </Text>
              
              <Text size="xs" color="dimmed">
                {dataSource.fields.length} available fields • Last updated {
                  dataSource.lastRefreshed 
                    ? new Date(dataSource.lastRefreshed).toLocaleString() 
                    : 'N/A'
                }
              </Text>
            </Card>
          ))}
          
          {filteredDataSources.length === 0 && (
            <Grid.Col span={12}>
              <Text align="center" color="dimmed">
                No data sources found matching your search criteria.
              </Text>
            </Grid.Col>
          )}
        </SimpleGrid>
      </ScrollArea>
    </Box>
  );
}

// For TypeScript support
import { useState } from 'react';