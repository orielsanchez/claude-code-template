/**
 * Python Project Detection
 * 
 * Specialized detector for Python projects and frameworks
 */

const path = require('path');
const { safeReadText, fileExists } = require('./shared-utils');

// Python specific patterns
const PYTHON_PATTERNS = {
  files: ['requirements.txt', 'pyproject.toml', 'setup.py', 'Pipfile'],
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

/**
 * Find Python configuration files in project
 * @param {string} projectPath - Path to project directory
 * @returns {string[]} Array of found Python config files
 */
function findPythonFiles(projectPath) {
  return PYTHON_PATTERNS.files.filter(file => 
    fileExists(path.join(projectPath, file))
  );
}

/**
 * Check if framework dependencies exist in requirement files
 * @param {string[]} foundFiles - Array of Python config file paths
 * @param {string} projectPath - Path to project directory
 * @param {string[]} dependencies - Dependencies to check for
 * @returns {boolean} True if any dependency found
 */
function checkDependencies(foundFiles, projectPath, dependencies) {
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
function checkFrameworkFiles(projectPath, files) {
  if (!files) return false;
  return files.some(file => fileExists(path.join(projectPath, file)));
}

/**
 * Detect Python frameworks
 * @param {string} projectPath - Path to project directory
 * @param {string[]} foundFiles - Array of Python config files
 * @param {Object} result - Detection result object to modify
 */
function detectPythonFrameworks(projectPath, foundFiles, result) {
  Object.entries(PYTHON_PATTERNS.frameworks).forEach(([framework, config]) => {
    let detected = false;
    
    // Check for framework-specific files
    if (config.files) {
      detected = checkFrameworkFiles(projectPath, config.files);
    }
    
    // Check dependencies in requirements files
    if (!detected && config.dependencies) {
      detected = checkDependencies(foundFiles, projectPath, config.dependencies);
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
 * Resolve Python primary framework
 * @param {Object} result - Detection result object to modify
 */
function resolvePythonPrimary(result) {
  if (result.primary === 'generic' && result.frameworks.length > 0) {
    result.primary = result.frameworks[0];
  } else if (result.primary === 'generic') {
    result.primary = 'python';
  }
}

/**
 * Detect Python projects
 * @param {string} projectPath - Path to project directory
 * @param {Object} result - Detection result object to modify
 */
function detectPythonProject(projectPath, result) {
  const foundFiles = findPythonFiles(projectPath);
  
  if (foundFiles.length === 0) return;
  
  // Basic Python detection
  result.languages.push('python');
  result.tools.push('pip');
  
  // Detect frameworks
  detectPythonFrameworks(projectPath, foundFiles, result);
  
  // Resolve primary framework
  resolvePythonPrimary(result);
}

module.exports = {
  detectPythonProject,
  // Export individual functions for testing
  findPythonFiles,
  checkDependencies,
  checkFrameworkFiles,
  detectPythonFrameworks,
  resolvePythonPrimary
};