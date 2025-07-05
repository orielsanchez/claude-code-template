/**
 * Phase 4 Accessibility & Personalization Constants
 * Phase-specific constants only - import shared constants from ../shared/constants
 */

// Phase 4 specific constants
const EXPERIENCE_THRESHOLDS = {
  EXPERT_SCORE: 60,
  INTERMEDIATE_SCORE: 20,
  HIGH_SUCCESS_RATE: 0.9,
  LOW_SUCCESS_RATE: 0.7,
  EFFICIENT_SESSION_TIME: 600, // 10 minutes
  LONG_SESSION_TIME: 1200, // 20 minutes
  LOW_ERROR_COUNT: 5,
  HIGH_ERROR_COUNT: 10
};

module.exports = {
  EXPERIENCE_THRESHOLDS
};