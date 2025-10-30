import { useEffect } from 'react';
import { useMachines, useOrders, usePhases } from './useQueries';
import { useMachinesStore, useOrdersStore, usePhasesStore } from '../store';

/**
 * Hook to sync React Query data with Zustand stores
 * This ensures that the stores are populated with data from React Query
 * and components can still use the store selectors for consistency
 */
export const useStoreSync = () => {
  const { data: machines, isLoading: machinesLoading, error: machinesError } = useMachines();
  const { data: orders, isLoading: ordersLoading, error: ordersError } = useOrders();
  const { data: phases, isLoading: phasesLoading, error: phasesError } = usePhases();

  const { setEntities: setMachines } = useMachinesStore();
  const { setEntities: setOrders } = useOrdersStore();
  const { setEntities: setPhases } = usePhasesStore();

  // Sync machines data
  useEffect(() => {
    if (machines && !machinesLoading && !machinesError) {
      setMachines(machines);
    }
  }, [machines, machinesLoading, machinesError, setMachines]);

  // Sync orders data
  useEffect(() => {
    if (orders && !ordersLoading && !ordersError) {
      setOrders(orders);
    }
  }, [orders, ordersLoading, ordersError, setOrders]);

  // Sync phases data
  useEffect(() => {
    if (phases && !phasesLoading && !phasesError) {
      setPhases(phases);
    }
  }, [phases, phasesLoading, phasesError, setPhases]);

  return {
    isLoading: machinesLoading || ordersLoading || phasesLoading,
    errors: {
      machines: machinesError,
      orders: ordersError,
      phases: phasesError,
    },
  };
};
