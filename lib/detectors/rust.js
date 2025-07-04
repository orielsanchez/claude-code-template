/**
 * Rust Project Detection
 * 
 * Specialized detector for Rust projects and frameworks
 */

const path = require('path');
const { safeReadText, fileExists } = require('./shared-utils');

// Rust specific patterns
const RUST_PATTERNS = {
  configFile: 'Cargo.toml',
  dependencies: {
    'axum': { framework: 'axum' },
    'warp': { framework: 'warp' },
    'actix-web': { framework: 'actix-web' },
    'rocket': { framework: 'rocket' },
    'tide': { framework: 'tide' }
  }
};

/**
 * Parse Cargo.toml for dependencies
 * @param {string} cargoContent - Content of Cargo.toml file
 * @param {Object} result - Detection result object to modify
 */
function parseRustDependencies(cargoContent, result) {
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
function resolveRustPrimary(result) {
  if (result.primary === 'generic') {
    result.primary = 'rust';  // Language takes priority for Rust projects
  }
}

/**
 * Detect Rust projects
 * @param {string} projectPath - Path to project directory
 * @param {Object} result - Detection result object to modify
 */
function detectRustProject(projectPath, result) {
  const cargoTomlPath = path.join(projectPath, RUST_PATTERNS.configFile);
  if (!fileExists(cargoTomlPath)) return;
  
  // Basic Rust detection
  result.languages.push('rust');
  result.tools.push('cargo');
  
  // Parse dependencies from Cargo.toml
  const cargoContent = safeReadText(cargoTomlPath);
  if (cargoContent) {
    parseRustDependencies(cargoContent, result);
  }
  
  // Resolve primary framework
  resolveRustPrimary(result);
}

module.exports = {
  detectRustProject,
  // Export individual functions for testing
  parseRustDependencies,
  resolveRustPrimary
};