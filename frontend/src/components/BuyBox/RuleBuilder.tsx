import React, { useState, useEffect, useRef } from 'react';
import {
  Paper,
  Text,
  Group,
  Title,
  Stepper,
  Button,
  Select,
  NumberInput,
  Switch,
  Stack,
  Divider,
  TextInput,
  Badge,
  Checkbox,
  ActionIcon,
  Box,
  createStyles,
  useMantineTheme,
  Tooltip,
  ThemeIcon,
  Card,
  Radio,
  RadioGroup,
  RangeSlider,
  Slider,
  ScrollArea,
  Collapse,
  MultiSelect,
} from '@mantine/core';
import {
  IconChevronRight,
  IconArrowRight,
  IconCheck,
  IconPercentage,
  IconCurrencyDollar,
  IconShoppingCart,
  IconTags,
  IconPlus,
  IconTrash,
  IconAdjustments,
  IconInfoCircle,
  IconBuildingStore,
  IconRepeat,
  IconClock,
  IconBulb,
  IconLock,
  IconCalendarTime,
} from '@tabler/icons-react';
import { useAnimatedMount } from '@/hooks/useAnimation';
import gsap from 'gsap';

// Define styles for the component
const useStyles = createStyles((theme) => ({
  container: {
    position: 'relative',
  },
  stepperContainer: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: 600,
    marginBottom: theme.spacing.xs,
  },
  actionCard: {
    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    position: 'relative',
    cursor: 'pointer',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: theme.shadows.sm,
    },
  },
  selectedAction: {
    borderColor: theme.colors.blue[5],
    borderWidth: 2,
    '&:hover': {
      borderColor: theme.colors.blue[5],
    },
  },
  actionTitle: {
    fontWeight: 600,
  },
  rulePreview: {
    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.colors.gray[0],
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    border: `1px solid ${
      theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[3]
    }`,
    marginTop: theme.spacing.md,
  },
  conditionGroup: {
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    border: `1px dashed ${
      theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[4]
    }`,
    marginBottom: theme.spacing.md,
  },
  scheduleOption: {
    marginBottom: theme.spacing.xs,
  },
  sliderLabel: {
    marginBottom: theme.spacing.xs,
  },
  marginPreview: {
    height: 6,
    borderRadius: theme.radius.sm,
    position: 'relative',
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  profitMargin: {
    backgroundColor: theme.colors.green[6],
    height: '100%',
    borderRadius: 'inherit',
  },
  daysGroup: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  dayButton: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.md,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: theme.fontSizes.sm,
    fontWeight: 600,
    cursor: 'pointer',
    userSelect: 'none',
    border: `1px solid ${
      theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[4]
    }`,
    '&:hover': {
      backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[1],
    },
  },
  selectedDay: {
    backgroundColor: theme.colors.blue[6],
    color: theme.white,
    borderColor: theme.colors.blue[6],
    '&:hover': {
      backgroundColor: theme.colors.blue[7],
    },
  },
}));

// Rule types
type RuleAction =
  | 'match_buy_box'
  | 'beat_buy_box'
  | 'match_lowest'
  | 'beat_lowest'
  | 'percentage_adjustment'
  | 'fixed_adjustment'
  | 'maintain_margin';

type RuleCondition = {
  type: 'buy_box_status' | 'competitor_count' | 'marketplace' | 'product_category' | 'time_period';
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: any;
};

type RuleSchedule = {
  type: 'once' | 'daily' | 'weekly' | 'custom';
  days?: number[]; // 0 = Sunday, 6 = Saturday
  timeStart?: string;
  timeEnd?: string;
  repeatEvery?: number; // In hours for 'custom'
};

export interface RepriceRule {
  id?: string;
  name: string;
  action: RuleAction;
  actionParams: Record<string, any>;
  conditions: RuleCondition[];
  schedule: RuleSchedule;
  minPrice?: number;
  maxPrice?: number;
  enabled: boolean;
  priority: number;
  marketplaces: string[];
}

export interface RuleBuilderProps {
  /** Initial rule (for editing) */
  initialRule?: Partial<RepriceRule>;
  /** Available marketplaces */
  availableMarketplaces: { value: string; label: string }[];
  /** Available product categories */
  availableCategories: { value: string; label: string }[];
  /** Function called when rule is saved */
  onSave: (rule: RepriceRule) => void;
  /** Function called when builder is cancelled */
  onCancel: () => void;
  /** Whether the form is currently saving */
  isSaving?: boolean;
}

/**
 * Multi-step rule builder component for creating pricing rules
 */
