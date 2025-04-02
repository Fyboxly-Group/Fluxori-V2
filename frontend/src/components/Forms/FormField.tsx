import React, { useState, useEffect } from 'react';
import {
  TextInput,
  TextInputProps,
  NumberInput,
  NumberInputProps,
  Select,
  SelectProps,
  Textarea,
  TextareaProps,
  Checkbox,
  CheckboxProps,
  Switch,
  SwitchProps,
  PasswordInput,
  PasswordInputProps,
  Autocomplete,
  AutocompleteProps,
  MultiSelect,
  MultiSelectProps,
  ColorInput,
  ColorInputProps,
  Box,
  Text,
  createStyles,
  Tooltip,
  Group,
  ActionIcon,
  Collapse,
  rem,
} from '@mantine/core';
import { useInputState, useDisclosure, useHover } from '@mantine/hooks';
import { IconInfoCircle, IconCircleCheck, IconAlertTriangle } from '@tabler/icons-react';
import gsap from 'gsap';

// Create styles for the component
const useStyles = createStyles((theme) => ({
  formField: {
    position: 'relative',
    marginBottom: theme.spacing.md,
  },
  label: {
    marginBottom: rem(4),
    fontWeight: 500,
    fontSize: theme.fontSizes.sm,
  },
  required: {
    color: theme.colors.red[theme.colorScheme === 'dark' ? 5 : 7],
  },
  optional: {
    color: theme.colors.gray[theme.colorScheme === 'dark' ? 5 : 6],
    fontSize: theme.fontSizes.xs,
    fontWeight: 400,
  },
  description: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.gray[theme.colorScheme === 'dark' ? 5 : 6],
    marginTop: rem(4),
  },
  infoIcon: {
    color: theme.colors.gray[theme.colorScheme === 'dark' ? 5 : 6],
    '&:hover': {
      color: theme.colors.blue[theme.colorScheme === 'dark' ? 5 : 6],
    },
  },
  successIcon: {
    color: theme.colors.green[theme.colorScheme === 'dark' ? 5 : 7],
  },
  warningIcon: {
    color: theme.colors.yellow[theme.colorScheme === 'dark' ? 5 : 7],
  },
}));

// Base props for all field types
interface BaseFieldProps {
  label?: string;
  description?: string;
  required?: boolean;
  error?: string;
  info?: string;
  success?: boolean;
  warning?: string;
  labelProps?: React.ComponentPropsWithoutRef<'label'>;
  wrapperProps?: React.ComponentPropsWithoutRef<'div'>;
  showOptionalLabel?: boolean;
  animateOnMount?: boolean;
  animateOnError?: boolean;
  animateOnSuccess?: boolean;
}

// Specific field type props
export interface TextFieldProps extends TextInputProps, BaseFieldProps {}
export interface NumberFieldProps extends NumberInputProps, BaseFieldProps {}
export interface SelectFieldProps extends SelectProps, BaseFieldProps {}
export interface TextareaFieldProps extends TextareaProps, BaseFieldProps {}
export interface CheckboxFieldProps extends CheckboxProps, BaseFieldProps {}
export interface SwitchFieldProps extends SwitchProps, BaseFieldProps {}
export interface PasswordFieldProps extends PasswordInputProps, BaseFieldProps {}
export interface AutocompleteFieldProps extends AutocompleteProps, BaseFieldProps {}
export interface MultiSelectFieldProps extends MultiSelectProps, BaseFieldProps {}
export interface ColorFieldProps extends ColorInputProps, BaseFieldProps {}

// Union type for all field props
type FieldProps = 
  | TextFieldProps 
  | NumberFieldProps 
  | SelectFieldProps 
  | TextareaFieldProps 
  | CheckboxFieldProps 
  | SwitchFieldProps 
  | PasswordFieldProps 
  | AutocompleteFieldProps 
  | MultiSelectFieldProps 
  | ColorFieldProps;

/**
 * Base Form Field component that handles common patterns and animations
 */
