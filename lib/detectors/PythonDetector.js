/**
 * Python Project Detector
 * 
 * Specialized detector for Python projects and frameworks
 */

const path = require('path');
const { safeReadText, fileExists } = require('./shared-utils');
const AbstractDetector = require('./AbstractDetector');

// Python specific patterns
const PYTHON_PATTERNS = {
  configFiles: ['requirements.txt', 'pyproject.toml', 'setup.py', 'Pipfile'],
  frameworks: {
    'django': { 
      files: ['manage.py'], 
      dependencies: ['Django'], 
      primary: true 
    },
    'flask': { 
      files: ['app.py'], 
      dependencies: ['Flask'], 
      primary: true 
    },
    'fastapi': { 
      dependencies: ['fastapi'], 
      primary: true 
    },
    'pyramid': { 
      dependencies: ['pyramid'] 
    },
    'tornado': { 
      dependencies: ['tornado'] 
    }
  }
};

class PythonDetector extends AbstractDetector {
  constructor() {
    super(PYTHON_PATTERNS);
    this.foundFiles = [];
  }

  /**
   * Detect and add Python language
   * @param {Object} result - Detection result object to modify
   */
  detectLanguage(result) {
    result.languages.push('python');
  }

  /**
   * Detect and add Python tools
   * @param {string} projectPath - Path to project directory
   * @param {Object} result - Detection result object to modify
   */
  detectTools(projectPath, result) {
    result.tools.push('pip');
  }

  /**
   * Detect Python frameworks
   * @param {string} projectPath - Path to project directory
   * @param {Object} result - Detection result object to modify
   */
  detectFrameworks(projectPath, result) {
    this.foundFiles = this.findPythonFiles(projectPath);
    this.detectPythonFrameworks(projectPath, this.foundFiles, result);
  }

  /**
   * Find Python configuration files in project
   * @param {string} projectPath - Path to project directory
   * @returns {string[]} Array of found Python config files
   */
  findPythonFiles(projectPath) {
    return PYTHON_PATTERNS.configFiles.filter(file => 
      fileExists(path.join(projectPath, file))
    );
  }

  /**
   * Detect Python frameworks
   * @param {string} projectPath - Path to project directory
   * @param {string[]} foundFiles - Array of Python config files
   * @param {Object} result - Detection result object to modify
   */
  detectPythonFrameworks(projectPath, foundFiles, result) {
    Object.entries(PYTHON_PATTERNS.frameworks).forEach(([framework, config]) => {
      let detected = false;
      
      // Check for framework-specific files
      if (config.files) {
        detected = this.checkFrameworkFiles(projectPath, config.files);
      }
      
      // Check dependencies in requirements files
      if (!detected && config.dependencies) {
        detected = this.checkDependencies(foundFiles, projectPath, config.dependencies);
      }
      
      if (detected) {
        result.frameworks.push(framework);
        
        // Set as primary if it's marked as primary and no primary set yet
        if (config.primary && result.primary === 'generic') {
          result.primary = framework;
        }
      }
    });
  }

  /**
   * Check if framework dependencies exist in requirement files
   * @param {string[]} foundFiles - Array of Python config file paths
   * @param {string} projectPath - Path to project directory
   * @param {string[]} dependencies - Dependencies to check for
   * @returns {boolean} True if any dependency found
   */
  checkDependencies(foundFiles, projectPath, dependencies) {
    return foundFiles.some(file => {
      const content = safeReadText(path.join(projectPath, file));
      if (!content) return false;
      
      return dependencies.some(dep => content.includes(dep));
    });
  }

  /**
   * Check if framework-specific files exist
   * @param {string} projectPath - Path to project directory
   * @param {string[]} files - Files to check for
   * @returns {boolean} True if any file found
   */
  checkFrameworkFiles(projectPath, files) {
    if (!files) return false;
    return files.some(file => fileExists(path.join(projectPath, file)));
  }

  /**
   * Resolve Python primary framework
   * @param {Object} result - Detection result object to modify
   */
  resolvePrimary(result) {
    if (result.primary === 'generic' && result.frameworks.length > 0) {
      result.primary = result.frameworks[0];
    } else if (result.primary === 'generic') {
      result.primary = 'python';
    }
  }
}

// Create singleton instance
const pythonDetector = new PythonDetector();

/**
 * Detect Python projects - maintains backward compatibility
 * @param {string} projectPath - Path to project directory
 * @param {Object} result - Detection result object to modify
 */
function detectPythonProject(projectPath, result) {
  pythonDetector.detect(projectPath, result);
}

module.exports = {
  detectPythonProject,
  PythonDetector
};