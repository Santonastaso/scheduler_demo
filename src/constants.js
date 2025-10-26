// Import shared constants first
import {
  DEPARTMENT_TYPES,
  WORK_CENTERS,
  MACHINE_STATUSES,
  PRODUCT_TYPES,
  SHIFT_TYPES,
  SEAL_SIDES,
  TASK_STATUSES,
  VALIDATION_MESSAGES,
  FIELD_CONFIGS,
  ALERT_TYPES,
  CONFIRMATION_TYPES,
  TIME_CONSTANTS,
  ERROR_TYPES
} from '@santonastaso/shared-components/constants';

// Re-export shared constants
export {
  DEPARTMENT_TYPES,
  WORK_CENTERS,
  MACHINE_STATUSES,
  PRODUCT_TYPES,
  SHIFT_TYPES,
  SEAL_SIDES,
  TASK_STATUSES,
  VALIDATION_MESSAGES,
  FIELD_CONFIGS,
  ALERT_TYPES,
  CONFIRMATION_TYPES,
  TIME_CONSTANTS,
  ERROR_TYPES
};

// ===== SCHEDULER-SPECIFIC CONSTANTS =====

// ===== FORM FIELD NAMES =====
export const FORM_FIELDS = {
  // Machine fields
  MACHINE_NAME: 'machine_name',
  MACHINE_TYPE: 'machine_type',
  DEPARTMENT: 'department',
  WORK_CENTER: 'work_center',
  MIN_WEB_WIDTH: 'min_web_width',
  MAX_WEB_WIDTH: 'max_web_width',
  MIN_BAG_HEIGHT: 'min_bag_height',
  MAX_BAG_HEIGHT: 'max_bag_height',
  STANDARD_SPEED: 'standard_speed',
  SETUP_TIME_STANDARD: 'setup_time_standard',
  CHANGEOVER_COLOR: 'changeover_color',
  CHANGEOVER_MATERIAL: 'changeover_material',
  ACTIVE_SHIFTS: 'active_shifts',
  STATUS: 'status',
  
  // Phase fields
  PHASE_NAME: 'name',
  NUMERO_PERSONE: 'numero_persone',
  V_STAMPA: 'v_stampa',
  T_SETUP_STAMPA: 't_setup_stampa',
  COSTO_H_STAMPA: 'costo_h_stampa',
  V_CONF: 'v_conf',
  T_SETUP_CONF: 't_setup_conf',
  COSTO_H_CONF: 'costo_h_conf',
  CONTENUTO_FASE: 'contenuto_fase',
  
  // Order fields
  ODP_NUMBER: 'odp_number',
  ARTICLE_CODE: 'article_code',
  PRODUCTION_LOT: 'production_lot',
  BAG_HEIGHT: 'bag_height',
  BAG_WIDTH: 'bag_width',
  BAG_STEP: 'bag_step',
  SEAL_SIDES: 'seal_sides',
  PRODUCT_TYPE: 'product_type',
  QUANTITY: 'quantity',
  QUANTITY_COMPLETED: 'quantity_completed',
  DELIVERY_DATE: 'delivery_date',
  USER_NOTES: 'user_notes',
  ASD_NOTES: 'asd_notes',
  MATERIAL_AVAILABILITY_GLOBAL: 'material_availability_global',
  
  // Off-time fields
  START_DATE: 'startDate',
  START_TIME: 'startTime',
  END_DATE: 'endDate',
  END_TIME: 'endTime'
};

// ===== SCHEDULER-SPECIFIC VALIDATION MESSAGES =====
export const SCHEDULER_VALIDATION_MESSAGES = {
  MIN_WEB_WIDTH_EXCEEDS_MAX: 'Minimum web width cannot exceed maximum web width',
  MIN_BAG_HEIGHT_EXCEEDS_MAX: 'Minimum bag height cannot exceed maximum bag height',
  BAG_WIDTH_LESS_THAN_STEP: 'Bag width cannot be less than bag step',
  SCHEDULED_START_AFTER_DELIVERY: 'Scheduled start cannot be after delivery date'
};

// ===== DEFAULT VALUES =====
export const DEFAULT_VALUES = {
  MACHINE: {
    DEPARTMENT: 'STAMPA', // DEPARTMENT_TYPES.PRINTING
    WORK_CENTER: 'ZANICA', // WORK_CENTERS.ZANICA
    MIN_WEB_WIDTH: '100',
    MAX_WEB_WIDTH: '1000',
    MIN_BAG_HEIGHT: '50',
    MAX_BAG_HEIGHT: '500',
    SETUP_TIME_STANDARD: '0.5',
    CHANGEOVER_COLOR: '0.25',
    CHANGEOVER_MATERIAL: '0.75',
    ACTIVE_SHIFTS: ['T1'], // [SHIFT_TYPES.T1]
    STATUS: 'ACTIVE' // MACHINE_STATUSES.ACTIVE
  },
  PHASE: {
    DEPARTMENT: 'STAMPA', // DEPARTMENT_TYPES.PRINTING
    NUMERO_PERSONE: 1,
    WORK_CENTER: 'ZANICA', // WORK_CENTERS.ZANICA
    V_STAMPA: 6000,
    T_SETUP_STAMPA: 0.5,
    COSTO_H_STAMPA: 50,
    V_CONF: 1000,
    T_SETUP_CONF: 0.25,
    COSTO_H_CONF: 40
  },
  ORDER: {
    SEAL_SIDES: 3, // SEAL_SIDES.THREE
    QUANTITY_COMPLETED: 0
  },
  OFF_TIME: {
    START_TIME: '09:00',
    END_TIME: '17:00'
  }
};

// ===== SCHEDULING =====
export const SCHEDULING = {
  MAX_TASK_SEGMENTS: 50 // Safety limit to prevent infinite loops in task splitting
};

export default {
  DEPARTMENT_TYPES,
  WORK_CENTERS,
  MACHINE_STATUSES,
  PRODUCT_TYPES,
  SHIFT_TYPES,
  SEAL_SIDES,
  TASK_STATUSES,
  FORM_FIELDS,
  VALIDATION_MESSAGES,
  SCHEDULER_VALIDATION_MESSAGES,
  DEFAULT_VALUES,
  FIELD_CONFIGS,
  ALERT_TYPES,
  CONFIRMATION_TYPES,
  SCHEDULING,
  TIME_CONSTANTS
};