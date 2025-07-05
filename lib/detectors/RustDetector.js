/**
 * Rust Project Detector
 * 
 * Specialized detector for Rust projects and frameworks
 */

const path = require('path');
const { safeReadText, fileExists } = require('./shared-utils');
const AbstractDetector = require('./AbstractDetector');

// Rust specific patterns
const RUST_PATTERNS = {
  configFiles: ['Cargo.toml'],
  dependencies: {
    'axum': { framework: 'axum' },
    'warp': { framework: 'warp' },
    'actix-web': { framework: 'actix-web' },
    'rocket': { framework: 'rocket' },
    'tide': { framework: 'tide' }
  }
};

class RustDetector extends AbstractDetector {
  constructor() {
    super(RUST_PATTERNS);
  }

  /**
   * Detect and add Rust language
   * @param {Object} result - Detection result object to modify
   */
  detectLanguage(result) {
    result.languages.push('rust');
  }

  /**
   * Detect and add Rust tools
   * @param {string} projectPath - Path to project directory
   * @param {Object} result - Detection result object to modify
   */
  detectTools(projectPath, result) {
    result.tools.push('cargo');
  }

  /**
   * Detect Rust frameworks from Cargo.toml
   * @param {string} projectPath - Path to project directory
   * @param {Object} result - Detection result object to modify
   */
  detectFrameworks(projectPath, result) {
    const cargoTomlPath = path.join(projectPath, 'Cargo.toml');
    const cargoContent = safeReadText(cargoTomlPath);
    
    if (cargoContent) {
      this.parseRustDependencies(cargoContent, result);
    }
  }

  /**
   * Parse Cargo.toml for dependencies
   * @param {string} cargoContent - Content of Cargo.toml file
   * @param {Object} result - Detection result object to modify
   */
  parseRustDependencies(cargoContent, result) {
    Object.entries(RUST_PATTERNS.dependencies).forEach(([dep, config]) => {
      if (cargoContent.includes(dep)) {
        result.frameworks.push(config.framework);
      }
    });
  }

  /**
   * Resolve Rust primary framework
   * @param {Object} result - Detection result object to modify
   */
  resolvePrimary(result) {
    if (result.primary === 'generic') {
      result.primary = 'rust';  // Language takes priority for Rust projects
    }
  }
}

// Create singleton instance
const rustDetector = new RustDetector();

/**
 * Detect Rust projects - maintains backward compatibility
 * @param {string} projectPath - Path to project directory
 * @param {Object} result - Detection result object to modify
 */
function detectRustProject(projectPath, result) {
  rustDetector.detect(projectPath, result);
}

module.exports = {
  detectRustProject,
  RustDetector
};