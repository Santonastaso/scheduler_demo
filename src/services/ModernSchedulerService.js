import { SupabaseService, createServiceHooks } from '@santonastaso/shared';
import { supabase } from './supabase/client';

/**
 * Modern Scheduler Service using the new shared SupabaseService
 * Replaces the old apiService with standardized patterns
 */

// Create service instances for each table
export const machinesService = new SupabaseService(supabase, 'machines');
export const odpOrdersService = new SupabaseService(supabase, 'odp_orders');
export const phasesService = new SupabaseService(supabase, 'phases');

// Create React Query hooks for each service
export const useMachinesHooks = createServiceHooks(machinesService);
export const useOrdersHooks = createServiceHooks(odpOrdersService);
export const usePhasesHooks = createServiceHooks(phasesService);

/**
 * Enhanced Machines Service with scheduler-specific methods
 */
class EnhancedMachinesService extends SupabaseService {
  constructor() {
    super(supabase, 'machines');
  }

  /**
   * Get machines with enhanced filtering for scheduler
   */
  async getMachinesWithFilters(options = {}) {
    return this.getAll({
      select: 'id, machine_name, machine_type, work_center, status, capacity_per_hour, created_at, updated_at',
      orderBy: 'machine_name',
      ascending: true,
      ...options
    });
  }

  /**
   * Get machines by work center
   */
  async getMachinesByWorkCenter(workCenter) {
    return this.getByField('work_center', workCenter, {
      orderBy: 'machine_name'
    });
  }

  /**
   * Get available machines (status = 'available')
   */
  async getAvailableMachines() {
    return this.getByField('status', 'available', {
      orderBy: 'machine_name'
    });
  }

  /**
   * Update machine status with validation
   */
  async updateMachineStatus(id, status) {
    const validStatuses = ['available', 'busy', 'maintenance', 'offline'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    return this.update(id, {
      status,
      updated_at: new Date().toISOString()
    });
  }

  /**
   * Get machine utilization stats
   */
  async getMachineStats() {
    const machines = await this.getAll({
      select: 'status, work_center'
    });

    // Calculate stats
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
  }
}

/**
 * Enhanced Orders Service with scheduler-specific methods
 */
class EnhancedOrdersService extends SupabaseService {
  constructor() {
    super(supabase, 'odp_orders');
  }

  /**
   * Get orders with enhanced filtering for scheduler
   */
  async getOrdersWithFilters(options = {}) {
    return this.getAll({
      select: '*',
      orderBy: 'created_at',
      ascending: false,
      ...options
    });
  }

  /**
   * Get unscheduled orders
   */
  async getUnscheduledOrders(workCenter = null) {
    const filters = {
      status: 'NOT SCHEDULED'
    };
    
    if (workCenter && workCenter !== 'BOTH') {
      filters.work_center = workCenter;
    }

    return this.filterBy(filters);
  }

  /**
   * Get scheduled orders
   */
  async getScheduledOrders(workCenter = null) {
    const filters = {
      status: 'SCHEDULED'
    };
    
    if (workCenter && workCenter !== 'BOTH') {
      filters.work_center = workCenter;
    }

    return this.filterBy(filters);
  }

  /**
   * Update order with scheduling information
   */
  async scheduleOrder(id, schedulingData) {
    return this.update(id, {
      ...schedulingData,
      status: 'SCHEDULED',
      updated_at: new Date().toISOString()
    });
  }

  /**
   * Unschedule order
   */
  async unscheduleOrder(id) {
    return this.update(id, {
      status: 'NOT SCHEDULED',
      scheduled_start_time: null,
      scheduled_end_time: null,
      machine_id: null,
      updated_at: new Date().toISOString()
    });
  }

  /**
   * Get orders by date range
   */
  async getOrdersByDateRange(startDate, endDate, dateField = 'scheduled_start_time') {
    return this.getByDateRange(startDate, endDate, dateField);
  }

