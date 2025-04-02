# Fluxori V2 Component API Documentation

This document provides comprehensive documentation for the key components in the Fluxori V2 frontend application.

## Table of Contents

- [Core Components](#core-components)
  - [Layout Components](#layout-components)
  - [UI Components](#ui-components)
  - [Form Components](#form-components)
  - [Data Display Components](#data-display-components)
- [Feature Components](#feature-components)
  - [User Management Components](#user-management-components)
  - [Inventory Components](#inventory-components)
  - [Order Components](#order-components)
  - [Buy Box Components](#buy-box-components)
  - [AI Components](#ai-components)
  - [Reporting Components](#reporting-components)
- [Animation Components](#animation-components)
- [Error Handling Components](#error-handling-components)

## Core Components

### Layout Components

#### `AppShell`

Main application shell with navigation and header.

```tsx
import { AppShell } from '@/components/Layout/AppShell';

<AppShell
  title="Dashboard"
  showSidebar={true}
  fluid={false}
  padding="md"
>
  {children}
</AppShell>
```

**Props:**

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | required | Page title to display in the header |
| `showSidebar` | `boolean` | `true` | Whether to show the sidebar navigation |
| `fluid` | `boolean` | `false` | Whether the content should use the full width |
| `padding` | `MantinePaddingSize` | `"md"` | Content padding size |
| `children` | `ReactNode` | required | Content to render inside the shell |
| `actions` | `ReactNode` | - | Optional header actions (buttons, etc.) |
| `sidebarWidth` | `number` | `260` | Width of the sidebar in pixels |
| `headerHeight` | `number` | `60` | Height of the header in pixels |

### UI Components

#### `AnimatedButton`

Enhanced button with GSAP animations for hover and click states.

```tsx
import { AnimatedButton } from '@/components/Button/AnimatedButton';

<AnimatedButton
  animationType="scale"
  onClick={handleClick}
  color="primary"
>
  Click Me
</AnimatedButton>
```

**Props:**

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `animationType` | `"scale" \| "pulse" \| "shine" \| "bounce"` | `"scale"` | Type of animation to use |
| `animationSpeed` | `number` | `0.3` | Duration of the animation in seconds |
| `color` | `MantineColor` | `"primary"` | Button color |
| `fullWidth` | `boolean` | `false` | Whether button should take full width |
| `size` | `MantineSize` | `"md"` | Button size |
| `variant` | `MantineButtonVariant` | `"filled"` | Button variant |
| `onClick` | `() => void` | - | Click handler |
| `disabled` | `boolean` | `false` | Whether the button is disabled |
| `loading` | `boolean` | `false` | Whether to show a loading indicator |
| `children` | `ReactNode` | required | Button content |

#### `AnimatedCard`

Card component with hover and entrance animations.

```tsx
import { AnimatedCard } from '@/components/Card/AnimatedCard';

<AnimatedCard
  title="Card Title"
  animate={true}
  hoverEffect="lift"
>
  Card content here
</AnimatedCard>
```

**Props:**

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | - | Card title |
| `subtitle` | `string` | - | Card subtitle |
| `animate` | `boolean` | `true` | Whether to animate on mount |
| `hoverEffect` | `"lift" \| "glow" \| "highlight" \| "none"` | `"lift"` | Effect when hovering |
| `shadow` | `MantineShadow` | `"sm"` | Card shadow |
| `radius` | `MantineRadius` | `"md"` | Card border radius |
| `padding` | `MantinePaddingSize` | `"md"` | Card padding |
| `children` | `ReactNode` | required | Card content |
| `width` | `number \| string` | - | Card width |
| `height` | `number \| string` | - | Card height |
| `onClick` | `() => void` | - | Click handler |

### Form Components

#### `FormField`

Standard form field with validation and animation.

```tsx
import { FormField } from '@/components/Forms/FormField';

<FormField
  name="email"
  label="Email Address"
  type="email"
  required
  placeholder="Enter your email"
  value={email}
  onChange={handleChange}
  error={errors.email}
/>
```

**Props:**

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `name` | `string` | required | Field name |
| `label` | `string` | required | Field label |
| `type` | `"text" \| "email" \| "password" \| "number" \| "tel"` | `"text"` | Input type |
| `required` | `boolean` | `false` | Whether field is required |
| `placeholder` | `string` | - | Input placeholder |
| `value` | `string \| number` | - | Field value |
| `onChange` | `(e: ChangeEvent<HTMLInputElement>) => void` | - | Change handler |
| `error` | `string` | - | Error message |
| `disabled` | `boolean` | `false` | Whether field is disabled |
| `readOnly` | `boolean` | `false` | Whether field is read-only |
| `className` | `string` | - | Additional CSS class |
| `description` | `string` | - | Helper text below the field |
| `width` | `number \| string` | - | Field width |
| `size` | `MantineSize` | `"md"` | Field size |
| `icon` | `ReactNode` | - | Icon to display in the field |

#### `FormSection`

Section container for grouping form fields.

```tsx
import { FormSection } from '@/components/Forms/FormSection';

<FormSection
  title="Personal Information"
  description="Enter your contact details"
  collapsible={true}
>
  <FormField name="firstName" label="First Name" />
  <FormField name="lastName" label="Last Name" />
</FormSection>
```

**Props:**

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | required | Section title |
| `description` | `string` | - | Section description |
| `collapsible` | `boolean` | `false` | Whether section can be collapsed |
| `defaultOpen` | `boolean` | `true` | Initial expanded state if collapsible |
| `children` | `ReactNode` | required | Section content |
| `spacing` | `MantineSpacingSize` | `"md"` | Spacing between fields |
| `required` | `boolean` | `false` | Whether to mark section as required |
| `className` | `string` | - | Additional CSS class |

### Data Display Components

#### `DataTable`

Advanced data table with sorting, filtering, and pagination.

```tsx
import { DataTable } from '@/components/DataTable/DataTable';

<DataTable
  data={usersData}
  columns={columns}
  pagination={{ pageSize: 10 }}
  sorting={true}
  selection={true}
  onRowClick={handleRowClick}
/>
```

**Props:**

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `Array<any>` | required | Table data |
| `columns` | `Array<TableColumn>` | required | Column definitions |
| `pagination` | `{ pageSize: number, initialPage?: number }` | - | Pagination configuration |
| `sorting` | `boolean \| { initialSortKey?: string, initialDirection?: 'asc' \| 'desc' }` | `false` | Sorting configuration |
| `filtering` | `boolean` | `false` | Whether to enable filtering |
| `selection` | `boolean` | `false` | Whether to enable row selection |
| `onRowClick` | `(row: any) => void` | - | Row click handler |
| `onSelectionChange` | `(selectedRows: Array<any>) => void` | - | Selection change handler |
| `loading` | `boolean` | `false` | Whether table is loading |
| `emptyState` | `ReactNode` | `"No data to display"` | Content to show when table is empty |
| `loadingRows` | `number` | `5` | Number of skeleton rows to show when loading |
| `animateRows` | `boolean` | `true` | Whether to animate row entrance |
| `responsive` | `boolean` | `true` | Whether to enable responsive behavior |
| `stickyHeader` | `boolean` | `false` | Whether to make the header sticky |

## Feature Components

### User Management Components

#### `UserList`

User management interface with filtering and actions.

```tsx
import { UserList } from '@/components/user-management/UserList';

<UserList
  onUserSelect={handleUserSelect}
  onUserEdit={handleUserEdit}
  onUserDelete={handleUserDelete}
  permissions={userPermissions}
/>
```

**Props:**

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `initialFilter` | `string` | `""` | Initial filter value |
| `onUserSelect` | `(user: User) => void` | - | Handler when user is selected |
| `onUserEdit` | `(user: User) => void` | - | Handler when user is edited |
| `onUserDelete` | `(user: User) => void` | - | Handler when user is deleted |
| `permissions` | `{ create: boolean, edit: boolean, delete: boolean, impersonate: boolean }` | `{ create: true, edit: true, delete: true, impersonate: false }` | User permissions |
| `pageSize` | `number` | `10` | Number of users per page |
| `showRoles` | `boolean` | `true` | Whether to show user roles |
| `showLastLogin` | `boolean` | `true` | Whether to show last login time |
| `showStatus` | `boolean` | `true` | Whether to show user status |
| `enableBulkActions` | `boolean` | `true` | Whether to enable bulk actions |

#### `RoleManagement`

Role and permission management interface.

```tsx
import { RoleManagement } from '@/components/user-management/RoleManagement';

<RoleManagement
  onRoleCreate={handleRoleCreate}
  onRoleUpdate={handleRoleUpdate}
  onRoleDelete={handleRoleDelete}
/>
```

**Props:**

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `onRoleCreate` | `(role: Role) => void` | - | Handler when role is created |
| `onRoleUpdate` | `(role: Role) => void` | - | Handler when role is updated |
| `onRoleDelete` | `(roleId: string) => void` | - | Handler when role is deleted |
| `permissions` | `{ create: boolean, edit: boolean, delete: boolean }` | `{ create: true, edit: true, delete: true }` | Permission configuration |
| `showUsers` | `boolean` | `true` | Whether to show users with each role |
| `enableTemplates` | `boolean` | `true` | Whether to enable role templates |
| `matrixView` | `boolean` | `true` | Whether to show matrix permission view |

### Inventory Components

#### `ProductForm`

Form for creating and editing inventory products.

```tsx
import { ProductForm } from '@/features/inventory/components/ProductForm';

<ProductForm
  initialData={product}
  onSubmit={handleSubmit}
  onCancel={handleCancel}
  categories={categories}
/>
```

**Props:**

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `initialData` | `Product` | - | Initial product data for edit mode |
| `onSubmit` | `(product: Product) => void` | required | Submit handler |
| `onCancel` | `() => void` | required | Cancel handler |
| `categories` | `Array<Category>` | `[]` | Available product categories |
| `suppliers` | `Array<Supplier>` | `[]` | Available suppliers |
| `mode` | `"create" \| "edit"` | `"create"` | Form mode |
| `loading` | `boolean` | `false` | Whether form is submitting |
| `error` | `string` | - | Error message |
| `showAdvancedFields` | `boolean` | `true` | Whether to show advanced fields |
| `enableImageUpload` | `boolean` | `true` | Whether to enable image upload |
| `maxImages` | `number` | `5` | Maximum number of product images |

### Order Components

#### `OrderDetail`

Comprehensive order details view.

```tsx
import { OrderDetail } from '@/components/order/OrderDetail';

<OrderDetail
  orderId="ORD-12345"
  onStatusChange={handleStatusChange}
  onOrderUpdate={handleOrderUpdate}
/>
```

**Props:**

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `orderId` | `string` | required | Order ID to display |
| `initialTab` | `"details" \| "items" \| "shipping" \| "payments" \| "documents" \| "notes"` | `"details"` | Initial active tab |
| `onStatusChange` | `(status: OrderStatus) => void` | - | Status change handler |
| `onOrderUpdate` | `(order: Order) => void` | - | Order update handler |
| `onPrint` | `() => void` | - | Print handler |
| `permissions` | `{ edit: boolean, cancel: boolean, refund: boolean }` | `{ edit: true, cancel: true, refund: true }` | Permission configuration |
| `showCustomerDetails` | `boolean` | `true` | Whether to show customer details |
| `showTimeline` | `boolean` | `true` | Whether to show order timeline |
| `enableEditing` | `boolean` | `true` | Whether to allow editing |
| `showMapView` | `boolean` | `true` | Whether to show map for shipping |

#### `ShipmentTimeline`

Visual timeline for shipment tracking.

```tsx
import { ShipmentTimeline } from '@/components/shipment/ShipmentTimeline';

<ShipmentTimeline
  shipmentId="SHP-12345"
  animated={true}
  detailed={true}
/>
```

**Props:**

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `shipmentId` | `string` | required | Shipment ID to display |
| `shipment` | `Shipment` | - | Shipment data (alternative to ID) |
| `animated` | `boolean` | `true` | Whether to animate the timeline |
| `detailed` | `boolean` | `true` | Whether to show detailed information |
| `showMap` | `boolean` | `true` | Whether to show map visualization |
| `compact` | `boolean` | `false` | Whether to use compact view |
| `onEvent` | `(event: ShipmentEvent) => void` | - | Event click handler |
| `interactiveMap` | `boolean` | `true` | Whether map is interactive |
| `highlightCurrentStatus` | `boolean` | `true` | Whether to highlight current status |

### Buy Box Components

#### `BuyBoxStatusCard`

Card displaying Buy Box ownership status.

```tsx
import { BuyBoxStatusCard } from '@/components/buybox/BuyBoxStatusCard';

<BuyBoxStatusCard
  productId="PROD-12345"
  refreshInterval={60000}
  showCompetitors={true}
/>
```

**Props:**

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `productId` | `string` | required | Product ID to display |
| `product` | `Product` | - | Product data (alternative to ID) |
| `refreshInterval` | `number` | `60000` | Auto-refresh interval in ms |
| `showCompetitors` | `boolean` | `true` | Whether to show competitors |
| `showPriceHistory` | `boolean` | `true` | Whether to show price history |
| `animateChanges` | `boolean` | `true` | Whether to animate price changes |
| `onStatusChange` | `(status: BuyBoxStatus) => void` | - | Status change handler |
| `onPriceChange` | `(price: number) => void` | - | Price change handler |
| `enableManualRefresh` | `boolean` | `true` | Whether to allow manual refresh |
| `enablePriceUpdates` | `boolean` | `true` | Whether to allow price updates |

#### `PriceHistoryChart`

Chart for visualizing Buy Box price history.

```tsx
import { PriceHistoryChart } from '@/components/BuyBox/PriceHistoryChart';

<PriceHistoryChart
  productId="PROD-12345"
  timeRange="30d"
  showCompetitors={true}
  animated={true}
/>
```

**Props:**

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `productId` | `string` | required | Product ID to display |
| `data` | `Array<PricePoint>` | - | Chart data (alternative to ID) |
| `timeRange` | `"7d" \| "30d" \| "90d" \| "1y" \| "all"` | `"30d"` | Time range to display |
| `showCompetitors` | `boolean` | `true` | Whether to show competitor prices |
| `showBuyBoxOwner` | `boolean` | `true` | Whether to highlight Buy Box owner |
| `animated` | `boolean` | `true` | Whether to animate the chart |
| `height` | `number` | `300` | Chart height in pixels |
| `showControls` | `boolean` | `true` | Whether to show chart controls |
| `enableZoom` | `boolean` | `true` | Whether to enable zoom functionality |
| `enableTooltips` | `boolean` | `true` | Whether to enable tooltips |
| `showLegend` | `boolean` | `true` | Whether to show chart legend |

### AI Components

#### `AIInsightCard`

Card for displaying AI-generated insights.

```tsx
import { AIInsightCard } from '@/components/ai/AIInsightCard';

<AIInsightCard
  insight={{
    title: "Sales Pattern Detected",
    description: "Weekend sales are consistently 30% higher",
    confidence: 0.87,
    category: "sales",
    actionable: true
  }}
  onAction={handleAction}
/>
```

**Props:**

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `insight` | `AIInsight` | required | Insight data to display |
| `onAction` | `(action: string, insight: AIInsight) => void` | - | Action handler |
| `expanded` | `boolean` | `false` | Whether card is initially expanded |
| `animateEntrance` | `boolean` | `true` | Whether to animate entrance |
| `showConfidence` | `boolean` | `true` | Whether to show confidence score |
| `interactive` | `boolean` | `true` | Whether card is interactive |
| `variant` | `"standard" \| "compact" \| "detailed"` | `"standard"` | Card display variant |
| `showTime` | `boolean` | `true` | Whether to show detection time |
| `enableDismiss` | `boolean` | `true` | Whether insight can be dismissed |
| `enableFeedback` | `boolean` | `true` | Whether to allow feedback |

#### `AIProcessingIndicator`

Animated indicator for AI processing tasks.

```tsx
import { AIProcessingIndicator } from '@/components/ai/AIProcessingIndicator';

<AIProcessingIndicator
  status="processing"
  message="Analyzing sales data..."
  progress={65}
/>
```

**Props:**

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `status` | `"idle" \| "processing" \| "complete" \| "error"` | `"processing"` | Current status |
| `message` | `string` | - | Status message to display |
| `progress` | `number` | - | Optional progress percentage (0-100) |
| `animated` | `boolean` | `true` | Whether to animate the indicator |
| `variant` | `"default" \| "minimal" \| "detailed"` | `"default"` | Display variant |
| `onCancel` | `() => void` | - | Cancel handler if cancellable |
| `cancellable` | `boolean` | `false` | Whether processing can be cancelled |
| `autoHide` | `boolean` | `false` | Whether to auto-hide when complete |
| `hideDelay` | `number` | `2000` | Delay before auto-hiding (ms) |
| `className` | `string` | - | Additional CSS class |

### Reporting Components

#### `ReportBuilder`

Interface for building customized reports.

```tsx
import { ReportBuilder } from '@/components/reporting/ReportBuilder';

<ReportBuilder
  onSave={handleSaveReport}
  onPreview={handlePreviewReport}
  initialData={savedReport}
/>
```

**Props:**

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `onSave` | `(report: Report) => void` | required | Save handler |
| `onPreview` | `(reportConfig: ReportConfig) => void` | - | Preview handler |
| `initialData` | `Report` | - | Initial report data for editing |
| `availableSources` | `Array<DataSource>` | - | Available data sources |
| `availableTemplates` | `Array<ReportTemplate>` | - | Available report templates |
| `showPreview` | `boolean` | `true` | Whether to show preview pane |
| `startStep` | `number` | `0` | Initial active step |
| `enableTemplates` | `boolean` | `true` | Whether to enable template selection |
| `enableScheduling` | `boolean` | `true` | Whether to enable report scheduling |
| `enableSharing` | `boolean` | `true` | Whether to enable report sharing |
| `showTemplateLibrary` | `boolean` | `true` | Whether to show template library |

## Animation Components

#### `TriggerMotion`

Component for scroll-triggered animations.

```tsx
import { TriggerMotion } from '@/components/Motion/TriggerMotion';

<TriggerMotion
  animation="fadeIn"
  delay={0.2}
  threshold={0.2}
>
  <div>This will animate when scrolled into view</div>
</TriggerMotion>
```

**Props:**

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `animation` | `"fadeIn" \| "slideUp" \| "slideIn" \| "zoomIn" \| "flip" \| "custom"` | `"fadeIn"` | Animation type |
| `delay` | `number` | `0` | Delay before animation starts (seconds) |
| `duration` | `number` | `0.6` | Animation duration (seconds) |
| `threshold` | `number` | `0.3` | Visibility threshold to trigger (0-1) |
| `ease` | `"power2.out" \| "power3.out" \| "back.out" \| "elastic.out" \| "none"` | `"power2.out"` | Easing function |
| `stagger` | `number` | `0` | Stagger delay for child elements |
| `once` | `boolean` | `true` | Whether to trigger only once |
| `disabled` | `boolean` | `false` | Whether animation is disabled |
| `as` | `React.ElementType` | `"div"` | Component wrapper element |
| `children` | `ReactNode` | required | Content to animate |
| `className` | `string` | - | Additional CSS class |
| `customAnimation` | `gsap.TweenVars` | - | Custom GSAP animation variables |

#### `PageTransition`

Animated transition between pages.

```tsx
import { PageTransition } from '@/components/PageTransition/PageTransition';

<PageTransition
  mode="fade"
  duration={0.4}
>
  <div>Page content</div>
</PageTransition>
```

**Props:**

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `mode` | `"fade" \| "slide" \| "scale" \| "flip" \| "custom"` | `"fade"` | Transition type |
| `direction` | `"up" \| "down" \| "left" \| "right"` | `"up"` | Direction for directional transitions |
| `duration` | `number` | `0.4` | Transition duration (seconds) |
| `ease` | `"power2.inOut" \| "power3.inOut" \| "back.inOut" \| "elastic.out" \| "none"` | `"power2.inOut"` | Easing function |
| `disabled` | `boolean` | `false` | Whether transition is disabled |
| `onlyExit` | `boolean` | `false` | Whether to animate only exit |
| `onlyEnter` | `boolean` | `false` | Whether to animate only entrance |
| `children` | `ReactNode` | required | Page content |
| `className` | `string` | - | Additional CSS class |
| `customEnter` | `gsap.TweenVars` | - | Custom enter animation |
| `customExit` | `gsap.TweenVars` | - | Custom exit animation |

## Error Handling Components

#### `ErrorBoundary`

Error boundary for catching JavaScript errors.

```tsx
import ErrorBoundary from '@/components/ui/ErrorBoundary';

<ErrorBoundary
  fallback={<CustomErrorComponent />}
  onError={handleError}
>
  <ComponentThatMightError />
</ErrorBoundary>
```

**Props:**

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | required | Components to render |
| `fallback` | `ReactNode \| ((error: Error, errorInfo: ErrorInfo, reset: () => void) => ReactNode)` | - | Custom fallback component |
| `onError` | `(error: Error, errorInfo: ErrorInfo) => void` | - | Error handler |
| `showDetails` | `boolean` | `true` | Whether to include stack traces |
| `retryable` | `boolean` | `true` | Whether error is retryable |
| `errorType` | `"client" \| "server" \| "network" \| "validation" \| "permission" \| "unknown"` | `"client"` | Type of error to display |
| `errorTitle` | `string` | - | Custom error title |
| `errorMessage` | `string` | - | Custom error message |
| `className` | `string` | - | Additional CSS class |
| `animate` | `boolean` | `true` | Whether to animate error state |

#### `AsyncBoundary`

Combined Suspense and error boundary.

```tsx
import AsyncBoundary from '@/components/ui/AsyncBoundary';

<AsyncBoundary
  fallbackComponent={<CustomLoadingComponent />}
  errorComponent={<CustomErrorComponent />}
>
  <SuspenseComponent />
</AsyncBoundary>
```

**Props:**

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | required | Components to render |
| `fallbackComponent` | `ReactNode` | `<Loader />` | Loading component for Suspense |
| `errorComponent` | `ReactNode \| ((error: Error, reset: () => void) => ReactNode)` | - | Custom error component |
| `onError` | `(error: Error) => void` | - | Error handler |
| `className` | `string` | - | Additional CSS class |
| `retryable` | `boolean` | `true` | Whether errors should be retryable |
| `errorBoundaryProps` | `Omit<ErrorBoundaryProps, 'children' \| 'fallback' \| 'onError'>` | - | Additional error boundary props |