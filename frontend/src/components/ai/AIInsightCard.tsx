import React, { useRef, useEffect } from 'react';
import { 
  Paper, 
  Text, 
  Group, 
  Badge, 
  ThemeIcon, 
  Stack, 
  Progress, 
  ActionIcon, 
  useMantineTheme, 
  Box, 
  Grid,
  Menu,
  Collapse,
  Divider
} from '@mantine/core';
import { 
  IconBulb, 
  IconArrowUpRight, 
  IconArrowDownRight, 
  IconArrowRight, 
  IconStar, 
  IconDotsVertical,
  IconChartLine,
  IconTargetArrow,
  IconAlertTriangle,
  IconTrendingUp,
  IconDownload,
  IconShare,
  IconCheck
} from '@tabler/icons-react';
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { useDisclosure } from '@mantine/hooks';

gsap.registerPlugin(SplitText);

export type ImpactType = 'positive' | 'negative' | 'neutral';
export type InsightCategory = 'performance' | 'opportunity' | 'risk' | 'competitive';

export interface AIInsightCardProps {
  /** Title of the insight */
  title: string;
  /** Description text */
  description: string;
  /** Impact classification */
  impact: ImpactType;
  /** Confidence score (0-1) */
  confidence: number;
  /** Whether this is a new insight */
  newInsight?: boolean;
  /** Data source of the insight */
  source?: string;
  /** Insight category */
  category?: InsightCategory;
  /** Timestamp of the insight */
  timestamp?: Date;
  /** Tags associated with the insight */
  tags?: string[];
  /** Whether the insight is saved */
  isSaved?: boolean;
  /** Function called when save button is clicked */
  onSave?: () => void;
  /** Additional metadata for detailed view */
  metadata?: Record<string, any>;
  /** Card layout variant */
  variant?: 'vertical' | 'horizontal';
  /** Additional class name */
  className?: string;
}

/**
 * Enhanced AI Insight Card component with animation and detailed view
 * Follows Fluxori's Motion Design Guide principles
 */
