/**
 * Feedback Feature Module
 */

// Export components
export { FeedbackButton } from './components/FeedbackButton';
export { FeedbackForm } from './components/FeedbackForm';
export { default as FeedbackList } from './components/FeedbackList';
export { FeedbackAnalytics } from './components/FeedbackAnalytics';

// Export hooks
export { useFeedback } from './hooks/useFeedback';

// Export types
export {
  FeedbackType,
  FeedbackCategory,
  FeedbackSeverity,
  FeedbackStatus,
  type Feedback,
  type SubmitFeedbackRequest,
  type UpdateFeedbackRequest
} from './api/feedback.api';