const FormField = <T extends FieldProps>(
  props: T & { component: React.ComponentType<any> }
) => {
  const {
    label,
    description,
    required,
    error,
    info,
    success,
    warning,
    labelProps,
    wrapperProps,
    showOptionalLabel = true,
    animateOnMount = true,
    animateOnError = true,
    animateOnSuccess = true,
    component: Component,
    ...rest
  } = props;
  
  const { classes, cx } = useStyles();
  const [mounted, setMounted] = useState(false);
  const [shouldShake, setShouldShake] = useState(false);
  const [prevError, setPrevError] = useState<string | undefined>(error);
  const [prevSuccess, setPrevSuccess] = useState(success);
  const fieldRef = React.useRef<HTMLDivElement>(null);
  
  // Handle animations
  useEffect(() => {
    if (!mounted) {
      setMounted(true);
      
      if (animateOnMount && fieldRef.current) {
        gsap.fromTo(
          fieldRef.current,
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
        );
      }
    }
  }, [mounted, animateOnMount]);
  
  // Handle error animation
  useEffect(() => {
    if (mounted && animateOnError && error && error !== prevError && fieldRef.current) {
      // Shake animation
      gsap.timeline()
        .to(fieldRef.current, { x: -6, duration: 0.1 })
        .to(fieldRef.current, { x: 6, duration: 0.1 })
        .to(fieldRef.current, { x: -6, duration: 0.1 })
        .to(fieldRef.current, { x: 6, duration: 0.1 })
        .to(fieldRef.current, { x: 0, duration: 0.1 });
    }
    
    setPrevError(error);
  }, [error, prevError, mounted, animateOnError]);
  
  // Handle success animation
  useEffect(() => {
    if (mounted && animateOnSuccess && success && !prevSuccess && fieldRef.current) {
      gsap.fromTo(
        fieldRef.current.querySelector('.success-icon'),
        { scale: 0 },
        { scale: 1, duration: 0.4, ease: 'back.out(1.7)' }
      );
    }
    
    setPrevSuccess(success);
  }, [success, prevSuccess, mounted, animateOnSuccess]);
  
  // Render the right icon for the input
  const renderRightSection = () => {
    if (success) {
      return (
        <ActionIcon className="success-icon">
          <IconCircleCheck className={classes.successIcon} size={18} />
        </ActionIcon>
      );
    }
    
    if (warning) {
      return (
        <Tooltip label={warning} position="top-end" withArrow>
          <ActionIcon>
            <IconAlertTriangle className={classes.warningIcon} size={18} />
          </ActionIcon>
        </Tooltip>
      );
    }
    
    if (info) {
      return (
        <Tooltip label={info} position="top-end" withArrow multiline width={220}>
          <ActionIcon>
            <IconInfoCircle className={classes.infoIcon} size={18} />
          </ActionIcon>
        </Tooltip>
      );
    }
    
    return null;
  };
  
  // Special case for checkbox and switch
  const isToggleInput = 
    Component === Checkbox || 
    Component === Switch;
  
  return (
    <Box className={classes.formField} ref={fieldRef} {...wrapperProps}>
      {!isToggleInput && label && (
        <Group spacing="xs" mb={4}>
          <Text component="label" htmlFor={rest.id} className={classes.label} {...labelProps}>
            {label}
            {required && <span className={classes.required}> *</span>}
            {!required && showOptionalLabel && (
              <Text component="span" className={classes.optional}> (Optional)</Text>
            )}
          </Text>
        </Group>
      )}
      
      <Component
        required={required}
        error={error}
        rightSection={!isToggleInput ? renderRightSection() : undefined}
        label={isToggleInput ? label : undefined}
        description={isToggleInput ? description : undefined}
        {...rest}
      />
      
      {!isToggleInput && description && (
        <Text className={classes.description}>{description}</Text>
      )}
    </Box>
  );
};

/**
 * Text input field with animation and consistent styling
 */
export const TextField: React.FC<TextFieldProps> = (props) => (
  <FormField {...props} component={TextInput} />
);

/**
 * Number input field with animation and consistent styling
 */
export const NumberField: React.FC<NumberFieldProps> = (props) => (
  <FormField {...props} component={NumberInput} />
);

/**
 * Select field with animation and consistent styling
 */
export const SelectField: React.FC<SelectFieldProps> = (props) => (
  <FormField {...props} component={Select} />
);

/**
 * Textarea field with animation and consistent styling
 */
export const TextareaField: React.FC<TextareaFieldProps> = (props) => (
  <FormField {...props} component={Textarea} />
);

/**
 * Checkbox field with animation and consistent styling
 */
export const CheckboxField: React.FC<CheckboxFieldProps> = (props) => (
  <FormField {...props} component={Checkbox} />
);

/**
 * Switch field with animation and consistent styling
 */
export const SwitchField: React.FC<SwitchFieldProps> = (props) => (
  <FormField {...props} component={Switch} />
);

/**
 * Password field with animation and consistent styling
 */
export const PasswordField: React.FC<PasswordFieldProps> = (props) => (
  <FormField {...props} component={PasswordInput} />
);

/**
 * Autocomplete field with animation and consistent styling
 */
export const AutocompleteField: React.FC<AutocompleteFieldProps> = (props) => (
  <FormField {...props} component={Autocomplete} />
);

/**
 * MultiSelect field with animation and consistent styling
 */
export const MultiSelectField: React.FC<MultiSelectFieldProps> = (props) => (
  <FormField {...props} component={MultiSelect} />
);

/**
 * Color input field with animation and consistent styling
 */
export const ColorField: React.FC<ColorFieldProps> = (props) => (
  <FormField {...props} component={ColorInput} />
);

export default {
  TextField,
  NumberField,
  SelectField,
  TextareaField,
  CheckboxField,
  SwitchField,
  PasswordField,
  AutocompleteField,
  MultiSelectField,
  ColorField,
};