export const AIInsightCard: React.FC<AIInsightCardProps> = ({
  title,
  description,
  impact,
  confidence,
  newInsight = false,
  source,
  category = 'performance',
  timestamp,
  tags = [],
  isSaved = false,
  onSave,
  metadata = {},
  variant = 'vertical',
  className
}) => {
  const theme = useMantineTheme();
  const cardRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const descRef = useRef<HTMLDivElement>(null);
  const [detailsOpened, { toggle: toggleDetails }] = useDisclosure(false);
  
  // Mount animation
  useEffect(() => {
    if (cardRef.current && titleRef.current && descRef.current) {
      let splitTitle: SplitText | null = null;
      let splitDesc: SplitText | null = null;
      
      if (newInsight) {
        // Apply entrance animation for new insights
        const timeline = gsap.timeline();
        
        // Card entrance
        timeline.fromTo(cardRef.current,
          { opacity: 0, y: 20, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'power2.out' }
        );
        
        // Split and animate title
        splitTitle = new SplitText(titleRef.current, { type: 'words,chars' });
        timeline.fromTo(splitTitle.chars,
          { opacity: 0, y: 10 },
          { 
            opacity: 1, 
            y: 0, 
            duration: 0.4, 
            stagger: 0.02, 
            ease: 'power2.out' 
          },
          '-=0.3'
        );
        
        // Animate description with offset
        splitDesc = new SplitText(descRef.current, { type: 'lines' });
        timeline.fromTo(splitDesc.lines,
          { opacity: 0, y: 10 },
          { 
            opacity: 1, 
            y: 0, 
            duration: 0.4, 
            stagger: 0.05, 
            ease: 'power2.out' 
          },
          '-=0.2'
        );
        
        // Add confidence indicator animation
        const confidenceBar = cardRef.current.querySelector('.confidence-indicator');
        if (confidenceBar) {
          timeline.fromTo(confidenceBar,
            { width: 0 },
            { 
              width: `${confidence * 100}%`, 
              duration: 0.8, 
              ease: 'power2.inOut' 
            },
            '-=0.4'
          );
        }
        
        // Badge entrance animation
        const badges = cardRef.current.querySelectorAll('.mantine-Badge-root');
        if (badges.length) {
          timeline.fromTo(badges,
            { opacity: 0, scale: 0.8 },
            { 
              opacity: 1, 
              scale: 1, 
              duration: 0.3,
              stagger: 0.05,
              ease: 'back.out(1.7)'
            },
            '-=0.6'
          );
        }
      } else {
        // Simple fade in for existing insights
        gsap.fromTo(cardRef.current,
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
        );
        
        // Animate confidence bar
        const confidenceBar = cardRef.current.querySelector('.confidence-indicator');
        if (confidenceBar) {
          gsap.fromTo(confidenceBar,
            { width: 0 },
            { width: `${confidence * 100}%`, duration: 0.6, ease: 'power2.inOut', delay: 0.2 }
          );
        }
      }
      
      // Clean up SplitText instances
      return () => {
        if (splitTitle) splitTitle.revert();
        if (splitDesc) splitDesc.revert();
      };
    }
  }, [newInsight, confidence]);

  // Handle save button click with animation
  const handleSave = () => {
    if (!onSave) return;
    
    const saveIcon = cardRef.current?.querySelector('.save-icon');
    if (saveIcon) {
      gsap.timeline()
        .to(saveIcon, { 
          scale: 1.5, 
          rotate: isSaved ? 0 : 72, 
          duration: 0.3, 
          ease: 'back.out(1.7)' 
        })
        .to(saveIcon, { 
          scale: 1, 
          duration: 0.2, 
          ease: 'power2.out'
        })
        .then(onSave);
    } else {
      onSave();
    }
  };

  // Handle card hover animations
  const handleMouseEnter = () => {
    if (!cardRef.current) return;
    
    gsap.to(cardRef.current, {
      y: -3,
      boxShadow: '0 8px 15px rgba(0,0,0,0.1)',
      duration: 0.3,
      ease: 'power2.out'
    });
  };
  
  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    
    gsap.to(cardRef.current, {
      y: 0,
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
      duration: 0.3,
      ease: 'power2.out'
    });
  };

  // Animate details expansion/collapse
  const toggleDetailsWithAnimation = () => {
    const detailsEl = cardRef.current?.querySelector('.details-section');
    if (!detailsEl) {
      toggleDetails();
      return;
    }
    
    if (detailsOpened) {
      // Collapse animation
      gsap.to(detailsEl, {
        opacity: 0,
        y: -10,
        duration: 0.2,
        ease: 'power2.in',
        onComplete: toggleDetails
      });
    } else {
      // First toggle to show content, then animate
      toggleDetails();
      gsap.fromTo(detailsEl,
        { opacity: 0, y: 10 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.3, 
          ease: 'power2.out'
        }
      );
    }
  };

  // Get icon and color based on impact
  const getImpactDetails = () => {
    switch (impact) {
      case 'positive':
        return { 
          icon: <IconArrowUpRight size={18} />, 
          color: 'teal',
          label: 'Positive Impact' 
        };
      case 'negative':
        return { 
          icon: <IconArrowDownRight size={18} />, 
          color: 'red',
          label: 'Negative Impact' 
        };
      default:
        return { 
          icon: <IconArrowRight size={18} />, 
          color: 'blue',
          label: 'Neutral Impact' 
        };
    }
  };

  // Get category details
  const getCategoryDetails = () => {
    switch (category) {
      case 'performance':
        return {
          icon: <IconChartLine size={16} />,
          color: 'blue',
          label: 'Performance'
        };
      case 'opportunity':
        return {
          icon: <IconTargetArrow size={16} />,
          color: 'green',
          label: 'Opportunity'
        };
      case 'risk':
        return {
          icon: <IconAlertTriangle size={16} />,
          color: 'red',
          label: 'Risk'
        };
      case 'competitive':
        return {
          icon: <IconTrendingUp size={16} />,
          color: 'violet',
          label: 'Competitive'
        };
      default:
        return {
          icon: <IconBulb size={16} />,
          color: 'gray',
          label: 'Insight'
        };
    }
  };

  const impactDetails = getImpactDetails();
  const categoryDetails = getCategoryDetails();

  // Format date
  const formatDate = (date?: Date) => {
    if (!date) return '';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes < 60) {
      return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 30) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Render horizontal variant
  if (variant === 'horizontal') {
    return (
      <Paper 
        ref={cardRef}
        p="md" 
        withBorder 
        radius="md"
        shadow="sm"
        className={className}
        sx={{ 
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          position: 'relative',
          overflow: 'hidden'
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Grid>
          <Grid.Col span={12} md={8}>
            <Box mb="xs">
              <Group position="apart" noWrap>
                <Group spacing="xs">
                  <ThemeIcon color={categoryDetails.color} variant="light" size="sm">
                    {categoryDetails.icon}
                  </ThemeIcon>
                  
                  <Badge 
                    color={categoryDetails.color} 
                    variant="light"
                    size="sm"
                  >
                    {categoryDetails.label}
                  </Badge>
                  
                  {newInsight && (
                    <Badge color="yellow" size="sm">New</Badge>
                  )}
                </Group>
                
                <Text size="xs" color="dimmed">
                  {formatDate(timestamp)}
                </Text>
              </Group>
            </Box>
            
            <Text ref={titleRef} weight={600} size="lg" mb="xs" lineClamp={1}>
              {title}
            </Text>
            
            <Text ref={descRef} size="sm" color="dimmed" mb="sm" lineClamp={2}>
              {description}
            </Text>
            
            <Group spacing="xs" position="apart">
              <Group spacing={4}>
                {tags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} size="xs" variant="outline">
                    {tag}
                  </Badge>
                ))}
                {tags.length > 3 && (
                  <Badge size="xs" variant="outline">
                    +{tags.length - 3} more
                  </Badge>
                )}
              </Group>
            </Group>
          </Grid.Col>
          
          <Grid.Col span={12} md={4}>
            <Stack spacing="xs" h="100%">
              <Group spacing="xs" position="right" noWrap>
                <ThemeIcon 
                  color={impactDetails.color} 
                  variant="light" 
                  size="md"
                  radius="xl"
                >
                  {impactDetails.icon}
                </ThemeIcon>
                <Text size="sm" weight={500} color={`${impactDetails.color}`}>
                  {impactDetails.label}
                </Text>
              </Group>
              
              <Text size="xs" color="dimmed" weight={500} align="right">
                AI Confidence
              </Text>
              
              <Box>
                <Group position="apart" mb={4} noWrap>
                  <Text size="xs">{(confidence * 100).toFixed(0)}%</Text>
                  <Text size="xs">Source: {source || 'AI Analysis'}</Text>
                </Group>
                <div style={{ height: 4, background: 'var(--mantine-color-gray-2)', borderRadius: 2, overflow: 'hidden' }}>
                  <div 
                    className="confidence-indicator"
                    style={{ 
                      width: `${confidence * 100}%`, 
                      height: '100%', 
                      background: `var(--mantine-color-${categoryDetails.color}-6)`,
                      borderRadius: 2
                    }} 
                  />
                </div>
              </Box>
              
              <Group position="right" mt="auto" noWrap>
                <ActionIcon
                  className="save-icon"
                  variant="light"
                  color={isSaved ? 'yellow' : 'gray'}
                  onClick={handleSave}
                  title={isSaved ? 'Remove from saved' : 'Save insight'}
                >
                  <IconStar size={16} fill={isSaved ? 'currentColor' : 'none'} />
                </ActionIcon>
                
                <Menu position="bottom-end" shadow="sm">
                  <Menu.Target>
                    <ActionIcon variant="light">
                      <IconDotsVertical size={16} />
                    </ActionIcon>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item 
                      icon={<IconCheck size={14} />}
                      onClick={toggleDetailsWithAnimation}
                    >
                      {detailsOpened ? 'Hide details' : 'Show details'}
                    </Menu.Item>
                    <Menu.Item icon={<IconDownload size={14} />}>
                      Export insight
                    </Menu.Item>
                    <Menu.Item icon={<IconShare size={14} />}>
                      Share insight
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </Group>
            </Stack>
          </Grid.Col>
        </Grid>
        
        <Collapse in={detailsOpened}>
          <Box className="details-section" mt="md">
            <Divider my="sm" />
            <Text weight={500} size="sm" mb="xs">Detailed Information</Text>
            
            {metadata && Object.keys(metadata).length > 0 && (
              <Stack spacing="xs">
                {Object.entries(metadata).map(([key, value]) => (
                  <Group key={key} position="apart" noWrap>
                    <Text size="sm" color="dimmed" transform="capitalize">
                      {key.replace(/([A-Z])/g, ' $1')
                         .replace(/_/g, ' ')
                         .toLowerCase()}:
                    </Text>
                    <Text size="sm" weight={500}>
                      {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                    </Text>
                  </Group>
                ))}
              </Stack>
            )}
          </Box>
        </Collapse>
      </Paper>
    );
  }

  // Default vertical variant
  return (
    <Paper 
      ref={cardRef}
      p="md" 
      withBorder 
      radius="md"
      shadow="sm"
      className={className}
      sx={{ 
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        position: 'relative',
        overflow: 'hidden',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Box mb="xs">
        <Group position="apart">
          <Group spacing="xs">
            <ThemeIcon color={categoryDetails.color} variant="light" size="sm">
              {categoryDetails.icon}
            </ThemeIcon>
            
            <Badge 
              color={categoryDetails.color} 
              variant="light"
              size="sm"
            >
              {categoryDetails.label}
            </Badge>
          </Group>
          
          {newInsight && (
            <Badge color="yellow" size="sm">New</Badge>
          )}
        </Group>
      </Box>
      
      <Text ref={titleRef} weight={600} size="lg" mb="xs">
        {title}
      </Text>
      
      <Text ref={descRef} size="sm" color="dimmed" mb="md">
        {description}
      </Text>
      
      {/* Tags */}
      <Group spacing="xs" mb="md">
        {tags.slice(0, 3).map((tag, index) => (
          <Badge key={index} size="xs" variant="outline">
            {tag}
          </Badge>
        ))}
        {tags.length > 3 && (
          <Badge size="xs" variant="outline">
            +{tags.length - 3} more
          </Badge>
        )}
      </Group>
      
      <Stack mt="auto" spacing="sm">
        <Group spacing="xs">
          <ThemeIcon 
            color={impactDetails.color} 
            variant="light" 
            size="md"
            radius="xl"
          >
            {impactDetails.icon}
          </ThemeIcon>
          <Text size="sm" weight={500} color={`${impactDetails.color}`}>
            {impactDetails.label}
          </Text>
        </Group>
        
        <Text size="xs" color="dimmed" weight={500}>
          AI Confidence
        </Text>
        
        <div style={{ marginTop: 4 }}>
          <Group position="apart" mb={4}>
            <Text size="xs">{(confidence * 100).toFixed(0)}%</Text>
            {timestamp && <Text size="xs">{formatDate(timestamp)}</Text>}
          </Group>
          <div style={{ height: 4, background: 'var(--mantine-color-gray-2)', borderRadius: 2, overflow: 'hidden' }}>
            <div 
              className="confidence-indicator"
              style={{ 
                width: `${confidence * 100}%`, 
                height: '100%', 
                background: `var(--mantine-color-${categoryDetails.color}-6)`,
                borderRadius: 2
              }} 
            />
          </div>
        </div>
        
        <Group position="apart" mt="xs">
          <Text size="xs" color="dimmed">
            Source: {source || 'AI Analysis'}
          </Text>
          
          <Group spacing="xs">
            <ActionIcon
              className="save-icon"
              variant="light"
              color={isSaved ? 'yellow' : 'gray'}
              onClick={handleSave}
              title={isSaved ? 'Remove from saved' : 'Save insight'}
            >
              <IconStar size={16} fill={isSaved ? 'currentColor' : 'none'} />
            </ActionIcon>
            
            <Menu position="bottom-end" shadow="sm">
              <Menu.Target>
                <ActionIcon variant="light">
                  <IconDotsVertical size={16} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item 
                  icon={<IconCheck size={14} />}
                  onClick={toggleDetailsWithAnimation}
                >
                  {detailsOpened ? 'Hide details' : 'Show details'}
                </Menu.Item>
                <Menu.Item icon={<IconDownload size={14} />}>
                  Export insight
                </Menu.Item>
                <Menu.Item icon={<IconShare size={14} />}>
                  Share insight
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </Stack>
      
      <Collapse in={detailsOpened}>
        <Box className="details-section" mt="md">
          <Divider my="sm" />
          <Text weight={500} size="sm" mb="xs">Detailed Information</Text>
          
          {metadata && Object.keys(metadata).length > 0 && (
            <Stack spacing="xs">
              {Object.entries(metadata).map(([key, value]) => (
                <Group key={key} position="apart" sx={{ flexWrap: 'nowrap' }}>
                  <Text size="sm" color="dimmed" transform="capitalize">
                    {key.replace(/([A-Z])/g, ' $1')
                       .replace(/_/g, ' ')
                       .toLowerCase()}:
                  </Text>
                  <Text size="sm" weight={500} sx={{ wordBreak: 'break-word' }}>
                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                  </Text>
                </Group>
              ))}
            </Stack>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
};

export default AIInsightCard;