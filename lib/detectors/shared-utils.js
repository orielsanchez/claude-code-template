/**
 * Shared utilities for framework detection
 * 
 * Common functions and constants used by all language detectors
 */

const fs = require('fs');

/**
 * Helper function to safely read and parse JSON
 * @param {string} filePath - Path to JSON file
 * @returns {Object|null} Parsed JSON or null if error
 */
function safeReadJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
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
  } catch {
    return null;
  }
}

/**
 * Check if a file exists
 * @param {string} filePath - Path to check
 * @returns {boolean} True if file exists
 */
function fileExists(filePath) {
  return fs.existsSync(filePath);
}

module.exports = {
  safeReadJson,
  safeReadText,
  fileExists
};