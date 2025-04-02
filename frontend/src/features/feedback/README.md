# Feedback System for Fluxori-V2

This module implements a comprehensive feedback collection and management system for the Fluxori-V2 platform, allowing users to submit structured feedback and administrators to review, respond to, and analyze user feedback.

## Features

### For Users
- Submit structured feedback (bug reports, feature requests, usability issues, performance issues, general feedback)
- Include screenshots with feedback (via capture or upload)
- View feedback history and status updates
- Receive notifications about feedback responses
- Access feedback from anywhere in the application via the floating button

### For Administrators
- Centralized dashboard for feedback management
- Filter and search through feedback items
- Respond to feedback items directly
- Update status of feedback items (new, under review, in progress, completed, declined, planned)
- Analyze feedback trends with visual charts and statistics
- Filter feedback by organization

## Implementation Details

### Frontend Components
- `FeedbackButton`: Floating button available throughout the application
- `FeedbackForm`: Form for submitting feedback with screenshot capability
- `FeedbackList`: Display of feedback items with filtering and search
- `FeedbackAnalytics`: Visual analytics dashboard for administrators
- `useFeedback`: React hook for feedback functionality

### Backend Components
- `FeedbackController`: Handles HTTP requests for feedback operations
- `FeedbackService`: Business logic for feedback management
- `FeedbackModel`: Firestore data model for feedback items
- Notification integration for status updates and responses

### Data Model
- Feedback types: bug, feature_request, usability, performance, general
- Feedback categories: ui, data, reports, inventory, marketplace, shipping, billing, accounts, other
- Feedback severity: critical, high, medium, low
- Feedback status: new, under_review, in_progress, completed, declined, planned

## Storage
- All feedback data is stored in Firestore
- Screenshots are stored in Firebase Storage

## Routes
- `POST /api/feedback`: Submit new feedback
- `GET /api/feedback/user`: Get current user's feedback
- `GET /api/feedback/:id`: Get feedback by ID
- `PATCH /api/feedback/:id`: Update feedback (admin)
- `DELETE /api/feedback/:id`: Delete feedback (admin)
- `GET /api/feedback/admin`: Get all feedback (admin)
- `GET /api/feedback/organization/:organizationId`: Get organization feedback
- `GET /api/feedback/analytics`: Get feedback analytics

## Pages
- `/feedback`: User feedback history and submission
- `/admin/feedback`: Admin feedback management dashboard

## Integration Points
- Connected with user authentication system
- Integrated with notification system for status updates
- Captures system information for context
- Automatically notifies users of feedback status changes

## Usage Example
```tsx
// Adding feedback button to a layout
import { FeedbackButton } from '@/features/feedback';

function AppLayout() {
  return (
    <div>
      {/* Your app content */}
      <FeedbackButton position="bottom-right" />
    </div>
  );
}
```

## Future Enhancements
- Add export functionality for feedback data
- Implement integrations with issue tracking systems (JIRA, GitHub Issues)
- Create automated routing of feedback based on category
- Add feedback templates for common feedback types
- Implement AI-based categorization and prioritization of feedback