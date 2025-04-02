# Fluxori-V2 Mantine + GSAP Component Library

This document provides an overview of the custom components created for the Fluxori-V2 frontend using Mantine UI and GSAP animations. Use this as a reference when building new features to maintain consistency and leverage existing components.

## Core Components

### Layout Components

#### AppShell

The main layout component with animated navigation and responsive design.

```tsx
import { AppShell } from '@/components/Layout/AppShell';

<AppShell title="Dashboard">
  {children}
</AppShell>
```

**Props:**
- `title`: Page title to display in header
- `children`: Content to render in the main area

**Features:**
- Responsive sidebar that collapses on mobile
- Animated navigation with active state
- Theme switching with smooth transitions
- Notification integration
- User menu with dropdown

#### PageTransition

Wrapper component for page content that provides animated transitions between routes.

```tsx
import { PageTransition } from '@/components/PageTransition/PageTransition';

<PageTransition type="fade-up">
  <YourPageContent />
</PageTransition>
```

**Props:**
- `type`: Animation type ('fade', 'slide-up', 'slide-down', 'slide-left', 'slide-right', 'scale', 'flip', 'reveal')
- `duration`: Animation duration in seconds (default: 0.5)
- `delay`: Delay before animation starts in seconds (default: 0)
- `ease`: Animation easing (default: 'power2.out')
- `disabled`: Whether to disable the transition

**Features:**
- Smooth transitions between pages
- Multiple animation types
- Configurable timing and easing
- Respects reduced motion preferences

### UI Components

#### AnimatedButton

Enhanced button with hover and click animations.

```tsx
import { AnimatedButton } from '@/components/Button/AnimatedButton';

<AnimatedButton onClick={handleClick}>
  Click Me
</AnimatedButton>
```

**Props:**
- All Mantine Button props
- `animateHover`: Enable hover animation (default: true)
- `animateClick`: Enable click animation (default: true)

**Features:**
- Subtle scale animation on hover
- Tactile feedback animation on click
- Maintains all Mantine Button functionality

#### AnimatedCard

Card component with entrance and hover animations.

```tsx
import { AnimatedCard } from '@/components/Card/AnimatedCard';

<AnimatedCard 
  title="Card Title" 
  description="Optional description"
  animateOnHover={true}
>
  Card content goes here
</AnimatedCard>
```

**Props:**
- All Mantine Card props
- `title`: Card title
- `description`: Optional description text
- `animateOnHover`: Whether to animate on hover (default: true)
- `entranceAnimation`: Type of entrance animation (default: 'fadeInUp')
- `animationDelay`: Delay for the entrance animation (default: 0)

**Features:**
- Fade in animation on mount
- Elevation animation on hover
- Consistent styling with title/description layout

#### DataTable

Advanced data table with sorting, filtering, and row animations.

```tsx
import { DataTable } from '@/components/DataTable/DataTable';

<DataTable
  data={items}
  columns={columns}
  loading={isLoading}
  selectable
  onRowClick={handleRowClick}
  pagination={{
    page: currentPage,
    total: totalPages,
    onPageChange: setCurrentPage,
    limit: pageSize,
    onLimitChange: setPageSize
  }}
/>
```

**Props:**
- `data`: Array of data items to display
- `columns`: Column definitions with keys, titles, and rendering functions
- `loading`: Whether the table is in loading state
- `selectable`: Whether rows can be selected
- `onRowClick`: Function called when a row is clicked
- `actions`: Configuration for row actions (view, edit, delete, custom)
- `pagination`: Pagination configuration
- `searchable`: Whether to show search input
- `onSearch`: Function called when search query changes
- `onSort`: Function called when sorting changes
- `onFilter`: Function called when filters change
- `animateRows`: Whether to animate rows (default: true)

**Features:**
- Staggered row animations on scroll
- Sorting with animated indicators
- Filtering with animated badge indicators
- Selection with checkboxes
- Responsive design with horizontal scrolling
- Empty state handling
- Loading state with spinner

#### AnimatedStatCard

Stat display card with number counting animation.

```tsx
import { AnimatedStatCard } from '@/components/StatCard/AnimatedStatCard';
import { IconUsers } from '@tabler/icons-react';

<AnimatedStatCard
  value={1234}
  title="Total Users"
  subtitle="Active accounts"
  icon={<IconUsers size={24} />}
  change={5.2}
  changeDirection="positive"
  changePeriod="vs last month"
/>
```

