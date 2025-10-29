import React, { useEffect } from 'react';
import { Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { showError, showSuccess } from '@santonastaso/shared';
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
  const { resolveConflictByShunting, scheduleTaskFromSlot } = useSchedulerStore();
  const { user, signOut } = useAuth();
  const queryClient = useQueryClient();
  
  // Sync React Query data with Zustand stores
  useStoreSync();
  
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
        <main className="flex-1 overflow-auto bg-background min-w-0">
          <div className="p-4">
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
      
      {/* Conflict Resolution Dialog - using native confirm() */}
      {conflictDialog.isOpen && (() => {
        const message = conflictDialog.details ? 
          `Il lavoro "${conflictDialog.details.draggedTask?.odp_number}" si sovrappone con "${conflictDialog.details.conflictingTask?.odp_number}". Vuoi spostarlo a sinistra?` : 
          'Conflitto rilevato. Vuoi spostare il task?';
        
        const moveLeft = confirm(`${message}\n\nOK = Sposta a Sinistra\nAnnulla = Sposta a Destra`);
        
        if (moveLeft !== null) { // User made a choice
          (async () => {
            if (!conflictDialog.details) return;
            
            try {
              const conflictData = conflictDialog.details.schedulingParams 
                ? conflictDialog.details.schedulingParams.originalConflict 
                : conflictDialog.details;
              
              console.log('🔄 CONFLICT: Using resolveConflictByShunting', moveLeft ? 'left' : 'right');
              const result = await resolveConflictByShunting(conflictData, moveLeft ? 'left' : 'right', queryClient);
              
              if (result.error) {
                showError(result.error);
              } else {
                showSuccess('Task spostato con successo');
              }
            } catch (error) {
              console.error('❌ SHUNTING ERROR:', error);
              showError('Errore durante lo spostamento del task');
            }
            hideConflictDialog();
          })();
        } else {
          hideConflictDialog();
        }
        return null;
      })()}
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
