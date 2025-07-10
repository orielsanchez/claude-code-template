/**
 * Rust Project Detector
 * 
 * Specialized detector for Rust projects and frameworks
 */

const path = require('path');
const { fileExists } = require('./shared-utils');
const AbstractDetector = require('./AbstractDetector');
const { DependencyParserFactory, FrameworkDetectionEngine, FilePatternMatcher } = require('./shared-detector-utilities');

// Modern Rust patterns (2024+)
const RUST_PATTERNS = {
  configFiles: ['Cargo.toml', 'rust-toolchain.toml', '.cargo/config.toml'],
  dependencies: {
    // Modern web frameworks
    'axum': { framework: 'axum', type: 'web', tier: 'modern' },
    'actix-web': { framework: 'actix-web', type: 'web', tier: 'mature' },
    'warp': { framework: 'warp', type: 'web', tier: 'functional' },
    'rocket': { framework: 'rocket', type: 'web', tier: 'ergonomic' },
    'tide': { framework: 'tide', type: 'web', tier: 'minimal' },
    
    // Modern async runtime
    'tokio': { framework: 'tokio', type: 'async-runtime', tier: 'standard' },
    'async-std': { framework: 'async-std', type: 'async-runtime', tier: 'alternative' },
    'smol': { framework: 'smol', type: 'async-runtime', tier: 'lightweight' },
    
    // Modern error handling
    'anyhow': { framework: 'anyhow', type: 'error-handling', tier: 'application' },
    'thiserror': { framework: 'thiserror', type: 'error-handling', tier: 'library' },
    'eyre': { framework: 'eyre', type: 'error-handling', tier: 'reporting' },
    
    // Modern serialization
    'serde': { framework: 'serde', type: 'serialization', tier: 'standard' },
    'postcard': { framework: 'postcard', type: 'serialization', tier: 'binary' },
    
    // Modern CLI
    'clap': { framework: 'clap', type: 'cli', tier: 'derive' },
    'structopt': { framework: 'structopt', type: 'cli', tier: 'legacy' },
    
    // Modern testing
    'proptest': { framework: 'proptest', type: 'testing', tier: 'property' },
    'rstest': { framework: 'rstest', type: 'testing', tier: 'parametric' },
    'criterion': { framework: 'criterion', type: 'testing', tier: 'benchmark' },
    
    // Modern concurrency
    'rayon': { framework: 'rayon', type: 'concurrency', tier: 'parallel' },
    'crossbeam': { framework: 'crossbeam', type: 'concurrency', tier: 'lockfree' },
    'parking_lot': { framework: 'parking_lot', type: 'concurrency', tier: 'sync' },
    
    // Modern database
    'sqlx': { framework: 'sqlx', type: 'database', tier: 'async' },
    'diesel': { framework: 'diesel', type: 'database', tier: 'orm' },
    'sea-orm': { framework: 'sea-orm', type: 'database', tier: 'modern-orm' }
  },
  edition: '2024' // Latest stable edition (Feb 2025)
};

class RustDetector extends AbstractDetector {
  constructor() {
    super(RUST_PATTERNS);
    this.frameworkEngine = new FrameworkDetectionEngine();
    this.filePatternMatcher = new FilePatternMatcher();
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
    const parser = DependencyParserFactory.create('toml');
    const cargoData = parser.parse(cargoTomlPath);
    
    if (cargoData) {
      const allDependencies = { ...cargoData.dependencies, ...cargoData.devDependencies };
      
      // Convert RUST_PATTERNS.dependencies to framework detection patterns
      const frameworkPatterns = {};
      Object.entries(RUST_PATTERNS.dependencies).forEach(([dep, config]) => {
        frameworkPatterns[dep] = {
          framework: config.framework,
          primary: config.tier === 'modern' || config.tier === 'standard'
        };
      });
      
      // Use shared framework detection engine
      const frameworkResult = this.frameworkEngine.detectFrameworks(
        allDependencies,
        frameworkPatterns
      );
      
      // Merge results
      result.frameworks.push(...frameworkResult.frameworks);
      if (frameworkResult.primary && result.primary === 'generic') {
        result.primary = frameworkResult.primary;
      }
    }
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