**Props:**
- `value`: Main metric value to display
- `title`: Title of the stat
- `subtitle`: Optional subtitle or description
- `previousValue`: Previous value for comparison
- `icon`: Icon for the stat
- `change`: Percentage change from previous period
- `changeDirection`: Direction of change ('positive' or 'negative')
- `changePeriod`: Label for the change period
- `animateValue`: Whether to animate the value counting up (default: true)
- `animationDuration`: Duration for number animation in seconds (default: 1.5)
- `animationDelay`: Delay before animation starts in seconds (default: 0.2)

**Features:**
- Number counting animation
- Color-coded change indicators
- Icon integration
- Subtle pulse effect on mount
- Optional mini sparkline area (customizable)

#### AnimatedChart

Chart container with entrance and data animations.

```tsx
import { AnimatedChart } from '@/components/Charts/AnimatedChart';
import { LineChart } from 'your-chart-library';

<AnimatedChart
  title="Sales Performance"
  description="Monthly sales figures"
  chartType="line"
  onChartTypeChange={setChartType}
  onRefresh={refetchData}
  loading={isLoading}
>
  <LineChart data={chartData} />
</AnimatedChart>
```

**Props:**
- `title`: Chart title
- `description`: Optional description
- `children`: Chart component to render
- `downloadable`: Whether to show download option (default: true)
- `refreshable`: Whether to show refresh button (default: true)
- `loading`: Whether the chart is loading
- `onRefresh`: Function called when refresh is clicked
- `chartHeight`: Height of the chart
- `onDownload`: Function to handle chart download
- `switchableType`: Whether to allow chart type switching (default: false)
- `chartType`: Current chart type ('line', 'bar', 'pie', 'area', 'radar', 'scatter')
- `onChartTypeChange`: Function called when chart type is changed
- `animate`: Whether to animate the chart on mount (default: true)
- `animationDuration`: Animation duration in seconds (default: 1)

**Features:**
- Container with consistent styling
- Loading state handling
- Chart type switching with animation
- Animation for chart elements (paths, bars, points)
- Download and refresh functionality
- Menu for chart options

## Feature Components

### Notification System

#### NotificationBell

Notification bell component with badge count and animations.

```tsx
import { NotificationBell } from '@/components/Notifications/NotificationBell';
import { useNotifications } from '@/hooks/useNotifications';

const { notifications, markAsRead, markAllAsRead } = useNotifications();

<NotificationBell
  notifications={notifications}
  onMarkAsRead={markAsRead}
  onMarkAllAsRead={markAllAsRead}
  onViewAllClick={() => router.push('/notifications')}
  maxPreview={5}
/>
```

**Props:**
- `notifications`: Array of notification objects
- `onMarkAsRead`: Function to mark a notification as read
- `onMarkAllAsRead`: Function to mark all notifications as read
- `onViewAllClick`: Function to navigate to notifications page
- `maxPreview`: Maximum number of notifications to show in preview
- `loading`: Whether notifications are loading

**Features:**
- Bell shake animation on new notifications
- Badge counter with count
- Dropdown with notification preview
- Read/unread state indicators
- Mark as read functionality
- Time formatting

#### NotificationCenter

Full-page notification center with filtering and sorting.

```tsx
import { NotificationCenter } from '@/components/Notifications/NotificationCenter';

<NotificationCenter
  notifications={notifications}
  onMarkAsRead={markAsRead}
  onMarkAllAsRead={markAllAsRead}
  loading={isLoading}
  onFilterChange={handleFilterChange}
  categories={notificationCategories}
/>
```

**Props:**
- `notifications`: Array of notification objects
- `onMarkAsRead`: Function to mark a notification as read
- `onMarkAllAsRead`: Function to mark all notifications as read
- `loading`: Whether notifications are loading
- `onFilterChange`: Function called when filters change
- `categories`: Available notification categories

**Features:**
- Tabs for notification types
- Filtering by type, read status, and category
- Sorting by date
- Staggered animations for notification items
- Empty state handling
- Read/unread state with animations

### AI Chat Components

#### ChatBubble

Individual chat message bubble with animations.

