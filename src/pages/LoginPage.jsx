import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useUIStore } from '../store';
import { WORK_CENTERS } from '../constants';
import { useErrorHandler } from '../hooks';
import { LoginPage as SharedLoginPage, WorkCenterSelect } from '@santonastaso/shared';

/**
 * LoginPage component for user authentication
 * Uses the shared LoginPage component with additional work center selection
 */
function LoginPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [workCenter, setWorkCenter] = useState('');
  const [formErrors, setFormErrors] = useState({});

  const { signIn, error: authError } = useAuth();
  const { setSelectedWorkCenter } = useUIStore();
  const navigate = useNavigate();
  
  // Use unified error handling
  const { handleAsync } = useErrorHandler('LoginPage');

  // Convert WORK_CENTERS to options format
  const workCenterOptions = Object.entries(WORK_CENTERS).map(([key, value]) => ({
    value,
    label: key.charAt(0).toUpperCase() + key.slice(1).toLowerCase()
  }));

  const handleSubmit = async (data) => {
    // Validate work center
    if (!workCenter) {
      setFormErrors({ workCenter: 'Centro di lavoro richiesto' });
      return;
    }

    setIsSubmitting(true);
    setFormErrors({});
    
    await handleAsync(
      async () => {
        const result = await signIn(data.email, data.password);
        
        if (!result.error) {
          // Set the selected work center
          setSelectedWorkCenter(workCenter);
          navigate('/', { replace: true });
        }
      },
      { 
        context: 'Login', 
        fallbackMessage: 'Accesso fallito. Riprova.',
        onFinally: () => setIsSubmitting(false)
      }
    );
  };

  const handleWorkCenterChange = (value) => {
    setWorkCenter(value);
    if (formErrors.workCenter) {
      setFormErrors(prev => ({ ...prev, workCenter: '' }));
    }
  };

  // Additional fields for work center selection
  const additionalFields = (
    <WorkCenterSelect
      workCenters={workCenterOptions}
      value={workCenter}
      onChange={handleWorkCenterChange}
      label="Centro di Lavoro"
      required
      error={formErrors.workCenter}
      placeholder="Seleziona un centro di lavoro"
    />
  );

  return (
    <SharedLoginPage
      title="Scheduler"
      logo="/scheduler-logo.png" // Add your logo here
      subtitle="Sistema di Pianificazione Produzione"
      labels={{
        signIn: 'Accedi',
        email: 'Indirizzo Email',
        password: 'Password',
        forgotPassword: 'Password dimenticata?',
        signUp: 'Crea Account',
        signUpText: 'Non hai un account?'
      }}
      demoCredentials={{ 
        email: 'demo@example.com', 
        password: 'demo123' 
      }}
      isLoading={isSubmitting}
      error={authError}
      onSubmit={handleSubmit}
      forgotPasswordUrl="/forgot-password"
      signUpUrl="/signup"
      additionalFields={additionalFields}
      additionalData={{ workCenter }}
      showForgotPassword={true}
      showSignUp={true}
    />
  );
}

export default LoginPage;