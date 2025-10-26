import React, { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useErrorHandler, useValidation } from '../hooks';
import { showValidationError } from '@santonastaso/shared';
import { Input, Label, Button } from '@santonastaso/shared';
// Using native HTML select instead of complex Select component

/**
 * Generic Form Component
 * Eliminates duplication across MachineForm, PhasesForm, BacklogForm, and OffTimeForm
 * Uses configuration-driven approach for form fields and validation
 */

/**
 * Field configuration object structure:
 * {
 *   name: string,           // Field name
 *   label: string,          // Display label
 *   type: string,           // Field type (text, number, select, textarea, etc.)
 *   required: boolean,       // Whether field is required
 *   placeholder?: string,    // Placeholder text
 *   options?: Array,         // For select fields
 *   rows?: number,          // For textarea fields
 *   disabled?: boolean,      // Whether field is disabled
 *   readOnly?: boolean,     // Whether field is read-only
 *   className?: string,     // Additional CSS classes
 *   validation?: Object,    // Custom validation rules
 *   conditional?: Function, // Function to determine if field should be shown
 * }
 */

/**
 * Section configuration object structure:
 * {
 *   title: string,          // Section title
 *   fields: Array,          // Array of field configurations
 *   gridCols?: string,      // CSS grid columns (default: "grid-cols-2 md:grid-cols-4 lg:grid-cols-8")
 * }
 */

