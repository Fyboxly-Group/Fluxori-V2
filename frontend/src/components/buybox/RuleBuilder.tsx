import { useEffect, useRef, useState } from 'react';
import { 
  Paper, Title, Stack, Group, TextInput, NumberInput, 
  Select, Button, Text, Switch, Badge, ThemeIcon,
  Divider, Box, ActionIcon
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { 
  IconEqual, IconArrowDown, IconArrowUp, IconPercentage, 
  IconRotateClockwise, IconTrash, IconPlus, IconCoin
} from '@tabler/icons-react';
import { gsap } from 'gsap';
import { Draggable } from 'gsap/Draggable';

// Register GSAP plugins
gsap.registerPlugin(Draggable);

// Rule strategy options
const STRATEGY_OPTIONS = [
  { value: 'match', label: 'Match Buy Box', icon: <IconEqual size={14} /> },
  { value: 'beat', label: 'Beat Buy Box', icon: <IconArrowDown size={14} /> },
  { value: 'percentage', label: 'Fixed Percentage', icon: <IconPercentage size={14} /> },
  { value: 'dynamic', label: 'Dynamic Pricing', icon: <IconRotateClockwise size={14} /> }
];

// Marketplace options
const MARKETPLACE_OPTIONS = [
  { value: 'amazon', label: 'Amazon' },
  { value: 'takealot', label: 'Takealot' },
  { value: 'shopify', label: 'Shopify' }
];

// Rule condition options
const CONDITION_OPTIONS = [
  { value: 'all', label: 'All Products' },
  { value: 'category', label: 'By Category' },
  { value: 'tag', label: 'By Tag' },
  { value: 'sku', label: 'By SKU List' }
];

// Schedule options
const SCHEDULE_OPTIONS = [
  { value: 'hourly', label: 'Hourly' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' }
];

export interface RuleBuilderProps {
  onSave?: (rule: RepricingRule) => void;
  initialRule?: RepricingRule;
  className?: string;
}

export interface RepricingRule {
  id?: string;
  name: string;
  strategy: string;
  marketplace: string;
  condition: string;
  conditionValue?: string;
  minimumPrice?: number;
  maximumPrice?: number;
  strategyValue?: number;
  schedule: string;
  active: boolean;
  priority: number;
}

export const RuleBuilder: React.FC<RuleBuilderProps> = ({
  onSave,
  initialRule,
  className
}) => {
  const [active, setActive] = useState(initialRule?.active ?? true);
  const [adjustmentVisible, setAdjustmentVisible] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const strategyRef = useRef<HTMLDivElement>(null);
  const conditionRef = useRef<HTMLDivElement>(null);
  const priceRangeRef = useRef<HTMLDivElement>(null);
  const scheduleRef = useRef<HTMLDivElement>(null);
  
  // Initialize form with default values or initial rule
  const form = useForm<RepricingRule>({
    initialValues: initialRule ?? {
      name: '',
      strategy: 'beat',
      marketplace: 'amazon',
      condition: 'all',
      conditionValue: '',
      minimumPrice: undefined,
      maximumPrice: undefined,
      strategyValue: 0.5,
      schedule: 'daily',
      active: true,
      priority: 10
    },
    validate: {
      name: (value) => value.length < 3 ? 'Name must be at least 3 characters' : null,
      strategyValue: (value, values) => 
        values.strategy === 'percentage' && (value < 0 || value > 100) 
          ? 'Percentage must be between 0 and 100' 
          : values.strategy === 'beat' && (value < 0 || value > 20)
            ? 'Amount must be between 0 and 20'
            : null
    }
  });
  
  // Update form when initialRule changes
  useEffect(() => {
    if (initialRule) {
      form.setValues(initialRule);
      setActive(initialRule.active);
    }
  }, [initialRule]);

  // Animate sections based on strategy
  useEffect(() => {
    if (strategyRef.current) {
      const strategy = form.values.strategy;
      const needsAdjustment = ['beat', 'percentage'].includes(strategy);
      
      if (needsAdjustment !== adjustmentVisible) {
        setAdjustmentVisible(needsAdjustment);
        
        const adjustmentSection = strategyRef.current.querySelector('.strategy-adjustment');
        if (adjustmentSection) {
          if (needsAdjustment) {
            // Animate in
            gsap.fromTo(adjustmentSection,
              { height: 0, opacity: 0, overflow: 'hidden' },
              { 
                height: 'auto', 
                opacity: 1, 
                duration: 0.4, 
                ease: 'power2.out',
                onComplete: () => {
                  gsap.set(adjustmentSection, { clearProps: 'overflow' });
                }
              }
            );
          } else {
            // Animate out
            gsap.to(adjustmentSection, {
              height: 0,
              opacity: 0,
              overflow: 'hidden',
              duration: 0.3,
              ease: 'power2.in'
            });
          }
        }
      }
    }
  }, [form.values.strategy, adjustmentVisible]);
  
  // Entrance animation
  useEffect(() => {
    if (formRef.current) {
      const sections = [
        formRef.current.querySelector('.header-section'),
        strategyRef.current,
        conditionRef.current,
        priceRangeRef.current,
        scheduleRef.current,
        formRef.current.querySelector('.submit-section')
      ];
      
      gsap.fromTo(sections,
        { opacity: 0, y: 20 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.5, 
          stagger: 0.1,
          ease: 'power2.out'
        }
      );
    }
  }, []);

  // Handle form submission
  const handleSubmit = (values: RepricingRule) => {
    // Create the rule including the active state
    const rule = {
      ...values,
      active
    };
    
    // Show success animation
    if (formRef.current) {
      const submitBtn = formRef.current.querySelector('.submit-button');
      if (submitBtn) {
        const tl = gsap.timeline();
        
        tl.to(submitBtn, {
          scale: 0.95,
          duration: 0.1,
          ease: 'power2.in'
        }).to(submitBtn, {
          scale: 1,
          duration: 0.3,
          ease: 'elastic.out(1.2, 0.5)',
          onComplete: () => {
            if (onSave) {
              onSave(rule);
            }
          }
        });
      }
    }
  };
  
  // Get label for strategy value
  const getStrategyValueLabel = () => {
    switch (form.values.strategy) {
      case 'beat':
        return 'Amount to beat by ($)';
      case 'percentage':
        return 'Percentage (%)';
      default:
        return 'Value';
    }
  };
  
  return (
    <Paper p="md" withBorder shadow="sm" className={className}>
      <form ref={formRef} onSubmit={form.onSubmit(handleSubmit)}>
        <Stack spacing="lg">
          {/* Header Section */}
          <Group position="apart" className="header-section">
            <Title order={3}>Repricing Rule</Title>
            <Switch 
              label="Active" 
              checked={active} 
              onChange={(e) => setActive(e.currentTarget.checked)}
              size="md"
            />
          </Group>
          
          <Group grow spacing="md">
            <TextInput
              required
              label="Rule Name"
              placeholder="Enter a descriptive name"
              {...form.getInputProps('name')}
            />
            
            <NumberInput
              label="Priority"
              description="Higher priority rules run first"
              min={1}
              max={100}
              {...form.getInputProps('priority')}
            />
          </Group>
          
          {/* Strategy Section */}
          <div ref={strategyRef}>
            <Stack spacing="sm">
              <Text weight={500}>Pricing Strategy</Text>
              
              <Select
                required
                placeholder="Select strategy"
                data={STRATEGY_OPTIONS.map(option => ({
                  value: option.value,
                  label: (
                    <Group spacing="xs">
                      <ThemeIcon size="sm" color="blue" variant="light">
                        {option.icon}
                      </ThemeIcon>
                      <Text>{option.label}</Text>
                    </Group>
                  )
                }))}
                itemComponent={({ label }) => label}
                {...form.getInputProps('strategy')}
              />
              
              <Select
                required
                label="Marketplace"
                placeholder="Select marketplace"
                data={MARKETPLACE_OPTIONS}
                {...form.getInputProps('marketplace')}
              />
              
              {/* Strategy Adjustment - conditionally visible */}
              <div className="strategy-adjustment" style={{ display: adjustmentVisible ? 'block' : 'none' }}>
                <NumberInput
                  required
                  label={getStrategyValueLabel()}
                  placeholder="Enter value"
                  precision={2}
                  min={0}
                  max={form.values.strategy === 'percentage' ? 100 : 20}
                  icon={form.values.strategy === 'percentage' ? <IconPercentage size={16} /> : <IconCoin size={16} />}
                  {...form.getInputProps('strategyValue')}
                />
              </div>
            </Stack>
          </div>
          
          {/* Condition Section */}
          <div ref={conditionRef}>
            <Stack spacing="sm">
              <Text weight={500}>Product Selection</Text>
              
              <Select
                required
                label="Apply to"
                placeholder="Select condition"
                data={CONDITION_OPTIONS}
                {...form.getInputProps('condition')}
              />
              
              {form.values.condition !== 'all' && (
                <TextInput
                  required
                  label={form.values.condition === 'category' 
                    ? 'Category Name' 
                    : form.values.condition === 'tag' 
                      ? 'Tag Name' 
                      : 'SKU List (comma separated)'}
                  placeholder="Enter value"
                  {...form.getInputProps('conditionValue')}
                />
              )}
            </Stack>
          </div>
          
          {/* Price Range Section */}
          <div ref={priceRangeRef}>
            <Stack spacing="sm">
              <Text weight={500}>Price Limits</Text>
              
              <Group grow>
                <NumberInput
                  label="Minimum Price ($)"
                  placeholder="No minimum"
                  precision={2}
                  min={0}
                  icon={<IconCoin size={16} />}
                  {...form.getInputProps('minimumPrice')}
                />
                
                <NumberInput
                  label="Maximum Price ($)"
                  placeholder="No maximum"
                  precision={2}
                  min={0}
                  icon={<IconCoin size={16} />}
                  {...form.getInputProps('maximumPrice')}
                />
              </Group>
            </Stack>
          </div>
          
          {/* Schedule Section */}
          <div ref={scheduleRef}>
            <Stack spacing="sm">
              <Text weight={500}>Execution Schedule</Text>
              
              <Select
                required
                label="Frequency"
                placeholder="Select schedule"
                data={SCHEDULE_OPTIONS}
                {...form.getInputProps('schedule')}
              />
            </Stack>
          </div>
          
          {/* Submit Section */}
          <Group position="right" mt="md" className="submit-section">
            <Button 
              type="submit" 
              size="md"
              className="submit-button"
            >
              Save Rule
            </Button>
          </Group>
        </Stack>
      </form>
    </Paper>
  );
};

export default RuleBuilder;