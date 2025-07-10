/**
 * Shared Constants for Claude Code Template
 * Consolidated constants from all phases to eliminate duplication
 */

// ===== SHARED SEVERITY AND PRIORITY LEVELS =====
const SEVERITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

const IMPACT_LEVELS = {
  CRITICAL: 'critical',
  HIGH: 'high', 
  MEDIUM: 'medium',
  LOW: 'low'
};

// ===== SHARED USER EXPERIENCE LEVELS =====
const EXPERIENCE_LEVELS = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  EXPERT: 'expert'
};

// ===== SHARED OUTPUT FORMATS =====
const OUTPUT_FORMATS = {
  HUMAN: 'human',
  JSON: 'json',
  TABLE: 'table',
  STRUCTURED: 'structured'
};

// ===== WCAG ACCESSIBILITY STANDARDS =====
const WCAG_STANDARDS = {
  AA_CONTRAST_RATIO: 4.5,
  AAA_CONTRAST_RATIO: 7.0,
  LARGE_TEXT_AA_RATIO: 3.0,
  LARGE_TEXT_AAA_RATIO: 4.5
};

// ===== SHARED PROJECT TYPES =====
const PROJECT_TYPES = {
  NODEJS: 'nodejs',
  PYTHON: 'python',
  RUST: 'rust',
  UNKNOWN: 'unknown'
};

// ===== SHARED ERROR HANDLING =====
const ERROR_MESSAGES = {
  INVALID_CONFIG: 'Configuration validation failed',
  SAVE_FAILED: 'Failed to save preferences',
  LOAD_FAILED: 'Failed to load configuration',
  THEME_NOT_FOUND: 'Theme not found',
  MIGRATION_FAILED: 'Configuration migration failed'
};

// ===== SHARED PLATFORM PATHS =====
const PLATFORM_PATHS = {
  WIN32: 'AppData/Roaming',
  DARWIN: 'Library/Preferences',
  LINUX: '.config'
};

// ===== SHARED CONFIGURATION =====
const CONFIG_PRIORITY = {
  CLI_ARGS: 4,
  ENVIRONMENT: 3,
  USER_CONFIG: 2,
  DEFAULTS: 1
};

const CONFIG_VERSION = '2.0.0';

// ===== ACCESSIBILITY & THEMES =====
const THEME_NAMES = {
  DEFAULT: 'default',
  DARK: 'dark',
  HIGH_CONTRAST: 'high-contrast',
  COLORBLIND_FRIENDLY: 'colorblind-friendly'
};

const SEMANTIC_PREFIXES = {
  SUCCESS: '[OK] Success:',
  ERROR: '[ERROR] Error:',
  WARNING: '[WARN] Warning:',
  INFO: '[INFO] Info:',
  PROGRESS: '[PROGRESS] Progress:'
};

const ACCESSIBILITY_FEATURES = {
  SCREEN_READER: 'screenReader',
  HIGH_CONTRAST: 'highContrast',
  REDUCED_MOTION: 'reducedMotion',
  SEMANTIC_STRUCTURE: 'semanticStructure',
  KEYBOARD_NAVIGATION: 'keyboardNavigation'
};

// ===== COLOR VALIDATION =====
const COLOR_VALIDATION = {
  HEX_PATTERN: /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i,
  RGB_PATTERN: /rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)/,
  HSL_PATTERN: /hsl\((\d{1,3}),\s*(\d{1,3})%,\s*(\d{1,3})%\)/
};

// ===== SHARED DATA FILE SUFFIXES =====
const DATA_FILE_SUFFIXES = {
  CONFIG: 'config.json',
  CUSTOMIZATIONS: 'customizations.json',
  PROGRESS: 'progress.json',
  ANALYTICS: 'analytics.json'
};

module.exports = {
  // Shared severity and priority
  SEVERITY_LEVELS,
  IMPACT_LEVELS,
  
  // User experience
  EXPERIENCE_LEVELS,
  OUTPUT_FORMATS,
  
  // Standards and validation
  WCAG_STANDARDS,
  COLOR_VALIDATION,
  
  // Project and platform
  PROJECT_TYPES,
  PLATFORM_PATHS,
  
  // Configuration
  CONFIG_PRIORITY,
  CONFIG_VERSION,
  
  // Accessibility and themes
  THEME_NAMES,
  SEMANTIC_PREFIXES,
  ACCESSIBILITY_FEATURES,
  
  // Data management
  DATA_FILE_SUFFIXES,
  ERROR_MESSAGES
};