import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useUIStore } from '../store';
import { WORK_CENTERS } from '../constants';
import { useErrorHandler } from '../hooks';
import { Button, Input, Label } from '@santonastaso/shared';

/**
 * LoginPage component for user authentication
 * Uses the same beautiful two-column layout as crm_demo
 */
function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    workCenter: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const { signIn, error: authError } = useAuth();
  const { setSelectedWorkCenter } = useUIStore();
  const navigate = useNavigate();
  
  // Use unified error handling
  const { handleAsync } = useErrorHandler('LoginPage');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear field error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.email.trim()) {
      errors.email = 'Email richiesta';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Inserisci un indirizzo email valido';
    }
    
    if (!formData.password) {
      errors.password = 'Password richiesta';
    } else if (formData.password.length < 6) {
      errors.password = 'La password deve essere di almeno 6 caratteri';
    }

    if (!formData.workCenter) {
      errors.workCenter = 'Centro di lavoro richiesto';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    await handleAsync(
      async () => {
        const result = await signIn(formData.email, formData.password);
        
        if (!result.error) {
          // Set the selected work center
          setSelectedWorkCenter(formData.workCenter);
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

  const getFieldError = (fieldName) => {
    return formErrors[fieldName] ? (
      <span className="text-sm text-red-600">{formErrors[fieldName]}</span>
    ) : null;
  };

  return (
    <div className="min-h-screen flex">
      <div className="container relative grid flex-col items-center justify-center sm:max-w-none lg:grid-cols-2 lg:px-0">
        <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
          <div className="absolute inset-0 bg-primary" />
          <div className="relative z-20 flex items-center text-lg font-medium">
            <img className="h-6 mr-2" src="/scheduler-logo.png" alt="Scheduler" />
            Scheduler
          </div>
        </div>
        <div className="lg:p-8">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">Accedi</h1>
            </div>
            <form className="space-y-8" onSubmit={handleSubmit}>
              {authError && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                  {authError}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Indirizzo Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Inserisci la tua email"
                  className={formErrors.email ? 'border-red-500' : ''}
                  disabled={isSubmitting}
                  autoComplete="email"
                />
                {getFieldError('email')}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Inserisci la tua password"
                  className={formErrors.password ? 'border-red-500' : ''}
                  disabled={isSubmitting}
                  autoComplete="current-password"
                />
                {getFieldError('password')}
              </div>

              <div className="space-y-2">
                <Label htmlFor="workCenter">Centro di Lavoro</Label>
                <select
                  id="workCenter"
                  name="workCenter"
                  value={formData.workCenter}
                  onChange={handleChange}
                  className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${formErrors.workCenter ? 'border-red-500' : ''}`}
                >
                  <option value="">Seleziona un centro di lavoro</option>
                  <option value={WORK_CENTERS.ZANICA}>{WORK_CENTERS.ZANICA}</option>
                  <option value={WORK_CENTERS.BUSTO_GAROLFO}>{WORK_CENTERS.BUSTO_GAROLFO}</option>
                  <option value={WORK_CENTERS.BOTH}>{WORK_CENTERS.BOTH}</option>
                </select>
                {getFieldError('workCenter')}
              </div>

              <Button
                type="submit"
                className="w-full cursor-pointer"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Accesso in corso...' : 'Accedi'}
              </Button>
            </form>

            <Link
              to="/forgot-password"
              className="text-sm text-center hover:underline"
            >
              Password dimenticata?
            </Link>

            {/* Demo Credentials (for development) */}
            {import.meta.env.MODE === 'development' && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <details className="group">
                  <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
                    Credenziali Demo (Solo Sviluppo)
                  </summary>
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-muted-foreground"><strong>Email:</strong> demo@example.com</p>
                    <p className="text-xs text-muted-foreground"><strong>Password:</strong> demo123</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFormData({ email: 'demo@example.com', password: 'demo123', workCenter: WORK_CENTERS.ZANICA })}
                      className="mt-2"
                    >
                      Usa Credenziali Demo
                    </Button>
                  </div>
                </details>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;