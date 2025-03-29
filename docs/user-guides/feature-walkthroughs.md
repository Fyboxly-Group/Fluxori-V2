# Fluxori-V2 Feature Walkthroughs

This document provides step-by-step walkthroughs for using the main features of the Fluxori-V2 system.

## Contents

- [Getting Started](#getting-started)
- [Inventory Management](#inventory-management)
- [Supplier Management](#supplier-management)
- [Purchase Order Workflow](#purchase-order-workflow)
- [Shipment Tracking](#shipment-tracking)
- [Alert Management](#alert-management)
- [Reporting](#reporting)
- [Project and Task Management](#project-and-task-management)
- [Customer Management](#customer-management)

## Getting Started

### Logging In

1. Navigate to the Fluxori-V2 login page.
2. Enter your email address and password.
3. Click "Sign In" to access the dashboard.

### Dashboard Overview

The main dashboard provides:

- Quick statistics cards showing key metrics
- Recent activity feed
- Alert notifications
- Quick access to common tasks

**Navigation**: Use the sidebar to navigate between different modules of the system.

## Inventory Management

### Viewing Inventory

1. Navigate to "Inventory" in the sidebar
2. Browse the inventory list which shows:
   - Item name
   - SKU
   - Category
   - Stock quantity
   - Status
3. Use the search bar to find specific items
4. Use filters to narrow down by category, stock level, or supplier

### Adding a New Inventory Item

1. Click "Add Item" button from the inventory list page
2. Fill in the required fields:
   - Item name
   - Description
   - Category
   - SKU (or use "Generate SKU" option)
   - Price
   - Cost price
   - Stock quantity
   - Reorder point and quantity
   - Supplier (select from dropdown)
3. Optional: Add dimensions, location, and other details
4. Upload item images using the file uploader
5. Click "Save" to create the item

### Managing Inventory Levels

1. From the inventory detail page, click "Adjust Stock"
2. Enter the new quantity or the amount to add/subtract
3. Select a reason for the adjustment
4. Add notes if needed
5. Click "Save Adjustment"

## Supplier Management

### Adding a New Supplier

1. Navigate to "Suppliers" in the sidebar
2. Click "Add Supplier"
3. Fill in the required fields:
   - Company name
   - Contact information
   - Address details
   - Payment terms
   - Categories supplied
4. Click "Save" to create the supplier record

### Viewing Supplier Performance

1. Navigate to the Supplier detail page
2. Review the performance metrics:
   - On-time delivery rate
   - Quality rating
   - Price competitiveness
   - Response time
3. View related purchase orders and inventory items

## Purchase Order Workflow

### Creating a Purchase Order

1. Navigate to "Purchase Orders" and click "Create Order"
2. Select a supplier from the dropdown
3. Set the order details:
   - Reference number
   - Expected delivery date
   - Shipping method
   - Payment terms
4. Add line items:
   - Select inventory items from the product picker
   - Set quantities for each item
   - Review unit costs and totals
5. Add any special instructions or notes
6. Click "Create Purchase Order"

### Tracking Order Status

1. From the Purchase Orders list, select an order to view
2. The status timeline shows the current state and history
3. Use the "Update Status" button to change the order status:
   - Draft
   - Submitted
   - Confirmed
   - In Progress
   - Shipped
   - Delivered
   - Completed
   - Cancelled

### Receiving Shipments

1. Navigate to the Purchase Order detail page
2. Click "Receive Items"
3. Enter the quantities received for each line item
4. Upload any delivery documentation
5. Add notes if needed
6. Click "Complete Receipt"

## Shipment Tracking

### Creating a Shipment Record

1. Navigate to "Shipments" and click "Create Shipment"
2. Select the shipment type: Inbound or Outbound
3. For inbound shipments, select the related purchase order
4. Fill in the required details:
   - Courier/carrier
   - Tracking number
   - Origin and destination addresses
   - Expected delivery date
5. Add shipment contents
6. Upload any related documents
7. Click "Create Shipment"

### Updating Shipment Status

1. From the Shipment detail page, click "Add Tracking Event"
2. Select the new status from the dropdown
3. Enter the location and timestamp
4. Add any relevant notes
5. Click "Save"

## Alert Management

### Viewing Alerts

1. Navigate to "Alerts" in the sidebar
2. The dashboard shows all alerts categorized by:
   - Type (Inventory, Shipment)
   - Priority (Critical, High, Medium, Low)
   - Status (New, In Progress, Resolved)
3. Click any alert to view details

### Configuring Alert Settings

1. Navigate to "Settings" > "Alert Configuration"
2. For each alert type, configure:
   - Activation thresholds
   - Priority assignment rules
   - Notification methods (email, SMS, in-app)
   - Assignment rules

### Resolving Alerts

1. From the Alert detail page, review the information
2. Click "Take Action" to address the issue
3. Implement the necessary changes in the system
4. Click "Mark as Resolved" once complete
5. Add resolution notes

## Reporting

### Generating Reports

1. Navigate to "Reports" in the sidebar
2. Select a report type from the available options
3. Set the parameters:
   - Date range
   - Categories to include
   - Grouping options
   - Sorting preferences
4. Click "Generate Report"

### Scheduling Regular Reports

1. From the Reports page, click "Schedule Report"
2. Select the report type and configure parameters
3. Set the schedule:
   - Frequency (daily, weekly, monthly)
   - Delivery time
   - Start and end dates (if applicable)
4. Choose delivery method (email, download)
5. Click "Save Schedule"

## Project and Task Management

### Creating a Project

1. Navigate to "Projects" and click "New Project"
2. Fill in the required fields:
   - Project name
   - Description
   - Customer
   - Account manager
   - Start date
   - Target completion date
3. Set project objectives and key results
4. Add project stakeholders
5. Click "Create Project"

### Managing Milestones

1. From the Project detail page, navigate to "Milestones" tab
2. Click "Add Milestone"
3. Set milestone details:
   - Title
   - Description
   - Start and target dates
   - Owner
   - Reviewers if approval is required
4. Click "Save Milestone"

### Task Management

1. From the Project detail page, navigate to "Tasks" tab
2. Click "Add Task"
3. Fill in task details:
   - Title
   - Description
   - Status
   - Priority
   - Assigned to
   - Due date
   - Related milestone (if any)
4. Click "Create Task"

## Customer Management

### Adding a New Customer

1. Navigate to "Customers" and click "Add Customer"
2. Fill in the required information:
   - Company name
   - Industry
   - Size
   - Primary contact details
   - Account manager
3. Add secondary contacts if needed
4. Set contract details if applicable
5. Click "Save"

### Customer Relationship Management

1. From the Customer detail page, review:
   - Projects and milestones
   - Contract status
   - NPS and satisfaction metrics
   - Communication history
2. Use the "Add Note" feature to document interactions
3. Schedule follow-ups using the calendar integration

---

For more detailed information on specific features, please refer to the [Admin Guide](admin-guide.md) or contact your system administrator.