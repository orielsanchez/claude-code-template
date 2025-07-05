/**
 * Abstract Detector Base Class
 * 
 * Provides shared detection patterns for all language-specific detectors
 */

const path = require('path');
const { fileExists } = require('./shared-utils');

class AbstractDetector {
  constructor(patterns) {
    this.patterns = patterns;
  }

  /**
   * Main detection method - template method pattern
   * @param {string} projectPath - Path to project directory
   * @param {Object} result - Detection result object to modify
   * @returns {boolean} True if language was detected
   */
  detect(projectPath, result) {
    // Check if this language's config files exist
    if (!this.hasConfigFiles(projectPath)) {
      return false;
    }

    // Perform language-specific detection
    this.detectLanguage(result);
    this.detectTools(projectPath, result);
    this.detectFrameworks(projectPath, result);
    this.resolvePrimary(result);

    return true;
  }

  /**
   * Check if language-specific configuration files exist
   * @param {string} projectPath - Path to project directory
   * @returns {boolean} True if config files found
   */
  hasConfigFiles(projectPath) {
    if (!this.patterns.configFiles) return false;
    
    return this.patterns.configFiles.some(file => 
      fileExists(path.join(projectPath, file))
    );
  }

  /**
   * Detect and add language(s) to result - must be implemented by subclasses
   * @param {Object} result - Detection result object to modify
   */
  detectLanguage(result) {
    throw new Error('detectLanguage() must be implemented by subclasses');
  }

  /**
   * Detect and add tools to result - must be implemented by subclasses
   * @param {string} projectPath - Path to project directory
   * @param {Object} result - Detection result object to modify
   */
  detectTools(projectPath, result) {
    throw new Error('detectTools() must be implemented by subclasses');
  }

  /**
   * Detect and add frameworks to result - must be implemented by subclasses
   * @param {string} projectPath - Path to project directory
   * @param {Object} result - Detection result object to modify
   */
  detectFrameworks(projectPath, result) {
    throw new Error('detectFrameworks() must be implemented by subclasses');
  }

  /**
   * Resolve primary framework - must be implemented by subclasses
   * @param {Object} result - Detection result object to modify
   */
  resolvePrimary(result) {
    throw new Error('resolvePrimary() must be implemented by subclasses');
  }

  /**
   * Helper method to add frameworks from dependency patterns
   * @param {Object} dependencies - Dependencies to check
   * @param {Object} result - Detection result object to modify
   * @param {Object} frameworkPatterns - Framework detection patterns
   * @returns {string|null} Primary framework detected
   */
  detectFrameworksFromDependencies(dependencies, result, frameworkPatterns) {
    let primaryFramework = null;
    
    Object.entries(frameworkPatterns).forEach(([dep, config]) => {
      if (dependencies[dep]) {
        // Check if requirements are met
        if (!config.requires || config.requires.every(req => dependencies[req])) {
          result.frameworks.push(config.framework);
          if (config.primary && !primaryFramework) {
            primaryFramework = config.framework;
          }
        }
      }
    });
    
    return primaryFramework;
  }

  /**
   * Helper method to add test frameworks from dependency patterns
   * @param {Object} dependencies - Dependencies to check
   * @param {Object} result - Detection result object to modify
   * @param {Object} testPatterns - Test framework patterns
   */
  detectTestFrameworksFromDependencies(dependencies, result, testPatterns) {
    Object.entries(testPatterns).forEach(([dep, framework]) => {
      if (dependencies[dep] && !result.testFrameworks.includes(framework)) {
        result.testFrameworks.push(framework);
      }
    });
  }
}

module.exports = AbstractDetector;