export const RuleBuilder: React.FC<RuleBuilderProps> = ({
  initialRule,
  availableMarketplaces,
  availableCategories,
  onSave,
  onCancel,
  isSaving = false,
}) => {
  const { classes, cx, theme } = useStyles();
  const [activeStep, setActiveStep] = useState(0);
  const containerRef = useAnimatedMount('fadeInUp', { duration: 0.6 });
  
  // Default rule structure
  const defaultRule: RepriceRule = {
    name: '',
    action: 'match_buy_box',
    actionParams: {},
    conditions: [],
    schedule: {
      type: 'daily',
      days: [0, 1, 2, 3, 4, 5, 6], // All days by default
      timeStart: '08:00',
      timeEnd: '20:00',
    },
    minPrice: undefined,
    maxPrice: undefined,
    enabled: true,
    priority: 1,
    marketplaces: [],
  };
  
  // Initialize rule state from initialRule or defaultRule
  const [rule, setRule] = useState<RepriceRule>({
    ...defaultRule,
    ...initialRule,
  });
  
  // References for animations
  const stepperRef = useRef<HTMLDivElement>(null);
  const formContentRef = useRef<HTMLDivElement>(null);
  
  // Action cards animation refs
  const actionCardsRef = useRef<Record<string, HTMLDivElement | null>>({});
  
  // Handle step navigation
  const nextStep = () => {
    // Validate current step before proceeding
    if (validateCurrentStep()) {
      // Animate step change
      animateStepChange(true);
      setActiveStep((current) => Math.min(current + 1, 3));
    }
  };
  
  const prevStep = () => {
    animateStepChange(false);
    setActiveStep((current) => Math.max(current - 1, 0));
  };
  
  // Animate step change
  const animateStepChange = (forward: boolean) => {
    if (!formContentRef.current) return;
    
    // Animate form content
    gsap.fromTo(
      formContentRef.current,
      { 
        opacity: 0,
        x: forward ? 50 : -50,
      },
      { 
        opacity: 1,
        x: 0,
        duration: 0.4,
        ease: 'power2.out',
      }
    );
  };
  
  // Validate current step
  const validateCurrentStep = (): boolean => {
    switch (activeStep) {
      case 0: // Rule Type & Marketplaces
        return rule.name.trim() !== '' && rule.marketplaces.length > 0;
      case 1: // Pricing Action
        return rule.action !== '' && validateActionParams();
      case 2: // Conditions & Scheduling
        return true; // Conditions are optional
      case 3: // Review
        return true;
      default:
        return false;
    }
  };
  
  // Validate action parameters
  const validateActionParams = (): boolean => {
    switch (rule.action) {
      case 'match_buy_box':
      case 'match_lowest':
        return true; // No parameters needed
      case 'beat_buy_box':
      case 'beat_lowest':
        return typeof rule.actionParams.amount === 'number';
      case 'percentage_adjustment':
        return typeof rule.actionParams.percentage === 'number';
      case 'fixed_adjustment':
        return typeof rule.actionParams.amount === 'number';
      case 'maintain_margin':
        return typeof rule.actionParams.minMarginPercent === 'number';
      default:
        return false;
    }
  };
  
  // Handle changing rule properties
  const updateRule = (changes: Partial<RepriceRule>) => {
    setRule((current) => ({ ...current, ...changes }));
  };
  
  // Add a condition
  const addCondition = (condition: RuleCondition) => {
    setRule((current) => ({
      ...current,
      conditions: [...current.conditions, condition],
    }));
  };
  
  // Remove a condition
  const removeCondition = (index: number) => {
    setRule((current) => ({
      ...current,
      conditions: current.conditions.filter((_, i) => i !== index),
    }));
  };
  
  // Update a condition
  const updateCondition = (index: number, changes: Partial<RuleCondition>) => {
    setRule((current) => ({
      ...current,
      conditions: current.conditions.map((condition, i) =>
        i === index ? { ...condition, ...changes } : condition
      ),
    }));
  };
  
  // Select a pricing action
  const selectAction = (action: RuleAction) => {
    // Define default parameters for each action
    let actionParams = {};
    
    switch (action) {
      case 'beat_buy_box':
      case 'beat_lowest':
        actionParams = { amount: 0.01 };
        break;
      case 'percentage_adjustment':
        actionParams = { percentage: 5, direction: 'decrease' };
        break;
      case 'fixed_adjustment':
        actionParams = { amount: 1, direction: 'decrease' };
        break;
      case 'maintain_margin':
        actionParams = { minMarginPercent: 15, targetMarginPercent: 20 };
        break;
    }
    
    // Animate the selection
    Object.entries(actionCardsRef.current).forEach(([key, element]) => {
      if (!element) return;
      
      if (key === action) {
        // Highlight selected card
        gsap.to(element, {
          scale: 1.02,
          boxShadow: theme.shadows.md,
          borderColor: theme.colors.blue[5],
          borderWidth: 2,
          duration: 0.3,
          ease: 'power2.out',
        });
      } else {
        // Dim other cards
        gsap.to(element, {
          scale: 1,
          opacity: 0.6,
          boxShadow: 'none',
          borderColor: theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3],
          borderWidth: 1,
          duration: 0.3,
          ease: 'power2.out',
        });
      }
    });
    
    updateRule({ action, actionParams });
  };
  
  // Toggle a schedule day
  const toggleDay = (day: number) => {
    setRule((current) => {
      const days = current.schedule.days || [];
      const newDays = days.includes(day)
        ? days.filter((d) => d !== day)
        : [...days, day];
      
      return {
        ...current,
        schedule: {
          ...current.schedule,
          days: newDays,
        },
      };
    });
  };
  
  // Get action name
  const getActionName = (action: RuleAction): string => {
    switch (action) {
      case 'match_buy_box':
        return 'Match Buy Box Price';
      case 'beat_buy_box':
        return 'Beat Buy Box Price';
      case 'match_lowest':
        return 'Match Lowest Price';
      case 'beat_lowest':
        return 'Beat Lowest Price';
      case 'percentage_adjustment':
        return 'Percentage-Based Adjustment';
      case 'fixed_adjustment':
        return 'Fixed Amount Adjustment';
      case 'maintain_margin':
        return 'Maintain Profit Margin';
      default:
        return 'Unknown Action';
    }
  };
  
  // Get action description
  const getActionDescription = (action: RuleAction): string => {
    switch (action) {
      case 'match_buy_box':
        return 'Set your price equal to the current Buy Box winner price';
      case 'beat_buy_box':
        return 'Set your price lower than the current Buy Box winner price';
      case 'match_lowest':
        return 'Set your price equal to the lowest competitor price';
      case 'beat_lowest':
        return 'Set your price lower than the lowest competitor price';
      case 'percentage_adjustment':
        return 'Adjust your price by a percentage up or down';
      case 'fixed_adjustment':
        return 'Adjust your price by a fixed amount up or down';
      case 'maintain_margin':
        return 'Set price to maintain a specified profit margin';
      default:
        return 'Unknown action description';
    }
  };
  
  // Get action icon
  const getActionIcon = (action: RuleAction) => {
    switch (action) {
      case 'match_buy_box':
        return <IconShoppingCart size={24} />;
      case 'beat_buy_box':
        return <IconShoppingCart size={24} />;
      case 'match_lowest':
        return <IconTags size={24} />;
      case 'beat_lowest':
        return <IconTags size={24} />;
      case 'percentage_adjustment':
        return <IconPercentage size={24} />;
      case 'fixed_adjustment':
        return <IconCurrencyDollar size={24} />;
      case 'maintain_margin':
        return <IconAdjustments size={24} />;
      default:
        return <IconBulb size={24} />;
    }
  };
  
  // Format rule for display
  const formatRuleForDisplay = (): string => {
    let actionDescription = '';
    
    switch (rule.action) {
      case 'match_buy_box':
        actionDescription = 'Match Buy Box price exactly';
        break;
      case 'beat_buy_box':
        actionDescription = `Beat Buy Box price by ${rule.actionParams.amount}`;
        break;
      case 'match_lowest':
        actionDescription = 'Match lowest competitor price';
        break;
      case 'beat_lowest':
        actionDescription = `Beat lowest competitor price by ${rule.actionParams.amount}`;
        break;
      case 'percentage_adjustment':
        actionDescription = `${rule.actionParams.direction === 'increase' ? 'Increase' : 'Decrease'} price by ${
          rule.actionParams.percentage
        }%`;
        break;
      case 'fixed_adjustment':
        actionDescription = `${rule.actionParams.direction === 'increase' ? 'Increase' : 'Decrease'} price by ${
          rule.actionParams.amount
        }`;
        break;
      case 'maintain_margin':
        actionDescription = `Maintain minimum margin of ${rule.actionParams.minMarginPercent}%`;
        break;
    }
    
    return actionDescription;
  };
  
  // Get condition display text
  const getConditionText = (condition: RuleCondition): string => {
    const operatorMap: Record<string, string> = {
      equals: 'is',
      not_equals: 'is not',
      greater_than: 'is greater than',
      less_than: 'is less than',
      in: 'is one of',
      not_in: 'is not one of',
    };
    
    const typeMap: Record<string, string> = {
      buy_box_status: 'Buy Box status',
      competitor_count: 'Competitor count',
      marketplace: 'Marketplace',
      product_category: 'Product category',
      time_period: 'Time of day',
    };
    
    let valueDisplay = condition.value;
    
    // Format array values
    if (Array.isArray(condition.value)) {
      valueDisplay = condition.value.join(', ');
    }
    
    return `${typeMap[condition.type]} ${operatorMap[condition.operator]} ${valueDisplay}`;
  };
  
  // Get day name
  const getDayName = (day: number): string => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[day];
  };
  
  // Save the rule
  const saveRule = () => {
    onSave(rule);
  };
  
  // Handle initial animation of action cards
  useEffect(() => {
    if (activeStep === 1) {
      // Stagger animation for action cards
      const cards = Object.values(actionCardsRef.current).filter(Boolean) as HTMLDivElement[];
      
      gsap.fromTo(
        cards,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.08,
          ease: 'power2.out',
        }
      );
    }
  }, [activeStep]);
  
  return (
    <Paper withBorder p="lg" radius="md" ref={containerRef} className={classes.container}>
      {/* Stepper */}
      <div className={classes.stepperContainer} ref={stepperRef}>
        <Stepper active={activeStep} onStepClick={setActiveStep} breakpoint="sm">
          <Stepper.Step
            label="Basics"
            description="Name & Marketplaces"
            allowStepSelect={true}
          />
          <Stepper.Step
            label="Pricing Action"
            description="Define what happens"
            allowStepSelect={activeStep >= 1}
          />
          <Stepper.Step
            label="Conditions"
            description="When to apply"
            allowStepSelect={activeStep >= 2}
          />
          <Stepper.Step
            label="Review"
            description="Confirm & Save"
            allowStepSelect={activeStep >= 3}
          />
        </Stepper>
      </div>
      
      {/* Form content */}
      <ScrollArea style={{ height: 'calc(100vh - 350px)', minHeight: 300 }}>
        <div ref={formContentRef}>
          {/* Step 1: Rule Basics */}
          {activeStep === 0 && (
            <Stack spacing="lg">
              <div>
                <Title order={3} mb="md">Rule Basics</Title>
                
                <Stack spacing="md">
                  <TextInput
                    label="Rule Name"
                    description="Give this rule a descriptive name"
                    value={rule.name}
                    onChange={(e) => updateRule({ name: e.target.value })}
                    placeholder="e.g., 'Amazon Buy Box Price Matcher'"
                    required
                  />
                  
                  <MultiSelect
                    label="Marketplaces"
                    description="Select which marketplaces this rule applies to"
                    data={availableMarketplaces}
                    value={rule.marketplaces}
                    onChange={(value) => updateRule({ marketplaces: value })}
                    placeholder="Select marketplaces"
                    searchable
                    required
                  />
                  
                  <Group position="apart" align="center" mt="md">
                    <div>
                      <Text weight={500}>Rule Priority</Text>
                      <Text size="xs" color="dimmed">
                        Higher priority rules run first when multiple rules apply
                      </Text>
                    </div>
                    <NumberInput
                      value={rule.priority}
                      onChange={(value) => updateRule({ priority: value || 1 })}
                      min={1}
                      max={100}
                      size="sm"
                      style={{ width: 100 }}
                    />
                  </Group>
                  
                  <Switch
                    label="Enable this rule immediately after saving"
                    checked={rule.enabled}
                    onChange={(e) => updateRule({ enabled: e.currentTarget.checked })}
                    mt="xs"
                  />
                </Stack>
              </div>
            </Stack>
          )}
          
          {/* Step 2: Pricing Action */}
          {activeStep === 1 && (
            <Stack spacing="lg">
              <div>
                <Title order={3} mb="md">Pricing Action</Title>
                <Text color="dimmed" mb="lg">
                  Select how you want to adjust your prices
                </Text>
                
                <Group position="center" spacing="md" grow>
                  {/* Action: Match Buy Box */}
                  <Card
                    ref={(el) => (actionCardsRef.current.match_buy_box = el)}
                    className={cx(classes.actionCard, {
                      [classes.selectedAction]: rule.action === 'match_buy_box',
                    })}
                    withBorder
                    p="md"
                    onClick={() => selectAction('match_buy_box')}
                  >
                    <ThemeIcon size={40} radius="md" color="blue" variant="light" mb="sm">
                      <IconShoppingCart size={24} />
                    </ThemeIcon>
                    <Text className={classes.actionTitle}>Match Buy Box</Text>
                    <Text size="sm" color="dimmed" mt={4}>
                      Match the current Buy Box price exactly
                    </Text>
                  </Card>
                  
                  {/* Action: Beat Buy Box */}
                  <Card
                    ref={(el) => (actionCardsRef.current.beat_buy_box = el)}
                    className={cx(classes.actionCard, {
                      [classes.selectedAction]: rule.action === 'beat_buy_box',
                    })}
                    withBorder
                    p="md"
                    onClick={() => selectAction('beat_buy_box')}
                  >
                    <ThemeIcon size={40} radius="md" color="green" variant="light" mb="sm">
                      <IconShoppingCart size={24} />
                    </ThemeIcon>
                    <Text className={classes.actionTitle}>Beat Buy Box</Text>
                    <Text size="sm" color="dimmed" mt={4}>
                      Price slightly below Buy Box price
                    </Text>
                  </Card>
                </Group>
                
                <Group position="center" spacing="md" grow mt="md">
                  {/* Action: Match Lowest */}
                  <Card
                    ref={(el) => (actionCardsRef.current.match_lowest = el)}
                    className={cx(classes.actionCard, {
                      [classes.selectedAction]: rule.action === 'match_lowest',
                    })}
                    withBorder
                    p="md"
                    onClick={() => selectAction('match_lowest')}
                  >
                    <ThemeIcon size={40} radius="md" color="teal" variant="light" mb="sm">
                      <IconTags size={24} />
                    </ThemeIcon>
                    <Text className={classes.actionTitle}>Match Lowest</Text>
                    <Text size="sm" color="dimmed" mt={4}>
                      Match the lowest competitor price
                    </Text>
                  </Card>
                  
                  {/* Action: Beat Lowest */}
                  <Card
                    ref={(el) => (actionCardsRef.current.beat_lowest = el)}
                    className={cx(classes.actionCard, {
                      [classes.selectedAction]: rule.action === 'beat_lowest',
                    })}
                    withBorder
                    p="md"
                    onClick={() => selectAction('beat_lowest')}
                  >
                    <ThemeIcon size={40} radius="md" color="lime" variant="light" mb="sm">
                      <IconTags size={24} />
                    </ThemeIcon>
                    <Text className={classes.actionTitle}>Beat Lowest</Text>
                    <Text size="sm" color="dimmed" mt={4}>
                      Price slightly below lowest competitor
                    </Text>
                  </Card>
                </Group>
                
                <Group position="center" spacing="md" grow mt="md">
                  {/* Action: Percentage Adjustment */}
                  <Card
                    ref={(el) => (actionCardsRef.current.percentage_adjustment = el)}
                    className={cx(classes.actionCard, {
                      [classes.selectedAction]: rule.action === 'percentage_adjustment',
                    })}
                    withBorder
                    p="md"
                    onClick={() => selectAction('percentage_adjustment')}
                  >
                    <ThemeIcon size={40} radius="md" color="orange" variant="light" mb="sm">
                      <IconPercentage size={24} />
                    </ThemeIcon>
                    <Text className={classes.actionTitle}>Percentage Change</Text>
                    <Text size="sm" color="dimmed" mt={4}>
                      Adjust price by a percentage amount
                    </Text>
                  </Card>
                  
                  {/* Action: Fixed Adjustment */}
                  <Card
                    ref={(el) => (actionCardsRef.current.fixed_adjustment = el)}
                    className={cx(classes.actionCard, {
                      [classes.selectedAction]: rule.action === 'fixed_adjustment',
                    })}
                    withBorder
                    p="md"
                    onClick={() => selectAction('fixed_adjustment')}
                  >
                    <ThemeIcon size={40} radius="md" color="grape" variant="light" mb="sm">
                      <IconCurrencyDollar size={24} />
                    </ThemeIcon>
                    <Text className={classes.actionTitle}>Fixed Change</Text>
                    <Text size="sm" color="dimmed" mt={4}>
                      Adjust price by a fixed amount
                    </Text>
                  </Card>
                </Group>
                
                <Group position="center" spacing="md" grow mt="md">
                  {/* Action: Maintain Margin */}
                  <Card
                    ref={(el) => (actionCardsRef.current.maintain_margin = el)}
                    className={cx(classes.actionCard, {
                      [classes.selectedAction]: rule.action === 'maintain_margin',
                    })}
                    withBorder
                    p="md"
                    onClick={() => selectAction('maintain_margin')}
                  >
                    <ThemeIcon size={40} radius="md" color="indigo" variant="light" mb="sm">
                      <IconAdjustments size={24} />
                    </ThemeIcon>
                    <Text className={classes.actionTitle}>Maintain Margin</Text>
                    <Text size="sm" color="dimmed" mt={4}>
                      Keep a minimum profit margin
                    </Text>
                  </Card>
                </Group>
                
                {/* Action Parameters */}
                <Collapse in={rule.action !== ''} mt="xl">
                  <Paper withBorder p="md" radius="md">
                    <Title order={4} mb="md">
                      {getActionName(rule.action)} Settings
                    </Title>
                    
                    {/* Beat Buy Box Parameters */}
                    {rule.action === 'beat_buy_box' && (
                      <Stack spacing="md">
                        <NumberInput
                          label="Amount to beat Buy Box by"
                          description="How much lower your price will be than the Buy Box"
                          value={rule.actionParams.amount || 0.01}
                          onChange={(value) =>
                            updateRule({
                              actionParams: { ...rule.actionParams, amount: value || 0.01 },
                            })
                          }
                          precision={2}
                          min={0.01}
                          step={0.01}
                          icon={<IconCurrencyDollar size={18} />}
                          required
                        />
                      </Stack>
                    )}
                    
                    {/* Beat Lowest Parameters */}
                    {rule.action === 'beat_lowest' && (
                      <Stack spacing="md">
                        <NumberInput
                          label="Amount to beat lowest price by"
                          description="How much lower your price will be than the lowest competitor"
                          value={rule.actionParams.amount || 0.01}
                          onChange={(value) =>
                            updateRule({
                              actionParams: { ...rule.actionParams, amount: value || 0.01 },
                            })
                          }
                          precision={2}
                          min={0.01}
                          step={0.01}
                          icon={<IconCurrencyDollar size={18} />}
                          required
                        />
                      </Stack>
                    )}
                    
                    {/* Percentage Adjustment Parameters */}
                    {rule.action === 'percentage_adjustment' && (
                      <Stack spacing="md">
                        <Radio.Group
                          label="Adjustment Direction"
                          value={rule.actionParams.direction || 'decrease'}
                          onChange={(value) =>
                            updateRule({
                              actionParams: { ...rule.actionParams, direction: value },
                            })
                          }
                          required
                        >
                          <Radio value="decrease" label="Decrease price" />
                          <Radio value="increase" label="Increase price" />
                        </Radio.Group>
                        
                        <NumberInput
                          label="Percentage Amount"
                          description="By what percentage to adjust the price"
                          value={rule.actionParams.percentage || 5}
                          onChange={(value) =>
                            updateRule({
                              actionParams: { ...rule.actionParams, percentage: value || 5 },
                            })
                          }
                          min={0.1}
                          max={50}
                          precision={1}
                          step={0.5}
                          icon={<IconPercentage size={18} />}
                          required
                        />
                      </Stack>
                    )}
                    
                    {/* Fixed Adjustment Parameters */}
                    {rule.action === 'fixed_adjustment' && (
                      <Stack spacing="md">
                        <Radio.Group
                          label="Adjustment Direction"
                          value={rule.actionParams.direction || 'decrease'}
                          onChange={(value) =>
                            updateRule({
                              actionParams: { ...rule.actionParams, direction: value },
                            })
                          }
                          required
                        >
                          <Radio value="decrease" label="Decrease price" />
                          <Radio value="increase" label="Increase price" />
                        </Radio.Group>
                        
                        <NumberInput
                          label="Fixed Amount"
                          description="By what amount to adjust the price"
                          value={rule.actionParams.amount || 1}
                          onChange={(value) =>
                            updateRule({
                              actionParams: { ...rule.actionParams, amount: value || 1 },
                            })
                          }
                          precision={2}
                          min={0.01}
                          step={0.5}
                          icon={<IconCurrencyDollar size={18} />}
                          required
                        />
                      </Stack>
                    )}
                    
                    {/* Maintain Margin Parameters */}
                    {rule.action === 'maintain_margin' && (
                      <Stack spacing="md">
                        <Text weight={500} className={classes.sliderLabel}>
                          Minimum Margin: {rule.actionParams.minMarginPercent || 15}%
                        </Text>
                        <Slider
                          value={rule.actionParams.minMarginPercent || 15}
                          onChange={(value) =>
                            updateRule({
                              actionParams: { ...rule.actionParams, minMarginPercent: value },
                            })
                          }
                          min={5}
                          max={50}
                          step={1}
                          label={(value) => `${value}%`}
                          marks={[
                            { value: 5, label: '5%' },
                            { value: 15, label: '15%' },
                            { value: 30, label: '30%' },
                            { value: 50, label: '50%' },
                          ]}
                        />
                        
                        <Text weight={500} className={classes.sliderLabel} mt="md">
                          Target Margin: {rule.actionParams.targetMarginPercent || 20}%
                        </Text>
                        <Slider
                          value={rule.actionParams.targetMarginPercent || 20}
                          onChange={(value) =>
                            updateRule({
                              actionParams: { ...rule.actionParams, targetMarginPercent: value },
                            })
                          }
                          min={rule.actionParams.minMarginPercent || 5}
                          max={60}
                          step={1}
                          label={(value) => `${value}%`}
                          marks={[
                            { value: 20, label: '20%' },
                            { value: 40, label: '40%' },
                            { value: 60, label: '60%' },
                          ]}
                        />
                        
                        <Box mt="xs">
                          <Text size="sm" mb={4}>
                            Margin Preview:
                          </Text>
                          <div className={classes.marginPreview}>
                            <div
                              className={classes.profitMargin}
                              style={{
                                width: `${rule.actionParams.targetMarginPercent || 20}%`,
                              }}
                            />
                          </div>
                          <Group position="apart" mt={4}>
                            <Text size="xs" color="dimmed">
                              Cost
                            </Text>
                            <Text size="xs" color="dimmed">
                              Min: {rule.actionParams.minMarginPercent || 15}%
                            </Text>
                            <Text size="xs" color="dimmed">
                              Target: {rule.actionParams.targetMarginPercent || 20}%
                            </Text>
                          </Group>
                        </Box>
                      </Stack>
                    )}
                    
                    {/* Price Limits */}
                    <Divider label="Price Limits" labelPosition="center" mt="xl" mb="md" />
                    
                    <Group grow>
                      <NumberInput
                        label="Minimum Price"
                        description="Never go below this price"
                        value={rule.minPrice}
                        onChange={(value) => updateRule({ minPrice: value })}
                        precision={2}
                        min={0}
                        step={1}
                        icon={<IconCurrencyDollar size={18} />}
                        placeholder="Optional"
                      />
                      
                      <NumberInput
                        label="Maximum Price"
                        description="Never go above this price"
                        value={rule.maxPrice}
                        onChange={(value) => updateRule({ maxPrice: value })}
                        precision={2}
                        min={rule.minPrice || 0}
                        step={1}
                        icon={<IconCurrencyDollar size={18} />}
                        placeholder="Optional"
                      />
                    </Group>
                  </Paper>
                </Collapse>
              </div>
            </Stack>
          )}
          
          {/* Step 3: Conditions & Scheduling */}
          {activeStep === 2 && (
            <Stack spacing="lg">
              <div>
                <Title order={3} mb="md">Conditions & Scheduling</Title>
                
                <Paper withBorder p="md" radius="md" mb="lg">
                  <Group position="apart" mb="md">
                    <Text weight={600} size="lg">
                      Conditions
                    </Text>
                    <Tooltip label="Add a condition">
                      <ActionIcon
                        color="blue"
                        variant="light"
                        onClick={() =>
                          addCondition({
                            type: 'buy_box_status',
                            operator: 'equals',
                            value: true,
                          })
                        }
                      >
                        <IconPlus size={16} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                  
                  <Text color="dimmed" size="sm" mb="md">
                    Add conditions to determine when this rule applies
                  </Text>
                  
                  {rule.conditions.length === 0 ? (
                    <Text color="dimmed" size="sm" italic align="center" my="lg">
                      No conditions added yet. Rule will always apply during scheduled times.
                    </Text>
                  ) : (
                    <Stack spacing="xs">
                      {rule.conditions.map((condition, index) => (
                        <Group
                          key={index}
                          position="apart"
                          p="xs"
                          sx={(theme) => ({
                            borderRadius: theme.radius.sm,
                            backgroundColor:
                              theme.colorScheme === 'dark'
                                ? theme.colors.dark[6]
                                : theme.colors.gray[0],
                          })}
                        >
                          <Text size="sm">{getConditionText(condition)}</Text>
                          <ActionIcon
                            color="red"
                            variant="subtle"
                            onClick={() => removeCondition(index)}
                          >
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Group>
                      ))}
                    </Stack>
                  )}
                </Paper>
                
                <Paper withBorder p="md" radius="md">
                  <Text weight={600} size="lg" mb="md">
                    Scheduling
                  </Text>
                  
                  <Stack spacing="md">
                    <Radio.Group
                      label="Schedule Type"
                      description="When should this rule run?"
                      value={rule.schedule.type}
                      onChange={(value) =>
                        updateRule({
                          schedule: { ...rule.schedule, type: value as RuleSchedule['type'] },
                        })
                      }
                      required
                    >
                      <Radio value="once" label="Run once (immediate)" />
                      <Radio value="daily" label="Run daily" />
                      <Radio value="weekly" label="Run on specific days" />
                      <Radio value="custom" label="Custom schedule" />
                    </Radio.Group>
                    
                    {/* Daily schedule options */}
                    {rule.schedule.type === 'daily' && (
                      <Group grow mt="xs">
                        <TimeInput
                          label="Start Time"
                          value={rule.schedule.timeStart || '08:00'}
                          onChange={(e) =>
                            updateRule({
                              schedule: { ...rule.schedule, timeStart: e.target.value },
                            })
                          }
                          withAsterisk
                        />
                        
                        <TimeInput
                          label="End Time"
                          value={rule.schedule.timeEnd || '20:00'}
                          onChange={(e) =>
                            updateRule({
                              schedule: { ...rule.schedule, timeEnd: e.target.value },
                            })
                          }
                          withAsterisk
                        />
                      </Group>
                    )}
                    
                    {/* Weekly schedule options */}
                    {rule.schedule.type === 'weekly' && (
                      <>
                        <div>
                          <Text weight={500} size="sm" mb="xs">
                            Run on these days:
                          </Text>
                          <div className={classes.daysGroup}>
                            {[0, 1, 2, 3, 4, 5, 6].map((day) => (
                              <div
                                key={day}
                                className={cx(classes.dayButton, {
                                  [classes.selectedDay]: rule.schedule.days?.includes(day),
                                })}
                                onClick={() => toggleDay(day)}
                              >
                                {getDayName(day)}
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <Group grow mt="xs">
                          <TimeInput
                            label="Start Time"
                            value={rule.schedule.timeStart || '08:00'}
                            onChange={(e) =>
                              updateRule({
                                schedule: { ...rule.schedule, timeStart: e.target.value },
                              })
                            }
                            withAsterisk
                          />
                          
                          <TimeInput
                            label="End Time"
                            value={rule.schedule.timeEnd || '20:00'}
                            onChange={(e) =>
                              updateRule({
                                schedule: { ...rule.schedule, timeEnd: e.target.value },
                              })
                            }
                            withAsterisk
                          />
                        </Group>
                      </>
                    )}
                    
                    {/* Custom schedule options */}
                    {rule.schedule.type === 'custom' && (
                      <NumberInput
                        label="Repeat every (hours)"
                        description="How often to repeat this rule"
                        value={rule.schedule.repeatEvery || 4}
                        onChange={(value) =>
                          updateRule({
                            schedule: { ...rule.schedule, repeatEvery: value },
                          })
                        }
                        min={1}
                        max={24}
                        step={1}
                        icon={<IconRepeat size={18} />}
                        required
                      />
                    )}
                  </Stack>
                </Paper>
              </div>
            </Stack>
          )}
          
          {/* Step 4: Review & Save */}
          {activeStep === 3 && (
            <Stack spacing="lg">
              <div>
                <Title order={3} mb="md">Review & Save Rule</Title>
                
                <Paper withBorder p="lg" radius="md">
                  <Group position="apart" mb="lg">
                    <div>
                      <Text weight={700} size="xl">
                        {rule.name}
                      </Text>
                      <Group spacing={8} mt={4}>
                        <Badge color={rule.enabled ? 'green' : 'gray'}>
                          {rule.enabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                        <Badge color="blue">Priority: {rule.priority}</Badge>
                      </Group>
                    </div>
                    
                    <ThemeIcon size={42} radius="md" color="blue">
                      {getActionIcon(rule.action)}
                    </ThemeIcon>
                  </Group>
                  
                  <Stack spacing="xl">
                    <div>
                      <Text weight={600} size="lg" color="blue" mb="xs">
                        Marketplaces
                      </Text>
                      <Group spacing={6}>
                        {rule.marketplaces.map((marketplace) => (
                          <Badge key={marketplace} size="lg">
                            {availableMarketplaces.find((m) => m.value === marketplace)?.label ||
                              marketplace}
                          </Badge>
                        ))}
                      </Group>
                    </div>
                    
                    <div>
                      <Text weight={600} size="lg" color="blue" mb="xs">
                        Pricing Action
                      </Text>
                      <Group mb="xs">
                        <ThemeIcon size="md" color="blue" variant="light">
                          <IconArrowRight size={16} />
                        </ThemeIcon>
                        <Text size="lg" weight={500}>
                          {getActionName(rule.action)}
                        </Text>
                      </Group>
                      <Text ml={28}>{formatRuleForDisplay()}</Text>
                      
                      {(rule.minPrice || rule.maxPrice) && (
                        <Group ml={28} mt="xs">
                          {rule.minPrice && (
                            <Badge color="blue" variant="outline">
                              Min: ${rule.minPrice}
                            </Badge>
                          )}
                          {rule.maxPrice && (
                            <Badge color="blue" variant="outline">
                              Max: ${rule.maxPrice}
                            </Badge>
                          )}
                        </Group>
                      )}
                    </div>
                    
                    <div>
                      <Text weight={600} size="lg" color="blue" mb="xs">
                        Schedule
                      </Text>
                      <Group mb="xs">
                        <ThemeIcon size="md" color="blue" variant="light">
                          <IconCalendarTime size={16} />
                        </ThemeIcon>
                        <Text weight={500}>
                          {rule.schedule.type === 'once'
                            ? 'Run once immediately'
                            : rule.schedule.type === 'daily'
                            ? 'Run daily'
                            : rule.schedule.type === 'weekly'
                            ? 'Run on specific days'
                            : 'Custom schedule'}
                        </Text>
                      </Group>
                      
                      {rule.schedule.type === 'daily' && (
                        <Text ml={28}>
                          Every day from {rule.schedule.timeStart} to {rule.schedule.timeEnd}
                        </Text>
                      )}
                      
                      {rule.schedule.type === 'weekly' && (
                        <Text ml={28}>
                          {rule.schedule.days
                            ?.map((day) => getDayName(day))
                            .join(', ') || 'No days selected'}{' '}
                          from {rule.schedule.timeStart} to {rule.schedule.timeEnd}
                        </Text>
                      )}
                      
                      {rule.schedule.type === 'custom' && (
                        <Text ml={28}>
                          Repeat every {rule.schedule.repeatEvery} hour
                          {rule.schedule.repeatEvery !== 1 ? 's' : ''}
                        </Text>
                      )}
                    </div>
                    
                    {rule.conditions.length > 0 && (
                      <div>
                        <Text weight={600} size="lg" color="blue" mb="xs">
                          Conditions
                        </Text>
                        <Stack spacing="xs" ml={6}>
                          {rule.conditions.map((condition, index) => (
                            <Group key={index} spacing={8}>
                              <ThemeIcon size="sm" color="blue" variant="light">
                                <IconCheck size={12} />
                              </ThemeIcon>
                              <Text size="sm">{getConditionText(condition)}</Text>
                            </Group>
                          ))}
                        </Stack>
                      </div>
                    )}
                  </Stack>
                </Paper>
              </div>
            </Stack>
          )}
        </div>
      </ScrollArea>
      
      {/* Navigation buttons */}
      <Group position="apart" mt="xl">
        {activeStep > 0 ? (
          <Button variant="default" onClick={prevStep}>
            Back
          </Button>
        ) : (
          <Button variant="default" onClick={onCancel}>
            Cancel
          </Button>
        )}
        
        {activeStep === 3 ? (
          <Button onClick={saveRule} loading={isSaving}>
            {initialRule?.id ? 'Update Rule' : 'Create Rule'}
          </Button>
        ) : (
          <Button onClick={nextStep} rightIcon={<IconChevronRight size={14} />}>
            Continue
          </Button>
        )}
      </Group>
    </Paper>
  );
};

// Helper component for time input
const TimeInput: React.FC<{
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  withAsterisk?: boolean;
}> = ({ label, value, onChange, withAsterisk }) => {
  return (
    <div>
      <Text component="label" size="sm" weight={500} mb={4} display="block">
        {label}
        {withAsterisk && <span style={{ color: 'red' }}>*</span>}
      </Text>
      <input
        type="time"
        value={value}
        onChange={onChange}
        style={{
          width: '100%',
          padding: '8px 12px',
          borderRadius: '4px',
          border: '1px solid #ccc',
        }}
      />
    </div>
  );
};

export default RuleBuilder;