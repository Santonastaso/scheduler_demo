import React, { useEffect } from 'react';
import { Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
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
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './auth/ProtectedRoute';
import ConfirmDialog from './components/ui/confirm-dialog';
import { useUIStore, useMainStore, useSchedulerStore } from './store';
import { useAuth } from './auth/AuthContext';
import { useStoreSync } from './hooks';
import { useQueryClient } from '@tanstack/react-query';
import { ThemeProvider } from './components/ThemeProvider';


// This component creates the main layout with the sidebar
const AppLayout = () => {
  const { confirmDialog, hideConfirmDialog, conflictDialog, hideConflictDialog, showConflictDialog, schedulingLoading, selectedWorkCenter } = useUIStore();
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
      <ConfirmDialog 
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={() => {
          confirmDialog.onConfirm?.();
          hideConfirmDialog();
        }}
        onCancel={hideConfirmDialog}
        type={confirmDialog.type}
      />
      {/* Conflict Resolution Dialog */}
      <ConfirmDialog 
        isOpen={conflictDialog.isOpen}
        title="Risoluzione Conflitto"
        message={conflictDialog.details ? 
          `Il lavoro "${conflictDialog.details.draggedTask?.odp_number}" si sovrappone con "${conflictDialog.details.conflictingTask?.odp_number}". Come vuoi procedere?` : 
          ''
        }
        type="warning"
        customButtons={[
          {
            text: 'Annulla',
            variant: 'secondary',
            onClick: hideConflictDialog
          },
          {
            text: schedulingLoading.isShunting ? 'Spostamento...' : 'Sposta a Sinistra ←',
            variant: 'primary',
            disabled: schedulingLoading.isShunting,
            onClick: async () => {
              if (!conflictDialog.details) return;
              
              try {
                const conflictData = conflictDialog.details.schedulingParams 
                  ? conflictDialog.details.schedulingParams.originalConflict 
                  : conflictDialog.details;
                
                console.log('🔄 CONFLICT: Using resolveConflictByShunting (left)');
                const result = await resolveConflictByShunting(conflictData, 'left', queryClient);
                
                if (result.error) {
                  const { showError } = await import('./utils/toast');
                  showError(result.error);
                } else {
                  const { showSuccess } = await import('./utils/toast');
                  showSuccess('Task spostato con successo');
                  hideConflictDialog();
                }
              } catch (error) {
                console.error('❌ SHUNTING ERROR:', error);
                const { showError } = await import('./utils/toast');
                showError('Errore durante lo spostamento del task');
              }
            }
          },
          {
            text: schedulingLoading.isShunting ? 'Spostamento...' : 'Sposta a Destra →',
            variant: 'primary',
            disabled: schedulingLoading.isShunting,
            onClick: async () => {
              if (!conflictDialog.details) return;
              
              try {
                const conflictData = conflictDialog.details.schedulingParams 
                  ? conflictDialog.details.schedulingParams.originalConflict 
                  : conflictDialog.details;
                
                console.log('🔄 CONFLICT: Using resolveConflictByShunting (right)');
                const result = await resolveConflictByShunting(conflictData, 'right', queryClient);
                
                if (result.error) {
                  const { showError } = await import('./utils/toast');
                  showError(result.error);
                } else {
                  const { showSuccess } = await import('./utils/toast');
                  showSuccess('Task spostato con successo');
                  hideConflictDialog();
                }
              } catch (error) {
                console.error('❌ SHUNTING ERROR:', error);
                const { showError } = await import('./utils/toast');
                showError('Errore durante lo spostamento del task');
              }
            }
          }
        ]}
      />
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
