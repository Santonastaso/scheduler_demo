import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@santonastaso/shared';
import MachineForm from '../components/MachineForm';
import StickyHeader from '../components/StickyHeader';
import { useMachineStore, useUIStore, useMainStore } from '../store';

function MachineryFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getMachineById } = useMachineStore();
  const { selectedWorkCenter } = useUIStore();
  const { isLoading, isInitialized, init, cleanup } = useMainStore();

  // Check if this is edit mode (has ID) or add mode (no ID)
  const isEditMode = Boolean(id);
  const machine = isEditMode ? getMachineById(id) : null;

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

  // Redirect if machine not found in edit mode
  useEffect(() => {
    if (isEditMode && !isLoading && !machine) {
      navigate('/machinery', { replace: true });
    }
  }, [isEditMode, isLoading, machine, navigate]);

  if (isLoading) {
    return <div>Caricamento...</div>;
  }

  if (isEditMode && !machine) {
           return <div className="text-center py-2 text-red-600 text-[10px]">Macchina non trovata.</div>;
  }

  // Allow access if work center is selected or if BOTH is selected (which allows any work center)
  if (!selectedWorkCenter) {
           return <div className="text-center py-2 text-red-600 text-[10px]">Seleziona un centro di lavoro per gestire le macchine.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">
          {isEditMode ? `Modifica Macchina: ${machine?.machine_name}` : 'Aggiungi Nuova Macchina'}
        </h1>
        {isEditMode && (
          <Button asChild variant="outline">
            <Link to={`/machinery/${id}/calendar`}>
              Visualizza Calendario
            </Link>
          </Button>
        )}
      </div>
      
      <MachineForm machineToEdit={machine} />
    </div>
  );
}

export default MachineryFormPage;
