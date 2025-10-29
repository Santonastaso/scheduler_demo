import { createEntityStore, createUIStore } from '@santonastaso/shared';

/**
 * Modern store implementations using shared store factory
 * These replace the individual store files with standardized patterns
 */

/**
 * Machines Store
 * Replaces useMachineStore.js with factory-generated store
 */
export const useMachinesStore = createEntityStore(
  'machines',
  // Custom actions specific to machines
  (set, get) => ({
    // Machine-specific selectors
    getMachinesByWorkCenter: (workCenter) => {
      const state = get();
      if (workCenter === 'BOTH') {
        return state.entities;
      }
      return state.entities.filter(machine => machine.work_center === workCenter);
    },

    getAvailableMachines: () => {
      const state = get();
      return state.entities.filter(machine => machine.status === 'available');
    },

    getMachineById: (id) => {
      const state = get();
      return state.entities.find(machine => machine.id === id);
    },

    // Machine-specific actions
    updateMachineStatus: (id, status) => {
      const state = get();
      const updatedMachines = state.entities.map(machine => 
        machine.id === id 
          ? { ...machine, status, updated_at: new Date().toISOString() }
          : machine
      );
      set({ entities: updatedMachines });
    },

    // Statistics
    getMachineStats: () => {
      const state = get();
      const stats = {
        total: state.entities.length,
        byStatus: {},
        byWorkCenter: {}
      };

      state.entities.forEach(machine => {
        // Count by status
        stats.byStatus[machine.status] = (stats.byStatus[machine.status] || 0) + 1;
        
        // Count by work center
        stats.byWorkCenter[machine.work_center] = (stats.byWorkCenter[machine.work_center] || 0) + 1;
      });

      return stats;
    },
  }),
  // Custom selectors
  (get) => ({
    // Additional computed values can be added here
  }),
  // Persistence options
  {
    partialize: (state) => ({
      entities: state.entities,
      initialized: state.initialized
    })
  }
);

/**
 * Orders Store
 * Replaces useOrderStore.js with factory-generated store
 */
export const useOrdersStore = createEntityStore(
  'orders',
  // Custom actions specific to orders
  (set, get) => ({
    // Order-specific selectors
    getScheduledOrders: () => {
      const state = get();
      return state.entities.filter(order => order.status === 'SCHEDULED');
    },

    getUnscheduledOrders: () => {
      const state = get();
      return state.entities.filter(order => 
        order.status !== 'SCHEDULED' && 
        order.duration > 0 && 
        order.cost > 0
      );
    },

    getOrdersByWorkCenter: (workCenter) => {
      const state = get();
      if (workCenter === 'BOTH') {
        return state.entities;
      }
      return state.entities.filter(order => order.work_center === workCenter);
    },

    getOrderById: (id) => {
      const state = get();
      return state.entities.find(order => order.id === id);
    },

    // Order-specific actions
    scheduleOrder: (id, schedulingData) => {
      const state = get();
      const updatedOrders = state.entities.map(order => 
        order.id === id 
          ? { 
              ...order, 
              ...schedulingData,
              status: 'SCHEDULED',
              updated_at: new Date().toISOString()
            }
          : order
      );
      set({ entities: updatedOrders });
    },

    unscheduleOrder: (id) => {
      const state = get();
      const updatedOrders = state.entities.map(order => 
        order.id === id 
          ? { 
              ...order,
              status: 'NOT SCHEDULED',
              scheduled_start_time: null,
              scheduled_end_time: null,
              machine_id: null,
              updated_at: new Date().toISOString()
            }
          : order
      );
      set({ entities: updatedOrders });
    },

    // Bulk operations
    bulkScheduleOrders: (updates) => {
      const state = get();
      const updatedOrders = state.entities.map(order => {
        const update = updates.find(u => u.id === order.id);
        return update 
          ? { 
              ...order, 
              ...update.data,
              status: 'SCHEDULED',
              updated_at: new Date().toISOString()
            }
          : order;
      });
      set({ entities: updatedOrders });
    },

    // Statistics
    getOrderStats: () => {
      const state = get();
      const stats = {
        total: state.entities.length,
        scheduled: 0,
        unscheduled: 0,
        byWorkCenter: {}
      };

      state.entities.forEach(order => {
        if (order.status === 'SCHEDULED') {
          stats.scheduled++;
        } else {
          stats.unscheduled++;
        }
        
        stats.byWorkCenter[order.work_center] = (stats.byWorkCenter[order.work_center] || 0) + 1;
      });

      return stats;
    },
  }),
  // Custom selectors
  (get) => ({
    // Additional computed values can be added here
  }),
  // Persistence options
  {
    partialize: (state) => ({
      entities: state.entities,
      initialized: state.initialized
    })
  }
);

