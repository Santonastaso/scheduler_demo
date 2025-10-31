import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useUIStore } from '../store';
import { WORK_CENTERS } from '../constants';
import { useErrorHandler } from '../hooks';
import { LoginPage as SharedLoginPage, Label } from '@santonastaso/shared';

/**
 * LoginPage component for user authentication
 * Uses the shared LoginPage component with scheduler-specific work center selection
 */
function LoginPage() {
  const [workCenter, setWorkCenter] = useState('');
  const [workCenterError, setWorkCenterError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signIn, error: authError } = useAuth();
  const { setSelectedWorkCenter } = useUIStore();
  const navigate = useNavigate();
  
  // Use unified error handling
  const { handleAsync } = useErrorHandler('LoginPage');

  const handleSubmit = async (data) => {
    // Validate work center
    if (!workCenter) {
      setWorkCenterError('Centro di lavoro richiesto');
      return;
    }

    setIsSubmitting(true);
    setWorkCenterError('');
    
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

  const handleWorkCenterChange = (e) => {
    setWorkCenter(e.target.value);
    if (workCenterError) {
      setWorkCenterError('');
    }
  };

  // Work center selection field
  const workCenterField = (
    <div className="space-y-2">
      <Label htmlFor="workCenter" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        Centro di Lavoro
      </Label>
      <select
        id="workCenter"
        name="workCenter"
        value={workCenter}
        onChange={handleWorkCenterChange}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        required
        disabled={isSubmitting}
      >
        <option value="">Seleziona centro di lavoro</option>
        {Object.entries(WORK_CENTERS).map(([key, value]) => (
          <option key={key} value={key}>
            {value}
          </option>
        ))}
      </select>
      {workCenterError && (
        <p className="text-sm text-red-600">{workCenterError}</p>
      )}
    </div>
  );

  // Debug: Log to console to verify this component is being used
  console.log('🔍 LoginPage: Using SharedLoginPage component', { SharedLoginPage });

  return (
    <SharedLoginPage
      title="Scheduler Demo"
      logo="/logo.svg"
      subtitle="Gestione avanzata della produzione e pianificazione delle risorse"
      labels={{
        signIn: 'Accedi',
        email: 'Email',
        password: 'Password',
        forgotPassword: 'Password dimenticata?',
        signUp: 'Registrati qui',
        signUpText: 'Non hai un account?'
      }}
      demoCredentials={{
        email: 'admin@scheduler.com',
        password: 'admin123'
      }}
      isLoading={isSubmitting}
      error={authError}
      onSubmit={handleSubmit}
      forgotPasswordUrl="/forgot-password"
      signUpUrl="/signup"
      additionalFields={workCenterField}
    />
  );
}

export default LoginPage;