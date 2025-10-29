// Modern store exports (replace legacy ones)
export { 
  useMachinesStore as useMachineStore,
  useOrdersStore as useOrderStore,
  usePhasesStore as usePhaseStore,
  useSchedulerUIStore as useUIStore,
  useMainStore
} from './modernStores';

// Export modern stores with new names
export {
  useMachinesStore,
  useOrdersStore,
  usePhasesStore,
  useSchedulerUIStore
} from './modernStores';

// Legacy exports that don't conflict
export { useSchedulerStore } from './useSchedulerStore';

// Store factory functions are now imported from @santonastaso/shared
