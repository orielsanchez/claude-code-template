/**
 * Phase 4 Accessibility & Personalization Constants
 * Shared constants and configuration for all accessibility and personalization modules
 */

module.exports = {
  // WCAG Compliance Levels and Standards
  WCAG_STANDARDS: {
    AA_CONTRAST_RATIO: 4.5,
    AAA_CONTRAST_RATIO: 7.0,
    LARGE_TEXT_AA_RATIO: 3.0,
    LARGE_TEXT_AAA_RATIO: 4.5
  },

  // Experience Levels
  EXPERIENCE_LEVELS: {
    BEGINNER: 'beginner',
    INTERMEDIATE: 'intermediate',
    EXPERT: 'expert'
  },

  // Output Formats
  OUTPUT_FORMATS: {
    HUMAN: 'human',
    JSON: 'json',
    TABLE: 'table',
    STRUCTURED: 'structured'
  },

  // Theme Names
  THEME_NAMES: {
    DEFAULT: 'default',
    DARK: 'dark',
    HIGH_CONTRAST: 'high-contrast',
    COLORBLIND_FRIENDLY: 'colorblind-friendly'
  },

  // Semantic Prefixes
  SEMANTIC_PREFIXES: {
    SUCCESS: '✓ Success:',
    ERROR: '✗ Error:',
    WARNING: '⚠ Warning:',
    INFO: 'ℹ Info:',
    PROGRESS: '⚙ Progress:'
  },

  // Accessibility Features
  ACCESSIBILITY_FEATURES: {
    SCREEN_READER: 'screenReader',
    HIGH_CONTRAST: 'highContrast',
    REDUCED_MOTION: 'reducedMotion',
    SEMANTIC_STRUCTURE: 'semanticStructure',
    KEYBOARD_NAVIGATION: 'keyboardNavigation'
  },

  // Configuration Hierarchy Priority
  CONFIG_PRIORITY: {
    CLI_ARGS: 4,
    ENVIRONMENT: 3,
    USER_CONFIG: 2,
    DEFAULTS: 1
  },

  // Platform-specific Paths
  PLATFORM_PATHS: {
    WIN32: 'AppData/Roaming',
    DARWIN: 'Library/Preferences',
    LINUX: '.config'
  },

  // Error Messages
  ERROR_MESSAGES: {
    INVALID_CONFIG: 'Configuration validation failed',
    SAVE_FAILED: 'Failed to save preferences',
    LOAD_FAILED: 'Failed to load configuration',
    THEME_NOT_FOUND: 'Theme not found',
    MIGRATION_FAILED: 'Configuration migration failed'
  },

  // Color Validation
  COLOR_VALIDATION: {
    HEX_PATTERN: /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i,
    RGB_PATTERN: /rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)/,
    HSL_PATTERN: /hsl\((\d{1,3}),\s*(\d{1,3})%,\s*(\d{1,3})%\)/
  },

  // Experience Detection Thresholds
  EXPERIENCE_THRESHOLDS: {
    EXPERT_SCORE: 60,
    INTERMEDIATE_SCORE: 20,
    HIGH_SUCCESS_RATE: 0.9,
    LOW_SUCCESS_RATE: 0.7,
    EFFICIENT_SESSION_TIME: 600, // 10 minutes
    LONG_SESSION_TIME: 1200, // 20 minutes
    LOW_ERROR_COUNT: 5,
    HIGH_ERROR_COUNT: 10
  },

  // Data File Suffixes
  DATA_FILE_SUFFIXES: {
    CONFIG: 'config.json',
    CUSTOMIZATIONS: 'customizations.json',
    PROGRESS: 'progress.json',
    ANALYTICS: 'analytics.json'
  },

  // Default Configuration Version
  CONFIG_VERSION: '2.0.0'
};