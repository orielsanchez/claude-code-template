/**
 * Shared Constants for Phase 5: Validation & Optimization
 * Centralizes configuration, scoring thresholds, and validation criteria
 */

/**
 * Performance target metrics from roadmap
 */
const PERFORMANCE_TARGETS = {
  SETUP_SUCCESS_RATE: 0.95,
  TIME_TO_FIRST_SUCCESS: 300, // 5 minutes in seconds
  COMMAND_DISCOVERY_RATE: 0.80,
  USER_SATISFACTION: 8.5,
  HELP_USAGE_ENGAGEMENT_INCREASE: 0.40
};

/**
 * Baseline metrics from Phase 1 research
 */
const BASELINE_METRICS = {
  SETUP_SUCCESS_RATE: 0.60,
  AVERAGE_SETUP_TIME: 480, // 8 minutes in seconds
  COMMAND_DISCOVERY_RATE: 0.45,
  HELP_SYSTEM_ENGAGEMENT: 0.30
};

/**
 * Scoring thresholds for validation
 */
const SCORING_THRESHOLDS = {
  EXCELLENT: 9.0,
  GOOD: 8.0,
  ACCEPTABLE: 7.0,
  NEEDS_IMPROVEMENT: 6.0
};

/**
 * User persona profiles for UX validation
 */
const USER_PERSONAS = {
  beginner: { 
    complexity: 'low', 
    helpNeed: 'high', 
    discoveryStyle: 'guided',
    expectedOnboardingScore: 8.5
  },
  intermediate: { 
    complexity: 'medium', 
    helpNeed: 'medium', 
    discoveryStyle: 'exploration',
    expectedOnboardingScore: 8.2
  },
  expert: { 
    complexity: 'high', 
    helpNeed: 'low', 
    discoveryStyle: 'direct',
    expectedOnboardingScore: 8.8
  }
};

/**
 * Validation criteria for accessibility compliance
 */
const ACCESSIBILITY_CRITERIA = {
  WCAG_AA_CONTRAST_RATIO: 4.5,
  WCAG_AAA_CONTRAST_RATIO: 7.0,
  MINIMUM_SCREEN_READER_COMPATIBILITY: 0.95,
  MINIMUM_KEYBOARD_NAVIGATION_SCORE: 8.0,
  REQUIRED_ALTERNATIVE_TEXT_COVERAGE: 100
};

/**
 * Performance bottleneck impact classifications
 */
const IMPACT_LEVELS = {
  CRITICAL: 'critical',
  HIGH: 'high', 
  MEDIUM: 'medium',
  LOW: 'low'
};

/**
 * Optimization priority classifications
 */
const OPTIMIZATION_PRIORITIES = {
  HIGH: 'high',
  MEDIUM: 'medium', 
  LOW: 'low'
};

/**
 * Effort estimation levels
 */
const EFFORT_LEVELS = {
  VERY_LOW: 'very_low',
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  VERY_HIGH: 'very_high'
};

/**
 * Friction point solution templates
 */
const FRICTION_SOLUTIONS = {
  too_many_questions: 'Implement smart defaults and progressive configuration',
  information_overload: 'Add progressive disclosure and contextual help', 
  unclear_guidance: 'Enhance error messages with actionable suggestions',
  slow_performance: 'Optimize loading times and implement caching',
  complex_navigation: 'Simplify user interface and add guided flows'
};

/**
 * Standard workflow definitions
 */
const WORKFLOW_STEPS = {
  new_user_setup: ['download', 'install', 'configure', 'verify'],
  existing_user_upgrade: ['backup', 'update', 'migrate', 'test'],
  power_user_customization: ['preferences', 'themes', 'shortcuts'],
  accessibility_focused_setup: ['screen_reader_config', 'high_contrast', 'keyboard_nav']
};

/**
 * Cache strategy configurations
 */
const CACHE_STRATEGIES = {
  COMMAND_METADATA: {
    strategy: 'command_metadata_caching',
    expectedHitRate: 0.85,
    expectedPerformanceImprovement: 0.35
  },
  HELP_CONTENT: {
    strategy: 'help_content_preloading', 
    expectedHitRate: 0.90,
    expectedLoadTimeReduction: 0.42
  },
  USER_PREFERENCES: {
    strategy: 'user_preference_caching',
    expectedHitRate: 0.92,
    expectedPerformanceImprovement: 0.28
  }
};

module.exports = {
  PERFORMANCE_TARGETS,
  BASELINE_METRICS,
  SCORING_THRESHOLDS,
  USER_PERSONAS,
  ACCESSIBILITY_CRITERIA,
  IMPACT_LEVELS,
  OPTIMIZATION_PRIORITIES,
  EFFORT_LEVELS,
  FRICTION_SOLUTIONS,
  WORKFLOW_STEPS,
  CACHE_STRATEGIES
};