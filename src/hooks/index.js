/**
 * Custom Hooks Index
 * Centralized export for all custom hooks
 */

export { default as useProductionCalculations } from './useProductionCalculations';
export { default as useValidation } from './useValidation';
export { useErrorHandler, useValidationErrorHandler } from '@santonastaso/shared';
export { usePhaseSearch } from './usePhaseSearch';

// React Query hooks
export * from './useQueries';

// Store sync hook
export { useStoreSync } from './useStoreSync';

// Theme and UI hooks
export { useTheme } from '@santonastaso/shared';
export { useSidebar } from '@santonastaso/shared';

// Export all custom hooks
export * from './useProductionCalculations';
export * from './useValidation';
// useErrorHandler already exported above
export * from './usePhaseSearch';
