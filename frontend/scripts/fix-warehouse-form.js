#!/usr/bin/env node

/**
 * Fix WarehouseForm component
 * 
 * This script fixes the WarehouseForm component which has syntax issues
 */

const fs = require('fs');
const path = require('path');

// Root directory
const ROOT_DIR = process.cwd();

function fixWarehouseForm() {
  console.log('🔍 Fixing WarehouseForm component...');
  
  const filePath = path.join(ROOT_DIR, 'src/features/warehouse/components/WarehouseForm.tsx');
  
  if (fs.existsSync(filePath)) {
    // Provide a clean implementation
    const fixedContent = `'use client';

import { useState, useEffect } from 'react';
import { HStack, VStack } from '@chakra-ui/react/stack';
import { Grid, GridItem } from '@chakra-ui/react/layout';
import { Card, CardHeader, CardBody, CardFooter } from '@chakra-ui/react/card';
import { FormControl, FormLabel, FormErrorMessage, FormHelperText } from '@chakra-ui/react/form-control';
import { Alert, AlertIcon } from '@chakra-ui/react/alert';
import { Input } from '@chakra-ui/react/input';
import { Textarea } from '@chakra-ui/react/textarea';
import { Checkbox } from '@chakra-ui/react/checkbox';
import { Button } from '@chakra-ui/react/button';
import { Heading } from '@chakra-ui/react/heading';
import { Box } from '@chakra-ui/react/box';
import { Spinner } from '@chakra-ui/react/spinner';
import { Text } from '@chakra-ui/react/text';
import { useWarehouse } from '../hooks/useWarehouse';

// Define form state interface
interface FormState {
  name: string;
  code: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  notes: string;
  active: boolean;
  isDefault: boolean;
}

// Define form errors interface
interface FormErrors {
  name?: string;
  code?: string;
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  contactEmail?: string;
}

// Component props
interface WarehouseFormProps {
  warehouseId?: string;
  onClose: () => void;
}

export function WarehouseForm({ warehouseId, onClose }: WarehouseFormProps) {
  const isEditMode = !!warehouseId;
  
  // Form state
  const [formState, setFormState] = useState<FormState>({
    name: '',
    code: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',
    notes: '',
    active: true,
    isDefault: false,
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  
  const { 
    useWarehouseById, 
    useCreateWarehouse, 
    useUpdateWarehouse 
  } = useWarehouse();
  
  const { data: warehouse, isLoading: isLoadingWarehouse } = useWarehouseById(warehouseId || '');
  const { mutate: createWarehouse, isPending: isCreating } = useCreateWarehouse();
  const { mutate: updateWarehouse, isPending: isUpdating } = useUpdateWarehouse();
  
  useEffect(() => {
    if (isEditMode && warehouse) {
      setFormState({
        name: warehouse.name,
        code: warehouse.code,
        street: warehouse.address?.street || '',
        city: warehouse.address?.city || '',
        state: warehouse.address?.state || '',
        postalCode: warehouse.address?.postalCode || '',
        country: warehouse.address?.country || '',
        contactPerson: warehouse.contactPerson || '',
        contactEmail: warehouse.contactEmail || '',
        contactPhone: warehouse.contactPhone || '',
        notes: warehouse.notes || '',
        active: warehouse.active || true,
        isDefault: warehouse.isDefault || false,
      });
    }
  }, [isEditMode, warehouse]);
  
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
    
    // Clear error for this field if it exists
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };
  
  const handleCheckboxChange = (
    name: string,
    checked: boolean,
  ) => {
    setFormState((prev) => ({ ...prev, [name]: checked }));
  };
  
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formState.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formState.code.trim()) {
      newErrors.code = 'Code is required';
    } else if (!/^[A-Za-z0-9-_]+$/.test(formState.code)) {
      newErrors.code = 'Code can only contain letters, numbers, hyphens, and underscores';
    }
    
    if (!formState.street.trim()) {
      newErrors.street = 'Street address is required';
    }
    
    if (!formState.city.trim()) {
      newErrors.city = 'City is required';
    }
    
    if (!formState.state.trim()) {
      newErrors.state = 'State/Province is required';
    }
    
    if (!formState.postalCode.trim()) {
      newErrors.postalCode = 'Postal code is required';
    }
    
    if (!formState.country.trim()) {
      newErrors.country = 'Country is required';
    }
    
    if (formState.contactEmail && !/^\\S+@\\S+\\.\\S+$/.test(formState.contactEmail)) {
      newErrors.contactEmail = 'Invalid email format';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = () => {
    if (!validateForm()) return;
    
    const warehouseData = {
      name: formState.name,
      code: formState.code,
      address: {
        street: formState.street,
        city: formState.city,
        state: formState.state,
        postalCode: formState.postalCode,
        country: formState.country,
      },
      contactPerson: formState.contactPerson,
      contactEmail: formState.contactEmail,
      contactPhone: formState.contactPhone,
      notes: formState.notes,
      active: formState.active,
      isDefault: formState.isDefault,
    };
    
    if (isEditMode && warehouseId) {
      updateWarehouse(
        {
          id: warehouseId,
          data: warehouseData,
        },
        {
          onSuccess: () => {
            onClose();
          },
        }
      );
    } else {
      createWarehouse(warehouseData, {
        onSuccess: () => {
          onClose();
        },
      });
    }
  };
  
  if (isEditMode && isLoadingWarehouse) {
    return (
      <Box textAlign="center" py={6}>
        <Spinner size="md" />
        <Text mt={2}>Loading warehouse details...</Text>
      </Box>
    );
  }
  
  return (
    <Card variant="outline">
      <CardHeader>
        <Heading size="md">{isEditMode ? 'Edit Warehouse' : 'Add Warehouse'}</Heading>
      </CardHeader>
      
      <CardBody>
        <VStack gap={6} align="stretch">
          <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
            <GridItem>
              <FormControl isRequired isInvalid={!!errors.name}>
                <FormLabel>Name</FormLabel>
                <Input
                  name="name"
                  value={formState.name}
                  onChange={handleChange}
                  placeholder="Warehouse name"
                />
                {errors.name && <FormErrorMessage>{errors.name}</FormErrorMessage>}
              </FormControl>
            </GridItem>
            
            <GridItem>
              <FormControl isRequired isInvalid={!!errors.code}>
                <FormLabel>Code</FormLabel>
                <Input
                  name="code"
                  value={formState.code}
                  onChange={handleChange}
                  placeholder="WHSE1"
                  textTransform="uppercase"
                />
                <FormHelperText>
                  Short code to identify this warehouse (ex: WHSE1, WEST, EAST)
                </FormHelperText>
                {errors.code && <FormErrorMessage>{errors.code}</FormErrorMessage>}
              </FormControl>
            </GridItem>
          </Grid>
          
          <Heading size="sm" mt={2}>
            Address Information
          </Heading>
          
          <FormControl isRequired isInvalid={!!errors.street}>
            <FormLabel>Street Address</FormLabel>
            <Input
              name="street"
              value={formState.street}
              onChange={handleChange}
              placeholder="123 Warehouse Street"
            />
            {errors.street && <FormErrorMessage>{errors.street}</FormErrorMessage>}
          </FormControl>
          
          <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
            <GridItem>
              <FormControl isRequired isInvalid={!!errors.city}>
                <FormLabel>City</FormLabel>
                <Input
                  name="city"
                  value={formState.city}
                  onChange={handleChange}
                  placeholder="City"
                />
                {errors.city && <FormErrorMessage>{errors.city}</FormErrorMessage>}
              </FormControl>
            </GridItem>
            
            <GridItem>
              <FormControl isRequired isInvalid={!!errors.state}>
                <FormLabel>State/Province</FormLabel>
                <Input
                  name="state"
                  value={formState.state}
                  onChange={handleChange}
                  placeholder="State"
                />
                {errors.state && <FormErrorMessage>{errors.state}</FormErrorMessage>}
              </FormControl>
            </GridItem>
            
            <GridItem>
              <FormControl isRequired isInvalid={!!errors.postalCode}>
                <FormLabel>Postal Code</FormLabel>
                <Input
                  name="postalCode"
                  value={formState.postalCode}
                  onChange={handleChange}
                  placeholder="Postal Code"
                />
                {errors.postalCode && <FormErrorMessage>{errors.postalCode}</FormErrorMessage>}
              </FormControl>
            </GridItem>
          </Grid>
          
          <FormControl isRequired isInvalid={!!errors.country}>
            <FormLabel>Country</FormLabel>
            <Input
              name="country"
              value={formState.country}
              onChange={handleChange}
              placeholder="Country"
            />
            {errors.country && <FormErrorMessage>{errors.country}</FormErrorMessage>}
          </FormControl>
          
          <Heading size="sm" mt={2}>
            Contact Information
          </Heading>
          
          <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
            <GridItem>
              <FormControl>
                <FormLabel>Contact Person</FormLabel>
                <Input
                  name="contactPerson"
                  value={formState.contactPerson}
                  onChange={handleChange}
                  placeholder="Contact name"
                />
              </FormControl>
            </GridItem>
            
            <GridItem>
              <FormControl isInvalid={!!errors.contactEmail}>
                <FormLabel>Email</FormLabel>
                <Input
                  name="contactEmail"
                  value={formState.contactEmail}
                  onChange={handleChange}
                  placeholder="contact@example.com"
                  type="email"
                />
                {errors.contactEmail && <FormErrorMessage>{errors.contactEmail}</FormErrorMessage>}
              </FormControl>
            </GridItem>
            
            <GridItem>
              <FormControl>
                <FormLabel>Phone</FormLabel>
                <Input
                  name="contactPhone"
                  value={formState.contactPhone}
                  onChange={handleChange}
                  placeholder="Phone number"
                />
              </FormControl>
            </GridItem>
          </Grid>
          
          <FormControl>
            <FormLabel>Notes</FormLabel>
            <Textarea
              name="notes"
              value={formState.notes}
              onChange={handleChange}
              placeholder="Additional notes about this warehouse"
              rows={3}
            />
          </FormControl>
          
          <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
            <GridItem>
              <FormControl>
                <Checkbox
                  checked={formState.active}
                  onChange={(e) => handleCheckboxChange('active', e.target.checked)}
                >
                  Active Warehouse
                </Checkbox>
                <FormHelperText>
                  Inactive warehouses won't appear in inventory allocation options
                </FormHelperText>
              </FormControl>
            </GridItem>
            
            <GridItem>
              <FormControl>
                <Checkbox
                  checked={formState.isDefault}
                  onChange={(e) => handleCheckboxChange('isDefault', e.target.checked)}
                >
                  Default Warehouse
                </Checkbox>
                <FormHelperText>
                  This warehouse will be used as the default for new inventory
                </FormHelperText>
              </FormControl>
            </GridItem>
          </Grid>
          
          {isEditMode && formState.isDefault && (
            <Alert status="info">
              <AlertIcon />
              <Text fontSize="sm">
                This warehouse is set as the default. Changing this will make new inventory be assigned to this warehouse.
              </Text>
            </Alert>
          )}
        </VStack>
      </CardBody>
      
      <CardFooter>
        <HStack gap={4}>
          <Button
            colorScheme="blue"
            onClick={handleSubmit}
            isLoading={isCreating || isUpdating}
          >
            {isEditMode ? 'Update Warehouse' : 'Create Warehouse'}
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </HStack>
      </CardFooter>
    </Card>
  );
}`;
    
    fs.writeFileSync(filePath, fixedContent, { mode: 0o644 });
    console.log(`✅ Fixed ${path.relative(ROOT_DIR, filePath)}`);
    return true;
  } else {
    console.warn(`⚠️ File does not exist: ${filePath}`);
    return false;
  }
}

function main() {
  try {
    console.log('🚀 Starting WarehouseForm fix script');
    
    // Fix the component
    fixWarehouseForm();
    
    console.log('✅ All fixes applied');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();