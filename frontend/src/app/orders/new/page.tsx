import React from 'react';
import { 
  Box, 
  Title, 
  Card, 
  Stepper, 
  TextInput, 
  Group, 
  Button, 
  Grid, 
  NumberInput,
  Select, 
  Textarea, 
  Divider,
  ActionIcon,
  Text,
  Stack,
  Paper,
  Checkbox,
  Breadcrumbs,
  Anchor
} from '@mantine/core';
import Link from 'next/link';
import { 
  IconArrowLeft, 
  IconChevronRight, 
  IconUser, 
  IconShoppingCart, 
  IconTruckDelivery, 
  IconCreditCard, 
  IconPlus, 
  IconTrash, 
  IconSearch
} from '@tabler/icons-react';
import { PageTransition } from '@/components/PageTransition/PageTransition';

export default function CreateOrderPage() {
  // This would be state in a real implementation
  const currentStep = 0;
  
  return (
    <PageTransition>
      <Box p="md">
        {/* Header & Navigation */}
        <Group position="apart" mb="lg">
          <Group>
            <ActionIcon 
              component={Link}
              href="/orders"
              variant="light"
              size="lg"
            >
              <IconArrowLeft size={18} />
            </ActionIcon>
            
            <Breadcrumbs separator={<IconChevronRight size={14} />}>
              <Anchor component={Link} href="/dashboard" size="sm">
                Dashboard
              </Anchor>
              <Anchor component={Link} href="/orders" size="sm">
                Orders
              </Anchor>
              <Text size="sm">Create New Order</Text>
            </Breadcrumbs>
          </Group>
          
          <Button color="red" variant="outline">
            Cancel
          </Button>
        </Group>
        
        <Title order={2} mb="xl">Create New Order</Title>
        
        {/* Stepper UI */}
        <Stepper active={currentStep} breakpoint="sm" mb="xl">
          <Stepper.Step label="Customer Information" icon={<IconUser size={18} />}>
            Step 1: Select customer
          </Stepper.Step>
          
          <Stepper.Step label="Products" icon={<IconShoppingCart size={18} />}>
            Step 2: Add products
          </Stepper.Step>
          
          <Stepper.Step label="Shipping & Delivery" icon={<IconTruckDelivery size={18} />}>
            Step 3: Shipping details
          </Stepper.Step>
          
          <Stepper.Step label="Payment & Confirmation" icon={<IconCreditCard size={18} />}>
            Step 4: Payment information
          </Stepper.Step>
        </Stepper>
        
        {/* Step 1: Customer Information */}
        {currentStep === 0 && (
          <Card withBorder p="lg">
            <Title order={3} mb="md">Customer Information</Title>
            
            <Grid>
              <Grid.Col span={12} mb="md">
                <Group grow>
                  <TextInput
                    label="Search Customers"
                    placeholder="Search by name, email, or phone..."
                    icon={<IconSearch size={16} />}
                  />
                  <Button leftIcon={<IconPlus size={16} />}>
                    Create New Customer
                  </Button>
                </Group>
              </Grid.Col>
              
              <Grid.Col span={12} md={6}>
                <TextInput 
                  label="First Name" 
                  placeholder="Customer's first name"
                  required
                  mb="md"
                />
                
                <TextInput 
                  label="Email Address" 
                  placeholder="customer@example.com"
                  required
                  mb="md"
                />
                
                <TextInput 
                  label="Company (Optional)" 
                  placeholder="Company name"
                  mb="md"
                />
              </Grid.Col>
              
              <Grid.Col span={12} md={6}>
                <TextInput 
                  label="Last Name" 
                  placeholder="Customer's last name"
                  required
                  mb="md"
                />
                
                <TextInput 
                  label="Phone Number" 
                  placeholder="+1 (555) 123-4567"
                  mb="md"
                />
                
                <Checkbox
                  label="Create account for this customer"
                  mb="md"
                />
              </Grid.Col>
              
              <Grid.Col span={12}>
                <Divider my="md" label="Billing Address" labelPosition="center" />
              </Grid.Col>
              
              <Grid.Col span={12} md={6}>
                <TextInput 
                  label="Street Address Line 1" 
                  placeholder="123 Main St."
                  required
                  mb="md"
                />
                
                <TextInput 
                  label="City" 
                  placeholder="City"
                  required
                  mb="md"
                />
                
                <TextInput 
                  label="Postal/ZIP Code" 
                  placeholder="12345"
                  required
                  mb="md"
                />
              </Grid.Col>
              
              <Grid.Col span={12} md={6}>
                <TextInput 
                  label="Street Address Line 2 (Optional)" 
                  placeholder="Apt, Suite, Unit, etc."
                  mb="md"
                />
                
                <Grid columns={2}>
                  <Grid.Col span={1}>
                    <Select
                      label="State/Province"
                      placeholder="Select state"
                      required
                      mb="md"
                      data={[
                        { value: 'CA', label: 'California' },
                        { value: 'NY', label: 'New York' },
                        { value: 'TX', label: 'Texas' }
                      ]}
                    />
                  </Grid.Col>
                  
                  <Grid.Col span={1}>
                    <Select
                      label="Country"
                      placeholder="Select country"
                      required
                      mb="md"
                      data={[
                        { value: 'US', label: 'United States' },
                        { value: 'CA', label: 'Canada' },
                        { value: 'UK', label: 'United Kingdom' }
                      ]}
                    />
                  </Grid.Col>
                </Grid>
                
                <TextInput 
                  label="Phone (Optional)" 
                  placeholder="For delivery contact"
                  mb="md"
                />
              </Grid.Col>
              
              <Grid.Col span={12}>
                <Checkbox
                  label="Shipping address is the same as billing address"
                  defaultChecked
                  mb="md"
                />
              </Grid.Col>
              
              <Grid.Col span={12}>
                <Group position="right">
                  <Button>
                    Continue to Products
                  </Button>
                </Group>
              </Grid.Col>
            </Grid>
          </Card>
        )}
        
        {/* Step 2: Products (Only showing a skeleton of this step) */}
        {currentStep === 1 && (
          <Card withBorder p="lg">
            <Title order={3} mb="md">Order Products</Title>
            
            <Grid>
              <Grid.Col span={12} mb="md">
                <Group grow>
                  <TextInput
                    label="Search Products"
                    placeholder="Search by name, SKU, or barcode..."
                    icon={<IconSearch size={16} />}
                  />
                  <Button leftIcon={<IconPlus size={16} />}>
                    Add Product
                  </Button>
                </Group>
              </Grid.Col>
              
              <Grid.Col span={12}>
                <Paper withBorder p="md" mb="md">
                  <Text weight={700} mb="md">Selected Products</Text>
                  
                  <Stack spacing="md">
                    <Paper p="sm" withBorder>
                      <Group position="apart">
                        <Group>
                          <Box sx={{ width: 60, height: 60, backgroundColor: '#f1f1f1', borderRadius: '4px' }} />
                          <Stack spacing={0}>
                            <Text weight={500}>Premium Headphones</Text>
                            <Text size="xs" color="dimmed">SKU: SKU-12345</Text>
                          </Stack>
                        </Group>
                        
                        <Group>
                          <NumberInput
                            defaultValue={1}
                            min={1}
                            max={100}
                            label="Quantity"
                            styles={{ input: { width: 100 } }}
                          />
                          
                          <NumberInput
                            defaultValue={199.99}
                            min={0}
                            label="Unit Price"
                            precision={2}
                            prefix="$"
                            styles={{ input: { width: 120 } }}
                          />
                          
                          <Stack spacing={0} align="flex-end">
                            <Text weight={700}>$199.99</Text>
                            <ActionIcon color="red" variant="subtle">
                              <IconTrash size={16} />
                            </ActionIcon>
                          </Stack>
                        </Group>
                      </Group>
                    </Paper>
                  </Stack>
                </Paper>
              </Grid.Col>
              
              <Grid.Col span={12} md={6}>
                <Select
                  label="Order Tags (Optional)"
                  placeholder="Select or create tags"
                  data={[]}
                  searchable
                  clearable
                  mb="md"
                />
                
                <Textarea
                  label="Order Notes (Optional)"
                  placeholder="Add any special notes or instructions for this order..."
                  minRows={4}
                  mb="md"
                />
              </Grid.Col>
              
              <Grid.Col span={12} md={6}>
                <Card withBorder p="md" mb="md">
                  <Text weight={700} mb="md">Order Summary</Text>
                  
                  <Stack spacing="sm">
                    <Group position="apart">
                      <Text>Subtotal:</Text>
                      <Text>$199.99</Text>
                    </Group>
                    
                    <Group position="apart">
                      <Text>Shipping:</Text>
                      <Text>$0.00</Text>
                    </Group>
                    
                    <Group position="apart">
                      <Text>Tax:</Text>
                      <Text>$0.00</Text>
                    </Group>
                    
                    <Divider my="sm" />
                    
                    <Group position="apart">
                      <Text weight={700}>Total:</Text>
                      <Text weight={700} size="lg">$199.99</Text>
                    </Group>
                  </Stack>
                </Card>
              </Grid.Col>
              
              <Grid.Col span={12}>
                <Group position="right">
                  <Button variant="default">
                    Back
                  </Button>
                  <Button>
                    Continue to Shipping
                  </Button>
                </Group>
              </Grid.Col>
            </Grid>
          </Card>
        )}
      </Box>
    </PageTransition>
  );
}