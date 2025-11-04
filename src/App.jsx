import React, { useEffect } from 'react';
import { Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { showError, showSuccess, Button } from '@santonastaso/shared';
import SideNav from './components/layout/SideNav';
import { Header } from './components/layout/Header';
import MachineryListPage from './pages/MachineryListPage';
import MachineryFormPage from './pages/MachineryFormPage';
import MachineCalendarPage from './pages/MachineCalendarPage';
import PhasesListPage from './pages/PhasesListPage';
import PhasesFormPage from './pages/PhasesFormPage';
import BacklogListPage from './pages/BacklogListPage';
import BacklogFormPage from './pages/BacklogFormPage';
import SchedulerPage from './pages/SchedulerPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import { ErrorBoundary } from '@santonastaso/shared';
import ProtectedRoute from './auth/ProtectedRoute';
// ConfirmDialog removed - using native confirm() instead
import { useUIStore, useMainStore, useSchedulerStore } from './store';
import { useAuth } from './auth/AuthContext';
import { useStoreSync } from './hooks';
import { useQueryClient } from '@tanstack/react-query';
import { ThemeProvider } from '@santonastaso/shared';


// This component creates the main layout with the sidebar
const AppLayout = () => {
  const { 
    forms, 
    modals, 
    hideConfirmDialog, 
    conflictDialog, 
    hideConflictDialog, 
    showConflictDialog, 
    schedulingLoading, 
    selectedWorkCenter 
  } = useUIStore();
  
  // Extract confirmDialog from forms and modals
  const confirmDialog = {
    ...(forms.confirmDialog || {}),
    isOpen: modals.confirmDialog || false
  };
  const { cleanup } = useMainStore();
  const schedulerStore = useSchedulerStore();
  const { resolveConflictByShunting, scheduleTaskFromSlot } = schedulerStore;
  const { user, signOut } = useAuth();
  const queryClient = useQueryClient();
  
  // Sync React Query data with Zustand stores
  useStoreSync();
  
  // Handle conflict resolution with custom toast
  const handleConflictResolution = async (direction) => {
    if (!conflictDialog.details) return;
    
    try {
      // Defensive check for resolveConflictByShunting function
      if (!resolveConflictByShunting || typeof resolveConflictByShunting !== 'function') {
        console.error('❌ CONFLICT ERROR: resolveConflictByShunting is not available', {
          resolveConflictByShunting,
          schedulerStore,
          storeKeys: Object.keys(schedulerStore || {})
        });
        showError('Funzione di risoluzione conflitti non disponibile');
        hideConflictDialog();
        return;
      }

      const conflictData = conflictDialog.details.schedulingParams 
        ? conflictDialog.details.schedulingParams.originalConflict 
        : conflictDialog.details;
      
      console.log('🔄 CONFLICT: Using resolveConflictByShunting', direction, {
        conflictData,
        functionAvailable: typeof resolveConflictByShunting
      });
      
      const result = await resolveConflictByShunting(conflictData, direction, queryClient);
      
      if (result && result.error) {
        showError(result.error);
      } else {
        showSuccess(`Task spostato con successo verso ${direction === 'left' ? 'sinistra' : 'destra'}`);
      }
    } catch (error) {
      console.error('❌ SHUNTING ERROR:', error);
      showError('Errore durante lo spostamento del task');
    }
    hideConflictDialog();
  };
  
  // Cleanup store when app unmounts
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);
  
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <SideNav />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-auto bg-background min-w-0 p-4" id="main-content">
          <div className="max-w-full">
            <Outlet />
          </div>
        </main>
      </div>
      <Toaster 
        position="top-right"
        richColors
        closeButton
        duration={4000}
      />
      {/* Confirm Dialog - using native confirm() */}
      {confirmDialog.isOpen && (() => {
        const result = confirm(`${confirmDialog.title}\n\n${confirmDialog.message}`);
        if (result) {
          confirmDialog.onConfirm?.();
        }
        hideConfirmDialog();
        return null;
      })()}
      
      {/* Conflict Resolution Toast Dialog */}
      {conflictDialog.isOpen && conflictDialog.details && (
        <div className="fixed top-4 right-4 z-50 bg-white border border-orange-200 rounded-lg shadow-xl p-4 max-w-md transform transition-all duration-300 ease-in-out">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-900 mb-1">
                Conflitto Rilevato
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Il lavoro <span className="font-semibold text-orange-600">{conflictDialog.details.draggedTask?.odp_number}</span> si sovrappone con <span className="font-semibold text-orange-600">{conflictDialog.details.conflictingTask?.odp_number}</span>.
                <br />
                Dove vuoi spostarlo?
              </p>
              <div className="flex space-x-2">
                <Button
                  onClick={() => handleConflictResolution('left')}
                  variant="default"
                  size="sm"
                >
                  ← Sposta a Sinistra
                </Button>
                <Button
                  onClick={() => handleConflictResolution('right')}
                  variant="default"
                  size="sm"
                >
                  Sposta a Destra →
                </Button>
                <Button
                  onClick={() => hideConflictDialog()}
                  variant="outline"
                  size="sm"
                >
                  Annulla
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <ErrorBoundary>
        <Routes>
          {/* Public authentication routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          
          {/* Protected application routes */}
          <Route path="/" element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              {/* Define the component for the home page */}
              <Route index element={<HomePage />} />
              
              {/* Add routes for your migrated pages */}
              <Route path="machinery" element={<MachineryListPage />} />
              <Route path="machinery/add" element={<MachineryFormPage />} />
              <Route path="machinery/:id/edit" element={<MachineryFormPage />} />
              <Route path="machinery/:machineId/calendar" element={<MachineCalendarPage />} />
              <Route path="phases" element={<PhasesListPage />} />
              <Route path="phases/add" element={<PhasesFormPage />} />
              <Route path="phases/:id/edit" element={<PhasesFormPage />} />
              <Route path="backlog" element={<BacklogListPage />} />
              <Route path="backlog/add" element={<BacklogFormPage />} />
              <Route path="backlog/:id/edit" element={<BacklogFormPage />} />
              <Route path="scheduler" element={<SchedulerPage />} />
            </Route>
          </Route>
          
          {/* Catch-all route for unmatched paths */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
