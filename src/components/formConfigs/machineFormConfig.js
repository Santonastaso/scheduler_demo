import {
  DEPARTMENT_TYPES,
  WORK_CENTERS,
  MACHINE_STATUSES,
  SHIFT_TYPES,
  DEFAULT_VALUES
} from '../../constants';

/**
 * Machine Form Configuration
 * Defines the structure and behavior of the machine form using the generic form component
 */

export const machineFormConfig = {
  validationSchema: 'MACHINE',
  
  // Button and context text
  addButtonText: 'Aggiungi Macchina',
  editButtonText: 'Aggiorna Macchina',
  addLoadingText: 'Aggiunta...',
  editLoadingText: 'Aggiornamento...',
  addContext: 'Add Machine',
  editContext: 'Update Machine',
  addErrorMessage: 'Aggiunta macchina fallita',
  editErrorMessage: 'Aggiornamento macchina fallita',

  sections: [
    {
      title: 'Identificazione',
      fields: [
        {
          name: 'department',
          label: 'Department',
          type: 'select',
          required: true,
          options: [
            { value: DEPARTMENT_TYPES.PRINTING, label: DEPARTMENT_TYPES.PRINTING },
            { value: DEPARTMENT_TYPES.PACKAGING, label: DEPARTMENT_TYPES.PACKAGING }
          ],
          defaultValue: DEFAULT_VALUES.MACHINE.DEPARTMENT,
          validation: {
            required: 'Department is required'
          }
        },
        {
          name: 'machine_type',
          label: 'Machine Type',
          type: 'select',
          required: true,
          placeholder: 'Seleziona tipo macchina',
          options: [], // Will be populated dynamically based on department
          conditional: (department) => department === DEPARTMENT_TYPES.PRINTING || department === DEPARTMENT_TYPES.PACKAGING,
          validation: {
            required: 'Machine type is required'
          }
        },
        {
          name: 'machine_name',
          label: 'Machine Name',
          type: 'text',
          required: true,
          placeholder: 'Nome descrittivo',
          validation: {
            required: 'Machine name is required',
            minLength: {
              value: 2,
              message: 'Machine name must be at least 2 characters'
            },
            maxLength: {
              value: 100,
              message: 'Machine name must be at most 100 characters'
            },
            pattern: {
              value: /^[a-zA-Z0-9\s\-_]+$/,
              message: 'Machine name can only contain letters, numbers, spaces, hyphens, and underscores'
            }
          }
        },
        {
          name: 'work_center',
          label: 'Work Center',
          type: 'select',
          required: true,
          placeholder: 'Seleziona un centro di lavoro',
          options: [
            { value: WORK_CENTERS.ZANICA, label: WORK_CENTERS.ZANICA },
            { value: WORK_CENTERS.BUSTO_GAROLFO, label: WORK_CENTERS.BUSTO_GAROLFO }
          ],
          defaultValue: DEFAULT_VALUES.MACHINE.WORK_CENTER,
          helpText: 'Il centro di lavoro è pre-impostato.',
          validation: {
            required: 'Work center is required'
          }
        }
      ]
    },
    {
      title: 'Capacità Tecniche',
      fields: [
        {
          name: 'min_web_width',
          label: 'Min Web Width (mm)',
          type: 'number',
          required: true,
          defaultValue: DEFAULT_VALUES.MACHINE.MIN_WEB_WIDTH,
          validation: {
            required: 'Min web width is required',
            min: {
              value: 1,
              message: 'Min web width must be at least 1'
            }
          }
        },
        {
          name: 'max_web_width',
          label: 'Max Web Width (mm)',
          type: 'number',
          required: true,
          defaultValue: DEFAULT_VALUES.MACHINE.MAX_WEB_WIDTH,
          validation: {
            required: 'Max web width is required',
            min: {
              value: 1,
              message: 'Max web width must be at least 1'
            }
          }
        },
        {
          name: 'min_bag_height',
          label: 'Min Bag Height (mm)',
          type: 'number',
          required: true,
          defaultValue: DEFAULT_VALUES.MACHINE.MIN_BAG_HEIGHT,
          validation: {
            required: 'Min bag height is required',
            min: {
              value: 1,
              message: 'Min bag height must be at least 1'
            }
          }
        },
        {
          name: 'max_bag_height',
          label: 'Max Bag Height (mm)',
          type: 'number',
          required: true,
          defaultValue: DEFAULT_VALUES.MACHINE.MAX_BAG_HEIGHT,
          validation: {
            required: 'Max bag height is required',
            min: {
              value: 1,
              message: 'Max bag height must be at least 1'
            }
          }
        }
      ]
    },
    {
      title: 'Performance',
      fields: [
        {
          name: 'standard_speed',
          label: 'Standard Speed',
          type: 'number',
          required: true,
          placeholder: 'pz/h o mt/h',
          validation: {
            required: 'Standard speed is required',
            min: {
              value: 1,
              message: 'Standard speed must be at least 1'
            }
          }
        },
        {
          name: 'setup_time_standard',
          label: 'Setup Time Standard (h)',
          type: 'number',
          required: true,
          defaultValue: DEFAULT_VALUES.MACHINE.SETUP_TIME_STANDARD,
          validation: {
            required: 'Setup time is required',
            min: {
              value: 0,
              message: 'Setup time must be at least 0'
            }
          }
        },
        {
          name: 'changeover_color',
          label: 'Changeover Color (h)',
          type: 'number',
          required: true,
          defaultValue: DEFAULT_VALUES.MACHINE.CHANGEOVER_COLOR,
          conditional: (fieldValue, watch, getValues) => getValues('department') === DEPARTMENT_TYPES.PRINTING,
          validation: {
            required: 'Changeover color time is required',
            min: {
              value: 0,
              message: 'Changeover color time must be at least 0'
            }
          }
        },
        {
          name: 'changeover_material',
          label: 'Material Changeover (h)',
          type: 'number',
          required: true,
          defaultValue: DEFAULT_VALUES.MACHINE.CHANGEOVER_MATERIAL,
          conditional: (fieldValue, watch, getValues) => getValues('department') === DEPARTMENT_TYPES.PACKAGING,
          validation: {
            required: 'Changeover material time is required',
            min: {
              value: 0,
              message: 'Changeover material time must be at least 0'
            }
          }
        }
      ]
    },
    {
      title: 'Disponibilità',
      fields: [
        {
          name: 'active_shifts',
          label: 'Active Shifts',
          type: 'checkbox',
          required: false,
          defaultValue: DEFAULT_VALUES.MACHINE.ACTIVE_SHIFTS,
          options: [
            { value: SHIFT_TYPES.T1, label: SHIFT_TYPES.T1 },
            { value: SHIFT_TYPES.T2, label: SHIFT_TYPES.T2 },
            { value: SHIFT_TYPES.T3, label: SHIFT_TYPES.T3 }
          ]
        },
        {
          name: 'status',
          label: 'Status',
          type: 'select',
          required: true,
          defaultValue: DEFAULT_VALUES.MACHINE.STATUS,
          options: [
            { value: MACHINE_STATUSES.ACTIVE, label: MACHINE_STATUSES.ACTIVE },
            { value: MACHINE_STATUSES.INACTIVE, label: MACHINE_STATUSES.INACTIVE }
          ],
          validation: {
            required: 'Status is required'
          }
        }
      ]
    }
  ]
};
