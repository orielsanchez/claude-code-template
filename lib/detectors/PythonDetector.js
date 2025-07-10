/**
 * Python Project Detector
 * 
 * Specialized detector for Python projects and frameworks
 */

const path = require('path');
const { fileExists } = require('./shared-utils');
const AbstractDetector = require('./AbstractDetector');
const { DependencyParserFactory, FrameworkDetectionEngine, FilePatternMatcher } = require('./shared-detector-utilities');

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
    this.frameworkEngine = new FrameworkDetectionEngine();
    this.filePatternMatcher = new FilePatternMatcher();
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
    this.foundFiles = this.filePatternMatcher.findConfigFiles(projectPath, PYTHON_PATTERNS.configFiles);
    
    // Parse dependencies from all found config files
    const allDependencies = {};
    this.foundFiles.forEach(file => {
      const parser = DependencyParserFactory.create('text');
      const deps = parser.parse(path.join(projectPath, file));
      if (deps) {
        Object.assign(allDependencies, deps.dependencies);
      }
    });
    
    // Convert PYTHON_PATTERNS.frameworks to framework detection patterns
    const frameworkPatterns = {};
    Object.entries(PYTHON_PATTERNS.frameworks).forEach(([framework, config]) => {
      if (config.dependencies) {
        config.dependencies.forEach(dep => {
          frameworkPatterns[dep.toLowerCase()] = {
            framework: framework,
            primary: config.primary || false
          };
        });
      }
    });
    
    // Use shared framework detection engine
    const frameworkResult = this.frameworkEngine.detectFrameworks(
      allDependencies,
      frameworkPatterns
    );
    
    // Check for framework-specific files as well
    Object.entries(PYTHON_PATTERNS.frameworks).forEach(([framework, config]) => {
      if (config.files && this.checkFrameworkFiles(projectPath, config.files)) {
        if (!frameworkResult.frameworks.includes(framework)) {
          frameworkResult.frameworks.push(framework);
          if (config.primary && !frameworkResult.primary) {
            frameworkResult.primary = framework;
          }
        }
      }
    });
    
    // Merge results
    result.frameworks.push(...frameworkResult.frameworks);
    if (frameworkResult.primary && result.primary === 'generic') {
      result.primary = frameworkResult.primary;
    }
  }

  /**
   * Check if framework-specific files exist
   * @param {string} projectPath - Path to project directory
   * @param {string[]} files - Files to check for
   * @returns {boolean} True if any file found
   */
  checkFrameworkFiles(projectPath, files) {
    if (!files) return false;
    const foundFiles = this.filePatternMatcher.findConfigFiles(projectPath, files);
    return foundFiles.length > 0;
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