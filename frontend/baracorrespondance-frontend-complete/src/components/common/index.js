/**
 * Central Component Import Configuration
 * BaraCorrespondance - Simplified Imports
 * 
 * Usage:
 * import { StatCard, Modal, Header, ... } from '@/components/common';
 * OR
 * import * as CommonComponents from '@/components/common';
 */

// ============================================
// LAYOUT COMPONENTS
// ============================================
export { default as Header } from './Header';
export { default as Footer } from './Footer';
export { default as HeroSection } from './HeroSection';

// ============================================
// CARD COMPONENTS
// ============================================
export { default as JobCard } from './JobCard';
export { default as StatisticsCard } from './StatisticsCard';

// Advanced Stats - Named Exports
export {
  StatCard,
  ChartCard,
  ProgressCard,
  KPICard,
  ComparisonCard,
  ActivityCard
} from './AdvancedStats';

// ============================================
// FORM COMPONENTS
// ============================================
export {
  FormField,
  FormGroup,
  Form
} from './Form';

// ============================================
// LISTS & STATES COMPONENTS
// ============================================
export {
  EmptyState,
  ListGroup,
  GridList,
  Timeline,
  Accordion,
  Breadcrumb,
  Pagination,
  SearchableList
} from './ListsAndStates';

// ============================================
// MODALS & NOTIFICATIONS
// ============================================
export {
  Modal,
  Toast,
  ToastContainer,
  ConfirmDialog,
  Alert,
  Tooltip,
  NotificationBadge,
  Drawer,
  useToast
} from './ModalsAndNotifications';

// ============================================
// INTERACTIVE COMPONENTS
// ============================================
export { default as OnboardingTour } from './OnboardingTour';
export { default as Loaders } from './Loaders';
