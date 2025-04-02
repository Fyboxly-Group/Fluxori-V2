import { useEffect, useRef, useState } from 'react';
import {
  Box,
  Text,
  Title,
  Group,
  Button,
  Card,
  Grid,
  Tabs,
  SimpleGrid,
  Badge,
  ActionIcon,
  Menu,
  TextInput,
  Select,
  Tooltip,
  ScrollArea,
} from '@mantine/core';
import {
  IconPlus,
  IconSearch,
  IconFilter,
  IconDots,
  IconEdit,
  IconTrash,
  IconCopy,
  IconDownload,
  IconClock,
  IconStar,
  IconStarFilled,
  IconChartBar,
  IconChartLine,
  IconChartPie,
  IconTable,
  IconLayoutDashboard,
  IconReportAnalytics,
  IconHistory,
  IconCalendarTime,
  IconTimeline
} from '@tabler/icons-react';
import { savedReports, reportTemplates, scheduledReports, reportHistory, dashboards } from '@/mocks/reportingData';
import { ReportCategory, SavedReport, ReportTemplate, ScheduledReport, ReportHistoryItem, Dashboard } from '@/types/reporting';
import { useMotionPreference } from '@/hooks/useMotionPreference';
import { DashboardPreview } from './DashboardPreview';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';

