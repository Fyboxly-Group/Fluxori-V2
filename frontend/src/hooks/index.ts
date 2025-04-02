// Authentication hooks
export { useAuth } from './useAuth';

// User management hooks
export { 
  useUsers, 
  useRoles, 
  useActivityLogs, 
  useOrganizationSettings 
} from './user-management';

// Animation hooks
export { useAnimation } from './useAnimation';
export { useEnhancedAnimation } from './useEnhancedAnimation';
export { useOptimizedAnimation } from './useOptimizedAnimation';
export { useMotionPreference } from './useMotionPreference';

// Notifications hooks
export { useNotifications } from './useNotifications';

// Inventory hooks
export { 
  useProducts, 
  useProduct, 
  useProductCategories, 
  useProductSuppliers,
  useProductVariants,
  useInventorySummary,
  useProductStockHistory,
  useProductImportExport,
  useMarketplaceSync
} from './useInventory';

// Order hooks
export {
  useOrders,
  useOrder,
  useOrderDocuments,
  useOrderShipments,
  useShipment,
  useShippingRates,
  useOrderSummary,
  useOrderExport
} from './useOrders';

// BuyBox hooks
export {
  useBuyBoxStatuses,
  useBuyBoxStatus,
  useBuyBoxPriceHistory,
  useBuyBoxWinRate,
  useCompetitorAnalysis,
  useBuyBoxSummary,
  useRepricingRules,
  useRepricingRule,
  useRuleTemplates,
  useRuleTemplate,
  useRepricingEvents
} from './useBuybox';

// Reporting hooks
export {
  useDataSources,
  useDataSource,
  useReports,
  useReport,
  useReportTemplates,
  useVisualizations,
  useReportPreview,
  useDashboards,
  useDashboard
} from './useReporting';

// AI hooks
export {
  useAIInsights,
  useAIInsight,
  useAISummary,
  useAIConversations,
  useAIConversation,
  useAIRecommendations,
  useAIAnalysis,
  useNLQuery
} from './useAI';

// Accessibility hooks
export {
  useAnimationA11y,
  useAnnounce,
  useFocusTrap,
  useI18n,
  useKeyboardNavigation
} from './accessibility';