```tsx
import { ChatBubble } from '@/components/AI/ChatBubble';

<ChatBubble
  message="Hello, how can I help you today?"
  isUser={false}
  timestamp={new Date()}
  username="AI Assistant"
  isTyping={false}
  isStreaming={false}
/>
```

**Props:**
- `message`: Message content
- `isUser`: Whether this is from the user or the AI agent
- `timestamp`: Timestamp for the message
- `username`: Username to display
- `avatar`: User avatar URL or element
- `isTyping`: Whether the agent is currently typing
- `isError`: Whether there was an error
- `animate`: Whether to animate message appearance
- `isStreaming`: Whether the message is streaming in
- `animationDelay`: Animation delay in seconds

**Features:**
- Different styling for user and AI messages
- Typing indicator animation
- Text streaming effect for real-time responses
- Error state styling
- Code block formatting
- Entrance animations with direction based on sender

#### ChatInterface

Complete chat interface with streaming and file upload.

```tsx
import { ChatInterface } from '@/components/AI/ChatInterface';

<ChatInterface
  messages={chatMessages}
  onSendMessage={sendMessage}
  isResponding={isAiResponding}
  loading={isLoading}
  enableAttachments={true}
  onFileUpload={handleFileUpload}
  agentName="AI Assistant"
  isStreaming={isStreaming}
  streamingContent={streamingContent}
/>
```

**Props:**
- `messages`: Array of message objects
- `onSendMessage`: Function to handle sending messages
- `isResponding`: Whether the AI is currently responding
- `loading`: Loading state
- `enableAttachments`: Whether to enable sending files/images
- `onFileUpload`: Function to handle file uploads
- `animateMessages`: Whether to animate messages
- `agentName`: AI agent name
- `welcomeMessage`: Welcome message to display when no messages exist
- `isStreaming`: Whether currently streaming a response
- `streamingContent`: Current streaming message content

**Features:**
- Complete chat UI with header, message list, and input
- Real-time message streaming with typing indicators
- File upload functionality
- Empty state with welcome message
- Scroll to bottom button that appears when needed
- Auto-sizing text input
- Keyboard shortcuts (Ctrl+Enter to send)

### Motion Components

#### TriggerMotion

Wrapper component that triggers animations when elements enter the viewport.

```tsx
import { TriggerMotion } from '@/components/Motion/TriggerMotion';

<TriggerMotion 
  type="fade-up" 
  stagger={true} 
  staggerAmount={0.1}
>
  <div>First Child</div>
  <div>Second Child</div>
  <div>Third Child</div>
</TriggerMotion>
```

**Props:**
- `type`: Animation type ('fade-in', 'fade-up', 'fade-down', 'fade-left', 'fade-right', 'zoom-in', 'zoom-out', 'flip', 'rotate', 'bounce', 'reveal', 'text-reveal')
- `duration`: Animation duration in seconds (default: 0.6)
- `delay`: Delay before animation starts in seconds (default: 0)
- `ease`: Animation easing (default: 'power2.out')
- `stagger`: Whether to stagger child elements (default: false)
- `staggerAmount`: Stagger amount in seconds (default: 0.1)
- `staggerFrom`: Stagger from direction ('start', 'end', 'center', 'edges', 'random')
- `amount`: Amount of motion for translations in pixels (default: 40)
- `threshold`: Threshold for intersection observer (default: 0.1)
- `rootMargin`: Root margin for intersection observer (default: '0px')
- `once`: Whether to animate once or every time element enters viewport (default: true)
- `disabled`: Whether animation is disabled (default: false)

**Features:**
- Scroll-triggered animations
- Multiple animation types
- Staggered animations for child elements
- Special text reveal animation that splits text characters
- Configurable intersection thresholds
- One-time or repeating animations

## Animation Hooks

### useAnimatedMount

Hook to animate an element when it mounts.

```tsx
import { useAnimatedMount } from '@/hooks/useAnimation';

const MyComponent = () => {
  const elementRef = useAnimatedMount('fadeInUp', {
    delay: 0.2,
    duration: 0.6
  });
  
  return <div ref={elementRef}>This content animates on mount</div>;
};
```

**Parameters:**
- `animation`: Animation type ('fadeInUp', 'fadeIn', 'scaleIn', 'revealText')
- `options`: Animation options (delay, duration, disabled, onComplete)

