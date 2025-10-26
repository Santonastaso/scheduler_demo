import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import BacklogForm from '../components/BacklogForm';
import StickyHeader from '../components/StickyHeader';
import { Button } from '../components/ui';
import { useOrderStore, useUIStore, useMainStore } from '../store';
import { useOrder } from '../hooks';

function BacklogFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Use React Query for data fetching
  const { data: order, isLoading: orderLoading, error: orderError } = useOrder(id);
  
  // Use Zustand store for client state
  const { selectedWorkCenter } = useUIStore();
  const { isLoading, isInitialized, init, cleanup } = useMainStore();

  // Check if this is edit mode (has ID) or add mode (no ID)
  const isEditMode = Boolean(id);

  // Initialize store on component mount
  useEffect(() => {
    if (!isInitialized) {
      init();
    }
    
    // Cleanup function for component unmount
    return () => {
      cleanup();
    };
  }, [init, isInitialized, cleanup]);

  // Redirect if order not found in edit mode
  useEffect(() => {
    if (isEditMode && !orderLoading && !order && orderError) {
      navigate('/backlog', { replace: true });
    }
  }, [isEditMode, orderLoading, order, navigate, orderError]);

  if (orderLoading) {
    return <div>Caricamento...</div>;
  }

  if (isEditMode && !order) {
           return <div className="text-center py-2 text-red-600 text-[10px]">Ordine non trovato.</div>;
  }

  // Allow access if work center is selected or if BOTH is selected (which allows any work center)
  if (!selectedWorkCenter) {
           return <div className="text-center py-2 text-red-600 text-[10px]">Seleziona un centro di lavoro per gestire gli ordini del backlog.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Simple page header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">
          {isEditMode ? `Modifica Ordine: ${order?.odp_number}` : 'Aggiungi Nuovo Ordine'}
        </h1>
        {isEditMode && (
          <Button 
            variant="outline" 
            onClick={() => navigate('/scheduler')}
          >
            ← Torna al Programmatore
          </Button>
        )}
      </div>
      
      <BacklogForm 
        onSuccess={isEditMode ? () => navigate('/scheduler') : undefined} 
        orderToEdit={order} 
      />
    </div>
  );
}

export default BacklogFormPage;