function GenericForm({ 
  config, 
  initialData = {}, 
  onSubmit, 
  onSuccess, 
  isEditMode = false,
  isLoading = false,
  customActions = null,
  customFieldRenderers = {},
  className = "p-1 bg-card rounded-lg shadow-sm border"
}) {
  const { handleAsync } = useErrorHandler('GenericForm');
  const { validate } = useValidation();
  
  // Create initial form data from config and provided data
  const initialFormData = useMemo(() => {
    const formData = {};
    
    config.sections.forEach(section => {
      section.fields.forEach(field => {
        if (field.name in initialData) {
          formData[field.name] = initialData[field.name];
        } else if (field.defaultValue !== undefined) {
          formData[field.name] = field.defaultValue;
        } else {
          formData[field.name] = '';
        }
      });
    });
    
    return formData;
  }, [config, initialData]);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
    watch,
    setValue,
    getValues,
    reset,
    clearErrors
  } = useForm({
    defaultValues: initialFormData,
    mode: 'onChange' // Enable real-time validation
  });

  // Handle form submission with validation
  const handleFormSubmit = async (data) => {
    // Submit the form - React Hook Form validation is handled automatically
    await handleAsync(
      async () => {
        await onSubmit(data);
        if (onSuccess) onSuccess();
        reset(initialFormData);
      },
      { 
        context: isEditMode ? config.editContext : config.addContext, 
        fallbackMessage: isEditMode ? config.editErrorMessage : config.addErrorMessage
      }
    );
  };

  // Render a single field based on its configuration
  const renderField = (field) => {
    const fieldValue = watch(field.name);
    
    // Check conditional rendering
    if (field.conditional && !field.conditional(fieldValue, watch, getValues)) {
      return null;
    }

    // Check for custom field renderer first
    if (customFieldRenderers[field.type]) {
      return customFieldRenderers[field.type](field, {
        watch,
        setValue,
        getValues,
        register,
        isSubmitting,
        fieldValue
      });
    }

    const baseInputProps = {
      id: field.name,
      placeholder: field.placeholder,
      disabled: field.disabled || isSubmitting,
      className: field.className || '',
      ...register(field.name, field.validation || {})
    };

    switch (field.type) {
      case 'select':
        return (
          <div>
            <select
              {...register(field.name, field.validation)}
              disabled={field.disabled || isSubmitting}
              className={`flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${errors[field.name] ? 'border-red-500' : 'border-input'}`}
            >
              <option value="">{field.placeholder || `Seleziona ${field.label.toLowerCase()}`}</option>
              {field.options?.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors[field.name] && (
              <p className="text-sm text-destructive mt-1">{errors[field.name].message}</p>
            )}
          </div>
        );

      case 'textarea':
        return (
          <div>
            <textarea
              {...baseInputProps}
              rows={field.rows || 3}
              className={`w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent ${field.className || ''} ${errors[field.name] ? 'border-destructive' : ''}`}
            />
            {errors[field.name] && (
              <p className="text-sm text-destructive mt-1">{errors[field.name].message}</p>
            )}
          </div>
        );

      case 'checkbox':
        return (
          <div className="flex flex-wrap gap-2">
            {field.options?.map(option => (
              <div key={option.value} className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id={`${field.name}_${option.value}`}
                  value={option.value} 
                  checked={fieldValue?.includes(option.value) || false}
                  onChange={(e) => {
                    const currentValues = getValues(field.name) || [];
                    if (e.target.checked) {
                      setValue(field.name, [...currentValues, option.value].sort(), { shouldValidate: true });
                    } else {
                      setValue(field.name, currentValues.filter(v => v !== option.value), { shouldValidate: true });
                    }
                  }}
                  className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <Label htmlFor={`${field.name}_${option.value}`} className="text-[10px] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        );

      case 'datetime-local':
        return (
          <div>
            <Input type="datetime-local" {...baseInputProps} className={`${baseInputProps.className} ${errors[field.name] ? 'border-red-500' : ''}`} />
            {errors[field.name] && (
              <p className="text-sm text-destructive mt-1">{errors[field.name].message}</p>
            )}
          </div>
        );

      case 'date':
        return (
          <div>
            <Input type="date" {...baseInputProps} className={`${baseInputProps.className} ${errors[field.name] ? 'border-red-500' : ''}`} />
            {errors[field.name] && (
              <p className="text-sm text-destructive mt-1">{errors[field.name].message}</p>
            )}
          </div>
        );

      case 'time':
        return (
          <div>
            <Input type="time" {...baseInputProps} className={`${baseInputProps.className} ${errors[field.name] ? 'border-red-500' : ''}`} />
            {errors[field.name] && (
              <p className="text-sm text-destructive mt-1">{errors[field.name].message}</p>
            )}
          </div>
        );

      case 'number':
        return (
          <div>
            <Input type="number" {...baseInputProps} className={`${baseInputProps.className} ${errors[field.name] ? 'border-red-500' : ''}`} />
            {errors[field.name] && (
              <p className="text-sm text-destructive mt-1">{errors[field.name].message}</p>
            )}
          </div>
        );

      case 'text':
      default:
        return (
          <div>
            <Input type="text" {...baseInputProps} className={`${baseInputProps.className} ${errors[field.name] ? 'border-red-500' : ''}`} />
            {errors[field.name] && (
              <p className="text-sm text-destructive mt-1">{errors[field.name].message}</p>
            )}
          </div>
        );
    }
  };

  // Render a section of fields - Simplified Tracc Style
  const renderSection = (section) => {
    const visibleFields = section.fields.filter(field => 
      !field.conditional || field.conditional(watch(field.name), watch, getValues)
    );

    if (visibleFields.length === 0) return null;

    return (
      <div key={section.title} className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">
          {section.title}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleFields.map(field => (
            <div key={field.name} className="space-y-2">
              <Label htmlFor={field.name} className="text-sm font-medium text-foreground">
                {field.label} {field.required && <span className="text-destructive">*</span>}
              </Label>
              {renderField(field)}
              {field.helpText && (
                <p className="text-xs text-muted-foreground">{field.helpText}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render custom sections (like calculation results)
  const renderCustomSection = (sectionKey) => {
    if (customFieldRenderers[sectionKey]) {
      return customFieldRenderers[sectionKey]();
    }
    return null;
  };

  return (
    <div className="bg-card rounded-lg border border-border shadow-sm p-6">
      <form onSubmit={handleSubmit(handleFormSubmit)} noValidate className="space-y-6">
        {config.sections.map(renderSection)}
        
        {/* Render custom sections */}
        {config.customFields && Object.keys(config.customFields).map(sectionKey => 
          <div key={sectionKey}>{renderCustomSection(sectionKey)}</div>
        )}
        
        {customActions && (
          <div className="space-y-4">
            {customActions}
          </div>
        )}

        <div className="flex justify-end pt-6 border-t border-border">
          <Button 
            type="submit" 
            disabled={isLoading || isSubmitting}
          >
            {isLoading || isSubmitting
              ? (isEditMode ? config.editLoadingText : config.addLoadingText)
              : (isEditMode ? config.editButtonText : config.addButtonText)
            }
          </Button>
        </div>
      </form>
    </div>
  );
}

export default GenericForm;