/**
 * Phases Store
 * Replaces usePhaseStore.js with factory-generated store
 */
export const usePhasesStore = createEntityStore(
  'phases',
  // Custom actions specific to phases
  (set, get) => ({
    // Phase-specific selectors
    getPhasesByWorkCenter: (workCenter) => {
      const state = get();
      return state.entities.filter(phase => phase.work_center === workCenter);
    },

    getPhaseById: (id) => {
      const state = get();
      return state.entities.find(phase => phase.id === id);
    },

    searchPhases: (searchTerm) => {
      const state = get();
      if (!searchTerm) return state.entities;
      
      const term = searchTerm.toLowerCase();
      return state.entities.filter(phase => 
        phase.phase_name?.toLowerCase().includes(term) ||
        phase.description?.toLowerCase().includes(term)
      );
    },

    // Phase-specific actions
    updatePhaseDetails: (id, updates) => {
      const state = get();
      const updatedPhases = state.entities.map(phase => 
        phase.id === id 
          ? { ...phase, ...updates, updated_at: new Date().toISOString() }
          : phase
      );
      set({ entities: updatedPhases });
    },

    // Statistics
    getPhaseStats: () => {
      const state = get();
      const stats = {
        total: state.entities.length,
        byWorkCenter: {}
      };

      state.entities.forEach(phase => {
        stats.byWorkCenter[phase.work_center] = (stats.byWorkCenter[phase.work_center] || 0) + 1;
      });

      return stats;
    },
  }),
  // Custom selectors
  (get) => ({
    // Additional computed values can be added here
  }),
  // Persistence options
  {
    partialize: (state) => ({
      entities: state.entities,
      initialized: state.initialized
    })
  }
);

/**
 * Enhanced UI Store
 * Replaces useUIStore.js with factory-generated store plus scheduler-specific state
 */