**Returns:**
- React ref to attach to the element

### useAnimateOnScroll

Hook to animate elements when they enter the viewport.

```tsx
import { useAnimateOnScroll } from '@/hooks/useAnimation';

const MyComponent = () => {
  const { ref, isInView } = useAnimateOnScroll('fadeInUp', {
    threshold: 0.2,
    rootMargin: '0px 0px -100px 0px',
    duration: 0.8
  });
  
  return <div ref={ref}>This animates when scrolled into view</div>;
};
```

**Parameters:**
- `animation`: Animation type ('fadeInUp', 'fadeIn', 'scaleIn', 'revealText')
- `options`: Animation options (threshold, duration, rootMargin, disabled, start, end, scrub, pin, markers, onEnter, onLeave)

**Returns:**
- Object with:
  - `ref`: React ref to attach to the element
  - `isInView`: Boolean indicating if element is in viewport

### useStaggerAnimation

Hook to create a staggered animation for multiple children.

```tsx
import { useStaggerAnimation } from '@/hooks/useAnimation';

const MyListComponent = () => {
  const listRef = useStaggerAnimation({
    stagger: 0.08,
    delay: 0.2,
    duration: 0.5
  });
  
  return (
    <ul ref={listRef}>
      <li>Item 1</li>
      <li>Item 2</li>
      <li>Item 3</li>
    </ul>
  );
};
```

**Parameters:**
- `options`: Animation options (stagger, delay, duration, disabled, y, onComplete)

**Returns:**
- React ref to attach to the container element

### useDrawSVG

Hook to create an SVG drawing animation.

```tsx
import { useDrawSVG } from '@/hooks/useAnimation';

const MyComponent = () => {
  const svgRef = useDrawSVG({
    delay: 0.5,
    duration: 2,
    from: '0%',
    to: '100%'
  });
  
  return (
    <svg ref={svgRef} viewBox="0 0 100 100">
      <path d="M10,50 L90,50" stroke="black" fill="none" />
    </svg>
  );
};
```

**Parameters:**
- `options`: Animation options (delay, duration, disabled, from, to, ease, onComplete)

**Returns:**
- React ref to attach to the SVG element

### useTextReveal

Hook to create a text reveal animation with SplitText.

```tsx
import { useTextReveal } from '@/hooks/useAnimation';

const MyComponent = () => {
  const textRef = useTextReveal({
    delay: 0.5,
    duration: 0.8,
    stagger: 0.02
  });
  
  return <h1 ref={textRef}>This text will animate character by character</h1>;
};
```

**Parameters:**
- `options`: Animation options (delay, duration, stagger, disabled, ease, onComplete)

**Returns:**
- React ref to attach to the text element

## Utility Hooks

### useNotifications

Hook for managing notifications with real-time updates and persistence.

```tsx
import { useNotifications } from '@/hooks/useNotifications';

const MyComponent = () => {
  const {
    notifications,
    loading,
    error,
    unreadCount,
    connected,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll
  } = useNotifications({
    showToasts: true,
    enableRealtime: true
  });
  
  return (
    <div>
      <span>You have {unreadCount} unread notifications</span>
      <NotificationBell 
        notifications={notifications}
        onMarkAsRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
      />
    </div>
  );
};
```

**Parameters:**
- `options`: Configuration options
  - `showToasts`: Whether to show toast notifications for new items
  - `enableRealtime`: Whether to auto-connect WebSocket for real-time updates
  - `websocketUrl`: URL for WebSocket connection
  - `maxItems`: Maximum number of notifications to keep in state
  - `persistLocally`: Whether to persist notifications in localStorage
  - `storageKey`: localStorage key for persisting notifications

**Returns:**
- Object with notification state and methods:
  - `notifications`: Array of notification objects
  - `loading`: Whether notifications are loading
  - `error`: Error message if any
  - `unreadCount`: Number of unread notifications
  - `connected`: Whether WebSocket is connected
  - `addNotification`: Function to add a new notification
  - `markAsRead`: Function to mark a notification as read
  - `markAllAsRead`: Function to mark all notifications as read
  - `removeNotification`: Function to remove a notification
  - `clearAll`: Function to clear all notifications
  - `simulateNewNotification`: Function to simulate receiving a new notification (for testing)

---

Last Updated: April 2, 2025