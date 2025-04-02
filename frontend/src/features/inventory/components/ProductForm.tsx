import React, { useState, useEffect } from 'react';
import {
  Grid,
  Button,
  Group,
  Box,
  Stack,
  Card,
  Badge,
  Divider,
  Text,
  Tabs,
  ActionIcon,
  Tooltip,
  NumberInput,
  Select,
  TextInput,
  Textarea,
  SimpleGrid,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { useRouter } from 'next/navigation';
import { useAnimatedMount } from '@/hooks/useAnimation';
import FormSection from '@/components/Forms/FormSection';
import {
  TextField,
  NumberField,
  SelectField,
  TextareaField,
  CheckboxField,
  SwitchField,
  MultiSelectField,
} from '@/components/Forms/FormField';
import FileUpload from '@/components/Forms/FileUpload';
import {
  IconDeviceFloppy,
  IconX,
  IconArrowLeft,
  IconPackage,
  IconTags,
  IconTruckDelivery,
  IconBuildingWarehouse,
  IconInfoCircle,
  IconCloudUpload,
  IconPencil,
  IconTrash,
} from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { showSuccessNotification, showErrorNotification } from '@/utils/notifications';
import gsap from 'gsap';

// Define the product form data structure
export interface ProductFormData {
  id?: string;
  sku: string;
  name: string;
  description: string;
  price: number;
  costPrice: number;
  taxable: boolean;
  taxRate: number;
  categories: string[];
  tags: string[];
  barcode: string;
  weight: number;
  weightUnit: 'kg' | 'lb';
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  dimensionUnit: 'cm' | 'in';
  inventoryTracking: boolean;
  lowStockThreshold: number;
  stockQuantity: number;
  status: 'active' | 'draft' | 'archived';
  brand: string;
  supplier: string;
  manufacturerPartNumber: string;
  images: File[];
  variants: {
    id: string;
    name: string;
    sku: string;
    price: number;
    stock: number;
    attributes: Record<string, string>;
  }[];
  attributes: {
    name: string;
    values: string[];
  }[];
}

// Props for the component
export interface ProductFormProps {
  initialData?: Partial<ProductFormData>;
  isEdit?: boolean;
  onSubmit?: (data: ProductFormData) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
}

/**
 * Product form component for creating and editing inventory items
 */
export const ProductForm: React.FC<ProductFormProps> = ({
  initialData,
  isEdit = false,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const router = useRouter();
  const formRef = useAnimatedMount('fadeInUp', { duration: 0.6 });
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<string | null>('general');
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  
  // Mock data for selects
  const categoryOptions = [
    { value: 'electronics', label: 'Electronics' },
    { value: 'clothing', label: 'Clothing' },
    { value: 'home', label: 'Home & Kitchen' },
    { value: 'sports', label: 'Sports & Outdoors' },
    { value: 'toys', label: 'Toys & Games' },
  ];
  
  const tagOptions = [
    { value: 'new', label: 'New' },
    { value: 'sale', label: 'Sale' },
    { value: 'bestseller', label: 'Bestseller' },
    { value: 'featured', label: 'Featured' },
    { value: 'limited', label: 'Limited Edition' },
  ];
  
  const supplierOptions = [
    { value: 'supplier1', label: 'TechSupplies Inc.' },
    { value: 'supplier2', label: 'ElectroDistributors' },
    { value: 'supplier3', label: 'GlobalGadgets' },
    { value: 'supplier4', label: 'PrimeTech' },
    { value: 'supplier5', label: 'SuperSource' },
  ];
  
  const brandOptions = [
    { value: 'brand1', label: 'TechBrand' },
    { value: 'brand2', label: 'ElectroBrand' },
    { value: 'brand3', label: 'GlobalBrand' },
    { value: 'brand4', label: 'PrimeBrand' },
    { value: 'brand5', label: 'SuperBrand' },
  ];
  
  // Initialize form with default values
  const form = useForm<ProductFormData>({
    initialValues: {
      sku: '',
      name: '',
      description: '',
      price: 0,
      costPrice: 0,
      taxable: true,
      taxRate: 15,
      categories: [],
      tags: [],
      barcode: '',
      weight: 0,
      weightUnit: 'kg',
      dimensions: {
        length: 0,
        width: 0,
        height: 0,
      },
      dimensionUnit: 'cm',
      inventoryTracking: true,
      lowStockThreshold: 10,
      stockQuantity: 0,
      status: 'draft',
      brand: '',
      supplier: '',
      manufacturerPartNumber: '',
      images: [],
      variants: [],
      attributes: [],
      ...initialData,
    },
    validate: {
      name: (value) => (value ? null : 'Product name is required'),
      sku: (value) => (value ? null : 'SKU is required'),
      price: (value) => (value >= 0 ? null : 'Price must be a positive number'),
      costPrice: (value) => (value >= 0 ? null : 'Cost price must be a positive number'),
    },
  });
  
  // Submit handler
  const handleSubmit = async (data: ProductFormData) => {
    if (submitting) return;
    setSubmitting(true);
    
    try {
      if (onSubmit) {
        await onSubmit(data);
      }
      
      showSuccessNotification(
        isEdit ? 'Product Updated' : 'Product Created',
        isEdit 
          ? `${data.name} has been updated successfully` 
          : `${data.name} has been created successfully`
      );
      
      if (formRef.current) {
        gsap.to(formRef.current, {
          opacity: 0,
          y: -20,
          duration: 0.4,
          onComplete: () => {
            router.push('/inventory');
          },
        });
      } else {
        router.push('/inventory');
      }
    } catch (error) {
      showErrorNotification(
        error,
        'There was an error saving the product. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };
  
  // Handle cancel button
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.push('/inventory');
    }
  };
  
  // Simulate file upload
  const handleUpload = async (files: File[]) => {
    // Simulate upload progress
    for (const file of files) {
      for (let progress = 0; progress <= 100; progress += 10) {
        setUploadProgress(prev => ({
          ...prev,
          [file.name]: progress,
        }));
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  };
  
  // Generate SKU
  const generateSku = () => {
    const randomSku = `SKU-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    form.setFieldValue('sku', randomSku);
    
    // Animate the SKU field
    const skuField = document.querySelector('input[name="sku"]');
    if (skuField) {
      gsap.fromTo(
        skuField,
        { backgroundColor: 'rgba(90, 170, 255, 0.2)' },
        { backgroundColor: 'transparent', duration: 1 }
      );
    }
    
    showNotification({
      title: 'SKU Generated',
      message: `Generated SKU: ${randomSku}`,
      color: 'blue',
    });
  };
  
  return (
    <Box ref={formRef}>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Group position="apart" mb="xl">
          <Button
            variant="default"
            leftIcon={<IconArrowLeft size={16} />}
            onClick={handleCancel}
          >
            Back to Inventory
          </Button>
          
          <Group>
            <Button
              variant="default"
              onClick={handleCancel}
              disabled={submitting || loading}
            >
              Cancel
            </Button>
            
            <Button
              leftIcon={<IconDeviceFloppy size={16} />}
              type="submit"
              loading={submitting || loading}
            >
              {isEdit ? 'Save Changes' : 'Create Product'}
            </Button>
          </Group>
        </Group>
        
        <Tabs value={activeTab} onTabChange={setActiveTab} mb="xl">
          <Tabs.List>
            <Tabs.Tab
              value="general"
              icon={<IconPackage size={16} />}
            >
              General
            </Tabs.Tab>
            <Tabs.Tab
              value="pricing"
              icon={<IconTags size={16} />}
            >
              Pricing & Inventory
            </Tabs.Tab>
            <Tabs.Tab
              value="shipping"
              icon={<IconTruckDelivery size={16} />}
            >
              Shipping
            </Tabs.Tab>
            <Tabs.Tab
              value="warehouse"
              icon={<IconBuildingWarehouse size={16} />}
            >
              Warehouse
            </Tabs.Tab>
          </Tabs.List>
          
          <Tabs.Panel value="general" pt="lg">
            <Grid gutter="lg">
              <Grid.Col md={8}>
                <Stack spacing="lg">
                  <FormSection
                    title="Basic Information"
                    description="Enter the basic details of your product"
                  >
                    <Grid gutter="md">
                      <Grid.Col sm={6}>
                        <TextField
                          label="Product Name"
                          placeholder="Enter product name"
                          required
                          {...form.getInputProps('name')}
                        />
                      </Grid.Col>
                      
                      <Grid.Col sm={6}>
                        <Group spacing="xs" align="flex-end" noWrap>
                          <div style={{ flex: 1 }}>
                            <TextField
                              label="SKU"
                              placeholder="Enter SKU"
                              required
                              {...form.getInputProps('sku')}
                            />
                          </div>
                          <Button
                            variant="outline"
                            onClick={generateSku}
                            style={{ marginBottom: 5 }}
                          >
                            Generate
                          </Button>
                        </Group>
                      </Grid.Col>
                      
                      <Grid.Col xs={12}>
                        <TextareaField
                          label="Description"
                          placeholder="Enter product description"
                          minRows={4}
                          {...form.getInputProps('description')}
                        />
                      </Grid.Col>
                      
                      <Grid.Col sm={6}>
                        <MultiSelectField
                          label="Categories"
                          data={categoryOptions}
                          placeholder="Select categories"
                          searchable
                          clearable
                          {...form.getInputProps('categories')}
                        />
                      </Grid.Col>
                      
                      <Grid.Col sm={6}>
                        <MultiSelectField
                          label="Tags"
                          data={tagOptions}
                          placeholder="Select tags"
                          searchable
                          clearable
                          {...form.getInputProps('tags')}
                        />
                      </Grid.Col>
                      
                      <Grid.Col sm={6}>
                        <TextField
                          label="Barcode"
                          placeholder="Enter barcode (UPC, EAN, etc.)"
                          {...form.getInputProps('barcode')}
                        />
                      </Grid.Col>
                      
                      <Grid.Col sm={6}>
                        <TextField
                          label="Manufacturer Part Number"
                          placeholder="Enter MPN"
                          {...form.getInputProps('manufacturerPartNumber')}
                        />
                      </Grid.Col>
                      
                      <Grid.Col sm={6}>
                        <SelectField
                          label="Brand"
                          placeholder="Select brand"
                          data={brandOptions}
                          searchable
                          clearable
                          {...form.getInputProps('brand')}
                        />
                      </Grid.Col>
                      
                      <Grid.Col sm={6}>
                        <SelectField
                          label="Supplier"
                          placeholder="Select supplier"
                          data={supplierOptions}
                          searchable
                          clearable
                          {...form.getInputProps('supplier')}
                        />
                      </Grid.Col>
                      
                      <Grid.Col xs={12}>
                        <SelectField
                          label="Status"
                          placeholder="Select status"
                          data={[
                            { value: 'active', label: 'Active' },
                            { value: 'draft', label: 'Draft' },
                            { value: 'archived', label: 'Archived' },
                          ]}
                          {...form.getInputProps('status')}
                        />
                      </Grid.Col>
                    </Grid>
                  </FormSection>
                  
                  <FormSection
                    title="Product Images"
                    description="Upload images of your product"
                  >
                    <FileUpload
                      accept={['image/png', 'image/jpeg', 'image/gif']}
                      maxSize={5 * 1024 * 1024} // 5MB
                      maxFiles={10}
                      multiple
                      value={form.values.images}
                      onChange={(files) => form.setFieldValue('images', files)}
                      onUpload={handleUpload}
                      uploadProgress={uploadProgress}
                      previewsPerRow={3}
                    />
                  </FormSection>
                </Stack>
              </Grid.Col>
              
              <Grid.Col md={4}>
                <Card withBorder p="md" radius="md">
                  <Text weight={500} size="lg" mb="sm">
                    Product Preview
                  </Text>
                  <Divider mb="md" />
                  
                  <Stack spacing="md">
                    <div>
                      <Text size="sm" weight={500}>Name</Text>
                      <Text size="md">{form.values.name || 'Product Name'}</Text>
                    </div>
                    
                    <div>
                      <Text size="sm" weight={500}>SKU</Text>
                      <Text size="md">{form.values.sku || 'SKU-0000'}</Text>
                    </div>
                    
                    <div>
                      <Text size="sm" weight={500}>Price</Text>
                      <Text size="md">${form.values.price.toFixed(2)}</Text>
                    </div>
                    
                    <div>
                      <Text size="sm" weight={500}>Status</Text>
                      <Badge
                        color={
                          form.values.status === 'active'
                            ? 'green'
                            : form.values.status === 'draft'
                            ? 'blue'
                            : 'gray'
                        }
                      >
                        {form.values.status === 'active'
                          ? 'Active'
                          : form.values.status === 'draft'
                          ? 'Draft'
                          : 'Archived'}
                      </Badge>
                    </div>
                    
                    {form.values.categories.length > 0 && (
                      <div>
                        <Text size="sm" weight={500}>Categories</Text>
                        <Group spacing="xs" mt={4}>
                          {form.values.categories.map((cat) => (
                            <Badge key={cat} size="sm" color="blue" variant="outline">
                              {categoryOptions.find(c => c.value === cat)?.label || cat}
                            </Badge>
                          ))}
                        </Group>
                      </div>
                    )}
                    
                    {form.values.tags.length > 0 && (
                      <div>
                        <Text size="sm" weight={500}>Tags</Text>
                        <Group spacing="xs" mt={4}>
                          {form.values.tags.map((tag) => (
                            <Badge key={tag} size="sm" color="cyan" variant="filled">
                              {tagOptions.find(t => t.value === tag)?.label || tag}
                            </Badge>
                          ))}
                        </Group>
                      </div>
                    )}
                    
                    <div>
                      <Text size="sm" weight={500}>Stock</Text>
                      <Text 
                        size="md"
                        color={
                          form.values.stockQuantity <= 0
                            ? 'red'
                            : form.values.stockQuantity <= form.values.lowStockThreshold
                            ? 'orange'
                            : 'green'
                        }
                      >
                        {form.values.stockQuantity} in stock
                      </Text>
                    </div>
                  </Stack>
                </Card>
              </Grid.Col>
            </Grid>
          </Tabs.Panel>
          
          <Tabs.Panel value="pricing" pt="lg">
            <Stack spacing="lg">
              <FormSection
                title="Pricing Information"
                description="Set up pricing details for your product"
              >
                <Grid gutter="md">
                  <Grid.Col sm={6}>
                    <NumberField
                      label="Price"
                      description="The selling price"
                      placeholder="0.00"
                      precision={2}
                      step={0.01}
                      min={0}
                      required
                      {...form.getInputProps('price')}
                    />
                  </Grid.Col>
                  
                  <Grid.Col sm={6}>
                    <NumberField
                      label="Cost Price"
                      description="Your purchase cost"
                      placeholder="0.00"
                      precision={2}
                      step={0.01}
                      min={0}
                      {...form.getInputProps('costPrice')}
                    />
                  </Grid.Col>
                  
                  <Grid.Col xs={12}>
                    <SwitchField
                      label="Taxable"
                      description="Is this product subject to tax?"
                      {...form.getInputProps('taxable', { type: 'checkbox' })}
                    />
                  </Grid.Col>
                  
                  {form.values.taxable && (
                    <Grid.Col sm={6}>
                      <NumberField
                        label="Tax Rate (%)"
                        description="Applicable tax rate"
                        placeholder="0"
                        precision={2}
                        step={0.1}
                        min={0}
                        max={100}
                        {...form.getInputProps('taxRate')}
                      />
                    </Grid.Col>
                  )}
                </Grid>
              </FormSection>
              
              <FormSection
                title="Inventory Management"
                description="Configure inventory tracking for this product"
              >
                <Grid gutter="md">
                  <Grid.Col xs={12}>
                    <SwitchField
                      label="Track Inventory"
                      description="Enable inventory tracking for this product"
                      {...form.getInputProps('inventoryTracking', { type: 'checkbox' })}
                    />
                  </Grid.Col>
                  
                  {form.values.inventoryTracking && (
                    <>
                      <Grid.Col sm={6}>
                        <NumberField
                          label="Stock Quantity"
                          description="Current inventory level"
                          placeholder="0"
                          min={0}
                          step={1}
                          {...form.getInputProps('stockQuantity')}
                        />
                      </Grid.Col>
                      
                      <Grid.Col sm={6}>
                        <NumberField
                          label="Low Stock Threshold"
                          description="Alert when stock falls below this level"
                          placeholder="10"
                          min={0}
                          step={1}
                          {...form.getInputProps('lowStockThreshold')}
                        />
                      </Grid.Col>
                    </>
                  )}
                </Grid>
              </FormSection>
            </Stack>
          </Tabs.Panel>
          
          <Tabs.Panel value="shipping" pt="lg">
            <Stack spacing="lg">
              <FormSection
                title="Shipping Information"
                description="Configure shipping details for this product"
              >
                <Grid gutter="md">
                  <Grid.Col sm={6}>
                    <NumberField
                      label="Weight"
                      placeholder="0.00"
                      precision={2}
                      step={0.01}
                      min={0}
                      {...form.getInputProps('weight')}
                    />
                  </Grid.Col>
                  
                  <Grid.Col sm={6}>
                    <SelectField
                      label="Weight Unit"
                      data={[
                        { value: 'kg', label: 'Kilograms (kg)' },
                        { value: 'lb', label: 'Pounds (lb)' },
                      ]}
                      {...form.getInputProps('weightUnit')}
                    />
                  </Grid.Col>
                  
                  <Grid.Col sm={4}>
                    <NumberField
                      label="Length"
                      placeholder="0.00"
                      precision={2}
                      step={0.01}
                      min={0}
                      {...form.getInputProps('dimensions.length')}
                    />
                  </Grid.Col>
                  
                  <Grid.Col sm={4}>
                    <NumberField
                      label="Width"
                      placeholder="0.00"
                      precision={2}
                      step={0.01}
                      min={0}
                      {...form.getInputProps('dimensions.width')}
                    />
                  </Grid.Col>
                  
                  <Grid.Col sm={4}>
                    <NumberField
                      label="Height"
                      placeholder="0.00"
                      precision={2}
                      step={0.01}
                      min={0}
                      {...form.getInputProps('dimensions.height')}
                    />
                  </Grid.Col>
                  
                  <Grid.Col sm={6}>
                    <SelectField
                      label="Dimension Unit"
                      data={[
                        { value: 'cm', label: 'Centimeters (cm)' },
                        { value: 'in', label: 'Inches (in)' },
                      ]}
                      {...form.getInputProps('dimensionUnit')}
                    />
                  </Grid.Col>
                </Grid>
              </FormSection>
            </Stack>
          </Tabs.Panel>
          
          <Tabs.Panel value="warehouse" pt="lg">
            <Stack spacing="lg">
              <FormSection
                title="Warehouse Locations"
                description="Configure warehouse and storage locations for this product"
              >
                <Text color="dimmed" size="sm" mb="md">
                  Warehouse functionality will be implemented in a future update.
                </Text>
                
                <Button
                  leftIcon={<IconBuildingWarehouse size={16} />}
                  variant="outline"
                  disabled
                >
                  Add Warehouse Location
                </Button>
              </FormSection>
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </form>
    </Box>
  );
};

export default ProductForm;