export const useSchedulerUIStore = createUIStore(
  // Custom actions specific to scheduler UI
  (set, get) => ({
    // Scheduler-specific state
    selectedWorkCenter: 'BOTH',
    isEditMode: false,
    schedulingLoading: {
      isScheduling: false,
      isRescheduling: false,
      isShunting: false,
      taskId: null
    },
    conflictDialog: {
      isOpen: false,
      conflictingTasks: [],
      newTask: null
    },
    dragPreview: {
      isActive: false,
      startSlot: null,
      durationSlots: 0,
      machineId: null
    },

    // Scheduler-specific actions
    setSelectedWorkCenter: (workCenter) => set({ selectedWorkCenter: workCenter }),
    
    setEditMode: (isEditMode) => set({ isEditMode }),
    
    setSchedulingLoading: (loading) => {
      const state = get();
      set({ 
        schedulingLoading: { 
          ...state.schedulingLoading, 
          ...loading 
        } 
      });
    },

    startSchedulingOperation: (operationType = null, taskId = null) => {
      set({ 
        schedulingLoading: {
          isScheduling: operationType === 'schedule',
          isRescheduling: operationType === 'reschedule',
          isShunting: operationType === 'shunt',
          isNavigating: operationType === 'navigate',
          operationType,
          taskId
        }
      });
    },

    stopSchedulingOperation: () => {
      set({
        schedulingLoading: {
          isScheduling: false,
          isRescheduling: false,
          isShunting: false,
          isNavigating: false,
          operationType: null,
          taskId: null
        }
      });
    },
    
    setConflictDialog: (dialog) => {
      const state = get();
      set({ 
        conflictDialog: { 
          ...state.conflictDialog, 
          ...dialog 
        } 
      });
    },

    // Drag preview actions
    setDragPreview: (previewData) => {
      set({ dragPreview: previewData });
    },

    clearDragPreview: () => {
      set({
        dragPreview: {
          isActive: false,
          startSlot: null,
          durationSlots: 0,
          machineId: null
        }
      });
    },

    openConflictDialog: (conflictingTasks, newTask) => {
      set({ 
        conflictDialog: {
          isOpen: true,
          conflictingTasks,
          newTask
        }
      });
    },

    closeConflictDialog: () => {
      set({ 
        conflictDialog: {
          isOpen: false,
          conflictingTasks: [],
          newTask: null
        }
      });
    },

    // Enhanced notification system for scheduler
    showSchedulerAlert: (message, type = 'info', duration = 5000) => {
      const state = get();
      const notification = {
        type,
        message,
        timestamp: Date.now()
      };
      
      state.addNotification(notification);
      
      // Auto-remove after duration
      if (duration > 0) {
        setTimeout(() => {
          state.removeNotification(notification.id);
        }, duration);
      }
    },

    // Confirmation dialogs
    showConfirmDialog: (title, message, onConfirm, type = 'info') => {
      const state = get();
      state.setFormData('confirmDialog', {
        isOpen: true,
        title,
        message,
        onConfirm,
        type
      });
      state.openModal('confirmDialog');
    },

    closeConfirmDialog: () => {
      const state = get();
      state.clearFormData('confirmDialog');
      state.closeModal('confirmDialog');
    },

    // Scheduler-specific getters
    getInitializationState: () => {
      const state = get();
      return state.initialized;
    },

    getLoadingState: (key) => {
      const state = get();
      return key ? state.loadingStates[key] || false : state.loading;
    },
  }),
  // Persistence options
  {
    partialize: (state) => ({
      selectedWorkCenter: state.selectedWorkCenter,
      theme: state.theme,
      sidebarOpen: state.sidebarOpen,
      filters: state.filters
    })
  }
);

/**
 * Main Store (legacy compatibility)
 * Provides a unified interface for the old useMainStore
 */
export const useMainStore = createEntityStore(
  'main',
  // Custom actions
  (set, get) => ({
    // Initialization
    init: async () => {
      try {
        const uiStore = useSchedulerUIStore.getState();
        uiStore.setLoading(true);
        
        // Initialize services (this would be handled by React Query in practice)
        // The actual data fetching is now handled by React Query hooks
        
        uiStore.setInitialized(true);
        uiStore.setLoading(false);
        
        uiStore.showSchedulerAlert(
          'Application initialized successfully with modern architecture',
          'success'
        );
      } catch (error) {
        const uiStore = useSchedulerUIStore.getState();
        uiStore.setLoading(false);
        uiStore.showSchedulerAlert(
          'Failed to initialize application',
          'error'
        );
        throw error;
      }
    },

    // Data refresh (now handled by React Query)
    refreshData: () => {
      console.warn('refreshData is deprecated. Use React Query invalidation instead.');
    },

    // Reset all stores
    reset: () => {
      useMachinesStore.getState().reset();
      useOrdersStore.getState().reset();
      usePhasesStore.getState().reset();
      useSchedulerUIStore.getState().reset();
    },

    // Cleanup
    cleanup: () => {
      // Cleanup is now handled by React Query and service cleanup
      console.log('Cleanup handled by modern architecture');
    },

    // State getters
    getState: () => {
      const machinesStore = useMachinesStore.getState();
      const ordersStore = useOrdersStore.getState();
      const phasesStore = usePhasesStore.getState();
      const uiStore = useSchedulerUIStore.getState();
      
      return {
        machines: machinesStore.entities,
        odpOrders: ordersStore.entities,
        phases: phasesStore.entities,
        isLoading: uiStore.loading,
        isInitialized: uiStore.initialized,
      };
    },
  })
);

// Export individual stores for direct access
export {
  useMachinesStore as useModernMachineStore,
  useOrdersStore as useModernOrderStore,
  usePhasesStore as useModernPhaseStore,
  useSchedulerUIStore as useModernUIStore
};
