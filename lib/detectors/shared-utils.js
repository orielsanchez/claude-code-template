/**
 * Shared utilities for framework detection
 * 
 * Common functions and constants used by all language detectors
 */

const fs = require('fs');
const { createContextualLogger } = require('../shared/logger');

const logger = createContextualLogger('shared-utils');

/**
 * Helper function to safely read and parse JSON
 * @param {string} filePath - Path to JSON file
 * @returns {Object|null} Parsed JSON or null if error
 */
function safeReadJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    logger.warn('Failed to read JSON file', {
      filePath,
      operation: 'safeReadJson',
      errorType: error.constructor.name,
      errorMessage: error.message
    });
    return null;
  }
}

/**
 * Helper function to safely read text file
 * @param {string} filePath - Path to text file
 * @returns {string|null} File content or null if error
 */
function safeReadText(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    logger.warn('Failed to read text file', {
      filePath,
      operation: 'safeReadText',
      errorType: error.constructor.name,
      errorMessage: error.message
    });
    return null;
  }
}

/**
 * Check if a file exists
 * @param {string} filePath - Path to check
 * @returns {boolean} True if file exists
 */
function fileExists(filePath) {
  // Handle null/undefined/invalid inputs to avoid deprecation warnings
  if (!filePath || typeof filePath !== 'string') {
    return false;
  }
  
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    logger.warn('Failed to check file existence', {
      filePath,
      operation: 'fileExists',
      errorType: error.constructor.name,
      errorMessage: error.message
    });
    return false;
  }
}

module.exports = {
  safeReadJson,
  safeReadText,
  fileExists
};