export default function ReportingDashboard() {
  const [activeTab, setActiveTab] = useState<string | null>('reports');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ReportCategory | null>(null);
  const [selectedReport, setSelectedReport] = useState<SavedReport | null>(null);
  const [selectedDashboard, setSelectedDashboard] = useState<Dashboard | null>(null);
  const reportsRef = useRef<HTMLDivElement>(null);
  const templatesRef = useRef<HTMLDivElement>(null);
  const scheduledRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);
  const dashboardsRef = useRef<HTMLDivElement>(null);
  const { motionLevel } = useMotionPreference();
  const router = useRouter();
  
  // Get all available categories
  const categories = Array.from(
    new Set([
      ...savedReports.map(r => r.category),
      ...reportTemplates.map(t => t.category)
    ])
  );
  
  // Filter reports based on search term and category
  const filteredReports = savedReports.filter(report => {
    const matchesSearch = 
      searchTerm === '' || 
      report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesCategory = 
      categoryFilter === null || 
      report.category === categoryFilter;
      
    return matchesSearch && matchesCategory;
  });
  
  // Filter templates based on search term and category
  const filteredTemplates = reportTemplates.filter(template => {
    const matchesSearch = 
      searchTerm === '' || 
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesCategory = 
      categoryFilter === null || 
      template.category === categoryFilter;
      
    return matchesSearch && matchesCategory;
  });
  
  // Filter dashboards based on search term
  const filteredDashboards = dashboards.filter(dashboard => {
    return searchTerm === '' || 
      dashboard.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dashboard.description?.toLowerCase().includes(searchTerm.toLowerCase());
  });
  
  // Format date for display
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Get icon for category
  const getCategoryIcon = (category: ReportCategory) => {
    switch(category) {
      case 'inventory':
        return <IconReportAnalytics size={14} />;
      case 'sales':
        return <IconChartBar size={14} />;
      case 'fulfillment':
        return <IconTimeline size={14} />;
      case 'marketplace':
      case 'buybox':
        return <IconLayoutDashboard size={14} />;
      default:
        return <IconReportAnalytics size={14} />;
    }
  };
  
  // Get icon for report chart type
  const getChartTypeIcon = (chartType: string) => {
    switch(chartType) {
      case 'bar': return <IconChartBar size={14} />;
      case 'line': return <IconChartLine size={14} />;
      case 'pie': return <IconChartPie size={14} />;
      case 'table': return <IconTable size={14} />;
      default: return <IconChartBar size={14} />;
    }
  };
  
  // Animate items when tab changes
  useEffect(() => {
    if (motionLevel === 'minimal') return;
    
    const animateItems = (container: HTMLDivElement | null, selector: string) => {
      if (!container) return;
      
      const items = container.querySelectorAll(selector);
      
      gsap.fromTo(
        items,
        { opacity: 0, y: 20 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.4, 
          stagger: 0.05, 
          ease: 'power2.out' 
        }
      );
    };
    
    // Animate based on active tab
    switch(activeTab) {
      case 'reports':
        animateItems(reportsRef.current, '.report-card');
        break;
      case 'templates':
        animateItems(templatesRef.current, '.template-card');
        break;
      case 'scheduled':
        animateItems(scheduledRef.current, '.scheduled-card');
        break;
      case 'history':
        animateItems(historyRef.current, '.history-item');
        break;
      case 'dashboards':
        animateItems(dashboardsRef.current, '.dashboard-card');
        break;
    }
  }, [activeTab, searchTerm, categoryFilter, motionLevel]);
  
  // Create a new report
  const handleCreateReport = () => {
    router.push('/reports/builder');
  };
  
  // Use a report template
  const handleUseTemplate = (template: ReportTemplate) => {
    // In a real app, this would navigate to the report builder with the template
    router.push('/reports/builder');
  };

  return (
    <Box p="md">
      <Group position="apart" mb="lg">
        <Title>Reporting Dashboard</Title>
        <Button 
          leftIcon={<IconPlus size={16} />}
          onClick={handleCreateReport}
        >
          Create Report
        </Button>
      </Group>
      
      <Tabs value={activeTab} onTabChange={setActiveTab} mb="lg">
        <Tabs.List>
          <Tabs.Tab value="reports" icon={<IconReportAnalytics size={16} />}>Reports</Tabs.Tab>
          <Tabs.Tab value="templates" icon={<IconCopy size={16} />}>Templates</Tabs.Tab>
          <Tabs.Tab value="scheduled" icon={<IconCalendarTime size={16} />}>Scheduled</Tabs.Tab>
          <Tabs.Tab value="history" icon={<IconHistory size={16} />}>History</Tabs.Tab>
          <Tabs.Tab value="dashboards" icon={<IconLayoutDashboard size={16} />}>Dashboards</Tabs.Tab>
        </Tabs.List>
      </Tabs>
      
      <Grid mb="lg">
        <Grid.Col span={6}>
          <TextInput
            placeholder="Search reports..."
            icon={<IconSearch size={16} />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.currentTarget.value)}
          />
        </Grid.Col>
        
        {(activeTab === 'reports' || activeTab === 'templates') && (
          <Grid.Col span={6}>
            <Select
              placeholder="Filter by category"
              icon={<IconFilter size={16} />}
              value={categoryFilter}
              onChange={(value) => setCategoryFilter(value as ReportCategory)}
              data={[
                { value: '', label: 'All Categories' },
                ...categories.map(category => ({
                  value: category,
                  label: category.charAt(0).toUpperCase() + category.slice(1)
                }))
              ]}
              clearable
            />
          </Grid.Col>
        )}
      </Grid>
      
      <Grid>
        <Grid.Col span={selectedReport || selectedDashboard ? 8 : 12}>
          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <Box ref={reportsRef}>
              {filteredReports.length === 0 ? (
                <Card p="xl" radius="md" withBorder>
                  <Text align="center" color="dimmed">
                    No reports found. Try adjusting your filters or create a new report.
                  </Text>
                </Card>
              ) : (
                <SimpleGrid cols={2} spacing="md">
                  {filteredReports.map((report) => (
                    <Card
                      key={report.id}
                      p="md"
                      radius="md"
                      withBorder
                      className="report-card"
                      sx={(theme) => ({
                        cursor: 'pointer',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                        border: selectedReport?.id === report.id 
                          ? `2px solid ${theme.colors[theme.primaryColor][5]}` 
                          : undefined,
                        '&:hover': {
                          transform: 'translateY(-3px)',
                          boxShadow: theme.shadows.md
                        }
                      })}
                      onClick={() => setSelectedReport(report)}
                    >
                      <Group position="apart" mb="xs" noWrap>
                        <Box>
                          <Group spacing={6}>
                            <Title order={4}>{report.name}</Title>
                            {report.favorited && (
                              <IconStarFilled size={16} color="#FFD700" style={{ marginTop: 4 }} />
                            )}
                          </Group>
                          <Text size="xs" color="dimmed">
                            Created {formatDate(report.createdAt)}
                          </Text>
                        </Box>
                        <Menu withinPortal position="bottom-end" shadow="md">
                          <Menu.Target>
                            <ActionIcon>
                              <IconDots size={16} />
                            </ActionIcon>
                          </Menu.Target>
                          <Menu.Dropdown>
                            <Menu.Item icon={<IconEdit size={14} />}>Edit</Menu.Item>
                            <Menu.Item icon={<IconCopy size={14} />}>Duplicate</Menu.Item>
                            <Menu.Item icon={<IconDownload size={14} />}>Export</Menu.Item>
                            <Menu.Item icon={report.favorited ? <IconStar size={14} /> : <IconStarFilled size={14} />}>
                              {report.favorited ? 'Remove from Favorites' : 'Add to Favorites'}
                            </Menu.Item>
                            <Menu.Divider />
                            <Menu.Item color="red" icon={<IconTrash size={14} />}>Delete</Menu.Item>
                          </Menu.Dropdown>
                        </Menu>
                      </Group>
                      
                      {report.description && (
                        <Text size="sm" color="dimmed" lineClamp={2} mb="sm">
                          {report.description}
                        </Text>
                      )}
                      
                      <Group position="apart" mt="md">
                        <Badge 
                          leftSection={getCategoryIcon(report.category)}
                          size="sm"
                        >
                          {report.category}
                        </Badge>
                        <Badge 
                          leftSection={getChartTypeIcon(report.configuration.chartType)}
                          size="sm"
                          color="blue"
                        >
                          {report.configuration.chartType}
                        </Badge>
                      </Group>
                      
                      <Group position="apart" mt="md">
                        <Text size="xs" color="dimmed">
                          <IconClock size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                          Last generated: {report.lastGeneratedAt ? formatDate(report.lastGeneratedAt) : 'Never'}
                        </Text>
                        <Text size="xs" color="dimmed">
                          Views: {report.timesViewed}
                        </Text>
                      </Group>
                    </Card>
                  ))}
                </SimpleGrid>
              )}
            </Box>
          )}
          
          {/* Templates Tab */}
          {activeTab === 'templates' && (
            <Box ref={templatesRef}>
              {filteredTemplates.length === 0 ? (
                <Card p="xl" radius="md" withBorder>
                  <Text align="center" color="dimmed">
                    No templates found. Try adjusting your filters.
                  </Text>
                </Card>
              ) : (
                <SimpleGrid cols={2} spacing="md">
                  {filteredTemplates.map((template) => (
                    <Card
                      key={template.id}
                      p="md"
                      radius="md"
                      withBorder
                      className="template-card"
                      sx={(theme) => ({
                        cursor: 'pointer',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                        '&:hover': {
                          transform: 'translateY(-3px)',
                          boxShadow: theme.shadows.md
                        }
                      })}
                      onClick={() => handleUseTemplate(template)}
                    >
                      <Group position="apart" mb="xs" noWrap>
                        <Title order={4}>{template.name}</Title>
                        <Badge size="sm" variant="outline">Template</Badge>
                      </Group>
                      
                      {template.description && (
                        <Text size="sm" color="dimmed" lineClamp={2} mb="sm">
                          {template.description}
                        </Text>
                      )}
                      
                      <Group position="apart" mt="md">
                        <Badge 
                          leftSection={getCategoryIcon(template.category)}
                          size="sm"
                        >
                          {template.category}
                        </Badge>
                        <Badge 
                          leftSection={getChartTypeIcon(template.configuration.chartType)}
                          size="sm"
                          color="blue"
                        >
                          {template.configuration.chartType}
                        </Badge>
                      </Group>
                      
                      <Group position="right" mt="md">
                        <Button 
                          variant="light" 
                          size="xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUseTemplate(template);
                          }}
                        >
                          Use Template
                        </Button>
                      </Group>
                    </Card>
                  ))}
                </SimpleGrid>
              )}
            </Box>
          )}
          
          {/* Scheduled Tab */}
          {activeTab === 'scheduled' && (
            <Box ref={scheduledRef}>
              {scheduledReports.length === 0 ? (
                <Card p="xl" radius="md" withBorder>
                  <Text align="center" color="dimmed">
                    No scheduled reports found.
                  </Text>
                </Card>
              ) : (
                <SimpleGrid cols={2} spacing="md">
                  {scheduledReports.map((schedule) => (
                    <Card
                      key={schedule.id}
                      p="md"
                      radius="md"
                      withBorder
                      className="scheduled-card"
                      sx={(theme) => ({
                        borderLeft: `4px solid ${
                          schedule.status === 'active' ? theme.colors.green[6] :
                          schedule.status === 'paused' ? theme.colors.yellow[6] :
                          theme.colors.red[6]
                        }`
                      })}
                    >
                      <Group position="apart" mb="xs" noWrap>
                        <Box>
                          <Title order={4}>{schedule.reportName}</Title>
                          <Badge
                            size="sm"
                            color={
                              schedule.status === 'active' ? 'green' :
                              schedule.status === 'paused' ? 'yellow' : 'red'
                            }
                          >
                            {schedule.status}
                          </Badge>
                        </Box>
                        <Menu withinPortal position="bottom-end" shadow="md">
                          <Menu.Target>
                            <ActionIcon>
                              <IconDots size={16} />
                            </ActionIcon>
                          </Menu.Target>
                          <Menu.Dropdown>
                            <Menu.Item icon={<IconEdit size={14} />}>Edit Schedule</Menu.Item>
                            {schedule.status === 'active' ? (
                              <Menu.Item icon={<IconClock size={14} />}>Pause Schedule</Menu.Item>
                            ) : (
                              <Menu.Item icon={<IconClock size={14} />}>Resume Schedule</Menu.Item>
                            )}
                            <Menu.Divider />
                            <Menu.Item color="red" icon={<IconTrash size={14} />}>Delete Schedule</Menu.Item>
                          </Menu.Dropdown>
                        </Menu>
                      </Group>
                      
                      <Text size="sm" mb="md">
                        <Text span weight={500}>Frequency:</Text> {schedule.schedule.frequency}
                        {schedule.schedule.frequency === 'weekly' && schedule.schedule.dayOfWeek !== undefined && (
                          ` (${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][schedule.schedule.dayOfWeek]})`
                        )}
                        {schedule.schedule.frequency === 'monthly' && schedule.schedule.dayOfMonth !== undefined && (
                          ` (Day ${schedule.schedule.dayOfMonth})`
                        )}
                        {schedule.schedule.time && ` at ${schedule.schedule.time}`}
                      </Text>
                      
                      <Grid>
                        <Grid.Col span={6}>
                          <Text size="xs" color="dimmed">
                            Last Run: {schedule.lastRunAt ? formatDate(schedule.lastRunAt) : 'Never'}
                          </Text>
                        </Grid.Col>
                        <Grid.Col span={6}>
                          <Text size="xs" color="dimmed">
                            Next Run: {schedule.nextRunAt ? formatDate(schedule.nextRunAt) : 'Not scheduled'}
                          </Text>
                        </Grid.Col>
                        <Grid.Col span={12}>
                          <Text size="xs" color="dimmed">
                            Delivery: {schedule.schedule.deliveryMethod} ({schedule.schedule.exportFormat})
                          </Text>
                        </Grid.Col>
                        {schedule.schedule.recipients && schedule.schedule.recipients.length > 0 && (
                          <Grid.Col span={12}>
                            <Text size="xs" color="dimmed">
                              Recipients: {schedule.schedule.recipients.join(', ')}
                            </Text>
                          </Grid.Col>
                        )}
                        {schedule.errorMessage && (
                          <Grid.Col span={12}>
                            <Text size="xs" color="red">
                              Error: {schedule.errorMessage}
                            </Text>
                          </Grid.Col>
                        )}
                      </Grid>
                    </Card>
                  ))}
                </SimpleGrid>
              )}
            </Box>
          )}
          
          {/* History Tab */}
          {activeTab === 'history' && (
            <Card p="md" radius="md" withBorder ref={historyRef}>
              {reportHistory.length === 0 ? (
                <Text align="center" color="dimmed">
                  No report history found.
                </Text>
              ) : (
                <ScrollArea h={500}>
                  {reportHistory.map((history) => (
                    <Box
                      key={history.id}
                      p="md"
                      mb="md"
                      className="history-item"
                      sx={(theme) => ({
                        borderBottom: `1px solid ${
                          theme.colorScheme === 'dark' ? 
                          theme.colors.dark[5] : 
                          theme.colors.gray[2]
                        }`
                      })}
                    >
                      <Group position="apart" mb="xs" noWrap>
                        <Box>
                          <Title order={5}>{history.reportName}</Title>
                          <Text size="xs" color="dimmed">
                            Generated on {formatDate(history.generatedAt)} by {
                              history.generatedBy === 'scheduler' ? 'Scheduler' : 'User'
                            }
                          </Text>
                        </Box>
                        <Badge 
                          color={history.deliveryStatus === 'success' ? 'green' : 'red'}
                          size="sm"
                        >
                          {history.deliveryStatus}
                        </Badge>
                      </Group>
                      
                      <Group mt="md">
                        <Text size="xs" color="dimmed">
                          Format: {history.exportFormat?.toUpperCase()}
                        </Text>
                        <Text size="xs" color="dimmed">
                          Delivery: {history.deliveryMethod}
                        </Text>
                        {history.fileSize && (
                          <Text size="xs" color="dimmed">
                            Size: {(history.fileSize / 1024).toFixed(1)} KB
                          </Text>
                        )}
                        <Text size="xs" color="dimmed">
                          Processing Time: {history.processingTimeMs}ms
                        </Text>
                      </Group>
                      
                      {history.deliveryStatus === 'error' && history.errorMessage && (
                        <Text size="xs" color="red" mt="xs">
                          Error: {history.errorMessage}
                        </Text>
                      )}
                      
                      {history.downloadUrl && (
                        <Group position="right" mt="xs">
                          <Button 
                            variant="light" 
                            size="xs"
                            leftIcon={<IconDownload size={14} />}
                            component="a"
                            href={history.downloadUrl}
                          >
                            Download
                          </Button>
                        </Group>
                      )}
                    </Box>
                  ))}
                </ScrollArea>
              )}
            </Card>
          )}
          
          {/* Dashboards Tab */}
          {activeTab === 'dashboards' && (
            <Box ref={dashboardsRef}>
              {filteredDashboards.length === 0 ? (
                <Card p="xl" radius="md" withBorder>
                  <Text align="center" color="dimmed">
                    No dashboards found. Try adjusting your search term.
                  </Text>
                </Card>
              ) : (
                <SimpleGrid cols={2} spacing="md">
                  {filteredDashboards.map((dashboard) => (
                    <Card
                      key={dashboard.id}
                      p="md"
                      radius="md"
                      withBorder
                      className="dashboard-card"
                      sx={(theme) => ({
                        cursor: 'pointer',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                        border: selectedDashboard?.id === dashboard.id 
                          ? `2px solid ${theme.colors[theme.primaryColor][5]}` 
                          : undefined,
                        '&:hover': {
                          transform: 'translateY(-3px)',
                          boxShadow: theme.shadows.md
                        }
                      })}
                      onClick={() => setSelectedDashboard(dashboard)}
                    >
                      <Group position="apart" mb="xs" noWrap>
                        <Box>
                          <Group spacing={6}>
                            <Title order={4}>{dashboard.name}</Title>
                            {dashboard.isDefault && (
                              <Badge size="xs" color="blue">Default</Badge>
                            )}
                          </Group>
                          <Text size="xs" color="dimmed">
                            Created {formatDate(dashboard.createdAt)}
                          </Text>
                        </Box>
                        <Menu withinPortal position="bottom-end" shadow="md">
                          <Menu.Target>
                            <ActionIcon>
                              <IconDots size={16} />
                            </ActionIcon>
                          </Menu.Target>
                          <Menu.Dropdown>
                            <Menu.Item icon={<IconEdit size={14} />}>Edit</Menu.Item>
                            <Menu.Item icon={<IconCopy size={14} />}>Duplicate</Menu.Item>
                            {!dashboard.isDefault && (
                              <Menu.Item icon={<IconLayoutDashboard size={14} />}>Set as Default</Menu.Item>
                            )}
                            <Menu.Item
                              icon={dashboard.isShared ? <IconLayoutDashboard size={14} /> : <IconLayoutDashboard size={14} />}
                            >
                              {dashboard.isShared ? 'Manage Sharing' : 'Share Dashboard'}
                            </Menu.Item>
                            <Menu.Divider />
                            <Menu.Item color="red" icon={<IconTrash size={14} />}>Delete</Menu.Item>
                          </Menu.Dropdown>
                        </Menu>
                      </Group>
                      
                      {dashboard.description && (
                        <Text size="sm" color="dimmed" lineClamp={2} mb="sm">
                          {dashboard.description}
                        </Text>
                      )}
                      
                      <Text size="sm" mt="md">
                        <Text span weight={500}>{dashboard.widgets.length}</Text> widgets
                      </Text>
                      
                      <Group position="apart" mt="md">
                        <Text size="xs" color="dimmed">
                          Last updated: {formatDate(dashboard.updatedAt)}
                        </Text>
                        {dashboard.isShared && (
                          <Tooltip label={`Shared with ${dashboard.sharedWith?.length} users`}>
                            <Badge size="xs">Shared</Badge>
                          </Tooltip>
                        )}
                      </Group>
                    </Card>
                  ))}
                </SimpleGrid>
              )}
            </Box>
          )}
        </Grid.Col>
        
        {/* Selected Report or Dashboard Preview */}
        {(selectedReport || selectedDashboard) && (
          <Grid.Col span={4}>
            <Card p="md" radius="md" withBorder>
              {selectedReport && (
                <Box>
                  <Title order={4} mb="md">{selectedReport.name}</Title>
                  <Text size="sm" mb="md">
                    {selectedReport.description || 'No description available.'}
                  </Text>
                  <Divider mb="md" />
                  <Box mb="md">
                    <Text size="sm" weight={500}>Report Details</Text>
                    <Grid>
                      <Grid.Col span={6}>
                        <Text size="xs" color="dimmed">Category</Text>
                        <Text size="sm">{selectedReport.category}</Text>
                      </Grid.Col>
                      <Grid.Col span={6}>
                        <Text size="xs" color="dimmed">Chart Type</Text>
                        <Text size="sm">{selectedReport.configuration.chartType}</Text>
                      </Grid.Col>
                      <Grid.Col span={6}>
                        <Text size="xs" color="dimmed">Time Frame</Text>
                        <Text size="sm">{selectedReport.configuration.timeFrame}</Text>
                      </Grid.Col>
                      <Grid.Col span={6}>
                        <Text size="xs" color="dimmed">Created</Text>
                        <Text size="sm">{formatDate(selectedReport.createdAt)}</Text>
                      </Grid.Col>
                    </Grid>
                  </Box>
                  <Box mb="md">
                    <Text size="sm" weight={500} mb="xs">Metrics ({selectedReport.configuration.metrics.length})</Text>
                    <ScrollArea h={100}>
                      {selectedReport.configuration.metrics.map((metric) => (
                        <Text key={metric.id} size="xs" mb="xs">
                          {metric.label} ({metric.aggregation})
                        </Text>
                      ))}
                    </ScrollArea>
                  </Box>
                  <Box mb="md">
                    <Text size="sm" weight={500} mb="xs">Dimensions ({selectedReport.configuration.dimensions.length})</Text>
                    <ScrollArea h={100}>
                      {selectedReport.configuration.dimensions.map((dimension) => (
                        <Text key={dimension.id} size="xs" mb="xs">
                          {dimension.label}
                        </Text>
                      ))}
                    </ScrollArea>
                  </Box>
                  <Group position="apart" mt="xl">
                    <Button 
                      variant="light" 
                      leftIcon={<IconEdit size={16} />}
                      onClick={() => router.push('/reports/builder')}
                    >
                      Edit
                    </Button>
                    <Button 
                      leftIcon={<IconDownload size={16} />}
                      onClick={() => {}}
                    >
                      Generate
                    </Button>
                  </Group>
                </Box>
              )}
              
              {selectedDashboard && (
                <Box>
                  <Title order={4} mb="md">{selectedDashboard.name}</Title>
                  <Text size="sm" mb="md">
                    {selectedDashboard.description || 'No description available.'}
                  </Text>
                  <Divider mb="md" />
                  
                  <DashboardPreview dashboard={selectedDashboard} />
                  
                  <Group position="apart" mt="xl">
                    <Button 
                      variant="light" 
                      leftIcon={<IconEdit size={16} />}
                      onClick={() => router.push('/reports/dashboard/editor')}
                    >
                      Edit
                    </Button>
                    <Button 
                      onClick={() => router.push('/reports/dashboard/view')}
                    >
                      View
                    </Button>
                  </Group>
                </Box>
              )}
            </Card>
          </Grid.Col>
        )}
      </Grid>
    </Box>
  );
}