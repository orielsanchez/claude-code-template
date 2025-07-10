/**
 * Shared Detector Utilities
 * 
 * Consolidated utilities for all language detectors to eliminate code duplication
 * Provides common dependency parsing, framework detection, and file pattern matching
 */

const fs = require('fs');
const path = require('path');
const { createContextualLogger } = require('../shared/logger');

const logger = createContextualLogger('shared-detector-utilities');

/**
 * Factory for creating dependency parsers for different file formats
 */
class DependencyParserFactory {
  static create(parserType) {
    switch (parserType) {
      case 'json':
        return new JsonDependencyParser();
      case 'toml':
        return new TomlDependencyParser();
      case 'text':
        return new TextDependencyParser();
      case 'swift':
        return new SwiftDependencyParser();
      default:
        throw new Error(`Unsupported parser type: ${parserType}`);
    }
  }
}

/**
 * Base dependency parser class
 */
class BaseDependencyParser {
  parse(filePath) {
    try {
      if (!fs.existsSync(filePath)) {
        return null;
      }
      return this._parseContent(fs.readFileSync(filePath, 'utf8'));
    } catch (error) {
      logger.warn('Failed to parse dependency file', {
        filePath,
        parser: this.constructor.name,
        errorType: error.constructor.name,
        errorMessage: error.message
      });
      return null;
    }
  }

  _parseContent(content) {
    throw new Error('_parseContent must be implemented by subclasses');
  }
}

/**
 * JSON dependency parser (package.json)
 */
class JsonDependencyParser extends BaseDependencyParser {
  _parseContent(content) {
    const parsed = JSON.parse(content);
    return {
      dependencies: parsed.dependencies || {},
      devDependencies: parsed.devDependencies || {}
    };
  }
}

/**
 * TOML dependency parser (Cargo.toml)
 */
class TomlDependencyParser extends BaseDependencyParser {
  _parseContent(content) {
    const dependencies = {};
    const devDependencies = {};

    // Simple TOML parser for dependencies sections
    const lines = content.split('\n');
    let currentSection = null;

    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed === '[dependencies]') {
        currentSection = 'dependencies';
        continue;
      } else if (trimmed === '[dev-dependencies]') {
        currentSection = 'devDependencies';
        continue;
      } else if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        currentSection = null;
        continue;
      }

      if (currentSection && trimmed && !trimmed.startsWith('#')) {
        const match = trimmed.match(/^([a-zA-Z0-9_-]+)\s*=\s*(.+)$/);
        if (match) {
          const [, name, value] = match;
          const target = currentSection === 'dependencies' ? dependencies : devDependencies;
          target[name] = value.replace(/['"]/g, '');
        }
      }
    }

    return { dependencies, devDependencies };
  }
}

/**
 * Text dependency parser (requirements.txt, Pipfile)
 */
class TextDependencyParser extends BaseDependencyParser {
  _parseContent(content) {
    const dependencies = {};
    
    const lines = content.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        // Extract package name from requirements like "django==4.2.0" or "flask>=2.0.0"
        const match = trimmed.match(/^([a-zA-Z0-9_-]+)([><=!~]+.*)?$/);
        if (match) {
          const [, name, version] = match;
          dependencies[name] = version || '';
        }
      }
    }

    return { dependencies, devDependencies: {} };
  }
}

/**
 * Swift Package.swift parser
 */
class SwiftDependencyParser extends BaseDependencyParser {
  _parseContent(content) {
    const dependencies = {};

    // Extract package URLs and names from Package.swift
    const packageRegex = /\.package\s*\(\s*url:\s*"([^"]+)"/g;
    let match;

    while ((match = packageRegex.exec(content)) !== null) {
      const url = match[1];
      // Extract package name from GitHub URL or similar
      const nameMatch = url.match(/\/([^/]+)(?:\.git)?$/);
      if (nameMatch) {
        const name = nameMatch[1].toLowerCase().replace('.git', '');
        dependencies[name] = url;
      }
    }

    // Also check for target dependencies
    const targetMatch = content.match(/dependencies:\s*\[(.*?)\]/s);
    if (targetMatch) {
      const targetDeps = targetMatch[1];
      const depMatches = targetDeps.match(/"([^"]+)"/g);
      if (depMatches) {
        depMatches.forEach(dep => {
          const cleanDep = dep.replace(/"/g, '').toLowerCase();
          if (!dependencies[cleanDep]) {
            dependencies[cleanDep] = '';
          }
        });
      }
    }

    return { dependencies, devDependencies: {} };
  }
}

