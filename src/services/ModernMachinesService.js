import { BaseService } from '@santonastaso/crm-data';
import { supabase } from './supabase/client';

/**
 * Modern Machines Service using CRM Data patterns
 * Demonstrates centralized data handling for scheduler_demo
 */
export class ModernMachinesService extends BaseService {
  constructor() {
    super(supabase, 'machines');
  }

  /**
   * Get all machines with enhanced filtering
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
   * Get paginated machines for DataTable
   */
  async getPaginatedMachines(page = 1, perPage = 10, filters = {}) {
    return this.getPaginated({
      select: 'id, machine_name, machine_type, work_center, status, capacity_per_hour, created_at, updated_at',
      orderBy: 'machine_name',
      ascending: true,
      page,
      perPage,
      filters
    });
  }

  /**
   * Search machines by name or type
   */
  async searchMachines(searchTerm, options = {}) {
    return this.search(searchTerm, ['machine_name', 'machine_type'], {
      select: 'id, machine_name, machine_type, work_center, status, capacity_per_hour',
      orderBy: 'machine_name',
      ...options
    });
  }

  /**
   * Get machines by work center
   */
  async getMachinesByWorkCenter(workCenter) {
    return this.getAll({
      filters: { work_center: workCenter },
      orderBy: 'machine_name'
    });
  }

  /**
   * Get available machines (status = 'available')
   */
  async getAvailableMachines() {
    return this.getAll({
      filters: { status: 'available' },
      orderBy: 'machine_name'
    });
  }

  /**
   * Update machine status
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
   * Bulk update machine statuses
   */
  async bulkUpdateStatuses(updates) {
    const promises = updates.map(({ id, status }) => 
      this.updateMachineStatus(id, status)
    );
    
    return Promise.all(promises);
  }

  /**
   * Get machine utilization stats
   */
  async getMachineStats() {
    try {
      const { data, error } = await this.client
        .from(this.tableName)
        .select('status, work_center')
        .order('work_center');

      if (error) {
        throw new Error(this.handleSupabaseError(error, 'getMachineStats'));
      }

      // Calculate stats
      const stats = {
        total: data.length,
        byStatus: {},
        byWorkCenter: {}
      };

      data.forEach(machine => {
        // Count by status
        stats.byStatus[machine.status] = (stats.byStatus[machine.status] || 0) + 1;
        
        // Count by work center
        stats.byWorkCenter[machine.work_center] = (stats.byWorkCenter[machine.work_center] || 0) + 1;
      });

      return stats;
    } catch (error) {
      throw new Error(`Failed to get machine stats: ${error.message}`);
    }
  }
}