  /**
   * Helper method to filter orders with complex logic
   */
  async filterBy(filters) {
    const allOrders = await this.getAll();
    
    return allOrders.filter(order => {
      return Object.entries(filters).every(([key, value]) => {
        if (value === null || value === undefined) return true;
        return order[key] === value;
      });
    });
  }
}

/**
 * Enhanced Phases Service with scheduler-specific methods
 */
class EnhancedPhasesService extends SupabaseService {
  constructor() {
    super(supabase, 'phases');
  }

  /**
   * Get phases with enhanced filtering for scheduler
   */
  async getPhasesWithFilters(options = {}) {
    return this.getAll({
      select: '*',
      orderBy: 'phase_name',
      ascending: true,
      ...options
    });
  }

  /**
   * Search phases by name
   */
  async searchPhases(searchTerm, options = {}) {
    return this.search(searchTerm, ['phase_name', 'description'], {
      orderBy: 'phase_name',
      ...options
    });
  }

  /**
   * Get phases by work center
   */
  async getPhasesByWorkCenter(workCenter) {
    return this.getByField('work_center', workCenter, {
      orderBy: 'phase_name'
    });
  }
}

// Create enhanced service instances
export const enhancedMachinesService = new EnhancedMachinesService();
export const enhancedOrdersService = new EnhancedOrdersService();
export const enhancedPhasesService = new EnhancedPhasesService();

// Create React Query hooks for enhanced services
export const useEnhancedMachinesHooks = createServiceHooks(enhancedMachinesService);
export const useEnhancedOrdersHooks = createServiceHooks(enhancedOrdersService);
export const useEnhancedPhasesHooks = createServiceHooks(enhancedPhasesService);

/**
 * Setup real-time subscriptions for all tables
 */
export const setupRealtimeSubscriptions = (
  onOrdersChange,
  onMachinesChange,
  onPhasesChange
) => {
  const ordersChannel = odpOrdersService.setupRealtimeSubscription(
    (payload) => {
      console.log('Orders real-time update:', payload);
      onOrdersChange?.(payload);
    },
    { event: '*' },
    'orders_realtime'
  );

  const machinesChannel = machinesService.setupRealtimeSubscription(
    (payload) => {
      console.log('Machines real-time update:', payload);
      onMachinesChange?.(payload);
    },
    { event: '*' },
    'machines_realtime'
  );

  const phasesChannel = phasesService.setupRealtimeSubscription(
    (payload) => {
      console.log('Phases real-time update:', payload);
      onPhasesChange?.(payload);
    },
    { event: '*' },
    'phases_realtime'
  );

  return {
    ordersChannel,
    machinesChannel,
    phasesChannel,
    cleanup: () => {
      odpOrdersService.removeRealtimeSubscription('orders_realtime');
      machinesService.removeRealtimeSubscription('machines_realtime');
      phasesService.removeRealtimeSubscription('phases_realtime');
    }
  };
};

/**
 * Initialize all services
 */
export const initializeServices = async () => {
  try {
    await Promise.all([
      machinesService.init(),
      odpOrdersService.init(),
      phasesService.init()
    ]);
    
    console.log('All scheduler services initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize scheduler services:', error);
    throw error;
  }
};

// Export legacy API for backward compatibility during migration
export const legacyApiService = {
  // Machines
  getMachines: () => enhancedMachinesService.getAll(),
  addMachine: (data) => enhancedMachinesService.create(data),
  updateMachine: (id, data) => enhancedMachinesService.update(id, data),
  removeMachine: (id) => enhancedMachinesService.delete(id),

  // Orders
  getOdpOrders: () => enhancedOrdersService.getAll(),
  addOdpOrder: (data) => enhancedOrdersService.create(data),
  updateOdpOrder: (id, data) => enhancedOrdersService.update(id, data),
  removeOdpOrder: (id) => enhancedOrdersService.delete(id),

  // Phases
  getPhases: () => enhancedPhasesService.getAll(),
  addPhase: (data) => enhancedPhasesService.create(data),
  updatePhase: (id, data) => enhancedPhasesService.update(id, data),
  removePhase: (id) => enhancedPhasesService.delete(id),

  // Real-time
  setupRealtimeSubscriptions,
  cleanupRealtimeSubscriptions: (channels) => {
    if (channels?.cleanup) {
      channels.cleanup();
    }
  },

  // Initialization
  init: initializeServices,
};
