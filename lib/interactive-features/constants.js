/**
 * Phase 3 Interactive Features Constants
 * Shared constants and configuration for all interactive feature modules
 */

module.exports = {
  // Error severity levels
  SEVERITY_LEVELS: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical'
  },

  // Help system levels
  HELP_LEVELS: {
    QUICK: 'quick',
    DETAILED: 'detailed',
    TUTORIAL: 'tutorial'
  },

  // Command categories
  COMMAND_CATEGORIES: {
    DEVELOPMENT: 'development',
    TESTING: 'testing',
    DEBUGGING: 'debugging',
    QUALITY: 'quality'
  },

  // Project types
  PROJECT_TYPES: {
    NODEJS: 'nodejs',
    PYTHON: 'python',
    RUST: 'rust',
    UNKNOWN: 'unknown'
  },

  // Default timeouts and limits
  TIMEOUTS: {
    COMMAND_EXECUTION: 30000, // 30 seconds
    TUTORIAL_STEP: 300000,    // 5 minutes
    HELP_SESSION: 1800000     // 30 minutes
  },

  // Data persistence paths
  DATA_PATHS: {
    BASE_DIR: '../../data/interactive-features',
    PROGRESS_SUFFIX: '-setup-progress.json',
    USAGE_SUFFIX: '-usage-patterns.json',
    HELP_SUFFIX: '-help-usage.json',
    ERROR_SUFFIX: '-error-patterns.json'
  }
};