/**
 * Framework detection engine with standardized pattern matching
 */
class FrameworkDetectionEngine {
  /**
   * Detect frameworks from dependencies using pattern matching
   * @param {Object} dependencies - Dependencies object
   * @param {Object} frameworkPatterns - Framework detection patterns
   * @param {Object} testPatterns - Test framework patterns (optional)
   * @returns {Object} Detection result with frameworks, testFrameworks, and primary
   */
  detectFrameworks(dependencies, frameworkPatterns, testPatterns = {}) {
    const result = {
      frameworks: [],
      testFrameworks: [],
      primary: null
    };

    const detectedFrameworks = [];

    // Detect main frameworks and collect primary candidates
    Object.entries(frameworkPatterns).forEach(([dep, config]) => {
      if (dependencies[dep]) {
        // Validate requirements if specified
        if (this.validateRequirements(config.requires, dependencies)) {
          result.frameworks.push(config.framework);
          
          // Collect primary framework candidates with their requirements
          if (config.primary) {
            detectedFrameworks.push({
              framework: config.framework,
              requires: config.requires || [],
              dependency: dep
            });
          }
        }
      }
    });

    // Prioritize frameworks with requirements (meta-frameworks) over base frameworks
    const primaryFramework = this._selectPrimaryFramework(detectedFrameworks);

    // Detect test frameworks
    Object.entries(testPatterns).forEach(([dep, framework]) => {
      if (dependencies[dep] && !result.testFrameworks.includes(framework)) {
        result.testFrameworks.push(framework);
      }
    });

    result.primary = primaryFramework;
    return result;
  }

  /**
   * Select primary framework, prioritizing meta-frameworks over base frameworks
   * @param {Array} frameworks - Array of detected primary frameworks with metadata
   * @returns {string|null} Selected primary framework
   */
  _selectPrimaryFramework(frameworks) {
    if (frameworks.length === 0) return null;
    if (frameworks.length === 1) return frameworks[0].framework;

    // Prioritize frameworks that have requirements (meta-frameworks like nextjs)
    const metaFrameworks = frameworks.filter(f => f.requires.length > 0);
    if (metaFrameworks.length > 0) {
      return metaFrameworks[0].framework;
    }

    // Fall back to first primary framework found
    return frameworks[0].framework;
  }

  /**
   * Validate framework requirements
   * @param {string[]} requirements - Required dependencies
   * @param {Object} dependencies - Available dependencies
   * @returns {boolean} True if all requirements are met
   */
  validateRequirements(requirements, dependencies) {
    if (!requirements || requirements.length === 0) {
      return true;
    }
    
    return requirements.every(req => dependencies[req]);
  }
}

/**
 * File pattern matcher for config file discovery
 */
class FilePatternMatcher {
  /**
   * Find configuration files matching patterns
   * @param {string} projectPath - Directory to search
   * @param {string[]} patterns - File patterns to match
   * @returns {string[]} Found file names
   */
  findConfigFiles(projectPath, patterns) {
    try {
      if (!fs.existsSync(projectPath)) {
        return [];
      }

      const found = [];
      const files = fs.readdirSync(projectPath, { withFileTypes: true });

      for (const pattern of patterns) {
        // Handle exact matches
        if (pattern.includes('/')) {
          // Nested path like '.cargo/config.toml'
          const fullPath = path.join(projectPath, pattern);
          if (fs.existsSync(fullPath)) {
            found.push(pattern);
          }
        } else if (pattern.includes('*')) {
          // Glob pattern like '*.xcodeproj'
          const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
          files.forEach(file => {
            if (regex.test(file.name)) {
              found.push(file.name);
            }
          });
        } else {
          // Exact filename
          if (files.some(file => file.name === pattern)) {
            found.push(pattern);
          }
        }
      }

      return found;
    } catch (error) {
      logger.warn('Failed to find config files', {
        projectPath,
        patterns,
        errorType: error.constructor.name,
        errorMessage: error.message
      });
      return [];
    }
  }

  /**
   * Efficiently check existence of multiple files
   * @param {string[]} filePaths - Array of file paths to check
   * @returns {Object} Map of path -> boolean existence
   */
  batchFileExists(filePaths) {
    const results = {};
    
    for (const filePath of filePaths) {
      try {
        results[filePath] = fs.existsSync(filePath);
      } catch (error) {
        results[filePath] = false;
      }
    }

    return results;
  }
}

module.exports = {
  DependencyParserFactory,
  FrameworkDetectionEngine,
  FilePatternMatcher
};