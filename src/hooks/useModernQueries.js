import { useQueryClient } from '@tanstack/react-query';
import { 
  useEnhancedMachinesHooks, 
  useEnhancedOrdersHooks, 
  useEnhancedPhasesHooks,
  enhancedMachinesService,
  enhancedOrdersService,
  enhancedPhasesService
} from '../services/ModernSchedulerService';
import { useSchedulerUIStore } from '../store/modernStores';

/**
 * Modern React Query hooks for scheduler_demo
 * These replace the old useQueries.js with standardized patterns
 */

/**
 * Machines Hooks
 */
export const useMachines = (options = {}) => {
  const machinesHooks = useEnhancedMachinesHooks;
  
  return machinesHooks.useList(
    {
      orderBy: 'machine_name',
      ascending: true,
      ...options
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      onError: (error) => {
        console.error('Failed to fetch machines:', error);
      }
    }
  );
};

export const useMachine = (id) => {
  const machinesHooks = useEnhancedMachinesHooks;
  
  return machinesHooks.useDetail(id, '*', {
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useMachinesByWorkCenter = (workCenter) => {
  return useMachines({
    filters: workCenter && workCenter !== 'BOTH' ? { work_center: workCenter } : undefined
  });
};

export const useCreateMachine = () => {
  const machinesHooks = useEnhancedMachinesHooks;
  const { showSchedulerAlert } = useSchedulerUIStore();
  
  return machinesHooks.useCreate({
    onSuccess: () => {
      showSchedulerAlert('Machine created successfully', 'success');
    },
    onError: (error) => {
      showSchedulerAlert(`Failed to create machine: ${error.message}`, 'error');
    }
  });
};

export const useUpdateMachine = () => {
  const machinesHooks = useEnhancedMachinesHooks;
  const { showSchedulerAlert } = useSchedulerUIStore();
  
  return machinesHooks.useUpdate({
    onSuccess: () => {
      showSchedulerAlert('Machine updated successfully', 'success');
    },
    onError: (error) => {
      showSchedulerAlert(`Failed to update machine: ${error.message}`, 'error');
    }
  });
};

export const useDeleteMachine = () => {
  const machinesHooks = useEnhancedMachinesHooks;
  const { showSchedulerAlert } = useSchedulerUIStore();
  
  return machinesHooks.useDelete({
    onSuccess: () => {
      showSchedulerAlert('Machine deleted successfully', 'success');
    },
    onError: (error) => {
      showSchedulerAlert(`Failed to delete machine: ${error.message}`, 'error');
    }
  });
};

/**
 * Orders Hooks
 */
export const useOrders = (options = {}) => {
  const ordersHooks = useEnhancedOrdersHooks;
  
  return ordersHooks.useList(
    {
      orderBy: 'created_at',
      ascending: false,
      ...options
    },
    {
      staleTime: 2 * 60 * 1000, // 2 minutes (orders change more frequently)
      onError: (error) => {
        console.error('Failed to fetch orders:', error);
      }
    }
  );
};

export const useOrder = (id) => {
  const ordersHooks = useEnhancedOrdersHooks;
  
  return ordersHooks.useDetail(id, '*', {
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
};

export const useUnscheduledOrders = (workCenter) => {
  const { data: allOrders = [], ...query } = useOrders();
  
  const unscheduledOrders = allOrders.filter(order => {
    const isUnscheduled = order.status !== 'SCHEDULED' && 
                         order.duration > 0 && 
                         order.cost > 0;
    
    if (!isUnscheduled) return false;
    
    if (workCenter && workCenter !== 'BOTH') {
      return order.work_center === workCenter;
    }
    
    return true;
  });
  
  return {
    ...query,
    data: unscheduledOrders
  };
};

export const useScheduledOrders = (workCenter) => {
  const { data: allOrders = [], ...query } = useOrders();
  
  const scheduledOrders = allOrders.filter(order => {
    const isScheduled = order.status === 'SCHEDULED';
    
    if (!isScheduled) return false;
    
    if (workCenter && workCenter !== 'BOTH') {
      return order.work_center === workCenter;
    }
    
    return true;
  });
  
  return {
    ...query,
    data: scheduledOrders
  };
};

export const useCreateOrder = () => {
  const ordersHooks = useEnhancedOrdersHooks;
  const { showSchedulerAlert } = useSchedulerUIStore();
  
  return ordersHooks.useCreate({
    onSuccess: () => {
      showSchedulerAlert('Order created successfully', 'success');
    },
    onError: (error) => {
      showSchedulerAlert(`Failed to create order: ${error.message}`, 'error');
    }
  });
};

export const useUpdateOrder = () => {
  const ordersHooks = useEnhancedOrdersHooks;
  const { showSchedulerAlert } = useSchedulerUIStore();
  
  return ordersHooks.useUpdate({
    onSuccess: () => {
      showSchedulerAlert('Order updated successfully', 'success');
    },
    onError: (error) => {
      showSchedulerAlert(`Failed to update order: ${error.message}`, 'error');
    }
  });
};

export const useRemoveOrder = () => {
  const ordersHooks = useEnhancedOrdersHooks;
  const { showSchedulerAlert } = useSchedulerUIStore();
  
  return ordersHooks.useDelete({
    onSuccess: () => {
      showSchedulerAlert('Order deleted successfully', 'success');
    },
    onError: (error) => {
      showSchedulerAlert(`Failed to delete order: ${error.message}`, 'error');
    }
  });
};

/**
 * Phases Hooks
 */
export const usePhases = (options = {}) => {
  const phasesHooks = useEnhancedPhasesHooks;
  
  return phasesHooks.useList(
    {
      orderBy: 'phase_name',
      ascending: true,
      ...options
    },
    {
      staleTime: 10 * 60 * 1000, // 10 minutes (phases change less frequently)
      onError: (error) => {
        console.error('Failed to fetch phases:', error);
      }
    }
  );
};

export const usePhase = (id) => {
  const phasesHooks = useEnhancedPhasesHooks;
  
  return phasesHooks.useDetail(id, '*', {
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });
};

export const usePhasesByWorkCenter = (workCenter) => {
  return usePhases({
    filters: workCenter ? { work_center: workCenter } : undefined
  });
};

export const usePhaseSearch = (searchTerm) => {
  const phasesHooks = useEnhancedPhasesHooks;
  
  return phasesHooks.useSearch(
    searchTerm,
    ['phase_name', 'description'],
    {
      orderBy: 'phase_name'
    },
    {
      enabled: searchTerm && searchTerm.length > 0,
      staleTime: 5 * 60 * 1000,
    }
  );
};

export const useCreatePhase = () => {
  const phasesHooks = useEnhancedPhasesHooks;
  const { showSchedulerAlert } = useSchedulerUIStore();
  
  return phasesHooks.useCreate({
    onSuccess: () => {
      showSchedulerAlert('Phase created successfully', 'success');
    },
    onError: (error) => {
      showSchedulerAlert(`Failed to create phase: ${error.message}`, 'error');
    }
  });
};

export const useUpdatePhase = () => {
  const phasesHooks = useEnhancedPhasesHooks;
  const { showSchedulerAlert } = useSchedulerUIStore();
  
  return phasesHooks.useUpdate({
    onSuccess: () => {
      showSchedulerAlert('Phase updated successfully', 'success');
    },
    onError: (error) => {
      showSchedulerAlert(`Failed to update phase: ${error.message}`, 'error');
    }
  });
};

export const useDeletePhase = () => {
  const phasesHooks = useEnhancedPhasesHooks;
  const { showSchedulerAlert } = useSchedulerUIStore();
  
  return phasesHooks.useDelete({
    onSuccess: () => {
      showSchedulerAlert('Phase deleted successfully', 'success');
    },
    onError: (error) => {
      showSchedulerAlert(`Failed to delete phase: ${error.message}`, 'error');
    }
  });
};

/**
 * Scheduling-specific hooks
 */
export const useScheduleOrder = () => {
  const updateOrder = useUpdateOrder();
  const { setSchedulingLoading } = useSchedulerUIStore();
  
  return {
    mutate: async (orderData) => {
      try {
        setSchedulingLoading({ isScheduling: true, taskId: orderData.id });
        
        await updateOrder.mutateAsync({
          id: orderData.id,
          data: {
            ...orderData,
            status: 'SCHEDULED',
            updated_at: new Date().toISOString()
          }
        });
        
      } finally {
        setSchedulingLoading({ isScheduling: false, taskId: null });
      }
    },
    ...updateOrder
  };
};

export const useUnscheduleOrder = () => {
  const updateOrder = useUpdateOrder();
  const { setSchedulingLoading } = useSchedulerUIStore();
  
  return {
    mutate: async (orderId) => {
      try {
        setSchedulingLoading({ isRescheduling: true, taskId: orderId });
        
        await updateOrder.mutateAsync({
          id: orderId,
          data: {
            status: 'NOT SCHEDULED',
            scheduled_start_time: null,
            scheduled_end_time: null,
            machine_id: null,
            updated_at: new Date().toISOString()
          }
        });
        
      } finally {
        setSchedulingLoading({ isRescheduling: false, taskId: null });
      }
    },
    ...updateOrder
  };
};

/**
 * Statistics hooks
 */
export const useMachineStats = () => {
  const { data: machines = [] } = useMachines();
  
  const stats = {
    total: machines.length,
    byStatus: {},
    byWorkCenter: {}
  };

  machines.forEach(machine => {
    // Count by status
    stats.byStatus[machine.status] = (stats.byStatus[machine.status] || 0) + 1;
    
    // Count by work center
    stats.byWorkCenter[machine.work_center] = (stats.byWorkCenter[machine.work_center] || 0) + 1;
  });

  return stats;
};

export const useOrderStats = () => {
  const { data: orders = [] } = useOrders();
  
  const stats = {
    total: orders.length,
    scheduled: 0,
    unscheduled: 0,
    byWorkCenter: {}
  };

  orders.forEach(order => {
    if (order.status === 'SCHEDULED') {
      stats.scheduled++;
    } else {
      stats.unscheduled++;
    }
    
    stats.byWorkCenter[order.work_center] = (stats.byWorkCenter[order.work_center] || 0) + 1;
  });

  return stats;
};

/**
 * Cache invalidation utilities
 */
export const useInvalidateQueries = () => {
  const queryClient = useQueryClient();
  
  return {
    invalidateAll: () => {
      queryClient.invalidateQueries();
    },
    
    invalidateMachines: () => {
      queryClient.invalidateQueries({ queryKey: ['machines'] });
    },
    
    invalidateOrders: () => {
      queryClient.invalidateQueries({ queryKey: ['odp_orders'] });
    },
    
    invalidatePhases: () => {
      queryClient.invalidateQueries({ queryKey: ['phases'] });
    },
  };
};

/**
 * Legacy compatibility hooks
 * These provide backward compatibility during migration
 */
export const useLegacyQueries = () => {
  const machines = useMachines();
  const orders = useOrders();
  const phases = usePhases();
  
  return {
    // Legacy format for backward compatibility
    machines: {
      data: machines.data || [],
      isLoading: machines.isLoading,
      error: machines.error,
      refetch: machines.refetch
    },
    
    orders: {
      data: orders.data || [],
      isLoading: orders.isLoading,
      error: orders.error,
      refetch: orders.refetch
    },
    
    phases: {
      data: phases.data || [],
      isLoading: phases.isLoading,
      error: phases.error,
      refetch: phases.refetch
    }
  };
};
