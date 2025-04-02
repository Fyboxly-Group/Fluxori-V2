/// <reference path="../../../types/module-declarations.d.ts" />
'use client';

;
;
;
;
;
;
;
import React from 'react';
import { FormLabel } from '@/utils/chakra-compat';;;
;
;
;
;
;
import { useWarehouse } from '../hooks/useWarehouse';

import { convertChakraProps, withAriaLabel } from '@/utils';

interface WarehouseSelectorProps {
  value: string;
  onChange: (warehouseId: string) => void;
  label?: string;
  placeholder?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  required?: boolean;
  disabled?: boolean;
  showDefault?: boolean;
}

export function WarehouseSelector({
  value,
  onChange,
  label = 'Warehouse',
  placeholder = 'Select warehouse',
  size = 'md',
  required = false,
  disabled = false,
  showDefault = true,
}: WarehouseSelectorProps) {
  const { useWarehouses } = useWarehouse();
  const { data: warehousesResponse, loading, error } = useWarehouses({ active: true });

  if (loading) {
    return (
      <FormControl required={required} disabled={disabled}>
        {label && <FormLabel>{label}</FormLabel>}
        <HStack>
          <Spinner size="sm"   />
          <Text fontSize="sm">Loading warehouses...</Text>
        </HStack>
      </FormControl>
    );
  }

  if (error || !warehousesResponse) {
    return (
      <FormControl required={required} disabled={disabled}>
        {label && <FormLabel>{label}</FormLabel>}
        <Text color="red.500" fontSize="sm">Error loading warehouses</Text>
      </FormControl>
    );
  }

  const warehouses = (warehousesResponse as any).data || [];

  if (warehouses.length === 0) {
    return (
      <FormControl required={required} disabled={disabled}>
        {label && <FormLabel>{label}</FormLabel>}
        <Text fontSize="sm">No warehouses available</Text>
      </FormControl>
    );
  }

  return (
    <FormControl required={required} disabled={disabled}>
      {label && <FormLabel>{label}</FormLabel>}
      <Select
        value={value}
        onChange={(e: any) => onChange(e.target.value)}
        placeholder={placeholder}
        size={size}
      >
        {(warehouses as any[]).map((warehouse: any) => (
          <option key={warehouse._id} value={warehouse._id}>
            {warehouse.name} ({warehouse.code})
            {showDefault && warehouse.isDefault && ' (Default)'}
          </option>
        ))}
      </Select>
    </FormControl>
  );
}

export default WarehouseSelector;